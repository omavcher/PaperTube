"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Trophy, RotateCcw, Play, BarChart, Timer, 
  ArrowUpNarrowWide, ArrowDownWideNarrow, Target, Flame,
  History, Calendar, Activity, Loader2, ShieldCheck, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/config/api";

// --- Types ---
type SortOrder = 'asc' | 'desc';
type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

export default function SortFuGame() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [array, setArray] = useState<number[]>([]);
  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<MatchRecord[]>([]);
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
  // --- Identity & Backend Logic ---
  const syncStats = async (finalScore: number, finalLevel: number) => {
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
      game: "Sort-Fu",
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
      toast.error("SYNC_OFFLINE", { description: "Data cached locally." });
    } finally {
      setGameState('GAMEOVER');
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("sort_fu_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedHighScore = localStorage.getItem("sort_fu_highscore");
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
  }, []);

  // --- Game Mechanics (Hardcore Calibration) ---
  const generateLevelConfig = useCallback(() => {
    // Scaling Logic
    let size = level <= 2 ? 4 : level <= 5 ? 5 : level <= 10 ? 6 : 9;
    let min = level > 12 ? -100 : 1;
    let max = level > 15 ? 999 : 100;
    let order: SortOrder = level > 5 ? (Math.random() > 0.5 ? 'asc' : 'desc') : 'asc';

    const newArray: number[] = [];
    while(newArray.length < size) {
      const val = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!newArray.includes(val)) newArray.push(val);
    }

    setArray(newArray);
    setSortOrder(order);
    setTargetIndex(0);
    // Harder time limit: starts at 15s, decays as level increases
    setTimeLeft(Math.max(5, 15 - Math.floor(level / 2)));
  }, [level]);

  const sortedTargetArray = useMemo(() => {
    return [...array].sort((a, b) => sortOrder === 'asc' ? a - b : b - a);
  }, [array, sortOrder]);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setGameState('PLAYING');
    generateLevelConfig();
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => Math.round((prev - 0.1) * 10) / 10), 100);
    } else if (timeLeft <= 0 && gameState === 'PLAYING') {
      syncStats(score, level);
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleTap = (val: number) => {
    if (val === sortedTargetArray[targetIndex]) {
      const nextIdx = targetIndex + 1;
      setTargetIndex(nextIdx);
      setStreak(s => s + 1);
      
      if (nextIdx === array.length) {
        setScore(s => s + (100 * level) + Math.floor(timeLeft * 10));
        setLevel(l => l + 1);
        toast.success(`PHASE_${level}_COMPLETE`);
        generateLevelConfig();
      }
    } else {
      setStreak(0);
      setTimeLeft(t => Math.max(0, t - 3)); // Heavy penalty
      toast.error("SEQUENCE_BREACH");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* --- HUD --- */}
      <div className="w-full max-w-2xl bg-neutral-900/20 border border-white/5 p-6 rounded-[2.5rem] md:rounded-[3rem] backdrop-blur-2xl mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12"><Activity size={100}/></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Yield</p>
              <p className="text-2xl font-black tabular-nums tracking-tighter">{score}</p>
            </div>
          </div>

          <div className="flex flex-col items-center">
             <span className={cn("text-2xl font-black italic tabular-nums tracking-tighter", timeLeft < 5 ? "text-red-600 animate-pulse" : "text-white")}>
               {timeLeft.toFixed(1)}s
             </span>
             <div className="w-20 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                <motion.div animate={{ width: `${(timeLeft/15)*100}%` }} className={cn("h-full", timeLeft < 5 ? "bg-red-600" : "bg-emerald-500")} />
             </div>
          </div>

          <div className="text-right">
             <Badge className="bg-emerald-500/10 text-emerald-400 border-none mb-1 px-3 py-1 font-black text-[10px]">PHASE_{level}</Badge>
             <div className="flex items-center gap-1 text-orange-500 justify-end">
                <Flame size={14} className={streak > 3 ? "animate-bounce" : ""} />
                <span className="text-[10px] font-black uppercase tracking-tighter">Streak: {streak}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-emerald-500/5 rounded-[3.5rem] border border-emerald-500/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                  <BarChart size={100} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">SORT_<span className="text-emerald-500">FU</span></h1>
                <p className="text-neutral-600 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Advanced_Reflex_Sorting_Protocol</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                ENTER_DOJO <Play size={28} className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="flex justify-center">
                 <div className={cn(
                    "px-10 py-4 rounded-3xl border-2 flex items-center gap-4 transition-all duration-500",
                    sortOrder === 'asc' ? "bg-blue-500/5 border-blue-500/20 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)]" : "bg-purple-500/5 border-purple-500/20 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                 )}>
                    {sortOrder === 'asc' ? <ArrowUpNarrowWide size={28} /> : <ArrowDownWideNarrow size={28} />}
                    <span className="text-2xl font-black uppercase italic tracking-tighter">
                        {sortOrder === 'asc' ? "Ascending" : "Descending"}
                    </span>
                 </div>
              </div>

              <div className={cn("grid gap-3", array.length <= 4 ? "grid-cols-2" : "grid-cols-3")}>
                {array.map((val, i) => {
                  const isCorrected = sortedTargetArray.slice(0, targetIndex).includes(val);
                  return (
                    <motion.button
                      key={`${val}-${i}`}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => !isCorrected && handleTap(val)}
                      disabled={isCorrected}
                      className={cn(
                        "h-24 md:h-32 rounded-[2rem] text-4xl font-black transition-all border-b-8 relative overflow-hidden",
                        isCorrected 
                          ? "bg-neutral-900 border-neutral-950 text-neutral-800 opacity-20 cursor-default" 
                          : "bg-neutral-800 border-neutral-900 text-white hover:border-emerald-500 active:bg-emerald-500/10 active:text-emerald-500 active:border-emerald-500"
                      )}
                    >
                      {val}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-900/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                 <h2 className="text-6xl font-black text-red-600 uppercase italic tracking-tighter mb-10 relative z-10">CORE_FAILED</h2>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2">Final_Zen</p>
                     <p className="text-5xl font-black text-emerald-500 leading-none">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2">Mastery</p>
                     <p className="text-5xl font-black text-white leading-none">L{level}</p>
                   </div>
                 </div>

                 {gameState === 'SYNCING' ? (
                   <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                      <Loader2 size={16} className="animate-spin" /> Uploading_Telemetry...
                   </div>
                 ) : (
                   <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-2xl">
                    REBOOT_DOJO <RotateCcw className="ml-3" />
                   </Button>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Global HUD Meta --- */}
      <div className="mt-16 flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800">
        <span className="flex items-center gap-2"><Target size={14} /> Logic_Tracking</span>
        <span className="flex items-center gap-2"><Cpu size={14} /> pb_node: {highScore}</span>
        <span className="flex items-center gap-2 italic">v2026.VOID-ARCADE</span>
      </div>
    </div>
  );
}