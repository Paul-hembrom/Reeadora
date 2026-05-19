import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toggleSchoolLock } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export default async function SuperadminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const superadminEmail = process.env.SUPERADMIN_EMAIL;
  if (!user || user.email !== superadminEmail) {
    redirect("/");
  }

  const adminClient = await createAdminClient();

  const { data: schools } = await adminClient
    .from("schools")
    .select(`
      id,
      name,
      slug,
      created_at,
      school_subscriptions (
        status, plan, trial_end_date, current_period_end
      ),
      school_admins (
        users (email)
      )
    `);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Superadmin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">School</th>
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Period End</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {schools?.map((s) => {
                  const sub = Array.isArray(s.school_subscriptions) ? s.school_subscriptions[0] : s.school_subscriptions;
                  const adminEmails = s.school_admins?.map((a: any) => a.users?.email).join(", ") || "No Admin";
                  
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.slug}</div>
                      </td>
                      <td className="px-4 py-3">{adminEmails}</td>
                      <td className="px-4 py-3 capitalize">{sub?.plan || 'None'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          sub?.status === 'active' ? 'bg-green-100 text-green-800' :
                          sub?.status === 'locked' ? 'bg-red-100 text-red-800' :
                          sub?.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sub?.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                         <form action={async () => {
                           'use server';
                           await toggleSchoolLock(s.id, sub?.status || 'active');
                         }}>
                           <SubmitButton size="sm" variant={sub?.status === 'locked' ? 'default' : 'destructive'}>
                             {sub?.status === 'locked' ? 'Unlock' : 'Lock'}
                           </SubmitButton>
                         </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
