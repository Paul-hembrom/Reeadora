import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSchoolSettings } from "@/app/actions";
import Link from "next/link";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join");
  }

  const adminClient = await createAdminClient();

  const { data: school } = await adminClient
    .from("schools")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!school) {
    notFound();
  }

  const { data: adminCheck } = await adminClient
    .from("school_admins")
    .select("id")
    .eq("school_id", school.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminCheck) {
    return <div className="text-center mt-20 text-red-500 font-bold">Unauthorized.</div>;
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto align-top">
      <div className="flex items-center mb-6 justify-between border-b border-slate-200 pb-4">
        <div>
           <Link href={`/admin/${slug}`} className="text-sm font-medium text-indigo-600 hover:underline mb-2 inline-block">
             &larr; Back to Dashboard
           </Link>
           <h1 className="text-2xl font-bold tracking-tight text-slate-800">School Settings</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Update your school's public profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => {
            'use server';
            await updateSchoolSettings(school.id, slug, formData);
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name</Label>
              <Input id="name" name="name" defaultValue={school.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_url">Banner URL (Optional)</Label>
              <Input id="banner_url" name="banner_url" type="url" defaultValue={school.banner_url || ''} placeholder="https://example.com/banner.jpg" />
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
