"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, X, ArrowRight, Zap, ShieldCheck, Activity,
  Sparkles, Star, Lock, Loader2, ChevronDown,
  BarChart3, Crown, Check, BadgeCheck,
  Play, FileText, Layers, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { AuthLoginModal } from "@/components/AuthGuard";
import { trackPurchase, trackDbActivity } from "@/utils/analytics";
import { usePricingRegion } from "@/lib/usePricingRegion";
import PaymentModal, { type BillingPeriod } from "@/components/PaymentModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: "free" | "pro" | "power";
  name: string;
  badge: string;
  tagline: string;
  usd: { monthly: number; yearly: number; yearlyPerMonth: number; saving: string };
  inr: { monthly: number; yearly: number; yearlyPerMonth: number; saving: string };
  cta: string;
  ctaFree?: boolean;
  highlight: boolean;
  features: string[];
}

// ─── Plan Data (mirrored from quotaMiddleware PLAN_QUOTAS / PLAN_PRICING) ─────
// Free:          $0 / ₹0
// Pro Scholar:   $9.99/mo | $79.99/yr | ₹799/mo | ₹6,999/yr
// Power Scholar: $19.99/mo | $149.99/yr | ₹1,599/mo | ₹12,999/yr
const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free Tier",
    badge: "Forever Free",
    tagline: "Core AI study tools with zero risk.",
    usd: { monthly: 0, yearly: 0, yearlyPerMonth: 0, saving: "" },
    inr: { monthly: 0, yearly: 0, yearlyPerMonth: 0, saving: "" },
    cta: "Start for free",
    ctaFree: true,
    highlight: false,
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
    cta: "Get Pro Scholar",
    highlight: true,
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
    cta: "Get Power Scholar",
    highlight: false,
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

// ─── Comparison Table ─────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { feature: "AI Study Capacity",        free: "Standard Daily", pro: "10x Extended", power: "30x Maximum" },
  { feature: "Max Lecture Length",       free: "Up to 60 min",   pro: "Up to 4 hours", power: "Up to 8 hours" },
  { feature: "Autonomous Agent & Tools", free: "Standard Agent", pro: "All 7 Live Apps", power: "Priority Turbo Agent" },
  { feature: "Visual Studio (AI Images)",free: "Concept Previews",pro: "High-Res Studio", power: "Expanded Creative Suite" },
  { feature: "PaperChat Video Tutor",    free: "Standard",       pro: "High Volume",  power: "Priority Unlimited" },
  { feature: "Interactive Slide Decks",  free: "Basic (8 slides)", pro: "Pro (20 slides)", power: "Executive (40 slides)" },
  { feature: "AI Quizzes & Tests",       free: "Daily practice", pro: "Extended",     power: "Unlimited" },
  { feature: "Flashcards & Mind Maps",   free: "Standard",       pro: "Unlimited",    power: "Unlimited" },
  { feature: "LaTeX Publication PDF",    free: false,            pro: true,           power: true },
  { feature: "Notion & Anki Export",     free: false,            pro: true,           power: true },
  { feature: "DOCX & PPTX Export",       free: false,            pro: false,          power: true },
  { feature: "Processing Queue Speed",   free: "Standard",       pro: "Priority GPU", power: "Instant Turbo" },
];

const FAQS = [
  { q: "How is '30 hours of AI content' measured?",
    a: "Pro Scholar gives you 120 video note generations per month. Each generation typically processes 10–15 minutes of lecture, adding up to roughly 20–30 hours of lecture content processed — hence '30 hours of AI study content.'" },
  { q: "Can I cancel anytime?",
    a: "Yes. Cancel with one click from your profile. Your access continues until the end of your paid billing period." },
  { q: "Do 'Unlimited' features really have no limit?",
    a: "Unlimited flashcards and quizzes in Pro/Power are genuinely unlimited — these are very low AI cost operations. Heavy features like video notes and PPTs have monthly caps to protect our margins and keep prices fair." },
  { q: "What payment methods are supported?",
    a: "We support PayPal (credit/debit cards, PayPal balance) and LemonSqueezy (Visa, Mastercard, American Express). All global and domestic cards are accepted." },
  { q: "Do you offer student discounts?",
    a: "Students with a verified .edu email receive a 50% discount on Pro Scholar. Sign up with your .edu address to receive the discount automatically." },
  { q: "Is the yearly plan auto-renewing?",
    a: "Monthly plans are auto-renewing subscriptions. Yearly plans are one-time annual access payments with no automatic renewal — you choose to renew manually." },
];

// ─── Cell renderer for comparison table ──────────────────────────────────────
function CellValue({ val, isPro }: { val: boolean | string; isPro?: boolean }) {
  if (typeof val === "boolean") return val
    ? <CheckCircle2 size={14} className={cn("mx-auto", isPro ? "text-red-400" : "text-emerald-400")} />
    : <X size={12} className="text-neutral-700 mx-auto" />;
  return <span className={cn("text-xs font-semibold", isPro ? "text-red-400" : "text-neutral-300")}>{val}</span>;
}

// ─── Main Pricing Page ────────────────────────────────────────────────────────
export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [mobileActive, setMobileActive] = useState<"free" | "pro" | "power">("pro");
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const { region } = usePricingRegion();
  const isIndia = region === "IN";
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<Plan | null>(null);
  const [compareOpen, setCompareOpen] = useState(true);

  const planOrder: ("free" | "pro" | "power")[] = ["free", "pro", "power"];

  const handleMobileTabChange = (newPlan: "free" | "pro" | "power") => {
    if (newPlan === mobileActive) return;
    const oldIdx = planOrder.indexOf(mobileActive);
    const newIdx = planOrder.indexOf(newPlan);
    setSlideDirection(newIdx > oldIdx ? 1 : -1);
    setMobileActive(newPlan);
  };

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
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
    api.get("/auth/get-profile", { headers: { Auth: token } })
      .then(r => { if (r.data.success) setUser(r.data.user); })
      .catch(() => {});
  }, []);

  // Dynamically compute the best saving % for the toggle pill badge
  const maxSaving = (() => {
    const paidPlans = PLANS.filter(p => p.id !== "free");
    let best = 0;
    for (const plan of paidPlans) {
      const data = isIndia ? plan.inr : plan.usd;
      const fullYear = data.monthly * 12;
      if (fullYear > 0) {
        const pct = Math.round(((fullYear - data.yearly) / fullYear) * 100);
        if (pct > best) best = pct;
      }
    }
    return best;
  })();

  /**
   * Price display strategy (no two-monthly-number confusion):
   *   Monthly → big number = monthly price   | subtext = "Billed monthly"
   *   Yearly  → big number = YEARLY TOTAL    | subtext = "₹583/mo equivalent · Save X%"
   */
  const getDisplayPrice = (plan: Plan) => {
    const data = isIndia ? plan.inr : plan.usd;
    const sym = isIndia ? "₹" : "$";
    const fmt = (n: number) => isIndia ? n.toLocaleString("en-IN") : n.toFixed(2);

    if (plan.id === "free") {
      return { bigPrice: `${sym}0`, bigPeriod: "", sub: "Forever free · No credit card needed", savingBadge: null };
    }
    if (billing === "yearly") {
      const fullYear = data.monthly * 12;
      const savePct = fullYear > 0 ? Math.round(((fullYear - data.yearly) / fullYear) * 100) : 0;
      const perMonthEq = `${sym}${fmt(data.yearlyPerMonth)}/mo`;
      return {
        bigPrice: `${sym}${fmt(data.yearly)}`,
        bigPeriod: "/year",
        sub: `${perMonthEq} · Billed once a year`,
        savingBadge: `Save ${savePct}%`,
      };
    }
    return {
      bigPrice: `${sym}${fmt(data.monthly)}`,
      bigPeriod: "/month",
      sub: "Billed monthly · Cancel anytime",
      savingBadge: null,
    };
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.ctaFree) { window.location.href = "/youtube-to-notes"; return; }
    trackDbActivity(`/pricing/checkout-click/${plan.id}/${billing}`);
    const token = localStorage.getItem("authToken");
    if (!token) { setPendingPlan(plan); setShowLoginModal(true); return; }
    setPendingCheckoutPlan(plan);
    setSelectedId(plan.id);
    setShowPaymentModal(true);
  };

  const launchLemonSqueezy = async (plan: Plan) => {
    setShowPaymentModal(false);
    setIsProcessing(true);
    trackDbActivity(`/pricing/payment-start-lemonsqueezy/${plan.id}/${billing}`);
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post("/payment/lemonsqueezy/create-checkout",
        { planId: plan.id, billingPeriod: billing,
          successUrl: `${window.location.origin}/pricing?payment=success&plan=${encodeURIComponent(plan.name)}&billing=${billing}`,
          cancelUrl: `${window.location.origin}/pricing?payment=cancel` },
        { headers: { Auth: token } }
      );
      if (res.data.success && res.data.url) window.location.href = res.data.url;
      else toast.error("Could not start checkout — please try again.");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Checkout failed"); }
    finally { setIsProcessing(false); setSelectedId(null); }
  };

  const renderPlanCard = (plan: Plan) => {
    const dp = getDisplayPrice(plan);
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
              <h2
                className={cn(
                  "text-base sm:text-lg font-bold tracking-tight",
                  isPro ? "text-neutral-900" : "text-white"
                )}
              >
                {plan.name}
              </h2>
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

          {/* 2. Price Block (Massive Font + Directional Blur Transition) */}
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
            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={isProcessing && selectedId === plan.id}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full font-bold text-xs transition-all cursor-pointer active:scale-[0.98] shadow-md",
                isPro
                  ? "bg-[#ef4444] hover:bg-red-600 text-white shadow-red-500/25 hover:shadow-red-500/35"
                  : "bg-[#222228] hover:bg-[#2c2c34] text-white border border-white/10"
              )}
            >
              {isProcessing && selectedId === plan.id ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <span>{plan.cta}</span>
                  <ArrowRight size={12} />
                </>
              )}
            </button>
            {plan.id !== "free" && (
              <p
                className={cn(
                  "text-center text-[9px] mt-1.5",
                  isPro ? "text-neutral-500" : "text-neutral-500"
                )}
              >
                No hidden fees · Cancel anytime
              </p>
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to continue"
        onSuccess={() => { setShowLoginModal(false); if (pendingPlan) handleSelectPlan(pendingPlan); }}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setSelectedId(null); }}
        plan={pendingCheckoutPlan}
        billing={billing}
        region={region}
        onLemon={() => pendingCheckoutPlan && launchLemonSqueezy(pendingCheckoutPlan)}
        onPayPalSuccess={() => {
          setShowPaymentModal(false);
          const planId = pendingCheckoutPlan?.id || "pro";
          const price = billing === "monthly" ? (pendingCheckoutPlan?.usd.monthly ?? 9.99) : (pendingCheckoutPlan?.usd.yearly ?? 79.99);
          trackPurchase(planId, price);
          trackDbActivity(`/payment/success/${planId}/${billing}`);
          toast.success("Payment successful! Your plan is now active.");
          setTimeout(() => window.location.href = "/profile", 1500);
        }}
        isLemonLoading={isProcessing}
        user={user}
      />

      <div className="relative min-h-screen bg-[#070709] text-white overflow-hidden font-sans">
        {/* Atmospheric glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.12)_0%,_transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-[1140px] mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16">

          {/* Header */}
          <div className="text-center mb-4 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
              <Sparkles size={10} className="text-red-400" /> LEARN MORE. REMEMBER MORE.
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Choose your <span className="text-[#ef4444]">learning power.</span>
            </h1>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Turn lectures and study material into an AI-powered learning system.
              {isIndia && <span className="text-emerald-400 font-semibold"> ₹ India pricing shown.</span>}
            </p>
          </div>

          {/* Billing toggle with spring pill */}
          <div className="flex justify-center mb-3.5">
            <div className="relative p-0.5 rounded-full bg-[#0d0d11] border border-white/[0.08] flex items-center">
              {(["monthly", "yearly"] as BillingPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBilling(p)}
                  className={cn(
                    "relative z-10 px-4 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1",
                    billing === p
                      ? p === "yearly"
                        ? "text-white"
                        : "text-black"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  {billing === p && (
                    <motion.div
                      layoutId="billing-pill-pricing-page"
                      className={cn(
                        "absolute inset-0 rounded-full shadow-sm z-[-1]",
                        p === "yearly" ? "bg-[#ef4444]" : "bg-white"
                      )}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span>{p === "monthly" ? "Monthly" : "Yearly"}</span>
                  {p === "yearly" && (
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
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Trust & Guarantee Banner */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 py-1.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-neutral-300 mb-5 max-w-xl mx-auto text-center shadow-sm">
            <div className="flex items-center gap-1 font-medium text-neutral-200">
              <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
              <span>7-Day Guarantee</span>
            </div>
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1 font-medium text-neutral-200">
              <Zap size={12} className="text-amber-400 shrink-0" />
              <span>Cancel Anytime</span>
            </div>
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1 font-medium text-neutral-200">
              <Lock size={12} className="text-blue-400 shrink-0" />
              <span>No Card Needed for Free</span>
            </div>
          </div>

          {/* ── Mobile Segmented Control (Smooth Apple-Grade Switcher) ──────────── */}
          <div className="flex md:hidden justify-center mb-3.5">
            <div className="relative p-1 rounded-2xl bg-[#0e0e13] border border-white/[0.08] grid grid-cols-3 w-full max-w-xs shadow-inner">
              {PLANS.map((p) => {
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
                        layoutId="mobile-plan-pill-pricing"
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
                {renderPlanCard(PLANS.find((p) => p.id === mobileActive) || PLANS[1])}
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-3 mb-4">
              {PLANS.map((p) => (
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
          <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5 items-stretch mb-8">
            {PLANS.map((plan) => renderPlanCard(plan))}
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <div className="text-center mb-4">
              <button onClick={() => setCompareOpen(o => !o)} className="inline-flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-white bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-xl transition-all cursor-pointer">
                <BarChart3 size={14} className="text-red-400" />
                {compareOpen ? "Hide comparison" : "Compare all 3 plans"}
                <ChevronDown size={14} className={cn("transition-transform duration-200", compareOpen && "rotate-180")} />
              </button>
            </div>
            <AnimatePresence>
              {compareOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#09090c]">
                    <table className="w-full text-xs min-w-[520px]">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                          <th className="text-left p-3 pl-5 text-neutral-400 font-bold uppercase tracking-wider w-[40%]">Feature</th>
                          <th className="text-center p-3 text-neutral-300 font-bold">Free</th>
                          <th className="text-center p-3 text-red-400 font-bold bg-red-500/5">Pro Scholar</th>
                          <th className="text-center p-3 text-white font-bold">Power Scholar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARE_ROWS.map((row, i) => (
                          <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="p-3 pl-5 text-neutral-300 font-medium">{row.feature}</td>
                            <td className="p-3 text-center"><CellValue val={row.free} /></td>
                            <td className="p-3 text-center bg-red-500/[0.04]"><CellValue val={row.pro} isPro /></td>
                            <td className="p-3 text-center"><CellValue val={row.power} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FAQs */}
          <div className="max-w-2xl mx-auto mb-14">
            <h3 className="text-xl font-bold text-white text-center mb-6">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-[#09090c] p-4">
                  <p className="text-xs font-bold text-white mb-1.5">{faq.q}</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 pt-6 border-t border-white/[0.06]">
            {[
              { icon: ShieldCheck, text: "256-bit SSL Checkout" },
              { icon: Activity,    text: "99.9% Uptime" },
              { icon: Lock,        text: "PayPal & Card Secured" },
              { icon: Zap,         text: "Instant Activation" },
              { icon: BadgeCheck,  text: "No Hidden Fees" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-1.5 text-neutral-400 text-xs">
                <Icon size={12} className="text-red-400 shrink-0" /><span>{text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}