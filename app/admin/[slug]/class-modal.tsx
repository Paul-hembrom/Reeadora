"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClass } from "@/app/actions";
import { Eye, EyeOff, BookOpen, Plus } from "lucide-react";

export function ClassModal({ schoolId, slug, variant = "default" }: { schoolId: string, slug: string, variant?: "default" | "outline" | "secondary" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [showStudentPassword, setShowStudentPassword] = useState(false);

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
      <DialogTrigger render={
        <Button size="sm" variant={variant} className="gap-2 shadow-sm font-medium">
          <Plus className="w-4 h-4" /> Create Class
        </Button>
      } />
      <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            Create a New Class
          </DialogTitle>
          <DialogDescription>
            Add a class to organize students and assign teachers.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Class Name</Label>
            <Input id="name" name="name" placeholder="e.g. Grade 10 - Math" required className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher_password" className="text-slate-700 dark:text-slate-300">Teacher Password</Label>
            <div className="relative">
              <Input id="teacher_password" name="teacher_password" type={showTeacherPassword ? "text" : "password"} required className="pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              <button
                type="button"
                onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="student_password" className="text-slate-700 dark:text-slate-300">Student Password</Label>
            <div className="relative">
              <Input id="student_password" name="student_password" type={showStudentPassword ? "text" : "password"} required className="pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              <button
                type="button"
                onClick={() => setShowStudentPassword(!showStudentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-500/10 p-2 rounded">{error}</p>}
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full h-11 text-base shadow-sm">
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
