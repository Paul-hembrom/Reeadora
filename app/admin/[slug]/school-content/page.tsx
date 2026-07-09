import { createClient, createAdminClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ContentBrowser } from "./content-browser"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
            <Button nativeButton={false} render={<Link href="/join">Return to Workspaces</Link>} variant="outline" className="w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Load all curriculum items for the client browser
  const { data: items } = await adminClient
    .from("curriculum_library")
    .select("grade, subject, title");

  const initialItems = items || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="space-y-1 block">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             <BookOpen className="w-8 h-8 text-indigo-500" />
             School Content
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Browse and access the curriculum library for {school.name}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
           <Button nativeButton={false} variant="outline" render={<Link href={`/admin/${slug}`}>Back to Dashboard</Link>} className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800" />
        </div>
      </div>

      <ContentBrowser initialItems={initialItems} />
    </div>
  )
}
