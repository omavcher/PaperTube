// components/subscription-dialog.tsx
"use client";

import { useState } from "react";
import { Check, X, ArrowRight, Zap, Shield, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  icon: React.ReactNode;
}

// --- Component ---
interface SubscriptionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function SubscriptionDialog({ 
  open, 
  onOpenChange,
  trigger 
}: SubscriptionDialogProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  // Expert-level Plan Data
  const plans: PricingPlan[] = [
    {
      name: "Pro Scholar",
      description: "Essential tools for intensive academic study.",
      monthlyPrice: 9,
      yearlyPrice: 72,
      popular: true,
      highlight: true,
      icon: <GraduationCap className="w-5 h-5 text-red-500" />,
      features: [
        { text: "15 comprehensive generations daily", included: true },
        { text: "Analyze lectures up to 4 hours long", included: true },
        { text: "Access to all 20+ visual themes", included: true },
        { text: "Watermark-free PDF & Markdown exports", included: true },
        { text: "Priority access to Flash & Scholar models", included: true },
        { text: "Direct Notion workspace synchronization", included: true },
      ],
      cta: "Upgrade to Pro",
    },
    {
      name: "Power Scholar",
      description: "Uncapped potential for advanced researchers.",
      monthlyPrice: 19,
      yearlyPrice: 144,
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      features: [
        { text: "Unlimited daily generations (No cap)", included: true },
        { text: "Analyze vast streams up to 12 hours", included: true },
        { text: "Batch process entire playlists", included: true },
        { text: "Export directly to Anki (.apkg)", included: true },
        { text: "Access Atlas & DeepSeek V4 integration", included: true },
        { text: "24/7 Priority technical support", included: true },
      ],
      cta: "Unlock Power Access",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-[900px] w-[95vw] h-auto max-h-[90vh] md:max-h-[85vh] p-0 bg-[#050505]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(220,38,38,0.05)] text-white overflow-hidden flex flex-col rounded-[2rem]">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="overflow-y-auto flex-1 p-6 md:p-10 scrollbar-hide relative z-10">
          
          <DialogHeader className="mb-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest mx-auto">
              <Shield size={12} />
              <span>Premium Capability Required</span>
            </div>
            <DialogTitle className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">Research Capacity</span>
            </DialogTitle>
            <DialogDescription className="text-neutral-400 max-w-lg mx-auto text-sm font-light leading-relaxed">
              You have reached the limits of the standard tier. Upgrade your workspace to unlock professional-grade AI analysis, unlimited lecture processing, and advanced integrations.
            </DialogDescription>
          </DialogHeader>
 
          <div className="flex justify-center mb-12">
            <div className="relative flex bg-black/50 p-1.5 rounded-full border border-white/5 backdrop-blur-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`relative z-10 px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  billingPeriod === "monthly" ? "text-white" : "text-neutral-500 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`relative z-10 px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  billingPeriod === "yearly" ? "text-white" : "text-neutral-500 hover:text-white"
                }`}
              >
                Annually
              </button>
              <div
                className={`absolute top-1.5 bottom-1.5 rounded-full bg-neutral-800 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] w-[calc(50%-6px)] ${
                  billingPeriod === "monthly" ? "translate-x-0" : "translate-x-full"
                }`}
              />
              <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] transform rotate-6">
                Save 33%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-[2rem] p-8 transition-all duration-300 flex flex-col h-full group",
                  plan.highlight
                    ? "bg-gradient-to-b from-neutral-900 to-black border border-red-500/30 shadow-[0_0_40px_rgba(220,38,38,0.1)] order-first md:order-none" 
                    : "bg-black/50 border border-white/5 hover:border-white/10"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-8 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-white" /> Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "p-2.5 rounded-xl border",
                    plan.highlight ? "bg-red-500/10 border-red-500/20" : "bg-purple-500/10 border-purple-500/20"
                  )}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                  </div>
                </div>
                
                <p className="text-neutral-400 text-xs font-light leading-relaxed mb-6 h-8">
                  {plan.description}
                </p>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter text-white">
                    ${billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-neutral-500 text-sm font-medium">
                    /{billingPeriod === "monthly" ? "mo" : "yr"}
                  </span>
                </div>

                <a href="/pricing" className="w-full mt-auto mb-8 block">
                  <Button
                    className={cn(
                      "w-full h-12 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300",
                      plan.highlight
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-400/50"
                        : "bg-white text-black hover:bg-neutral-200 border border-white"
                    )}
                  >
                    {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>

                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="p-1 rounded-full bg-green-500/10 border border-green-500/20 shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-400" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="p-1 rounded-full bg-neutral-800 border border-neutral-700 shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-neutral-600" strokeWidth={3} />
                        </div>
                      )}
                      <span className={cn(
                        "text-xs leading-relaxed",
                        feature.included ? "text-neutral-200 font-medium" : "text-neutral-600"
                      )}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center border-t border-white/5 pt-6 pb-2 flex flex-col items-center justify-center gap-2">
             <div className="flex items-center gap-2 text-neutral-600 text-[10px] font-bold uppercase tracking-widest">
                <Shield size={12} />
                <span>Enterprise-Grade Encryption via Stripe</span>
             </div>
             <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
               <span className="hover:text-white cursor-pointer transition-colors">Cancel Anytime</span>
               <span>•</span>
               <button className="hover:text-white transition-colors underline decoration-neutral-700 underline-offset-4">
                 Restore Purchase
               </button>
             </div>
          </div>
           
        </div>
      </DialogContent>

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