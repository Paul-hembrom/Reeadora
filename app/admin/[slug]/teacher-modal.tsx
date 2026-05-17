"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTeacher } from "@/app/actions";

export function TeacherModal({ schoolId, slug, classes }: { schoolId: string, slug: string, classes: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classId, setClassId] = useState(classes.length > 0 ? classes[0].id : "");

  async function action(formData: FormData) {
    const email = formData.get("email") as string;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await addTeacher(schoolId, slug, classId, formData);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" disabled={classes.length === 0}>+ Add Teacher</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Teacher</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="classId">Class</Label>
            <select
              id="classId"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
            >
              <option value="" disabled>Select a class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Teacher Email (Must already exist in Readora users)</Label>
            <Input id="email" name="email" type="email" placeholder="teacher@school.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects (comma-separated)</Label>
            <Input id="subjects" name="subjects" placeholder="Math, Science" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Teacher"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
