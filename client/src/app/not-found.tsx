"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Home, 
  ArrowLeft, 
  Search, 
  WifiOff, 
  Terminal,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900/50 flex flex-col">
      
      {/* --- Background Atmosphere --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full opacity-40 animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-20 text-center">
        
        {/* --- Error Code Display --- */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <h1 className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-black select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="p-6 bg-[#0a0a0a] border border-red-500/20 rounded-[2rem] shadow-[0_0_60px_rgba(220,38,38,0.15)] backdrop-blur-md">
                <WifiOff size={64} className="text-red-500 animate-pulse" />
             </div>
          </div>
        </motion.div>

        {/* --- Technical Status --- */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 max-w-lg mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-red-500">
            <AlertTriangle size={12} />
            Signal Lost
          </div>

          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            Page Not Found
          </h2>
          
          <p className="text-neutral-400 text-sm md:text-base font-medium leading-relaxed">
            The requested data node <span className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">/void</span> could not be located in the neural network. It may have been moved, deleted, or never existed.
          </p>

          {/* Action Grid */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/">
              <Button className="h-12 px-8 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-auto">
                <Home size={14} className="mr-2" /> Return Home
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" className="h-12 px-8 bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all w-full sm:w-auto">
                <Terminal size={14} className="mr-2" /> Report Issue
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* --- Quick Links Footer --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest"
        >
           <span className="flex items-center gap-2"><Activity size={12} className="text-green-500" /> Systems Operational</span>
           <span>•</span>
           <Link href="/tools" className="hover:text-white transition-colors">Engineering Tools</Link>
           <span>•</span>
           <Link href="/games" className="hover:text-white transition-colors">Arcade</Link>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}