"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Keyboard, Trophy, Play, RotateCcw, 
  Zap, Heart, ShieldCheck, Activity, 
  History, Calendar, Terminal, Lock,
  Unlock, Cpu, Binary, Search, Loader2,
  Smartphone, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import api from "@/config/api";

// --- Word Pool ---
interface WordData { word: string; hint: string; tier: number; }
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

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

export default function KeywordCrypt() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [displayWord, setDisplayWord] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);

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

  // --- Telemetry Sync ---
  const pushStats = async (finalScore: number, finalLevel: number) => {
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
      game: "Keyword Crypt",
      stats: {
        score: finalScore,
        level: finalLevel,
        timestamp: new Date().toISOString()
      },
      device: getDeviceMetadata() // Injected device metadata
    };

    try {
      await api.post("/general/game-stats", payload);
      toast.success("TELEMETRY_SYNCED");
    } catch {
      toast.error("SYNC_OFFLINE");
    } finally {
      setGameState('GAMEOVER');
    }
  };

  // Persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem("keyword_crypt_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedHigh = localStorage.getItem("keyword_crypt_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  // --- Hardcore Difficulty Scaling ---
  const generateQuestion = useCallback(() => {
    const tier = level < 10 ? 1 : level < 25 ? 2 : 3;
    const pool = WORD_POOL.filter(w => w.tier <= tier);
    const target = pool[Math.floor(Math.random() * pool.length)];
    setCurrentWord(target);

    const chars = target.word.split("");
    // Difficulty Formula: As level rises, hide up to 80% of the word
    const maskRatio = Math.min(0.8, 0.2 + (level * 0.02)); 
    const missingCount = Math.max(1, Math.floor(chars.length * maskRatio));
    const indicesToHide = new Set<number>();
    
    while(indicesToHide.size < missingCount) {
      indicesToHide.add(Math.floor(Math.random() * chars.length));
    }

    setDisplayWord(chars.map((c, i) => indicesToHide.has(i) ? "_" : c));

    // Options: Logic to increase distractions based on level
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const opts = new Set<string>(Array.from(indicesToHide).map(i => chars[i]));
    const totalOptions = level > 20 ? 12 : 6;
    while (opts.size < totalOptions) {
      opts.add(alphabet[Math.floor(Math.random() * 26)]);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  }, [level]);

  const handleLetterSelect = (letter: string) => {
    if (!currentWord || gameState !== 'PLAYING') return;

    const targetIdx = displayWord.indexOf("_");
    if (targetIdx === -1) return;

    if (letter === currentWord.word[targetIdx]) {
      const newDisplay = [...displayWord];
      newDisplay[targetIdx] = letter;
      setDisplayWord(newDisplay);

      if (!newDisplay.includes("_")) {
        setScore(s => s + (100 * level));
        setLevel(l => l + 1);
        toast.success("DECRYPTED");
        setTimeout(generateQuestion, 600);
      }
    } else {
      if (lives > 1) {
        setLives(l => l - 1);
        toast.error("PARITY_ERROR");
      } else {
        pushStats(score, level);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* --- HUD --- */}
      <div className="w-full max-w-2xl bg-neutral-900/20 border border-white/5 p-6 rounded-[2rem] md:rounded-[3rem] backdrop-blur-3xl mb-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Terminal size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Yield</p>
              <p className="text-xl md:text-2xl font-black tabular-nums">{score}</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={18} className={cn("transition-all", i < lives ? "text-red-600 fill-red-600" : "text-neutral-950")} />
            ))}
          </div>

          <div className="text-right">
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Depth</p>
            <p className="text-xl md:text-2xl font-black text-emerald-500 tabular-nums">L{level}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-12">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                  <Keyboard size={80} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">KEYWORD_<span className="text-emerald-500">CRYPT</span></h1>
                <p className="text-neutral-600 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Node_Protocol: Decrypt_Stack_v5.0</p>
              </div>
              <Button onClick={() => { setScore(0); setLives(3); setLevel(1); setGameState('PLAYING'); generateQuestion(); }} 
                className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                START <Play size={28} className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <Card className="bg-neutral-900/40 border-2 border-white/5 rounded-[3rem] p-10 md:p-16 text-center relative z-10 backdrop-blur-xl">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] mb-6 tracking-[0.4em]">DIRECTIVE_HINT</Badge>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight italic">
                  "{currentWord?.hint}"
                </h2>
              </Card>

              {/* Scramble Display */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                {displayWord.map((letter, i) => (
                  <div key={i} className={cn(
                    "w-12 h-16 md:w-16 md:h-24 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black border-2 transition-all",
                    letter === "_" ? "bg-black border-white/10 text-neutral-800" : "bg-emerald-500 border-emerald-300 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  )}>
                    {letter === "_" ? "?" : letter}
                  </div>
                ))}
              </div>

              {/* Input Grid - Multi-column responsive */}
              <div className={cn("grid gap-3", level > 20 ? "grid-cols-4 md:grid-cols-6" : "grid-cols-3 md:grid-cols-6")}>
                {options.map((char, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleLetterSelect(char)}
                    className="h-16 md:h-20 bg-neutral-900 border-b-4 border-black hover:border-emerald-500 hover:bg-emerald-500/10 text-2xl font-black rounded-2xl transition-all active:scale-90"
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-900/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                 <h2 className="text-5xl md:text-7xl font-black text-red-600 uppercase italic tracking-tighter mb-10 relative z-10 leading-none">ACCESS_<br/>DENIED</h2>
                 
                 <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Final_Yield</p>
                     <p className="text-5xl font-black text-emerald-500 leading-none">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Depth</p>
                     <p className="text-5xl font-black text-white leading-none">L{level}</p>
                   </div>
                 </div>

                 {gameState === 'SYNCING' ? (
                   <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                      <Loader2 size={16} className="animate-spin" /> UPLOADING_TELEMETRY...
                   </div>
                 ) : (
                   <Button onClick={() => setGameState('START')} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-2xl">
                    RESTART <RotateCcw size={24} className="ml-3" />
                   </Button>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meta HUD */}
      <div className="mt-16 flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-900">
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> Vault_Hardened</span>
        <span className="flex items-center gap-2">
            {getDeviceMetadata().isMobile ? <Smartphone size={14} /> : <Monitor size={14} />} 
            Node: {getDeviceMetadata().browser}
        </span>
        <span className="flex items-center gap-2 italic">v2026.VOID-ARCADE</span>
      </div>
    </div>
  );
}