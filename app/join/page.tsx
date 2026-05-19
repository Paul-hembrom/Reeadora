import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GoogleLoginButton } from "@/components/auth-button";
import { OnboardSchoolForm } from "./onboard-school-form";

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

  const superadminEmail = process.env.SUPERADMIN_EMAIL;
  if (user && user.email === superadminEmail) {
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
          <OnboardSchoolForm queryError={queryError} />
        </CardContent>
      </Card>
    </div>
  );
}
