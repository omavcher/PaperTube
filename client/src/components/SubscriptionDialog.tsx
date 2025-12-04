// components/subscription-dialog.tsx
"use client";

import { useState } from "react";
import { Check, X, ArrowRight, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- Types ---
interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
  highlight?: boolean;
}

// --- Component ---
interface SubscriptionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode; // Optional: If you want to wrap a button
}

export default function SubscriptionDialog({ 
  open, 
  onOpenChange,
  trigger 
}: SubscriptionDialogProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  // Plan Data
  const plans: PricingPlan[] = [
    {
      name: "Scholar",
      description: "For occasional learners",
      monthlyPrice: 149,
      yearlyPrice: 1490,
      features: [
        { text: "Basic Summaries", included: true },
        { text: "90 min video limit", included: true },
        { text: "5 videos / batch", included: true },
        { text: "Advanced AI Models", included: false },
        { text: "Flashcards", included: false },
      ],
      cta: "Upgrade",
    },
    {
      name: "Pro Scholar",
      description: "Exam-ready notes",
      monthlyPrice: 299,
      yearlyPrice: 2990,
      popular: true,
      highlight: true,
      features: [
        { text: "ALL Premium AI Models", included: true },
        { text: "4 hour video limit", included: true },
        { text: "20 videos / batch", included: true },
        { text: "Flashcard Creator", included: true },
        { text: "Priority Processing", included: true },
      ],
      cta: "Get Pro",
    },
    {
      name: "Institute",
      description: "For researchers",
      monthlyPrice: 599,
      yearlyPrice: 5990,
      features: [
        { text: "Unlimited Limits", included: true },
        { text: "8 hour video limit", included: true },
        { text: "Unlimited Batch", included: true },
        { text: "Team Features", included: true },
        { text: "Custom AI Training", included: true },
      ],
      cta: "Contact",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* If a trigger button is passed, render it */}
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] md:h-auto md:max-h-[85vh] p-0 bg-black border-neutral-800 text-white overflow-hidden flex flex-col">
        
        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-4 md:p-8 scrollbar-hide">
          
          {/* Header */}
          <DialogHeader className="mb-8 text-center space-y-2">
            <Badge variant="outline" className="w-fit mx-auto border-red-500/50 text-red-400 bg-red-950/10 mb-2">
              Premium Feature Locked
            </Badge>
            <DialogTitle className="text-3xl md:text-4xl font-bold">
              Unlock Your <span className="text-red-500">Learning Superpowers</span>
            </DialogTitle>
            <DialogDescription className="text-neutral-400 max-w-lg mx-auto text-base">
              You've hit a limit on your current plan. Upgrade now to generate unlimited notes, flashcards, and access premium AI models.
            </DialogDescription>
          </DialogHeader>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-10">
            <div className="relative flex bg-neutral-900 p-1 rounded-full border border-white/10">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingPeriod === "monthly" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingPeriod === "yearly" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Yearly
              </button>
              <div
                className={`absolute top-1 bottom-1 rounded-full bg-red-600 transition-all duration-300 w-[calc(50%-4px)] ${
                  billingPeriod === "monthly" ? "left-1" : "left-[calc(50%)]"
                }`}
              />
              <div className="absolute -top-3 -right-4 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500 transform rotate-12">
                -17%
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-xl border p-5 transition-all duration-200 flex flex-col h-full",
                  plan.highlight
                    ? "bg-neutral-900 border-red-600 shadow-xl shadow-red-900/10 order-first md:order-none" // Mobile: Show highlighted first
                    : "bg-neutral-950 border-white/10 hover:bg-neutral-900/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> Popular
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-neutral-400 text-xs">{plan.description}</p>
                </div>

                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ₹{billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-neutral-500 text-xs">
                    /{billingPeriod === "monthly" ? "mo" : "yr"}
                  </span>
                </div>

                <Button
                  className={cn(
                    "w-full mb-6 h-10 text-sm font-semibold",
                    plan.highlight
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white text-black hover:bg-neutral-200"
                  )}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3 flex-grow">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-neutral-700 mt-0.5 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-xs leading-tight",
                          feature.included ? "text-neutral-300" : "text-neutral-700"
                        )}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
           {/* Footer - Trust / Alternate */}
           <div className="mt-8 text-center border-t border-white/5 pt-4">
             <p className="text-neutral-500 text-xs">
               Secure payment via Stripe. Cancel anytime. 
               <button className="ml-2 text-white hover:text-red-400 underline decoration-neutral-700 underline-offset-2">
                 Restore Purchase
               </button>
             </p>
           </div>
           
        </div>
      </DialogContent>

       {/* Style for hiding scrollbar inside modal */}
       <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Dialog>
  );
}