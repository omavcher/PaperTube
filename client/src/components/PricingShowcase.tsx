"use client";

import React from "react";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Flame, 
  Users, 
  Activity,
  Crown,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- Configuration ---
const plans = [
  { 
    id: "scholar", 
    name: "Scholar", 
    price: 149, 
    daily: 4.90,
    desc: "For occasional research.", 
    features: ["Standard AI Access", "90 Min Video Limit", "Cloud Save Enabled", "Basic Export"],
    cta: "Start Free Trial",
    highlight: false,
    accent: "blue"
  },
  { 
    id: "pro", 
    name: "Pro Scholar", 
    price: 299, 
    daily: 9.90,
    desc: "For serious academic work.", 
    features: ["ALL 5 AI Models", "4 Hour Video Limit", "Priority Processing", "Advanced PDF Export", "No Watermark"],
    cta: "Upgrade to Pro",
    highlight: true,
    popular: true,
    accent: "yellow"
  },
  { 
    id: "power", 
    name: "Research Lab", 
    price: 599, 
    daily: 19.90,
    desc: "For power users & teams.", 
    features: ["Enterprise AI Models", "Unlimited Processing", "API Access", "24/7 Priority Support", "Team Dashboard"],
    cta: "Contact Sales",
    highlight: false,
    accent: "purple"
  },
];

export default function PricingShowcase() {
  return (
    <section className=" bg-black text-white relative overflow-hidden font-sans">
      
      {/* --- Background Atmosphere --- */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/30 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 z-0 opacity-20 [background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="container mx-auto px-0 md:px-6 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-20 space-y-4 md:space-y-6 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            Sync with 8,400+ Engineers
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none"
          >
            Pricing <span className="text-white">Plans.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-lg text-neutral-400 font-medium md:font-light max-w-sm md:max-w-lg mx-auto leading-relaxed"
          >
            Upgrade your cognitive throughput. Select a subscription tier to eliminate process latency and unlock full model capabilities.
          </motion.p>
        </div>

        {/* --- Pricing Cards (Horizontal scroll on Mobile, Grid on Desktop) --- */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-8 pb-12 md:pb-0 px-6 md:px-0 md:grid md:grid-cols-3 items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                " relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col transition-all duration-300 group md:hover:-translate-y-2 shrink-0 snap-center w-[85vw] max-w-[320px] md:w-auto md:max-w-none",
                plan.highlight 
                  ? "bg-neutral-900/40 backdrop-blur-xl border-white/10 shadow-2xl shadow-white/5 z-10" 
                  : "bg-black/40 border-white/5 hover:bg-neutral-900/40 hover:border-white/10"
              )}
            >
              

              {/* Header */}
              <div className="mb-6 md:mb-8 space-y-2 md:space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{plan.name}</h3>
                    {plan.highlight && <Sparkles size={16} className="text-yellow-500" />}
                 </div>
                 <p className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-wide">{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-white/5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-bold text-white tracking-tighter">₹{plan.price}</span>
                  <span className="text-neutral-500 text-xs md:text-sm font-bold uppercase tracking-widest">/mo</span>
                </div>
                <div className="mt-2 text-[10px] font-mono text-neutral-500 font-bold">
                  ≈ ₹{plan.daily.toFixed(2)} / day
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3.5 md:space-y-4 mb-8 md:mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                        "mt-[3px] md:mt-0.5 p-0.5 rounded-full flex items-center justify-center shrink-0",
                        plan.highlight ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"
                    )}>
                        <Check size={10} strokeWidth={4} />
                    </div>
                    <span className={cn(
                        "text-xs md:text-sm font-bold tracking-tight",
                        plan.highlight ? "text-neutral-200" : "text-neutral-400"
                    )}>
                        {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/pricing" className="w-full mt-auto">
                <button 
                  className={cn(
                    "w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all active:scale-95",
                    plan.highlight 
                      ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                      : "bg-neutral-900 text-white border border-white/5 hover:bg-neutral-800"
                  )}
                >
                  {plan.cta} 
                  {plan.highlight && <ArrowRight size={14} />}
                </button>
              </Link>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

// Helper Component (Optional but kept for completeness based on your provided code)
const TrustBadge = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-3 text-neutral-500 group hover:text-white transition-colors cursor-default">
        <Icon size={16} className="text-neutral-600 group-hover:text-white transition-colors" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{text}</span>
    </div>
);