"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  FlaskConical, Atom, Trophy, Play, 
  RotateCcw, Zap, Heart, Timer, 
  ShieldCheck, Activity, Search,
  History as HistoryIcon, Calendar, Hash,
  Loader2, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/config/api";
import { Card } from "@/components/ui/card";

// --- Periodic Table Data (Untouched Structure) ---
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
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [level, setLevel] = useState(1);
  const [currentElem, setCurrentElem] = useState(ELEMENTS[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  // --- Device Detection Logic ---
  const getDeviceMetadata = () => {
    if (typeof window === "undefined") return { isMobile: false, browser: "Unknown" };
    
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    
    // Detect Browser Name
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Trident")) browser = "Internet Explorer";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    // Detect Mobile via Screen Width + UserAgent
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
      toast.success("TELEMETRY_SYNCED");
    } catch (err) {
      toast.error("SYNC_OFFLINE", { description: "Saving to local vault." });
    } finally {
      setGameState('GAMEOVER');
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("symbol_strike_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedHigh = localStorage.getItem("symbol_strike_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

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
      toast.success("STABLE_ISOTOPE", { duration: 500 });
      generateQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("RADIATION_LEAK", { description: "Incorrect Atomic Path" });
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* --- HUD --- */}
      <div className="w-full max-w-2xl bg-neutral-900/20 border border-white/5 p-6 rounded-[2.5rem] md:rounded-[3rem] backdrop-blur-3xl mb-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Energy</p>
              <p className="text-2xl font-black tabular-nums">{score}</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={22} className={cn("transition-all duration-300", i < lives ? "text-red-600 fill-red-600" : "text-neutral-900")} />
            ))}
          </div>

          <div className="text-right">
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Phase {level}</p>
            <span className={cn("text-xl font-black tabular-nums", timeLeft < 3 ? "text-red-600 animate-pulse" : "text-white")}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-xl w-full relative">
        <AnimatePresence mode="wait">
          
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                  <FlaskConical size={80} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">SYMBOL</h1>
                <span className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-emerald-500">STRIKE</span>
                <p className="text-neutral-600 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Atomic_Recognition_Module_v4.0</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                START <Play size={28} className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 8) * 100}%` }}
                  className={cn("h-full transition-colors", timeLeft < 2.5 ? "bg-red-600" : "bg-emerald-500")}
                />
              </div>

              {/* Element Card: 16:9 Inspired */}
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
                <Card className="bg-neutral-900/40 border-2 border-white/5 rounded-[4rem] p-12 md:p-20 text-center relative z-10 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-700 mb-6">Molecular_Identity</p>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none">
                    {currentElem.name}
                  </h2>
                </Card>
              </div>

              {/* Options Grid: 2x2 for Mobile Thumb-Access */}
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                {options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    className="h-24 md:h-32 bg-neutral-900/50 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-4xl md:text-6xl font-black rounded-[2rem] md:rounded-[3rem] transition-all transform active:scale-90"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-900/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                 <h2 className="text-5xl md:text-7xl font-black text-red-600 uppercase italic tracking-tighter mb-10 relative z-10 leading-none">REACTION_<br/>CRITICAL</h2>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Final_Energy</p>
                     <p className="text-5xl font-black text-emerald-500 leading-none tabular-nums">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Max_Phase</p>
                     <p className="text-5xl font-black text-white leading-none tabular-nums">L{level}</p>
                   </div>
                 </div>

                 {gameState === 'SYNCING' ? (
                   <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                      <Loader2 size={16} className="animate-spin" /> Uploading_Isotope_Data...
                   </div>
                 ) : (
                   <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-2xl">
                    RESTART <RotateCcw size={24} className="ml-3" />
                   </Button>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meta HUD */}
      <div className="mt-16 flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-900">
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> Vault_Protected</span>
        <span className="flex items-center gap-2"><Trophy size={14} /> pb_node: {highScore}</span>
        <span className="flex items-center gap-2 italic">v2026.VOID-ARCADE</span>
      </div>
    </div>
  );
}