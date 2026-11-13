"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { X, Loader2, Check, ChevronDown, CreditCard, Lock, Tag, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import { trackDbActivity } from "@/utils/analytics";

export type BillingPeriod = "monthly" | "yearly";

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  finalAmount: number;
  planId: "free" | "pro" | "power";
  billing: BillingPeriod;
  currency: "INR" | "USD";
}

export interface PlanPaymentInfo {
  id: "free" | "pro" | "power";
  name: string;
  usd: { monthly: number; yearly: number; yearlyPerMonth: number; saving?: string };
  inr: { monthly: number; yearly: number; yearlyPerMonth: number; saving?: string };
}

// ─── Settings ────────────────────────────────────────────────────────────────
// Razorpay handler is kept, but your old UI never rendered a button for it.
// Flip to true to show a "Card / NetBanking" button on the India → Card tab.
const SHOW_RAZORPAY = false;

// All colours live here. Change these to match the rest of your site.
const ui = {
  primaryBtn:
    "h-12 w-full rounded-xl bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
  secondaryBtn:
    "h-12 w-full rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-red-400",
  focus: "outline-none focus-visible:ring-2 focus-visible:ring-red-400",
};

// Uppercase, letters/digits/dash/underscore only, max 32 chars
const cleanCode = (v: string) => v.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);

// ─── Shared helpers ──────────────────────────────────────────────────────────
function broadcastPlanChange() {
  window.dispatchEvent(new Event("auth-change"));
  window.dispatchEvent(new Event("capacity-updated"));
}

function saveMembership(data: any, planId: string) {
  if (!data?.membership) return;
  let existing: Record<string, any> = {};
  try {
    existing = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {}
  localStorage.setItem(
    "user",
    JSON.stringify({ ...existing, membership: data.membership, tokens: data.tokens, rank: planId })
  );
}

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

function loadPaytmScript(mid: string, isStaging: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);

    if (typeof (window as any).Paytm?.CheckoutJS?.init === "function") {
      return resolve(true);
    }

    const host = isStaging ? "https://securegw-stage.paytm.in" : "https://securegw.paytm.in";
    const scriptSrc = `${host}/merchantpgpui/checkoutjs/merchants/${mid}.js`;

    const checkReady = () => {
      if (typeof (window as any).Paytm?.CheckoutJS?.init === "function") {
        return resolve(true);
      }
      if (typeof (window as any).Paytm?.CheckoutJS?.onLoad === "function") {
        (window as any).Paytm.CheckoutJS.onLoad(() => resolve(true));
      } else {
        let attempts = 0;
        const timer = setInterval(() => {
          attempts++;
          if (typeof (window as any).Paytm?.CheckoutJS?.init === "function") {
            clearInterval(timer);
            resolve(true);
          } else if (attempts > 60) {
            clearInterval(timer);
            resolve(false);
          }
        }, 100);
      }
    };

    if (document.querySelector(`script[src="${scriptSrc}"]`)) {
      checkReady();
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.type = "text/javascript";
    script.crossOrigin = "anonymous";
    script.onload = checkReady;
    script.onerror = () => {
      console.error("Failed to load Paytm CheckoutJS script from:", scriptSrc);
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// ─── PayPal SDK Button ───────────────────────────────────────────────────────
export function PayPalSDKButton({
  plan,
  billing,
  couponCode,
  onSuccess,
  onError,
}: {
  plan: PlanPaymentInfo;
  billing: BillingPeriod;
  couponCode?: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  // Ref, not a dep: applying a coupon must not re-render the PayPal buttons
  const couponRef = useRef(couponCode);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    couponRef.current = couponCode;
  }, [onSuccess, onError, couponCode]);

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
    const existingById = document.getElementById(scriptId);
    if (existingById) {
      if ((window as any).paypal) setSdkReady(true);
      else existingById.addEventListener("load", () => setSdkReady(true));
      return;
    }

    const stale = document.querySelector("script[src*='paypal.com/sdk/js']");
    if (stale) stale.remove();

    const s = document.createElement("script");
    s.id = scriptId;
    s.src = `https://www.paypal.com/sdk/js?client-id=${activeClientId}&currency=USD&intent=capture&components=buttons`;
    s.async = true;
    s.onload = () => setSdkReady(true);
    s.onerror = () => {
      onErrorRef.current("PayPal failed to load. Check your connection and try again.");
    };
    document.body.appendChild(s);
  }, [activeClientId]);

  useEffect(() => {
    if (!sdkReady || !containerRef.current || !(window as any).paypal) return;

    containerRef.current.innerHTML = "";
    try {
      (window as any).paypal
        .Buttons({
          style: { layout: "vertical", color: "white", shape: "rect", label: "pay", height: 44 },
          createOrder: async () => {
            trackDbActivity(`/pricing/payment-start-paypal/${plan.id}/${billing}`);
            const token = localStorage.getItem("authToken");
            const res = await api.post(
              "/payment/paypal/create-order",
              { planId: plan.id, billingPeriod: billing, couponCode: couponRef.current || undefined },
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
            const headers = { Auth: token, Authorization: token ? `Bearer ${token}` : undefined };

            try {
              const res = await api.post(
                "/payment/paypal/capture-order",
                { orderId, planId: plan.id, billingPeriod: billing },
                { headers }
              );

              if (res.data?.success) {
                if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
                broadcastPlanChange();
                toast.success("Subscription activated.");
                onSuccessRef.current();
              } else {
                throw new Error(res.data?.message || "Capture could not be finalized.");
              }
            } catch (err: any) {
              try {
                const syncRes = await api.post("/payment/paypal/sync-order", { orderId }, { headers });
                if (syncRes.data?.success) {
                  if (syncRes.data.user) localStorage.setItem("user", JSON.stringify(syncRes.data.user));
                  broadcastPlanChange();
                  toast.success("Payment verified. Subscription activated.");
                  onSuccessRef.current();
                  return;
                }
              } catch {}

              onErrorRef.current(
                err?.response?.data?.message ||
                  err?.message ||
                  "PayPal capture failed. If money was deducted, use Sync PayPal in your profile."
              );
            } finally {
              setIsProcessing(false);
            }
          },
          onCancel: () => setIsProcessing(false),
          onError: (e: any) => {
            console.error("PayPal SDK error:", e);
            setIsProcessing(false);
            onErrorRef.current("PayPal checkout hit an error. Please try again.");
          },
        })
        .render(containerRef.current);
    } catch (renderErr: any) {
      console.error("Failed to render PayPal buttons:", renderErr);
    }
  }, [sdkReady, plan.id, billing]);

  const loading = !activeClientId || !sdkReady || isProcessing;
  const loadingText = isProcessing
    ? "Confirming payment with PayPal…"
    : "Loading PayPal…";

  return (
    <div className="w-full">
      {loading && (
        <div className="flex h-11 items-center justify-center gap-2 text-sm text-neutral-400">
          <Loader2 size={14} className="animate-spin" />
          {loadingText}
        </div>
      )}
      {/* Always mounted so the buttons survive a failed or cancelled attempt */}
      {activeClientId && (
        <div ref={containerRef} className={cn("min-h-[44px] w-full", loading && "hidden")} />
      )}
    </div>
  );
}

// ─── Plan features ───────────────────────────────────────────────────────────
function getPlanFeatures(planId: PlanPaymentInfo["id"]): string[] {
  if (planId === "power") {
    return [
      "Lectures up to 8 hours long",
      "350 video notes per month",
      "30 presentation decks, up to 40 slides",
      "10,000 PaperChat conversations",
      "Unlimited flashcards, quizzes and mind maps",
      "All exports: DOCX, PPTX, LaTeX PDF, Anki",
      "Priority queue, no waiting",
    ];
  }
  return [
    "Lectures up to 4 hours long",
    "120 video notes per month",
    "10 presentation decks, up to 20 slides",
    "2,000 PaperChat conversations",
    "Unlimited flashcards and 30 quiz sets",
    "LaTeX PDF, Notion and Anki exports",
    "Priority queue, no waiting",
  ];
}

// ─── Segmented control (used for billing period and payment method) ──────────
function Segmented<T extends string>({
  value,
  onChange,
  label,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  label: string;
  options: { value: T; label: string; hint?: string; badge?: string }[];
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-white/5 p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg px-3 py-2 text-center text-sm transition-colors",
              ui.focus,
              active ? "bg-white text-black" : "text-neutral-300 hover:text-white"
            )}
          >
            <span className="flex items-center justify-center gap-2 font-medium">
              {o.label}
              {o.badge && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-medium",
                    active ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/15 text-emerald-300"
                  )}
                >
                  {o.badge}
                </span>
              )}
            </span>
            {o.hint && (
              <span className={cn("block text-xs", active ? "text-neutral-600" : "text-neutral-400")}>
                {o.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Payment modal ───────────────────────────────────────────────────────────
// One layout for every screen size: bottom sheet on phones, centred dialog on desktop.
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
  onLemon: (couponCode?: string) => void;
  onPayPalSuccess: () => void;
  isLemonLoading: boolean;
  user?: any;
  region?: "IN" | "GLOBAL";
}) {
  const [selectedBilling, setSelectedBilling] = useState<BillingPeriod>(billing);
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [isPaytmLoading, setIsPaytmLoading] = useState(false);

  const busy = isRazorpayLoading || isPaytmLoading;
  const currencyCode: "INR" | "USD" = region === "IN" ? "INR" : "USD";

  // ─── Coupon ────────────────────────────────────────────────────────────────
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const couponInputRef = useRef<HTMLInputElement>(null);
  const couponReqId = useRef(0); // ignores out-of-date responses
  const appliedRef = useRef<AppliedCoupon | null>(null);
  const urlCouponTried = useRef(false);
  // Cache rejected coupon attempts so repeated attempts don't spam network or hit rate limiter
  const failedCodesRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    appliedRef.current = appliedCoupon;
  }, [appliedCoupon]);

  const validateCoupon = useCallback(
    async (rawCode: string, silent = false) => {
      if (!plan) return;
      const code = cleanCode(rawCode);
      if (!code) {
        setCouponError("Enter a coupon code.");
        setShakeKey((prev) => prev + 1);
        return;
      }

      // 1. If already applied, avoid redundant check
      if (appliedRef.current && appliedRef.current.code === code) {
        setCouponError("This coupon is already applied to your order.");
        setShakeKey((prev) => prev + 1);
        return;
      }

      // 2. Client-side rejection cache: immediate shake with cached message, zero network spam
      const cacheKey = `${code}:${plan.id}:${selectedBilling}:${currencyCode}`;
      const cachedError = failedCodesRef.current.get(cacheKey);
      if (cachedError) {
        setCouponError(cachedError);
        setShakeKey((prev) => prev + 1);
        return;
      }

      const reqId = ++couponReqId.current;
      setCouponLoading(true);
      setCouponError("");

      try {
        const token = localStorage.getItem("authToken");
        const res = await api.post(
          "/payment/coupon/validate",
          { code, planId: plan.id, billingPeriod: selectedBilling, currency: currencyCode },
          { headers: { Auth: token } }
        );
        if (reqId !== couponReqId.current) return;

        const c = res.data?.coupon;
        if (!res.data?.success || !c) {
          throw new Error(res.data?.message || "This coupon isn't valid.");
        }

        const p = region === "IN" ? plan.inr : plan.usd;
        const base = selectedBilling === "yearly" ? p.yearly : p.monthly;
        const discount = Math.max(0, Number(c.discountAmount) || 0);
        const finalAmt = typeof c.finalAmount === "number" ? c.finalAmount : Math.max(0, base - discount);

        failedCodesRef.current.delete(cacheKey);

        setAppliedCoupon({
          code: c.code || code,
          discountAmount: discount,
          finalAmount: finalAmt,
          planId: plan.id,
          billing: selectedBilling,
          currency: currencyCode,
        });
        setCouponInput("");
        setShakeKey(0);
        if (!silent) trackDbActivity(`/pricing/coupon-applied/${plan.id}/${code}`);
      } catch (err: any) {
        if (reqId !== couponReqId.current) return;
        const errMsg =
          err?.response?.data?.message || err?.message || "Couldn't check the coupon. Try again.";

        // Remember this failed code to optimize repeated attempts
        failedCodesRef.current.set(cacheKey, errMsg);

        setCouponError(errMsg);
        setShakeKey((prev) => prev + 1);
        if (silent) {
          // Re-check after a plan or billing change failed: drop it and show why
          setAppliedCoupon(null);
          setCouponInput(code);
          setCouponOpen(true);
        }
      } finally {
        if (reqId === couponReqId.current) setCouponLoading(false);
      }
    },
    [plan, selectedBilling, currencyCode, region]
  );

  // Clear everything on close; on open, apply ?coupon=CODE from the URL once
  useEffect(() => {
    if (!isOpen) {
      couponReqId.current++;
      urlCouponTried.current = false;
      setAppliedCoupon(null);
      setCouponInput("");
      setCouponError("");
      setShakeKey(0);
      setCouponOpen(false);
      setCouponLoading(false);
      return;
    }
    if (urlCouponTried.current || !plan) return;
    urlCouponTried.current = true;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = cleanCode(params.get("coupon") || params.get("promo") || "");
    if (fromUrl) {
      setCouponInput(fromUrl);
      setCouponOpen(true);
      validateCoupon(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, plan?.id]);

  // Plan or billing changed while a coupon is applied: re-check it for the new price
  useEffect(() => {
    const current = appliedRef.current;
    if (!isOpen || !current) return;
    if (
      current.planId === plan?.id &&
      current.billing === selectedBilling &&
      current.currency === currencyCode
    ) {
      return;
    }
    validateCoupon(current.code, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, plan?.id, selectedBilling, currencyCode]);

  useEffect(() => {
    if (billing) setSelectedBilling(billing);
  }, [billing, plan?.id]);

  useEffect(() => {
    if (isOpen) {
      setMethod("upi");
      setFeaturesOpen(false);
    }
  }, [isOpen]);

  // Escape closes (unless a payment window is opening) and the page behind stops scrolling
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, busy, onClose]);

  if (!plan) return null;

  const isIndia = region === "IN";
  const sym = isIndia ? "₹" : "$";
  const pricing = isIndia ? plan.inr : plan.usd;
  const isYearly = selectedBilling === "yearly";

  const totalAmount = isYearly ? pricing.yearly : pricing.monthly;
  const fullYearValue = pricing.monthly * 12;
  const annualSavings = Math.max(0, fullYearValue - pricing.yearly);
  const savePct = fullYearValue > 0 ? Math.round((annualSavings / fullYearValue) * 100) : 0;

  const fmt = (n: number) => (isIndia ? n.toLocaleString("en-IN") : n.toFixed(2));
  const features = getPlanFeatures(plan.id);

  // A coupon only counts while it matches the selected plan, billing period and currency
  const activeCoupon =
    appliedCoupon &&
    appliedCoupon.planId === plan.id &&
    appliedCoupon.billing === selectedBilling &&
    appliedCoupon.currency === currencyCode
      ? appliedCoupon
      : null;
  const payableAmount = activeCoupon ? activeCoupon.finalAmount : totalAmount;

  const openCoupon = () => {
    setCouponOpen(true);
    requestAnimationFrame(() => couponInputRef.current?.focus());
  };

  const removeCoupon = () => {
    couponReqId.current++;
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    setShakeKey(0);
    setCouponLoading(false);
    setCouponOpen(false);
  };

  // ─── Razorpay ──────────────────────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setIsRazorpayLoading(true);
    trackDbActivity(`/pricing/payment-start-razorpay/${plan.id}/${selectedBilling}`);

    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        toast.error("Razorpay could not be loaded. Check your connection and try again.");
        setIsRazorpayLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      const res = await api.post(
        "/payment/create-order",
        {
          packageId: plan.id,
          packageType: "subscription",
          finalAmount: payableAmount,
          couponCode: activeCoupon?.code,
          billingPeriod: selectedBilling,
          packageName: plan.name,
        },
        { headers: { Auth: token } }
      );

      if (!res.data?.success || !res.data?.order) {
        throw new Error(res.data?.message || "Failed to create payment order");
      }

      const orderData = res.data.order;
      const keyId = res.data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const rzp = new (window as any).Razorpay({
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Paperxify",
        description: `${plan.name} (${isYearly ? "yearly" : "monthly"})`,
        image: "https://paperxify.com/icons/icon-192x192.png",
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await api.post(
              "/payment/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                packageId: plan.id,
                packageType: "subscription",
                finalAmount: payableAmount,
                couponCode: activeCoupon?.code,
                billingPeriod: selectedBilling,
                status: "success",
              },
              { headers: { Auth: token } }
            );

            if (verifyRes.data?.success) {
              saveMembership(verifyRes.data?.data, plan.id);
              broadcastPlanChange();
              toast.success(`Subscription activated. Welcome to ${plan.name}.`);
              onPayPalSuccess();
            } else {
              toast.error(verifyRes.data?.message || "Payment verification failed.");
            }
          } catch (verErr: any) {
            console.error("Verification error:", verErr);
            toast.error(
              verErr?.response?.data?.message ||
                "Payment received, but verification is pending. Refresh your profile in a minute."
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
        theme: { color: "#ef4444" },
        modal: { ondismiss: () => setIsRazorpayLoading(false) },
      });

      rzp.on("payment.failed", (resp: any) => {
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

  // ─── Paytm (UPI, QR, NetBanking) ───────────────────────────────────────────
  const handlePaytmPayment = async () => {
    setIsPaytmLoading(true);
    trackDbActivity(`/pricing/payment-start-paytm/${plan.id}/${selectedBilling}`);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Sign in to subscribe.");
        setIsPaytmLoading(false);
        return;
      }

      const res = await api.post(
        "/payment/paytm/initiate",
        { planId: plan.id, billingPeriod: selectedBilling, couponCode: activeCoupon?.code },
        { headers: { Auth: token } }
      );

      if (!res.data?.success) {
        if (res.data?.isConfigMissing) {
          toast.error(
            "Paytm credentials are missing. Set PAYTM_MID and PAYTM_MERCHANT_KEY in Server/src/.env.",
            { duration: 6000 }
          );
        } else {
          toast.error(res.data?.message || "Failed to start Paytm checkout.");
        }
        setIsPaytmLoading(false);
        return;
      }

      const { orderId, txnToken, amount, mid, isStaging } = res.data;

      const scriptReady = await loadPaytmScript(mid, isStaging);
      if (!scriptReady || !(window as any).Paytm?.CheckoutJS) {
        toast.error("Paytm could not be loaded. Check your connection and try again.");
        setIsPaytmLoading(false);
        return;
      }

      const config = {
        root: "",
        flow: "DEFAULT",
        data: { orderId, token: txnToken, tokenType: "TXN_TOKEN", amount: String(amount) },
        merchant: {
          mid,
          name: "Paperxify",
          logo: "https://paperxify.com/icons/icon-192x192.png",
          redirect: false,
        },
        handler: {
          notifyMerchant: (eventName: any) => {
            if (eventName === "APP_CLOSED") {
              setIsPaytmLoading(false);
              toast.info("Payment window closed. You can try again anytime.");
              api
                .post(
                  "/payment/paytm/cancel",
                  { orderId, reason: "User closed payment window" },
                  { headers: { Auth: token } }
                )
                .catch(() => {});
            }
          },
          transactionStatus: async (paymentStatus: any) => {
            try {
              const verifyRes = await api.post(
                "/payment/paytm/verify",
                { orderId, response: paymentStatus },
                { headers: { Auth: token } }
              );

              if (verifyRes.data?.success) {
                saveMembership(verifyRes.data?.data, plan.id);
                broadcastPlanChange();
                toast.success(`Payment verified. Welcome to ${plan.name}.`);
                onPayPalSuccess();
              } else if (verifyRes.data?.isPending) {
                toast.info(
                  verifyRes.data?.message ||
                    "Your bank hasn't confirmed the payment yet. If money was debited, your plan activates shortly.",
                  { duration: 8000 }
                );
              } else if (verifyRes.data?.isCancelled) {
                toast.info("Payment cancelled. You can try again anytime.");
              } else {
                toast.error(verifyRes.data?.message || "Payment could not be verified.");
              }
            } catch (verErr: any) {
              console.error("Paytm verification error:", verErr);
              const errData = verErr?.response?.data;
              if (errData?.isCancelled) {
                toast.info("Payment cancelled.");
              } else if (errData?.isPending) {
                toast.info(errData?.message || "Your bank hasn't confirmed the payment yet.", {
                  duration: 7000,
                });
              } else {
                toast.error(errData?.message || "Payment could not be completed. Please try again.");
              }
            } finally {
              setIsPaytmLoading(false);
            }
          },
        },
      };

      const CheckoutJS = (window as any).Paytm?.CheckoutJS;
      const start = async () => {
        await CheckoutJS.init(config);
        CheckoutJS.invoke();
      };

      if (typeof CheckoutJS?.init === "function") {
        await start();
      } else if (typeof CheckoutJS?.onLoad === "function") {
        CheckoutJS.onLoad(async () => {
          try {
            await start();
          } catch (initErr: any) {
            console.error("Paytm init error:", initErr);
            toast.error("Couldn't open Paytm. Please try again.");
            setIsPaytmLoading(false);
          }
        });
      } else {
        throw new Error("Paytm CheckoutJS is unavailable");
      }
    } catch (err: any) {
      console.error("Paytm checkout error:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to start Paytm checkout");
      setIsPaytmLoading(false);
    }
  };

  // ─── Card + PayPal block (shared by India "Card / PayPal" tab and global users) ──
  const cardAndPaypal = (
    <div className="space-y-3">
      {isIndia && SHOW_RAZORPAY && (
        <>
          <button
            type="button"
            onClick={handleRazorpayPayment}
            disabled={isRazorpayLoading || couponLoading}
            className={ui.primaryBtn}
          >
            {isRazorpayLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>Pay {sym}{fmt(payableAmount)} with card or NetBanking</>
            )}
          </button>
          <Divider />
        </>
      )}

      <div className={cn(couponLoading && "pointer-events-none opacity-50")}>
        <PayPalSDKButton
          plan={plan}
          billing={selectedBilling}
          couponCode={activeCoupon?.code}
          onSuccess={onPayPalSuccess}
          onError={(m) => toast.error(m)}
        />
      </div>

      <Divider />

      <button
        type="button"
        onClick={() => onLemon(activeCoupon?.code)}
        disabled={isLemonLoading || couponLoading}
        className={ui.secondaryBtn}
      >
        {isLemonLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <CreditCard size={16} />
            Pay with card
          </>
        )}
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center md:items-center md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !busy && onClose()}
            className="absolute inset-0 bg-black/80"
          />

          {/* Panel: bottom sheet on phones, centred dialog from md up */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Subscribe to ${plan.name}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-950 text-white md:max-w-md md:rounded-3xl"
          >
            <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  {user?.email && (
                    <p className="mt-0.5 truncate text-sm text-neutral-400">{user.email}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className={cn(
                    "-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white",
                    ui.focus
                  )}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Billing period */}
              <div className="mt-5">
                <Segmented
                  label="Billing period"
                  value={selectedBilling}
                  onChange={setSelectedBilling}
                  options={[
                    {
                      value: "monthly",
                      label: "Monthly",
                      hint: `${sym}${fmt(pricing.monthly)}/mo`,
                    },
                    {
                      value: "yearly",
                      label: "Yearly",
                      hint: `${sym}${fmt(pricing.yearlyPerMonth)}/mo`,
                      badge: savePct > 0 ? `Save ${savePct}%` : undefined,
                    },
                  ]}
                />
              </div>

              {/* Total */}
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {sym}
                    {fmt(payableAmount)}
                    <span className="ml-1.5 text-sm font-normal text-neutral-400">{currencyCode}</span>
                    {activeCoupon && (
                      <span className="ml-2 text-base font-normal text-neutral-400 line-through">
                        {sym}
                        {fmt(totalAmount)}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {isYearly ? "Billed once a year" : "Billed every month"}
                    {isIndia ? ", GST included" : ", taxes included"}
                  </p>
                </div>
                {isYearly && annualSavings > 0 && (
                  <p className="pb-1 text-sm text-emerald-400">
                    You save {sym}
                    {fmt(annualSavings)}
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="mt-4">
                {activeCoupon ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-emerald-300">
                      <Check size={16} className="shrink-0" />
                      <span className="truncate">
                        <span className="font-semibold">{activeCoupon.code}</span> applied, you save {sym}
                        {fmt(activeCoupon.discountAmount)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className={cn(
                        "shrink-0 rounded-md text-neutral-300 underline underline-offset-2 hover:text-white",
                        ui.focus
                      )}
                    >
                      Remove
                    </button>
                  </div>
                ) : appliedCoupon && couponLoading ? (
                  <p className="flex items-center gap-2 text-sm text-neutral-400">
                    <Loader2 size={14} className="animate-spin" />
                    Updating coupon…
                  </p>
                ) : couponOpen ? (
                  <form
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      validateCoupon(couponInput);
                    }}
                    className="space-y-2"
                  >
                    <motion.div
                      key={shakeKey}
                      animate={
                        shakeKey > 0
                          ? {
                              x: [0, -10, 10, -8, 8, -5, 5, -2, 2, 0],
                            }
                          : {}
                      }
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="flex gap-2"
                    >
                      <label htmlFor="coupon-code" className="sr-only">
                        Coupon code
                      </label>
                      <input
                        id="coupon-code"
                        ref={couponInputRef}
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(cleanCode(e.target.value));
                          if (couponError) setCouponError("");
                        }}
                        placeholder="Coupon code"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        enterKeyHint="go"
                        aria-invalid={!!couponError}
                        aria-describedby={couponError ? "coupon-error" : undefined}
                        className={cn(
                          "h-11 min-w-0 flex-1 rounded-xl border bg-white/5 px-3 text-base uppercase tracking-wide text-white placeholder:normal-case placeholder:tracking-normal placeholder:text-neutral-400 md:text-sm transition-all duration-200",
                          couponError
                            ? "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50"
                            : "border-white/10",
                          ui.focus
                        )}
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput}
                        className={cn(
                          "flex h-11 shrink-0 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                          ui.focus
                        )}
                      >
                        {couponLoading ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                      </button>
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {couponError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          id="coupon-error"
                          role="alert"
                          className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl"
                        >
                          <AlertCircle size={14} className="shrink-0 text-red-400" />
                          <span>{couponError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={openCoupon}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md text-sm text-neutral-300 transition-colors hover:text-white",
                      ui.focus
                    )}
                  >
                    <Tag size={14} />
                    Have a coupon code?
                  </button>
                )}
              </div>

              {/* What's included */}
              <div className="mt-5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setFeaturesOpen((v) => !v)}
                  aria-expanded={featuresOpen}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md text-sm text-neutral-300 transition-colors hover:text-white",
                    ui.focus
                  )}
                >
                  Included in this plan
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform", featuresOpen && "rotate-180")}
                  />
                </button>

                {featuresOpen && (
                  <ul className="mt-3 space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-300">
                        <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Payment */}
              <div className="mt-5 border-t border-white/10 pt-5">
                {isIndia ? (
                  <div className="space-y-4">
                    <Segmented
                      label="Payment method"
                      value={method}
                      onChange={setMethod}
                      options={[
                        { value: "upi", label: "UPI" },
                        { value: "card", label: "Card / PayPal" },
                      ]}
                    />

                    {method === "upi" ? (
                      <div>
                        <button
                          type="button"
                          onClick={handlePaytmPayment}
                          disabled={isPaytmLoading || couponLoading}
                          className={ui.primaryBtn}
                        >
                          {isPaytmLoading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Opening Paytm…
                            </>
                          ) : (
                            <div className="flex items-center justify-center gap-2.5">
                              <img
                                src="/icons8-paytm-48.png"
                                alt="Paytm"
                                className="w-5 h-5 object-contain"
                              />
                              <span>Pay {sym}{fmt(payableAmount)} with UPI</span>
                            </div>
                          )}
                        </button>
                        <p className="mt-2 text-center text-xs text-neutral-400">
                          Works with GPay, PhonePe, Paytm, BHIM and any UPI app or QR.
                        </p>
                      </div>
                    ) : (
                      cardAndPaypal
                    )}
                  </div>
                ) : (
                  cardAndPaypal
                )}
              </div>

              {/* Footer */}
              <div className="mt-5 space-y-2 text-center text-xs text-neutral-400">
                <p className="flex items-center justify-center gap-1.5">
                  <Lock size={12} />
                  Secure payment. 7-day refund. Cancel anytime from your profile.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/refund-policy"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Refund policy
                  </Link>
                  <Link
                    href="/shipping-policy"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Shipping policy
                  </Link>
                  <Link
                    href="/terms"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Terms
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-neutral-400">
      <span className="h-px flex-1 bg-white/10" />
      or
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
