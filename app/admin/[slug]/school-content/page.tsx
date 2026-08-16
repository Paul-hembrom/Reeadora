import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertTriangle, BookOpen } from "lucide-react";
import { SchoolContentClient } from "./school-content-client";

export default async function SchoolContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join");
  }

  const adminClient = await createAdminClient();

  // Load school
  const { data: school } = await adminClient
    .from("schools")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!school) {
    notFound();
  }

  let hasAccess = false;
  let userRole = "student";
  let userOrgId = "";
  let preselectGrade = "";
  let preselectSubject = "";

  // Check admin
  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", school.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminCheck) {
    hasAccess = true;
    userRole = "admin";
  } else {
    // Check if they are a member of any organization in this school
    const { data: orgs } = await adminClient
      .from("organizations")
      .select("id, name")
      .eq("school_id", school.id);
    
    if (orgs && orgs.length > 0) {
      const orgIds = orgs.map(o => o.id);

      // Check organization_members
      const { data: memberChecks } = await adminClient
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .in("organization_id", orgIds);

      // Check teacher_assignments
      const { data: teacherAssignments } = await adminClient
        .from("teacher_assignments")
        .select("org_id")
        .eq("teacher_user_id", user.id)
        .in("org_id", orgIds);

      // Check pending invitations by email
      let inviteOrgId = "";
      if (user.email) {
        const { data: inviteChecks } = await adminClient
          .from("teacher_invitations")
          .select("org_id")
          .eq("email", user.email)
          .in("org_id", orgIds)
          .eq("status", "pending");
        if (inviteChecks && inviteChecks.length > 0) {
          inviteOrgId = inviteChecks[0].org_id;
        }
      }

      if (memberChecks && memberChecks.length > 0) {
        // V2 curriculum is ADMIN/TEACHER only. A student joining a class via the
        // V1 class-gate gets an organization_members row, so membership alone must
        // not grant access here.
        const teacherMember = memberChecks.find(
          (m) => m.role === 'teacher' || m.role === 'admin'
        );
        if (teacherMember) {
          hasAccess = true;
          userRole = teacherMember.role;
          userOrgId = teacherMember.organization_id;
        }
        // No teacher/admin membership -> hasAccess stays false -> access-denied card.
      } else if (teacherAssignments && teacherAssignments.length > 0) {
        hasAccess = true;
        userRole = "teacher";
        userOrgId = teacherAssignments[0].org_id;
      } else if (inviteOrgId) {
        hasAccess = true;
        userRole = "teacher";
        userOrgId = inviteOrgId;
      }
    }
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center p-8 mt-20 max-w-md mx-auto">
        <Card className="w-full border-red-200/50 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
               <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">School Content is for teachers</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pre-loaded curriculum is available to teachers and administrators. To open your class materials, go to your school page and sign in to your class.
              </p>
            </div>
            <Button nativeButton={false} render={<Link href={`/school/${slug}`}>Go to School Page</Link>} variant="outline" className="w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch initial grades
  const { data: gradesData } = await adminClient
    .from("curriculum_library")
    .select("grade")
    .order("grade");

  const grades = Array.from(new Set((gradesData || []).map(d => d.grade as string)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div className="space-y-1 block">
          <Badge variant="outline" className="text-xs font-mono font-medium tracking-wide rounded-md mb-2 bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0 shadow-none">
            {school.name}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             <BookOpen className="w-7 h-7 text-indigo-500" />
             School Content
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage curriculum and learning materials</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <Button nativeButton={false} variant="outline" render={<Link href={userRole === 'admin' ? `/admin/${slug}` : `/school/${slug}`}>{userRole === 'admin' ? 'Back to Dashboard' : 'Back to Portal'}</Link>} className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800" />
        </div>
      </div>

      <SchoolContentClient 
        initialGrades={grades} 
        userRole={userRole} 
        userOrgId={userOrgId} 
        preselectGrade={preselectGrade} 
        preselectSubject={preselectSubject} 
      />
    </div>
  );
}
