"use client";

import Link from "next/link";
import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Youtube, FileText, Zap, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export default function CorePromo({ className }: { className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={cn("w-full py-10", className)}
    >
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/5 transform-gpu shadow-2xl">
        
        {/* --- Animated Gradient Background --- */}
        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
          <div className="absolute -inset-[100%] animate-[spin_20s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#dc2626_20%,#ea580c_40%,#000000_60%,#dc2626_80%,#000000_100%)] blur-2xl" />
        </div>
        
        {/* Inner glass wrapper */}
        <div className="absolute inset-[2px] rounded-[2.4rem] bg-[#0a0a0a]/90 backdrop-blur-3xl z-0" />
        <div className="absolute -right-32 -top-32 h-96 w-96 bg-red-600/10 blur-[100px] rounded-full z-0 group-hover:bg-red-600/20 transition-all duration-700" />
        <div className="absolute -left-32 -bottom-32 h-96 w-96 bg-orange-600/10 blur-[100px] rounded-full z-0 group-hover:bg-orange-600/20 transition-all duration-700" />

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 p-8 md:p-12">
          
          {/* --- Content Side --- */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl mx-auto lg:mx-0">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-red-600/20 to-orange-500/10 border border-red-500/30 px-4 py-1.5 backdrop-blur-sm shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-100 drop-shadow-md">
                Core Feature Unlocked
              </span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                Don't Just Watch.<br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                    Start Learning.
                  </span>
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-red-600/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h3>
            </motion.div>
            
            <motion.p variants={itemVariants} className="text-xs md:text-sm font-bold text-neutral-400 uppercase tracking-widest leading-relaxed max-w-lg mx-auto lg:mx-0">
              Transform any <span className="text-red-400">YouTube video</span> into formatted study notes, and summaries instantly with <span className="text-white">Paperxify AI</span>.
            </motion.p>
          </div>

          {/* --- Visual / Action Side --- */}
          <motion.div variants={itemVariants} className="shrink-0 relative w-full lg:w-auto flex justify-center mt-6 lg:mt-0">
             
            {/* Floating connecting elements */}
            <div className="absolute -top-12 -left-12 lg:-left-24 lg:-top-16 hidden sm:flex items-center justify-center pointer-events-none">
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 backdrop-blur-md flex items-center justify-center transform -rotate-12 shadow-[0_0_30px_rgba(220,38,38,0.3)]"
              >
                <Youtube className="text-red-500" size={24} />
              </motion.div>
            </div>
            
            <div className="absolute -bottom-10 -right-8 lg:-right-16 hidden sm:flex items-center justify-center pointer-events-none z-20">
              <motion.div 
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 backdrop-blur-md flex items-center justify-center transform rotate-12 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
              >
                <BookOpen className="text-orange-400" size={26} />
              </motion.div>
            </div>

            <Link href="/" className="relative z-10 block w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group/btn relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-[1.5px] shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-shadow hover:shadow-[0_0_80px_rgba(220,38,38,0.8)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                
                <div className="relative h-full w-full rounded-[15px] bg-gradient-to-br from-red-600 to-red-800 px-8 py-5 md:px-12 md:py-6 flex items-center justify-center gap-4 overflow-hidden">
                   {/* Button inner shine */}
                   <div className="absolute top-0 -left-[150%] h-full w-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-45deg] group-hover/btn:animate-[shine_1.5s_ease-out_infinite]" />
                   
                   <div className="relative z-10 flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-inner">
                      <Zap size={20} className="fill-white" />
                   </div>
                   
                   <div className="text-left relative z-10 flex-1">
                      <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-red-200 mb-0.5">Automate Study</p>
                      <p className="text-base sm:text-xl font-black italic uppercase tracking-wider text-white leading-none whitespace-nowrap">YT To Notes <ArrowRight className="inline-block ml-1 mb-1 transition-transform group-hover/btn:translate-x-2" size={20} /></p>
                   </div>
                </div>
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}