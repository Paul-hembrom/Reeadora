"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClass } from "@/app/actions";

export function ClassModal({ schoolId, slug }: { schoolId: string, slug: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function action(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      await createClass(schoolId, slug, formData);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Create Class</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Class</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input id="name" name="name" placeholder="e.g. Grade 10 - Math" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher_password">Teacher Password</Label>
            <Input id="teacher_password" name="teacher_password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student_password">Student Password</Label>
            <Input id="student_password" name="student_password" required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
