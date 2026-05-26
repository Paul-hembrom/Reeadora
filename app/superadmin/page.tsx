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

import { SchoolRow } from "./school-row";

export default async function SuperadminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const superadminEmail = process.env.SUPERADMIN_EMAIL;
  if (!user || !user.email || !superadminEmail || user.email.toLowerCase() !== superadminEmail.toLowerCase()) {
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
      school_usage (
        videos_generated_this_month, image_searches_this_month, interactive_lessons_this_month
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
                <TableHead>Usage Limits</TableHead>
                <TableHead>Status</TableHead>
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
              {schools?.map((s) => (
                <SchoolRow key={s.id} school={s} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
