"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  FlaskConical, Atom, Trophy, Play, 
  RotateCcw, Zap, Heart, Timer, 
  ShieldCheck, Activity, Search,
  History as HistoryIcon, Calendar, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// --- Periodic Table Data Tiered by Difficulty ---
const ELEMENTS = [
  // Tier 1: Common (Levels 1-10)
  { name: "Hydrogen", sym: "H", tier: 1 }, { name: "Helium", sym: "He", tier: 1 },
  { name: "Carbon", sym: "C", tier: 1 }, { name: "Oxygen", sym: "O", tier: 1 },
  { name: "Nitrogen", sym: "N", tier: 1 }, { name: "Gold", sym: "Au", tier: 1 },
  { name: "Iron", sym: "Fe", tier: 1 }, { name: "Sodium", sym: "Na", tier: 1 },
  // Tier 2: Intermediate (Levels 11-25)
  { name: "Silver", sym: "Ag", tier: 2 }, { name: "Copper", sym: "Cu", tier: 2 },
  { name: "Mercury", sym: "Hg", tier: 2 }, { name: "Tungsten", sym: "W", tier: 2 },
  { name: "Potassium", sym: "K", tier: 2 }, { name: "Lead", sym: "Pb", tier: 2 },
  { name: "Tin", sym: "Sn", tier: 2 }, { name: "Antimony", sym: "Sb", tier: 2 },
  // Tier 3: Rare/Obscure (Levels 26-50+)
  { name: "Molybdenum", sym: "Mo", tier: 3 }, { name: "Technetium", sym: "Tc", tier: 3 },
  { name: "Praseodymium", sym: "Pr", tier: 3 }, { name: "Dysprosium", sym: "Dy", tier: 3 },
  { name: "Thulium", sym: "Tm" , tier: 3 }, { name: "Hafnium", sym: "Hf", tier: 3 },
  { name: "Seaborgium", sym: "Sg", tier: 3 }, { name: "Oganesson", sym: "Og", tier: 3 }
];

interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

export default function SymbolStrike() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [level, setLevel] = useState(1);
  const [currentElem, setCurrentElem] = useState(ELEMENTS[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [lastIndices, setLastIndices] = useState<number[]>([]);
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // --- Persistence: Load History and High Score ---
  useEffect(() => {
    const savedHistory = localStorage.getItem("symbol_strike_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedHigh = localStorage.getItem("symbol_strike_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  const saveMatch = useCallback((finalScore: number, finalLevel: number) => {
    const newRecord: MatchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: finalScore,
      level: finalLevel
    };
    const updatedHistory = [newRecord, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("symbol_strike_history", JSON.stringify(updatedHistory));
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("symbol_strike_high", finalScore.toString());
    }
  }, [history, highScore]);

  // --- Particle "Explosion" Effect ---
  const triggerExplosion = () => {
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  // --- Question Logic with Non-Repeat and Difficulty Scaling ---
  const generateQuestion = useCallback(() => {
    // 1. Determine Difficulty Tier based on level
    let targetTier = 1;
    if (level > 10) targetTier = 2;
    if (level > 25) targetTier = 3;

    // 2. Filter pool based on tier (include lower tiers for variety)
    const pool = ELEMENTS.filter(e => e.tier <= targetTier);

    // 3. Select next element with non-repeat logic
    let nextIdx: number;
    do {
      nextIdx = Math.floor(Math.random() * pool.length);
    } while (lastIndices.includes(nextIdx));

    setLastIndices(prev => [nextIdx, ...prev].slice(0, 3));
    const correct = pool[nextIdx];
    setCurrentElem(correct);

    // 4. Generate options
    const opts = new Set<string>();
    opts.add(correct.sym);
    while (opts.size < 4) {
      opts.add(ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)].sym);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));

    // 5. Calculate Time: Base 10s, reduces by 0.15s per level. Min 2.0s
    setTimeLeft(Math.max(2.0, 10 - (level * 0.15)));
  }, [level, lastIndices]);

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
      setScore(s => s + (20 * level));
      setLevel(l => l + 1);
      triggerExplosion();
      toast.success("Reaction Stable", { duration: 600 });
      generateQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("Isotope Unstable", { description: "Incorrect Symbol Selected" });
      generateQuestion();
    } else {
      setGameState('GAMEOVER');
      saveMatch(score, level);
    }
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setLastIndices([]);
    setGameState('PLAYING');
    generateQuestion();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      
      <div className="max-w-xl w-full relative">
        {/* --- Particles Layer --- */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-1/2 w-3 h-3 bg-emerald-500 rounded-full z-50 pointer-events-none shadow-[0_0_15px_#10b981]"
            />
          ))}
        </AnimatePresence>

        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-10 bg-neutral-900/50 p-5 rounded-[2rem] border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
               <Zap size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Score</p>
               <p className="text-xl font-black">{score}</p>
             </div>
          </div>
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={18} className={cn(i < lives ? "text-red-500 fill-red-500" : "text-neutral-800")} />
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Phase</p>
            <p className="text-xl font-black text-emerald-500">{level}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 py-10">
              <div className="space-y-4">
                <div className="inline-flex p-8 bg-emerald-500/10 rounded-[3rem] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                  <FlaskConical size={64} className="text-emerald-500" />
                </div>
                <h1 className="text-5xl font-black tracking-tighter uppercase italic">Symbol <span className="text-emerald-500">Strike</span></h1>
                <p className="text-neutral-400 max-w-sm mx-auto">Master the elements across 50+ levels of atomic acceleration.</p>
              </div>
              <Button onClick={startGame} className="w-full h-20 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-2xl rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.2)]">
                BOOT REACTOR <Play className="ml-2 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              {/* Timer Bar */}
              <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 10) * 100}%` }}
                  className={cn("h-full transition-colors duration-200", timeLeft < 3 ? "bg-red-500 shadow-[0_0_15px_red]" : "bg-emerald-500 shadow-[0_0_15px_#10b981]")}
                />
              </div>

              {/* Element Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
                <Card className="bg-neutral-900 border-2 border-white/5 rounded-[50px] p-16 text-center relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-neutral-500 mb-4">Atomic Name</p>
                  <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic">
                    {currentElem.name}
                  </h2>
                </Card>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-4">
                {options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    className="h-28 bg-neutral-900 border border-white/5 hover:border-emerald-500 hover:bg-emerald-500/5 text-4xl font-black rounded-[2rem] transition-all transform active:scale-95"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="text-center bg-neutral-900 p-12 rounded-[4rem] border border-red-500/20 shadow-2xl">
                 <Atom size={64} className="text-red-500 mx-auto mb-4 animate-spin-slow" />
                 <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-8">Reactor <span className="text-red-500">Offline</span></h2>
                 
                 <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2">Final Energy</p>
                     <p className="text-4xl font-black text-emerald-500">{score}</p>
                   </div>
                   <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2">Max Phase</p>
                     <p className="text-4xl font-black text-white">{level}</p>
                   </div>
                 </div>

                 <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-xl rounded-3xl hover:bg-emerald-500 transition-all">
                   RE-INITIALIZE <RotateCcw className="ml-2" />
                 </Button>
              </div>

              {/* --- Mission Log (localStorage History) --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 text-neutral-500">
                  <HistoryIcon size={16} />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">Mission History</h3>
                </div>
                <div className="space-y-3">
                  {history.map((match) => (
                    <div key={match.id} className="bg-neutral-900/40 border border-white/5 p-5 rounded-[2.5rem] flex justify-between items-center group hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-black rounded-2xl text-neutral-500 group-hover:text-emerald-500 transition-colors">
                          <Calendar size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-600 font-bold uppercase">{match.date}</span>
                          <span className="text-lg font-black text-emerald-400 italic">Phase {match.level} Reached</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-600 uppercase block mb-1">Energy</span>
                        <span className="text-3xl font-black tabular-nums">{match.score}</span>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-center text-xs text-neutral-700 italic">No prior data discovered.</p>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer HUD */}
      <div className="mt-16 flex gap-10 text-[9px] font-black uppercase tracking-[0.5em] text-neutral-800">
        <span className="flex items-center gap-2"><ShieldCheck size={12} /> Atomic Vault</span>
        <span className="flex items-center gap-2"><Trophy size={12} /> Record: {highScore}</span>
        <span className="flex items-center gap-2 font-mono"><Hash size={12} /> Stable Isotopes</span>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}