"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { revokeInvitation, resendInvitation } from "@/app/actions";
import { RefreshCw, Trash2 } from "lucide-react";

export function PendingInvitationActions({ schoolId, slug, invitationId }: { schoolId: string, slug: string, invitationId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleRevoke = () => {
    startTransition(async () => {
      try {
        const res = await revokeInvitation(schoolId, slug, invitationId);
        if (res && res.error) {
          alert(res.error);
        }
      } catch (err: any) {
        alert(err.message || "Failed to revoke invitation");
      }
    });
  };

  const handleResend = () => {
    startTransition(async () => {
      try {
        const res = await resendInvitation(schoolId, slug, invitationId);
        if (res && res.error) {
          alert(res.error);
        } else if (res && res.message) {
          alert(res.message);
        }
      } catch (err: any) {
        alert(err.message || "Failed to resend invitation");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleResend} 
        disabled={isPending}
        className="h-8 px-2 text-xs w-20"
      >
        <RefreshCw className="w-3 h-3 mr-1" /> Resend
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRevoke} 
        disabled={isPending}
        className="h-8 px-2 text-xs w-20 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="w-3 h-3 mr-1" /> Revoke
      </Button>
    </div>
  );
}
