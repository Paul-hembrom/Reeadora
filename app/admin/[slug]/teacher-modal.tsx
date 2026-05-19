"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTeacher } from "@/app/actions";
import { Users, Plus } from "lucide-react";

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
      <DialogTrigger render={
        <Button size="sm" variant="secondary" disabled={classes.length === 0} className="gap-2 shadow-sm font-medium">
          <Plus className="w-4 h-4" /> Add Teacher
        </Button>
      } />
      <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
               <Users className="w-4 h-4" />
             </div>
             Add a New Teacher
          </DialogTitle>
          <DialogDescription>
            Assign an existing Readora user as a teacher to a specific class.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4 pt-4">
          <div className="space-y-2">
             <Label htmlFor="classId" className="text-slate-700 dark:text-slate-300">Assign to Class</Label>
            <select
              id="classId"
              className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
            >
              <option value="" disabled>Select a class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Teacher Account Email</Label>
            <Input id="email" name="email" type="email" placeholder="teacher@school.com" required className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
            <p className="text-[11px] text-slate-500">The teacher must already have created a Readora account.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjects" className="text-slate-700 dark:text-slate-300">Subjects <span className="text-slate-400 font-normal">(Optional)</span></Label>
            <Input id="subjects" name="subjects" placeholder="Math, Science" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
          </div>
          {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-500/10 p-2 rounded">{error}</p>}
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full h-11 text-base shadow-sm">
              {loading ? "Adding..." : "Add Teacher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
