"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import api from "@/config/api";
import { toast } from "sonner";
import Link from "next/link";

function PayPalReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token"); // PayPal order ID
  const payerId = searchParams.get("PayerID");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No order token provided by PayPal.");
      return;
    }

    let isDone = false;

    async function finalizeOrder() {
      try {
        const authToken = localStorage.getItem("authToken");

        // 1. Attempt direct capture of the returned order
        const res = await api.post(
          "/payment/paypal/capture-order",
          { orderId: token },
          { headers: { Auth: authToken, Authorization: authToken ? `Bearer ${authToken}` : undefined } }
        );

        if (res.data?.success) {
          localStorage.removeItem("paperxify_pending_paypal_order");

          if (res.data.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
          window.dispatchEvent(new Event("auth-change"));
          window.dispatchEvent(new Event("capacity-updated"));

          setPlanDetails(res.data.membership || res.data.transaction);
          setStatus("success");
          toast.success("Subscription activated successfully!");
          isDone = true;

          setTimeout(() => {
            router.push("/profile");
          }, 2500);
          return;
        }
      } catch (err: any) {
        console.warn("Direct capture in return page had issue, attempting sync recovery:", err);
      }

      // 2. Fallback sync attempt
      try {
        const authToken = localStorage.getItem("authToken");
        const syncRes = await api.post(
          "/payment/paypal/sync-order",
          { orderId: token },
          { headers: { Auth: authToken, Authorization: authToken ? `Bearer ${authToken}` : undefined } }
        );

        if (syncRes.data?.success) {
          localStorage.removeItem("paperxify_pending_paypal_order");
          if (syncRes.data.user) {
            localStorage.setItem("user", JSON.stringify(syncRes.data.user));
          }
          window.dispatchEvent(new Event("auth-change"));
          window.dispatchEvent(new Event("capacity-updated"));

          setPlanDetails(syncRes.data.membership || syncRes.data.transaction);
          setStatus("success");
          toast.success("Payment verified and subscription activated!");
          isDone = true;

          setTimeout(() => {
            router.push("/profile");
          }, 2500);
          return;
        }
      } catch (syncErr: any) {
        console.error("Return page sync recovery failed:", syncErr);
      }

      if (!isDone) {
        setStatus("error");
        setErrorMessage("We could not confirm your order automatically. If payment was deducted, please click 'Retry Sync' below or contact support.");
      }
    }

    finalizeOrder();
  }, [token, payerId, router]);

  const handleManualRetry = async () => {
    if (!token) return;
    setStatus("loading");
    setErrorMessage(null);
    try {
      const authToken = localStorage.getItem("authToken");
      const syncRes = await api.post(
        "/payment/paypal/sync-order",
        { orderId: token },
        { headers: { Auth: authToken, Authorization: authToken ? `Bearer ${authToken}` : undefined } }
      );

      if (syncRes.data?.success) {
        if (syncRes.data.user) {
          localStorage.setItem("user", JSON.stringify(syncRes.data.user));
        }
        window.dispatchEvent(new Event("auth-change"));
        window.dispatchEvent(new Event("capacity-updated"));
        setStatus("success");
        setPlanDetails(syncRes.data.membership || syncRes.data.transaction);
        toast.success("Subscription successfully activated!");
        setTimeout(() => router.push("/profile"), 2000);
      } else {
        setStatus("error");
        setErrorMessage(syncRes.data?.message || "Order verification still in progress. Please check again in a moment.");
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMessage(e?.response?.data?.message || "Verification failed. Please reach out to support.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-[#0d0d12] border border-white/[0.08] rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Activating Your Subscription</h2>
              <p className="text-sm text-neutral-400">
                Confirming your payment with PayPal and unlocking your AI capacity…
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 size={34} />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles size={11} /> Plan Active
              </div>
              <h2 className="text-2xl font-black text-white">Payment Successful!</h2>
              <p className="text-sm text-neutral-400">
                Your <span className="text-white font-bold">{planDetails?.planName || "Pro"}</span> plan is now fully active. Redirecting to your profile…
              </p>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all cursor-pointer shadow-lg"
            >
              <span>Go to Profile & Tools</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle size={34} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Activation Notice</h2>
              <p className="text-sm text-neutral-400">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleManualRetry}
                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer"
              >
                Retry Syncing PayPal Order
              </button>
              <Link
                href="/profile"
                className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-semibold text-xs transition-all"
              >
                Go to Profile
              </Link>
              <Link
                href="/support"
                className="text-xs text-neutral-500 hover:text-neutral-300 pt-2"
              >
                Contact Support / Open Ticket
              </Link>
            </div>
          </div>
        )}

        <div className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5 pt-4 border-t border-white/[0.06]">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>PaperXify Secure Billing & 256-bit Encryption</span>
        </div>
      </div>
    </div>
  );
}

export default function PayPalReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] flex items-center justify-center text-neutral-400">
          <Loader2 className="animate-spin text-blue-400" size={32} />
        </div>
      }
    >
      <PayPalReturnContent />
    </Suspense>
  );
}
