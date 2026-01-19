"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Keyboard, Trophy, Play, RotateCcw, 
  Zap, Heart, ShieldCheck, Activity, 
  History, Calendar, Terminal, Lock,
  Unlock, Cpu, Binary, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// --- Technical Vocabulary Pool (50+ Levels) ---
interface WordData {
  word: string;
  hint: string;
  tier: number;
}

const WORD_POOL: WordData[] = [
  // Tier 1: Level 1-15 (Web & Basics)
  { word: "REACT", hint: "Component based library.", tier: 1 },
  { word: "HTML", hint: "Web markup language.", tier: 1 },
  { word: "DOCKER", hint: "Containerization platform tool.", tier: 1 },
  { word: "PYTHON", hint: "Snake named language.", tier: 1 },
  { word: "GITHUB", hint: "Git hosting service.", tier: 1 },
  { word: "KERNEL", hint: "Core OS component.", tier: 1 },
  { word: "BINARY", hint: "Base two system.", tier: 1 },
  { word: "ARRAY", hint: "Linear data structure.", tier: 1 },
  { word: "NODEJS", hint: "Javascript server runtime.", tier: 1 },
  { word: "QUERY", hint: "Database request command.", tier: 1 },
  // Tier 2: Level 16-35 (CS Core & Engineering)
  { word: "POINTER", hint: "Memory address variable.", tier: 2 },
  { word: "RECURSION", hint: "Function calling itself.", tier: 2 },
  { word: "COMPILER", hint: "Source to machine.", tier: 2 },
  { word: "FIREWALL", hint: "Network security barrier.", tier: 2 },
  { word: "FRONTEND", hint: "Client side interface.", tier: 2 },
  { word: "BACKEND", hint: "Server side logic.", tier: 2 },
  { word: "ROUTER", hint: "Directs network traffic.", tier: 2 },
  { word: "INTEGER", hint: "Whole number type.", tier: 2 },
  { word: "BOOLEAN", hint: "True or false.", tier: 2 },
  // Tier 3: Level 36-50+ (Advanced/Expert)
  { word: "ALGORITHM", hint: "Step by step.", tier: 3 },
  { word: "HEURISTIC", hint: "Experience based solving.", tier: 3 },
  { word: "KUBERNETES", hint: "Container orchestration engine.", tier: 3 },
  { word: "IMMUTABLE", hint: "State cannot change.", tier: 3 },
  { word: "POLYMORPH", hint: "Multiple forms logic.", tier: 3 },
  { word: "INTERFACE", hint: "Abstract class contract.", tier: 3 },
  { word: "THREADING", hint: "Concurrent execution flow.", tier: 3 },
  { word: "ASYNC", hint: "Non blocking operation.", tier: 3 },
  { word: "NORMALIZED", hint: "Reduce data redundancy.", tier: 3 }
];

interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

export default function KeywordCrypt() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [displayWord, setDisplayWord] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [lastIndices, setLastIndices] = useState<number[]>([]);
  const [history, setHistory] = useState<MatchRecord[]>([]);

  // --- Persistence ---
  useEffect(() => {
    const savedHistory = localStorage.getItem("keyword_crypt_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedHigh = localStorage.getItem("keyword_crypt_high");
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
    localStorage.setItem("keyword_crypt_history", JSON.stringify(updated));
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("keyword_crypt_high", finalScore.toString());
    }
  }, [history, highScore]);

  // --- Core Engine ---
  const generateQuestion = useCallback(() => {
    // 1. Determine Tier
    let targetTier = 1;
    if (level > 10) targetTier = 2;
    if (level > 25) targetTier = 3;

    const pool = WORD_POOL.filter(w => w.tier <= targetTier);

    // 2. Non-repeat logic
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * pool.length);
    } while (lastIndices.includes(nextIdx));
    
    setLastIndices(prev => [nextIdx, ...prev].slice(0, 3));
    const target = pool[nextIdx];
    setCurrentWord(target);

    // 3. Create display word with missing letters
    // Difficulty: Lvl 1: 1 missing, Lvl 20: 3 missing, Lvl 40: 50% missing
    const chars = target.word.split("");
    const missingCount = Math.min(chars.length - 1, Math.ceil(level / 10) + 1);
    const indicesToHide = new Set<number>();
    
    while(indicesToHide.size < missingCount) {
      indicesToHide.add(Math.floor(Math.random() * chars.length));
    }

    const masked = chars.map((c, i) => indicesToHide.has(i) ? "_" : c);
    setDisplayWord(masked);

    // 4. Generate options (the missing letters + random distractors)
    const missingLetters = Array.from(indicesToHide).map(i => chars[i]);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const opts = new Set<string>(missingLetters);
    while (opts.size < 6) {
      opts.add(alphabet[Math.floor(Math.random() * 26)]);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));

  }, [level, lastIndices]);

  const handleLetterSelect = (letter: string) => {
    if (!currentWord) return;

    const targetIdx = displayWord.indexOf("_");
    if (targetIdx === -1) return;

    const correctLetter = currentWord.word[targetIdx];

    if (letter === correctLetter) {
      const newDisplay = [...displayWord];
      newDisplay[targetIdx] = letter;
      setDisplayWord(newDisplay);

      // Check if word completed
      if (!newDisplay.includes("_")) {
        setScore(s => s + (50 * level));
        setLevel(l => l + 1);
        toast.success("Word Decrypted!", { icon: <Unlock className="text-emerald-500" /> });
        setTimeout(generateQuestion, 800);
      }
    } else {
      if (lives > 1) {
        setLives(l => l - 1);
        toast.error("Incorrect Character", { description: "Encryption holding firm." });
      } else {
        setGameState('GAMEOVER');
        saveMatch(score, level);
      }
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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 overflow-hidden">
      
      <div className="max-w-2xl w-full relative">
        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-10 bg-neutral-900/50 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
               <Terminal size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Knowledge Yield</p>
               <p className="text-2xl font-black tabular-nums">{score}</p>
             </div>
          </div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={22} className={cn("transition-all duration-300", i < lives ? "text-red-500 fill-red-500 shadow-[0_0_15px_red]" : "text-neutral-800")} />
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Decryption Lvl</p>
            <p className="text-2xl font-black text-emerald-500 tabular-nums">{level}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10 py-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full" />
                <div className="relative inline-flex p-10 bg-emerald-500/10 rounded-[3.5rem] border border-emerald-500/20 mb-6">
                  <Keyboard size={80} className="text-emerald-500" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white">Keyword <span className="text-emerald-500">Crypt</span></h1>
                <p className="text-neutral-400 max-w-sm mx-auto">Reconstruct technical terms from their directives. 50+ phases of engineering vocabulary awaiting decryption.</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                START DECRYPTION <Play className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
              
              {/* Definition Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full" />
                <Card className="bg-neutral-900 border-2 border-white/5 rounded-[3rem] p-12 text-center relative z-10 shadow-2xl">
                  <Badge className="bg-emerald-500/10 text-emerald-400 mb-6 uppercase tracking-[0.4em] px-4 py-1 text-[10px] border border-emerald-500/20">System Directive</Badge>
                  <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
                    "{currentWord?.hint}"
                  </h2>
                </Card>
              </div>

              {/* Scramble Word Display */}
              <div className="flex justify-center gap-3">
                {displayWord.map((letter, i) => (
                  <div key={i} className={cn(
                    "w-14 h-20 md:w-16 md:h-24 rounded-2xl flex items-center justify-center text-4xl font-black border-2 transition-all",
                    letter === "_" ? "bg-black border-white/10 text-neutral-800" : "bg-emerald-500 border-emerald-300 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  )}>
                    {letter === "_" ? "?" : letter}
                  </div>
                ))}
              </div>

              {/* Letter Pool */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {options.map((char, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleLetterSelect(char)}
                    className="h-20 bg-neutral-900 border-b-4 border-neutral-950 hover:bg-neutral-800 hover:border-emerald-500 text-2xl font-black rounded-2xl transition-all active:translate-y-1 active:border-b-0"
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-500/20 shadow-2xl backdrop-blur-xl">
                 <Lock size={80} className="text-red-500 mx-auto mb-6 opacity-80" />
                 <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">Access <span className="text-red-500">Denied</span></h2>
                 <p className="text-neutral-500 font-bold tracking-[0.3em] text-xs mb-10 uppercase">Security Protocols Breached</p>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 text-center">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-widest">Final Yield</p>
                     <p className="text-5xl font-black text-emerald-500">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 text-center">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-widest">Knowledge Lvl</p>
                     <p className="text-5xl font-black text-white">{level}</p>
                   </div>
                 </div>

                 <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-xl rounded-3xl hover:bg-emerald-500 transition-all shadow-xl">
                   RE-INITIALIZE <RotateCcw className="ml-3" />
                 </Button>
              </div>

              {/* --- Local Storage History --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-6 text-neutral-500">
                  <History size={16} />
                  <h3 className="text-xs font-black uppercase tracking-[0.5em]">Session History (Last 5)</h3>
                </div>
                <div className="space-y-3">
                  {history.map((match) => (
                    <div key={match.id} className="bg-neutral-900/40 border border-white/5 p-6 rounded-[2.5rem] flex justify-between items-center group hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-black rounded-2xl text-neutral-500 group-hover:text-emerald-500 transition-colors">
                          <Calendar size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-600 font-bold uppercase">{match.date}</span>
                          <span className="text-lg font-black text-emerald-400 italic">Level {match.level} Decrypted</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-600 uppercase block mb-1">Yield</span>
                        <span className="text-3xl font-black tabular-nums tracking-tighter">{match.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 flex gap-12 text-[10px] font-black uppercase tracking-[0.6em] text-neutral-800">
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> Encrypted Database</span>
        <span className="flex items-center gap-2"><Cpu size={14} /> Core Process v1.4</span>
        <span className="flex items-center gap-2 font-mono italic">Record: {highScore}</span>
      </div>
    </div>
  );
}