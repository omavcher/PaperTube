"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Sparkles, 
  Zap, 
  Brain, 
  Image as ImageIcon, 
  ArrowRight, 
  Clock, 
  ShieldCheck,
  Check,
  Layers,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import PaymentModal, { type BillingPeriod, type PlanPaymentInfo } from "@/components/PaymentModal";
import { usePricingRegion } from "@/lib/usePricingRegion";
import { trackPurchase, trackDbActivity } from "@/utils/analytics";

interface CapacityInfo {
  percentage: number;
  remainingPercentage: number;
  status: "optimal" | "high" | "critical" | "exceeded";
  planId: string;
  planName: string;
  period: string;
  resetsAt: string | null;
  isExceeded: boolean;
  message?: string;
  isGuest?: boolean;
}

const PRO_PLAN: PlanPaymentInfo = {
  id: "pro",
  name: "Pro Scholar",
  usd: { monthly: 9.99, yearly: 79.99, yearlyPerMonth: 6.67, saving: "~33% off" },
  inr: { monthly: 799, yearly: 6999, yearlyPerMonth: 583, saving: "~27% off" },
};

export function StudentQuotaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [isLemonLoading, setIsLemonLoading] = useState(false);
  const { region } = usePricingRegion();
  const isIndia = region === "IN";

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e?.detail) {
        const d = e.detail;
        const pct = typeof d.percentage === "number" ? d.percentage : 100;
        const exceeded = Boolean(
          d.isExceeded === true || 
          pct >= 100 || 
          d.status === "exceeded" || 
          d.code === "QUOTA_EXCEEDED" || 
          d.code === "PLAN_LIMIT_REACHED"
        );

        setCapacity({
          percentage: pct,
          remainingPercentage: typeof d.remainingPercentage === "number" ? d.remainingPercentage : Math.max(0, 100 - pct),
          status: d.status || (exceeded ? "exceeded" : "optimal"),
          planId: d.planId || "free",
          planName: d.planName || "Free Plan",
          period: d.period || "daily",
          resetsAt: d.resetsAt || "Tonight at 00:00 UTC",
          isExceeded: exceeded,
          message: d.message,
          isGuest: Boolean(d.isGuest)
        });
      } else {
        fetchCapacity();
      }
      setIsOpen(true);
    };

    window.addEventListener("open-capacity-modal", handleOpen as EventListener);
    return () => {
      window.removeEventListener("open-capacity-modal", handleOpen as EventListener);
    };
  }, []);

  const fetchCapacity = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/capacity");
      if (res.data?.success && res.data?.data) {
        setCapacity(res.data.data);
      }
    } catch {
      setCapacity({
        percentage: 0,
        remainingPercentage: 100,
        status: "optimal",
        planId: "free",
        planName: "Free Plan",
        period: "daily",
        resetsAt: "Tonight at 00:00 UTC",
        isExceeded: false,
        isGuest: true
      });
    } finally {
      setLoading(false);
    }
  };

  const isExceeded = Boolean(capacity?.isExceeded || (capacity?.percentage !== undefined && capacity.percentage >= 100));
  const percentage = capacity?.percentage ?? (isExceeded ? 100 : 0);
  const remainingPercentage = capacity?.remainingPercentage ?? Math.max(0, 100 - percentage);

  // Dynamic price calculation
  const priceLabel = isIndia
    ? (billingPeriod === "monthly" ? "₹799/mo" : "₹583/mo")
    : (billingPeriod === "monthly" ? "$9.99/mo" : "$6.67/mo");

  const billingSubtext = isIndia
    ? (billingPeriod === "monthly" ? "Billed monthly · Cancel anytime" : "Billed ₹6,999 annually · Save 27%")
    : (billingPeriod === "monthly" ? "Billed monthly · Cancel anytime" : "Billed $79.99 annually · Save 33%");

  const handleUpgradeClick = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setIsOpen(false);
      window.dispatchEvent(new Event("open-login"));
      toast.info("Please sign in to unlock Pro Scholar.");
      return;
    }

    setIsOpen(false);
    setShowPaymentModal(true);
  };

  const launchLemonSqueezy = async () => {
    setShowPaymentModal(false);
    setIsLemonLoading(true);
    trackDbActivity(`/pricing/payment-start-lemonsqueezy/pro/${billingPeriod}`);
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post(
        "/payment/lemonsqueezy/create-checkout",
        {
          planId: "pro",
          billingPeriod: billingPeriod,
          successUrl: `${window.location.origin}/pricing?payment=success&plan=Pro%20Scholar&billing=${billingPeriod}`,
          cancelUrl: `${window.location.origin}/pricing?payment=cancel`
        },
        { headers: { Auth: token } }
      );
      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Could not start checkout — please try again.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Checkout failed");
    } finally {
      setIsLemonLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none overflow-y-auto">
            {/* Matte Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* ════════════════════════════════════════════════════════════════
                APPLE-INSPIRED INSPECTOR SHEET:
                - Desktop/Laptop (sm: / lg:): Dual-pane horizontal layout
                - Mobile (< sm): Smooth iOS bottom sheet drawer
                - Architectural, reduced border-radii (rounded-2xl)
                - No puffy AI slop glows or radioactive fuzzy blobs
            ════════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={cn(
                "relative w-full max-w-3xl overflow-hidden text-white z-10",
                "bg-[#0d0d12] border border-white/[0.1] shadow-[0_25px_80px_rgba(0,0,0,0.95)]",
                "rounded-t-2xl sm:rounded-2xl flex flex-col sm:flex-row max-h-[94vh] sm:max-h-none"
              )}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-3.5 right-3.5 z-30 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>

              {/* Mobile Drag Indicator Bar */}
              <div className="sm:hidden w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

              {/* ─────────────────────────────────────────────────────────────
                  LEFT PANE (Desktop Widescreen / Mobile Top Header):
                  Apple Precision Capacity Meter & Key Spec Status
              ───────────────────────────────────────────────────────────── */}
              <div className="sm:w-[38%] bg-[#101017] p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-white/[0.07] flex flex-col justify-between shrink-0">
                <div>
                  {/* Brand & Mini Badge */}
                  <div className="flex items-center justify-between sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold tracking-tight text-white">
                        Paperxify
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">/</span>
                      <span className="text-[10.5px] font-mono uppercase tracking-wider text-neutral-400">
                        Capacity
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-medium border mt-0 sm:mt-3.5">
                      {isExceeded ? (
                        <span className="flex items-center gap-1.5 text-rose-400 border-rose-500/20 bg-rose-500/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Limit Reached
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Optimal Flow
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Apple Precision Ring Meter */}
                  <div className="my-4 sm:my-6 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90 transform" viewBox="0 0 36 36">
                        {/* Thin Background Track */}
                        <path
                          className="text-white/[0.07]"
                          strokeWidth="2.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Active Progress Track */}
                        <path
                          className={cn(
                            "transition-all duration-700 ease-out stroke-current",
                            percentage >= 90 ? "text-rose-500" : percentage >= 70 ? "text-amber-400" : "text-emerald-400"
                          )}
                          strokeWidth="2.8"
                          strokeDasharray={`${Math.min(100, Math.max(percentage === 0 ? 0 : 3, percentage))}, 100`}
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>

                      {/* Center Gauge Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white leading-none">
                          {percentage}%
                        </span>
                        <span className="text-[8.5px] uppercase tracking-wider text-neutral-400 font-mono mt-0.5">
                          {isExceeded ? "Capacity" : "Used"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apple System Spec List (Desktop Inspector style) */}
                <div className="space-y-1.5 text-[11px] font-sans border-t border-white/[0.06] pt-3.5 mt-2 hidden sm:block">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Plan</span>
                    <span className="font-medium text-white">{capacity?.planName || "Free Tier"}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Remaining</span>
                    <span className="font-mono text-white">{remainingPercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Cycle Reset</span>
                    <span className="text-neutral-300 truncate max-w-[140px] text-right">
                      {capacity?.resetsAt || "Tonight 00:00 UTC"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  RIGHT PANE:
                  High-converting, Apple-Minimalist Offer & Action Panel
              ───────────────────────────────────────────────────────────── */}
              <div className="sm:w-[62%] p-5 sm:p-6 bg-[#0c0c11] flex flex-col justify-between overflow-y-auto">
                <div>
                  {/* Headline */}
                  <div className="pr-6">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                      {isExceeded
                        ? "Daily AI Capacity Reached"
                        : "Elevate Your Study Capacity"}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {isExceeded
                        ? "You've powered through your free daily capacity. Upgrade to Pro Scholar to continue studying without queue delays."
                        : `You have ${remainingPercentage}% capacity remaining on your current tier. Upgrade anytime to unlock 15x more queries and deep reasoning.`}
                    </p>
                  </div>

                  {/* Apple Segmented Control (Monthly vs Annual Toggle) */}
                  <div className="mt-4 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setBillingPeriod("monthly")}
                      className={cn(
                        "flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-all cursor-pointer text-center",
                        billingPeriod === "monthly"
                          ? "bg-white/[0.12] text-white shadow-sm font-semibold"
                          : "text-neutral-400 hover:text-white"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingPeriod("yearly")}
                      className={cn(
                        "flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center",
                        billingPeriod === "yearly"
                          ? "bg-white/[0.12] text-white shadow-sm font-semibold"
                          : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <span>Yearly</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        Save 30%
                      </span>
                    </button>
                  </div>

                  {/* 4 Crisp Feature Items (Refined, no slop) */}
                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <div className="p-1 rounded-md bg-white/[0.06] text-neutral-300 shrink-0 mt-0.5">
                        <Zap size={13} className="text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white">Extended AI Study Capacity</div>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                          10x capacity for deep video lectures, complex coursework, and autonomous agent tasks.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <div className="p-1 rounded-md bg-white/[0.06] text-neutral-300 shrink-0 mt-0.5">
                        <Brain size={13} className="text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white">Deep Reasoning Access</div>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                          Access to our fastest and most capable reasoning models for complex derivations.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <div className="p-1 rounded-md bg-white/[0.06] text-neutral-300 shrink-0 mt-0.5">
                        <ImageIcon size={13} className="text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white">High-Resolution Concept Artwork</div>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                          High-definition visual concept diagrams embedded directly in notes and whiteboards.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <div className="p-1 rounded-md bg-white/[0.06] text-neutral-300 shrink-0 mt-0.5">
                        <Sparkles size={13} className="text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white">Priority Cloud Queue</div>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                          Zero wait times during peak study hours with dedicated cloud inference.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action CTA Block */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
                  <button
                    type="button"
                    onClick={handleUpgradeClick}
                    className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium text-xs shadow-sm hover:shadow transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span className="font-semibold">Upgrade to Pro Scholar</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11.5px] font-mono">
                      <span>{priceLabel}</span>
                      <ArrowRight size={13} />
                    </div>
                  </button>

                  <div className="flex items-center justify-between px-1 text-[10.5px] text-neutral-400">
                    <span>{billingSubtext}</span>
                    <a
                      href="/pricing"
                      onClick={() => setIsOpen(false)}
                      className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer shrink-0 ml-2"
                    >
                      All plans →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Production In-App Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={PRO_PLAN}
        billing={billingPeriod}
        region={region}
        onLemon={launchLemonSqueezy}
        onPayPalSuccess={() => {
          setShowPaymentModal(false);
          trackPurchase("pro", billingPeriod === "monthly" ? 9.99 : 79.99);
          trackDbActivity(`/payment/success/pro/${billingPeriod}`);
          toast.success("Payment successful! Pro Scholar is now active.");
          window.dispatchEvent(new Event("capacity-updated"));
          setTimeout(() => window.location.href = "/profile", 1200);
        }}
        isLemonLoading={isLemonLoading}
        user={user}
      />
    </>
  );
}
export default StudentQuotaModal;
