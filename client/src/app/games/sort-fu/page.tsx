"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Trophy, RotateCcw, Play, 
  BarChart, Timer, ArrowUpNarrowWide, 
  ArrowDownWideNarrow, Target, Flame,
  History, Calendar, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---
type SortOrder = 'asc' | 'desc';

interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

export default function SortFuGame() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [array, setArray] = useState<number[]>([]);
  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<MatchRecord[]>([]);

  // --- Persistence Logic ---
  useEffect(() => {
    const savedHistory = localStorage.getItem("sort_fu_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedHighScore = localStorage.getItem("sort_fu_highscore");
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
  }, []);

  const saveMatch = useCallback((finalScore: number, finalLevel: number) => {
    const newRecord: MatchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: finalScore,
      level: finalLevel
    };

    // Update History (Limit to 5)
    const updatedHistory = [newRecord, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("sort_fu_history", JSON.stringify(updatedHistory));

    // Update High Score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("sort_fu_highscore", finalScore.toString());
      toast.success("NEW PERSONAL BEST!", { icon: "🏆" });
    }
  }, [history, highScore]);

  // --- Game Generation ---
  const generateLevelConfig = useCallback(() => {
    let size = 4;
    let min = 1;
    let max = 100;
    let order: SortOrder = 'asc';

    if (level > 3) size = 5;
    if (level > 6) { size = 6; order = Math.random() > 0.5 ? 'asc' : 'desc'; }
    if (level > 10) { size = 8; min = -50; }
    
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    const uniqueArray = Array.from(new Set(newArray));
    while(uniqueArray.length < size) {
        uniqueArray.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    setArray(uniqueArray);
    setSortOrder(order);
    setTargetIndex(0);
  }, [level]);

  const sortedTargetArray = useMemo(() => {
    return [...array].sort((a, b) => sortOrder === 'asc' ? a - b : b - a);
  }, [array, sortOrder]);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(20);
    setStreak(0);
    setGameState('PLAYING');
    generateLevelConfig();
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING') {
      setGameState('GAMEOVER');
      saveMatch(score, level);
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState, score, level, saveMatch]);

  const handleTap = (val: number) => {
    if (val === sortedTargetArray[targetIndex]) {
      const newTarget = targetIndex + 1;
      setTargetIndex(newTarget);
      setStreak(prev => prev + 1);
      
      if (newTarget === array.length) {
        setScore(s => s + 100 + (level * 20));
        setLevel(l => l + 1);
        setTimeLeft(t => Math.min(30, t + 4));
        toast.success(`Level ${level} Mastered!`);
        generateLevelConfig();
      }
    } else {
      setStreak(0);
      setTimeLeft(t => Math.max(0, t - 4));
      toast.error("Broken Order!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30">
      <div className="max-w-2xl w-full">
        
        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-8 bg-neutral-900/80 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Score</p>
              <p className="text-2xl font-black tabular-nums">{score}</p>
            </div>
          </div>

          <div className="relative h-16 w-16 flex items-center justify-center">
             <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="176" 
                strokeDashoffset={176 - (176 * timeLeft) / 30}
                className={cn("transition-all duration-1000", timeLeft < 7 ? "text-red-500" : "text-emerald-500")} />
             </svg>
             <span className={cn("font-black text-xl z-10", timeLeft < 7 && "animate-pulse text-red-500")}>{timeLeft}</span>
          </div>

          <div className="text-right">
             <Badge className="bg-emerald-500/10 text-emerald-400 border-none mb-1 px-3">LVL {level}</Badge>
             <div className="flex items-center gap-1 text-orange-500 justify-end">
                <Flame size={14} className={streak > 5 ? "animate-bounce" : ""} />
                <span className="text-xs font-black uppercase">Streak: {streak}</span>
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex p-8 bg-emerald-500/10 rounded-[3rem] border border-emerald-500/20">
                  <BarChart size={80} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic">SORT-<span className="text-emerald-500">FU</span></h1>
                <p className="text-neutral-400 max-w-sm mx-auto font-medium italic underline decoration-emerald-500/30 underline-offset-4">Advanced Reflex-Sorting Protocol v2.0</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-3xl rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                ENTER DOJO <Play className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="flex justify-center">
                 <div className={cn(
                    "px-10 py-4 rounded-full border-2 flex items-center gap-4 transition-all duration-500",
                    sortOrder === 'asc' ? "bg-blue-500/10 border-blue-500/50 text-blue-400" : "bg-purple-500/10 border-purple-500/50 text-purple-400"
                 )}>
                    {sortOrder === 'asc' ? <ArrowUpNarrowWide size={28} /> : <ArrowDownWideNarrow size={28} />}
                    <span className="text-2xl font-black uppercase italic tracking-tighter">
                        Sort {sortOrder === 'asc' ? "Ascending" : "Descending"}
                    </span>
                 </div>
              </div>

              <div className={cn("grid gap-4", array.length <= 4 ? "grid-cols-2" : "grid-cols-3")}>
                {array.map((val, i) => {
                  const isCorrected = sortedTargetArray.slice(0, targetIndex).includes(val);
                  return (
                    <motion.button
                      key={`${val}-${i}`}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => !isCorrected && handleTap(val)}
                      disabled={isCorrected}
                      className={cn(
                        "h-28 rounded-[2rem] text-4xl font-black transition-all border-b-[10px] relative overflow-hidden",
                        isCorrected 
                          ? "bg-neutral-900 border-neutral-950 text-neutral-800 scale-90 opacity-40 cursor-default" 
                          : "bg-neutral-800 border-neutral-900 text-white hover:border-emerald-500"
                      )}
                    >
                      {val}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-emerald-500/20 shadow-2xl backdrop-blur-xl">
                 <h2 className="text-6xl font-black text-emerald-500 uppercase italic tracking-tighter mb-2">Focus Lost</h2>
                 <p className="text-neutral-500 font-bold tracking-[0.3em] text-xs mb-8">MISSION STATS</p>
                 <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2">Final Zen</p>
                     <p className="text-5xl font-black text-emerald-500">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2">Mastery</p>
                     <p className="text-5xl font-black text-white">{level}</p>
                   </div>
                 </div>
                 <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-emerald-500 transition-all">
                   RE-ENTER DOJO <RotateCcw className="ml-3" />
                 </Button>
              </div>

              {/* --- Persistence History --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 text-neutral-500">
                  <History size={16} />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">Mission History (Last 5)</h3>
                </div>
                <div className="space-y-3">
                  {history.map((match) => (
                    <div key={match.id} className="bg-neutral-900/40 border border-white/5 p-5 rounded-[2rem] flex justify-between items-center group hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-black rounded-xl text-neutral-500 group-hover:text-emerald-500 transition-colors">
                          <Calendar size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-600 font-bold uppercase">{match.date}</span>
                          <span className="text-sm font-black text-emerald-400 tracking-tight italic">LVL {match.level} Reach</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-600 uppercase block mb-1">Score</span>
                        <span className="text-2xl font-black tracking-tighter">{match.score}</span>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-[2rem]">
                      <p className="text-xs text-neutral-700 font-bold uppercase tracking-widest italic">No prior data discovered.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 flex gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800">
        <span className="flex items-center gap-2"><Target size={14} /> Logic Tracking</span>
        <span className="flex items-center gap-2"><Activity size={14} /> Personal Best: {highScore}</span>
        <span className="flex items-center gap-2 font-mono">SORT-FU V2.0-ARCADE</span>
      </div>
    </div>
  );
}