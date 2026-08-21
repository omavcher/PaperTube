"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Zap, Crown, Check, ArrowRight, ShieldCheck, Clock, 
  AlertTriangle, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePricingRegion } from "@/lib/usePricingRegion";
import { getPricingConfig, getMaxYearlySaving } from "@/lib/pricingConfig";
import Link from "next/link";

export interface QuotaErrorInfo {
  code?: string;
  feature?: string;
  featureLabel?: string;
  used?: number;
  limit?: number;
  plan?: string;
  planId?: string;
  period?: string;
  maxAllowedMin?: number;
  durationMin?: number;
  message?: string;
}

interface QuotaPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorInfo?: QuotaErrorInfo | null;
}

export default function QuotaPaywallModal({
  isOpen,
  onClose,
  errorInfo
}: QuotaPaywallModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const { region } = usePricingRegion();

  if (!isOpen) return null;

  const config = getPricingConfig(region);
  const maxSavings = getMaxYearlySaving(config);
  const isVideoLengthError = errorInfo?.code === "VIDEO_TOO_LONG";
  const isPowerFeature = errorInfo?.code === "POWER_FEATURE_REQUIRED" || errorInfo?.planId === "pro";

  const proPrice = billingPeriod === "monthly" 
    ? `${config.symbol}${config.format(config.plans.pro.monthly)}` 
    : `${config.symbol}${config.format(config.plans.pro.yearly)}`;

  const powerPrice = billingPeriod === "monthly" 
    ? `${config.symbol}${config.format(config.plans.power.monthly)}` 
    : `${config.symbol}${config.format(config.plans.power.yearly)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden z-10 text-white"
        >
          {/* Ambient Background Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/15 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header / Notice */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              {isVideoLengthError ? <Clock size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div className="pr-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                {isVideoLengthError ? "Video Duration Limit" : "Quota Allowance Reached"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {isVideoLengthError ? "Video Exceeds Free Plan Length" : "Upgrade to Continue Generating"}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {errorInfo?.message || "You have reached your current plan usage limit. Upgrade your subscription to unlock high-volume generation, longer video processing, and priority speed."}
              </p>
            </div>
          </div>

          {/* Billing Period Selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="p-1 rounded-xl bg-black/60 border border-white/5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  billingPeriod === "monthly" ? "bg-white text-black font-black shadow-md" : "text-neutral-400 hover:text-white"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  billingPeriod === "yearly" ? "bg-white text-black font-black shadow-md" : "text-neutral-400 hover:text-white"
                )}
              >
                <span>Yearly</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                  Save {maxSavings}%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Upgrade Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Pro Scholar Card */}
            <div className={cn(
              "p-5 rounded-2xl border transition-all flex flex-col justify-between relative",
              !isPowerFeature 
                ? "bg-[#140b0d] border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30" 
                : "bg-black/40 border-white/5 hover:border-white/10"
            )}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <Crown size={14} className="text-yellow-400" /> Pro Scholar
                  </span>
                  {!isPowerFeature && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-mono font-extrabold uppercase">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-black text-white">{proPrice}</span>
                  <span className="text-xs text-neutral-400 font-medium">/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1.5 mb-4">
                  <li className="flex items-center gap-2"><Check size={12} className="text-red-400 shrink-0" /> 120 AI Video Notes / mo (4 hrs max)</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-red-400 shrink-0" /> 10 Slide Decks (up to 20 slides)</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-red-400 shrink-0" /> 2,000 PaperChat Messages / mo</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-red-400 shrink-0" /> Unlimited Flashcards & 30 Quizzes</li>
                </ul>
              </div>

              <Link
                href="/pricing"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-10 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5"
              >
                <span>Upgrade to Pro Scholar</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Power Scholar Card */}
            <div className={cn(
              "p-5 rounded-2xl border transition-all flex flex-col justify-between relative",
              isPowerFeature 
                ? "bg-[#140b0d] border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30" 
                : "bg-black/40 border-white/5 hover:border-white/10"
            )}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <Sparkles size={14} className="text-purple-400" /> Power Scholar
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-black text-white">{powerPrice}</span>
                  <span className="text-xs text-neutral-400 font-medium">/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1.5 mb-4">
                  <li className="flex items-center gap-2"><Check size={12} className="text-emerald-400 shrink-0" /> 350 AI Video Notes / mo (8 hrs max)</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-emerald-400 shrink-0" /> 30 Slide Decks (up to 40 slides)</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-emerald-400 shrink-0" /> 10,000 PaperChat Messages / mo</li>
                  <li className="flex items-center gap-2"><Check size={12} className="text-emerald-400 shrink-0" /> Instant Turbo Processing Queue</li>
                </ul>
              </div>

              <Link
                href="/pricing"
                className="w-full bg-white/[0.08] hover:bg-white text-white hover:text-black font-bold text-xs h-10 rounded-xl transition-all active:scale-98 flex items-center justify-center gap-1.5"
              >
                <span>Upgrade to Power Scholar</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] text-neutral-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Instant activation • Cancel anytime</span>
            </div>
            <Link
              href="/pricing"
              className="text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              Compare full plan features →
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
