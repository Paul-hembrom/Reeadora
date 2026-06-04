import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClassModal } from "./class-modal";
import { TeacherModal } from "./teacher-modal";
import { DeleteClassButton } from "./delete-class-button";
import { RemoveTeacherButton } from "./remove-teacher-button";
import { PendingInvitationActions } from "./pending-invitation-actions";
import Link from "next/link";
import { checkAndGetSubscription } from "@/app/actions";
import { BookOpen, Users, Key, AlertTriangle, ShieldCheck, Mail, LogOut, Settings } from "lucide-react";

export default async function AdminDashboard({ params }: { params: Promise<{ slug: string }> }) {
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

  // Check admin
  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", school.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminCheck) {
    return (
      <div className="flex items-center justify-center p-8 mt-20 max-w-md mx-auto">
        <Card className="w-full border-red-200/50 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 shadow-sm backdrop-blur-xl">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
               <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">You do not have permission to view the admin dashboard for this school.</p>
            </div>
            <Button render={<Link href="/join">Return to Workspaces</Link>} variant="outline" className="w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscription = await checkAndGetSubscription(school.id);
  const subStatus = subscription?.status || 'active';
  const planName = (subscription?.plan || 'Starter').charAt(0).toUpperCase() + (subscription?.plan || 'Starter').slice(1);
  const isLockedOrPastDue = subStatus === 'locked' || subStatus === 'past_due';
  const whatsappUrl = `https://wa.me/+9779767697274?text=${encodeURIComponent(`Hi, I am ${user.email} from ${school.name}. I want to renew/upgrade our Readora subscription.`)}`;
  
  let trialDaysLeft = 0;
  if (subStatus === 'trial' && subscription?.trial_end_date) {
    trialDaysLeft = Math.ceil((new Date(subscription.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  // Load classes
  const { data: classes } = await adminClient
    .from("organizations")
    .select("*")
    .eq("school_id", school.id);

  // Load teachers
  const orgIds = classes?.map(c => c.id) || [];
  
  let teachers: any[] = [];
  let pendingInvitations: any[] = [];
  if (orgIds.length > 0) {
    const { data: teacherAssignments } = await adminClient
      .from("teacher_assignments")
      .select("*, users:teacher_user_id (name, email), organizations:org_id (name)")
      .in("org_id", orgIds);
      
    teachers = teacherAssignments || [];
    
    const { data: invitations } = await adminClient
      .from("teacher_invitations")
      .select("*, organizations:org_id (name)")
      .in("org_id", orgIds)
      .eq("status", "pending");
      
    pendingInvitations = invitations || [];
  }

  // Calculate unique teachers manually
  const uniqueTeacherCount = new Set(teachers.map(t => t.teacher_user_id)).size + new Set(pendingInvitations.map(inv => inv.email)).size;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="space-y-1 block">
          <Badge variant="outline" className="text-xs font-mono font-medium tracking-wide rounded-md mb-2 bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0 shadow-none">
            WORKSPACE
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             {school.name}
             {subscription?.status === 'active' && <ShieldCheck className="w-6 h-6 text-green-500" />}
          </h1>
          <p className="text-sm font-mono text-slate-500 dark:text-slate-400">/{school.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <Button variant="outline" render={<Link href={`/admin/${slug}/settings`}><Settings className="w-4 h-4 mr-2" />Settings</Link>} className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800" />
           <Button variant="secondary" render={<a href={`/school/${slug}`} target="_blank" rel="noreferrer" className={isLockedOrPastDue ? 'pointer-events-none opacity-50' : ''}>Preview Gateway</a>} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" />
        </div>
      </div>

      {subStatus === 'trial' && (
        <div className="bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-400 px-5 py-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm backdrop-blur-sm">
           <div className="flex items-center gap-3">
             <div className="bg-blue-200/50 dark:bg-blue-500/20 p-2 rounded-full">
                <ShieldCheck className="w-5 h-5" />
             </div>
             <div>
               <p className="font-semibold text-sm">You are on an {planName} trial</p>
               <p className="text-sm opacity-90">{trialDaysLeft > 0 ? `${trialDaysLeft} days remaining.` : 'Trial expired.'} Upgrade to Starter for advanced features like AI videos.</p>
             </div>
           </div>
           <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 border-0 w-full sm:w-auto shadow-md transition-transform active:scale-[0.98]" render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Upgrade Now</a>} />
        </div>
      )}

      {subStatus === 'active' && (
        <div className="bg-green-100/80 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-800 dark:text-green-400 px-5 py-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm backdrop-blur-sm">
           <div className="flex items-center gap-3">
             <div className="bg-green-200/50 dark:bg-green-500/20 p-2 rounded-full">
                <ShieldCheck className="w-5 h-5" />
             </div>
             <div>
               <p className="font-semibold text-sm">{planName} Plan – Active</p>
               <p className="text-sm opacity-90">Next billing: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}.</p>
               {subscription?.plan === 'essentials' && (
                 <p className="text-sm font-medium mt-1 text-green-700 dark:text-green-400">
                   Upgrade to Starter for video lessons & interactive teaching.
                 </p>
               )}
             </div>
           </div>
           {subscription?.plan === 'essentials' && (
             <Button size="sm" className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 border-0 w-full sm:w-auto shadow-md transition-transform active:scale-[0.98]" render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Upgrade Now</a>} />
           )}
        </div>
      )}

      {subStatus === 'past_due' && (
        <div className="bg-amber-100/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 px-5 py-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-200/50 dark:bg-amber-500/20 p-2 rounded-full">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Subscription Overdue</p>
              <p className="text-sm opacity-90">Your subscription is past due. Renew now to restore full access.</p>
            </div>
          </div>
          <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 border-0 w-full sm:w-auto shadow-md transition-transform active:scale-[0.98]" render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Renew Now</a>} />
        </div>
      )}

      {subStatus === 'locked' && (
        <div className="bg-red-100/80 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400 px-5 py-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-red-200/50 dark:bg-red-500/20 p-2 rounded-full">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Account Suspended</p>
              <p className="text-sm opacity-90">Your account has been suspended. Please contact support.</p>
            </div>
          </div>
          <Button size="sm" className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 border-0 w-full sm:w-auto shadow-md transition-transform active:scale-[0.98]" render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Contact Support</a>} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
          <CardContent className="p-5 flex flex-col gap-1">
             <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <BookOpen className="w-4 h-4" />
             </div>
             <p className="text-2xl font-bold text-slate-800 dark:text-white">{classes?.length || 0}</p>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Classes</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
          <CardContent className="p-5 flex flex-col gap-1">
             <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
             </div>
             <p className="text-2xl font-bold text-slate-800 dark:text-white">{uniqueTeacherCount}</p>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teachers</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm col-span-2 md:col-span-2">
          <CardContent className="p-5 flex items-center justify-between h-full">
             <div className="flex flex-col gap-1">
               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subscription</p>
               <div className="flex items-center gap-2">
                 <span className="text-xl font-bold capitalize text-slate-800 dark:text-white">{subscription?.plan || 'Growth'} Plan</span>
                 {subscription?.status === 'active' && <Badge className="bg-green-100 hover:bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-0">Active</Badge>}
                 {subscription?.status === 'trial' && <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-0">Trial</Badge>}
               </div>
               <p className="text-xs text-slate-500 font-medium">Ends {new Date(subscription?.current_period_end || '').toLocaleDateString()}</p>
             </div>
             <div className="hidden sm:flex h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
               <ShieldCheck className="w-5 h-5" />
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Classes</h2>
            {!isLockedOrPastDue && <ClassModal schoolId={school.id} slug={slug} />}
          </div>
          
          {(!classes || classes.length === 0) ? (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent shadow-none">
               <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                     <BookOpen className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">No classes created yet</p>
                  <p className="text-sm mt-1 mb-4">Create your first class to get started.</p>
                  {!isLockedOrPastDue && <ClassModal schoolId={school.id} slug={slug} variant="outline" />}
               </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {classes.map(c => (
                <Card key={c.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-semibold text-[16px] text-slate-800 dark:text-slate-100 tracking-tight pr-6">{c.name}</div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                        {!isLockedOrPastDue && <DeleteClassButton schoolId={school.id} slug={slug} classId={c.id} />}
                      </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50">
                         <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                           <Key className="w-3 h-3" /> Student
                         </div>
                         <code className="text-xs font-mono bg-white dark:bg-black px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">{c.student_password}</code>
                       </div>
                       <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50">
                         <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                           <Key className="w-3 h-3 text-indigo-500/70" /> Teacher
                         </div>
                         <code className="text-xs font-mono bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400">{c.teacher_password}</code>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Staff Directory</h2>
              {!isLockedOrPastDue && <TeacherModal schoolId={school.id} slug={slug} classes={classes || []} />}
           </div>
           <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
             <CardContent className="p-0">
               {(teachers.length === 0 && pendingInvitations.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-sm border-dashed border-2 border-slate-200 dark:border-slate-800 m-4 rounded-xl">
                  No teachers assigned.
                </div>
               ) : (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                  {teachers.map((t, idx) => {
                    const initial = (t.users?.name || t.users?.email || 'U')[0].toUpperCase();
                    const colors = [
                       { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' },
                       { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400' },
                       { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
                       { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400' },
                    ];
                    const c = colors[idx % colors.length];
                    
                    return (
                      <div key={t.id} className="flex items-center py-4 px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <div className={`w-10 h-10 rounded-full ${c.bg} ${c.text} mr-4 flex items-center justify-center text-sm font-bold shadow-sm`}>
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 truncate">{t.users?.name || 'Unknown'}</div>
                          <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                             <Mail className="w-3 h-3" /> {t.users?.email}
                          </div>
                          {t.organizations?.name && (
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {t.organizations.name}
                              </Badge>
                            </div>
                          )}
                        </div>
                        {!isLockedOrPastDue && (
                          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <RemoveTeacherButton schoolId={school.id} slug={slug} assignmentId={t.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {pendingInvitations.map((inv, idx) => {
                    const initial = (inv.email || 'U')[0].toUpperCase();
                    return (
                      <div key={inv.id} className="flex items-center py-4 px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mr-4 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-200 border-dashed dark:border-slate-700`}>
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 truncate italic">Pending Invite</div>
                          <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                             <Mail className="w-3 h-3" /> {inv.email}
                          </div>
                          {inv.organizations?.name && (
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {inv.organizations.name}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-medium text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
                                Pending
                              </Badge>
                            </div>
                          )}
                        </div>
                        {!isLockedOrPastDue && (
                          <div className="ml-3 transition-opacity">
                            <PendingInvitationActions schoolId={school.id} slug={slug} invitationId={inv.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
               )}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
