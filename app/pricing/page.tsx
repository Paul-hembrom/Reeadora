"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ShieldCheck, Sparkles, Zap, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  const [currency, setCurrency] = useState<"USD" | "NPR">("USD");
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  const plans = [
    {
      name: "Essentials",
      description: "Most affordable plan for growing schools.",
      price: {
        USD: { annual: 1120, monthly: 112 },
        NPR: { annual: 149990, monthly: 14999 },
      },
      features: [
        "Unlimited students",
        "Unlimited book uploads",
        "Full AI chat",
        "YouTube video embed",
        "Image discovery"
      ],
      icon: <Sparkles className="h-6 w-6 text-emerald-500" />,
      ctaText: "Start Free Trial",
      ctaLink: "/join",
      highlighted: false,
    },
    {
      name: "Starter",
      description: "Perfect for small schools just getting started.",
      price: {
        USD: { annual: 1750, monthly: null },
        NPR: { annual: 234500, monthly: null },
      },
      features: [
        "Unlimited students",
        "10 AI videos/month",
        "Basic analytics",
        "Chat support",
      ],
      icon: <Sparkles className="h-6 w-6 text-indigo-500" />,
      ctaText: "Start Free Trial",
      ctaLink: "/join",
      highlighted: false,
    },
    {
      name: "Growth",
      description: "Ideal for growing schools needing advanced features.",
      price: {
        USD: { annual: 4200, monthly: 420 },
        NPR: { annual: 562800, monthly: 56280 },
      },
      features: [
        "Unlimited students",
        "25 AI videos/month",
        "Image discovery",
        "Interactive lessons",
        "Priority support",
      ],
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      ctaText: "Start Free Trial",
      ctaLink: "/join",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      description: "For large institutions requiring custom solutions.",
      price: {
        USD: { annual: 8500, monthly: null },
        NPR: { annual: 1139000, monthly: null },
      },
      features: [
        "Unlimited students",
        "50 AI videos/month",
        "Custom integrations",
        "Dedicated support",
        "API access",
      ],
      icon: <Building2 className="h-6 w-6 text-rose-500" />,
      ctaText: "Contact Sales",
      ctaLink: "https://wa.me/+9779767697274?text=Hi,%20I%20am%20interested%20in%20the%20Readora%20Enterprise%20plan.",
      highlighted: false,
    },
  ];

  const formatPrice = (amount: number, curr: "USD" | "NPR") => {
    if (curr === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
    } else {
      return `NPR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 mb-4 px-3 py-1 text-sm font-medium">
          Pricing Plans
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400">
          Choose the best plan for your institution. Access powerful AI-driven educational tools to transform your classrooms.
        </p>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === "annual"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Annually <span className="text-xs text-green-600 dark:text-green-400 ml-1 font-bold">-20%</span>
            </button>
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currency === "USD"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("NPR")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currency === "NPR"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              NPR (रू)
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
        {plans.map((plan, idx) => {
          const isAnnual = billingCycle === "annual";
          const currentPrice = isAnnual ? plan.price[currency].annual : plan.price[currency].monthly;
          const displayPrice = currentPrice !== null ? formatPrice(currentPrice, currency) : formatPrice(plan.price[currency].annual, currency);
          const showAnnualOnly = billingCycle === "monthly" && currentPrice === null;

          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? "border-2 border-indigo-500 shadow-xl dark:shadow-indigo-500/10 scale-100 lg:scale-105 z-10"
                  : "border border-slate-200 dark:border-slate-800 shadow-sm"
              } bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl transition-all duration-300 hover:shadow-lg`}
            >
              {plan.highlighted && plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}
              <CardHeader className="text-center pt-8 pb-4">
                <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="pt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center">
                <div className="my-6 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {displayPrice}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                      /{showAnnualOnly || isAnnual ? "yr" : "mo"}
                    </span>
                  </div>
                  {showAnnualOnly && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium bg-amber-50 dark:bg-amber-500/10 py-1 px-2 rounded w-fit mx-auto">
                      Available annually only
                    </p>
                  )}
                  {isAnnual && plan.price[currency].monthly !== null && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                      Save 20% compared to monthly
                    </p>
                  )}
                </div>

                <ul className="w-full space-y-4 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-green-100 dark:bg-green-500/20 p-1 flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4 pb-8 px-6">
                <Button
                  render={
                    plan.name === "Enterprise" ? (
                      <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                        {plan.ctaText}
                      </a>
                    ) : (
                      <Link href={plan.ctaLink}>{plan.ctaText}</Link>
                    )
                  }
                  variant={plan.highlighted ? "default" : "outline"}
                  className={`w-full h-12 text-base font-semibold ${
                    plan.highlighted ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md dark:bg-indigo-600 dark:hover:bg-indigo-700" : ""
                  }`}
                />
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
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

      {/* FAQ Section */}
      <div className="mt-24 max-w-3xl mx-auto pb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg">Everything you need to know about our subscriptions and billing.</p>
        </div>
        <div className="space-y-4">
          {[
            {
              question: "Can I try before I buy?",
              answer: "Yes, we offer a 14-day free trial on all plans. You can cancel at any time during the trial period without being charged."
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards and debit cards via Stripe. For Enterprise customers, we also support manual invoicing and ACH transfers."
            },
            {
              question: "Can I change my plan later?",
              answer: "Absolutely. You can upgrade or downgrade your plan at any time. Prorated charges or credits will automatically be applied to your account."
            },
            {
              question: "Is there a discount for annual billing?",
              answer: "Yes! You save 20% by choosing annual billing instead of monthly billing. This discount is applied automatically when you select the annual billing option."
            },
            {
              question: "What happens if I exceed my plan limits?",
              answer: "If you exceed your AI videos or feature limits, we will safely pause those specific features for the remainder of the billing cycle. You can upgrade your plan immediately to restore access."
            }
          ].map((faq, index) => (
            <details key={index} className="group border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-xl p-5 text-slate-900 dark:text-white font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                <span className="text-base">{faq.question}</span>
                <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
