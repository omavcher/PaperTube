"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, ArrowRight, Sparkles, Sun, Clock, Gift
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Pricing illusion config ──────────────────────────────────
const OFFER_DISCOUNT_PCT = 20;
const FAKE_PRICE_MULTIPLIER = 1.25;

function fakeOriginal(real: number) {
  return Math.round(real * FAKE_PRICE_MULTIPLIER);
}

// ─── Plan data ────────────────────────────────────────────────
const plans = [
  { 
    id: "scholar", name: "Scholar", price: 149, daily: 4.90,
    desc: "For occasional research.", 
    features: ["Standard AI Access", "90 Min Video Limit", "Cloud Save Enabled", "Basic Export"],
    cta: "Get Started", highlight: false,
  },
  { 
    id: "pro", name: "Pro Scholar", price: 299, daily: 9.90,
    desc: "For serious academic work.", 
    features: ["ALL 5 AI Models", "4 Hour Video Limit", "Priority Processing", "Advanced PDF Export", "No Watermark"],
    cta: "Upgrade to Pro", highlight: true, popular: true,
  },
  { 
    id: "power", name: "Research Lab", price: 599, daily: 19.90,
    desc: "For power users & teams.", 
    features: ["Enterprise AI Models", "Unlimited Processing", "API Access", "24/7 Priority Support", "Team Dashboard"],
    cta: "Contact Sales", highlight: false,
  },
];

// ─── Countdown Banner ─────────────────────────────────────────
function MegaOfferBanner() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = midnight.getTime() - now.getTime();
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-rose-500/10 p-5 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 mx-6 md:mx-0 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
    >
      {/* Left label */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 shrink-0">
          <Gift size={24} className="text-red-400 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] md:text-sm font-black uppercase tracking-widest text-red-500">🚨 The "Rob Us" Launch Giveaway</span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400 animate-pulse">
              100% Guaranteed Win Chances
            </span>
          </div>
          <p className="text-[11px] md:text-xs text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
            We're giving away a<strong className="text-white">FREE iPhone 16 Pro</strong> or <strong className="text-white">Samsung S26 Ultra</strong> for ONE lucky subscriber! Basically, you're robbing us while we build our user base. Grab a subscription now before we come to our senses! 🤯
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 text-red-400/80">
          <Clock size={12} className="animate-pulse" />
          <span className="text-[9px] uppercase tracking-widest font-bold">Offer Ends In</span>
        </div>
        <div className="flex items-center gap-1">
          {[
            { v: timeLeft.h, label: "hr" },
            { v: timeLeft.m, label: "min" },
            { v: timeLeft.s, label: "sec" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-red-500/50 font-bold">:</span>}
              <div className="flex flex-col items-center bg-red-950/50 border border-red-500/20 rounded-lg px-2.5 py-1.5 min-w-[38px]">
                <span className="text-sm font-black text-red-400 font-mono tabular-nums">{pad(t.v)}</span>
                <span className="text-[7px] text-red-500/80 uppercase tracking-widest">{t.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function PricingShowcase() {
  return (
    <section className="bg-black text-white relative overflow-hidden font-sans">
      
    
      <div className="container mx-auto px-0 md:px-6 relative z-10 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-14 space-y-4 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
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
            Upgrade your cognitive throughput. Select a subscription tier to unlock full model capabilities.
          </motion.p>
        </div>

        {/* ── Mega Offer Banner ── */}
        <MegaOfferBanner />

        {/* Plan Cards */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-8 pb-12 md:pb-0 px-6 md:px-0 md:grid md:grid-cols-3 items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {plans.map((plan, idx) => {
            const origPrice = fakeOriginal(plan.price);
            const savedAmount = origPrice - plan.price;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col transition-all duration-300 group md:hover:-translate-y-2 shrink-0 snap-center w-[85vw] max-w-[320px] md:w-auto md:max-w-none",
                  plan.highlight 
                    ? "bg-neutral-900/40 backdrop-blur-xl border-white/10 shadow-2xl shadow-white/5 z-10" 
                    : "bg-black/40 border-white/5 hover:bg-neutral-900/40 hover:border-white/10"
                )}
              >
                

                {/* Offer corner badge */}
                <div className="absolute top-4 right-4 md:top-5 md:right-5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <Gift size={8} className="text-red-400" />
                  <span className="text-[7px] font-black text-red-400 uppercase tracking-wider">Giveaway</span>
                </div>

                {/* Plan name */}
                <div className="mb-6 md:mb-8 space-y-2 md:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{plan.name}</h3>
                    {plan.highlight && <Sparkles size={16} className="text-yellow-500" />}
                  </div>
                  <p className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-wide">{plan.desc}</p>
                </div>

                {/* Price block — with illusion */}
                <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-white/5">
                  {/* Fake higher original price — crossed out */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-neutral-600 line-through font-mono">₹{origPrice}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase">
                      -{OFFER_DISCOUNT_PCT}%
                    </span>
                  </div>
                  {/* Actual (discounted-looking) price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-white tracking-tighter">₹{plan.price}</span>
                    <span className="text-neutral-500 text-xs md:text-sm font-bold uppercase tracking-widest">/mo</span>
                  </div>
                  {/* Savings row */}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-emerald-500">✓ You save ₹{savedAmount}</span>
                    <span className="text-[10px] font-mono text-neutral-600">
                      ≈ ₹{plan.daily.toFixed(2)} / day
                    </span>
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

                {/* CTA */}
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
            );
          })}
        </div>

      </div>
    </section>
  );
}