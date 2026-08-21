"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, Loader2 } from "lucide-react";
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

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId || clientId === "YOUR_PAYPAL_CLIENT_ID") {
      onError("PayPal not configured.");
      return;
    }
    const scriptId = "paypal-sdk-script";
    if (document.getElementById(scriptId)) {
      if ((window as any).paypal) setSdkReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = scriptId;
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    s.async = true;
    s.onload = () => setSdkReady(true);
    s.onerror = () => onError("PayPal failed to load.");
    document.body.appendChild(s);
  }, [onError]);

  useEffect(() => {
    if (!sdkReady || !containerRef.current || !(window as any).paypal) return;
    containerRef.current.innerHTML = "";
    (window as any).paypal
      .Buttons({
        style: { layout: "vertical", color: "blue", shape: "pill", label: "pay", height: 44 },
        createOrder: async () => {
          trackDbActivity(`/pricing/payment-start-paypal/${plan.id}/${billing}`);
          const token = localStorage.getItem("authToken");
          const res = await api.post(
            "/payment/paypal/create-order",
            { planId: plan.id, billingPeriod: billing },
            { headers: { Auth: token } }
          );
          if (!res.data.success) throw new Error(res.data.message);
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
            else onError("Capture failed — contact support.");
          } catch (e: any) {
            onError(e?.response?.data?.message || "Capture failed");
          }
        },
        onError: (e: any) => {
          console.error("PayPal error:", e);
          onError("PayPal payment failed.");
        },
      })
      .render(containerRef.current);
  }, [sdkReady, plan.id, billing, onSuccess, onError]);

  if (!sdkReady) {
    return (
      <div className="h-11 flex items-center justify-center gap-2 text-neutral-400 text-xs">
        <Loader2 size={14} className="animate-spin" /> Loading PayPal…
      </div>
    );
  }
  return <div ref={containerRef} id="paypal-button-container" className="w-full" />;
}

// ─── Payment Modal Component ──────────────────────────────────────────────────
export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  billing,
  onLemon,
  onPayPalSuccess,
  isLemonLoading,
  user,
  region,
}: {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanPaymentInfo | null;
  billing: BillingPeriod;
  onLemon: () => void;
  onPayPalSuccess: () => void;
  isLemonLoading: boolean;
  user: any;
  region: "IN" | "GLOBAL";
}) {
  const isIndia = region === "IN";
  // Indian users see Razorpay/UPI tab first by default
  const [tab, setTab] = useState<"global" | "india">(isIndia ? "india" : "global");
  const [isRzpLoading, setIsRzpLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(region === "IN" ? "india" : "global");
    }
  }, [isOpen, region]);

  const handleRazorpay = async () => {
    if (!plan) return;
    setIsRzpLoading(true);
    trackDbActivity(`/pricing/payment-start-razorpay/${plan.id}/${billing}`);
    try {
      // Dynamically load Razorpay SDK
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = reject;
        document.body.appendChild(s);
      });
      const token = localStorage.getItem("authToken");
      const inrPrice = billing === "monthly" ? plan.inr.monthly : plan.inr.yearly;
      const res = await api.post(
        "/payment/create-order",
        {
          packageId: plan.id,
          packageType: "subscription",
          finalAmount: inrPrice,
          billingPeriod: billing,
          packageName: plan.name,
        },
        { headers: { Auth: token } }
      );
      if (!res.data.success) {
        toast.error(res.data.message || "Could not create order");
        setIsRzpLoading(false);
        return;
      }
      const rzp = new (window as any).Razorpay({
        key: res.data.key,
        amount: res.data.order.amount,
        currency: "INR",
        name: "Paperxify",
        description: `${plan.name} (${billing})`,
        order_id: res.data.order.id,
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#ef4444" },
        handler: async (response: any) => {
          const vRes = await api.post(
            "/payment/verify",
            {
              ...response,
              packageId: plan.id,
              packageType: "subscription",
              finalAmount: inrPrice,
              billingPeriod: billing,
              status: "success",
            },
            { headers: { Auth: token } }
          );
          if (vRes.data.success) {
            onClose();
            onPayPalSuccess();
          } else {
            toast.error("Verification failed — contact support.");
          }
          setIsRzpLoading(false);
        },
        modal: { ondismiss: () => setIsRzpLoading(false) },
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Razorpay failed");
      setIsRzpLoading(false);
    }
  };

  if (!plan) return null;
  const price = billing === "monthly" ? plan.usd.monthly : plan.usd.yearly;
  const inrPrice = billing === "monthly" ? plan.inr.monthly : plan.inr.yearly;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-sm bg-[#0d0d10] border border-white/[0.1] rounded-3xl p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 transition-colors"
            >
              <X size={15} />
            </button>
            <div className="mb-4">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                SECURE CHECKOUT
              </span>
              <h3 className="text-xl font-bold text-white mt-1.5">{plan.name}</h3>
              <p className="text-xs text-neutral-400">
                {tab === "india" ? (
                  billing === "monthly"
                    ? `₹${inrPrice.toLocaleString("en-IN")}/month`
                    : `₹${inrPrice.toLocaleString("en-IN")}/year (₹${plan.inr.yearlyPerMonth}/mo)`
                ) : (
                  billing === "monthly"
                    ? `$${price.toFixed(2)}/month`
                    : `$${price.toFixed(2)}/year ($${plan.usd.yearlyPerMonth.toFixed(2)}/mo)`
                )}
              </p>
            </div>

            {/* Tab selector — India users see UPI first */}
            <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs mb-4">
              {isIndia ? (
                <>
                  <button
                    onClick={() => setTab("india")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all",
                      tab === "india" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    🇮🇳 UPI / India (₹{inrPrice.toLocaleString("en-IN")})
                  </button>
                  <button
                    onClick={() => setTab("global")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all",
                      tab === "global" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    💳 PayPal / Card (USD)
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setTab("global")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all",
                      tab === "global" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    💳 PayPal / Card (USD)
                  </button>
                  <button
                    onClick={() => setTab("india")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all",
                      tab === "india" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
                    )}
                  >
                    🇮🇳 UPI / India (₹{inrPrice.toLocaleString("en-IN")})
                  </button>
                </>
              )}
            </div>

            {tab === "global" ? (
              <div className="space-y-3">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3">
                  <PayPalSDKButton
                    plan={plan}
                    billing={billing}
                    onSuccess={onPayPalSuccess}
                    onError={(m) => toast.error(m)}
                  />
                </div>
                <button
                  onClick={onLemon}
                  disabled={isLemonLoading}
                  className="w-full h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-semibold text-xs transition-all active:scale-98"
                >
                  {isLemonLoading ? (
                    <Loader2 size={14} className="animate-spin mx-auto" />
                  ) : (
                    "Pay with Credit / Debit Card (LemonSqueezy)"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3.5 text-center space-y-3">
                  <button
                    onClick={handleRazorpay}
                    disabled={isRzpLoading}
                    className="w-full h-11 rounded-full bg-white hover:bg-neutral-100 text-slate-900 font-bold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-white/5"
                  >
                    {isRzpLoading ? (
                      <Loader2 size={15} className="animate-spin text-[#072654]" />
                    ) : (
                      <>
                        <span>Pay ₹{inrPrice.toLocaleString("en-IN")} with</span>
                        <img src="/razorpay-icon.svg" alt="Razorpay" className="h-4 object-contain" />
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-neutral-400 pt-0.5">
                    <span>⚡ UPI (GPay, PhonePe, Paytm)</span>
                    <span>•</span>
                    <span>RuPay</span>
                    <span>•</span>
                    <span>Cards & NetBanking</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-[10px] text-neutral-500 flex items-center justify-center gap-1.5 pt-3 border-t border-white/[0.06] mt-4">
              <ShieldCheck size={11} className="text-emerald-400" /> 256-bit SSL encrypted · Cancel anytime
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
