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
      )}
    </div>
  );
}
