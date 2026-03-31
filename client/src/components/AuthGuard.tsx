"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Lock, Sparkles, Crown, Zap, ShieldCheck,
  ArrowRight, X, Loader2, CheckCircle2
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// HOOK: useAuthGuard
// Use this in any component to protect actions.
// ─────────────────────────────────────────────

interface AuthGuardOptions {
  requiresPremium?: boolean;
  onSuccess?: () => void;
}

export function useAuthGuard({ requiresPremium = false, onSuccess }: AuthGuardOptions = {}) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const checkAndRun = useCallback(
    (action?: () => void) => {
      const token = localStorage.getItem("authToken");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        setShowLoginModal(true);
        return false;
      }

      if (requiresPremium) {
        try {
          const user = JSON.parse(userStr);
          if (!user?.membership?.isActive) {
            setShowPremiumModal(true);
            return false;
          }
        } catch {
          setShowLoginModal(true);
          return false;
        }
      }

      if (action) action();
      if (onSuccess) onSuccess();
      return true;
    },
    [requiresPremium, onSuccess]
  );

  const LoginModal = (
    <AuthLoginModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onSuccess={() => {
        setShowLoginModal(false);
        if (onSuccess) onSuccess();
      }}
    />
  );

  const PremiumModal = (
    <PremiumUpgradeModal
      isOpen={showPremiumModal}
      onClose={() => setShowPremiumModal(false)}
    />
  );

  return { checkAndRun, LoginModal, PremiumModal, setShowLoginModal, setShowPremiumModal };
}

// ─────────────────────────────────────────────
// LOGIN MODAL
// ─────────────────────────────────────────────

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export function AuthLoginModal({ isOpen, onClose, onSuccess, message }: AuthLoginModalProps) {
  const [loading, setLoading] = useState(false);

  // Lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const accessToken = tokenResponse.access_token;

        const { data: userInfo } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const res = await api.post("/auth/google", {
          googleAccessToken: accessToken,
          authType: "access_token",
        });

        if (res.data.success && res.data.data) {
          localStorage.setItem("authToken", res.data.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
          toast.success(`Welcome, ${res.data.data.user.name || userInfo.name}!`);
          onClose();
          if (onSuccess) onSuccess();
          // Refresh page state without full reload
          window.dispatchEvent(new Event("auth-change"));
        } else {
          throw new Error(res.data.message || "Login failed");
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google authentication failed.");
      setLoading(false);
    },
    scope: "openid email profile",
    flow: "implicit",
  });

  const perks = [
    "Generate AI-powered study notes",
    "Export beautiful PDFs instantly",
    "PaperChat AI assistant",
    "Track your learning streak",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transform-gpu"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header Gradient */}
            <div className="relative h-36 bg-gradient-to-br from-neutral-900 via-black to-red-950/30 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.15)_0%,_transparent_70%)] transform-gpu pointer-events-none" />
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <Lock className="w-7 h-7 text-white/80" />
              </div>
            </div>

            <div className="p-8 pt-6 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {message || "Sign in to continue"}
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Create an account to save your notes and unlock all features.
                </p>
              </div>

              {/* Perks */}
              <div className="space-y-2.5">
                {perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={10} className="text-green-400" />
                    </div>
                    <span className="text-xs text-neutral-300 font-medium">{perk}</span>
                  </div>
                ))}
              </div>

              {/* Google Button */}
              <button
                onClick={() => login()}
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 h-12 bg-white hover:bg-neutral-100 text-black font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-white/10"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin text-neutral-700" />
                ) : (
                  <FcGoogle size={20} />
                )}
                <span>{loading ? "Connecting..." : "Continue with Google"}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-600">
                <ShieldCheck size={11} />
                <span>Secure · No spam · Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// PREMIUM UPGRADE MODAL
// ─────────────────────────────────────────────

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function PremiumUpgradeModal({ isOpen, onClose, featureName }: PremiumUpgradeModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const plans = [
    { name: "Scholar", price: "₹149", period: "/mo", color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5" },
    { name: "Pro Scholar", price: "₹299", period: "/mo", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/5", popular: true },
    { name: "Power Scholar", price: "₹599", period: "/mo", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5" },
  ];

  const features = [
    "Pariksha-Sarthi model (Scholar+)",
    "Vyavastha model (Pro Scholar+)",
    "Up to 12hr video processing (Pro Scholar)",
    "Priority processing speed",
    "Unlimited video length (Power Scholar)",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm transform-gpu"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 28 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="relative h-40 bg-gradient-to-br from-yellow-950/40 via-black to-purple-950/30 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-[radial-gradient(circle_at_center,_rgba(234,179,8,0.15)_0%,_transparent_70%)] transform-gpu pointer-events-none" />

              {/* Animated rings */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full border border-yellow-500/10 animate-ping" style={{ animationDuration: "3s" }} />
                <div className="absolute w-28 h-28 rounded-full border border-yellow-500/5 animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }} />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                  <Crown className="w-7 h-7 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="p-8 pt-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-2">
                  <Sparkles size={10} /> Premium Feature
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {featureName ? `"${featureName}" is` : "This is"} a Premium Feature
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Upgrade your plan to unlock advanced AI models and unlimited access.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                      <Zap size={9} className="text-yellow-400" />
                    </div>
                    <span className="text-xs text-neutral-300 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {/* Plans Preview */}
              <div className="grid grid-cols-3 gap-2">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "p-3 rounded-2xl border text-center relative",
                      plan.bg, plan.border,
                      plan.popular && "ring-1 ring-yellow-500/30"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[8px] font-bold uppercase tracking-wider whitespace-nowrap">
                        Popular
                      </div>
                    )}
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", plan.color)}>
                      {plan.name}
                    </p>
                    <p className="text-lg font-bold text-white">{plan.price}</p>
                    <p className="text-[9px] text-neutral-600 font-medium">{plan.period}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => { onClose(); router.push("/pricing"); }}
                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
              >
                <Crown size={16} />
                View All Plans
                <ArrowRight size={14} />
              </button>

              <p className="text-center text-[10px] text-neutral-600">
                Cancel anytime · 7-day refund policy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// WRAPPER COMPONENT: AuthGate
// Wraps children and intercepts clicks.
// ─────────────────────────────────────────────

interface AuthGateProps {
  children: React.ReactNode;
  requiresPremium?: boolean;
  featureName?: string;
  className?: string;
}

export function AuthGate({ children, requiresPremium = false, featureName, className }: AuthGateProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      e.stopPropagation();
      e.preventDefault();
      setShowLogin(true);
      return;
    }

    if (requiresPremium) {
      try {
        const user = JSON.parse(userStr);
        if (!user?.membership?.isActive) {
          e.stopPropagation();
          e.preventDefault();
          setShowPremium(true);
          return;
        }
      } catch {
        e.stopPropagation();
        e.preventDefault();
        setShowLogin(true);
      }
    }
  };

  return (
    <>
      <div onClick={handleClick} className={cn("contents", className)}>
        {children}
      </div>
      <AuthLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <PremiumUpgradeModal isOpen={showPremium} onClose={() => setShowPremium(false)} featureName={featureName} />
    </>
  );
}
