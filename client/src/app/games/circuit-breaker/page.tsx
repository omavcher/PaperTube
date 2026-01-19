"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Zap, Lightbulb, Play, RotateCcw, 
  Trophy, Heart, Timer, Cpu, 
  Activity, ArrowRight, ShieldCheck,
  History, Calendar, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// --- Types & Constants ---
type GateType = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR' | 'NOT' | null;

interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

const ALL_GATES: GateType[] = ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', 'NOT'];

export default function CircuitBreakerGame() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
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

  // --- Persistence Logic ---
  useEffect(() => {
    const savedHistory = localStorage.getItem("circuit_breaker_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const saveMatch = useCallback((finalScore: number, finalLevel: number) => {
    const newRecord: MatchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString(),
      score: finalScore,
      level: finalLevel
    };
    const updatedHistory = [newRecord, ...history].slice(0, 5); // Keep last 5 matches
    setHistory(updatedHistory);
    localStorage.setItem("circuit_breaker_history", JSON.stringify(updatedHistory));
  }, [history]);

  // --- Level Generation ---
  const generateLevel = useCallback(() => {
    const a = Math.random() > 0.5 ? 1 : 0;
    const b = Math.random() > 0.5 ? 1 : 0;
    
    setInputA(a);
    setInputB(b);
    setSelectedGate(null);
    setIsLive(false);

    // Dynamic Gate Selection: Give 3 random gates each level to make it harder
    const shuffled = [...ALL_GATES].sort(() => 0.5 - Math.random());
    setAvailableGates(shuffled.slice(0, 3));
    
    setTimeLeft(Math.max(4, 15 - Math.floor(level / 2)));
  }, [level]);

  // --- Logic Engine (All 7 Gates) ---
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
      case 'NOT': result = !a; break; // In NOT gate, we only consider Input A
      default: result = false;
    }
    
    return result; // Goal: Result must be true (1) to light the bulb
  };

  const handleGateDrop = (gate: GateType) => {
    if (gameState !== 'PLAYING' || isLive) return;
    
    setSelectedGate(gate);
    const win = checkLogic(gate);
    
    if (win) {
      setIsLive(true);
      setScore(s => s + (50 * level));
      toast.success("Current Flowing!", { icon: "⚡" });
      setTimeout(() => {
        setLevel(l => l + 1);
        generateLevel();
      }, 1000);
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("Short Circuit!", { description: "The logic is invalid." });
      setSelectedGate(null);
    } else {
      setGameState('GAMEOVER');
      saveMatch(score, level);
    }
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING') {
      handleWrong();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState, handleWrong]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('PLAYING');
    generateLevel();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 select-none">
      
      <div className="max-w-2xl w-full">
        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-8 bg-neutral-900/50 p-4 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase">Energy Score</p>
              <p className="text-xl font-black">{score}</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={20} className={cn("transition-all", i < lives ? "text-red-500 fill-red-500" : "text-neutral-800")} />
            ))}
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Phase {level}</p>
            <Badge className="bg-emerald-500 text-black font-black">{timeLeft}s</Badge>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 py-12">
              <div className="space-y-4">
                <div className="inline-flex p-6 bg-emerald-500/10 rounded-[40px] mb-4">
                  <Cpu size={64} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic">Circuit <span className="text-emerald-500">Breaker</span></h1>
                <p className="text-neutral-400 max-w-xs mx-auto text-sm">Now with all 7 logic gates. Analyze the inputs and light the bulb.</p>
              </div>
              <Button onClick={startGame} className="w-full h-20 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-2xl rounded-3xl">
                START MISSION <Play className="ml-2 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              {/* Circuit Board */}
              <div className="relative h-64 bg-neutral-900/30 rounded-[50px] border-2 border-white/5 flex items-center justify-between px-12 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="space-y-12 z-10">
                  <div className="flex items-center gap-4">
                    <Badge className={cn("h-8 w-8 flex items-center justify-center rounded-lg text-lg font-black", inputA ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-neutral-800")}>{inputA}</Badge>
                    <div className={cn("h-1 w-20 transition-all duration-500", inputA ? "bg-emerald-500" : "bg-neutral-800")} />
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={cn("h-8 w-8 flex items-center justify-center rounded-lg text-lg font-black", inputB ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-neutral-800")}>{inputB}</Badge>
                    <div className={cn("h-1 w-20 transition-all duration-500", inputB ? "bg-emerald-500" : "bg-neutral-800")} />
                  </div>
                </div>

                <div className="relative z-10">
                  <div className={cn(
                    "h-24 w-24 rounded-3xl border-4 border-dashed flex items-center justify-center transition-all duration-500",
                    selectedGate ? "border-emerald-500 bg-emerald-500/5 scale-110" : "border-neutral-700"
                  )}>
                    {selectedGate ? (
                      <span className="text-xl font-black text-emerald-500">{selectedGate}</span>
                    ) : (
                      <Cpu size={32} className="text-neutral-700" />
                    )}
                  </div>
                </div>

                <div className="flex items-center z-10">
                  <div className={cn("h-1 w-20 transition-all duration-1000", isLive ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]" : "bg-neutral-800")} />
                  <div className={cn(
                    "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500 border-4",
                    isLive ? "bg-emerald-500 border-emerald-300 shadow-[0_0_60px_rgba(16,185,129,0.8)]" : "bg-neutral-900 border-neutral-800"
                  )}>
                    <Lightbulb size={40} className={isLive ? "text-black fill-black" : "text-neutral-700"} />
                  </div>
                </div>
              </div>

              {/* Gate Tray */}
              <div className="space-y-4">
                <p className="text-center text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]">Decipher Logic</p>
                <div className="flex justify-center gap-3">
                  {availableGates.map((gate) => (
                    <Button 
                      key={gate}
                      onClick={() => handleGateDrop(gate)}
                      className="h-16 w-24 bg-neutral-900 border border-white/5 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-xl text-sm font-black transition-all"
                    >
                      {gate}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="text-center bg-neutral-900/50 p-10 rounded-[50px] border border-red-500/20">
                <h2 className="text-5xl font-black text-red-500 uppercase italic">Power Failure</h2>
                <p className="text-neutral-500 font-bold tracking-widest text-xs mb-6">MATCH SUMMARY</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-neutral-500 uppercase">Energy</p>
                    <p className="text-3xl font-black text-emerald-500">{score}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-neutral-500 uppercase">Phase</p>
                    <p className="text-3xl font-black text-white">{level}</p>
                  </div>
                </div>
                <Button onClick={startGame} className="w-full h-16 bg-white text-black font-black text-lg rounded-2xl hover:bg-emerald-500">
                  RESTART MISSION
                </Button>
              </div>

              {/* --- Local Storage History --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2 text-neutral-500">
                  <History size={16} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Mission History</h3>
                </div>
                <div className="space-y-2">
                  {history.map((match) => (
                    <div key={match.id} className="bg-neutral-900/30 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase">{match.date}</span>
                        <span className="text-sm font-black text-emerald-400 tracking-tight">Phase {match.level} Reached</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-neutral-600 uppercase block mb-1">Final Score</span>
                        <span className="text-xl font-black">{match.score}</span>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-center py-4 text-xs text-neutral-600 font-bold uppercase italic">No history detected.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}