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
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MANUAL_ADS = [
  {
    id: "pro-node",
    landscapeImg: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
    portraitImg: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80",
    link: "/pricing",
    title: "ACTIVATE_ELITE_NODE",
    desc: "Bypass all signal verification protocols instantly."
  },
  {
    id: "neural-api",
    landscapeImg: "https://images.unsplash.com/photo-1620712943543-bcc4628c7190?auto=format&fit=crop&w=1200&q=80",
    portraitImg: "https://images.unsplash.com/photo-1675557009875-436f5993936f?auto=format&fit=crop&w=800&q=80",
    link: "/tools",
    title: "NEURAL_TOOLKIT_v5",
    desc: "Access 50+ engineering modules for free."
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
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open]);

  const handleAction = () => {
    if (adCompleted) {
      onAdComplete();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (adCompleted) onOpenChange(val); }}>
      {/* FIX 1: z-[200] added to jump over the Navbar (z-100) 
          FIX 2: max-h-[90vh] ensures the dialog doesn't bleed off the laptop screen
      */}
      <DialogContent className="z-[200] max-w-[95vw] md:max-w-4xl bg-black border-white/10 text-white rounded-[2rem] md:rounded-[3.5rem] p-0 overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.25)] border-t-0 select-none outline-none">
        
        <div className="flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-y-auto no-scrollbar">
          
          {/* --- HEADER --- */}
          <div className="p-5 md:p-8 bg-neutral-900/60 border-b border-white/5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors duration-500",
                adCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-red-600/10 text-red-500"
              )}>
                {adCompleted ? <ShieldCheck size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <h2 className="text-xs md:text-xl font-black uppercase italic tracking-tighter leading-none">
                  {adCompleted ? "Verified" : "Lockdown"}
                </h2>
                <p className="text-[7px] md:text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em] mt-1 hidden sm:block">
                  NODE_ID: {selectedAd.id.toUpperCase()}
                </p>
              </div>
            </div>

            <div className={cn(
              "flex flex-col items-end gap-1 px-4 py-2 md:px-6 md:py-3 rounded-2xl border transition-all duration-500",
              adCompleted ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-600/20 bg-red-600/5"
            )}>
              <span className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-neutral-500">Signal_Hold</span>
              <span className={cn(
                "text-lg md:text-2xl font-mono font-black tabular-nums leading-none",
                adCompleted ? "text-emerald-500" : "text-red-600"
              )}>
                {adCompleted ? "00" : countdown.toString().padStart(2, '0')}<span className="text-[10px] ml-0.5">S</span>
              </span>
            </div>
          </div>

          {/* --- CONTENT AREA --- */}
          <div className="p-3 md:p-8">
            <a 
              href={selectedAd.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block relative w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 bg-neutral-950 shadow-2xl transition-transform active:scale-[0.98]"
            >
              {/* FIXED RATIO: aspect-[21/9] for laptop prevents the image from being too tall */}
              <div className="relative w-full aspect-[4/5] md:aspect-[21/9]">
                <img 
                  src={selectedAd.portraitImg} 
                  alt="" 
                  className="block md:hidden w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" 
                />
                <img 
                  src={selectedAd.landscapeImg} 
                  alt="" 
                  className="hidden md:block w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                   <Badge className="bg-red-600 text-white font-black italic text-[7px] md:text-[9px] px-3 py-1 border-none uppercase">Sponsored</Badge>
                </div>

                <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-10 flex items-end justify-between gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <h3 className="text-lg md:text-4xl font-black italic uppercase tracking-tighter text-white">
                      {selectedAd.title}
                    </h3>
                    <p className="text-[8px] md:text-sm text-neutral-400 font-bold uppercase tracking-widest line-clamp-1">
                      {selectedAd.desc}
                    </p>
                  </div>
                  <div className="p-3 md:p-6 rounded-xl md:rounded-[2rem] bg-white text-black group-hover:bg-red-600 group-hover:text-white transition-all">
                    <ExternalLink size={18} className="md:w-6 md:h-6" />
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* --- FOOTER / CONTROLS --- */}
          <div className="px-5 pb-8 md:px-10 md:pb-10 space-y-6">
            <div className="flex flex-col gap-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: "0%" }}
                   animate={{ width: `${((10 - countdown) / 10) * 100}%` }}
                   transition={{ duration: 1, ease: "linear" }}
                   className={cn(
                     "h-full transition-colors duration-500",
                     adCompleted ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-600 shadow-[0_0_10px_#dc2626]"
                   )}
                 />
              </div>

              <Button
                onClick={handleAction}
                disabled={!adCompleted}
                className={cn(
                  "w-full h-14 md:h-20 rounded-2xl md:rounded-3xl text-[10px] md:text-lg font-black uppercase italic tracking-[0.2em] transition-all active:scale-95",
                  adCompleted 
                    ? "bg-white text-black hover:bg-emerald-500 hover:text-white" 
                    : "bg-neutral-900 text-neutral-700 cursor-not-allowed border-white/5 opacity-50"
                )}
              >
                {adCompleted ? "Execute_Session" : `Handshake_Sequence_${countdown}s`}
              </Button>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <button 
                onClick={() => { onOpenChange(false); window.location.href='/pricing'; }}
                className="flex items-center gap-2 group"
              >
                <Crown className="w-3 h-3 text-yellow-500" />
                <span className="text-[8px] md:text-[10px] font-black uppercase italic text-neutral-500 group-hover:text-yellow-500">
                  Remove Protocols via Premium
                </span>
              </button>
              
              <div className="hidden sm:flex items-center gap-4 text-neutral-800 text-[8px] font-mono font-black uppercase">
                 <span className="flex items-center gap-1"><Activity size={10}/> STABLE</span>
                 <span>TERMINAL_4.2.0</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}