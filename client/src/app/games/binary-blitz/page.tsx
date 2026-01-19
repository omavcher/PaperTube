"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Trophy, Play, RotateCcw, Zap, 
  Heart, Timer, ChevronRight, Binary as BinaryIcon,
  ShieldCheck, BrainCircuit, Activity, Cpu,
  History, Calendar, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// --- Types & Records ---
type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

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

  // --- Persistence Logic ---
  useEffect(() => {
    const savedHistory = localStorage.getItem("binary_blitz_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    // Set High Score from history
    const savedHighScore = localStorage.getItem("binary_blitz_highscore");
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
  }, []);

  const saveMatch = useCallback((finalScore: number, finalLevel: number) => {
    const newRecord: MatchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: finalScore,
      level: finalLevel
    };

    // Update History (last 5)
    const updatedHistory = [newRecord, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("binary_blitz_history", JSON.stringify(updatedHistory));

    // Update High Score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("binary_blitz_highscore", finalScore.toString());
      toast.success("NEW HIGH SCORE!", { icon: "🏆" });
    }
  }, [history, highScore]);

  // --- Progression Engine Logic ---
  const generateQuestion = useCallback(() => {
    let text = "";
    let answer = 0;
    let type = "";
    const options: number[] = [];

    if (level <= 10) {
      type = "BINARY CONVERSION";
      const bits = level <= 3 ? 2 : level <= 7 ? 3 : 4;
      answer = Math.floor(Math.random() * Math.pow(2, bits));
      text = answer.toString(2).padStart(bits, '0');
    } 
    else if (level <= 20) {
      type = "LOGIC GATE";
      const a = Math.random() > 0.5 ? 1 : 0;
      const b = Math.random() > 0.5 ? 1 : 0;
      const gates = level <= 15 ? ['AND', 'OR'] : ['AND', 'OR', 'XOR'];
      const gate = gates[Math.floor(Math.random() * gates.length)];
      text = `${a} ${gate} ${b}`;
      answer = gate === 'AND' ? (a & b) : gate === 'OR' ? (a | b) : (a ^ b);
    }
    else if (level <= 35) {
      const subType = Math.random() > 0.5;
      if (subType) {
        type = "8-BIT FRAGMENT";
        answer = Math.floor(Math.random() * 64) + 64;
        text = answer.toString(2);
      } else {
        type = "NOT LOGIC";
        const a = Math.random() > 0.5 ? 1 : 0;
        text = `NOT (${a})`;
        answer = a === 1 ? 0 : 1;
      }
    }
    else {
      type = "NESTED CIRCUIT";
      const a = Math.random() > 0.5 ? 1 : 0;
      const b = Math.random() > 0.5 ? 1 : 0;
      const c = Math.random() > 0.5 ? 1 : 0;
      const gate1 = Math.random() > 0.5 ? 'AND' : 'OR';
      const gate2 = Math.random() > 0.5 ? 'XOR' : 'AND';
      const mid = gate1 === 'AND' ? (a & b) : (a | b);
      answer = gate2 === 'XOR' ? (mid ^ c) : (mid & c);
      text = `(${a} ${gate1} ${b}) ${gate2} ${c}`;
    }

    options.push(answer);
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const rand = Math.max(0, answer + offset + (Math.random() > 0.5 ? 1 : -1));
      if (!options.includes(rand)) options.push(rand);
    }
    
    setQuestion({ 
      text, 
      answer, 
      options: options.sort(() => Math.random() - 0.5), 
      type 
    });

    setTimeLeft(Math.max(2.5, 10 - (level * 0.15)));
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

  const handleAnswer = (val: number) => {
    if (val === question?.answer) {
      setScore(s => s + (timeLeft > 5 ? 20 : 10));
      setLevel(l => l + 1);
      toast.success(`Level ${level} Decoded!`, { duration: 500 });
      generateQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("System Glitch!", { description: "Incorrect Output" });
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
    setGameState('PLAYING');
    generateQuestion();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30">
      <div className="max-w-xl w-full">
        
        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-8 bg-neutral-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Yield</p>
              <p className="text-2xl font-black tabular-nums">{score}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={22} className={cn("transition-all duration-300", i < lives ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-neutral-800")} />
            ))}
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Depth</p>
            <p className="text-2xl font-black text-emerald-500 tabular-nums">Lvl {level}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex p-6 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 mb-4 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                  <BrainCircuit size={80} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic">Binary <span className="text-emerald-500">Blitz</span></h1>
                <p className="text-neutral-400 max-w-sm mx-auto">Neural-link active. Decrypt the system to reach Phase 50.</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-3xl rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                BOOT ENGINE <Play className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-500 px-2 tracking-widest">
                   <span>Processing Time</span>
                   <span>{timeLeft.toFixed(1)}s</span>
                </div>
                <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 10) * 100}%` }}
                    className={cn("h-full transition-colors duration-200", timeLeft < 3 ? "bg-red-500 shadow-[0_0_15px_red]" : "bg-emerald-500 shadow-[0_0_15px_#10b981]")}
                  />
                </div>
              </div>

              <div className="bg-neutral-900/80 border-2 border-emerald-500/20 rounded-[3rem] p-16 text-center relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Activity size={160} />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 mb-8 uppercase tracking-[0.3em] px-4 py-1 text-xs border border-emerald-500/20">{question?.type}</Badge>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-2 font-mono">
                  {question?.text}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {question?.options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    className="h-28 bg-neutral-900 border border-white/5 hover:border-emerald-500 hover:bg-emerald-500/5 text-4xl font-black rounded-[2rem] transition-all transform active:scale-95 shadow-xl"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-500/20 shadow-2xl backdrop-blur-lg">
                <h2 className="text-6xl font-black text-red-500 uppercase italic tracking-tighter mb-2">Core Failed</h2>
                <p className="text-neutral-500 uppercase font-black tracking-[0.5em] text-xs mb-8">Match Statistics</p>
                
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 text-center">
                    <p className="text-[10px] font-black text-neutral-500 uppercase mb-2">Final Yield</p>
                    <p className="text-5xl font-black text-emerald-500">{score}</p>
                  </div>
                  <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 text-center">
                    <p className="text-[10px] font-black text-neutral-500 uppercase mb-2">Max Depth</p>
                    <p className="text-5xl font-black text-white">{level}</p>
                  </div>
                </div>

                <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-emerald-500 transition-all shadow-xl">
                  REBOOT ENGINE <RotateCcw className="ml-3" />
                </Button>
              </div>

              {/* --- Local Storage History --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2 text-neutral-500">
                  <History size={16} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Mission Log (Last 5)</h3>
                </div>
                <div className="space-y-2">
                  {history.map((match) => (
                    <div key={match.id} className="bg-neutral-900/30 border border-white/5 p-5 rounded-[2rem] flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-black rounded-xl border border-white/5 text-neutral-500 group-hover:text-emerald-500 transition-colors">
                          <Calendar size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-600 font-bold uppercase">{match.date}</span>
                          <span className="text-sm font-black text-emerald-400">Phase {match.level} Infiltrated</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-600 uppercase block mb-1">Yield</span>
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
      
      {/* HUD Icons */}
      <div className="mt-16 flex gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-800">
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> Encrypted Logic</span>
        <span className="flex items-center gap-2"><BarChart3 size={14} /> Personal Best: {highScore}</span>
        <span className="flex items-center gap-2 font-mono italic">v2026.1-CORE</span>
      </div>
    </div>
  );
}