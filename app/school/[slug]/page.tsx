import { createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ClassGate } from "./class-gate";
import { ParallaxBanner } from "./parallax-banner";

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
        <ParallaxBanner bannerUrl={school.banner_url} name={school.name} />
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
