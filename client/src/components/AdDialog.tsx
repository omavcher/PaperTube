"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, AlertCircle, ShieldAlert, Terminal, Zap, Crown } from "lucide-react";
import Script from 'next/script';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdDialog({ open, onOpenChange, onAdComplete }) {
  const [countdown, setCountdown] = useState(30);
  const [adCompleted, setAdCompleted] = useState(false);
  const [adLoading, setAdLoading] = useState(true);
  const [adError, setAdError] = useState(false);
  const adContainerRef = useRef(null);
  const adInitialized = useRef(false);

  // --- Logic Protocols (Preserved Exactly) ---
  const loadAdSense = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8343501385468147";
    script.crossOrigin = "anonymous";
    script.onload = () => initializeAd();
    script.onerror = () => {
      console.error('Failed to load AdSense script');
      setAdError(true);
      setAdLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializeAd = () => {
    if (!window.adsbygoogle || !adContainerRef.current) {
      setAdError(true);
      setAdLoading(false);
      return;
    }
    try {
      const adContainer = adContainerRef.current;
      adContainer.innerHTML = `
        <ins class="adsbygoogle"
          style="display:block; text-align:center;"
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-8343501385468147"
          data-ad-slot="4924261839"
          data-full-width-responsive="true">
        </ins>
      `;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      const adElement = adContainer.querySelector('ins');
      if (adElement) {
        adElement.addEventListener('load', () => {
          setAdLoading(false);
          startCountdown();
        });
        adElement.addEventListener('error', () => {
          setAdError(true);
          setAdLoading(false);
        });
      } else {
        setAdError(true);
        setAdLoading(false);
      }
    } catch (error) {
      setAdError(true);
      setAdLoading(false);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setAdCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  };

  useEffect(() => {
    if (open && !adInitialized.current) {
      setCountdown(30);
      setAdCompleted(false);
      setAdLoading(true);
      setAdError(false);
      loadAdSense();
      adInitialized.current = true;
    } else if (!open) {
      adInitialized.current = false;
    }
  }, [open]);

  const handleComplete = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ad_completed', { event_category: 'engagement', event_label: 'rewarded_ad' });
    }
    onAdComplete();
    onOpenChange(false);
  };

  const handleSkipAd = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ad_skipped', { event_category: 'engagement', event_label: 'rewarded_ad' });
    }
    onAdComplete();
    onOpenChange(false);
  };

  // --- Styled Components ---

  const renderFallbackAd = () => (
    <div className="h-64 bg-[#080808] flex flex-col items-center justify-center rounded-2xl border border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center border border-red-600/20 mb-4 animate-pulse">
        <Play className="w-8 h-8 text-red-500 fill-current" />
      </div>
      <p className="text-sm font-black uppercase italic tracking-widest text-white">Signal Handshake Failed</p>
      <p className="text-[10px] text-neutral-600 mt-2 uppercase font-bold">Manual override required to proceed</p>
      <div className="mt-6 px-4 py-2 bg-black border border-white/5 rounded-lg">
        <p className="text-[9px] font-mono text-red-500/70 uppercase">Error_Log::AD_BLOCKER_DETECTED_OR_TIMEOUT</p>
      </div>
    </div>
  );

  return (
    <>
      <Script id="adsense-init" strategy="lazyOnload" onError={() => setAdError(true)} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-[#0a0a0a] border-white/10 text-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          {/* Background ID Watermark */}
          <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none rotate-12">
             <Terminal size={200} />
          </div>

          <DialogHeader className="space-y-4">
            <div className="flex justify-center">
               <div className="p-3 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-500">
                  <ShieldAlert size={24} />
               </div>
            </div>
            <DialogTitle className="text-center text-2xl font-black uppercase italic tracking-tighter">
              Protocol <span className="text-red-600">Handshake</span>
            </DialogTitle>
            <DialogDescription className="text-center text-neutral-500 text-xs font-medium uppercase tracking-wide leading-relaxed">
              To maintain free access to our neural models, please verify this operational signal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-8 space-y-6 relative z-10">
            {/* Ad Container Stage */}
            <div className="relative rounded-[1.5rem] overflow-hidden border border-white/5 bg-black min-h-[200px] flex flex-col items-center justify-center">
              {adLoading ? (
                <div className="text-center space-y-4">
                  <div className="relative h-12 w-12 mx-auto">
                    <div className="absolute inset-0 border-2 border-red-600/20 rounded-full" />
                    <div className="absolute inset-0 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 animate-pulse">Initializing Ad_Stream</p>
                </div>
              ) : adError ? (
                <div className="w-full">
                  {renderFallbackAd()}
                </div>
              ) : (
                <div className="w-full h-full">
                  <div ref={adContainerRef} className="w-full" id="ad-container" />
                  {!adCompleted && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black italic shadow-lg shadow-red-900/20">
                      T-{countdown}S
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Feedback */}
            <div className="space-y-4">
               {adCompleted ? (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center justify-center gap-2 text-emerald-500 mb-1">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Handshake Verified</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">Identity stable. Neural assets unlocked.</p>
                 </motion.div>
               ) : (
                 <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600">
                       <span>Verification Progress</span>
                       <span className="text-red-500">{Math.round(((30 - countdown) / 30) * 100)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-red-600 shadow-[0_0_10px_red]"
                        animate={{ width: `${((30 - countdown) / 30) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </div>
                 </div>
               )}
            </div>

            {/* Action Matrix */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                {adError && (
                  <Button
                    onClick={handleSkipAd}
                    variant="outline"
                    className="flex-1 h-14 border-white/10 bg-neutral-950 text-neutral-400 hover:text-white rounded-2xl text-[10px] font-black uppercase italic tracking-widest"
                  >
                    Bypass Signal
                  </Button>
                )}
                
                <Button
                  onClick={handleComplete}
                  disabled={!adCompleted && !adError}
                  className={cn(
                    "flex-1 h-14 rounded-2xl text-xs font-black uppercase italic tracking-[0.2em] transition-all active:scale-95 shadow-xl",
                    adCompleted || adError
                      ? "bg-white text-black hover:bg-red-600 hover:text-white" 
                      : "bg-neutral-900 text-neutral-600 cursor-not-allowed border border-white/5"
                  )}
                >
                  {adError ? 'Execute Generation' : adCompleted ? 'Initialize Session' : 'Awaiting Peer...'}
                </Button>
              </div>
              
              <div className="pt-4 border-t border-white/5 text-center space-y-4">
                <button 
                  onClick={() => { onOpenChange(false); window.location.href='/pricing'; }}
                  className="group flex items-center justify-center gap-2 mx-auto"
                >
                  <Crown className="w-3 h-3 text-yellow-500" />
                  <span className="text-[10px] font-black uppercase italic text-neutral-500 group-hover:text-yellow-500 transition-colors">
                    Remove ads via Premium Protocol
                  </span>
                </button>
                <p className="text-[8px] font-bold text-neutral-800 uppercase tracking-widest">
                  By accessing terminal you agree to <a href="/terms" className="hover:text-neutral-400">Terms_of_Sync</a>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}