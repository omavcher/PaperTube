"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  ShieldCheck,
  Crown,
  Zap,
  Timer,
  ScanLine,
  ActivitySquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const AD_KEY = 'c3edbe4a4037d587541caa2bae8ba51e';

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
    label: "Visit Site"
  },
  {
    id: "paperxify_ad3",
    img: "/ads/paperxify_ad3.png",
    link: "https://www.paperxify.com/tools",
    label: "Tools"
  }
];

interface AdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdComplete: () => void;
}

/**
 * Optimized Ad Component that handles the script injection and refresh logic
 */
const AdContainer = ({ iteration }: { iteration: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous ad
    containerRef.current.innerHTML = '';

    // Create script settings
    const scriptSettings = document.createElement('script');
    scriptSettings.type = 'text/javascript';
    scriptSettings.innerHTML = `
      atOptions = {
        'key' : '${AD_KEY}',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    // Create script invoker
    const scriptInvoker = document.createElement('script');
    scriptInvoker.type = 'text/javascript';
    scriptInvoker.src = `https://controlslaverystuffing.com/${AD_KEY}/invoke.js`;
    scriptInvoker.async = true;

    // Append to container
    containerRef.current.appendChild(scriptSettings);
    containerRef.current.appendChild(scriptInvoker);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [iteration]);

  return (
    <div key={iteration} className="w-[300px] h-[250px] bg-neutral-900/50 flex items-center justify-center overflow-hidden rounded-xl border border-white/5 shadow-inner">
      <div ref={containerRef} id={`ad-yield-${iteration}`} />
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
      setCountdown(10);
      setAdCompleted(false);
      setCurrentBanner(CUSTOM_BANNERS[Math.floor(Math.random() * CUSTOM_BANNERS.length)]);

      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          const nextValue = prev - 1;

          if (nextValue <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setAdCompleted(true);
            return 0;
          }
          return nextValue;
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

  return (
    <Dialog open={open} onOpenChange={(val) => { if (adCompleted) onOpenChange(val); }}>
      <DialogContent className="z-[200] w-[95vw] md:max-w-3xl bg-[#0a0a0a] border border-white/10 text-white rounded-[2rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] outline-none font-sans flex flex-col md:flex-row h-auto md:h-[520px]">
        
        {/* --- LEFT SIDE: THE ADS --- */}
        <div className="relative w-full h-auto md:h-full md:w-[45%] bg-[#0f0f0f] overflow-hidden flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/5">
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
               <Badge className="bg-blue-500/10 backdrop-blur-md text-blue-400 border-blue-500/20 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg">
                  Sponsored Ad
               </Badge>
            </div>

            <div className="relative z-10">
              <AdContainer iteration={0} />
            </div>

            {/* CUSTOM BANNER GIF (LONG & THIN) */}
            <motion.a
                href={currentBanner.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 w-[300px] h-[60px] relative rounded-xl overflow-hidden border border-white/10 group bg-black shadow-lg"
            >
                <img 
                    src={currentBanner.img} 
                    alt="Promo" 
                    className="w-full h-full object-cover  group-hover:scale-105 transition-all duration-700"
                />
            </motion.a>
            
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[80px]" />
            </div>
        </div>

        {/* --- RIGHT SIDE: CONTROLS --- */}
        <div className="flex flex-col justify-between w-full md:w-[55%] h-full bg-[#0a0a0a] relative">
            
            {/* Header */}
            <div className="px-5 py-4 md:p-8 bg-black/40 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
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
                    adCompleted ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10 shadow-inner"
                )}>
                    <Timer size={14} className={cn(adCompleted ? "text-emerald-500" : "text-blue-500")} />
                    <span className={cn("text-base font-mono font-bold w-6 text-center", adCompleted ? "text-emerald-500" : "text-white")}>
                        {countdown}
                    </span>
                </div>
            </div>

            {/* Desktop Details */}
            <div className="px-8 py-6 md:py-0 flex-1 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-blue-500 tracking-widest bg-blue-500/5 w-fit px-2 py-0.5 rounded border border-blue-500/10">
                    <ScanLine size={12} /> Verification
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
                        Preparing your <br/><span className="text-blue-500">Notes</span>
                    </h3>
                </div>
                <p className="text-xs md:text-sm text-neutral-400 font-medium leading-relaxed max-w-[90%]">
                    Please wait a few seconds. Supporting these ads helps us keep the service free for everyone.
                </p>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 md:p-8 space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[9px] font-bold uppercase text-neutral-600 tracking-wider">Progress</span>
                    <span className="text-[10px] font-mono text-blue-500">{Math.round(((10 - countdown) / 10) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: `${((10 - countdown) / 10) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className={cn(
                          "h-full shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                          adCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-blue-500"
                        )}
                      />
                  </div>
                </div>

                <Button
                    onClick={handleAction}
                    disabled={!adCompleted}
                    className={cn(
                      "w-full h-14 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg",
                      adCompleted 
                        ? "bg-white text-black hover:bg-neutral-200 border-none" 
                        : "bg-neutral-900 text-neutral-500 border border-white/5 opacity-80 cursor-not-allowed"
                    )}
                >
                    {adCompleted ? (
                        <span className="flex items-center gap-2 tracking-[0.3em] font-black"><Zap size={16} fill="currentColor" /> DOWNLOAD</span>
                    ) : (
                        <div className="flex items-center gap-3">
                           <ActivitySquare size={16} className="animate-spin text-blue-500" />
                           <span>Please wait...</span>
                        </div>
                    )}
                </Button>

                <div className="flex justify-center flex-col items-center gap-2">
                    <button 
                        onClick={() => { onOpenChange(false); window.location.href='/pricing'; }}
                        className="group flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-600 hover:text-yellow-500 transition-all"
                    >
                        <Crown size={12} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" /> 
                        <span>Remove Ads</span>
                    </button>
                </div>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
