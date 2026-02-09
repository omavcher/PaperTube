"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Trophy, Play, RotateCcw, Zap, Heart, Timer, 
  Binary as BinaryIcon, ShieldCheck, BrainCircuit, 
  Activity, Cpu, History, Calendar, BarChart3, 
  User as UserIcon, LogOut, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/config/api";

// --- Types ---
type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

interface Question {
  text: string;
  answer: number;
  options: number[];
  type: string;
}

interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

export default function BinaryBlitzGame() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [question, setQuestion] = useState<Question | null>(null);
  const [level, setLevel] = useState(1);
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
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
  // --- Identity Detection ---
  const getUser = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  };

  // --- Backend Statistics Sync ---
  const syncStatsToBackend = async (finalScore: number, finalLevel: number) => {
    setIsSyncing(true);
    const user = getUser();
    
    const payload = {
      userId: user?._id || "guest_node",
      name: user?.name || "Guest",
      email: user?.email || "anonymous@void.com",
      game: "Binary Blitz",
      stats: {
        score: finalScore,
        level: finalLevel,
        timestamp: new Date().toISOString()
      },
      device: getDeviceMetadata()
    };

    try {
      await api.post("/general/game-stats", payload);
      toast.success("TELEMETRY_SYNCED", { description: "Mission data stored in neural link." });
    } catch (error) {
      console.error("Sync Failure:", error);
      toast.error("SYNC_FAILURE", { description: "Data cached locally." });
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Progression Engine (Hardcore Calibration) ---
  const generateQuestion = useCallback(() => {
    let text = "";
    let answer = 0;
    let type = "";
    const options: number[] = [];

    // Increase difficulty based on level
    if (level <= 5) {
      type = "BASIC_CONV"; // 4-bit
      answer = Math.floor(Math.random() * 16);
      text = answer.toString(2).padStart(4, '0');
    } 
    else if (level <= 12) {
      type = "GATE_LOGIC";
      const a = Math.random() > 0.5 ? 1 : 0;
      const b = Math.random() > 0.5 ? 1 : 0;
      const gates = ['AND', 'OR', 'XOR', 'NAND'];
      const gate = gates[Math.floor(Math.random() * gates.length)];
      text = `${a} ${gate} ${b}`;
      if(gate === 'AND') answer = a & b;
      else if(gate === 'OR') answer = a | b;
      else if(gate === 'XOR') answer = a ^ b;
      else answer = (a & b) === 1 ? 0 : 1;
    }
    else if (level <= 25) {
      type = "HEX_READY"; // 8-bit fragments
      answer = Math.floor(Math.random() * 240) + 15;
      text = answer.toString(2).padStart(8, '0');
    }
    else {
      type = "NESTED_CIRCUIT"; // Complex Boolean
      const a = Math.random() > 0.5 ? 1 : 0;
      const b = Math.random() > 0.5 ? 1 : 0;
      const c = Math.random() > 0.5 ? 1 : 0;
      const gate1 = Math.random() > 0.5 ? 'AND' : 'OR';
      const gate2 = Math.random() > 0.5 ? 'XOR' : 'NAND';
      const mid = gate1 === 'AND' ? (a & b) : (a | b);
      answer = gate2 === 'XOR' ? (mid ^ c) : ((mid & c) === 1 ? 0 : 1);
      text = `(${a} ${gate1} ${b}) ${gate2} ${c}`;
    }

    options.push(answer);
    while (options.length < 4) {
      const rand = Math.floor(Math.random() * (answer + 10)) + Math.max(0, answer - 5);
      if (!options.includes(rand)) options.push(rand);
    }
    
    setQuestion({ 
      text, 
      answer, 
      options: options.sort(() => Math.random() - 0.5), 
      type 
    });

    // Harder Timer: Starts at 8s, drops to 2s by level 40
    setTimeLeft(Math.max(2.0, 8 - (level * 0.15)));
  }, [level]);

  // --- Game Loop Hooks ---
  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => Math.round((prev - 0.1) * 10) / 10), 100);
    } else if (timeLeft <= 0 && gameState === 'PLAYING') {
      handleWrong();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleAnswer = (val: number) => {
    if (val === question?.answer) {
      setScore(s => s + (timeLeft > 3 ? 50 : 25));
      setLevel(l => l + 1);
      generateQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      generateQuestion();
      toast.error("VOLTAGE_DROP", { description: "Integrity compromised." });
    } else {
      setGameState('GAMEOVER');
      syncStatsToBackend(score, level);
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      
      {/* --- HUD: Laptop/Mobile Responsive --- */}
      <div className="w-full max-w-2xl bg-neutral-900/30 border border-white/5 p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] backdrop-blur-xl mb-6 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Yield</p>
              <p className="text-xl md:text-2xl font-black tabular-nums">{score}</p>
            </div>
          </div>

          {/* User ID Tag */}
          <div className="hidden sm:flex flex-col items-center opacity-40 group">
             <UserIcon size={14} className="text-neutral-500 mb-1" />
             <span className="text-[7px] font-black uppercase tracking-widest">{getUser()?.name || "GUEST_NODE"}</span>
          </div>

          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={18} className={cn("transition-all", i < lives ? "text-red-600 fill-red-600" : "text-neutral-900")} />
            ))}
          </div>
        </div>

        {/* Level Path Tracker */}
        <div className="mt-6 flex items-center justify-between text-[8px] font-black uppercase text-neutral-600 tracking-widest">
           <span>Sub-Level: {level}</span>
           <div className="flex gap-1">
             {[...Array(5)].map((_, i) => (
               <div key={i} className={cn("h-1 w-4 rounded-full", level % 5 > i || level % 5 === 0 ? "bg-emerald-500" : "bg-neutral-800")} />
             ))}
           </div>
        </div>
      </div>

      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          
          {/* --- VIEW: START --- */}
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex p-8 bg-emerald-500/5 rounded-[3rem] border border-emerald-500/10 mb-4 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                  <BrainCircuit size={100} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                  VOID_<span className="text-emerald-500">BLITZ</span>
                </h1>
                <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] max-w-xs mx-auto">
                  NEURAL_ENGINE_STABLE // PHASE_01_READY
                </p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-3xl rounded-[2.5rem] shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all">
                INIT_SYNC <Play size={28} className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {/* --- VIEW: PLAYING --- */}
          {gameState === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase text-neutral-500 px-2 tracking-[0.4em]">
                   <span>Processing_Load</span>
                   <span>{timeLeft.toFixed(1)}s</span>
                </div>
                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 8) * 100}%` }}
                    className={cn("h-full transition-colors", timeLeft < 2.5 ? "bg-red-600" : "bg-emerald-500")}
                  />
                </div>
              </div>

              {/* Central Display */}
              <div className="bg-neutral-900/40 border-2 border-emerald-500/20 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden backdrop-blur-xl">
                <Badge className="bg-emerald-500/10 text-emerald-500 mb-6 uppercase text-[9px] font-black border border-emerald-500/20 tracking-[0.4em]">
                  {question?.type || "ANALYZING..."}
                </Badge>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white font-mono break-all leading-none">
                  {question?.text}
                </h2>
              </div>

              {/* Control Matrix (2x2 on Mobile, Good spacing on Laptop) */}
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                {question?.options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    className="h-24 md:h-32 bg-neutral-900 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-4xl md:text-6xl font-black rounded-[2rem] md:rounded-[2.5rem] transition-all transform active:scale-90"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- VIEW: GAMEOVER --- */}
          {gameState === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center bg-neutral-900 border border-red-900/20 p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-3xl">
                <h2 className="text-5xl font-black text-red-600 uppercase italic tracking-tighter mb-10">CORE_FAILED</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                    <p className="text-[8px] font-black text-neutral-600 uppercase mb-1">Final_Yield</p>
                    <p className="text-4xl font-black text-emerald-500 leading-none">{score}</p>
                  </div>
                  <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                    <p className="text-[8px] font-black text-neutral-600 uppercase mb-1">Max_Depth</p>
                    <p className="text-4xl font-black text-white leading-none">L{level}</p>
                  </div>
                </div>

                {isSyncing ? (
                  <div className="w-full h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-600">
                    <Loader2 size={16} className="animate-spin" /> SYNCHRONIZING_TELEMENTRY...
                  </div>
                ) : (
                  <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-xl rounded-2xl hover:bg-emerald-500 transition-all shadow-xl active:scale-95">
                    REBOOT_SYSTEM <RotateCcw size={20} className="ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer Meta HUD */}
      <div className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[9px] font-black uppercase tracking-[0.4em] text-neutral-800">
        <span className="flex items-center gap-2 text-emerald-900"><ShieldCheck size={12} /> Encrypted_Handshake</span>
        <span className="flex items-center gap-2"><Cpu size={12} /> Personal_Best: {highScore}</span>
        <span className="flex items-center gap-2 italic">v2026.VOID-CORE</span>
      </div>
    </div>
  );
}