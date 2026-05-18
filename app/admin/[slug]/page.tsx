import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClassModal } from "./class-modal";
import { TeacherModal } from "./teacher-modal";
import { DeleteClassButton } from "./delete-class-button";
import { RemoveTeacherButton } from "./remove-teacher-button";
import Link from "next/link";

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
    return <div className="text-center mt-20 text-red-500 font-bold">Unauthorized.</div>;
  }

  // Load classes
  const { data: classes } = await adminClient
    .from("organizations")
    .select("*")
    .eq("school_id", school.id);

  // Load teachers (this takes a bit of joining, but since we're using simple supabase we might do 2 queries)
  const orgIds = classes?.map(c => c.id) || [];
  
  let teachers: any[] = [];
  if (orgIds.length > 0) {
    const { data: teacherAssignments } = await adminClient
      .from("teacher_assignments")
      .select("*, users:teacher_user_id (name, email), organizations:org_id (name)")
      .in("org_id", orgIds);
      
    teachers = teacherAssignments || [];
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-medium text-slate-500">Schools Gateway / Admin Dashboard</div>
        <div className="flex gap-3">
           <Button variant="outline" asChild>
             <Link href={`/admin/${slug}/settings`}>Settings</Link>
           </Button>
           <Button variant="secondary" asChild>
             <a href={`/school/${slug}`} target="_blank" rel="noreferrer">Preview Public Portal</a>
           </Button>
           <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
             AD
           </div>
        </div>
      </div>

      <div className="h-[160px] bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[24px] w-full p-8 flex flex-col justify-end text-white mb-8 relative shadow-[0_10px_25px_-5px_rgba(99,102,241,0.3)]">
        <h1 className="text-[28px] font-bold m-0 tracking-tight">{school.name}</h1>
        <div className="font-mono text-[14px] opacity-80 mt-1">slug: {school.slug}</div>
      </div>

      <div className="grid md:grid-cols-[1.8fr_1fr] gap-6 flex-1 items-start">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Active Classes</CardTitle>
            </div>
            <ClassModal schoolId={school.id} slug={slug} />
          </CardHeader>
          <CardContent>
            {(!classes || classes.length === 0) ? (
              <p className="text-sm text-slate-500">No classes created yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 pb-2">
                {classes.map(c => (
                  <div key={c.id} className="border border-slate-100 rounded-2xl p-4 bg-[#FAFBFC] relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DeleteClassButton schoolId={school.id} slug={slug} classId={c.id} />
                    </div>
                    <div className="font-semibold text-[15px] mb-2 text-slate-700 pr-8">{c.name}</div>
                    <div className="bg-white border border-slate-200 py-1.5 px-2.5 rounded-md font-mono text-[11px] text-slate-500 flex justify-between mt-1.5">
                      <span>Student:</span> <span>{c.student_password}</span>
                    </div>
                    <div className="bg-white border border-slate-200 py-1.5 px-2.5 rounded-md font-mono text-[11px] text-slate-500 flex justify-between mt-1.5">
                      <span>Teacher:</span> <span>{c.teacher_password}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Staff Directory</CardTitle>
            </div>
            <TeacherModal schoolId={school.id} slug={slug} classes={classes || []} />
          </CardHeader>
          <CardContent>
             {teachers.length === 0 ? (
              <p className="text-sm text-slate-500">No teachers added yet.</p>
            ) : (
              <div className="flex flex-col">
                {teachers.map((t, idx) => {
                  const initial = (t.users?.name || t.users?.email || 'U')[0].toUpperCase();
                  const colors = [
                     { bg: 'bg-emerald-100', text: 'text-emerald-800' },
                     { bg: 'bg-amber-100', text: 'text-amber-800' },
                     { bg: 'bg-blue-100', text: 'text-blue-800' },
                     { bg: 'bg-rose-100', text: 'text-rose-800' },
                  ];
                  const c = colors[idx % colors.length];
                  
                  return (
                    <div key={t.id} className="flex items-center py-3 border-b border-slate-100 last:border-0">
                      <div className={`w-9 h-9 rounded-full ${c.bg} ${c.text} mr-3 flex items-center justify-center text-xs font-bold`}>
                        {initial}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold text-slate-800">{t.users?.name || 'Unknown'}</div>
                        <div className="text-[12px] text-slate-500">{t.users?.email}</div>
                      </div>
                      {t.subjects && t.subjects.length > 0 && (
                        <div className="text-[10px] py-[2px] px-2 rounded-xl bg-slate-100 text-slate-500 ml-1">
                          {t.subjects[0]}
                        </div>
                      )}
                      <div className="ml-3">
                        <RemoveTeacherButton schoolId={school.id} slug={slug} assignmentId={t.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
