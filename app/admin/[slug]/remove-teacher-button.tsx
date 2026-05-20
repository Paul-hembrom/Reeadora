"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { removeTeacher } from "@/app/actions";

export function RemoveTeacherButton({ schoolId, slug, assignmentId }: { schoolId: string, slug: string, assignmentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRemove = async () => {
    setLoading(true);
    setError("");
    try {
      await removeTeacher(schoolId, slug, assignmentId);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to remove teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => { setOpen(true); setError(""); }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this teacher from the class? They will lose access to the class organization.
            </DialogDescription>
          </DialogHeader>
          {error && <div className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</div>}
          <DialogFooter className="mt-4">
            <DialogClose render={<Button variant="outline" disabled={loading}>Cancel</Button>} />
            <Button variant="destructive" onClick={handleRemove} disabled={loading}>
              {loading ? "Removing..." : "Remove Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
