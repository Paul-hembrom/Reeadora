import { createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ClassGate } from "./class-gate";
import { ParallaxBanner } from "./parallax-banner";
import { checkAndGetSubscription } from "@/app/actions";
import { CopyX } from "lucide-react";

export const revalidate = 60; // optionally cache for 60s

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
          <p className="text-red-700/80 dark:text-red-400/80">This school's workspace is currently suspended. Please contact the administration.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Workspace Features Card */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
             <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mb-4">Workspace Features</h2>
             <div className="flex flex-wrap gap-4">
                <div 
                  className={`flex flex-col p-4 rounded-2xl border ${
                    hasInteractiveLessons 
                      ? 'border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/20 opacity-70 cursor-not-allowed'
                  } w-[240px]`}
                  title={!hasInteractiveLessons ? "Available on Growth plan." : "Launch Interactive Lesson"}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    hasInteractiveLessons
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/><line x1="19" x2="19" y1="12" y2="12"/></svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Interactive Lessons</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI-guided interactive learning modules.</p>
                  
                  {!hasInteractiveLessons && (
                    <div className="mt-3 text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 w-fit px-2 py-0.5 rounded">
                      Needs Growth Plan
                    </div>
                  )}
                </div>
             </div>
          </div>

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
