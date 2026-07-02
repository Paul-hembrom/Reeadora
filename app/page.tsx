import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { LoginLink } from "@/components/login-link";
import { 
  GraduationCap, 
  School, 
  Users, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  MonitorPlay, 
  SlidersHorizontal, 
  ArrowRight
} from "lucide-react";

export default async function Home({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const code = (await searchParams)?.code;
  if (code) {
    // If Supabase fell back to the Site URL because of wildcard mismatch,
    // we redirect to the actual callback handler to process the auth code.
    redirect(`/api/auth/callback?code=${code}&next=/join`);
  }

  return (
    <div className="flex flex-col w-full -mt-8">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-100/60 via-transparent to-transparent dark:from-cyan-900/20 dark:via-transparent dark:to-transparent"></div>
        
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-8 animate-in zoom-in duration-700">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.1]">
          Your School’s AI‑Powered Classroom, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">One Click Away</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mt-6 mb-10 leading-relaxed font-medium">
          Set up your school, create password‑protected classes, assign teachers, and give students safe access to the full Readora learning suite.
        </p>
        
        <div className="flex flex-col items-center gap-6">
          <Link href="/join">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/20 dark:shadow-white/10 transition-all hover:scale-105 active:scale-95 group">
              Create Your School Workspace
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <LoginLink />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Built for simplicity</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">Get your entire school online and learning with AI in a matter of minutes, not months.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-9xl font-black text-slate-50 dark:text-slate-800/50 -z-10 -translate-y-10 translate-x-4 group-hover:-translate-y-8 transition-transform">1</div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400">
              <School className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Create Your School</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign up in seconds, add your school name, and upload a beautiful banner to make the workspace your own.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-9xl font-black text-slate-50 dark:text-slate-800/50 -z-10 -translate-y-10 translate-x-4 group-hover:-translate-y-8 transition-transform">2</div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Set Up Classes & Teachers</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Create password‑protected classes and securely invite your teachers by email to manage their students.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-9xl font-black text-slate-50 dark:text-slate-800/50 -z-10 -translate-y-10 translate-x-4 group-hover:-translate-y-8 transition-transform">3</div>
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center mb-6 text-fuchsia-600 dark:text-fuchsia-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Students Join & Learn</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Students safely access the Readora workspace with view‑only safety locks, ensuring they stay focused.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Readora Schools Section */}
      <section className="py-24 px-4 w-full bg-slate-50 dark:bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Why Choose Readora Schools</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">Equip your classrooms with the future of dynamic education.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col items-start gap-4">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">AI‑Powered Learning</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Unlock interactive lessons, instant video generation, and smart summaries for every topic.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col items-start gap-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Simple & Secure</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Class passwords keep students safely segregated in their assigned grade and subjects.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MonitorPlay className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Smartboard Ready</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Specially optimized for large classroom displays, projectors, and interactive touch screens.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Teacher Controls</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Easy-to-use dashboards specifically built to help educators manage content and pace users.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="py-24 px-4 w-full max-w-7xl mx-auto">
        <div className="w-full bg-gradient-to-br from-cyan-600 to-blue-700 dark:from-cyan-900/60 dark:to-blue-900/60 rounded-[2.5rem] p-10 md:p-16 border border-cyan-500/30 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <School className="w-12 h-12 text-white/80 mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to bring AI into your classrooms?</h2>
            <div className="flex flex-col items-center gap-4">
              <Link href="/join">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-slate-50 rounded-full font-bold px-10 h-14 text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Get Started Free
                </Button>
              </Link>
              <p className="text-cyan-100 font-medium tracking-wide">No credit card required. 14‑day Essentials trial.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
