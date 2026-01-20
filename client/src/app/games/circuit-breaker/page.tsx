"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Zap, Lightbulb, Play, RotateCcw, 
  Trophy, Heart, Timer, Cpu, 
  Activity, ArrowRight, ShieldCheck,
  History, Calendar, BarChart3, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/config/api";

// --- Types & Constants ---
type GateType = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR' | 'NOT' | null;
type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

const ALL_GATES: GateType[] = ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', 'NOT'];

export default function CircuitBreakerGame() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [level, setLevel] = useState(1);
  const [history, setHistory] = useState<MatchRecord[]>([]);
  
  // Circuit State
  const [inputA, setInputA] = useState(1);
  const [inputB, setInputB] = useState(0);
  const [availableGates, setAvailableGates] = useState<GateType[]>([]);
  const [selectedGate, setSelectedGate] = useState<GateType>(null);
  const [isLive, setIsLive] = useState(false);
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
  // --- Identity & Telemetry Logic ---
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
      game: "Circuit Breaker",
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
    const savedHistory = localStorage.getItem("circuit_breaker_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const saveLocalMatch = useCallback((finalScore: number, finalLevel: number) => {
    const newRecord: MatchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: finalScore,
      level: finalLevel
    };
    const updatedHistory = [newRecord, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("circuit_breaker_history", JSON.stringify(updatedHistory));
  }, [history]);

  // --- Level Generation (Hardcore Calibration) ---
  const generateLevel = useCallback(() => {
    const a = Math.random() > 0.5 ? 1 : 0;
    const b = Math.random() > 0.5 ? 1 : 0;
    
    setInputA(a);
    setInputB(b);
    setSelectedGate(null);
    setIsLive(false);

    // Harder gate selection: Give fewer options as level increases
    const gateCount = level > 15 ? 2 : level > 8 ? 3 : 4;
    const shuffled = [...ALL_GATES].sort(() => 0.5 - Math.random());
    setAvailableGates(shuffled.slice(0, gateCount));
    
    // Time decay: Starts at 12s, drops to floor of 3.5s
    setTimeLeft(Math.max(3.5, 12 - (level * 0.4)));
  }, [level]);

  const checkLogic = (gate: GateType) => {
    if (!gate) return false;
    const a = !!inputA;
    const b = !!inputB;
    let result = false;

    switch (gate) {
      case 'AND': result = a && b; break;
      case 'OR': result = a || b; break;
      case 'XOR': result = a !== b; break;
      case 'NAND': result = !(a && b); break;
      case 'NOR': result = !(a || b); break;
      case 'XNOR': result = a === b; break;
      case 'NOT': result = !a; break; 
      default: result = false;
    }
    return result; 
  };

  const handleGateDrop = (gate: GateType) => {
    if (gameState !== 'PLAYING' || isLive) return;
    
    setSelectedGate(gate);
    const win = checkLogic(gate);
    
    if (win) {
      setIsLive(true);
      setScore(s => s + (100 * level) + Math.floor(timeLeft * 10));
      toast.success("CORE_ENERGIZED");
      setTimeout(() => {
        setLevel(l => l + 1);
        generateLevel();
      }, 800);
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("SHORT_CIRCUIT", { description: "Invalid logic path." });
      setSelectedGate(null);
    } else {
      saveLocalMatch(score, level);
      syncStats(score, level);
    }
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => Math.round((prev - 0.1) * 10) / 10), 100);
    } else if (timeLeft <= 0 && gameState === 'PLAYING') {
      handleWrong();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('PLAYING');
    generateLevel();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 selection:bg-emerald-500/30 overflow-hidden">
      
      <div className="max-w-2xl w-full">
        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-8 bg-neutral-900/20 p-6 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Yield</p>
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

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10 py-12">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                  <Cpu size={100} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">CIRCUIT_<span className="text-emerald-500">BREAKER</span></h1>
                <p className="text-neutral-600 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Multi-Gate_Logic_Simulation_v4.0</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                INIT_MISSION <Play size={28} className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              {/* Circuit Board */}
              <div className="relative h-64 md:h-80 bg-neutral-900/10 rounded-[4rem] md:rounded-[5rem] border-2 border-white/5 flex items-center justify-between px-8 md:px-20 overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:24px_24px]" />

                <div className="space-y-16 z-10">
                  <InputNode val={inputA} />
                  <InputNode val={inputB} />
                </div>

                <div className="relative z-10">
                  <div className={cn(
                    "h-24 w-24 md:h-32 md:w-32 rounded-[2rem] md:rounded-[3rem] border-4 border-dashed flex items-center justify-center transition-all duration-500",
                    selectedGate ? "border-emerald-500 bg-emerald-500/10 scale-110 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : "border-neutral-800"
                  )}>
                    {selectedGate ? (
                      <span className="text-2xl md:text-3xl font-black text-emerald-500 italic">{selectedGate}</span>
                    ) : (
                      <Cpu size={40} className="text-neutral-800 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="flex items-center z-10">
                  <div className={cn("h-1 w-12 md:w-20 transition-all duration-1000", isLive ? "bg-emerald-500 shadow-[0_0_30px_#10b981]" : "bg-neutral-900")} />
                  <div className={cn(
                    "h-20 w-20 md:h-28 md:w-28 rounded-full flex items-center justify-center transition-all duration-500 border-4",
                    isLive ? "bg-emerald-500 border-emerald-300 shadow-[0_0_80px_rgba(16,185,129,0.6)]" : "bg-black border-neutral-900"
                  )}>
                    <Lightbulb size={48} className={isLive ? "text-black fill-black" : "text-neutral-800"} />
                  </div>
                </div>
              </div>

              {/* Gate Tray */}
              <div className="space-y-4">
                <p className="text-center text-[9px] font-black text-neutral-700 uppercase tracking-[0.5em]">Inject_Logic_Module</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {availableGates.map((gate) => (
                    <Button 
                      key={gate}
                      onClick={() => handleGateDrop(gate)}
                      className="h-16 md:h-20 px-8 bg-neutral-900 border border-white/5 hover:border-emerald-500 hover:bg-emerald-500/10 rounded-2xl text-lg font-black italic transition-all active:scale-90"
                    >
                      {gate}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-900/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                <h2 className="text-6xl font-black text-red-600 uppercase italic tracking-tighter mb-12 relative z-10">GRID_COLLAPSE</h2>
                
                <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
                  <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                    <p className="text-[10px] font-black text-neutral-600 uppercase mb-2">Total_Energy</p>
                    <p className="text-5xl font-black text-emerald-500 leading-none">{score}</p>
                  </div>
                  <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                    <p className="text-[10px] font-black text-neutral-600 uppercase mb-2">Max_Phase</p>
                    <p className="text-5xl font-black text-white leading-none">L{level}</p>
                  </div>
                </div>

                {gameState === 'SYNCING' ? (
                   <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                      <Loader2 size={16} className="animate-spin" /> Transmitting_Data...
                   </div>
                ) : (
                  <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-2xl">
                    REBOOT_GRID <RotateCcw size={24} className="ml-3" />
                  </Button>
                )}
              </div>

              {/* Mission History */}
              <div className="space-y-4 px-4">
                <div className="flex items-center gap-2 text-neutral-700">
                  <History size={14} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Neural_Log_History</h3>
                </div>
                <div className="space-y-3">
                  {history.map((match) => (
                    <div key={match.id} className="bg-neutral-900/20 border border-white/5 p-5 rounded-[2rem] flex justify-between items-center group hover:border-emerald-500/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-neutral-700 font-bold uppercase">{match.date}</span>
                        <span className="text-sm font-black text-emerald-500 italic">Phase {match.level} Reached</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-800 uppercase block mb-1">Score</span>
                        <span className="text-2xl font-black text-white tracking-tighter">{match.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meta HUD */}
      <div className="mt-16 flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-900">
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> Neural_Verified</span>
        <span className="flex items-center gap-2 font-mono">NODE_OS: CIRCUIT_V4</span>
      </div>
    </div>
  );
}

function InputNode({ val }: { val: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn(
        "h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-xl text-xl font-black transition-all duration-500",
        val ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]" : "bg-neutral-900 text-neutral-700"
      )}>
        {val}
      </div>
      <div className={cn("h-1 w-12 md:w-24 transition-all duration-500", val ? "bg-emerald-500 shadow-[0_0_15px_#10b981]" : "bg-neutral-950")} />
    </div>
  );
}