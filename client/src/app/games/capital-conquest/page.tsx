"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Building2, Play, RotateCcw, 
  Heart, MapPin, 
  Loader2, Fingerprint, ShieldCheck, Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import api from "@/config/api";
import { CAPITAL_POOL, CapitalData } from "@/data/capitals";

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

export default function CapitalConquestGame() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<CapitalData | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastSeenCountries, setLastSeenCountries] = useState<string[]>([]);

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
      game: "Capital Conquest",
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
        localStorage.setItem("capital_conquest_high", finalScore.toString());
      }
      setGameState('GAMEOVER');
    }
  };

  useEffect(() => {
    const savedHigh = localStorage.getItem("capital_conquest_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  const generateQuestion = useCallback(() => {
    setIsAnswering(false);
    setSelectedOption(null);

    // Scaling level difficulty
    let targetTier = level < 10 ? 1 : level < 25 ? 2 : 3;
    const allowedPool = CAPITAL_POOL.filter(c => c.tier <= targetTier);

    let correct: CapitalData;
    let attempts = 0;
    do {
        const idx = Math.floor(Math.random() * allowedPool.length);
        correct = allowedPool[idx];
        attempts++;
    } while (lastSeenCountries.includes(correct.country) && attempts < 50);

    setLastSeenCountries(prev => [correct.country, ...prev].slice(0, 15));
    setCurrentQuestion(correct);

    const opts = new Set<string>();
    opts.add(correct.capital);
    while (opts.size < 4) {
        opts.add(allowedPool[Math.floor(Math.random() * allowedPool.length)].capital);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  }, [level, lastSeenCountries]);

  const handleAnswer = (selectedCapital: string) => {
    if (isAnswering || !currentQuestion) return;
    setIsAnswering(true);
    setSelectedOption(selectedCapital);

    if (selectedCapital === currentQuestion.capital) {
      const points = 10 * currentQuestion.tier * level;
      setScore(s => s + points);
      toast.success(`Correct! +${points} pts`);
      setTimeout(() => {
        setLevel(l => l + 1);
        generateQuestion();
      }, 1000);
    } else {
      if (lives > 1) {
        setLives(l => l - 1);
        toast.error(`Wrong! Capital is ${currentQuestion.capital}`);
        setTimeout(() => generateQuestion(), 1200);
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
    generateQuestion();
  };

  return (
    <div className="min-h-[100dvh] pt-24 lg:pt-32 relative z-[20] bg-transparent text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* HUD */}
        <div className="flex justify-between items-center mb-8 bg-neutral-900/20 p-6 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg">
              <MapPin size={24} />
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
            <Badge className="bg-emerald-600/10 text-emerald-400 border-none font-black text-[8px] tracking-widest">Lives</Badge>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-black text-neutral-600 tracking-widest leading-none mb-1">Level</p>
            <p className="text-2xl font-black text-emerald-500 tabular-nums">L{level}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-emerald-600/5 rounded-2xl border border-emerald-600/10 shadow-lg">
                  <Map size={100} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">Capital <span className="text-emerald-500">Conquest</span></h1>
                <p className="text-neutral-600 text-[10px] md:text-xs font-black tracking-widest">Identify the capital cities from around the world!</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-3xl rounded-xl shadow-2xl active:scale-95 transition-all">
                START <Play size={28} className="ml-3 fill-white" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && currentQuestion && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
                <Card className="bg-neutral-900/40 border-2 border-white/5 rounded-2xl p-10 md:p-16 flex flex-col items-center justify-center relative z-10 backdrop-blur-md min-h-[300px]">
                  <h3 className="text-neutral-400 font-medium tracking-widest uppercase text-sm mb-4">What is the capital of</h3>
                  <motion.h2 
                    key={currentQuestion.country}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl md:text-6xl font-black text-white text-center tracking-tight leading-tight"
                  >
                    {currentQuestion.country}
                  </motion.h2>
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] tracking-[0.2em]">Tier {currentQuestion.tier}</Badge>
                  </div>
                  <div className="absolute top-6 left-6">
                    <Building2 className="text-white/10" size={32} />
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    disabled={isAnswering}
                    className={cn(
                      "h-20 md:h-24 rounded-[2rem] text-lg md:text-xl font-black tracking-tight transition-all transform active:scale-90 border-2",
                      !isAnswering ? "bg-neutral-900 border-white/5 hover:border-emerald-500 text-white" : 
                      opt === currentQuestion.capital ? "bg-emerald-600 border-emerald-400 text-white" : 
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
                     <p className="text-5xl font-black text-emerald-500 leading-none tabular-nums">{score}</p>
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
                   <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-2xl">
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
