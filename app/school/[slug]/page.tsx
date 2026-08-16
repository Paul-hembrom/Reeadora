import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClassGate } from "./class-gate";
import { ParallaxBanner } from "./parallax-banner";
import { checkAndGetSubscription } from "@/app/actions";
import { CopyX } from "lucide-react";

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adminClient = await createAdminClient();

  const { data: school } = await adminClient
    .from("schools")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!school) {
    notFound();
  }

  const sub = await checkAndGetSubscription(school.id);
  const isLocked = sub?.status === 'locked';

  const { data: classes } = await adminClient
    .from("organizations")
    .select("id, name")
    .eq("school_id", school.id);

  const hasInteractiveLessons = sub?.plan === 'growth' || sub?.plan === 'enterprise';

  // Check if current signed-in user is an admin or teacher with access to School Content
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let canAccessSchoolContent = false;
  if (user) {
    const { data: adminCheck } = await adminClient
      .from("school_admins")
      .select("id")
      .eq("school_id", school.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminCheck) {
      canAccessSchoolContent = true;
    } else if (classes && classes.length > 0) {
      const orgIds = classes.map(c => c.id);

      const { data: memberChecks } = await adminClient
        .from("organization_members")
        .select("id, role")
        .eq("user_id", user.id)
        .in("organization_id", orgIds);

      const isTeacherOrAdminMember = memberChecks?.some(m => m.role === "teacher" || m.role === "admin");

      const { data: teacherAssignments } = await adminClient
        .from("teacher_assignments")
        .select("id")
        .eq("teacher_user_id", user.id)
        .in("org_id", orgIds);

      let hasPendingInvite = false;
      if (user.email) {
        const { data: inviteChecks } = await adminClient
          .from("teacher_invitations")
          .select("id")
          .eq("email", user.email)
          .in("org_id", orgIds)
          .eq("status", "pending");
        if (inviteChecks && inviteChecks.length > 0) {
          hasPendingInvite = true;
        }
      }

      if (isTeacherOrAdminMember || (teacherAssignments && teacherAssignments.length > 0) || hasPendingInvite) {
        canAccessSchoolContent = true;
      }
    }
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center w-full">
        <ParallaxBanner bannerUrl={school.banner_url} name={school.name} />
      </div>

      {isLocked ? (
        <div className="text-center mt-12 bg-red-50/80 dark:bg-red-500/10 border border-red-200/80 dark:border-red-500/20 text-red-800 dark:text-red-400 p-8 rounded-3xl w-full max-w-2xl mx-auto backdrop-blur-md shadow-sm">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CopyX className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Service Suspended</h2>
          <p className="text-red-700/80 dark:text-red-400/80">This school&apos;s workspace is currently suspended. Please contact the administration.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Workspace Features Card */}
          {(canAccessSchoolContent || hasInteractiveLessons) && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
               <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mb-4">Workspace Features</h2>
               <div className="flex flex-wrap gap-4">
                  {canAccessSchoolContent && (
                    <Link href={`/admin/${slug}/school-content`} className="flex flex-col p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-[240px]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">School Content</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse and access curriculum learning materials.</p>
                    </Link>
                  )}
                  
                  {hasInteractiveLessons && (
                    <div 
                      className="flex flex-col p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-[240px]"
                      title="Launch Interactive Lesson"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/><line x1="19" x2="19" y1="12" y2="12"/></svg>
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Interactive Lessons</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI-guided interactive learning modules.</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div>
               <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Available Classes</h2>
               <p className="text-slate-500 dark:text-slate-400 mt-1">Select your class portal to login</p>
             </div>
          </div>
          {(!classes || classes.length === 0) ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl py-20 text-center">
               <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No classes published yet.</p>
               <p className="text-slate-400 dark:text-slate-500 mt-2 text-sm">Check back later once administration adds them.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {classes.map(c => (
                <ClassGate key={c.id} orgId={c.id} name={c.name} schoolSlug={slug} />
              ))}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
