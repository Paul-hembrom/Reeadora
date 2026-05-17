import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] text-center px-4 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-800">
          Readora Schools Gateway
        </h1>
        <p className="text-xl text-slate-500 max-w-[600px] mx-auto">
          Manage your school's organizations, teachers, and students. Provides a secure password gateway to Readora apps.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/join">
          <Button size="lg" className="w-full sm:w-auto">Onboard a New School</Button>
        </Link>
      </div>
    </div>
  );
}
