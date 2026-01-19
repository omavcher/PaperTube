"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, ShieldAlert, Terminal, Activity, ZapOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* --- Tactical Background Assets --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        {/* Animated Red Scanline */}
        <motion.div 
          animate={{ y: ["0%", "100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,#dc2626_50%)] bg-[size:100%_4px] h-[200%]"
        />
        {/* Engineering Grid */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(220,38,38,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(220,38,38,0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* --- Main 404 Command Center --- */}
      <div className="w-full max-w-md mx-auto relative z-10">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-950 border border-red-600/30 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(220,38,38,0.15)] backdrop-blur-xl overflow-hidden relative"
        >
          {/* Top Status Bar */}
          <div className="absolute top-0 left-0 w-full flex justify-between px-8 py-3 bg-red-600/5 border-b border-white/5">
             <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.3em]">Critical Error</span>
             </div>
             <span className="text-[8px] font-mono text-neutral-600">ID: ERR_404_VOID</span>
          </div>

          {/* Tactical Icon */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-24 h-24 mx-auto mb-8 mt-4"
          >
            <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full" />
            <div className="relative w-full h-full bg-black border-2 border-red-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <ZapOff className="w-10 h-10 text-red-500" />
            </div>
          </motion.div>

          {/* Error Message */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
              SECTOR <span className="text-red-600">404</span>
            </h1>
            
            <p className="text-neutral-500 text-sm font-medium leading-relaxed px-4">
              Access denied. The requested node is currently unreachable or has been purged from the neural repository.
            </p>

            {/* Tactical Metadata Readout */}
            <div className="grid grid-cols-2 gap-2 pt-4">
               <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-left">
                  <p className="text-[8px] font-black text-neutral-600 uppercase mb-1">Packet Status</p>
                  <p className="text-[10px] font-bold text-red-500 uppercase">Lost in Transit</p>
               </div>
               <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-left">
                  <p className="text-[8px] font-black text-neutral-600 uppercase mb-1">Signal Strength</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">0.00%</p>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className={cn(
                  "w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase italic text-sm tracking-widest",
                  "flex items-center justify-center space-x-3 shadow-lg shadow-red-900/20 transition-all",
                  "hover:bg-red-700 active:bg-red-800"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Re-Initialize Link</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/")}
                className={cn(
                  "w-full bg-neutral-900 border border-white/10 text-neutral-400 py-4 rounded-2xl font-black uppercase italic text-sm tracking-widest",
                  "flex items-center justify-center space-x-3 transition-all",
                  "hover:text-white hover:border-red-600/50"
                )}
              >
                <Home className="w-4 h-4" />
                <span>Return to Root</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Footer HUD elements */}
        <div className="mt-12 flex justify-between items-center px-4">
          <div className="flex items-center gap-4 text-neutral-800">
             <div className="flex items-center gap-1.5">
                <Terminal size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Protocol 1.0</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Activity size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Sys: Redline</span>
             </div>
          </div>
          <div className="w-24 h-1 bg-neutral-900 rounded-full overflow-hidden">
             <motion.div 
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-1/2 h-full bg-red-600" 
             />
          </div>
        </div>
      </div>
    </div>
  );
}