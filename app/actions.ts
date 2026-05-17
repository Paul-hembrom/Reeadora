'use server';

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SignJWT } from "jose";

export async function createSchool(formData: FormData) {
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

  // Insert school
  const { data: school, error: schoolError } = await adminClient
    .from("schools")
    .insert({ name, slug, banner_url: bannerUrl })
    .select()
    .single();

  if (schoolError || !school) {
    throw new Error(schoolError?.message || "Failed to create school.");
  }

  // Insert admin
  const { error: adminError } = await adminClient
    .from("school_admins")
    .insert({ school_id: school.id, user_id: user.id });

  if (adminError) {
    throw new Error(adminError.message);
  }

  revalidatePath("/");
  redirect(`/admin/${slug}`);
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
    .single();
    
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

  if (classError) throw new Error(classError.message);

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
    .single();
    
  if (!adminCheck) throw new Error("Unauthorized");

  const email = formData.get("email") as string;
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
    .single();

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

  const { data: org } = await adminClient
    .from("organizations")
    .select("id, teacher_password, student_password")
    .eq("id", classId)
    .single();

  if (!org) {
    return { error: "Class not found." };
  }

  const isValid = 
    (role === 'teacher' && org.teacher_password === passwordAttempt) ||
    (role === 'student' && org.student_password === passwordAttempt);

  if (!isValid) {
    return { error: "Invalid password." };
  }

  // Ensure member exists
  const { error: memberInsertError } = await adminClient
    .from("organization_members")
    .insert({ organization_id: classId, user_id: user.id, role });

  // ignore duplicate error
  if (memberInsertError && memberInsertError.code !== '23505') {
    return { error: "Could not add as member." };
  }

  // generate JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET is not configured on server");

  const token = await new SignJWT({ user_id: user.id, org_id: classId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(jwtSecret));

  const readoraUrl = process.env.NEXT_PUBLIC_READORA_URL || "https://redora.alphanexoraai.com";
  
  return { successUrl: `${readoraUrl}/auth/token-exchange?token=${token}` };
}
