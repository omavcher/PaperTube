"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  FlaskConical, Zap, Heart, Activity, 
  RotateCcw, Loader2, Atom, ShieldCheck, 
  Home, Grid, Settings, Gamepad2, Trophy, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/config/api";
import Link from "next/link";
import Footer from "@/components/Footer";
import CorePromo from "@/components/CorePromo"; // Core feature integration

// --- Periodic Table Data ---
const ELEMENTS = [
  { name: "Hydrogen", sym: "H", tier: 1 }, { name: "Helium", sym: "He", tier: 1 },
  { name: "Carbon", sym: "C", tier: 1 }, { name: "Oxygen", sym: "O", tier: 1 },
  { name: "Nitrogen", sym: "N", tier: 1 }, { name: "Gold", sym: "Au", tier: 1 },
  { name: "Iron", sym: "Fe", tier: 1 }, { name: "Sodium", sym: "Na", tier: 1 },
  { name: "Silver", sym: "Ag", tier: 2 }, { name: "Copper", sym: "Cu", tier: 2 },
  { name: "Mercury", sym: "Hg", tier: 2 }, { name: "Tungsten", sym: "W", tier: 2 },
  { name: "Potassium", sym: "K", tier: 2 }, { name: "Lead", sym: "Pb", tier: 2 },
  { name: "Tin", sym: "Sn", tier: 2 }, { name: "Antimony", sym: "Sb", tier: 2 },
  { name: "Molybdenum", sym: "Mo", tier: 3 }, { name: "Technetium", sym: "Tc", tier: 3 },
  { name: "Praseodymium", sym: "Pr", tier: 3 }, { name: "Dysprosium", sym: "Dy", tier: 3 },
  { name: "Thulium", sym: "Tm" , tier: 3 }, { name: "Hafnium", sym: "Hf", tier: 3 },
  { name: "Seaborgium", sym: "Sg", tier: 3 }, { name: "Oganesson", sym: "Og", tier: 3 }
];

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

export default function SymbolStrike() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [level, setLevel] = useState(1);
  const [currentElem, setCurrentElem] = useState(ELEMENTS[0]);
  const [options, setOptions] = useState<string[]>([]);
  
  // --- Device Detection Logic ---
  const getDeviceMetadata = () => {
    if (typeof window === "undefined") return { isMobile: false, browser: "Unknown" };
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    const isMobile = /Mobi|Android|iPhone/i.test(ua) || window.innerWidth < 768;
    return { isMobile, browser };
  };

  // --- Identity & Telemetry Sync ---
  const pushStats = async (finalScore: number, finalLevel: number) => {
    setGameState('SYNCING');
    let user;
    try {
      const stored = localStorage.getItem("user");
      user = stored ? JSON.parse(stored) : null;
    } catch { user = null; }

    const payload = {
      userId: user?.id || "guest_node",
      name: user?.name || "Guest",
      email: user?.email || "anonymous@void.com",
      game: "Symbol Strike",
      stats: {
        score: finalScore,
        level: finalLevel,
        timestamp: new Date().toISOString()
      },
      device: getDeviceMetadata()
    };

    try {
      await api.post("/general/game-stats", payload);
      toast.success("TELEMETRY SYNCED");
    } catch (err) {
      // Silent fail for arcade feel, local save only
    } finally {
      setGameState('GAMEOVER');
    }
  };

  // --- Atomic Engine Logic ---
  const generateQuestion = useCallback(() => {
    const tier = level < 8 ? 1 : level < 18 ? 2 : 3;
    const pool = ELEMENTS.filter(e => e.tier <= tier);
    const correct = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrentElem(correct);
    const opts = new Set<string>();
    opts.add(correct.sym);
    while (opts.size < 4) {
      opts.add(ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)].sym);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));

    // Time decay: Starts at 8s, drops to floor of 1.8s
    setTimeLeft(Math.max(1.8, 8 - (level * 0.15)));
  }, [level]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => Math.round((prev - 0.1) * 10) / 10), 100);
    } else if (timeLeft <= 0 && gameState === 'PLAYING') {
      handleWrong();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleAnswer = (sym: string) => {
    if (sym === currentElem.sym) {
      setScore(s => s + (50 * level));
      setLevel(l => l + 1);
      generateQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("RADIATION LEAK - STABILITY CRITICAL");
      generateQuestion();
    } else {
      pushStats(score, level);
    }
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('PLAYING');
    generateQuestion();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-emerald-500/30 font-sans flex flex-col overflow-hidden">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[60vh] bg-emerald-600/5 blur-[120px] pointer-events-none" />

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <FlaskConical className="text-emerald-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">SYMBOL STRIKE</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 w-full max-w-4xl mx-auto min-h-[80vh]">
        
        {/* --- HUD --- */}
        <div className="w-full max-w-2xl bg-neutral-900/40 border border-white/10 p-6 rounded-[2.5rem] md:rounded-full backdrop-blur-md mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 opacity-50" />
          
          <div className="relative z-10 flex justify-between items-center px-2 md:px-6">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Zap size={24} className="fill-black" />
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Energy</p>
                <p className="text-2xl font-mono font-black tabular-nums tracking-tight">{score}</p>
              </div>
            </div>

            {/* Lives */}
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} size={20} className={cn("transition-all duration-300 drop-shadow-lg", i < lives ? "text-red-500 fill-red-500" : "text-neutral-800 fill-neutral-800")} />
              ))}
            </div>

            {/* Timer/Level */}
            <div className="text-right">
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Phase {level}</p>
              <span className={cn("text-xl font-mono font-black tabular-nums block", timeLeft < 3 ? "text-red-500 animate-pulse" : "text-white")}>
                {timeLeft.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* --- Game Area --- */}
        <div className="w-full max-w-lg relative">
          <AnimatePresence mode="wait">
            
            {/* START SCREEN */}
            {gameState === 'START' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex p-8 bg-black rounded-full border-2 border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)] relative">
                    <div className="absolute inset-0 border border-emerald-500 rounded-full animate-[spin_10s_linear_infinite]" />
                    <Atom size={64} className="text-emerald-500" />
                  </div>
                  <div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">SYMBOL</h1>
                    <span className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700">STRIKE</span>
                  </div>
                  <p className="text-neutral-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Atomic_Recognition_Protocol_v4.0</p>
                </div>
                <Button onClick={startGame} className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-2xl rounded-[2rem] shadow-xl active:scale-95 transition-all uppercase italic tracking-widest">
                  Initialize <Gamepad2 size={28} className="ml-3" />
                </Button>
              </motion.div>
            )}

            {/* GAMEPLAY SCREEN */}
            {gameState === 'PLAYING' && (
              <motion.div key="playing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                {/* Timer Bar */}
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 8) * 100}%` }}
                    className={cn("h-full transition-colors duration-300", timeLeft < 2.5 ? "bg-red-600" : "bg-emerald-500")}
                  />
                </div>

                {/* Element Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-500/30 transition-all duration-500" />
                  <div className="bg-black/80 border border-white/10 rounded-[3rem] p-12 text-center relative z-10 backdrop-blur-xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-4">Target Isotope</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-lg">
                      {currentElem.name}
                    </h2>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {options.map((opt, i) => (
                    <Button 
                      key={i} 
                      onClick={() => handleAnswer(opt)}
                      className="h-24 bg-neutral-900/60 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-4xl md:text-5xl font-black rounded-[2rem] transition-all transform active:scale-95 text-white"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* GAMEOVER SCREEN */}
            {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                <div className="text-center bg-black/60 p-10 rounded-[3rem] border border-red-900/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none" />
                    
                    <h2 className="text-5xl md:text-7xl font-black text-red-600 uppercase italic tracking-tighter mb-8 relative z-10 leading-none">
                      CRITICAL<br/><span className="text-white">FAILURE</span>
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                      <div className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-black text-neutral-500 uppercase mb-1 tracking-widest">Final Energy</p>
                        <p className="text-4xl font-mono font-black text-emerald-500">{score}</p>
                      </div>
                      <div className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-black text-neutral-500 uppercase mb-1 tracking-widest">Max Phase</p>
                        <p className="text-4xl font-mono font-black text-white">L{level}</p>
                      </div>
                    </div>

                    {gameState === 'SYNCING' ? (
                      <div className="h-16 flex items-center justify-center gap-3 bg-neutral-900 rounded-2xl text-[10px] font-black text-neutral-500 tracking-[0.3em] uppercase">
                         <Loader2 size={16} className="animate-spin text-emerald-500" /> SYNCING_LOGS...
                      </div>
                    ) : (
                      <Button onClick={startGame} className="w-full h-16 bg-white text-black font-black text-xl rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-xl uppercase italic tracking-widest">
                       Reboot System <RotateCcw size={20} className="ml-2" />
                      </Button>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- CORE PROMO (Placement) --- */}
        <div className="w-full mt-16">
           <CorePromo />
        </div>

      </main>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-emerald-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}