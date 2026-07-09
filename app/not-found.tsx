import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h1 className="text-6xl font-bold text-slate-900 dark:text-white">404</h1>
      <h2 className="text-xl font-medium text-slate-600 dark:text-slate-300">Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button nativeButton={false} render={<Link href="/">Return Home</Link>} className="mt-4" />
    </div>
  );
}
