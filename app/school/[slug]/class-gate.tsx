"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinClass } from "@/app/actions";
import { GoogleLoginButton } from "@/components/auth-button";
import { LogIn, ArrowRight, BookOpen, GraduationCap, Users, LogOut, Eye, EyeOff } from "lucide-react";

export function ClassGate({ orgId, name, schoolSlug }: { orgId: string, name: string, schoolSlug: string }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [joinToken, setJoinToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await joinClass(orgId, role, password);
      
      if (res.error === 'Not_Logged_In') {
        const tokenToUse = res.joinToken || joinToken;
        if (tokenToUse) {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const nextUrl = `/api/auth/callback?join_token=${tokenToUse}`;
          const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`;
          
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo,
            },
          });
          return;
        }
      }
      
      if (res.error) {
        if (res.error === 'Service_Suspended') {
          setError("This school's workspace is currently suspended. Please contact administration.");
        } else {
          setError(res.error);
        }
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
      <div 
         onClick={() => setOpen(true)}
         className="group relative bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-start justify-between mb-4">
           <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
           </div>
           <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-full">
              <ArrowRight className="w-4 h-4" />
           </div>
        </div>
        <div>
           <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-1">{name}</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
             Tap to authenticate <LogIn className="w-3.5 h-3.5" />
           </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                 <LogIn className="w-4 h-4" />
               </div>
               {name}
            </DialogTitle>
            <DialogDescription className="text-base text-slate-500 dark:text-slate-400">
               Authenticate to access the class environment.
            </DialogDescription>
          </DialogHeader>

             <div className="space-y-6 mt-4">
                <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-inner">
                  <button 
                    onClick={() => setRole('student')}
                    className={`flex items-center justify-center gap-2 flex-1 text-sm font-semibold py-2.5 rounded-lg transition-all duration-200 ${role === 'student' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                  >
                    <GraduationCap className="w-4 h-4" /> Student
                  </button>
                  <button 
                    onClick={() => setRole('teacher')}
                    className={`flex items-center justify-center gap-2 flex-1 text-sm font-semibold py-2.5 rounded-lg transition-all duration-200 ${role === 'teacher' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                  >
                    <Users className="w-4 h-4" /> Teacher
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Enter your {role} access code</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Access code..."
                        required 
                        className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-lg tracking-widest font-mono text-center pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg text-center">
                       {error}
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full h-11 text-base shadow-md transition-transform active:scale-[0.98]">
                    {loading ? "Authenticating..." : "Enter Classroom"}
                  </Button>
                </form>
              </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
