"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Lock, Activity, 
  ShieldCheck,
  Crown,
  Zap,
  Timer,
  ScanLine
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// --- Configuration ---
const MANUAL_ADS = [
  {
    id: "pro-node",
    landscapeImg: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
    portraitImg: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80",
    link: "/pricing",
    title: "ELITE_NODE",
    desc: "Bypass verification instantly."
  },
  {
    id: "neural-api",
    landscapeImg: "https://images.unsplash.com/photo-1620712943543-bcc4628c7190?auto=format&fit=crop&w=1200&q=80",
    portraitImg: "https://images.unsplash.com/photo-1675557009875-436f5993936f?auto=format&fit=crop&w=800&q=80",
    link: "/tools",
    title: "NEURAL_KIT",
    desc: "Access 50+ engineering modules."
  }
];

interface AdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdComplete: () => void;
}

export default function AdDialog({ open, onOpenChange, onAdComplete }: AdDialogProps) {
  const [countdown, setCountdown] = useState(10);
  const [adCompleted, setAdCompleted] = useState(false);
  const [selectedAd, setSelectedAd] = useState(MANUAL_ADS[0]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let adTimeout: NodeJS.Timeout;

    if (open) {
      const randomAd = MANUAL_ADS[Math.floor(Math.random() * MANUAL_ADS.length)];
      setSelectedAd(randomAd);
      setCountdown(10);
      setAdCompleted(false);

      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setAdCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Initialize Google AdSense dynamically whenever the popup opens
      adTimeout = setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        } catch (err) {
          console.error('AdSense initialization error:', err);
        }
      }, 200);
    }
    
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
      if (adTimeout) clearTimeout(adTimeout);
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
      {/* OPTIMIZED WIDTH: 
          - Mobile: w-[90vw] (Compact)
          - Desktop: md:max-w-3xl (Wide Layout)
      */}
      <DialogContent className="z-[200] w-[90vw] md:max-w-3xl bg-[#0a0a0a] border border-white/10 text-white rounded-[2rem] p-0 overflow-hidden shadow-2xl outline-none font-sans flex flex-col md:flex-row h-auto md:h-[450px]">
        
        {/* --- LEFT SIDE: GOOGLE ADSENSE (Takes 45% width on Desktop) --- */}
        <div className="relative w-full h-[250px] md:h-full md:w-[45%] bg-neutral-900 overflow-hidden flex items-center justify-center p-2">
            {/* Paperxify Ads Dailog box */}
            <ins className="adsbygoogle"
                 style={{ display: "block", minHeight: "250px", width: "100%", height: "100%" }}
                 data-ad-client="ca-pub-8343501385468147"
                 data-ad-slot="8986679518"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>

            {/* Badge */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
               <Badge className="bg-black/50 backdrop-blur-md text-white border-white/10 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg">
                  Advertisement
               </Badge>
            </div>
        </div>

        {/* --- RIGHT SIDE: CONTROLS (Takes 55% width on Desktop) --- */}
        <div className="flex flex-col justify-between w-full md:w-[55%] h-full bg-[#0a0a0a] relative">
            
            {/* Header */}
            <div className="px-5 py-4 md:p-8 bg-black/40 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-1.5 rounded-lg border transition-all duration-500",
                        adCompleted 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                            : "bg-neutral-900 border-white/10 text-neutral-500"
                    )}>
                        {adCompleted ? <ShieldCheck size={16} /> : <Lock size={16} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white leading-none mb-0.5">
                            {adCompleted ? "Verified" : "Security Lock"}
                        </span>
                        <span className="text-[8px] font-mono text-neutral-600">ID: {selectedAd.id.toUpperCase()}</span>
                    </div>
                </div>

                <div className={cn(
                    "flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all duration-300",
                    adCompleted ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"
                )}>
                    <Timer size={14} className={cn(adCompleted ? "text-emerald-500" : "text-white opacity-50")} />
                    <span className={cn("text-sm font-mono font-bold", adCompleted ? "text-emerald-500" : "text-white")}>
                        {countdown}s
                    </span>
                </div>
            </div>

            {/* Desktop Ad Details (Hidden on Mobile) */}
            <div className="hidden md:flex flex-col justify-center px-8 flex-1 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-blue-500 tracking-widest">
                    <ScanLine size={12} /> Support Paperxify
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                    SPONSORED AD
                </h3>
                <p className="text-sm text-neutral-400 font-medium leading-relaxed">
                    Viewing this ad helps keep Paperxify running. Please wait for the timer to complete to unlock your download.
                </p>
            </div>

            {/* Footer / Actions */}
            <div className="p-5 md:p-8 pt-2 md:pt-0 space-y-4">
                <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: `${((10 - countdown) / 10) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                      className={cn(
                        "h-full transition-colors duration-500",
                        adCompleted ? "bg-emerald-500" : "bg-blue-500"
                      )}
                    />
                </div>

                <Button
                    onClick={handleAction}
                    disabled={!adCompleted}
                    className={cn(
                      "w-full h-12 md:h-14 rounded-xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
                      adCompleted 
                        ? "bg-white text-black hover:bg-neutral-200" 
                        : "bg-neutral-900 text-neutral-500 border border-white/5 opacity-80"
                    )}
                >
                    {adCompleted ? (
                        <span className="flex items-center gap-2"><Zap size={16} fill="currentColor" /> Continue</span>
                    ) : (
                        <span className="flex items-center gap-2">Initializing...</span>
                    )}
                </Button>

                <div className="flex justify-center">
                    <button 
                        onClick={() => { onOpenChange(false); window.location.href='/pricing'; }}
                        className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-600 hover:text-yellow-500 transition-colors py-1"
                    >
                        <Crown size={12} /> Remove Verification
                    </button>
                </div>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}