import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GoogleLoginButton } from "@/components/auth-button";
import { OnboardSchoolForm } from "./onboard-school-form";
import { Building2, ChevronRight, School } from "lucide-react";
import Link from "next/link";

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: queryError } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md mt-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-xl dark:shadow-black/40 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400">
              <School className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome to Readora Schools</CardTitle>
              <CardDescription className="text-base">Sign in to manage or create a school workspace.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <GoogleLoginButton nextUrl="/join" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const superadminEmail = process.env.SUPERADMIN_EMAIL;
  if (user && user.email && superadminEmail && user.email.toLowerCase() === superadminEmail.toLowerCase()) {
    redirect("/superadmin");
  }

  // Fetch all schools this user is an admin of
  const adminClient = await createAdminClient();
  const { data: existingAdmins } = await adminClient
    .from("school_admins")
    .select("schools(name, slug)")
    .eq("user_id", user.id);

  const existingSchools = existingAdmins?.map(admin => {
    const school = Array.isArray(admin.schools) ? admin.schools[0] : admin.schools;
    return school as { name: string, slug: string };
  }).filter(Boolean) || [];

  return (
    <div className="mx-auto max-w-xl mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center mb-8 space-y-4">
         <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400">
            <Building2 className="h-8 w-8" />
         </div>
         <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Selection</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage an existing school or onboard a new one.</p>
         </div>
      </div>

      {existingSchools.length > 0 && (
        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-lg dark:shadow-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Your Schools</CardTitle>
            <CardDescription>Select a school to manage its gateway.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingSchools.map((school, idx) => (
              <Link
                key={idx}
                href={`/admin/${school.slug}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0f0f0f] hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200 hover:shadow-md"
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                     <School className="w-5 h-5" />
                  </div>
                  {school.name}
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-1 group-hover:text-primary transition-colors mt-3 sm:mt-0 ml-13 sm:ml-0">
                  Manage Workspace <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-lg dark:shadow-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-indigo-500/80"></div>
        <CardHeader>
          <CardTitle className="text-xl">Onboard a New School</CardTitle>
          <CardDescription>Enter the school details below. You will become the primary administrator.</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardSchoolForm queryError={queryError} />
        </CardContent>
      </Card>
    </div>
  );
}
