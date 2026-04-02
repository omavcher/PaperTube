"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Calculator, Play, RotateCcw, 
  Heart, Loader2, Fingerprint, 
  ShieldCheck, Sigma, Binary
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import api from "@/config/api";

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
  tier: number;
}

export default function MathMatrixGame() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Device Logic
  const getDeviceMetadata = () => {
    if (typeof window === "undefined") return { isMobile: false, browser: "Unknown" };
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Trident")) browser = "Internet Explorer";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    const isMobile = /Mobi|Android|iPhone/i.test(ua) || window.innerWidth < 768;
    return { isMobile, browser };
  };

  // Identity
  const getIdentity = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : { id: "guest_node", name: "Guest", email: "anonymous@void.com" };
    } catch { return { id: "guest_node", name: "Guest", email: "anonymous@void.com" }; }
  };

  // Stats
  const pushStats = async (finalScore: number, finalLevel: number) => {
    setGameState('SYNCING');
    const user = getIdentity();
    
    const payload = {
      userId: user.id || user._id,
      name: user.name,
      email: user.email,
      game: "Math Matrix",
      stats: { score: finalScore, level: finalLevel, timestamp: new Date().toISOString() },
      device: getDeviceMetadata()
    };

    try {
      await api.post("/general/game-stats", payload);
      toast.success("Score saved!");
    } catch (error) {
      toast.error("Couldn't save score.");
    } finally {
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem("math_matrix_high", finalScore.toString());
      }
      setGameState('GAMEOVER');
    }
  };

  useEffect(() => {
    const savedHigh = localStorage.getItem("math_matrix_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  const generateOptions = (answer: number, tier: number) => {
    const opts = new Set<number>();
    opts.add(answer);
    while(opts.size < 4) {
      let offset = Math.floor(Math.random() * 20) - 10;
      if (offset === 0) offset = 2;
      let wrong = answer + offset;
      
      if (tier >= 2 && Math.random() > 0.5) {
         wrong = answer + (Math.floor(Math.random() * 4) - 2) * 10; 
         if (wrong === answer) wrong += 10;
      }
      
      if (wrong !== answer) {
        if (answer >= 0 && wrong < 0) wrong = Math.abs(wrong); 
        opts.add(wrong);
      }
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
  };

  const createQuestion = useCallback(() => {
    setIsAnswering(false);
    setSelectedOption(null);

    let tier = level < 10 ? 1 : level < 25 ? 2 : 3;
    let questionStr = "";
    let answer = 0;

    if (tier === 1) {
       const ops = ['+', '-'];
       const op = ops[Math.floor(Math.random() * ops.length)];
       let a = Math.floor(Math.random() * 20) + 1;
       let b = Math.floor(Math.random() * 20) + 1;
       if (op === '-' && a < b) { const temp = a; a = b; b = temp; }
       questionStr = `${a} ${op} ${b}`;
       answer = op === '+' ? a + b : a - b;
    } else if (tier === 2) {
       const ops = ['+', '-', '*'];
       const op = ops[Math.floor(Math.random() * ops.length)];
       if (op === '*') {
         let a = Math.floor(Math.random() * 12) + 2;
         let b = Math.floor(Math.random() * 12) + 2;
         questionStr = `${a} × ${b}`;
         answer = a * b;
       } else {
         let a = Math.floor(Math.random() * 100) + 10;
         let b = Math.floor(Math.random() * 100) + 10;
         if (op === '-' && a < b) { const temp = a; a = b; b = temp; }
         questionStr = `${a} ${op} ${b}`;
         answer = op === '+' ? a + b : a - b;
       }
    } else {
       const ops = ['*', '/', 'mix'];
       const op = ops[Math.floor(Math.random() * ops.length)];
       if (op === '*') {
         let a = Math.floor(Math.random() * 20) + 5;
         let b = Math.floor(Math.random() * 20) + 5;
         questionStr = `${a} × ${b}`;
         answer = a * b;
       } else if (op === '/') {
         let b = Math.floor(Math.random() * 12) + 2;
         let answerVal = Math.floor(Math.random() * 12) + 2;
         let a = b * answerVal;
         questionStr = `${a} ÷ ${b}`;
         answer = answerVal;
       } else {
         let a = Math.floor(Math.random() * 10) + 2;
         let b = Math.floor(Math.random() * 10) + 2;
         let c = Math.floor(Math.random() * 20) + 1;
         const subOp = Math.random() > 0.5 ? '+' : '-';
         questionStr = `${a} × ${b} ${subOp} ${c}`;
         answer = subOp === '+' ? (a * b) + c : (a * b) - c;
       }
    }

    setCurrentQuestion({
      question: questionStr,
      answer,
      options: generateOptions(answer, tier),
      tier
    });
  }, [level]);

  const handleAnswer = (selectedAns: number) => {
    if (isAnswering || !currentQuestion) return;
    setIsAnswering(true);
    setSelectedOption(selectedAns);

    if (selectedAns === currentQuestion.answer) {
      const points = 10 * currentQuestion.tier * level;
      setScore(s => s + points);
      toast.success(`Correct! +${points} pts`);
      setTimeout(() => {
        setLevel(l => l + 1);
        createQuestion();
      }, 1000);
    } else {
      if (lives > 1) {
        setLives(l => l - 1);
        toast.error(`Wrong! Answer is ${currentQuestion.answer}`);
        setTimeout(() => createQuestion(), 1200);
      } else {
        pushStats(score, level);
      }
    }
  };

  const startGame = () => {
    setScore(0);
    setLives(5);
    setLevel(1);
    setGameState('PLAYING');
    createQuestion();
  };

  return (
    <div className="min-h-[100dvh] pt-24 lg:pt-32 relative z-[20] bg-transparent text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-purple-500/30 overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* HUD */}
        <div className="flex justify-between items-center mb-8 bg-neutral-900/20 p-6 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-lg">
              <Calculator size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-600 tracking-widest leading-none mb-1">Score</p>
              <p className="text-2xl font-black tabular-nums">{score}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} size={18} className={cn("transition-all", i < lives ? "text-red-600 fill-red-600" : "text-neutral-950")} />
              ))}
            </div>
            <Badge className="bg-purple-600/10 text-purple-400 border-none font-black text-[8px] tracking-widest">Lives</Badge>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-black text-neutral-600 tracking-widest leading-none mb-1">Level</p>
            <p className="text-2xl font-black text-purple-500 tabular-nums">L{level}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-purple-600/5 rounded-2xl border border-purple-600/10 shadow-lg">
                  <Sigma size={100} className="text-purple-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">Math <span className="text-purple-500">Matrix</span></h1>
                <p className="text-neutral-600 text-[10px] md:text-xs font-black tracking-widest">Calculate the missing values at lightning speed!</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-purple-600 hover:bg-purple-500 text-white font-black text-3xl rounded-xl shadow-2xl active:scale-95 transition-all">
                START <Play size={28} className="ml-3 fill-white" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && currentQuestion && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700" />
                <Card className="bg-neutral-900/40 border-2 border-white/5 rounded-2xl p-10 md:p-16 flex flex-col items-center justify-center relative z-10 backdrop-blur-md min-h-[300px]">
                  <h3 className="text-neutral-400 font-medium tracking-widest uppercase text-sm mb-4">Solve the equation</h3>
                  <motion.h2 
                    key={currentQuestion.question}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl md:text-8xl font-black text-white text-center tracking-tight leading-tight flex items-center justify-center gap-4"
                  >
                    <span className="font-mono bg-white/5 px-6 py-2 rounded-2xl border border-white/10 shadow-inner">
                      {currentQuestion.question}
                    </span>
                  </motion.h2>
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-purple-500/10 text-purple-500 border-none font-black text-[9px] tracking-[0.2em]">Tier {currentQuestion.tier}</Badge>
                  </div>
                  <div className="absolute top-6 left-6">
                    <Binary className="text-white/10" size={32} />
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {currentQuestion.options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    disabled={isAnswering}
                    className={cn(
                      "h-20 md:h-24 rounded-[2rem] text-2xl md:text-3xl font-black font-mono tracking-tight transition-all transform active:scale-90 border-2",
                      !isAnswering ? "bg-neutral-900 border-white/5 hover:border-purple-500 hover:bg-purple-950/30 text-white" : 
                      opt === currentQuestion.answer ? "bg-emerald-600 border-emerald-400 text-white" : 
                      opt === selectedOption ? "bg-red-600 border-red-400 text-white animate-shake" : "bg-neutral-950 border-white/5 text-neutral-800"
                    )}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                 <h2 className="text-5xl md:text-7xl font-black text-red-500 tracking-tight mb-10 relative z-10 leading-none">Game Over!</h2>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                   <div className="bg-black/40 p-8 rounded-2xl border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 mb-2 tracking-widest">Final_Score</p>
                     <p className="text-5xl font-black text-purple-500 leading-none tabular-nums">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-2xl border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 mb-2 tracking-widest">Level Reached</p>
                     <p className="text-5xl font-black text-white leading-none tabular-nums">L{level}</p>
                   </div>
                 </div>

                 {gameState === 'SYNCING' ? (
                   <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-widest">
                      <Loader2 size={16} className="animate-spin" /> Transmitting_Logs...
                   </div>
                 ) : (
                   <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-2xl">
                    RESTART <RotateCcw size={24} className="ml-3" />
                   </Button>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 flex flex-wrap justify-center gap-12 text-[10px] font-black tracking-widest text-neutral-600 z-10">
        <span className="flex items-center gap-2"><Fingerprint size={14} /> ID: {getIdentity().id.substring(0,10)}...</span>
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> Best: {highScore}</span>
        <span className="flex items-center gap-2">v1.0</span>
      </div>
    </div>
  );
}
