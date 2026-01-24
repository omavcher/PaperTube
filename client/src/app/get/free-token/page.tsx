"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Coins, Play, ShoppingCart, ArrowRight, 
  ShieldAlert, Flame, Sparkles, Lock, Gift 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TokenForge() {
  const [paperCoins, setPaperCoins] = useState(0);
  const [userTokens, setUserTokens] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // Sync with local storage or state on mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUserTokens(savedUser.tokens || 0);
  }, []);

  const simulateVideoAd = () => {
    setIsWatching(true);
    // Simulate a 5-second "Ad" duration
    setTimeout(() => {
      setIsWatching(false);
      setPaperCoins(prev => prev + 10);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    }, 5000);
  };

  const exchangeCoins = (amount: number, cost: number) => {
    if (paperCoins >= cost) {
      setPaperCoins(prev => prev - cost);
      setUserTokens(prev => prev + amount);
      // Here you would typically call your backend API to update user tokens
      alert(`Successfully forged ${amount} Credits!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/10 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-4xl mx-auto">
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 mb-6"
          >
            <Flame size={14} className="text-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">The Neural Forge</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
            Free <span className="text-red-600">Tokens</span> Node
          </h1>
          <p className="text-neutral-500 text-sm md:text-base font-medium max-w-xl mx-auto">
            Standard nodes require energy. Mine <span className="text-white italic">PaperCoins</span> by watching neural transmissions or upgrade to bypass the limits.
          </p>
        </div>

        {/* STATS HUD */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard 
            label="Your PaperCoins" 
            value={paperCoins} 
            icon={<Gift className="text-yellow-500" />} 
            sub="Earned from transmissions"
          />
          <StatCard 
            label="Available Credits" 
            value={userTokens} 
            icon={<Zap className="text-red-500" />} 
            sub="Ready for AI generation"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT: MINING (WATCH ADS) */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-6 bg-neutral-900/50 border border-white/5 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Play size={80} />
              </div>
              
              <h3 className="text-lg font-black uppercase italic mb-2">Mine Coins</h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase mb-6 leading-relaxed">
                Watch 1 Transmission <br /> 
                <span className="text-white">+ 10 PaperCoins</span>
              </p>

              <Button 
                onClick={simulateVideoAd}
                disabled={isWatching}
                className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase italic gap-2 transition-all active:scale-95"
              >
                {isWatching ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Syncing...
                  </div>
                ) : (
                  <> <Play size={16} fill="black" /> Watch Ad </>
                )}
              </Button>
            </div>

            {/* UPGRADE TEASE - FOMO */}
            <Link href="/pricing" className="block p-6 bg-red-600/10 border border-red-600/20 rounded-[2rem] group hover:bg-red-600/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <CrownIcon className="text-red-500" />
                    <ArrowRight size={16} className="text-red-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs font-black uppercase text-white mb-1">Tired of Mining?</p>
                <p className="text-[9px] font-bold text-neutral-400 uppercase leading-tight">
                    Upgrade to <span className="text-red-500">PRO</span> for unlimited power & zero ads.
                </p>
            </Link>
          </div>

          {/* RIGHT: THE FORGE (EXCHANGE) */}
          <div className="md:col-span-2 p-8 bg-neutral-900/30 border border-white/5 rounded-[2.5rem] relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-600/20 rounded-2xl">
                        <Coins className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic leading-none">The Credit Forge</h2>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Convert your coins into operational credits</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <ExchangeRow 
                        tokens={10} 
                        cost={100} 
                        canAfford={paperCoins >= 100} 
                        onExchange={() => exchangeCoins(10, 100)} 
                    />
                    <ExchangeRow 
                        tokens={50} 
                        cost={450} 
                        canAfford={paperCoins >= 450} 
                        discount="10% OFF"
                        onExchange={() => exchangeCoins(50, 450)} 
                    />
                    <ExchangeRow 
                        tokens={100} 
                        cost={800} 
                        canAfford={paperCoins >= 800} 
                        discount="20% OFF"
                        isPopular
                        onExchange={() => exchangeCoins(100, 800)} 
                    />
                </div>

                <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-center gap-4">
                    <ShieldAlert size={20} className="text-yellow-500 shrink-0" />
                    <p className="text-[9px] font-bold text-yellow-500/80 uppercase leading-relaxed">
                        Warning: Credit forgery is permanent. Credits linked to this node cannot be transferred back to PaperCoins.
                    </p>
                </div>
            </div>

            {/* Decorative Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>

        </div>
      </div>

      {/* Floating Reward Notification */}
      <AnimatePresence>
        {showReward && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 bg-white text-black rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
          >
            <div className="h-10 w-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <Sparkles size={20} fill="black" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase leading-none">Transmission Success</p>
                <p className="text-lg font-black italic">+10 PaperCoins</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- HELPER COMPONENTS --- */

const StatCard = ({ label, value, icon, sub }: any) => (
  <div className="p-6 bg-neutral-900/40 border border-white/5 rounded-[2rem]">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-3xl font-black tabular-nums italic uppercase tracking-tighter">{value.toLocaleString()}</div>
    <p className="text-[8px] text-neutral-600 font-bold uppercase mt-1">{sub}</p>
  </div>
);

const ExchangeRow = ({ tokens, cost, canAfford, onExchange, discount, isPopular }: any) => (
  <div className={cn(
    "flex items-center justify-between p-4 rounded-2xl border transition-all",
    isPopular ? "bg-red-600/5 border-red-600/30" : "bg-white/5 border-white/5 hover:border-white/10"
  )}>
    <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-neutral-800 rounded-xl flex items-center justify-center">
            <Zap size={18} className={cn(isPopular ? "text-red-500" : "text-white")} />
        </div>
        <div>
            <div className="flex items-center gap-2">
                <p className="text-sm font-black uppercase text-white">{tokens} Credits</p>
                {discount && <span className="text-[8px] bg-red-600 px-1.5 py-0.5 rounded font-black text-white">{discount}</span>}
            </div>
            <p className="text-[10px] font-bold text-neutral-500 uppercase">Cost: {cost} Coins</p>
        </div>
    </div>
    
    <button 
        onClick={onExchange}
        disabled={!canAfford}
        className={cn(
            "px-5 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all active:scale-95",
            canAfford 
                ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20" 
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5"
        )}
    >
        {canAfford ? "Forge Now" : "Locked"}
    </button>
  </div>
);

const CrownIcon = ({ className }: { className?: string }) => (
    <svg 
        width="24" height="24" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
        className={className}
    >
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
);