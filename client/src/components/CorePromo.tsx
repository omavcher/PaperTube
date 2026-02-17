"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Youtube, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CorePromo({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("w-full py-6", className)}
    >
      <div className="relative group overflow-hidden rounded-[2rem] border border-red-600/30 bg-neutral-900/40 backdrop-blur-xl">
        
        {/* --- Animated Background Effects --- */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-transparent opacity-50" />
        <div className="absolute -right-20 -top-20 h-64 w-64 bg-red-600/20 blur-[100px] group-hover:bg-red-600/30 transition-all duration-500" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8">
          
          {/* --- Content Side --- */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-600/10 border border-red-600/20 px-3 py-1 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-red-500">
                Core Feature Unlocked
              </span>
            </div>
            
            <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">
              Don't Just Watch.<br />
              <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                Start Learning.
              </span>
            </h3>
            
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide max-w-md mx-auto md:mx-0">
              Transform any YouTube video into formatted study notes, and summaries instantly with PaperTube AI.
            </p>
          </div>

          {/* --- Visual / Action Side --- */}
          <div className="shrink-0 relative">
             {/* Decorative Icons connecting */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-full gap-2 opacity-10 scale-150 pointer-events-none">
                <Youtube size={40} />
                <ArrowRight size={20} />
                <FileText size={40} />
            </div>

            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="group/btn relative overflow-hidden rounded-xl bg-red-600 px-8 py-4 md:px-10 md:py-5 shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all hover:bg-red-500 hover:shadow-[0_0_60px_rgba(220,38,38,0.6)]"
              >
                <div className="relative z-10 flex items-center gap-3">
                   <Zap className="fill-white text-white" size={18} />
                   <div className="text-left">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Launch App</p>
                      <p className="text-sm font-black italic uppercase tracking-wider leading-none">Generate Notes</p>
                   </div>
                   <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </div>
                
                {/* Shine Effect */}
                <div className="absolute top-0 -left-[100%] h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-shine" />
              </motion.button>
            </Link>
          </div>

        </div>
      </div>
    </motion.div>
  );
}