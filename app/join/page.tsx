import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSchool } from "@/app/actions";
import { GoogleLoginButton } from "@/components/auth-button";

export default async function JoinPage() {
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

  // If user is already an admin, redirect them instead
  const adminClient = await createAdminClient();
  const { data: existingAdmin } = await adminClient
    .from("school_admins")
    .select("schools(slug)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existingAdmin && existingAdmin.schools) {
    // If we have an array or object, depending on relationships
    const slug = Array.isArray(existingAdmin.schools) ? existingAdmin.schools[0]?.slug : (existingAdmin.schools as any)?.slug;
    if (slug) {
      redirect(`/admin/${slug}`);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Onboard a School</CardTitle>
          <CardDescription>Enter the school details below. You will become the administrator.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSchool} className="space-y-4">
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
