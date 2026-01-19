"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Globe, Trophy, Play, RotateCcw, 
  Zap, Heart, ShieldCheck, Activity, 
  MapPin, Flag, CheckCircle, XCircle,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { COUNTRY_POOL, CountryData } from "@/data/countries"; // Import the data file

interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

export default function FlagMastery() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [currentCountry, setCurrentCountry] = useState<CountryData | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastSeenCodes, setLastSeenCodes] = useState<string[]>([]);
  const [history, setHistory] = useState<MatchRecord[]>([]);

  // --- Persistence ---
  useEffect(() => {
    const savedHistory = localStorage.getItem("flag_mastery_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedHigh = localStorage.getItem("flag_mastery_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  const saveMatch = useCallback((finalScore: number, finalLevel: number) => {
    const newRecord: MatchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: finalScore,
      level: finalLevel
    };
    const updated = [newRecord, ...history].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("flag_mastery_history", JSON.stringify(updated));
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("flag_mastery_high", finalScore.toString());
    }
  }, [history, highScore]);

  // --- Core Logic Engine ---
  const generateQuestion = useCallback(() => {
    setIsAnswering(false);
    setSelectedOption(null);

    // 1. Determine Difficulty Tier based on level progression
    let targetTier = 1;
    if (level > 20) targetTier = 2;
    if (level > 40) targetTier = 3;

    // 2. Filter pool based on tier
    // We include lower tiers to keep the pool large and varied
    const allowedPool = COUNTRY_POOL.filter(c => c.tier <= targetTier);

    // 3. Select Correct Country (Non-Repeat Logic)
    let correct: CountryData;
    let attempts = 0;
    do {
        const idx = Math.floor(Math.random() * allowedPool.length);
        correct = allowedPool[idx];
        attempts++;
    } while (lastSeenCodes.includes(correct.code) && attempts < 50);

    // Update last seen list (keep last 15)
    setLastSeenCodes(prev => [correct.code, ...prev].slice(0, 15));
    setCurrentCountry(correct);

    // 4. Generate Distractors
    const opts = new Set<string>();
    opts.add(correct.name);
    while (opts.size < 4) {
        // Distractors come from the same difficulty pool so they are plausible
        const randomDistractor = allowedPool[Math.floor(Math.random() * allowedPool.length)].name;
        opts.add(randomDistractor);
    }

    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  }, [level, lastSeenCodes]);

  const handleAnswer = (selectedName: string) => {
    if (isAnswering || !currentCountry) return;
    setIsAnswering(true);
    setSelectedOption(selectedName);

    if (selectedName === currentCountry.name) {
      // CORRECT
      const points = 10 + (currentCountry.tier * 5); // More points for harder flags
      setScore(s => s + points);
      toast.success("Correct Identification", { icon: <CheckCircle className="text-emerald-500" /> });
      setTimeout(() => {
        setLevel(l => l + 1);
        generateQuestion();
      }, 1200);
    } else {
      // WRONG
      if (lives > 1) {
        setLives(l => l - 1);
        toast.error(`Incorrect. That was ${currentCountry.name}.`, { icon: <XCircle className="text-red-500" /> });
        setTimeout(() => {
            generateQuestion();
        }, 1500);
      } else {
        setLives(0);
        toast.error("Critical Failure. Morale Depleted.");
        setTimeout(() => {
            setGameState('GAMEOVER');
            saveMatch(score, level);
        }, 1000);
      }
    }
  };

  const startGame = () => {
    setScore(0);
    setLives(5); // Start with 5 lives
    setLevel(1);
    setLastSeenCodes([]);
    setGameState('PLAYING');
    generateQuestion();
  };

  // Helper for button styles based on answer state
  const getButtonStyle = (opt: string) => {
    if (!isAnswering || selectedOption !== opt) {
        // Default style if not answering or not the selected button
        return "bg-neutral-900 border-white/10 hover:border-blue-500 hover:bg-blue-500/10 text-white";
    }
    // If this is the button the user clicked:
    if (opt === currentCountry?.name) {
        return "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
    } else {
        return "bg-red-500/20 border-red-500 text-red-500 animate-shake";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden bg-black">
      
      <div className="max-w-2xl w-full relative">
        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-8 bg-neutral-900/60 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
               <MapPin size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Diplomatic Score</p>
               <p className="text-2xl font-black tabular-nums">{score}</p>
             </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                <Heart key={i} size={18} className={cn("transition-all duration-300", i < lives ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "text-neutral-800 fill-neutral-800/50")} />
                ))}
            </div>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] px-3 uppercase tracking-widest">
                 Morale
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Global Phase</p>
            <p className="text-2xl font-black text-blue-400 tabular-nums">LVL {level}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10 py-12">
              <div className="relative inline-block">
                 <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full" />
                 <div className="relative inline-flex p-8 bg-blue-500/10 rounded-[3rem] border border-blue-500/20 shadow-[0_0_60px_rgba(59,130,246,0.2)] mb-4">
                  <Globe size={80} className="text-blue-500" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white">Flag <span className="text-blue-500">Mastery</span></h1>
                <p className="text-neutral-400 max-w-md mx-auto text-lg font-medium leading-relaxed">Identify nations by their sovereign flags. Difficulty escalates from common to obscure territories across 50+ levels.</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all transform hover:scale-[1.02] border-t border-blue-400">
                INITIATE PROTOCOL <Play className="ml-3 fill-white" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && currentCountry && (
            <motion.div key="playing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              
              {/* Flag Display Card */}
              <Card className="bg-neutral-900/80 border-2 border-white/5 rounded-[3rem] p-8 text-center relative z-10 shadow-2xl overflow-hidden flex items-center justify-center min-h-[280px]">
                 <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                 
                 {/* Using flagcdn.com for high-quality SVGs/PNGs */}
                 <motion.img 
                   key={currentCountry.code} // Key change triggers animation
                   initial={{ opacity: 0, y: 10, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   transition={{ type: "spring", stiffness: 200, damping: 20 }}
                   src={`https://flagcdn.com/w640/${currentCountry.code}.png`}
                   alt="Flag to identify"
                   className="w-auto h-auto max-h-[220px] max-w-full object-contain rounded-xl shadow-lg border border-white/10"
                   // Fallback for weird aspect ratios or loading issues
                   onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; toast.error("Flag data corrupted."); }}
                 />
                 
                 {/* Tier Badge Indicator */}
                 <div className="absolute top-6 right-6">
                    <Badge className={cn("font-black uppercase tracking-widest border-none px-3 py-1", 
                        currentCountry.tier === 1 ? "bg-emerald-500/20 text-emerald-400" :
                        currentCountry.tier === 2 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                    )}>
                        Tier {currentCountry.tier} Clearance
                    </Badge>
                 </div>
              </Card>

              {/* Answer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    disabled={isAnswering}
                    className={cn(
                        "h-20 text-xl font-bold rounded-3xl transition-all transform active:scale-95 shadow-lg border-2",
                        getButtonStyle(opt)
                    )}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                 <Flag size={80} className="text-red-500 mx-auto mb-6 opacity-80" />
                 <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">Mission <span className="text-red-500">Failed</span></h2>
                 <p className="text-neutral-500 font-bold tracking-[0.3em] text-xs mb-10 uppercase">Diplomatic Relations Severed</p>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                   <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 text-center">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-widest">Final Score</p>
                     <p className="text-5xl font-black text-blue-500">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 text-center">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-widest">Max Phase</p>
                     <p className="text-5xl font-black text-white">{level}</p>
                   </div>
                 </div>

                 <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-xl rounded-3xl hover:bg-blue-500 hover:text-white transition-all shadow-xl relative z-10">
                   RE-ESTABLISH LINK <RotateCcw className="ml-3" />
                 </Button>
              </div>

              {/* --- Mission History Log --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-6 text-neutral-500">
                  <History size={16} />
                  <h3 className="text-xs font-black uppercase tracking-[0.5em]">Diplomatic Logs (Last 5)</h3>
                </div>
                <div className="space-y-3">
                  {history.map((match) => (
                    <div key={match.id} className="bg-neutral-900/40 border border-white/5 p-6 rounded-[2.5rem] flex justify-between items-center group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-black rounded-2xl text-neutral-500 group-hover:text-blue-500 transition-colors border border-white/5">
                          <Globe size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-600 font-bold uppercase">{match.date}</span>
                          <span className="text-lg font-black text-blue-400">Phase {match.level} Reached</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-600 uppercase block mb-1">Score</span>
                        <span className="text-3xl font-black tabular-nums tracking-tighter">{match.score}</span>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-center text-xs text-neutral-700 italic py-8">No diplomatic records found.</p>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 flex gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800">
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> Secure Atlas</span>
        <span className="flex items-center gap-2"><Activity size={14} /> Data Source: ISO 3166</span>
        <span className="flex items-center gap-2 font-mono italic">PB: {highScore}</span>
      </div>
      
      {/* CSS for the shake animation on wrong answer */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 3;
        }
      `}</style>
    </div>
  );
}