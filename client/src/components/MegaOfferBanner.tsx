"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, Gift, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Using Next.js optimized image

export default function MegaOfferBanner({ className = "" }: { className?: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      style={{
        animation: "bannerFadeIn 0.5s ease-out forwards",
        opacity: 0,
      }}
      // Reduced padding and gaps on mobile to save height
      className={`relative overflow-hidden rounded-xl md:rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/80 via-black to-red-900/40 backdrop-blur-md p-2.5 md:p-4 mb-6 md:mb-10 flex flex-col xl:flex-row items-center justify-between gap-2.5 xl:gap-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] ${className}`}
    >
      <style>{`
        @keyframes bannerFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-4px) rotate(1.5deg); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.95); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .dot-pulse   { animation: dotPulse 2s ease-in-out infinite; }
      `}</style>

      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/5 pointer-events-none" />

      {/* Left Section: Product Image + Text */}
      <div className="flex flex-row items-center text-left gap-2.5 md:gap-5 relative z-10 w-full xl:w-auto">
        
        {/* Visual Hook: The Product Image Container (Reduced height on mobile) */}
        <div className="relative shrink-0 w-14 h-14 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Glowing backdrop for the image */}
          <div className="absolute inset-0 bg-red-500/15 blur-lg rounded-full animate-pulse" />
          
          <Image 
            src="/giveaway-products.avif" // Replace with your actual image path
            alt="Win iPhone 16 Pro or Samsung S26"
            // Keeping desktop optimized sizes, Tailwind classes on container control mobile size
            width={120} 
            height={120}
            className="object-contain animate-float drop-shadow-2xl relative z-10 border border-red-500/30 rounded-lg sm:rounded-xl"
            priority
          />
        </div>

        <div className="flex flex-col items-start w-full justify-center">
          <div className="flex flex-row items-center gap-1.5 flex-wrap mb-0.5">
            <span className="text-[9px] md:text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 leading-tight">
              <Gift size={12} className="text-red-400" />
              Mega Giveaway
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[8px] md:text-[10px] font-bold text-green-400 dot-pulse shadow-sm whitespace-nowrap leading-tight">
              Guaranteed Win
            </span>
          </div>

          {/* Desktop/Tablet text (Hidden on small screens) */}
          <p className="hidden sm:block text-sm text-neutral-300 mt-1 max-w-xl leading-relaxed font-medium pr-2">
            Win a <strong className="text-white text-base">FREE iPhone 16 Pro</strong> or <strong className="text-white text-base">Samsung S26 Ultra!</strong> Subscribe today and automatically enter the draw. Don't miss out!
          </p>

          {/* Mobile concise text (Tighter leading) */}
          <p className="sm:hidden text-xs text-neutral-300 mt-0.5 pr-2 leading-tight">
            Subscribe & win an <strong className="text-white">iPhone 16 Pro!</strong>
          </p>

          {/* Action Link (Reduced padding on mobile) */}
          <Link href="/pricing" className="mt-1.5 sm:mt-3 inline-flex items-center gap-1 text-[11px] sm:text-sm font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]">
            Claim Offer Now <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Right Section: Countdown Timer (More compact on mobile) */}
      <div className="flex flex-col items-center sm:items-end justify-center gap-1 shrink-0 relative z-10 w-full xl:w-auto pt-2 xl:pt-0 border-t border-red-500/15 xl:border-0">
        <div className="flex items-center gap-1 text-red-400/90 mb-0.5">
          <Clock size={12} className="dot-pulse" />
          <span className="text-[9px] sm:text-xs uppercase tracking-widest font-black leading-none">Offer Ends In</span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[
            { v: timeLeft.h, label: "Hours" },
            { v: timeLeft.m, label: "Mins" },
            { v: timeLeft.s, label: "Secs" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-1 sm:gap-1.5">
              {i > 0 && <span className="text-red-500/40 font-bold text-base mb-3 sm:text-lg sm:mb-4">:</span>}
              {/* Reduced height, padding, and font size on mobile boxes */}
              <div className="flex flex-col items-center bg-black border border-red-500/30 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 min-w-[38px] sm:min-w-[55px] shadow-[inset_0_2px_8px_rgba(239,68,68,0.1)]">
                <span className="text-base sm:text-xl font-black text-white font-mono tabular-nums leading-none">
                  {pad(t.v)}
                </span>
                <span className="text-[7px] sm:text-[9px] text-red-500/90 uppercase tracking-widest font-bold mt-1 sm:mt-1.5 leading-none">
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