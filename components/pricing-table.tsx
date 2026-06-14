import { Check, X } from "lucide-react";

export function PricingTable() {
  return (
    <div className="mt-24 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-white">Compare Features</h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 sm:p-6 font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50 w-1/4">Features</th>
              <th className="p-4 sm:p-6 font-semibold text-center text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50">Essentials</th>
              <th className="p-4 sm:p-6 font-semibold text-center text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50">Starter</th>
              <th className="p-4 sm:p-6 font-semibold text-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-500/5">Growth</th>
              <th className="p-4 sm:p-6 font-semibold text-center text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="p-4 sm:p-6 font-medium text-slate-700 dark:text-slate-300">Students Included</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Unlimited</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Unlimited</td>
              <td className="p-4 text-center font-semibold text-slate-900 dark:text-white">Unlimited</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Unlimited</td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="p-4 sm:p-6 font-medium text-slate-700 dark:text-slate-300">AI Videos per month</td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">10</td>
              <td className="p-4 text-center font-semibold text-slate-900 dark:text-white">25</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">50</td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="p-4 sm:p-6 font-medium text-slate-700 dark:text-slate-300">Analytics</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Basic</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Basic</td>
              <td className="p-4 text-center font-semibold text-slate-900 dark:text-white">Advanced</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Custom</td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="p-4 sm:p-6 font-medium text-slate-700 dark:text-slate-300">Support</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Chat</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Chat</td>
              <td className="p-4 text-center font-semibold text-slate-900 dark:text-white">Priority</td>
              <td className="p-4 text-center text-slate-500 dark:text-slate-400">Dedicated</td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="p-4 sm:p-6 font-medium text-slate-700 dark:text-slate-300">Image Discovery</td>
              <td className="p-4 text-center"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
              <td className="p-4 text-center"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="p-4 sm:p-6 font-medium text-slate-700 dark:text-slate-300">Interactive Lessons</td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
              <td className="p-4 text-center"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="p-4 sm:p-6 font-medium text-slate-700 dark:text-slate-300">API Access</td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="p-4 sm:p-6 font-medium text-slate-700 dark:text-slate-300">Custom Integrations</td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" /></td>
              <td className="p-4 text-center"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
