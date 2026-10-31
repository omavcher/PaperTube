"use client";

import React, { useState, useEffect } from "react";
import { Check, ArrowRight, Sparkles, Gift, ShieldCheck, Lock, RefreshCw, Zap, Crown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePricingRegion } from "@/lib/usePricingRegion";
import { getMaxYearlySaving, type PricingConfig } from "@/lib/pricingConfig";
import PaymentModal, { type BillingPeriod, type PlanPaymentInfo } from "@/components/PaymentModal";
import { AuthLoginModal } from "@/components/AuthGuard";
import api from "@/config/api";
import { toast } from "sonner";
import { trackPurchase, trackDbActivity } from "@/utils/analytics";

// ─── Pricing constants (mirrored from quotaMiddleware PLAN_PRICING) ────────────
// Free: $0 / ₹0
// Pro Scholar:   $9.99/mo | $79.99/yr  | ₹799/mo | ₹6,999/yr  → ~33% saved
// Power Scholar: $19.99/mo | $149.99/yr | ₹1,599/mo | ₹12,999/yr → ~37% saved

interface PlanData {
  id: "free" | "pro" | "power";
  name: string;
  badge: string;
  tagline: string;
  usd: { monthly: number; yearly: number; yearlyPerMonth: number; saving: string };
  inr: { monthly: number; yearly: number; yearlyPerMonth: number; saving: string };
  highlight: boolean;
  ctaText: string;
  ctaHref: string;
  features: string[];
  notFeatures?: string[];
}

const PLANS_DATA: PlanData[] = [
  {
    id: "free",
    name: "Free Tier",
    badge: "Forever Free",
    tagline: "Core AI study tools with zero risk.",
    usd: { monthly: 0, yearly: 0, yearlyPerMonth: 0, saving: "" },
    inr: { monthly: 0, yearly: 0, yearlyPerMonth: 0, saving: "" },
    highlight: false,
    ctaText: "Start for Free",
    ctaHref: "/youtube-to-notes",
    features: [
      "Core study & reasoning engine",
      "Video lecture notes & synthesis",
      "Interactive PaperChat AI tutor",
      "Smart flashcards & quiz solver",
      "Visual mind maps & diagrams",
      "Standard PDF & Markdown export",
    ],
  },
  {
    id: "pro",
    name: "Pro Scholar",
    badge: "⭐ Popular",
    tagline: "Extended access to top AI models.",
    usd: { monthly: 9.99, yearly: 79.99, yearlyPerMonth: 6.67, saving: "~33% off" },
    inr: { monthly: 799, yearly: 6999, yearlyPerMonth: 583, saving: "~27% off" },
    highlight: true,
    ctaText: "Get Pro Scholar",
    ctaHref: "/pricing",
    features: [
      "Everything in Free included",
      "Fastest, most capable AI models",
      "Deep lectures up to 4 hrs long",
      "Autonomous Agentic Workspace",
      "Keynote PPTX slides & LaTeX PDF",
      "Peak priority queue with zero wait",
    ],
  },
  {
    id: "power",
    name: "Power Scholar",
    badge: "👑 Max Power",
    tagline: "Maximum reasoning capacity & volume.",
    usd: { monthly: 19.99, yearly: 149.99, yearlyPerMonth: 10.83, saving: "~37% off" },
    inr: { monthly: 1599, yearly: 12999, yearlyPerMonth: 1083, saving: "~32% off" },
    highlight: false,
    ctaText: "Get Power Scholar",
    ctaHref: "/pricing",
    features: [
      "Everything in Pro included",
      "Maximum reasoning & output volume",
      "Course playlists up to 8 hrs long",
      "Priority Turbo Agent workflows",
      "Unlimited active-recall study suite",
      "All export formats (LaTeX, DOCX, Anki)",
    ],
  },
];

export default function PricingShowcase({ region }: { region?: string }) {
  const { pricingConfig, region: detectedRegion, loading: regionLoading } = usePricingRegion();

  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [mobileActive, setMobileActive] = useState<"free" | "pro" | "power">("pro");
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<PlanData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const planOrder: ("free" | "pro" | "power")[] = ["free", "pro", "power"];

  const handleMobileTabChange = (newPlan: "free" | "pro" | "power") => {
    if (newPlan === mobileActive) return;
    const oldIdx = planOrder.indexOf(mobileActive);
    const newIdx = planOrder.indexOf(newPlan);
    setSlideDirection(newIdx > oldIdx ? 1 : -1);
    setMobileActive(newPlan);
  };

  const touchStartX = React.useRef<number>(0);
  const touchStartY = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    // Only trigger if horizontal swipe is clearly intentional
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      const currentIdx = planOrder.indexOf(mobileActive);
      if (diffX > 0 && currentIdx < planOrder.length - 1) {
        handleMobileTabChange(planOrder[currentIdx + 1]);
      } else if (diffX < 0 && currentIdx > 0) {
        handleMobileTabChange(planOrder[currentIdx - 1]);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    api
      .get("/auth/get-profile", { headers: { Auth: token } })
      .then((r) => {
        if (r.data.success) setUser(r.data.user);
      })
      .catch(() => {});
  }, []);

  // Countdown timer (launch special)
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, mins: 42, secs: 7 });
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");

  // Dynamically compute max saving % for the billing toggle pill
  const maxSaving = getMaxYearlySaving(pricingConfig);

  /**
   * Price display — single unambiguous number:
   *   Monthly → hero = monthly price  e.g. ₹799/month
   *   Yearly  → hero = yearly total   e.g. ₹6,999/year  +  "₹583/mo · Save 27%" in subtext
   */
  const getDisplayPrice = (planId: "pro" | "power" | "free") => {
    const sym = pricingConfig.symbol;
    const fmt = pricingConfig.format;
    if (planId === "free") {
      return { bigPrice: `${sym}0`, bigPeriod: "", sub: "Forever free • No credit card needed", savingBadge: null };
    }
    const planPricing = pricingConfig.plans[planId];
    if (billing === "yearly") {
      return {
        bigPrice: `${sym}${fmt(planPricing.yearly)}`,
        bigPeriod: "/year",
        sub: `${sym}${fmt(planPricing.yearlyPerMonth)}/mo equivalent • Billed once a year`,
        savingBadge: `Save ${planPricing.yearlySavingPct}%`,
      };
    }
    return {
      bigPrice: `${sym}${fmt(planPricing.monthly)}`,
      bigPeriod: "/month",
      sub: "Billed monthly • Cancel anytime",
      savingBadge: null,
    };
  };

  const handleSelectPlan = (plan: PlanData) => {
    if (plan.id === "free") {
      window.location.href = "/youtube-to-notes";
      return;
    }
    trackDbActivity(`/pricing/checkout-click/${plan.id}/${billing}`);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setPendingPlan(plan);
      setShowLoginModal(true);
      return;
    }
    setPendingCheckoutPlan(plan);
    setShowPaymentModal(true);
  };

  const launchLemonSqueezy = async (plan: PlanData) => {
    setShowPaymentModal(false);
    setIsProcessing(true);
    trackDbActivity(`/pricing/payment-start-lemonsqueezy/${plan.id}/${billing}`);
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post(
        "/payment/lemonsqueezy/create-checkout",
        {
          planId: plan.id,
          billingPeriod: billing,
          successUrl: `${window.location.origin}/pricing?payment=success&plan=${encodeURIComponent(plan.name)}&billing=${billing}`,
          cancelUrl: `${window.location.origin}/pricing?payment=cancel`,
        },
        { headers: { Auth: token } }
      );
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Could not start checkout — please try again.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPlanCard = (plan: PlanData) => {
    const dp = getDisplayPrice(plan.id === "free" ? "free" : (plan.id as "pro" | "power"));
    const isPro = plan.id === "pro";

    return (
      <div
        key={plan.id}
        className={cn(
          "w-full rounded-[22px] sm:rounded-[24px] p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-300 relative",
          isPro
            ? "bg-white text-neutral-900 shadow-[0_20px_50px_-12px_rgba(239,68,68,0.2),0_0_30px_rgba(255,255,255,0.06)] border border-neutral-100 md:scale-[1.02] md:-translate-y-1 z-10"
            : "bg-[#121215] text-white border border-white/[0.08] hover:border-white/[0.14]"
        )}
      >
        {/* RECOMMENDED floating pill for Pro (Shown on desktop; on mobile the active tab already highlights Pro) */}
        {isPro && (
          <div className="hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ef4444] text-white text-[9px] font-black uppercase tracking-wider shadow-md items-center gap-1 whitespace-nowrap">
            <Crown size={9} /> RECOMMENDED
          </div>
        )}

        <div>
          {/* 1. Inset Top Header Box (Matching Reference Image) */}
          <div
            className={cn(
              "rounded-xl p-3 sm:p-3.5 mb-3 transition-colors",
              isPro
                ? "bg-neutral-50 border border-neutral-200/80 shadow-sm"
                : "bg-[#18181d] border border-white/[0.06]"
            )}
          >
            <div className="flex items-center justify-between mb-0.5">
              <h3
                className={cn(
                  "text-base sm:text-lg font-bold tracking-tight",
                  isPro ? "text-neutral-900" : "text-white"
                )}
              >
                {plan.name}
              </h3>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider",
                  isPro
                    ? "bg-red-500/10 text-red-600 border border-red-500/20"
                    : "bg-white/[0.05] text-neutral-400 border border-white/[0.08]"
                )}
              >
                {plan.badge}
              </span>
            </div>
            <p
              className={cn(
                "text-[11px] leading-tight truncate",
                isPro ? "text-neutral-600" : "text-neutral-400"
              )}
            >
              {plan.tagline}
            </p>
          </div>

          {/* 2. Price Block (Compact, Crisp Blur Transition) */}
          <div className="relative mb-3 min-h-[46px] flex flex-col justify-center overflow-hidden">
            {plan.id === "free" ? (
              <div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-3xl sm:text-4xl font-black tracking-tight",
                      isPro ? "text-neutral-900" : "text-white"
                    )}
                  >
                    {dp.bigPrice}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-[10px] mt-0.5 leading-tight truncate",
                    isPro ? "text-neutral-500" : "text-neutral-400"
                  )}
                >
                  {dp.sub}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${plan.id}-${billing}`}
                  initial={{
                    opacity: 0,
                    y: billing === "yearly" ? 8 : -8,
                    filter: "blur(4px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: billing === "yearly" ? -8 : 8,
                    filter: "blur(4px)",
                  }}
                  transition={{
                    duration: 0.16,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  className="w-full"
                >
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span
                      className={cn(
                        "text-3xl sm:text-4xl font-black tracking-tight",
                        isPro ? "text-neutral-900" : "text-white"
                      )}
                    >
                      {dp.bigPrice}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isPro ? "text-neutral-500" : "text-neutral-400"
                      )}
                    >
                      {dp.bigPeriod}
                    </span>
                    {dp.savingBadge && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="ml-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                      >
                        {dp.savingBadge}
                      </motion.span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-[10px] mt-0.5 leading-tight truncate",
                      isPro ? "text-neutral-500" : "text-neutral-400"
                    )}
                  >
                    {dp.sub}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* 3. Full-Width Pill CTA Button */}
          <div className="mb-3.5">
            {plan.id === "free" ? (
              <Link
                href="/youtube-to-notes"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full font-bold text-xs transition-all cursor-pointer active:scale-[0.98] bg-[#222228] hover:bg-[#2c2c34] text-white border border-white/10 shadow-sm"
              >
                <span>{plan.ctaText}</span>
                <ArrowRight size={12} />
              </Link>
            ) : (
              <button
                onClick={() => handleSelectPlan(plan)}
                className={cn(
                  "w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full font-bold text-xs transition-all cursor-pointer active:scale-[0.98] shadow-md",
                  isPro
                    ? "bg-[#ef4444] hover:bg-red-600 text-white shadow-red-500/25 hover:shadow-red-500/35"
                    : "bg-[#222228] hover:bg-[#2c2c34] text-white border border-white/10"
                )}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          {/* 4. Dotted Divider */}
          <div
            className={cn(
              "border-t border-dashed my-3",
              isPro ? "border-neutral-200" : "border-white/10"
            )}
          />

          {/* 5. Features Section Header & Circular Checkmarks */}
          <div>
            <p
              className={cn(
                "text-[9.5px] font-bold uppercase tracking-wider mb-2",
                isPro ? "text-neutral-500" : "text-neutral-400"
              )}
            >
              {plan.name.toUpperCase()} INCLUDES
            </p>

            <div className="space-y-1.5">
              {plan.features.map((f, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 text-[11px] sm:text-xs leading-none",
                    isPro ? "text-neutral-700" : "text-neutral-300"
                  )}
                >
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0",
                      isPro
                        ? "bg-neutral-200/80 text-neutral-800"
                        : "bg-white/[0.08] text-neutral-300"
                    )}
                  >
                    <Check size={8} strokeWidth={3} />
                  </div>
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to choose your plan"
        onSuccess={() => {
          setShowLoginModal(false);
          if (pendingPlan) handleSelectPlan(pendingPlan);
        }}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={pendingCheckoutPlan}
        billing={billing}
        region={detectedRegion}
        user={user}
        isLemonLoading={isProcessing}
        onLemon={() => pendingCheckoutPlan && launchLemonSqueezy(pendingCheckoutPlan)}
        onPayPalSuccess={() => {
          setShowPaymentModal(false);
          const planId = pendingCheckoutPlan?.id || "pro";
          const price =
            billing === "monthly"
              ? pendingCheckoutPlan?.usd.monthly ?? 9.99
              : pendingCheckoutPlan?.usd.yearly ?? 79.99;
          trackPurchase(planId, price);
          trackDbActivity(`/payment/success/${planId}/${billing}`);
          toast.success("Payment successful! Your plan is now active.");
          setTimeout(() => (window.location.href = "/profile"), 1500);
        }}
      />

      <section className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 font-sans">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-1 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
            <Sparkles size={10} className="text-red-400" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            Choose your <span className="text-[#ef4444]">learning power.</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-400 max-w-md mx-auto leading-normal">
            Turn lectures and study material into an AI-powered learning system.
          </p>
        </div>

        {/* ── Launch Banner (Compact High-Converting Ribbon) ─────────────────── */}
        <div 
          onClick={() => {
            if (billing !== "yearly") {
              setBilling("yearly");
              toast.success(`Yearly discount applied! You're saving up to ${maxSaving}%.`);
            }
          }}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-950/30 via-[#0e0e13]/90 to-[#0c0c10] border border-red-500/25 hover:border-red-500/40 px-3.5 py-2 mb-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 transition-all duration-300 shadow-sm cursor-pointer"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/10 blur-2xl rounded-full pointer-events-none" />

          {/* Left: Offer Details & Icon */}
          <div className="flex items-center gap-2.5 z-10 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Gift size={13} className="text-red-400" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[8.5px] font-black uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                Launch Offer
              </span>
              <span className="text-xs font-bold text-white tracking-tight">
                Save up to <span className="text-red-400 font-black">{maxSaving}% OFF</span> with yearly billing
              </span>
            </div>
          </div>

          {/* Right: Digital Countdown Ticker & Action Button */}
          <div className="flex items-center gap-2.5 z-10 shrink-0">
            {/* Countdown Blocks */}
            <div className="flex items-center gap-1">
              {[
                { v: timeLeft.days, l: "D" },
                { v: timeLeft.hours, l: "H" },
                { v: timeLeft.mins, l: "M" },
                { v: timeLeft.secs, l: "S" },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-neutral-600 font-mono text-[10px] font-bold">:</span>}
                  <div className="flex items-center gap-0.5 py-0.5 px-1.5 rounded-md bg-black/60 border border-white/[0.08]">
                    <span className="text-[11px] font-bold text-white font-mono leading-none">
                      {pad(item.v)}
                    </span>
                    <span className="text-[7.5px] uppercase text-neutral-400 font-semibold">
                      {item.l}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Quick Toggle CTA Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] group-hover:bg-red-500 text-neutral-200 group-hover:text-white text-[11px] font-semibold border border-white/10 group-hover:border-red-400 transition-all shrink-0">
              <span>{billing === "yearly" ? "Applied" : "Claim"}</span>
              <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* ── Billing Toggle ─────────────────────────────────────────────────── */}
        <div className="flex justify-center mb-4">
          <div className="relative p-0.5 rounded-full bg-[#0b0b0e] border border-white/[0.08] flex items-center">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={cn(
                "relative z-10 px-4 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer",
                billing === "monthly" ? "text-black" : "text-neutral-400 hover:text-white"
              )}
            >
              {billing === "monthly" && (
                <motion.div
                  layoutId="billing-pill-showcase"
                  className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={cn(
                "relative z-10 px-4 py-1 rounded-full text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer",
                billing === "yearly" ? "text-white" : "text-neutral-400 hover:text-white"
              )}
            >
              {billing === "yearly" && (
                <motion.div
                  layoutId="billing-pill-showcase"
                  className="absolute inset-0 bg-[#ef4444] rounded-full shadow-sm z-[-1]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span>Yearly</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase transition-colors",
                  billing === "yearly"
                    ? "bg-black/30 text-white"
                    : "bg-red-500/15 text-red-400 border border-red-500/20"
                )}
              >
                Save {maxSaving}%
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Segmented Control (Smooth Apple-Grade Switcher) ──────────── */}
        <div className="flex md:hidden justify-center mb-3.5">
          <div className="relative p-1 rounded-2xl bg-[#0e0e13] border border-white/[0.08] grid grid-cols-3 w-full max-w-xs shadow-inner">
            {PLANS_DATA.map((p) => {
              const isSelected = mobileActive === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleMobileTabChange(p.id)}
                  className={cn(
                    "relative z-10 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer select-none",
                    isSelected ? "text-white" : "text-neutral-400 hover:text-white"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="mobile-plan-pill-showcase"
                      className={cn(
                        "absolute inset-0 rounded-xl shadow-md z-[-1]",
                        p.id === "pro"
                          ? "bg-[#ef4444]"
                          : "bg-white/[0.14] border border-white/10"
                      )}
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 32,
                      }}
                    />
                  )}
                  <span>{p.id === "free" ? "Free" : p.id === "pro" ? "⭐ Pro" : "👑 Power"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mobile Active Card with Directional Slide & Swipe Gestures ──────── */}
        <div
          className="block md:hidden overflow-hidden pt-1 pb-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mobileActive}
              initial={{
                opacity: 0,
                x: slideDirection * 24,
                filter: "blur(4px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: -slideDirection * 24,
                filter: "blur(4px)",
              }}
              transition={{
                duration: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {renderPlanCard(PLANS_DATA.find((p) => p.id === mobileActive) || PLANS_DATA[1])}
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3 mb-1">
            {PLANS_DATA.map((p) => (
              <button
                key={p.id}
                onClick={() => handleMobileTabChange(p.id)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  mobileActive === p.id
                    ? p.id === "pro"
                      ? "w-6 bg-[#ef4444]"
                      : "w-5 bg-white"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                )}
                aria-label={`Go to ${p.name}`}
              />
            ))}
          </div>
        </div>

        {/* ── Desktop & Tablet (>= md): All 3 Cards Side-by-Side ────────────── */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {PLANS_DATA.map((plan) => renderPlanCard(plan))}
        </div>

        {/* ── Trust Badges (Compact) ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/[0.06]">
          {[
            { icon: Lock, title: "256-bit SSL", sub: "Encrypted checkout" },
            { icon: RefreshCw, title: "Cancel Anytime", sub: "1-click in profile" },
            { icon: ShieldCheck, title: "7-Day Guarantee", sub: "Full money back" },
            { icon: Zap, title: "Instant Access", sub: "Zero wait time" },
          ].map(({ icon: Icon, title, sub }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#09090c] border border-white/[0.06]"
            >
              <Icon size={12} className="text-neutral-400 shrink-0" />
              <div className="leading-none min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">{title}</p>
                <p className="text-[9px] text-neutral-400 truncate mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}