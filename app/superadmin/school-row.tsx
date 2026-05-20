"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { updateSchoolPlan, extendTrial, resetMonthlyUsage, toggleSchoolLock } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CalendarPlus, RefreshCcw, Lock, Unlock, Zap, ChevronDown } from "lucide-react";
import { useTransition } from "react";

export function SchoolRow({ school }: { school: any }) {
  const [isPending, startTransition] = useTransition();

  const sub = Array.isArray(school.school_subscriptions) ? school.school_subscriptions[0] : school.school_subscriptions;
  const adminEmails = school.school_admins?.map((a: any) => a.users?.email).join(", ") || "No Admin";
  const usage = Array.isArray(school.school_usage) ? school.school_usage[0] : school.school_usage;
  
  const planLimits: Record<string, { videos: number, images: number }> = {
    starter: { videos: 10, images: 0 },
    growth: { videos: 25, images: -1 }, // -1 implies not strictly limited or depends on plan
    enterprise: { videos: 50, images: -1 }
  };
  
  const currentPlan = sub?.plan || 'starter';
  const limits = planLimits[currentPlan] || planLimits.starter;
  
  const videosUsed = usage?.videos_generated_this_month || 0;
  
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
             <DropdownMenuItem onClick={() => startTransition(() => updateSchoolPlan(school.id, "starter"))}>Starter</DropdownMenuItem>
             <DropdownMenuItem onClick={() => startTransition(() => updateSchoolPlan(school.id, "growth"))}>Growth</DropdownMenuItem>
             <DropdownMenuItem onClick={() => startTransition(() => updateSchoolPlan(school.id, "enterprise"))}>Enterprise</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="text-slate-500">Videos:</span>
            <span className="font-mono font-medium">{videosUsed}/{limits.videos}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-slate-500">Images:</span>
            <span className="font-mono font-medium">{usage?.image_searches_this_month || 0}{limits.images !== -1 ? `/${limits.images}` : ''}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {sub?.status === 'active' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">Active</Badge>}
        {sub?.status === 'trial' && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">Trial</Badge>}
        {sub?.status === 'past_due' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">Past Due</Badge>}
        {sub?.status === 'locked' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">Suspended</Badge>}
        {!sub?.status && <Badge variant="secondary">Unknown</Badge>}
        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
          Ends {sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
        </div>
      </TableCell>
      <TableCell className="text-right">
         <DropdownMenu>
           <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800">
                 <MoreHorizontal className="w-4 h-4" />
              </Button>
           } />
           <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => startTransition(() => extendTrial(school.id))}>
                <CalendarPlus className="w-4 h-4 mr-2 text-blue-500" /> Extend Trial (+7 days)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startTransition(() => resetMonthlyUsage(school.id))}>
                <RefreshCcw className="w-4 h-4 mr-2 text-amber-500" /> Reset Monthly Usage
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => startTransition(() => toggleSchoolLock(school.id, sub?.status || 'active'))}
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
