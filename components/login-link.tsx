'use client';
import { createClient } from '@/utils/supabase/client';

export function LoginLink() {
  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent('/join')}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
  };

  return (
    <button onClick={handleLogin} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
      Already have a school? Sign in
    </button>
  );
}
