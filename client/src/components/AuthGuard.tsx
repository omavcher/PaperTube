"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Lock, Sparkles, Crown, Zap, ShieldCheck, Shield,
  ArrowRight, X, Loader2, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginDialog } from "@/components/LoginDialog";

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
  return (
    <LoginDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={(token, user) => {
        if (onSuccess) onSuccess();
      }}
    />
  );
}

// ─────────────────────────────────────────────
// PREMIUM UPGRADE MODAL
// ─────────────────────────────────────────────

import { createPortal } from "react-dom";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function PremiumUpgradeModal({ isOpen, onClose, featureName }: PremiumUpgradeModalProps) {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "power">("pro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj?.membership?.isActive) {
            const plan = userObj.membership.planId || null;
            setUserPlan(plan);
            if (plan === "pro" || (plan && plan.toLowerCase().includes("pro"))) {
              setSelectedPlan("power");
            }
          } else {
            setUserPlan(null);
          }
        } catch {
          setUserPlan(null);
        }
      } else {
        setUserPlan(null);
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const hasPro = userPlan === "pro" || userPlan === "scholar" || (userPlan && userPlan.toLowerCase().includes("pro"));

  const plans = [
    {
      id: "pro",
      name: "Pro Scholar",
      price: "$9",
      period: "/month",
      desc: "For students & power learners",
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/[0.04]",
      popular: !hasPro,
    },
    {
      id: "power",
      name: "Power Scholar",
      price: "$19",
      period: "/month",
      desc: "For heavy research & power output",
      color: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-500/[0.04]",
      popular: hasPro,
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Deep Video Processing",
      desc: "Convert videos up to 4+ hours with zero wait times",
    },
    {
      icon: Sparkles,
      title: "Advanced AI Intelligence",
      desc: "Full access to GPT-4o, Claude 3.5 Sonnet & Gemini Pro",
    },
    {
      icon: Crown,
      title: "All 26 Note Themes & Outline Builder",
      desc: "Export clean LaTeX, PDF and Anki flashcards",
    },
    {
      icon: Shield,
      title: "Priority Cloud Queue",
      desc: "Dedicated GPU capacity for ultra-fast generation",
    },
  ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-xl bg-[#080808] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden space-y-5 text-white select-none z-10"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[90px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            >
              <X size={14} />
            </button>

            {/* ─── 1. HEADER ─── */}
            <div className="space-y-1.5 text-center sm:text-left relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                <Crown size={11} className="fill-red-400/20" />
                <span>Scholar Exclusive</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {featureName ? (
                  <>
                    <span className="text-white">{featureName}</span>{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                      {hasPro ? "Requires Power" : "is a Pro Feature"}
                    </span>
                  </>
                ) : (
                  <>
                    Unlock Full{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                      Paperxify Intelligence
                    </span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-[13px] text-neutral-400 max-w-lg leading-relaxed">
                {hasPro
                  ? "Elevate to the Power tier for maximum reasoning capabilities, batch course playlists, and 350 monthly notes."
                  : "Upgrade your plan to unlock advanced AI models, all note styles, 120 monthly notes, and print-ready PDF exports."}
              </p>
            </div>

            {/* ─── 2. BENEFIT PILLS ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <b.icon size={12} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {b.title}
                    </h4>
                    <p className="text-[10px] sm:text-[10.5px] text-neutral-400 leading-tight mt-0.5">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── 3. PLAN TILES (PRO vs POWER) ─── */}
            <div className="grid grid-cols-2 gap-2.5 relative z-10">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                const isCurrent = hasPro && p.id === "pro";
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isCurrent) setSelectedPlan(p.id as any);
                    }}
                    className={cn(
                      "p-3 rounded-xl sm:rounded-2xl border text-center transition-all duration-200 flex flex-col justify-between cursor-pointer relative",
                      isSelected
                        ? "bg-white/[0.08] border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.2)] ring-1 ring-red-500/40"
                        : "bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]",
                      isCurrent && "opacity-60 cursor-default"
                    )}
                  >
                    {isCurrent ? (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black uppercase tracking-wider">
                        Current Plan
                      </span>
                    ) : p.popular ? (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[8px] font-black uppercase tracking-wider shadow-sm">
                        Most Popular
                      </span>
                    ) : null}

                    <div>
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-neutral-300">
                        {p.name}
                      </span>
                      <div className="flex items-baseline justify-center gap-1 mt-1">
                        <span className="text-xl sm:text-2xl font-black text-white">
                          {p.price}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {p.period}
                        </span>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-neutral-400 leading-tight mt-1 truncate">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ─── 4. ACTION CTA & GUARANTEE ─── */}
            <div className="flex flex-col gap-2 relative z-10 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/pricing");
                }}
                className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.35)] active:scale-[0.98] cursor-pointer"
              >
                <Zap size={15} className="fill-white" />
                <span>
                  {hasPro ? "Upgrade to Power Plan →" : "Upgrade to Pro Plan →"}
                </span>
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] sm:text-[11px] text-neutral-400 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  7-Day Money-Back Guarantee
                </span>
                <span>&bull;</span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
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
