import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSchool } from "@/app/actions";
import { GoogleLoginButton } from "@/components/auth-button";

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: queryError } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to Continue</CardTitle>
            <CardDescription>You need an account to onboard a school.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleLoginButton nextUrl="/join" />
          </CardContent>
        </Card>
      </div>
    );
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
    <div className="max-w-md mx-auto mt-10 space-y-8">
      {existingSchools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Schools</CardTitle>
            <CardDescription>Select a school to manage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingSchools.map((school, idx) => (
              <a
                key={idx}
                href={`/admin/${school.slug}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="font-medium text-gray-900">{school.name}</div>
                <div className="text-gray-500 text-sm">Manage &rarr;</div>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Onboard a School</CardTitle>
          <CardDescription>Enter the school details below. You will become the administrator.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSchool} className="space-y-4">
            {queryError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium border border-red-200">
                {queryError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">School Name</Label>
              <Input id="name" name="name" placeholder="e.g. Springfield High" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_url">Banner URL (Optional)</Label>
              <Input id="banner_url" name="banner_url" type="url" placeholder="https://example.com/banner.jpg" />
            </div>
            <Button type="submit" className="w-full">Create School</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
