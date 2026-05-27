'use server';

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SignJWT } from "jose";

export async function createSchool(formData: FormData) {
  let schoolSlug = "";
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Must be logged in to create a school.");
    }

    const name = formData.get("name") as string;
    const bannerUrl = formData.get("banner_url") as string;

    if (!name) {
      throw new Error("School name is required.");
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const adminClient = await createAdminClient();

    // Sync user to public.users to satisfy foreign key
    const { data: existingUser } = await adminClient.from("users").select("id").eq("id", user.id).maybeSingle();
    if (!existingUser) {
      const { error: insertUserError } = await adminClient.from("users").insert({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
        email: user.email,
        password_hash: '',
      });
      if (insertUserError) {
        throw new Error("Failed to insert user: " + insertUserError.message);
      }
    }

    // Insert school
    let { data: school, error: schoolError } = await adminClient
      .from("schools")
      .insert({ name, slug, banner_url: bannerUrl })
      .select()
      .maybeSingle();

    if (schoolError) {
      if (schoolError.code === '23505') {
        // Slug collision - just append some random chars instead of erroring out entirely
        const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        const retryResult = await adminClient
          .from("schools")
          .insert({ name, slug: uniqueSlug, banner_url: bannerUrl })
          .select()
          .maybeSingle();
        
        school = retryResult.data;
        schoolError = retryResult.error;
      }
    }

    if (schoolError || !school) {
      throw new Error(schoolError?.message || "Failed to create school.");
    }

    // Insert admin
    const { error: adminError } = await adminClient
      .from("school_admins")
      .insert({ school_id: school.id, user_id: user.id });

    if (adminError) {
      throw new Error("Failed to create admin: " + adminError.message);
    }

    // Insert school subscription
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    const { error: subError } = await adminClient
      .from("school_subscriptions")
      .insert({
        school_id: school.id,
        plan: 'growth',
        status: 'trial',
        trial_end_date: trialEnd.toISOString(),
        current_period_end: trialEnd.toISOString()
      });

    if (subError) {
      console.warn("Failed to create school subscription:", subError);
      // Not failing the whole flow, but we can log it.
    }

    schoolSlug = school.slug;
  } catch (err: any) {
    console.error("createSchool Error:", err);
    return { error: err.message };
  }

  revalidatePath("/");
  return { slug: schoolSlug };
}

export async function toggleSchoolLock(schoolId: string, currentStatus: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.email !== process.env.SUPERADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const adminClient = await createAdminClient();
  let newStatus = currentStatus === 'locked' ? 'active' : 'locked';
  
  const updateData: any = { status: newStatus };
  if (newStatus === 'active') {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    updateData.current_period_end = nextMonth.toISOString();
  }

  const { data: existing } = await adminClient
    .from("school_subscriptions")
    .select("id")
    .eq("school_id", schoolId)
    .maybeSingle();

  let subError;
  let updatedSub;

  if (existing) {
    const { data: ud, error: ue } = await adminClient
      .from("school_subscriptions")
      .update(updateData)
      .eq("school_id", schoolId)
      .select()
      .single();
    subError = ue;
    updatedSub = ud;
  } else {
    updateData.school_id = schoolId;
    updateData.plan = 'starter';
    const { data: id, error: ie } = await adminClient
      .from("school_subscriptions")
      .insert(updateData)
      .select()
      .single();
    subError = ie;
    updatedSub = id;
  }

  if (subError) throw new Error(subError.message);

  await adminClient.from("school_access_log").insert({
    school_id: schoolId,
    action: newStatus === 'locked' ? 'admin_locked' : 'admin_unlocked',
    performed_by: user.id
  });

  revalidatePath("/superadmin");
  return { subscription: updatedSub };
}

export async function checkAndGetSubscription(schoolId: string) {
  const adminClient = await createAdminClient();

  // Get current subscription
  const { data: sub } = await adminClient
    .from("school_subscriptions")
    .select("*")
    .eq("school_id", schoolId)
    .maybeSingle();

  if (!sub) return null;

  // Let's implement the auto-update rules
  // If status is active/trial, but current_period_end is passed
  const now = new Date();
  const periodEnd = new Date(sub.current_period_end);

  let newStatus = sub.status;

  if ((sub.status === 'active' || sub.status === 'trial') && periodEnd < now) {
    const diffDays = (now.getTime() - periodEnd.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 7) {
      newStatus = 'locked';
    } else {
      newStatus = 'past_due';
    }
  } else if (sub.status === 'past_due' && periodEnd < now) {
    const diffDays = (now.getTime() - periodEnd.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 7) {
      newStatus = 'locked';
    }
  }

  // Update if needed
  if (newStatus !== sub.status || (sub.status === 'trial' && newStatus === 'trial')) {
     if (newStatus !== sub.status) {
       await adminClient
         .from("school_subscriptions")
         .update({ status: newStatus })
         .eq("id", sub.id);
       sub.status = newStatus;
     }
  }

  return sub;
}

export async function createClass(schoolId: string, slug: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const adminClient = await createAdminClient();
  
  // Verify admin access
  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user.id)
    .maybeSingle();
    
  if (!adminCheck) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const teacherPassword = formData.get("teacher_password") as string;
  const studentPassword = formData.get("student_password") as string;

  if (!name || !teacherPassword || !studentPassword) {
    throw new Error("All fields are required.");
  }

  const { error: classError } = await adminClient
    .from("organizations")
    .insert({
      name,
      slug: `${slug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, // Just a basic slug
      school_id: schoolId,
      teacher_password: teacherPassword,
      student_password: studentPassword,
    });

  if (classError) {
    if (classError.code === '23505') {
      throw new Error("A class with this name already exists.");
    }
    throw new Error(classError.message);
  }

  revalidatePath(`/admin/${slug}`);
}

export async function addTeacher(schoolId: string, slug: string, classId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const adminClient = await createAdminClient();

  // Verify admin access
  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user.id)
    .maybeSingle();
    
  if (!adminCheck) throw new Error("Unauthorized");

  const emailStr = formData.get("email") as string;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailStr || !emailRegex.test(emailStr)) {
    throw new Error("Invalid email format.");
  }
  const email = emailStr;
  const subjectsStr = formData.get("subjects") as string;
  const subjects = subjectsStr ? subjectsStr.split(",").map(s => s.trim()) : [];

  if (!email || !classId) {
    throw new Error("Email and Class are required.");
  }

  // Find user by email
  const { data: teacherUser } = await adminClient
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!teacherUser) {
    throw new Error("User with that email not found. They must sign in first.");
  }

  const { error: memberError } = await adminClient
    .from("organization_members")
    .insert({ organization_id: classId, user_id: teacherUser.id, role: "teacher" });

  if (memberError && memberError.code !== '23505') { // ignore duplicate
    throw new Error(memberError.message);
  }

  const { error: assignError } = await adminClient
    .from("teacher_assignments")
    .insert({ teacher_user_id: teacherUser.id, org_id: classId, subjects });

  if (assignError) {
    throw new Error(assignError.message);
  }

  revalidatePath(`/admin/${slug}`);
}

export async function joinClass(classId: string, role: 'teacher' | 'student', passwordAttempt: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: 'Not_Logged_In' };
  }

  const adminClient = await createAdminClient();

  // Sync user to public.users to satisfy foreign key
  const { data: existingUser } = await adminClient.from("users").select("id").eq("id", user.id).maybeSingle();
  if (!existingUser) {
    await adminClient.from("users").insert({
      id: user.id,
      name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Unknown User',
      email: user.email,
      password_hash: '',
    });
  }

  const { data: org } = await adminClient
    .from("organizations")
    .select("id, school_id, teacher_password, student_password")
    .eq("id", classId)
    .maybeSingle();

  if (!org) {
    return { error: "Class not found." };
  }

  const sub = await checkAndGetSubscription(org.school_id);
  if (sub?.status === 'locked') {
    return { error: 'Service_Suspended' };
  }

  const isValid = 
    (role === 'teacher' && org.teacher_password === passwordAttempt) ||
    (role === 'student' && org.student_password === passwordAttempt);

  if (!isValid) {
    return { error: "Invalid password." };
  }

  // Check student limit if joining as student
  if (role === 'student') {
    const { data: memberRecordCheck } = await adminClient
      .from("organization_members")
      .select("id")
      .eq("organization_id", classId)
      .eq("user_id", user.id)
      .maybeSingle();
      
    // Only check limit if they are not already a member
    if (!memberRecordCheck) {
      const limitCheck = await checkStudentLimit(org.school_id);
      if (!limitCheck.allowed) {
        return { error: limitCheck.error };
      }
    }
  }

  // Ensure member exists
  const { error: memberInsertError } = await adminClient
    .from("organization_members")
    .insert({ organization_id: classId, user_id: user.id, role });

  // ignore duplicate error
  if (memberInsertError && memberInsertError.code !== '23505') {
    return { error: "Could not add as member." };
  }

  // Look up actual role
  const { data: memberRecord } = await adminClient
    .from("organization_members")
    .select("role")
    .eq("organization_id", classId)
    .eq("user_id", user.id)
    .maybeSingle();

  const actualRole = memberRecord?.role || role;

  // generate JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET is not configured on server");

  const token = await new SignJWT({ user_id: user.id, org_id: classId, role: actualRole })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(jwtSecret));

  const readoraUrl = process.env.NEXT_PUBLIC_READORA_URL || "https://redora.alphanexoraai.com";
  
  return { successUrl: `${readoraUrl}/auth/token-exchange?token=${token}&role=${actualRole}&org_id=${classId}` };
}

export async function updateSchoolPlan(schoolId: string, newPlan: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.email !== process.env.SUPERADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const adminClient = await createAdminClient();
  const { data: existing } = await adminClient
    .from("school_subscriptions")
    .select("id")
    .eq("school_id", schoolId)
    .maybeSingle();

  let subError;
  let updatedSub;

  if (existing) {
    const { data: ud, error: ue } = await adminClient
      .from("school_subscriptions")
      .update({ plan: newPlan })
      .eq("school_id", schoolId)
      .select()
      .single();
    subError = ue;
    updatedSub = ud;
  } else {
    const { data: id, error: ie } = await adminClient
      .from("school_subscriptions")
      .insert({ school_id: schoolId, plan: newPlan, status: 'active' })
      .select()
      .single();
    subError = ie;
    updatedSub = id;
  }

  if (subError) throw new Error(subError.message);

  await adminClient.from("school_access_log").insert({
    school_id: schoolId,
    action: `plan_changed_to_${newPlan}`,
    performed_by: user.id
  });

  revalidatePath("/superadmin");
  return { subscription: updatedSub };
}

export async function updateSchoolStatus(schoolId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.email !== process.env.SUPERADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const adminClient = await createAdminClient();
  const { data: existing } = await adminClient
    .from("school_subscriptions")
    .select("id")
    .eq("school_id", schoolId)
    .maybeSingle();

  let subError;
  let updatedSub;

  if (existing) {
    const { data: ud, error: ue } = await adminClient
      .from("school_subscriptions")
      .update({ status: newStatus })
      .eq("school_id", schoolId)
      .select()
      .single();
    subError = ue;
    updatedSub = ud;
  } else {
    const { data: id, error: ie } = await adminClient
      .from("school_subscriptions")
      .insert({ school_id: schoolId, plan: 'starter', status: newStatus })
      .select()
      .single();
    subError = ie;
    updatedSub = id;
  }

  if (subError) throw new Error(subError.message);

  await adminClient.from("school_access_log").insert({
    school_id: schoolId,
    action: `status_changed_to_${newStatus}`,
    performed_by: user.id
  });

  revalidatePath("/superadmin");
  return { subscription: updatedSub };
}

export async function extendTrial(schoolId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.email !== process.env.SUPERADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const adminClient = await createAdminClient();
  const { data: sub } = await adminClient
    .from("school_subscriptions")
    .select("id, trial_end_date, current_period_end")
    .eq("school_id", schoolId)
    .maybeSingle();

  const newDate = new Date(sub?.trial_end_date || sub?.current_period_end || new Date());
  newDate.setDate(newDate.getDate() + 7);

  let subError;
  let updatedSub;

  if (sub) {
    const { data: ud, error: ue } = await adminClient
      .from("school_subscriptions")
      .update({ 
        trial_end_date: newDate.toISOString(),
        current_period_end: newDate.toISOString(),
        status: 'trial'
      })
      .eq("school_id", schoolId)
      .select()
      .single();
    subError = ue;
    updatedSub = ud;
  } else {
    const { data: id, error: ie } = await adminClient
      .from("school_subscriptions")
      .insert({ 
        school_id: schoolId, 
        plan: 'starter',
        status: 'trial',
        trial_end_date: newDate.toISOString(),
        current_period_end: newDate.toISOString()
      })
      .select()
      .single();
    subError = ie;
    updatedSub = id;
  }

  if (subError) throw new Error(subError.message);

  await adminClient.from("school_access_log").insert({
    school_id: schoolId,
    action: "trial_extended_7_days",
    performed_by: user.id
  });

  revalidatePath("/superadmin");
  return { subscription: updatedSub };
}

export async function resetMonthlyUsage(schoolId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.email !== process.env.SUPERADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const adminClient = await createAdminClient();
  const { error: usageError } = await adminClient
    .from("school_usage")
    .upsert({ 
      school_id: schoolId,
      videos_generated_this_month: 0,
      image_searches_this_month: 0,
      interactive_lessons_this_month: 0,
      billing_period_start: new Date().toISOString()
    });

  if (usageError) throw new Error(usageError.message);

  await adminClient.from("school_access_log").insert({
    school_id: schoolId,
    action: "usage_reset",
    performed_by: user.id
  });

  revalidatePath("/superadmin");
}

export async function checkStudentLimit(schoolId: string, countToAdd: number = 1) {
  const adminClient = await createAdminClient();
  const { data: sub } = await adminClient
    .from("school_subscriptions")
    .select("plan")
    .eq("school_id", schoolId)
    .single();

  if (!sub) return { allowed: true };

  const limits: Record<string, number> = {
    essentials: Infinity,
    starter: Infinity,
    growth: Infinity,
    enterprise: Infinity
  };
  const limit = limits[sub.plan?.toLowerCase() || 'starter'] || Infinity;

  if (limit === Infinity) return { allowed: true };

  // Get current student count
  // First get all class IDs for this school
  const { data: classes } = await adminClient
    .from("organizations")
    .select("id")
    .eq("school_id", schoolId);
    
  if (!classes || classes.length === 0) return { allowed: true };
  const classIds = classes.map(c => c.id);

  const { count } = await adminClient
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .in("organization_id", classIds)
    .eq("role", "student");

  const currentCount = count || 0;

  if (currentCount + countToAdd > limit) {
    return { 
      allowed: false, 
      error: `Your plan allows ${limit} students. Upgrade to add more.` 
    };
  }

  return { allowed: true };
}

export async function updateSchoolSettings(schoolId: string, slug: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const adminClient = await createAdminClient();

  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user.id)
    .maybeSingle();
    
  if (!adminCheck) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const bannerUrl = formData.get("banner_url") as string;

  if (!name) throw new Error("School name is required.");

  const { error: updateError } = await adminClient
    .from("schools")
    .update({ name, banner_url: bannerUrl })
    .eq("id", schoolId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/admin/${slug}`);
  revalidatePath(`/school/${slug}`);
  return { success: true };
}

export async function deleteClass(schoolId: string, slug: string, classId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const adminClient = await createAdminClient();

  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user.id)
    .maybeSingle();
    
  if (!adminCheck) throw new Error("Unauthorized");

  // Delete organizations (cascades or we need to handle members? Let's assume cascade or explicitly delete members first)
  await adminClient.from("organization_members").delete().eq("organization_id", classId);
  await adminClient.from("teacher_assignments").delete().eq("org_id", classId);
  
  const { error: deleteError } = await adminClient
    .from("organizations")
    .delete()
    .eq("id", classId)
    .eq("school_id", schoolId);

  if (deleteError) throw new Error(deleteError.message);

  revalidatePath(`/admin/${slug}`);
  revalidatePath(`/school/${slug}`);
}

export async function removeTeacher(schoolId: string, slug: string, assignmentId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const adminClient = await createAdminClient();

  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user.id)
    .maybeSingle();
    
  if (!adminCheck) throw new Error("Unauthorized");

  // We need the org_id and user_id to also remove from organization_members
  const { data: assignment } = await adminClient
    .from("teacher_assignments")
    .select("org_id, teacher_user_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignment) {
     await adminClient.from("organization_members").delete()
       .eq("organization_id", assignment.org_id)
       .eq("user_id", assignment.teacher_user_id);
  }

  const { error: deleteError } = await adminClient
    .from("teacher_assignments")
    .delete()
    .eq("id", assignmentId);

  if (deleteError) throw new Error(deleteError.message);

  revalidatePath(`/admin/${slug}`);
}
