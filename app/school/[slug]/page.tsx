import { createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ClassGate } from "./class-gate";

export const revalidate = 60; // optionally cache for 60s

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adminClient = await createAdminClient();

  const { data: school } = await adminClient
    .from("schools")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!school) {
    notFound();
  }

  const { data: classes } = await adminClient
    .from("organizations")
    .select("id, name")
    .eq("school_id", school.id);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        {school.banner_url ? (
          <div className="w-full h-48 sm:h-64 relative rounded-[24px] overflow-hidden shadow-[0_10px_25px_-5px_rgba(99,102,241,0.3)]">
            <img 
              src={school.banner_url} 
              alt={`${school.name} Banner`}
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{school.name}</h1>
            </div>
          </div>
        ) : (
          <div className="py-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[24px] shadow-[0_10px_25px_-5px_rgba(99,102,241,0.3)] text-white">
             <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{school.name}</h1>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Available Classes</h2>
        {(!classes || classes.length === 0) ? (
          <p className="text-slate-500">No classes have been published for this school yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map(c => (
              <ClassGate key={c.id} orgId={c.id} name={c.name} schoolSlug={slug} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
