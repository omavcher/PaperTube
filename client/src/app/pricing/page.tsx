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
    tagline: "Explore the magic with zero risk.",
    usd: { monthly: 0, yearly: 0, yearlyPerMonth: 0, saving: "" },
    inr: { monthly: 0, yearly: 0, yearlyPerMonth: 0, saving: "" },
    cta: "Start for free",
    ctaFree: true,
    highlight: false,
    features: [
      "5 video notes / day (up to 60 min/video)",
      "100 PaperChat messages / day",
      "5 quiz & flashcard sets / day",
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
    cta: "Get Pro Scholar",
    highlight: true,
    features: [
      "120 AI video notes / month (up to 4 hrs/video)",
      "2,000 PaperChat messages / month",
      "30 AI quiz & practice sets / month",
      "Unlimited flashcard sets",
      "15 mind maps & diagrams / month",
      "10 AI slide decks / month (up to 20 slides)",
      "500 math & study solves / month",
      "50 AI humanizer & essay scans / month",
      "Publication-quality PDF (LaTeX + Code)",
      "Notion + Markdown + Anki export",
      "Priority cloud processing queue",
    ],
  },
  {
    id: "power",
    name: "Power Scholar",
    badge: "👑 Max Output",
    tagline: "100 hours of AI learning. No compromises.",
    usd: { monthly: 19.99, yearly: 149.99, yearlyPerMonth: 10.83, saving: "~37% off" },
    inr: { monthly: 1599, yearly: 12999, yearlyPerMonth: 1083, saving: "~32% off" },
    cta: "Get Power Scholar",
    highlight: false,
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

// ─── Comparison Table ─────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { feature: "AI Video Notes",           free: "5 / day",   pro: "120 / mo",  power: "350 / mo"  },
  { feature: "Max Video Length",         free: "60 min",    pro: "4 hours",   power: "8 hours"   },
  { feature: "PaperChat Messages",       free: "100 / day", pro: "2,000 / mo",power: "10,000 / mo"},
  { feature: "AI Quiz Sets",             free: "5 / day",   pro: "30 / mo",   power: "Unlimited" },
  { feature: "Flashcard Sets",           free: "5 / day",   pro: "Unlimited", power: "Unlimited" },
  { feature: "Mind Maps & Diagrams",     free: "3 / day",   pro: "15 / mo",   power: "Unlimited" },
  { feature: "AI Slide Decks (PPT)",     free: "2 / day",   pro: "10 / mo",   power: "30 / mo"   },
  { feature: "Math & Study Solves",      free: "10 / day",  pro: "500 / mo",  power: "1,500 / mo"},
  { feature: "AI Humanizer & Essays",    free: "1 / day",   pro: "50 / mo",   power: "200 / mo"  },
  { feature: "Max Slides per Deck",      free: "8 slides",  pro: "20 slides", power: "40 slides" },
  { feature: "LaTeX Publication PDF",    free: false,       pro: true,        power: true        },
  { feature: "Notion / Anki Export",     free: false,       pro: true,        power: true        },
  { feature: "DOCX / PPTX / HTML Export",free: false,       pro: false,       power: true        },
  { feature: "Processing Speed",         free: "Standard", pro: "Priority GPU", power: "Instant Turbo" },
];

const FAQS = [
  { q: "How is '30 hours of AI content' measured?",
    a: "Pro Scholar gives you 120 video note generations per month. Each generation typically processes 10–15 minutes of lecture, adding up to roughly 20–30 hours of lecture content processed — hence '30 hours of AI study content.'" },
  { q: "Can I cancel anytime?",
    a: "Yes. Cancel with one click from your profile. Your access continues until the end of your paid billing period." },
  { q: "Do 'Unlimited' features really have no limit?",
    a: "Unlimited flashcards and quizzes in Pro/Power are genuinely unlimited — these are very low AI cost operations. Heavy features like video notes and PPTs have monthly caps to protect our margins and keep prices fair." },
  { q: "What payment methods are supported?",
    a: "Globally: PayPal (credit/debit cards, PayPal balance) and LemonSqueezy (Visa, Mastercard, Amex). India: UPI (Google Pay, PhonePe, Paytm), RuPay, Netbanking, and domestic cards via Razorpay." },
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
  const { region } = usePricingRegion();
  const isIndia = region === "IN";
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<Plan | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

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

  return (
    <>
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

        <div className="relative z-10 max-w-[1160px] mx-auto px-4 sm:px-6 pt-24 pb-24">

          {/* Header */}
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <Sparkles size={11} className="text-red-400" /> LEARN MORE. REMEMBER MORE.
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Choose your <span className="text-[#ef4444]">learning power.</span>
            </h1>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto">
              Turn lectures, videos and study material into an AI-powered learning system.
              {isIndia && <span className="text-emerald-400 font-semibold"> ₹ India pricing shown.</span>}
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-6">
            <div className="p-1 rounded-full bg-[#0d0d11] border border-white/[0.08] flex items-center">
              {(["monthly", "yearly"] as BillingPeriod[]).map((p) => (
                <button key={p} onClick={() => setBilling(p)} className={cn(
                  "px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  billing === p ? (p === "yearly" ? "bg-[#ef4444] text-white shadow-sm" : "bg-white text-black shadow-sm") : "text-neutral-400 hover:text-white"
                )}>
                  {p === "monthly" ? "Monthly" : "Yearly"}
                  {p === "yearly" && <span className={cn("px-1.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase", billing === "yearly" ? "bg-black/30 text-white" : "bg-red-500/15 text-red-400 border border-red-500/20")}>Save up to {maxSaving}%</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile segmented switcher */}
          <div className="block lg:hidden mb-4">
            <div className="grid grid-cols-3 p-1 rounded-xl bg-[#0d0d12] border border-white/[0.08] text-xs">
              {PLANS.map((plan) => (
                <button key={plan.id} onClick={() => setMobileActive(plan.id)} className={cn(
                  "py-2 rounded-lg text-center transition-all cursor-pointer font-medium px-1 truncate",
                  mobileActive === plan.id
                    ? plan.highlight ? "bg-[#ef4444] text-white font-bold" : "bg-white/[0.08] text-white font-bold"
                    : plan.highlight ? "text-red-400 font-semibold" : "text-neutral-400"
                )}>
                  {plan.id === "free" ? "Free" : plan.id === "pro" ? "⭐ Pro" : "👑 Power"}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch mb-10">
            {PLANS.map((plan) => {
              const dp = getDisplayPrice(plan);
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative transition-all duration-300",
                    mobileActive !== plan.id && "hidden lg:flex",
                    plan.highlight
                      ? "bg-[#0d0c10] border-2 border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.18)] ring-1 ring-red-500/30 lg:scale-[1.04] lg:-translate-y-1"
                      : "bg-[#09090c] border border-white/[0.08] hover:border-white/[0.15]"
                  )}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ef4444] text-white text-[9px] font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1 whitespace-nowrap">
                      <Crown size={9} /> RECOMMENDED
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-[17px] font-bold text-white">{plan.name}</h2>
                      <span className={cn("px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider",
                        plan.highlight ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-white/[0.04] text-neutral-400 border border-white/[0.06]"
                      )}>{plan.badge}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">{plan.tagline}</p>

                    {/* Price block — single unambiguous number */}
                    <div className="mb-5 pb-4 border-b border-white/[0.06]">
                      <div className="flex items-end gap-2">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{dp.bigPrice}</span>
                          {plan.id !== "free" && <span className="text-xs text-neutral-400 ml-1">{dp.bigPeriod}</span>}
                        </div>
                        {dp.savingBadge && (
                          <span className="mb-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            {dp.savingBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1.5 leading-snug">{dp.sub}</p>
                    </div>


                    {/* Features */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                        {plan.id === "free" ? "What's included" : `Everything in ${plan.id === "pro" ? "Free" : "Pro"}, plus`}
                      </p>
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                          <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            plan.highlight ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-white/[0.06] text-neutral-300"
                          )}><Check size={9} strokeWidth={3} /></div>
                          <span className="leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-5 mt-5 border-t border-white/[0.04]">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isProcessing && selectedId === plan.id}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.98]",
                        plan.highlight
                          ? "bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_0_18px_rgba(239,68,68,0.35)]"
                          : "bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] text-white"
                      )}
                    >
                      {isProcessing && selectedId === plan.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <><span>{plan.cta}</span><ArrowRight size={12} /></>}
                    </button>
                    {plan.id !== "free" && (
                      <p className="text-center text-[10px] text-neutral-600 mt-2">No hidden fees · Cancel anytime</p>
                    )}
                  </div>
                </div>
              );
            })}
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
              { icon: Lock,        text: "PayPal & Razorpay Secured" },
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