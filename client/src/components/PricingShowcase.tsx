"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, Zap, ShieldCheck, 
  ArrowRight, Flame, Users, Activity 
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

const plans = [
  { 
    id: "scholar", 
    name: "Scholar", 
    price: 149, 
    daily: 4.90,
    desc: "Occasional learner protocol.", 
    features: ["Model A + B Access", "90 Min Video Limit", "Cloud Save Enabled"],
    cta: "Initialize",
    slots: "84% Occupied",
    highlight: false
  },
  { 
    id: "pro", 
    name: "Pro Scholar", 
    price: 299, 
    daily: 9.90,
    desc: "Exam-ready synthesis engine.", 
    features: ["ALL 5 AI Models", "4 Hour Video Limit", "20 Batch Processing", "Priority Node Access"],
    cta: "Activate Pro",
    slots: "97% Occupied",
    highlight: true,
    popular: true
  },
  { 
    id: "power", 
    name: "Power Institute", 
    price: 599, 
    daily: 19.90,
    desc: "Research & Team grade.", 
    features: ["Enterprise AI Models", "Unlimited Video Limit", "Bulk Logic Export", "24/7 Core Support"],
    cta: "Deploy Power",
    slots: "Limited Access",
    highlight: false
  },
];

export default function PricingShowcase() {
  return (
    <section className="py-24 bg-black text-white overflow-hidden relative font-sans">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 z-0 opacity-10 [background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* --- Social Proof Header --- */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/5 border border-emerald-500/20 px-6 py-2 rounded-full flex items-center gap-3 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">8,420+ Engineers Currently Sync'd</p>
          </motion.div>

          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-6">
            NODE_<span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">PRICING</span>
          </h2>
          <p className="text-neutral-500 uppercase font-black text-xs tracking-[0.4em] max-w-lg">Upgrade your cognitive throughput. Select a subscription tier to eliminate process latency.</p>
        </div>

        {/* --- Tier Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative p-10 rounded-[3rem] border border-white/5 bg-neutral-950 flex flex-col transition-all duration-500 group hover:-translate-y-2",
                plan.highlight && "border-red-600/40 shadow-[0_0_60px_rgba(220,38,38,0.15)] bg-[#080808]"
              )}
            >
              {/* Scarcity Trigger */}
              <div className="flex items-center gap-2 mb-6">
                <Flame size={12} className={cn(plan.highlight ? "text-red-500" : "text-orange-500")} />
                <span className={cn("text-[9px] font-black uppercase tracking-widest", plan.highlight ? "text-red-500" : "text-orange-500")}>
                  {plan.slots}
                </span>
              </div>

              {plan.popular && (
                <Badge className="absolute top-10 right-10 bg-red-600 text-white font-black italic uppercase text-[8px] px-3 py-1 rounded-lg">
                  Most Deployed
                </Badge>
              )}

              <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-8 group-hover:text-red-500 transition-colors">{plan.name}</h3>

              <div className="mb-10">
                <div className="flex items-end">
                  <span className="text-6xl font-black italic tracking-tighter">₹{plan.price}</span>
                  <span className="text-neutral-700 text-xs font-bold uppercase tracking-widest ml-2 mb-2">/ mo</span>
                </div>
                <p className="text-[10px] font-bold text-neutral-600 uppercase mt-2 italic tracking-tighter">
                  Approx. ₹{plan.daily.toFixed(2)} per day
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-[11px] font-bold uppercase tracking-tight text-neutral-400 leading-tight">
                    <CheckCircle2 size={16} className="text-red-600 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Tactical CTA */}
              <Link href="/pricing">
                <button 
                  className={cn(
                    "w-full h-16 rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3",
                    plan.highlight 
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-red-900/20" 
                      : "bg-neutral-900 text-neutral-500 hover:bg-white hover:text-black"
                  )}
                >
                  {plan.cta} <ArrowRight size={18} />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* --- Trust HUD --- */}
        <div className="mt-24 flex flex-wrap justify-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700 border-t border-white/5 pt-12">
          <div className="flex items-center gap-2 font-black italic text-[10px] uppercase tracking-widest"><ShieldCheck size={16}/> Secure_Neural_Vault</div>
          <div className="flex items-center gap-2 font-black italic text-[10px] uppercase tracking-widest"><Activity size={16}/> 99.9% Uptime_Verified</div>
          <div className="flex items-center gap-2 font-black italic text-[10px] uppercase tracking-widest"><Zap size={16}/> Instant_Activation</div>
        </div>
      </div>
    </section>
  );
}