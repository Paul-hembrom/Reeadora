import Link from 'next/link';
import { Building2, Sparkles } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { createClient, createAdminClient } from "@/utils/supabase/server";

export async function AppHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  
  if (user) {
    const adminClient = await createAdminClient();
    
    // Check if superadmin
    const { data: superAdmin } = await adminClient
      .from('superadmins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (superAdmin) {
      isAdmin = true;
    } else {
      // Check if school admin
      const { data: schoolAdmin } = await adminClient
        .from('school_admins')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
        
      if (schoolAdmin) {
        isAdmin = true;
      } else {
         // Optionally, should we check organization_members with role admin? 
         // The prompt says "Use the user’s role (from organization_members or school_admins) to conditionally render these links. ... hide them from teachers and students"
         // Let's check organization_members as well
         const { data: orgAdmin } = await adminClient
           .from('organization_members')
           .select('id')
           .eq('user_id', user.id)
           .eq('role', 'admin')
           .limit(1)
           .maybeSingle();
         if (orgAdmin) {
           isAdmin = true;
         }
      }
    }
  } else {
    // If not logged in, maybe show them? Or hide them? 
    // "For teachers and students, hide them completely."
    // Let's show them if they are not logged in, so they can onboard?
    isAdmin = true; 
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/5 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-black dark:from-green-400 dark:to-green-600 shadow-sm">
            <Sparkles className="h-5 w-5 text-white dark:text-black" />
          </div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-white text-xl">
            Readora<span className="text-slate-400 dark:text-slate-500 font-medium ml-1">Schools</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
           {isAdmin && (
             <>
               <Link href="/pricing" className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                 Pricing
               </Link>
               <Link href="/join" className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                 <Building2 className="h-4 w-4" />
                 Onboard School
               </Link>
               <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>
             </>
           )}
           <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
