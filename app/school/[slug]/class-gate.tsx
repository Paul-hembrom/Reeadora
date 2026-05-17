"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinClass } from "@/app/actions";
import { GoogleLoginButton } from "@/components/auth-button";

export function ClassGate({ orgId, name, schoolSlug }: { orgId: string, name: string, schoolSlug: string }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authNeeded, setAuthNeeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAuthNeeded(false);

    try {
      const res = await joinClass(orgId, role, password);
      
      if (res.error === 'Not_Logged_In') {
        // They need to log in first
        setAuthNeeded(true);
        return;
      }
      
      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.successUrl) {
        window.location.href = res.successUrl;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setOpen(true)}>
        <CardHeader>
          <CardTitle className="text-xl">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Click to join</p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join {name}</DialogTitle>
          </DialogHeader>

          {authNeeded ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-700">Almost there! You need to connect your account to enter the classroom.</p>
              <GoogleLoginButton nextUrl={`/school/${schoolSlug}`} />
            </div>
          ) : (
             <div className="space-y-6 mt-4">
                <div className="flex bg-slate-100 p-1 rounded-[12px]">
                  <button 
                    onClick={() => setRole('student')}
                    className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${role === 'student' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    I'm a Student
                  </button>
                  <button 
                    onClick={() => setRole('teacher')}
                    className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${role === 'teacher' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    I'm a Teacher
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Enter the {role} access code</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      required 
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Verifying..." : "Enter Classroom"}
                  </Button>
                </form>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
