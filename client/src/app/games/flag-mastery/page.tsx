"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Globe, Trophy, Play, RotateCcw, 
  Zap, Heart, ShieldCheck, Activity, 
  MapPin, Flag, CheckCircle, XCircle,
  History, Loader2, Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import api from "@/config/api";
import { COUNTRY_POOL, CountryData } from "@/data/countries"; 

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

export default function FlagMastery() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [currentCountry, setCurrentCountry] = useState<CountryData | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastSeenCodes, setLastSeenCodes] = useState<string[]>([]);
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
  // --- Identity Detection ---
  const getIdentity = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : { id: "guest_node", name: "Guest", email: "anonymous@void.com" };
    } catch { return { id: "guest_node", name: "Guest", email: "anonymous@void.com" }; }
  };

  // --- Telemetry Sync ---
  const pushStats = async (finalScore: number, finalLevel: number) => {
    setGameState('SYNCING');
    const user = getIdentity();
    
    const payload = {
      userId: user.id || user._id,
      name: user.name,
      email: user.email,
      game: "Flag Mastery",
      stats: {
        score: finalScore,
        level: finalLevel,
        timestamp: new Date().toISOString()
      },
            device: getDeviceMetadata() // Injected device metadata
    };

    try {
      await api.post("/general/game-stats", payload);
      toast.success("DIPLOMATIC_DATA_SYNCED");
    } catch (error) {
      toast.error("SYNC_OFFLINE", { description: "Data stored in local cache." });
    } finally {
      setGameState('GAMEOVER');
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("flag_mastery_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedHigh = localStorage.getItem("flag_mastery_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  // --- Core Question Engine ---
  const generateQuestion = useCallback(() => {
    setIsAnswering(false);
    setSelectedOption(null);

    // Hardcore Scaling: Levels move from Tier 1 (Common) to Tier 3 (Obscure)
    let targetTier = level < 15 ? 1 : level < 35 ? 2 : 3;
    const allowedPool = COUNTRY_POOL.filter(c => c.tier <= targetTier);

    let correct: CountryData;
    let attempts = 0;
    do {
        const idx = Math.floor(Math.random() * allowedPool.length);
        correct = allowedPool[idx];
        attempts++;
    } while (lastSeenCodes.includes(correct.code) && attempts < 50);

    setLastSeenCodes(prev => [correct.code, ...prev].slice(0, 15));
    setCurrentCountry(correct);

    const opts = new Set<string>();
    opts.add(correct.name);
    while (opts.size < 4) {
        opts.add(allowedPool[Math.floor(Math.random() * allowedPool.length)].name);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  }, [level, lastSeenCodes]);

  const handleAnswer = (selectedName: string) => {
    if (isAnswering || !currentCountry) return;
    setIsAnswering(true);
    setSelectedOption(selectedName);

    if (selectedName === currentCountry.name) {
      const points = 10 * currentCountry.tier * level;
      setScore(s => s + points);
      toast.success("RECOGNITION_VERIFIED");
      setTimeout(() => {
        setLevel(l => l + 1);
        generateQuestion();
      }, 1000);
    } else {
      if (lives > 1) {
        setLives(l => l - 1);
        toast.error(`IDENT_FAILURE: ${currentCountry.name}`);
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      <div className="max-w-2xl w-full relative">
        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-8 bg-neutral-900/20 p-6 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Diplomatic_Score</p>
              <p className="text-2xl font-black tabular-nums">{score}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} size={18} className={cn("transition-all", i < lives ? "text-red-600 fill-red-600" : "text-neutral-950")} />
              ))}
            </div>
            <Badge className="bg-blue-600/10 text-blue-400 border-none font-black text-[8px] uppercase tracking-widest">Integrity</Badge>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Phase</p>
            <p className="text-2xl font-black text-blue-500 tabular-nums">L{level}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-blue-600/5 rounded-[4rem] border border-blue-600/10 shadow-[0_0_80px_rgba(59,130,246,0.1)]">
                  <Globe size={100} className="text-blue-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">FLAG_<span className="text-blue-500">MASTERY</span></h1>
                <p className="text-neutral-600 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Sovereign_Identity_Protocol_v4.0</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-blue-600 hover:bg-blue-500 text-white font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                START <Play size={28} className="ml-3 fill-white" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && currentCountry && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              {/* Flag Card: Strict 16:9 Inspired Ratio */}
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />
                <Card className="bg-neutral-900/40 border-2 border-white/5 rounded-[3rem] p-10 md:p-16 flex items-center justify-center relative z-10 backdrop-blur-xl overflow-hidden min-h-[300px]">
                  <motion.img 
                    key={currentCountry.code}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={`https://flagcdn.com/w640/${currentCountry.code}.png`}
                    alt="Sovereign Flag"
                    className="w-auto h-auto max-h-[220px] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
                  />
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-blue-500/10 text-blue-500 border-none font-black text-[9px] tracking-[0.2em]">TIER_{currentCountry.tier}</Badge>
                  </div>
                </Card>
              </div>

              {/* Options Grid: Optimized for Mobile Thumbs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    disabled={isAnswering}
                    className={cn(
                      "h-20 md:h-24 rounded-[2rem] text-lg md:text-xl font-black italic tracking-tighter transition-all transform active:scale-90 border-2",
                      !isAnswering ? "bg-neutral-900 border-white/5 hover:border-blue-500 text-white" : 
                      opt === currentCountry.name ? "bg-emerald-600 border-emerald-400 text-white" : 
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
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-900/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                 <h2 className="text-5xl md:text-7xl font-black text-red-600 uppercase italic tracking-tighter mb-10 relative z-10 leading-none">DIPLOMATIC_<br/>FAILURE</h2>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Final_Score</p>
                     <p className="text-5xl font-black text-blue-500 leading-none tabular-nums">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Max_Phase</p>
                     <p className="text-5xl font-black text-white leading-none tabular-nums">L{level}</p>
                   </div>
                 </div>

                 {gameState === 'SYNCING' ? (
                   <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                      <Loader2 size={16} className="animate-spin" /> Transmitting_Logs...
                   </div>
                 ) : (
                   <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-2xl">
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
        <span className="flex items-center gap-2"><Fingerprint size={14} /> ID: {getIdentity().id.substring(0,10)}...</span>
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> pb_node: {highScore}</span>
        <span className="flex items-center gap-2 italic">v2026.VOID-ARCADE</span>
      </div>
    </div>
  );
}