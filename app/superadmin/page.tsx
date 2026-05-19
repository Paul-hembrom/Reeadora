import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toggleSchoolLock } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BuildingIcon, Shield } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Superadmin</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage all schools and billing states</p>
        </div>
      </div>
      
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BuildingIcon className="h-5 w-5 text-slate-400" />
            Registered Schools
          </CardTitle>
          <CardDescription>View and manage school subscriptions and access</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                <TableHead className="w-[300px]">School Details</TableHead>
                <TableHead>Administrator</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No schools registered yet.
                  </TableCell>
                </TableRow>
              )}
              {schools?.map((s) => {
                const sub = Array.isArray(s.school_subscriptions) ? s.school_subscriptions[0] : s.school_subscriptions;
                const adminEmails = s.school_admins?.map((a: any) => a.users?.email).join(", ") || "No Admin";
                
                return (
                  <TableRow key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">{s.name}</span>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">{s.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{adminEmails}</TableCell>
                    <TableCell className="capitalize font-medium">{sub?.plan || 'None'}</TableCell>
                    <TableCell>
                      {sub?.status === 'active' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">Active</Badge>}
                      {sub?.status === 'trial' && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">Trial</Badge>}
                      {sub?.status === 'past_due' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">Past Due</Badge>}
                      {sub?.status === 'locked' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">Suspended</Badge>}
                      {!sub?.status && <Badge variant="secondary">Unknown</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                       <form action={async () => {
                         'use server';
                         await toggleSchoolLock(s.id, sub?.status || 'active');
                       }}>
                         <SubmitButton size="sm" variant={sub?.status === 'locked' ? 'outline' : 'destructive'} className={sub?.status === 'locked' ? 'border-primary text-primary hover:bg-primary/10' : ''}>
                           {sub?.status === 'locked' ? 'Restore Access' : 'Suspend'}
                         </SubmitButton>
                       </form>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
