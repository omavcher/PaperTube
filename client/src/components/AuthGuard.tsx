"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Lock, Sparkles, Crown, Zap, ShieldCheck,
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

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function PremiumUpgradeModal({ isOpen, onClose, featureName }: PremiumUpgradeModalProps) {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj?.membership?.isActive) {
            setUserPlan(userObj.membership.planId || null);
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
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const hasPro = userPlan === "pro" || userPlan === "scholar" || (userPlan && userPlan.toLowerCase().includes("pro"));

  const plans = [
    { name: "Pro", price: "$9", period: "/mo", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/5", popular: !hasPro },
    { name: "Power", price: "$19", period: "/mo", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5" },
  ];

  const features = [
    { text: "15 videos per day (Pro)", tier: "pro" },
    { text: "Up to 4 hours per video (Pro)", tier: "pro" },
    { text: "All note styles — Quick, Visual, Full PDF (Pro)", tier: "pro" },
    { text: "Unlimited videos & playlist processing (Power)", tier: "power" },
    { text: "Deep PDF & Anki deck export (Power)", tier: "power" },
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
            className="relative w-full max-w-lg md:max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Left Column: Brand & Features */}
            <div className="relative w-full md:w-1/2 flex flex-col justify-between overflow-hidden">
              {/* Header Visual - shown as top banner on mobile, background container on desktop */}
              <div className={cn(
                "relative h-32 md:h-28 flex items-center justify-center overflow-hidden transition-all duration-500 shrink-0",
                hasPro 
                  ? "bg-gradient-to-br from-purple-950/40 via-black to-purple-950/30"
                  : "bg-gradient-to-br from-yellow-950/40 via-black to-purple-950/30"
              )}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.8%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22/%3E%3C/svg%3E')] opacity-20 mix-blend-overlay" />
                <div className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 transform-gpu pointer-events-none transition-all duration-500",
                  hasPro
                    ? "bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)]"
                    : "bg-[radial-gradient(circle_at_center,_rgba(234,179,8,0.15)_0%,_transparent_70%)]"
                )} />

                {/* Animated rings */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className={cn(
                    "absolute w-16 h-16 rounded-full border animate-ping transition-all duration-500",
                    hasPro ? "border-purple-500/10" : "border-yellow-500/10"
                  )} style={{ animationDuration: "3s" }} />
                  <div className={cn(
                    "absolute w-24 h-24 rounded-full border animate-ping transition-all duration-500",
                    hasPro ? "border-purple-500/5" : "border-yellow-500/5"
                  )} style={{ animationDuration: "4s", animationDelay: "1s" }} />
                  <div className={cn(
                    "w-12 h-12 rounded-xl border backdrop-blur-sm flex items-center justify-center shadow-2xl transition-all duration-500",
                    hasPro
                      ? "bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20"
                      : "bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/20"
                  )}>
                    <Crown className={cn(
                      "w-5 h-5 transition-all duration-500",
                      hasPro ? "text-purple-400" : "text-yellow-400"
                    )} />
                  </div>
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-6 md:p-8 pt-4 md:pt-6 flex-1 flex flex-col justify-center space-y-5 relative z-10">
                <div className="space-y-2.5">
                  {hasPro ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2 animate-pulse">
                      <Sparkles size={10} /> Power Upgrade Required
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-2">
                      <Sparkles size={10} /> Premium Feature
                    </div>
                  )}
                  
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
                    {hasPro 
                      ? (featureName ? `"${featureName}" Requires Power Tier` : "Upgrade to Power Scholar") 
                      : (featureName ? `"${featureName}" is a Premium Feature` : "This is a Premium Feature")
                    }
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-light">
                    {hasPro
                      ? "You are currently on the Pro plan. Elevate your plan to Power to unlock advanced reasoning and unlimited processing."
                      : "Upgrade your plan to unlock advanced AI models and unlimited access."
                    }
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2 bg-white/[0.01] border border-white/[0.03] p-4 rounded-2xl">
                  {features.map((f, i) => {
                    const isPowerFeat = f.tier === "power";
                    return (
                      <div key={i} className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all",
                            hasPro
                              ? isPowerFeat 
                                ? "bg-purple-500/25 border border-purple-500/35" 
                                : "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-yellow-500/10 border border-yellow-500/20"
                          )}>
                            {hasPro && !isPowerFeat ? (
                              <CheckCircle2 size={9} className="text-emerald-400" />
                            ) : (
                              <Zap size={9} className={cn(
                                hasPro && isPowerFeat ? "text-purple-400 animate-pulse" : "text-yellow-400"
                              )} />
                            )}
                          </div>
                          <span className={cn(
                            "text-[11px] md:text-xs font-medium transition-all",
                            hasPro
                              ? isPowerFeat 
                                ? "text-white font-semibold" 
                                : "text-neutral-500"
                              : "text-neutral-300"
                          )}>
                            {f.text}
                          </span>
                        </div>
                        {hasPro && (
                          isPowerFeat ? (
                            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/25 animate-pulse whitespace-nowrap">
                              Requires Power
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-600 border border-white/5 whitespace-nowrap">
                              Pro Active
                            </span>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Plans & Upgrade Checkout */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white/[0.01] border-t md:border-t-0 md:border-l border-white/5 relative z-10">
              {/* Subtle background glow on desktop */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.03),_transparent_70%)] pointer-events-none hidden md:block" />

              <div className="space-y-6 md:space-y-8 flex-1 flex flex-col justify-center">
                <div className="text-center md:text-left space-y-1.5 hidden md:block">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Select Upgrade Option</h3>
                  <p className="text-xs text-neutral-600 font-light">Flexible billing, upgrade or cancel anytime.</p>
                </div>

                {/* Plans Preview */}
                <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm md:max-w-none mx-auto">
                  {plans.map((plan) => {
                    const isCurrentPlan = hasPro && plan.name === "Pro";
                    const isUpgradePlan = hasPro && plan.name === "Power";
                    return (
                      <div
                        key={plan.name}
                        className={cn(
                          "p-4 rounded-2xl border text-center relative transition-all duration-300 flex flex-col justify-between min-h-[110px]",
                          isCurrentPlan 
                            ? "bg-neutral-950/40 border-emerald-500/10 opacity-60"
                            : isUpgradePlan
                            ? "bg-purple-950/10 border-purple-500/40 ring-1 ring-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] scale-[1.02] md:scale-105"
                            : cn(plan.bg, plan.border, plan.popular && "ring-1 ring-yellow-500/30")
                        )}
                      >
                        {isCurrentPlan ? (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[8px] font-black uppercase tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            Active Plan
                          </div>
                        ) : isUpgradePlan ? (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[8px] font-black uppercase tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.4)] animate-pulse">
                            Upgrade Path
                          </div>
                        ) : plan.popular ? (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[8px] font-bold uppercase tracking-wider whitespace-nowrap">
                            Popular
                          </div>
                        ) : null}
                        
                        <div>
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-wider mb-1", 
                            isCurrentPlan ? "text-emerald-400" : isUpgradePlan ? "text-purple-400" : plan.color
                          )}>
                            {plan.name}
                          </p>
                          <p className="text-xl font-extrabold text-white mt-1">{plan.price}</p>
                        </div>
                        <p className="text-[9px] text-neutral-600 font-medium mt-1">{plan.period}</p>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="space-y-4">
                  <button
                    onClick={() => { onClose(); router.push("/pricing"); }}
                    className={cn(
                      "w-full h-12 font-bold rounded-xl transition-all duration-250 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg",
                      hasPro 
                        ? "bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                        : "bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black shadow-yellow-500/20"
                    )}
                  >
                    <Crown size={16} />
                    {hasPro ? "Upgrade to Power Plan" : "View All Plans"}
                    <ArrowRight size={14} />
                  </button>

                  <p className="text-center text-[10px] text-neutral-600">
                    Cancel anytime · 7-day refund policy
                  </p>
                </div>
              </div>
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
