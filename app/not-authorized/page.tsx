import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotAuthorizedPage() {
  return (
    <div className="flex items-center justify-center p-8 mt-20 max-w-md mx-auto">
      <Card className="w-full border-red-200/50 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 shadow-sm backdrop-blur-xl">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
             <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You do not have authorization to access this dashboard. Students are not permitted to access administrative pages.
            </p>
          </div>
          <Button render={<Link href="/">Return to Home</Link>} variant="outline" className="w-full mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}
