"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, X, ArrowRight, Zap, ShieldCheck, Activity,
  Sparkles, Clock, Star, Lock, Loader2, ChevronDown, Globe,
  BookOpen, FileText, Layers, Download, Folder, Timer,
  List, Infinity, AlertCircle, Users, TrendingUp, Award,
  BarChart3, Flame, Coffee, GraduationCap, Brain, Rocket,
  Check, BadgeCheck, Shield, Play, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { AuthLoginModal } from "@/components/AuthGuard";

// ─── Types ────────────────────────────────────────────────────────────────────
type BillingPeriod = "monthly" | "yearly";

interface Plan {
  id: string;
  name: string;
  tagline: string;
  persona: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  ctaFree?: boolean;
  hasTrial: boolean;
  popular?: boolean;
  highlight?: boolean;
  badge?: string;
  accentColor: string;
  glowColor: string;
  features: Array<{ text: string; icon: any }>;
}

// ─── Plan Data ─────────────────────────────────────────────────────────────────
const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Explore the magic, zero risk.",
    persona: "Perfect for casual learners",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Start for free",
    ctaFree: true,
    hasTrial: false,
    accentColor: "text-neutral-400",
    glowColor: "rgba(255,255,255,0.03)",
    features: [
      { text: "2 videos per day", icon: Play },
      { text: "Up to 1 hour per video", icon: Clock },
      { text: "Quick Notes mode", icon: FileText },
      { text: "Last 5 notes saved", icon: Folder },
      { text: "Watermarked PDF export", icon: Download },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Everything you need to ace every exam.",
    persona: "For serious students & daily learners",
    monthlyPrice: 9,
    yearlyPrice: 72,
    cta: "Start 7-day free trial",
    hasTrial: true,
    popular: true,
    highlight: true,
    badge: "Most Popular",
    accentColor: "text-white",
    glowColor: "rgba(255,255,255,0.08)",
    features: [
      { text: "15 videos per day", icon: Play },
      { text: "Up to 4 hours per video", icon: Clock },
      { text: "All note styles — Quick, Visual, Full PDF", icon: Layers },
      { text: "Clean PDF export — no watermark", icon: Download },
      { text: "Markdown + Notion export", icon: FileText },
      { text: "Unlimited saved notes + folders", icon: Folder },
      { text: "Timestamps linked to video", icon: Timer },
      { text: "Priority processing speed", icon: Zap },
    ],
  },
  {
    id: "power",
    name: "Power",
    tagline: "Research-grade output, zero limits.",
    persona: "For researchers, grad students & power users",
    monthlyPrice: 19,
    yearlyPrice: 144,
    cta: "Start 7-day free trial",
    hasTrial: true,
    accentColor: "text-violet-300",
    glowColor: "rgba(139,92,246,0.08)",
    features: [
      { text: "Unlimited videos, no daily cap", icon: Infinity },
      { text: "Up to 12 hours per video", icon: Clock },
      { text: "Playlist processing (full course)", icon: List },
      { text: "Deep PDF — textbook-quality output", icon: BookOpen },
      { text: "Anki deck export (.apkg)", icon: Brain },
      { text: "Multi-language notes (DE, ES, FR)", icon: Globe },
      { text: "Instant processing — zero queue", icon: Rocket },
    ],
  },
];

// ─── Comparison Table Data ─────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { category: "Usage", feature: "Videos per day", free: "2", pro: "15", power: "Unlimited" },
  { category: "Usage", feature: "Max video length", free: "1 hr", pro: "4 hrs", power: "12 hrs" },
  { category: "Notes", feature: "Quick Notes", free: true, pro: true, power: true },
  { category: "Notes", feature: "Visual Notes (with images)", free: false, pro: true, power: true },
  { category: "Notes", feature: "Full PDF Notes", free: false, pro: true, power: true },
  { category: "Notes", feature: "Deep PDF (textbook quality)", free: false, pro: false, power: true },
  { category: "Export", feature: "PDF export (no watermark)", free: false, pro: true, power: true },
  { category: "Export", feature: "Markdown export", free: false, pro: true, power: true },
  { category: "Export", feature: "Notion export", free: false, pro: true, power: true },
  { category: "Export", feature: "Anki deck (.apkg)", free: false, pro: false, power: true },
  { category: "Storage", feature: "Saved notes + folders", free: "Last 5", pro: "Unlimited", power: "Unlimited" },
  { category: "Advanced", feature: "Timestamps linked to video", free: false, pro: true, power: true },
  { category: "Advanced", feature: "Playlist processing", free: false, pro: false, power: true },
  { category: "Advanced", feature: "Multi-language output", free: false, pro: false, power: true },
  { category: "Performance", feature: "Processing speed", free: "Shared", pro: "Priority", power: "Instant" },
  { category: "Trial", feature: "7-day free trial", free: false, pro: true, power: true },
];

// ─── Social proof counter ─────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Aditya R.", role: "CS Student, IIT Bombay", text: "Went from failing to top 10% in my class. The flashcards + PDF combo is unreal.", rating: 5 },
  { name: "Sofia M.", role: "Pre-Med, UCLA", text: "I process entire lecture playlists in one sitting. Power plan is a game-changer.", rating: 5 },
  { name: "James K.", role: "MBA Student", text: "Saves me 3–4 hours per week. Absolutely worth every dollar.", rating: 5 },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Do I need a credit card for the free trial?", a: "No. The 7-day free trial for Pro and Power plans requires no credit card. You're only charged after the trial ends if you choose to continue." },
  { q: "What happens after the trial?", a: "You'll get an email reminder before your trial ends. If you don't cancel, your selected plan activates. You can cancel anytime from your profile." },
  { q: "Is the yearly plan auto-renewed?", a: "No. The yearly plan is a one-time payment for 12 months of access. It does not auto-renew — you'll manually choose to renew when it expires." },
  { q: "Can I switch plans?", a: "Yes, you can upgrade or downgrade at any time from your profile page. Upgrades take effect immediately." },
  { q: "What payment methods do you accept?", a: "We support PayPal (credit/debit card, PayPal balance) and LemonSqueezy (Visa, Mastercard, American Express, and more). Both gateways are fully secure." },
  { q: "Which payment gateway should I use?", a: "Both are equally safe. Choose PayPal if you already have a PayPal account. Choose LemonSqueezy for a seamless credit/debit card experience without needing an account." },
];

// ─── Small helpers ─────────────────────────────────────────────────────────────
function CellValue({ val, isPro }: { val: boolean | string; isPro?: boolean }) {
  if (typeof val === "boolean") {
    return val
      ? <CheckCircle2 size={16} className={cn("mx-auto", isPro ? "text-white" : "text-emerald-400")} />
      : <X size={14} className="text-neutral-800 mx-auto" />;
  }
  return <span className={cn("font-semibold text-xs", isPro ? "text-white" : "text-neutral-300")}>{val}</span>;
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border border-white/5 rounded-2xl overflow-hidden transition-colors duration-200", open ? "bg-neutral-900/60" : "bg-neutral-900/20 hover:bg-neutral-900/40")}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center justify-between gap-4 p-5 md:p-6"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <ChevronDown size={16} className={cn("text-neutral-500 shrink-0 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 md:px-6 pb-5 text-sm text-neutral-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// PayPal Smart Buttons (JS SDK) - avoids ALL currency restriction issues
function PayPalSDKButton({
  plan, billing, onSuccess, onError,
}: {
  plan: Plan;
  billing: BillingPeriod;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId || clientId === "YOUR_PAYPAL_CLIENT_ID") {
      onError("PayPal Client ID not configured.");
      return;
    }
    const scriptId = "paypal-sdk-script";
    if (document.getElementById(scriptId)) {
      if ((window as any).paypal) setSdkReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload  = () => setSdkReady(true);
    script.onerror = () => onError("Failed to load PayPal SDK.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkReady || !containerRef.current || !(window as any).paypal) return;
    containerRef.current.innerHTML = "";
    (window as any).paypal.Buttons({
      style: { layout: "vertical", color: "blue", shape: "pill", label: "pay", height: 48 },
      createOrder: async () => {
        const token = localStorage.getItem("authToken");
        const res = await api.post(
          "/payment/paypal/create-order",
          { planId: plan.id, billingPeriod: billing },
          { headers: { Auth: token } }
        );
        if (!res.data.success) throw new Error(res.data.message || "Order creation failed");
        return res.data.orderId;
      },
      onApprove: async (data: any) => {
        try {
          const token = localStorage.getItem("authToken");
          const res = await api.post(
            "/payment/paypal/capture-order",
            { orderId: data.orderID },
            { headers: { Auth: token } }
          );
          if (res.data.success) onSuccess();
          else onError("Payment capture failed. Please contact support.");
        } catch (err: any) {
          onError(err?.response?.data?.message || "Capture failed");
        }
      },
      onError: (err: any) => {
        console.error("PayPal SDK error:", err);
        onError("PayPal payment failed. Please try again.");
      },
    }).render(containerRef.current);
  }, [sdkReady, plan.id, billing]);

  if (!sdkReady) {
    return (
      <div className="w-full h-12 flex items-center justify-center gap-2 text-neutral-500 text-xs">
        <Loader2 size={14} className="animate-spin" /> Loading PayPal…
      </div>
    );
  }
  return <div ref={containerRef} id="paypal-button-container" className="w-full" />;
}

function PaymentMethodModal({
  isOpen, onClose, plan, billing, onLemonSqueezy, onPayPalSuccess, isLemonProcessing,
}: {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  billing: BillingPeriod;
  onLemonSqueezy: () => void;
  onPayPalSuccess: () => void;
  isLemonProcessing: boolean;
}) {
  const handlePayPalError = (msg: string) => toast.error(msg);

  return (
    <AnimatePresence>
      {isOpen && plan && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm bg-neutral-950 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-36 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04)_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="text-center mb-7">
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                  <Lock size={20} className="text-neutral-300" />
                </div>
                <h3 className="text-lg font-black text-white mb-1">Choose payment method</h3>
                <p className="text-xs text-neutral-500">{plan.name} plan · Secure checkout</p>
              </div>

              {/* PayPal Smart Buttons via official JS SDK */}
              <PayPalSDKButton
                plan={plan}
                billing={billing}
                onSuccess={onPayPalSuccess}
                onError={handlePayPalError}
              />

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/6" />
              </div>

              <button
                id="btn-lemonsqueezy"
                onClick={onLemonSqueezy}
                disabled={isLemonProcessing}
                className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-white/8 hover:border-white/15 transition-all duration-200 active:scale-95 disabled:opacity-60 font-bold text-white text-sm"
              >
                {isLemonProcessing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <><span className="text-xl">🍋</span> Pay with LemonSqueezy</>
                )}
              </button>

              <p className="text-center text-[10px] text-neutral-700 mt-5 flex items-center justify-center gap-1.5">
                <ShieldCheck size={11} className="text-neutral-600" />
                256-bit SSL encrypted · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ isOpen, onClose, planName }: { isOpen: boolean; onClose: () => void; planName: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-neutral-900 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.18)_0%,_transparent_70%)] pointer-events-none" />
            <div className="text-center space-y-6 relative z-10">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">You're all set! 🎉</h3>
                <p className="text-sm text-neutral-400">{planName} plan activated. Time to study smarter.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-white text-black font-bold uppercase tracking-wide text-xs rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Start Learning →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({
  plan, billing, onSelect, isProcessing, selectedId,
}: {
  plan: Plan; billing: BillingPeriod;
  onSelect: (plan: Plan) => void; isProcessing: boolean; selectedId: string | null;
}) {
  const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const monthlyEquiv = billing === "yearly" && plan.monthlyPrice > 0
    ? (plan.yearlyPrice / 12).toFixed(2)
    : null;
  const isLoading = isProcessing && selectedId === plan.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col rounded-[2rem] border transition-all duration-500 group",
        plan.highlight
          ? "bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.06)] z-10 md:-mt-4 md:-mb-4 pb-4"
          : plan.id === "power"
          ? "bg-gradient-to-b from-violet-950/30 to-black/60 border-violet-500/15 hover:border-violet-500/30"
          : "bg-neutral-950/60 border-white/5 hover:border-white/10"
      )}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 pointer-events-none rounded-t-[2rem] opacity-60"
        style={{ background: `radial-gradient(ellipse at top, ${plan.glowColor}, transparent 70%)` }}
      />

      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] whitespace-nowrap">
          <Sparkles size={10} />
          {plan.badge}
        </div>
      )}

      <div className={cn("p-7 flex flex-col flex-1", plan.highlight && "pt-10")}>
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={cn("text-xl font-black tracking-tight", plan.accentColor)}>{plan.name}</h3>
            {plan.id === "power" && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20">Power</span>
            )}
          </div>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed">{plan.tagline}</p>
          <p className="text-[10px] text-neutral-600 mt-1 font-medium flex items-center gap-1">
            <Users size={9} /> {plan.persona}
          </p>
        </div>

        {/* Price block */}
        <div className="mb-6 pb-6 border-b border-white/5">
          <div className="flex items-end gap-1.5">
            {price === 0 ? (
              <span className="text-5xl font-black text-white tracking-tighter">Free</span>
            ) : (
              <>
                <span className="text-2xl font-bold text-neutral-400 mb-1">$</span>
                <span className={cn("text-6xl font-black tracking-tighter leading-none", plan.highlight ? "text-white" : plan.id === "power" ? "text-violet-200" : "text-white")}>
                  {price}
                </span>
                <div className="flex flex-col mb-1">
                  <span className="text-xs text-neutral-500 font-medium leading-tight">
                    / {billing === "monthly" ? "month" : "year"}
                  </span>
                  {monthlyEquiv && billing === "yearly" && (
                    <span className="text-[10px] text-emerald-400 font-bold leading-tight">${monthlyEquiv}/mo</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Savings & billing notes */}
          {price > 0 && billing === "yearly" && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp size={10} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">Save ~17%</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/8 border border-amber-500/15">
                <AlertCircle size={10} className="text-amber-400/80" />
                <span className="text-[10px] font-semibold text-amber-400/80">One-time · No auto-renewal</span>
              </div>
            </div>
          )}
          {price > 0 && billing === "monthly" && plan.hasTrial && (
            <p className="text-[11px] text-neutral-600 mt-2 flex items-center gap-1">
              <Shield size={10} /> No credit card required during trial
            </p>
          )}
          {price === 0 && (
            <p className="text-[11px] text-neutral-600 mt-2">Free forever. No credit card needed.</p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => onSelect(plan)}
          disabled={isProcessing}
          className={cn(
            "w-full h-13 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 mb-2 group/btn relative overflow-hidden",
            plan.highlight
              ? "bg-white text-black hover:bg-neutral-100 shadow-[0_4px_24px_rgba(255,255,255,0.18)] hover:shadow-[0_4px_32px_rgba(255,255,255,0.28)]"
              : plan.id === "power"
              ? "bg-violet-600 text-white hover:bg-violet-500 border border-violet-500/50 shadow-[0_4px_24px_rgba(139,92,246,0.2)] hover:shadow-[0_4px_32px_rgba(139,92,246,0.35)]"
              : "bg-neutral-800/80 text-neutral-300 border border-white/8 hover:bg-neutral-700/80 hover:text-white hover:border-white/15"
          )}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              {plan.hasTrial && <Sparkles size={13} className="opacity-80" />}
              {plan.cta}
              <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {plan.hasTrial && (
          <p className="text-center text-[10px] text-neutral-600 mb-5 font-medium">
            {billing === "yearly" ? "No auto-renew after 12 months" : "Cancel anytime — no charge during trial"}
          </p>
        )}

        {/* Feature divider */}
        <p className={cn("text-[9px] font-black uppercase tracking-[0.18em] mb-4 flex items-center gap-2", plan.highlight ? "text-neutral-400" : "text-neutral-600")}>
          <span className="flex-1 h-px bg-white/5" />
          {plan.id === "free" ? "Included" : `Everything in ${plan.id === "pro" ? "Free" : "Pro"}, plus`}
          <span className="flex-1 h-px bg-white/5" />
        </p>

        {/* Features */}
        <div className="space-y-2.5 flex-1">
          {plan.features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i + 0.3, duration: 0.3 }}
              className="flex items-start gap-3 group/feat"
            >
              <div className={cn(
                "mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                plan.highlight ? "bg-white/10 text-white group-hover/feat:bg-white group-hover/feat:text-black" 
                : plan.id === "power" ? "bg-violet-500/15 text-violet-400 group-hover/feat:bg-violet-500/25"
                : "bg-white/[0.04] text-neutral-500 group-hover/feat:bg-white/[0.08]"
              )}>
                <f.icon size={10} strokeWidth={2.5} />
              </div>
              <span className={cn("text-xs font-medium leading-relaxed transition-colors", 
                plan.highlight ? "text-neutral-300 group-hover/feat:text-white" 
                : plan.id === "power" ? "text-neutral-400 group-hover/feat:text-violet-200"
                : "text-neutral-600 group-hover/feat:text-neutral-400")}>
                {f.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  // ── Payment method modal state ──────────────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<Plan | null>(null);
  const [processingGateway, setProcessingGateway] = useState<"paypal" | "lemonsqueezy" | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await api.get("/auth/get-profile", { headers: { Auth: token } });
        if (res.data.success) setUser(res.data.user);
      } catch (e) {
        console.error("Failed to fetch user:", e);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      const plan = params.get("plan") || "Pro";
      setSuccessPlanName(plan);
      setSuccessOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("payment") === "cancel") {
      toast.info("Checkout cancelled — no charge was made.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.ctaFree) {
      const token = localStorage.getItem("authToken");
      if (!token) { setPendingPlan(plan); setShowLoginModal(true); return; }
      window.location.href = "/notes";
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) { setPendingPlan(plan); setShowLoginModal(true); return; }
    // Open payment method picker
    setPendingCheckoutPlan(plan);
    setSelectedId(plan.id);
    setShowPaymentModal(true);
  };

  const launchLemonSqueezyCheckout = async (plan: Plan) => {
    setShowPaymentModal(false);
    setIsProcessing(true);
    setProcessingGateway("lemonsqueezy");
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post(
        "/payment/lemonsqueezy/create-checkout",
        {
          planId: plan.id,
          billingPeriod: billing,
          successUrl: `${window.location.origin}/pricing?payment=success&plan=${encodeURIComponent(plan.name)}&gateway=lemonsqueezy`,
          cancelUrl:  `${window.location.origin}/pricing?payment=cancel`,
        },
        { headers: { Auth: token } }
      );
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Could not start LemonSqueezy checkout. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start LemonSqueezy checkout");
    } finally {
      setIsProcessing(false);
      setProcessingGateway(null);
      setSelectedId(null);
    }
  };

  return (
    <>
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to get started"
        onSuccess={() => {
          setShowLoginModal(false);
          if (pendingPlan) {
            if (pendingPlan.ctaFree) window.location.href = "/notes";
            else {
              setPendingCheckoutPlan(pendingPlan);
              setSelectedId(pendingPlan.id);
              setShowPaymentModal(true);
            }
          }
        }}
      />
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setSelectedId(null); }}
        plan={pendingCheckoutPlan}
        billing={billing}
        onLemonSqueezy={() => pendingCheckoutPlan && launchLemonSqueezyCheckout(pendingCheckoutPlan)}
        onPayPalSuccess={() => {
          setShowPaymentModal(false);
          setSuccessPlanName(pendingCheckoutPlan?.name || "Pro");
          setSuccessOpen(true);
        }}
        isLemonProcessing={isProcessing && processingGateway === "lemonsqueezy"}
      />
      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} planName={successPlanName} />

      <div className="relative min-h-screen bg-black text-white overflow-hidden selection:bg-neutral-800 selection:text-white font-sans">

        {/* ── Atmospheric BG ── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />
          <div className="absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-violet-900/10 blur-[120px] rounded-full" />
          <div className="absolute top-1/4 right-[-5%] w-[400px] h-[400px] bg-blue-900/8 blur-[100px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24">

          {/* ── Hero Section ── */}
          <div className="text-center mb-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/8 text-[10px] font-bold uppercase tracking-widest text-neutral-400"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Simple, transparent pricing
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
              className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500">
                Learn Smarter.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-neutral-300 to-neutral-600">
                Pay Less Than a Coffee.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="text-base md:text-lg text-neutral-400 font-light max-w-lg mx-auto leading-relaxed"
            >
              Turn any YouTube lecture into structured notes, flashcards, and PDFs.
              Start free — upgrade when you're ready.
            </motion.p>
          </div>

          {/* ── Social Proof Numbers ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-14"
          >
            {[
              { value: 24000, suffix: "+", label: "Students enrolled" },
              { value: 4.9, suffix: "/5", label: "Average rating", isDecimal: true },
              { value: 98, suffix: "%", label: "Satisfaction rate" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-lg font-black text-white">
                    {stat.isDecimal ? stat.value : <AnimatedNumber target={stat.value} suffix={stat.suffix} />}
                    {stat.isDecimal && stat.suffix}
                  </div>
                  <div className="text-[10px] text-neutral-600 font-medium">{stat.label}</div>
                </div>
                {i < 2 && <div className="w-px h-8 bg-white/8 mx-2" />}
              </div>
            ))}
            <div className="flex items-center gap-0.5 ml-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
          </motion.div>

          {/* ── Billing Toggle ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="flex justify-center mb-16"
          >
            <div className="relative flex items-center gap-1 p-1.5 rounded-2xl bg-neutral-900/70 border border-white/5 backdrop-blur-sm shadow-xl">
              {(["monthly", "yearly"] as BillingPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setBilling(period)}
                  className={cn(
                    "relative px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-250 flex items-center gap-2.5",
                    billing === period
                      ? "bg-white text-black shadow-lg"
                      : "text-neutral-500 hover:text-neutral-300"
                  )}
                >
                  {period === "monthly" ? "Monthly" : "Yearly"}
                  {period === "yearly" && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black normal-case tracking-normal transition-colors",
                      billing === "yearly"
                        ? "bg-emerald-900/60 text-emerald-300"
                        : "bg-emerald-500/15 text-emerald-400"
                    )}>
                      Save 17%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Plan Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 items-start">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <PlanCard
                  plan={plan} billing={billing}
                  onSelect={handleSelectPlan} isProcessing={isProcessing} selectedId={selectedId}
                />
              </motion.div>
            ))}
          </div>

          {/* ── Trial / guarantee note ── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center mt-8 space-y-2"
          >
            <p className="text-xs text-neutral-600 font-medium flex items-center justify-center gap-2">
              <ShieldCheck size={13} className="text-emerald-500" />
              Pro & Power include a 7-day free trial · No credit card required during trial · Cancel anytime
            </p>
          </motion.div>

          {/* ── What you get section (Value reinforcement) ── */}
          <div className="mt-24 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                One subscription. Every tool you need.
              </h2>
              <p className="text-neutral-500 max-w-md mx-auto text-sm">
                Stop juggling 5 different apps. Paperxify is your all-in-one study co-pilot.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Brain, title: "AI Note Generation", desc: "Structured notes from any YouTube video, instantly", color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15" },
                { icon: FileText, title: "PDF Export", desc: "Beautiful, clean PDFs ready to print or share", color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
                { icon: Zap, title: "Flashcards", desc: "Auto-generated study cards from your notes", color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
                { icon: Globe, title: "Multi-Language", desc: "Notes in English, German, Spanish, French & more", color: "text-violet-400", bg: "bg-violet-500/8 border-violet-500/15" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                  className={cn("p-5 rounded-2xl border flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200", item.bg)}
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", item.bg)}>
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Comparison Table ── */}
          <div className="mb-20">
            <div className="text-center mb-6">
              <button
                onClick={() => setCompareOpen(o => !o)}
                className="group inline-flex items-center gap-2.5 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                <BarChart3 size={15} className="text-neutral-600 group-hover:text-white transition-colors" />
                Full feature comparison
                <ChevronDown size={15} className={cn("transition-transform duration-300", compareOpen && "rotate-180")} />
              </button>
              <p className="text-[11px] text-neutral-700 mt-1">See exactly what each plan includes.</p>
            </div>

            <AnimatePresence>
              {compareOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto rounded-2xl border border-white/5 shadow-2xl">
                    <table className="w-full text-sm min-w-[560px]">
                      <thead>
                        <tr className="border-b border-white/5 bg-neutral-900/80">
                          <th className="text-left p-4 pl-6 text-neutral-500 font-semibold text-xs uppercase tracking-wider w-[40%]">Feature</th>
                          <th className="text-center p-4 text-neutral-400 font-bold text-xs w-[20%]">Free</th>
                          <th className="text-center p-4 text-white font-black text-xs bg-white/[0.04] w-[20%]">
                            Pro <span className="text-neutral-500 font-normal">— ${billing === "monthly" ? "9" : "72"}</span>
                          </th>
                          <th className="text-center p-4 text-violet-300 font-bold text-xs w-[20%]">
                            Power <span className="text-neutral-500 font-normal">— ${billing === "monthly" ? "19" : "144"}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARE_ROWS.map((row, i) => (
                          <tr
                            key={row.feature}
                            className={cn(
                              "border-b border-white/[0.03] transition-colors hover:bg-white/[0.015]",
                              i % 2 === 0 ? "bg-black/10" : "bg-transparent"
                            )}
                          >
                            <td className="p-3 pl-6 text-neutral-400 text-xs font-medium">{row.feature}</td>
                            <td className="p-3 text-center"><CellValue val={row.free} /></td>
                            <td className="p-3 text-center bg-white/[0.02]"><CellValue val={row.pro} isPro /></td>
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

          {/* ── Testimonials ── */}
          <div className="mb-24">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Loved by 24,000+ students</h2>
              <p className="text-sm text-neutral-500">Real students. Real results.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed mb-4 font-medium">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center text-xs font-black text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[10px] text-neutral-600">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="mb-20 max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">Frequently asked questions</h2>
              <p className="text-sm text-neutral-500">Everything you need to know before you commit.</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>

          {/* ── Final CTA Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-neutral-900 to-black p-10 md:p-16 text-center"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6">
                <Flame size={10} className="text-orange-400" /> Start learning smarter today
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                Your first 7 days are free.
              </h2>
              <p className="text-neutral-400 max-w-sm mx-auto text-sm mb-8 leading-relaxed">
                No credit card. No risk. Just better notes starting from your very first video.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handleSelectPlan(PLANS[1])}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-white text-black font-black text-sm uppercase tracking-wider rounded-2xl hover:bg-neutral-100 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] flex items-center gap-2"
                >
                  {isProcessing && selectedId === "pro" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={14} />}
                  Start Free Trial — Pro
                </button>
                <button
                  onClick={() => handleSelectPlan(PLANS[0])}
                  className="px-8 py-4 text-neutral-400 hover:text-white text-sm font-semibold transition-colors"
                >
                  Or continue with Free →
                </button>
              </div>
              <p className="text-[11px] text-neutral-700 mt-5 flex items-center justify-center gap-1.5">
                <ShieldCheck size={11} className="text-neutral-600" />
                PayPal & LemonSqueezy · 256-bit SSL · Cancel anytime
              </p>
            </div>
          </motion.div>

          {/* ── Trust Strip ── */}
          <div className="mt-14 flex flex-wrap justify-center gap-x-10 gap-y-4">
            {[
              { icon: ShieldCheck, text: "256-bit SSL Encryption" },
              { icon: Activity, text: "99.9% Uptime" },
              { icon: Lock, text: "PayPal Secured" },
              { icon: Zap, text: "Instant Access" },
              { icon: BadgeCheck, text: "No Hidden Fees" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-neutral-700 hover:text-neutral-400 transition-colors">
                <Icon size={12} className="shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">{text}</span>
              </div>
            ))}
            {/* LemonSqueezy badge */}
            <div className="flex items-center gap-2 text-neutral-700 hover:text-neutral-400 transition-colors">
              <span className="text-xs leading-none">🍋</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">LemonSqueezy</span>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}