import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Readora Schools',
  description: 'Gateway for Readora Schools',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-slate-100 min-h-screen text-slate-900 font-sans">
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold tracking-tighter">
                R
              </div>
              <span className="font-bold tracking-tight text-slate-800 text-xl">Readora</span>
            </Link>
            <nav className="flex gap-6 items-center text-sm font-semibold">
               <Link href="/join" className="text-slate-500 hover:text-indigo-600 transition-colors">Onboard School</Link>
               <Link href="/setup" className="text-slate-500 hover:text-indigo-600 transition-colors">Developer Setup</Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto p-4 sm:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
