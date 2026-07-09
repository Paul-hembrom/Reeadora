"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4 bg-slate-50 dark:bg-slate-950 p-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
          <p className="text-slate-500 dark:text-slate-400">
            An unexpected error occurred.
          </p>
          <Button nativeButton={false} onClick={() => reset()} className="mt-4">
            Try again
          </Button>
          <Button nativeButton={false} render={<Link href="/">Return Home</Link>} variant="outline" className="mt-2" />
        </div>
      </body>
    </html>
  );
}
