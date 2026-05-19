"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSchool } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, AlertCircle } from "lucide-react";

export function OnboardSchoolForm({ queryError }: { queryError?: string }) {
  const [loading, setLoading] = useState(false);
  const [successSlug, setSuccessSlug] = useState("");
  const [errorStatus, setErrorStatus] = useState(queryError);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorStatus("");
    try {
      const res = await createSchool(formData);
      if (res.error) {
        setErrorStatus(res.error);
      } else if (res.slug) {
        setSuccessSlug(res.slug);
      }
    } catch (e: any) {
      setErrorStatus(e.message || "Failed to create school.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-5">
        {errorStatus && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{errorStatus}</div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">School Name</Label>
          <Input id="name" name="name" placeholder="e.g. Springfield High" required className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="banner_url" className="text-slate-700 dark:text-slate-300">Banner URL <span className="text-slate-400 font-normal">(Optional)</span></Label>
          <Input id="banner_url" name="banner_url" type="url" placeholder="https://example.com/banner.jpg" className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
        </div>
        <Button type="submit" className="w-full h-11 text-base font-medium shadow-md transition-transform active:scale-[0.98]" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Workspace...
            </>
          ) : (
            "Create School Workspace"
          )}
        </Button>
      </form>

      <Dialog open={!!successSlug} onOpenChange={(open) => !open && setSuccessSlug("")}>
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Workspace Created!</DialogTitle>
            <DialogDescription className="text-base text-slate-500 dark:text-slate-400">
              Your school has been created successfully. You can now manage your classes, teachers, and settings from the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-start w-full">
            <Button render={<a href={`/admin/${successSlug}`}>Go to Admin Dashboard</a>} className="w-full h-11 shadow-md" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
