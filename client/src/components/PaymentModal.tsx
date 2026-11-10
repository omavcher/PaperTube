"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ShieldCheck,
  Loader2,
  Check,
  Crown,
  Sparkles,
  Zap,
  Clock,
  Layers,
  Brain,
  FileText,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  ArrowRight,
  Globe,
  User,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import { trackDbActivity } from "@/utils/analytics";

export type BillingPeriod = "monthly" | "yearly";

export interface PlanPaymentInfo {
  id: "free" | "pro" | "power";
  name: string;
  usd: { monthly: number; yearly: number; yearlyPerMonth: number; saving?: string };
  inr: { monthly: number; yearly: number; yearlyPerMonth: number; saving?: string };
}

// ─── Razorpay Script Loader ──────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const existing = document.querySelector("script[src*='checkout.razorpay.com']");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── PayPal SDK Button ────────────────────────────────────────────────────────
export function PayPalSDKButton({
  plan,
  billing,
  onSuccess,
  onError,
}: {
  plan: PlanPaymentInfo;
  billing: BillingPeriod;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const res = await api.get("/payment/paypal/config");
        if (res.data?.success && res.data?.clientId) {
          if (isMounted) setActiveClientId(res.data.clientId);
          return;
        }
      } catch {}
      const envId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      if (isMounted && envId && envId !== "YOUR_PAYPAL_CLIENT_ID") {
        setActiveClientId(envId);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeClientId) return;

    const scriptId = `paypal-sdk-script-${activeClientId}`;
    if (document.getElementById(scriptId)) {
      if ((window as any).paypal) setSdkReady(true);
      return;
    }

    const existing = document.querySelector("script[src*='paypal.com/sdk/js']");
    if (existing) existing.remove();

    const s = document.createElement("script");
    s.id = scriptId;
    s.src = `https://www.paypal.com/sdk/js?client-id=${activeClientId}&currency=USD&intent=capture&components=buttons`;
    s.async = true;
    s.onload = () => setSdkReady(true);
    s.onerror = () => {
      onErrorRef.current("PayPal failed to load. Please check your internet connection.");
    };
    document.body.appendChild(s);
  }, [activeClientId]);

  useEffect(() => {
    if (!sdkReady || !containerRef.current || !(window as any).paypal) return;

    containerRef.current.innerHTML = "";
    try {
      (window as any).paypal
        .Buttons({
          style: { layout: "vertical", color: "blue", shape: "pill", label: "pay", height: 40 },
          createOrder: async () => {
            trackDbActivity(`/pricing/payment-start-paypal/${plan.id}/${billing}`);
            const token = localStorage.getItem("authToken");
            const res = await api.post(
              "/payment/paypal/create-order",
              { planId: plan.id, billingPeriod: billing },
              { headers: { Auth: token, Authorization: token ? `Bearer ${token}` : undefined } }
            );
            if (!res.data.success || !res.data.orderId) {
              throw new Error(res.data?.message || "Failed to create PayPal order");
            }
            return res.data.orderId;
          },
          onApprove: async (data: any) => {
            setIsProcessing(true);
            const token = localStorage.getItem("authToken");
            const orderId = data.orderID || data.orderId;

            try {
              const res = await api.post(
                "/payment/paypal/capture-order",
                { orderId, planId: plan.id, billingPeriod: billing },
                { headers: { Auth: token, Authorization: token ? `Bearer ${token}` : undefined } }
              );

              if (res.data?.success) {
                if (res.data.user) {
                  localStorage.setItem("user", JSON.stringify(res.data.user));
                }
                window.dispatchEvent(new Event("auth-change"));
                window.dispatchEvent(new Event("capacity-updated"));
                toast.success("PayPal subscription activated successfully!");
                onSuccessRef.current();
              } else {
                throw new Error(res.data?.message || "Capture could not be finalized.");
              }
            } catch (err: any) {
              try {
                const syncRes = await api.post(
                  "/payment/paypal/sync-order",
                  { orderId },
                  { headers: { Auth: token, Authorization: token ? `Bearer ${token}` : undefined } }
                );

                if (syncRes.data?.success) {
                  if (syncRes.data.user) {
                    localStorage.setItem("user", JSON.stringify(syncRes.data.user));
                  }
                  window.dispatchEvent(new Event("auth-change"));
                  window.dispatchEvent(new Event("capacity-updated"));
                  toast.success("Payment verified and subscription activated!");
                  onSuccessRef.current();
                  return;
                }
              } catch {}

              const msg =
                err?.response?.data?.message ||
                err?.message ||
                "PayPal capture failed. If money was deducted, click 'Sync PayPal' in your profile.";
              onErrorRef.current(msg);
            } finally {
              setIsProcessing(false);
            }
          },
          onCancel: () => {
            setIsProcessing(false);
          },
          onError: (e: any) => {
            console.error("PayPal SDK error:", e);
            setIsProcessing(false);
            onErrorRef.current("PayPal checkout encountered an error. Please try again.");
          },
        })
        .render(containerRef.current);
    } catch (renderErr: any) {
      console.error("Failed to render PayPal buttons:", renderErr);
    }
  }, [sdkReady, plan.id, billing]);

  if (!activeClientId) {
    return (
      <div className="h-10 flex items-center justify-center gap-2 text-neutral-400 text-xs">
        <Loader2 size={13} className="animate-spin" /> Initializing PayPal…
      </div>
    );
  }

  if (!sdkReady || isProcessing) {
    return (
      <div className="h-10 flex items-center justify-center gap-2 text-neutral-400 text-xs">
        <Loader2 size={13} className="animate-spin text-blue-400" />
        <span>{isProcessing ? "Confirming payment with PayPal…" : "Loading PayPal…"}</span>
      </div>
    );
  }

  return <div ref={containerRef} id="paypal-button-container" className="w-full min-h-[40px]" />;
}

// ─── Plan Capability Definitions ──────────────────────────────────────────────
interface FeatureItem {
  icon: any;
  title: string;
  badge?: string;
}

function getPlanFeatures(planId: "pro" | "power" | "free"): FeatureItem[] {
  if (planId === "power") {
    return [
      { icon: Clock, title: "Marathon Lectures up to 8 Hours Long", badge: "8 hrs max" },
      { icon: Sparkles, title: "350 Video Notes / Month (~100 hrs content)", badge: "350 notes" },
      { icon: Layers, title: "30 Executive Presentation Decks (40 slides)", badge: "PPTX Export" },
      { icon: Brain, title: "10,000 PaperChat AI Tutor Conversations", badge: "10k chats" },
      { icon: Zap, title: "Unlimited Flashcards, Quizzes & Mind Maps", badge: "Unlimited" },
      { icon: FileText, title: "All Exports: DOCX, PPTX, LaTeX PDF, Anki", badge: "All Formats" },
      { icon: Crown, title: "Instant Turbo Agent Priority GPU Queue", badge: "0 Wait" },
    ];
  }

  return [
    { icon: Clock, title: "Deep Video Lectures up to 4 Hours Long", badge: "4 hrs max" },
    { icon: Sparkles, title: "120 Video Notes / Month (~30 hrs study)", badge: "120 notes" },
    { icon: Layers, title: "10 Presentation Decks (up to 20 slides)", badge: "PPTX Export" },
    { icon: Brain, title: "2,000 PaperChat AI Tutor Conversations", badge: "2,000 chats" },
    { icon: Zap, title: "Unlimited Active-Recall Cards & 30 Quiz Sets", badge: "Unlimited" },
    { icon: FileText, title: "LaTeX Publication PDF, Notion & Anki Decks", badge: "LaTeX & Anki" },
    { icon: ShieldCheck, title: "Priority Processing Queue with Zero Delay", badge: "Priority" },
  ];
}

// ─── Main Payment / Order Summary Modal ──────────────────────────────────────
export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  billing,
  onLemon,
  onPayPalSuccess,
  isLemonLoading,
  user,
  region = "IN",
}: {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanPaymentInfo | null;
  billing: BillingPeriod;
  onLemon: () => void;
  onPayPalSuccess: () => void;
  isLemonLoading: boolean;
  user?: any;
  region?: "IN" | "GLOBAL";
}) {
  const [selectedBilling, setSelectedBilling] = useState<BillingPeriod>(billing);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<"india" | "global">("india");
  const [showUpiComingSoon, setShowUpiComingSoon] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);

  const handleUpiClick = () => {
    setShowUpiComingSoon(true);
    toast.info(
      "⚡ UPI payments are launching soon! Please use Card / PayPal for instant access, or contact support for manual UPI.",
      { duration: 4000 }
    );
  };

  useEffect(() => {
    if (billing) setSelectedBilling(billing);
  }, [billing, plan?.id]);

  if (!isOpen || !plan) return null;

  const isIndia = region === "IN";
  const currencySymbol = isIndia ? "₹" : "$";
  const currencyCode = isIndia ? "INR" : "USD";

  const pricingData = isIndia ? plan.inr : plan.usd;
  const isYearly = selectedBilling === "yearly";

  const monthlyRate = pricingData.monthly;
  const yearlyRate = pricingData.yearly;
  const yearlyPerMonth = pricingData.yearlyPerMonth;

  const totalAmount = isYearly ? yearlyRate : monthlyRate;
  const fullYearValue = monthlyRate * 12;
  const annualSavings = isYearly ? Math.max(0, fullYearValue - yearlyRate) : 0;
  const savingPercentage =
    isYearly && fullYearValue > 0
      ? Math.round((annualSavings / fullYearValue) * 100)
      : plan.id === "power"
      ? 32
      : 27;

  const fmt = (num: number) =>
    isIndia ? num.toLocaleString("en-IN") : num.toFixed(2);

  const features = getPlanFeatures(plan.id);

  // ─── Razorpay Handler ───────────────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setIsRazorpayLoading(true);
    trackDbActivity(`/pricing/payment-start-razorpay/${plan.id}/${selectedBilling}`);

    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        toast.error("Razorpay SDK could not be loaded. Please check your internet connection.");
        setIsRazorpayLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      const orderPayload = {
        packageId: plan.id,
        packageType: "subscription",
        finalAmount: totalAmount,
        billingPeriod: selectedBilling,
        packageName: plan.name,
      };

      const res = await api.post("/payment/create-order", orderPayload, {
        headers: { Auth: token },
      });

      if (!res.data?.success || !res.data?.order) {
        throw new Error(res.data?.message || "Failed to create payment order");
      }

      const orderData = res.data.order;
      const keyId = res.data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Paperxify",
        description: `${plan.name} — ${isYearly ? "Annual Plan (365 Days)" : "Monthly Plan (30 Days)"}`,
        image: "https://paperxify.com/icons/icon-192x192.png",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              packageId: plan.id,
              packageType: "subscription",
              finalAmount: totalAmount,
              billingPeriod: selectedBilling,
              status: "success",
            };

            const verifyRes = await api.post("/payment/verify", verifyPayload, {
              headers: { Auth: token },
            });

            if (verifyRes.data?.success) {
              if (verifyRes.data?.data?.membership) {
                const existing = (() => {
                  try {
                    return JSON.parse(localStorage.getItem("user") || "{}");
                  } catch {
                    return {};
                  }
                })();
                const updated = {
                  ...existing,
                  membership: verifyRes.data.data.membership,
                  tokens: verifyRes.data.data.tokens,
                  rank: plan.id,
                };
                localStorage.setItem("user", JSON.stringify(updated));
              }

              window.dispatchEvent(new Event("auth-change"));
              window.dispatchEvent(new Event("capacity-updated"));
              toast.success(`🎉 Subscription activated! Welcome to ${plan.name}.`);
              onPayPalSuccess();
            } else {
              toast.error(verifyRes.data?.message || "Payment verification failed.");
            }
          } catch (verErr: any) {
            console.error("Verification error:", verErr);
            toast.error(
              verErr?.response?.data?.message ||
                "Payment received, but verification pending. Please refresh your profile."
            );
          } finally {
            setIsRazorpayLoading(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phoneNumber || "",
        },
        theme: {
          color: "#ef4444",
        },
        modal: {
          ondismiss: function () {
            setIsRazorpayLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        toast.error(resp.error?.description || "Payment was not completed.");
        setIsRazorpayLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to start checkout");
      setIsRazorpayLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* ═════════════════════════════════════════════════════════════════════
            DESKTOP / LAPTOP MODAL (md: and above)
            ═════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="hidden md:flex relative w-full max-w-4xl bg-[#0b0b0f] border border-white/10 rounded-[28px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),0_0_50px_rgba(239,68,68,0.08)] overflow-hidden z-10 text-white max-h-[88vh] my-auto"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 blur-[110px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 blur-[110px] rounded-full pointer-events-none" />

          {/* Dedicated Close Button (In clear top-right area, no overlap) */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-30 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer border border-white/[0.08]"
            aria-label="Close checkout"
          >
            <X size={15} />
          </button>

          {/* ── Left Column: Plan Capabilities & Value Proposition ─────────── */}
          <div className="w-[44%] bg-[#0e0e13]/90 p-6 lg:p-7 border-r border-white/[0.08] flex flex-col justify-between relative">
            <div>
              {/* Badge & Plan Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1 shadow-sm">
                  {plan.id === "power" ? <Crown size={10} /> : <Sparkles size={10} />}
                  {plan.id === "power" ? "POWER SCHOLAR 👑" : "PRO SCHOLAR ⭐"}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">Instant Activation</span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                {plan.name}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {plan.id === "power"
                  ? "Maximum academic horsepower for marathon lectures, full playlists, and unlimited recall practice."
                  : "Complete academic superpower for video lecture synthesis, presentations, and active study mastery."}
              </p>

              {/* What We Are Providing Section */}
              <div className="mt-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> What You Get In This Plan
                </div>

                <div className="space-y-1.5">
                  {features.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.025] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-5 h-5 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                            <Icon size={11} />
                          </div>
                          <span className="text-xs text-neutral-200 font-medium truncate">
                            {item.title}
                          </span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Trust Indicators */}
            <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-[10.5px] text-neutral-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck size={13} /> 256-Bit SSL Encrypted
              </div>
              <div className="text-neutral-400">Cancel anytime with 1 click</div>
            </div>
          </div>

          {/* ── Right Column: Order Summary, Pricing & Checkout ──────────────── */}
          <div className="w-[56%] p-6 lg:p-7 flex flex-col justify-between bg-[#0b0b0f] pr-12 lg:pr-14">
            <div>
              {/* Header with Step and Logged-in User Badge */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                    SECURE ORDER SUMMARY
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-0.5">Complete Your Subscription</h3>

                {user?.email && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-neutral-300">
                    <User size={11} className="text-neutral-400 shrink-0" />
                    <span>
                      Account: <strong className="text-white font-semibold">{user.email}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Billing Cycle Selector Toggle */}
              <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-1 flex items-center gap-1 mb-4 shadow-inner">
                <button
                  type="button"
                  onClick={() => setSelectedBilling("monthly")}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center",
                    selectedBilling === "monthly"
                      ? "bg-white text-neutral-900 shadow-md scale-[1.01]"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  Monthly Plan
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                    {currencySymbol}
                    {fmt(monthlyRate)} / month
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBilling("yearly")}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer relative text-center",
                    selectedBilling === "yearly"
                      ? "bg-white text-neutral-900 shadow-md scale-[1.01]"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-sm">
                    SAVE {savingPercentage}%
                  </span>
                  Annual Plan
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                    {currencySymbol}
                    {fmt(yearlyPerMonth)} / mo eq.
                  </span>
                </button>
              </div>

              {/* Itemized Order Summary Box (Receipt Style) */}
              <div className="bg-[#101015] border border-white/[0.08] rounded-2xl p-4 mb-4 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Plan:</span>
                  <span className="font-bold text-white">
                    {plan.name} · {isYearly ? "Annual (365 Days Access)" : "Monthly (30 Days Access)"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Standard Price:</span>
                  <span className="font-semibold text-neutral-300">
                    {isYearly ? (
                      <>
                        <span className="line-through text-neutral-500 mr-1.5">
                          {currencySymbol}
                          {fmt(fullYearValue)}
                        </span>
                        <span>
                          {currencySymbol}
                          {fmt(yearlyRate)}
                        </span>
                      </>
                    ) : (
                      <>
                        {currencySymbol}
                        {fmt(monthlyRate)}
                      </>
                    )}
                  </span>
                </div>

                {isYearly && annualSavings > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Sparkles size={11} /> Annual Savings ({savingPercentage}% OFF):
                    </span>
                    <span className="font-bold">
                      - {currencySymbol}
                      {fmt(annualSavings)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Taxes & Fees:</span>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {isIndia ? "18% GST Included (Zero Hidden Fees)" : "Taxes Included"}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-dashed border-white/[0.1] flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Total Payable Amount
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {isYearly ? "One-time annual billing" : "Monthly billing • Cancel anytime"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {currencySymbol}
                      {fmt(totalAmount)}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 px-1 py-0.5 rounded bg-white/[0.06]">
                      {currencyCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Payment Options Section ─────────────────────────────────── */}
              {isIndia ? (
                <div>
                  {/* Payment Method Tabs for India */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentTab("india");
                        setShowUpiComingSoon(false);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                        selectedPaymentTab === "india"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "text-neutral-400 hover:text-white bg-white/[0.03]"
                      )}
                    >
                      <span>⚡ UPI & QR Pay</span>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Coming Soon
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentTab("global");
                        setShowUpiComingSoon(false);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                        selectedPaymentTab === "global"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-neutral-400 hover:text-white bg-white/[0.03]"
                      )}
                    >
                      <Globe size={11} />
                      <span>Card / PayPal (Instant Access)</span>
                    </button>
                  </div>

                  {selectedPaymentTab === "india" ? (
                    <div>
                      {/* UPI Coming Soon Notice Card */}
                      {showUpiComingSoon && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-white space-y-2 mb-3 shadow-lg"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                              <Sparkles size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                                  UPI Payment Coming Soon!
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setShowUpiComingSoon(false)}
                                  className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                              <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                                Direct UPI (GPay, PhonePe, Paytm, QR) integration is in final testing. For instant activation, you can use Debit/Credit Card or PayPal right now!
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-500/20 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPaymentTab("global");
                                setShowUpiComingSoon(false);
                              }}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-white text-neutral-900 font-bold text-xs hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <CreditCard size={13} />
                              <span>Pay via Card / PayPal Instead</span>
                            </button>
                            <a
                              href="mailto:omawchar07@gmail.com?subject=Manual%20UPI%20Activation%20Request%20for%20Paperxify"
                              className="py-1.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-neutral-200 font-medium text-xs transition-colors flex items-center justify-center gap-1 border border-white/10"
                            >
                              <span>Manual UPI Help</span>
                            </a>
                          </div>
                        </motion.div>
                      )}

                      {/* Primary UPI Button with Coming Soon Trigger */}
                      <button
                        type="button"
                        onClick={handleUpiClick}
                        className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 p-3.5 text-white font-bold text-sm shadow-[0_12px_30px_-8px_rgba(239,68,68,0.5)] transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>
                          Pay {currencySymbol}
                          {fmt(totalAmount)} via UPI (GPay / PhonePe)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-black/40 text-amber-300 border border-amber-400/40">
                          Coming Soon
                        </span>
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {/* Payment badges */}
                      <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-neutral-400 pt-2 flex-wrap">
                        <span className="font-semibold text-neutral-300">Supported:</span>
                        <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] text-neutral-300">
                          Google Pay
                        </span>
                        <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] text-neutral-300">
                          PhonePe
                        </span>
                        <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] text-neutral-300">
                          Paytm
                        </span>
                        <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] text-neutral-300">
                          RuPay / Cards
                        </span>
                        <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] text-neutral-300">
                          NetBanking
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Global / PayPal in India fallback tab */
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <PayPalSDKButton
                        plan={plan}
                        billing={selectedBilling}
                        onSuccess={onPayPalSuccess}
                        onError={(m) => toast.error(m)}
                      />
                      <button
                        type="button"
                        onClick={onLemon}
                        disabled={isLemonLoading}
                        className="w-full h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isLemonLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <>
                            <CreditCard size={13} /> Pay with International Card (LemonSqueezy)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Global payment options */
                <div className="space-y-2">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-2.5">
                    <PayPalSDKButton
                      plan={plan}
                      billing={selectedBilling}
                      onSuccess={onPayPalSuccess}
                      onError={(m) => toast.error(m)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onLemon}
                    disabled={isLemonLoading}
                    className="w-full h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLemonLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={13} /> Pay with Credit / Debit Card (LemonSqueezy)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Security Footer */}
            <div className="pt-3 border-t border-white/[0.06] mt-3 flex items-center justify-center gap-2 text-[10px] text-neutral-400">
              <Lock size={10} className="text-neutral-400" />
              <span>Payments are encrypted and secured. Zero surprise fees.</span>
            </div>
          </div>
        </motion.div>

        {/* ═════════════════════════════════════════════════════════════════════
            MOBILE BOTTOM SHEET DRAWER (< md)
            ═════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="md:hidden fixed inset-x-0 bottom-0 max-h-[92vh] bg-[#0c0c10] border-t border-white/10 rounded-t-[28px] shadow-2xl overflow-y-auto z-10 text-white flex flex-col p-4.5"
        >
          {/* Top visual drag handle */}
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3.5 shrink-0" />

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                  {plan.id === "power" ? "POWER SCHOLAR 👑" : "PRO SCHOLAR ⭐"}
                </span>
                <span className="text-[10px] text-neutral-400">Order Summary</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">{plan.name}</h3>
              {user?.email && (
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Account: <strong className="text-neutral-200">{user.email}</strong>
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/[0.08] text-neutral-400 hover:text-white border border-white/10"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Billing Cycle Selector Pill */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 flex items-center gap-1 mb-3.5">
            <button
              type="button"
              onClick={() => setSelectedBilling("monthly")}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center",
                selectedBilling === "monthly"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-400"
              )}
            >
              Monthly ({currencySymbol}
              {fmt(monthlyRate)})
            </button>
            <button
              type="button"
              onClick={() => setSelectedBilling("yearly")}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center relative",
                selectedBilling === "yearly"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-400"
              )}
            >
              <span className="absolute -top-2 right-1 px-1 py-0.1 rounded text-[7.5px] font-black uppercase bg-emerald-500 text-black">
                SAVE {savingPercentage}%
              </span>
              Annual ({currencySymbol}
              {fmt(yearlyRate)})
            </button>
          </div>

          {/* Collapsible "What's Included" Accordion for mobile */}
          <div className="mb-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
              className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-neutral-200"
            >
              <span className="flex items-center gap-1.5 text-red-400">
                <Sparkles size={12} />
                <span>What&apos;s included in this plan ({features.length} features)</span>
              </span>
              {mobileFeaturesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {mobileFeaturesOpen && (
              <div className="px-3 pb-3 space-y-1.5 border-t border-white/[0.04] pt-2">
                {features.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span className="text-neutral-300 font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary Receipt Box */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-xl p-3.5 mb-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Billing Cycle:</span>
              <span className="text-white font-medium">
                {isYearly ? "Annual (365 Days Access)" : "Monthly (30 Days Access)"}
              </span>
            </div>

            <div className="flex justify-between text-neutral-400">
              <span>Plan Price:</span>
              <span className="text-neutral-200">
                {isYearly && (
                  <span className="line-through text-neutral-500 mr-1.5">
                    {currencySymbol}
                    {fmt(fullYearValue)}
                  </span>
                )}
                {currencySymbol}
                {fmt(totalAmount)}
              </span>
            </div>

            {isYearly && annualSavings > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Annual Discount ({savingPercentage}% OFF):</span>
                <span className="font-bold">
                  - {currencySymbol}
                  {fmt(annualSavings)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-neutral-400">
              <span>Taxes:</span>
              <span className="text-emerald-400 font-medium">
                {isIndia ? "18% GST (Included)" : "Included"}
              </span>
            </div>

            <div className="pt-2 border-t border-dashed border-white/[0.1] flex justify-between items-baseline">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                Total Payable:
              </span>
              <div className="text-right flex items-baseline gap-1">
                <span className="text-xl font-black text-white">
                  {currencySymbol}
                  {fmt(totalAmount)}
                </span>
                <span className="text-[10px] text-neutral-400 font-normal">
                  {currencyCode}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Payment Actions */}
          <div className="space-y-2 pb-2">
            {isIndia ? (
              <>
                {/* Mobile Tabs */}
                <div className="flex items-center gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentTab("india");
                      setShowUpiComingSoon(false);
                    }}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1",
                      selectedPaymentTab === "india"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "text-neutral-400 bg-white/[0.03]"
                    )}
                  >
                    <span>⚡ UPI</span>
                    <span className="text-[7.5px] uppercase font-black px-1 rounded bg-amber-500/20 text-amber-300">
                      Soon
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentTab("global");
                      setShowUpiComingSoon(false);
                    }}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1",
                      selectedPaymentTab === "global"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "text-neutral-400 bg-white/[0.03]"
                    )}
                  >
                    <Globe size={11} />
                    <span>Card / PayPal</span>
                  </button>
                </div>

                {selectedPaymentTab === "india" ? (
                  <>
                    {/* Mobile UPI Coming Soon Card */}
                    {showUpiComingSoon && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-white space-y-2 mb-2">
                        <div className="flex items-start gap-2">
                          <Sparkles size={14} className="text-amber-300 shrink-0 mt-0.5" />
                          <div className="flex-1 text-xs">
                            <span className="font-bold text-amber-300 block">
                              UPI Payments Coming Soon!
                            </span>
                            <span className="text-[11px] text-neutral-300 mt-0.5 block leading-tight">
                              Direct UPI is in final review. For instant access right now, please use Card / PayPal below.
                            </span>
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-amber-500/20 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPaymentTab("global");
                              setShowUpiComingSoon(false);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-white text-neutral-900 font-bold text-[11px] flex items-center justify-center gap-1"
                          >
                            <CreditCard size={11} />
                            <span>Pay via Card / PayPal</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleUpiClick}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer"
                    >
                      <span>
                        Pay {currencySymbol}
                        {fmt(totalAmount)} via UPI
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-black/40 text-amber-300 border border-amber-400/40">
                        Coming Soon
                      </span>
                      <ArrowRight size={14} />
                    </button>

                    <div className="text-center text-[10px] text-neutral-400">
                      Google Pay · PhonePe · Paytm · RuPay · NetBanking
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 pt-1">
                    <PayPalSDKButton
                      plan={plan}
                      billing={selectedBilling}
                      onSuccess={onPayPalSuccess}
                      onError={(m) => toast.error(m)}
                    />
                    <button
                      type="button"
                      onClick={onLemon}
                      disabled={isLemonLoading}
                      className="w-full py-2.5 rounded-xl bg-white/[0.06] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isLemonLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          <CreditCard size={13} />
                          <span>Pay with Credit / Debit Card (LemonSqueezy)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <PayPalSDKButton
                  plan={plan}
                  billing={selectedBilling}
                  onSuccess={onPayPalSuccess}
                  onError={(m) => toast.error(m)}
                />
                <button
                  type="button"
                  onClick={onLemon}
                  disabled={isLemonLoading}
                  className="w-full py-2.5 rounded-xl bg-white/[0.06] text-white text-xs font-semibold"
                >
                  {isLemonLoading ? (
                    <Loader2 size={14} className="animate-spin mx-auto" />
                  ) : (
                    "Credit / Debit Card (LemonSqueezy)"
                  )}
                </button>
              </>
            )}
          </div>

          {/* Reassurance */}
          <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>256-Bit SSL Encrypted · Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
