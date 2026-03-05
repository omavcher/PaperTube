"use client";

import React, { useState, useEffect } from "react";
import { Clock, Gift } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MegaOfferBanner({ className = "" }: { className?: string }) {
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
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-rose-500/10 backdrop-blur-xl p-5 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] ${className}`}
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 pointer-events-none" />

      {/* Left label */}
      <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
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
          <p className="text-[11px] md:text-xs text-neutral-300 mt-1.5 max-w-2xl leading-relaxed font-medium">
            We're giving away a <strong className="text-white">FREE iPhone 16 Pro</strong> or <strong className="text-white">Samsung S26 Ultra</strong> to ONE lucky new subscriber as a launch celebration! You're basically robbing us while we build our user base. <Link href="/pricing" className="text-red-400 underline decoration-red-400/50 hover:text-red-300">Grab a subscription</Link> now before we come to our senses! 🤯
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-3 shrink-0 relative z-10">
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
              {i > 0 && <span className="text-red-500/50 font-bold text-sm">:</span>}
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
