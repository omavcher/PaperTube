"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, Gift, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function MegaOfferBanner({ className = "" }: { className?: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  // Controls visibility AFTER mount to prevent hydration flicker
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    intervalRef.current = setInterval(tick, 1000);

    // Trigger entrance animation AFTER first paint — eliminates flicker
    const t = setTimeout(() => setVisible(true), 20);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(t);
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl md:rounded-2xl border border-red-500/40
        bg-gradient-to-r from-red-950/80 via-black to-red-900/40 backdrop-blur-md
        p-3 md:p-4 flex flex-row items-center justify-between gap-3
        shadow-[0_0_40px_rgba(239,68,68,0.2)]
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        ${className}
      `}
      style={{ willChange: "opacity, transform" }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-4px) rotate(1.5deg); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.95); }
        }
        .banner-float { animation: float 3s ease-in-out infinite; }
        .dot-pulse    { animation: dotPulse 2s ease-in-out infinite; }
      `}</style>

      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/5 pointer-events-none" />

      {/* Left: Image + Text */}
      <div className="flex flex-row items-center gap-2.5 md:gap-4 relative z-10 min-w-0 flex-1">
        {/* Product Image */}
        <div className="relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/15 blur-lg rounded-full animate-pulse" />
          <Image
            src="/giveaway-products.avif"
            alt="Win iPhone 16 Pro or Samsung S26"
            width={80}
            height={80}
            className="object-contain banner-float drop-shadow-2xl relative z-10 border border-red-500/30 rounded-lg"
            priority
          />
        </div>

        {/* Text */}
        <div className="flex flex-col min-w-0">
          <div className="flex flex-row items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 leading-tight whitespace-nowrap">
              <Gift size={10} className="text-red-400" />
              Mega Giveaway
            </span>
            <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[8px] font-bold text-green-400 dot-pulse whitespace-nowrap leading-tight">
              Guaranteed Win
            </span>
          </div>

          {/* Mobile text */}
          <p className="sm:hidden text-[11px] text-neutral-300 leading-snug">
            Subscribe &amp; win an <strong className="text-white">iPhone 16 Pro!</strong>
          </p>
          {/* Desktop text */}
          <p className="hidden sm:block text-xs md:text-sm text-neutral-300 leading-relaxed font-medium pr-2 line-clamp-2">
            Win a <strong className="text-white">FREE iPhone 16 Pro</strong> or{" "}
            <strong className="text-white">Samsung S26 Ultra!</strong>{" "}
            Subscribe today and automatically enter the draw.
          </p>

          <Link
            href="/pricing"
            className="mt-1.5 w-fit inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1 rounded-md transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            Claim Now <ChevronRight size={11} />
          </Link>
        </div>
      </div>

      {/* Right: Countdown — hidden on very small screens, shown from sm+ */}
      <div className="hidden sm:flex flex-col items-center justify-center gap-1 shrink-0 relative z-10">
        <div className="flex items-center gap-1 text-red-400/90 mb-0.5">
          <Clock size={10} className="dot-pulse" />
          <span className="text-[8px] uppercase tracking-widest font-black leading-none whitespace-nowrap">Ends In</span>
        </div>
        <div className="flex items-center gap-1">
          {[
            { v: timeLeft.h, label: "Hr" },
            { v: timeLeft.m, label: "Min" },
            { v: timeLeft.s, label: "Sec" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-red-500/40 font-bold text-sm mb-2">:</span>}
              <div className="flex flex-col items-center bg-black border border-red-500/30 rounded-lg px-2 py-1 min-w-[34px] md:min-w-[44px] shadow-[inset_0_2px_8px_rgba(239,68,68,0.1)]">
                <span className="text-sm md:text-base font-black text-white font-mono tabular-nums leading-none">
                  {pad(t.v)}
                </span>
                <span className="text-[7px] text-red-500/90 uppercase tracking-widest font-bold mt-0.5 leading-none">
                  {t.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}