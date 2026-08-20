"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, ArrowRight, Sparkles, Clock, Gift, ShieldCheck, Lock, RefreshCw, Zap, Star, Crown, Sprout, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRegionConfig } from "@/lib/localization";

export default function PricingShowcase({ region }: { region?: string }) {
  const { config } = useRegionConfig(region);
  const symbol = config?.currencySymbol || "$";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, mins: 42, secs: 7 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  const convertPrice = (usd: number) => {
    if (!config) return usd;
    if (config.currency === "INR") return usd * 80;
    if (config.currency === "GBP") return Math.round(usd * 0.8);
    if (config.currency === "EUR") return Math.round(usd * 0.9);
    if (config.currency === "AUD" || config.currency === "CAD") return Math.round(usd * 1.4);
    return usd;
  };

  return (
    <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 font-sans">
      
      {/* ─── 1. HEADER ─── */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-medium uppercase tracking-wider text-neutral-400">
          <span>Simple, Transparent Pricing</span>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Invest in Smarter <span className="text-[#ef4444]">Learning.</span>
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 font-normal max-w-lg mx-auto leading-relaxed">
          Upgrade your study toolkit with instant video transcription, LaTeX formulas, presentation generation & priority AI.
        </p>
      </div>


      {/* ─── 2. LAUNCH SPECIAL OFFER BANNER ─── */}
      <div className="rounded-2xl bg-[#09090c] border border-white/[0.08] p-4 sm:p-5 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Gift Icon + Copy */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-200 shrink-0">
            <Gift size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm font-semibold text-white">
              <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                LIMITED OFFER
              </span>
              <span>Launch Special — Get up to</span>
              <span className="text-red-400 font-bold">40% OFF</span>
              <span>on yearly plans</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Lock in early pricing before the launch window closes.
            </p>
          </div>
        </div>

        {/* Right Side: 4 Countdown Boxes */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex flex-col items-center justify-center w-11 sm:w-13 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs sm:text-sm font-bold text-white font-mono leading-none">{pad(timeLeft.days)}</span>
            <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">DAYS</span>
          </div>
          <span className="text-neutral-600 font-mono text-xs">:</span>
          <div className="flex flex-col items-center justify-center w-11 sm:w-13 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs sm:text-sm font-bold text-white font-mono leading-none">{pad(timeLeft.hours)}</span>
            <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">HRS</span>
          </div>
          <span className="text-neutral-600 font-mono text-xs">:</span>
          <div className="flex flex-col items-center justify-center w-11 sm:w-13 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs sm:text-sm font-bold text-white font-mono leading-none">{pad(timeLeft.mins)}</span>
            <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">MINS</span>
          </div>
          <span className="text-neutral-600 font-mono text-xs">:</span>
          <div className="flex flex-col items-center justify-center w-11 sm:w-13 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs sm:text-sm font-bold text-white font-mono leading-none">{pad(timeLeft.secs)}</span>
            <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5">SECS</span>
          </div>
        </div>

      </div>


      {/* ─── 3. BILLING TOGGLE (MONTHLY VS YEARLY) ─── */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="p-1 rounded-full bg-[#09090c] border border-white/[0.08] flex items-center shadow-sm">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-4 sm:px-5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
              billingCycle === "monthly"
                ? "bg-white/[0.1] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-4 sm:px-5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              billingCycle === "yearly"
                ? "bg-[#ef4444] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <span>Yearly</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wide",
              billingCycle === "yearly" ? "bg-black/30 text-white" : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              Save 40%
            </span>
          </button>
        </div>
      </div>


      {/* ─── 4. PRICING CARDS (3 TIERS) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        
        {/* ── TIER 1: FREE ── */}
        <div className="rounded-2xl bg-[#09090c] border border-white/[0.07] hover:border-white/[0.14] p-5 sm:p-7 flex flex-col justify-between shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Free</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[8.5px] font-semibold uppercase tracking-wider text-neutral-400">
                FOREVER FREE
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-5">For casual learners</p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">{symbol}0</span>
                <span className="text-xs text-neutral-400 font-medium">/month</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-normal mt-1">
                No credit card required
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
              {[
                "3 video notes per day (up to 45 min)",
                "2 AI slide decks per day (up to 8 slides)",
                "5 quizzes & flashcard sets per day",
                "5 homework & math proof solves per day",
                "Standard Markdown & PDF summary export",
                "Web & mobile workspace access"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-300">
                  <div className="w-4 h-4 rounded-full bg-white/[0.04] flex items-center justify-center text-neutral-300 shrink-0">
                    <Check size={11} strokeWidth={2.5} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-6 mt-6 border-t border-white/[0.04]">
            <Link
              href="/youtube-to-notes"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>


        {/* ── TIER 2: PRO (MOST POPULAR) ── */}
        <div className="rounded-2xl bg-[#09090c] border border-red-500/35 hover:border-red-500/50 p-5 sm:p-7 flex flex-col justify-between relative shadow-sm transition-all group">
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Pro Scholar</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8.5px] font-semibold uppercase tracking-wider text-red-400">
                MOST POPULAR
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-5">
              For active students & daily learners
            </p>

            <div className="mb-6">
              {billingCycle === "yearly" ? (
                <>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-neutral-500 line-through font-medium">
                      {symbol}{convertPrice(15)}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-semibold text-red-400">
                      Save 40%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{symbol}{convertPrice(9)}</span>
                    <span className="text-xs text-neutral-400 font-medium">/month</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-normal mt-1">
                    Billed annually ({symbol}{convertPrice(108)}/year)
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{symbol}{convertPrice(15)}</span>
                    <span className="text-xs text-neutral-400 font-medium">/month</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-normal mt-1">
                    Billed monthly • Cancel anytime
                  </p>
                </>
              )}
            </div>

            {/* Features List */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
              {[
                "120 AI video notes / month (up to 4 hrs / video)",
                "60 AI slide decks / month (up to 20 slides)",
                "250 AI quizzes & flashcard sets / month",
                "500 AI homework & math proofs / month",
                "50 AI humanizer & essay scans / month",
                "Publication-quality PDF export (LaTeX + Code)",
                "Priority cloud processing queue",
                "Direct Notion, Markdown & Anki export"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <div className="w-4 h-4 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
                    <Check size={11} strokeWidth={2.5} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-6 mt-6 border-t border-white/[0.04]">
            <Link
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium text-xs shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <span>Upgrade to Pro Scholar</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>


        {/* ── TIER 3: POWER ── */}
        <div className="rounded-2xl bg-[#09090c] border border-white/[0.07] hover:border-white/[0.14] p-5 sm:p-7 flex flex-col justify-between shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Power Scholar</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[8.5px] font-semibold uppercase tracking-wider text-neutral-400">
                POWER USERS
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-5">
              For intensive researchers, grad students & creators
            </p>

            <div className="mb-6">
              {billingCycle === "yearly" ? (
                <>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-neutral-500 line-through font-medium">
                      {symbol}{convertPrice(29)}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-semibold text-purple-400">
                      Save 34%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{symbol}{convertPrice(19)}</span>
                    <span className="text-xs text-neutral-400 font-medium">/month</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-normal mt-1">
                    Billed annually ({symbol}{convertPrice(228)}/year)
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{symbol}{convertPrice(29)}</span>
                    <span className="text-xs text-neutral-400 font-medium">/month</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-normal mt-1">
                    Billed monthly • Cancel anytime
                  </p>
                </>
              )}
            </div>

            {/* Features List */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
              {[
                "350 AI video notes / month (up to 12 hrs / video)",
                "180 AI slide decks / month (up to 40 slides)",
                "800 AI quizzes & flashcard sets / month",
                "1,500 AI study, LaTeX calculus & language drills / month",
                "200 AI humanizer, plagiarism & essay runs / month",
                "Complete playlist bulk processing (full course)",
                "Instant turbo queue — zero wait time",
                "24/7 dedicated scholar support"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-300">
                  <div className="w-4 h-4 rounded-full bg-white/[0.04] flex items-center justify-center text-neutral-300 shrink-0">
                    <Check size={11} strokeWidth={2.5} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-6 mt-6 border-t border-white/[0.04]">
            <Link
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs transition-all cursor-pointer"
            >
              <span>Get Power Scholar</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>


      {/* ─── 5. BOTTOM ROW: 4 TRUST & GUARANTEE BADGES ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#09090c] border border-white/[0.06]">
          <Lock size={15} className="text-neutral-400 shrink-0" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-white">Secure 256-bit SSL</p>
            <p className="text-[10px] text-neutral-400">Encrypted checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#09090c] border border-white/[0.06]">
          <RefreshCw size={15} className="text-neutral-400 shrink-0" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-white">Cancel Anytime</p>
            <p className="text-[10px] text-neutral-400">1-click cancellation</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#09090c] border border-white/[0.06]">
          <ShieldCheck size={15} className="text-neutral-400 shrink-0" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-white">7-Day Guarantee</p>
            <p className="text-[10px] text-neutral-400">Full money back</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#09090c] border border-white/[0.06]">
          <Zap size={15} className="text-neutral-400 shrink-0" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-white">Instant Activation</p>
            <p className="text-[10px] text-neutral-400">Start learning in seconds</p>
          </div>
        </div>
      </div>

    </section>
  );
}