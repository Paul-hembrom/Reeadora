import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Link from 'next/link';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import { AppHeader } from '@/components/app-header';
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
            <AppHeader />
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
