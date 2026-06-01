import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Link from 'next/link';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sparkles, Building2, Code2 } from 'lucide-react';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Readora Schools',
  description: 'Gateway for Readora Schools',
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%234F46E5'/%3E%3Cpath d='M50 25L20 40L50 55L80 40Z M25 45V60L50 75L75 60V45L50 60Z' fill='white'/%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
      }
    ],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-slate-50 dark:bg-[#0a0a0a] min-h-screen text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-green-500/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={150}>
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
                   <Link href="/pricing" className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                     Pricing
                   </Link>
                   <Link href="/join" className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                     <Building2 className="h-4 w-4" />
                     Onboard School
                   </Link>
                   <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>
                   <ModeToggle />
                </nav>
              </div>
            </header>
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </main>
            <Toaster position="bottom-right" className="font-sans" theme="system" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
