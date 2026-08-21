"use client";

import React, { useState, useEffect } from "react";
import { Check, ArrowRight, Sparkles, Gift, ShieldCheck, Lock, RefreshCw, Zap, Crown, Loader2 } from "lucide-react";
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
    tagline: "Explore the magic with zero risk.",
    usd: { monthly: 0, yearly: 0, yearlyPerMonth: 0, saving: "" },
    inr: { monthly: 0, yearly: 0, yearlyPerMonth: 0, saving: "" },
    highlight: false,
    ctaText: "Start for Free",
    ctaHref: "/youtube-to-notes",
    features: [
      "5 video notes / day (up to 60 min/video)",
      "100 PaperChat messages / day",
      "5 quizzes & flashcard sets / day",
      "3 mind maps & diagrams / day",
      "2 AI slide decks / day (up to 8 slides)",
      "10 math & homework solves / day",
      "1 AI humanizer run / day",
      "Standard PDF & Markdown export",
    ],
  },
  {
    id: "pro",
    name: "Pro Scholar",
    badge: "⭐ Most Popular",
    tagline: "30 hours of AI study content per month.",
    usd: { monthly: 9.99, yearly: 79.99, yearlyPerMonth: 6.67, saving: "~33% off" },
    inr: { monthly: 799, yearly: 6999, yearlyPerMonth: 583, saving: "~27% off" },
    highlight: true,
    ctaText: "Get Pro Scholar",
    ctaHref: "/pricing",
    features: [
      "120 AI video notes / month (up to 4 hrs/video)",
      "2,000 PaperChat messages / month",
      "30 AI quiz & practice sets / month",
      "Unlimited flashcard sets",
      "15 mind maps & diagrams / month",
      "10 AI slide decks / month (up to 20 slides)",
      "500 math & study solves / month",
      "50 AI humanizer & essay scans / month",
      "Clean publication PDF (LaTeX + Code)",
      "Markdown + Notion + Anki export",
      "Priority cloud processing",
    ],
  },
  {
    id: "power",
    name: "Power Scholar",
    badge: "👑 Max Output",
    tagline: "100 hours of AI learning. No compromises.",
    usd: { monthly: 19.99, yearly: 149.99, yearlyPerMonth: 10.83, saving: "~37% off" },
    inr: { monthly: 1599, yearly: 12999, yearlyPerMonth: 1083, saving: "~32% off" },
    highlight: false,
    ctaText: "Get Power Scholar",
    ctaHref: "/pricing",
    features: [
      "350 AI video notes / month (up to 8 hrs/video)",
      "10,000 PaperChat messages / month",
      "Unlimited quizzes & practice sets",
      "Unlimited flashcard sets",
      "Unlimited mind maps & diagrams",
      "30 AI slide decks / month (up to 40 slides)",
      "1,500 math & study solves / month",
      "200 AI humanizer & deep essay runs / month",
      "Deep textbook-quality LaTeX PDF export",
      "Instant turbo queue — zero wait time",
      "All export formats (PDF, DOCX, PPTX, Markdown, HTML)",
    ],
  },
];

export default function PricingShowcase({ region }: { region?: string }) {
  const { pricingConfig, region: detectedRegion, loading: regionLoading } = usePricingRegion();

  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [mobileActive, setMobileActive] = useState<"free" | "pro" | "power">("pro");
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<PlanData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 font-sans">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-2 mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <Sparkles size={11} className="text-red-400" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Choose your <span className="text-[#ef4444]">learning power.</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Turn lectures, videos and study material into an AI-powered learning system.
            No hidden caps — real monthly quotas built for serious students.
          </p>
        </div>

        {/* ── Launch Banner ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#0b0b0e] border border-white/[0.08] p-3.5 sm:p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <Gift size={16} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-white">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  LAUNCH OFFER
                </span>
                <span>Get up to</span>
                <span className="text-red-400 font-bold">{maxSaving}% OFF</span>
                <span>with yearly billing</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">Lock in early pricing before window closes.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {[{ v: timeLeft.days, l: "D" }, { v: timeLeft.hours, l: "H" }, { v: timeLeft.mins, l: "M" }, { v: timeLeft.secs, l: "S" }].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-neutral-600 font-mono text-xs">:</span>}
                <div className="flex flex-col items-center w-10 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-xs font-bold text-white font-mono leading-none">{pad(item.v)}</span>
                  <span className="text-[7.5px] uppercase text-neutral-500 mt-0.5">{item.l}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Billing Toggle ─────────────────────────────────────────────────── */}
        <div className="flex justify-center mb-5">
          <div className="p-1 rounded-full bg-[#0b0b0e] border border-white/[0.08] flex items-center">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                billing === "monthly" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                billing === "yearly" ? "bg-[#ef4444] text-white shadow-sm" : "text-neutral-400 hover:text-white"
              )}
            >
              Yearly
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase",
                  billing === "yearly"
                    ? "bg-black/30 text-white"
                    : "bg-red-500/15 text-red-400 border border-red-500/20"
                )}
              >
                Save up to {maxSaving}%
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Segmented Switcher (shows one plan at a time on mobile) ── */}
        <div className="block lg:hidden mb-4">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-[#0d0d12] border border-white/[0.08] text-xs">
            {PLANS_DATA.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setMobileActive(plan.id)}
                className={cn(
                  "py-2 rounded-lg text-center transition-all cursor-pointer font-medium truncate px-1",
                  mobileActive === plan.id
                    ? plan.highlight
                      ? "bg-[#ef4444] text-white font-bold shadow-sm"
                      : "bg-white/[0.08] text-white font-bold"
                    : plan.highlight
                    ? "text-red-400 font-semibold"
                    : "text-neutral-400"
                )}
              >
                {plan.id === "free" ? "Free" : plan.id === "pro" ? "⭐ Pro" : "👑 Power"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Pricing Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {PLANS_DATA.map((plan) => {
            const isMobileVisible = mobileActive === plan.id;
            const dp = getDisplayPrice(plan.id === "free" ? "free" : (plan.id as "pro" | "power"));

            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative",
                  // On mobile only show the selected plan
                  !isMobileVisible && "hidden lg:flex",
                  plan.highlight
                    ? [
                        "bg-[#0d0c10] border-2 border-red-500/60",
                        "shadow-[0_0_40px_rgba(239,68,68,0.18)]",
                        "ring-1 ring-red-500/30",
                        "lg:scale-[1.03] lg:-translate-y-1",
                      ].join(" ")
                    : "bg-[#09090c] border border-white/[0.08] hover:border-white/[0.16]"
                )}
              >
                {/* RECOMMENDED pill */}
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ef4444] text-white text-[9px] font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1 whitespace-nowrap">
                    <Crown size={9} /> RECOMMENDED
                  </div>
                )}

                <div>
                  {/* Plan name & badge */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[17px] font-bold text-white tracking-tight">{plan.name}</h3>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider",
                        plan.highlight
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-white/[0.04] text-neutral-400 border border-white/[0.06]"
                      )}
                    >
                      {plan.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-4">{plan.tagline}</p>

                  {/* Price block — single unambiguous number */}
                  <div className="mb-5 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-end gap-2">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          {dp.bigPrice}
                        </span>
                        {plan.id !== "free" && (
                          <span className="text-xs text-neutral-400 font-medium ml-1">{dp.bigPeriod}</span>
                        )}
                      </div>
                      {dp.savingBadge && (
                        <span className="mb-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          {dp.savingBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1.5 leading-snug">{dp.sub}</p>
                  </div>

                  {/* Feature list */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                      {plan.id === "free"
                        ? "What's included"
                        : "Everything in " + (plan.id === "pro" ? "Free, plus" : "Pro, plus")}
                    </p>
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            plan.highlight
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : "bg-white/[0.06] text-neutral-300"
                          )}
                        >
                          <Check size={9} strokeWidth={3} />
                        </div>
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-5 mt-5 border-t border-white/[0.04]">
                  {plan.id === "free" ? (
                    <Link
                      href="/youtube-to-notes"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.98] bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] text-white"
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight size={12} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.98]",
                        plan.highlight
                          ? "bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_0_18px_rgba(239,68,68,0.35)]"
                          : "bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] text-white"
                      )}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Trust Badges ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/[0.06]">
          {[
            { icon: Lock, title: "256-bit SSL", sub: "Encrypted checkout" },
            { icon: RefreshCw, title: "Cancel Anytime", sub: "1-click in your profile" },
            { icon: ShieldCheck, title: "7-Day Guarantee", sub: "Full money back" },
            { icon: Zap, title: "Instant Activation", sub: "Zero wait time" },
          ].map(({ icon: Icon, title, sub }, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#09090c] border border-white/[0.06]"
            >
              <Icon size={14} className="text-neutral-400 shrink-0" />
              <div className="leading-tight min-w-0">
                <p className="text-xs font-semibold text-white truncate">{title}</p>
                <p className="text-[10px] text-neutral-400 truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}