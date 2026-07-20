"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { updateSchoolPlan, updateSchoolStatus, extendTrial, resetMonthlyUsage, toggleSchoolLock } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CalendarPlus, RefreshCcw, Lock, Unlock, Zap, ChevronDown } from "lucide-react";
import { useTransition, useState } from "react";

export function SchoolRow({ school }: { school: any }) {
  const [isPending, startTransition] = useTransition();

  const initialSub = Array.isArray(school.school_subscriptions) ? school.school_subscriptions[0] : school.school_subscriptions;
  const [sub, setSub] = useState<any>(initialSub);

  const adminEmails = school.school_admins?.map((a: any) => a.users?.email).join(", ") || "No Admin";
  const usage = Array.isArray(school.school_usage) ? school.school_usage[0] : school.school_usage;
  
  const planLimits: Record<string, { videos: number, images: number }> = {
    essentials: { videos: 0, images: -1 },
    starter: { videos: 10, images: 0 },
    growth: { videos: 25, images: -1 }, // -1 implies not strictly limited or depends on plan
    enterprise: { videos: 50, images: -1 }
  };
  
  const currentPlan = sub?.plan || 'starter';
  const limits = planLimits[currentPlan] || planLimits.starter;
  
  const videosUsed = usage?.videos_generated_this_month || 0;

  const handleUpdatePlan = (plan: string) => {
    startTransition(async () => {
      try {
        const res = await updateSchoolPlan(school.id, plan);
        if (res?.subscription) setSub(res.subscription);
      } catch (e) { console.error(e); }
    });
  };

  const handleUpdateStatus = (status: string) => {
    startTransition(async () => {
      try {
        const res = await updateSchoolStatus(school.id, status);
        if (res?.subscription) setSub(res.subscription);
      } catch (e) { console.error(e); }
    });
  };

  const handleExtendTrial = () => {
    startTransition(async () => {
      try {
        const res = await extendTrial(school.id);
        if (res?.subscription) setSub(res.subscription);
      } catch (e) { console.error(e); }
    });
  };

  const handleToggleLock = () => {
    startTransition(async () => {
      try {
        const res = await toggleSchoolLock(school.id, sub?.status || 'active');
        if (res?.subscription) setSub(res.subscription);
      } catch (e) { console.error(e); }
    });
  };
  
  return (
    <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="text-slate-900 dark:text-slate-100 font-semibold">{school.name}</span>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{school.slug}</span>
        </div>
      </TableCell>
      <TableCell className="text-slate-600 dark:text-slate-400">
        <div className="text-sm max-w-[150px] truncate" title={adminEmails}>{adminEmails}</div>
      </TableCell>
      <TableCell className="capitalize font-medium">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" size="sm" className="h-8 capitalize gap-1" disabled={isPending}>
              {currentPlan} <ChevronDown className="w-3 h-3 text-slate-500" />
            </Button>
          } />
          <DropdownMenuContent>
             <DropdownMenuItem onClick={() => handleUpdatePlan("essentials")}>Essentials (NPR 34,999/mo)</DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleUpdatePlan("starter")}>Starter (NPR 54,999/mo)</DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleUpdatePlan("growth")}>Growth (NPR 84,999/mo)</DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleUpdatePlan("enterprise")}>Enterprise (NPR 159,999/mo)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        {sub?.trial_end_date ? new Date(sub.trial_end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
      </TableCell>
      <TableCell>
        {(() => {
          if (sub?.status === 'trial' && sub?.trial_end_date) {
            const daysLeft = Math.ceil((new Date(sub.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysLeft > 0 ? <span className="font-medium text-blue-600 dark:text-blue-400">{daysLeft} days</span> : <span className="text-red-500 font-medium">Expired</span>;
          }
          return <span className="text-slate-400">N/A</span>;
        })()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" size="sm" className="h-8 capitalize gap-1" disabled={isPending}>
              {sub?.status || 'Unknown'} <ChevronDown className="w-3 h-3 text-slate-500" />
            </Button>
          } />
          <DropdownMenuContent>
             <DropdownMenuItem onClick={() => handleUpdateStatus("trial")}>Trial</DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleUpdateStatus("active")}>Active</DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleUpdateStatus("past_due")}>Past Due</DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleUpdateStatus("locked")}>Locked</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell className="text-right">
         <DropdownMenu>
           <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800">
                 <MoreHorizontal className="w-4 h-4" />
              </Button>
           } />
           <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExtendTrial}>
                <CalendarPlus className="w-4 h-4 mr-2 text-blue-500" /> Extend Trial (+7 days)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startTransition(() => resetMonthlyUsage(school.id))}>
                <RefreshCcw className="w-4 h-4 mr-2 text-amber-500" /> Reset Monthly Usage
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleToggleLock}
                className={sub?.status === 'locked' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
              >
                {sub?.status === 'locked' ? (
                  <><Unlock className="w-4 h-4 mr-2" /> Unlock School</>
                ) : (
                  <><Lock className="w-4 h-4 mr-2" /> Lock / Suspend</>
                )}
              </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
