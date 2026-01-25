"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LoaderX() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#050505] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Rotating Neural Energy Field */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute h-[300px] w-[300px] opacity-20"
        >
          <div className="h-full w-full rounded-full border-t-2 border-red-600 blur-sm" />
        </motion.div>
        
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute h-[250px] w-[250px] opacity-10"
        >
          <div className="h-full w-full rounded-full border-l-2 border-white blur-[2px]" />
        </motion.div>

        {/* --- Main Branding Node --- */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center"
          >
            <span className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white select-none">
              Paper<span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Tube</span>
            </span>
          </motion.div>

          {/* Tactical Progress Bar */}
          <div className="mt-8 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_red]"
            />
          </div>

          {/* System Status Log */}
          <div className="mt-6 flex flex-col items-center gap-2">
             <motion.div 
               animate={{ opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="flex items-center gap-2"
             >
                <div className="h-1 w-1 rounded-full bg-red-600" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-500">
                   Synchronizing Neural Paths
                </span>
             </motion.div>
             <span className="text-[7px] font-mono text-neutral-700 uppercase tracking-widest">
                Kernel_Boot_Sequence::v8.4.2
             </span>
          </div>
        </div>
      </div>

      {/* Ambient Red Pulse */}
      <motion.div 
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-radial-gradient from-red-600/20 via-transparent to-transparent pointer-events-none"
      />
    </div>
  );
}