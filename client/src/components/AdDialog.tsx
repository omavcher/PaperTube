"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Lock,
  ShieldCheck,
  Crown,
  Zap,
  Timer,
  ScanLine,
  ActivitySquare,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const AD_KEY = 'c3edbe4a4037d587541caa2bae8ba51e';
const AD_HOST = 'controlslaverystuffing.com';
const AD_SCRIPT_SRC = `https://${AD_HOST}/${AD_KEY}/invoke.js`;

// ─── STEP 1: Preconnect + DNS-prefetch ─────────────────────────────────────────
// Injected once at module load time (before user even clicks anything).
// Eliminates ~100-350ms DNS + TCP handshake overhead on slow connections.
if (typeof document !== 'undefined') {
  const injectHint = (rel: string, href: string, as?: string) => {
    const id = `hint-${rel}-${href.replace(/[^a-z0-9]/gi, '')}`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = rel;
      link.href = href;
      if (as) (link as any).as = as;
      document.head.appendChild(link);
    }
  };
  injectHint('dns-prefetch', `https://${AD_HOST}`);
  injectHint('preconnect', `https://${AD_HOST}`);
  // Also hint the CDNs Adsterra commonly uses for serving iframe content
  injectHint('dns-prefetch', 'https://www.google.com');
  injectHint('dns-prefetch', 'https://pagead2.googlesyndication.com');
}

// --- Custom Ad Configuration ---
const CUSTOM_BANNERS = [
  {
    id: "heartecho_ad1",
    img: "/ads/heartecho_ad1.png",
    link: "https://www.heartecho.in/?utm_source=paperxify_ads&utm_medium=free",
  },
  {
    id: "paperxify_ad2",
    img: "/ads/paperxify_ad2.png",
    link: "https://www.paperxify.com",
  },
  {
    id: "paperxify_ad3",
    img: "/ads/paperxify_ad3.png",
    link: "https://www.paperxify.com/tools",
  }
];

interface AdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdComplete: () => void;
}

// ─── STEP 2: Pre-fetch the ad script (called before the container mounts) ───
// We use a module-level flag so we only inject the script once across
// dialog open/close cycles — no duplicate network requests.
let adScriptPreloaded = false;

export function preloadAdScript() {
  if (adScriptPreloaded || typeof document === 'undefined') return;
  adScriptPreloaded = true;

  // Inject atOptions globally so the invoke.js finds the config immediately
  if (!(window as any).atOptions) {
    (window as any).atOptions = {
      key: AD_KEY,
      format: 'iframe',
      height: 250,
      width: 300,
      params: {},
    };
  }

  // Preload the script resource (does NOT execute it yet)
  if (!document.getElementById('at-preload')) {
    const preload = document.createElement('link');
    preload.id = 'at-preload';
    preload.rel = 'preload';
    preload.href = AD_SCRIPT_SRC;
    (preload as any).as = 'script';
    document.head.appendChild(preload);
  }
}

/**
 * Injects the 3rd-party ad script into the given container.
 * Because atOptions is already set globally by preloadAdScript(),
 * the invoke.js executes instantly from browser cache on slow connections.
 */
const AdContainer = ({ iteration }: { iteration: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    // The atOptions global was set by preloadAdScript().
    // Re-set it here in case the window was re-navigated.
    (window as any).atOptions = {
      key: AD_KEY,
      format: 'iframe',
      height: 250,
      width: 300,
      params: {},
    };

    const scriptInvoker = document.createElement('script');
    scriptInvoker.type = 'text/javascript';
    scriptInvoker.src = AD_SCRIPT_SRC;
    scriptInvoker.async = true;
    // importance hint — tells browser to prioritize this fetch
    (scriptInvoker as any).importance = 'high';
    scriptInvoker.crossOrigin = 'anonymous';
    scriptInvoker.onload = () => setAdLoaded(true);

    containerRef.current.appendChild(scriptInvoker);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [iteration]);

  return (
    <div className="w-[300px] h-[250px] bg-neutral-900/50 rounded-xl border border-white/5 shadow-inner shrink-0 relative overflow-hidden">
      {/* Skeleton shimmer shown until the iframe appears */}
      {!adLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
            backgroundSize: '200% 100%',
            animation: 'adShimmer 1.4s infinite linear',
          }} />
          <style>{`
            @keyframes adShimmer {
              0%   { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      )}
      <div ref={containerRef} id={`ad-yield-${iteration}`} className="w-full h-full" />
    </div>
  );
};

export default function AdDialog({ open, onOpenChange, onAdComplete }: AdDialogProps) {
  const [countdown, setCountdown] = useState(10);
  const [adCompleted, setAdCompleted] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(CUSTOM_BANNERS[0]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      // ─── STEP 3: Kick off script pre-fetch the INSTANT dialog opens ──────────
      // This runs before React even renders the AdContainer, so by the time
      // the container mounts, the browser has already started (or finished)
      // downloading invoke.js — critical on slow/mobile connections.
      preloadAdScript();

      setCountdown(10);
      setAdCompleted(false);
      setCurrentBanner(CUSTOM_BANNERS[Math.floor(Math.random() * CUSTOM_BANNERS.length)]);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          const next = prev - 1;
          if (next <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setAdCompleted(true);
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  const handleAction = () => {
    if (adCompleted) {
      onAdComplete();
      onOpenChange(false);
    }
  };

  const progressPct = Math.round(((10 - countdown) / 10) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ad-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[199] bg-black/80 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center pointer-events-none p-0">
            {/* ── MOBILE: bottom sheet ── DESKTOP: centered dialog ── */}
            <motion.div
              key="ad-dialog"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className={cn(
                "pointer-events-auto w-full",
                // Desktop: centered card
                "md:w-[760px] md:max-h-[90vh]",
                "bg-[#0a0a0a] border border-white/10 text-white font-sans",
                "rounded-t-[2rem] md:rounded-[2rem] overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.6)] md:shadow-2xl"
              )}
              style={{ willChange: "transform, opacity" }}
            >
            {/* ── MOBILE DRAG HANDLE ── */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* ── DESKTOP: two-column layout ── */}
            <div className="hidden md:flex h-[500px]">
              {/* Left: ads */}
              <div className="relative w-[45%] bg-[#0f0f0f] overflow-hidden flex flex-col items-center justify-center p-6 border-r border-white/5 gap-5">
                <span className="absolute top-4 left-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                  Sponsored
                </span>
                <AdContainer iteration={0} />
                <motion.a
                  href={currentBanner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-[300px] h-[60px] rounded-xl overflow-hidden border border-white/10 group bg-black shadow-lg shrink-0"
                >
                  <img
                    src={currentBanner.img}
                    alt="Promo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                </motion.a>
                {/* Glow */}
                <div className="absolute inset-0 opacity-20 pointer-events-none transform-gpu">
                  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)]" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.3)_0%,_transparent_70%)]" />
                </div>
              </div>

              {/* Right: controls */}
              <ControlPanel
                adCompleted={adCompleted}
                countdown={countdown}
                progressPct={progressPct}
                onAction={handleAction}
                onOpenChange={onOpenChange}
                desktop
              />
            </div>

            {/* ── MOBILE: stacked layout ── */}
            <div className="md:hidden flex flex-col">
              {/* Top: header bar */}
              <div className="px-5 py-3.5 bg-black/40 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "p-1.5 rounded-lg border transition-all duration-500",
                    adCompleted
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      : "bg-neutral-900 border-white/10 text-neutral-500"
                  )}>
                    {adCompleted ? <ShieldCheck size={15} /> : <Lock size={15} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-none mb-0.5">
                      {adCompleted ? "Ready to go!" : "Please wait"}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-600 uppercase">Verification Step</span>
                  </div>
                </div>

                {/* Timer pill */}
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300",
                  adCompleted ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"
                )}>
                  <Timer size={13} className={cn(adCompleted ? "text-emerald-500" : "text-blue-400")} />
                  <span className={cn("text-base font-mono font-bold w-5 text-center", adCompleted ? "text-emerald-500" : "text-white")}>
                    {countdown}
                  </span>
                </div>
              </div>

              {/* Middle: ad (scaled down for mobile) */}
              <div className="relative bg-[#0f0f0f] flex flex-col items-center justify-center py-4 gap-3 overflow-hidden border-b border-white/5">
                <span className="absolute top-3 left-3 z-10 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                  Sponsored
                </span>
                {/* Scale the 300×250 ad to fit smaller screens */}
                <div className="scale-[0.82] origin-top" style={{ height: 210 }}>
                  <AdContainer iteration={0} />
                </div>
                {/* Custom banner */}
                <motion.a
                  href={currentBanner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-[260px] h-[52px] rounded-xl overflow-hidden border border-white/10 group bg-black shadow-md -mt-2"
                >
                  <img
                    src={currentBanner.img}
                    alt="Promo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                </motion.a>
              </div>

              {/* Bottom: CTA */}
              <div className="px-5 py-5 space-y-4">
                {/* Tagline */}
                <p className="text-sm text-neutral-400 text-center leading-relaxed">
                  {adCompleted
                    ? "✅ Verification complete! Tap below to generate your notes."
                    : "Hang tight — supporting ads keeps the service free."}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end px-0.5">
                    <span className="text-[9px] font-bold uppercase text-neutral-600 tracking-wider">Progress</span>
                    <span className="text-[10px] font-mono text-blue-400">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        "h-full",
                        adCompleted
                          ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      )}
                    />
                  </div>
                </div>

                {/* Action button */}
                <Button
                  onClick={handleAction}
                  disabled={!adCompleted}
                  className={cn(
                    "w-full h-13 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]",
                    adCompleted
                      ? "bg-white text-black hover:bg-neutral-200 border-none shadow-lg"
                      : "bg-neutral-900 text-neutral-500 border border-white/5 cursor-not-allowed"
                  )}
                >
                  {adCompleted ? (
                    <span className="flex items-center gap-2"><Zap size={15} fill="currentColor" /> Generate Notes</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ActivitySquare size={15} className="animate-spin text-blue-400" />
                      <span>Please wait...</span>
                    </div>
                  )}
                </Button>

                {/* Remove ads CTA */}
                <div className="flex justify-center pb-1">
                  <button
                    onClick={() => { onOpenChange(false); window.location.href = '/pricing'; }}
                    className="group flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-600 hover:text-yellow-500 transition-all"
                  >
                    <Crown size={11} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                    <span>Remove Ads — Go Premium</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Shared desktop right-panel ──────────────────────────────────────────────
function ControlPanel({
  adCompleted,
  countdown,
  progressPct,
  onAction,
  onOpenChange,
  desktop,
}: {
  adCompleted: boolean;
  countdown: number;
  progressPct: number;
  onAction: () => void;
  onOpenChange: (v: boolean) => void;
  desktop?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between w-full md:w-[55%] h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-8 py-6 bg-black/40 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-1.5 rounded-lg border transition-all duration-500",
            adCompleted
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "bg-neutral-900 border-white/10 text-neutral-500"
          )}>
            {adCompleted ? <ShieldCheck size={16} /> : <Lock size={16} />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white leading-none mb-0.5">
              {adCompleted ? "Ready" : "Please Wait"}
            </span>
            <span className="text-[8px] font-mono text-neutral-600 uppercase">Verification Step</span>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300",
          adCompleted ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"
        )}>
          <Timer size={14} className={cn(adCompleted ? "text-emerald-500" : "text-blue-500")} />
          <span className={cn("text-base font-mono font-bold w-6 text-center", adCompleted ? "text-emerald-500" : "text-white")}>
            {countdown}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 flex-1 flex flex-col justify-center space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-blue-500 tracking-widest bg-blue-500/5 w-fit px-2 py-0.5 rounded border border-blue-500/10">
          <ScanLine size={12} /> Verification
        </div>
        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
          Preparing your <br /><span className="text-blue-500">Notes</span>
        </h3>
        <p className="text-sm text-neutral-400 font-medium leading-relaxed max-w-[90%]">
          Please wait a few seconds. Supporting these ads helps us keep the service free for everyone.
        </p>
      </div>

      {/* Footer */}
      <div className="p-8 space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[9px] font-bold uppercase text-neutral-600 tracking-wider">Progress</span>
            <span className="text-[10px] font-mono text-blue-500">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                "h-full shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                adCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-blue-500"
              )}
            />
          </div>
        </div>

        <Button
          onClick={onAction}
          disabled={!adCompleted}
          className={cn(
            "w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg",
            adCompleted
              ? "bg-white text-black hover:bg-neutral-200 border-none"
              : "bg-neutral-900 text-neutral-500 border border-white/5 cursor-not-allowed opacity-80"
          )}
        >
          {adCompleted ? (
            <span className="flex items-center gap-2 tracking-[0.3em] font-black"><Zap size={16} fill="currentColor" /> GENERATE</span>
          ) : (
            <div className="flex items-center gap-3">
              <ActivitySquare size={16} className="animate-spin text-blue-500" />
              <span>Please wait...</span>
            </div>
          )}
        </Button>

        <div className="flex justify-center">
          <button
            onClick={() => { onOpenChange(false); window.location.href = '/pricing'; }}
            className="group flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-600 hover:text-yellow-500 transition-all"
          >
            <Crown size={12} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            <span>Remove Ads</span>
          </button>
        </div>
      </div>
    </div>
  );
}
