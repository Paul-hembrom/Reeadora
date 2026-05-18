"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSchool } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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
      <form action={handleSubmit} className="space-y-4">
        {errorStatus && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium border border-red-200">
            {errorStatus}
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating School..." : "Create School"}
        </Button>
      </form>

      <Dialog open={!!successSlug} onOpenChange={(open) => !open && setSuccessSlug("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>School Created Successfully!</DialogTitle>
            <DialogDescription>
              Your school has been created. You can now manage your school's classes and teachers from the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild className="w-full">
              <a href={`/admin/${successSlug}`}>Go to Admin Dashboard</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
