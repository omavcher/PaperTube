"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Database, Trophy, Play, RotateCcw, 
  Heart, Timer, ShieldCheck, 
  Activity, Terminal, ChevronRight, Loader2,
  Fingerprint, HardDrive, Gamepad2, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import api from "@/config/api";
import Link from "next/link";
import Footer from "@/components/Footer";

// --- SQL Question Pool ---
interface SQLQuestion {
  question: string;
  ans: string;
  tier: number;
}
const SQL_POOL: SQLQuestion[] = [
  // Tier 1: Beginner
  { question: "Fetch all users.", ans: "SELECT * FROM users;", tier: 1 },
  { question: "Find users over 18.", ans: "SELECT name FROM users WHERE age > 18;", tier: 1 },
  { question: "Names starting with A.", ans: "SELECT * FROM users WHERE name LIKE 'A%';", tier: 1 },
  { question: "Count total orders.", ans: "SELECT COUNT(*) FROM orders;", tier: 1 },
  { question: "Products under 100.", ans: "SELECT * FROM products WHERE price < 100;", tier: 1 },
  { question: "Employees hired after 2020.", ans: "SELECT * FROM employees WHERE hire_date > '2020-01-01';", tier: 1 },
  { question: "Distinct employee job titles.", ans: "SELECT DISTINCT job_title FROM employees;", tier: 1 },
  { question: "Customers in New York.", ans: "SELECT * FROM customers WHERE city = 'New York';", tier: 1 },
  { question: "Orders placed today.", ans: "SELECT * FROM orders WHERE order_date = CURRENT_DATE;", tier: 1 },
  { question: "Products out of stock.", ans: "SELECT * FROM products WHERE stock_quantity = 0;", tier: 1 },

  // Tier 2: Intermediate
  { question: "Join orders and users.", ans: "SELECT orders.*, users.name FROM orders JOIN users ON orders.user_id = users.id;", tier: 2 },
  { question: "Average salary by department.", ans: "SELECT dept, AVG(salary) FROM emp GROUP BY dept;", tier: 2 },
  { question: "Top five expensive products.", ans: "SELECT * FROM products ORDER BY price DESC LIMIT 5;", tier: 2 },
  { question: "Unique customer cities.", ans: "SELECT DISTINCT city FROM customers;", tier: 2 },
  { question: "Total sales per product.", ans: "SELECT product_id, SUM(amount) FROM sales GROUP BY product_id;", tier: 2 },
  { question: "Employees with department names.", ans: "SELECT e.name, d.dept_name FROM employees e JOIN departments d ON e.dept_id = d.id;", tier: 2 },
  
  // Tier 3: Advanced
  { question: "Delete older users.", ans: "DELETE FROM users WHERE last_login < '2020-01-01';", tier: 3 },
  { question: "Add bio column.", ans: "ALTER TABLE profiles ADD bio TEXT;", tier: 3 },
  { question: "Update specific product price.", ans: "UPDATE products SET price = 99 WHERE id = 10;", tier: 3 },
  { question: "Departments with 10+ staff.", ans: "SELECT dept FROM emp GROUP BY dept HAVING COUNT(*) > 10;", tier: 3 },
  { question: "Products above average price.", ans: "SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);", tier: 3 },

  // Tier 4: Expert
  { question: "Longest daily login streak.", ans: "WITH LoginGroups AS (SELECT user_id, login_date, login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) as grp FROM logins) SELECT user_id, COUNT(*) as streak FROM LoginGroups GROUP BY user_id, grp ORDER BY streak DESC LIMIT 1;", tier: 4 },
  { question: "Moving average of sales.", ans: "SELECT date, amount, AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg FROM daily_sales;", tier: 4 },
  { question: "Find sequence number gaps.", ans: "WITH NumberSeries AS (SELECT generate_series(MIN(id), MAX(id)) as expected FROM table) SELECT expected FROM NumberSeries WHERE expected NOT IN (SELECT id FROM table);", tier: 4 },
  { question: "Top three category products.", ans: "SELECT category_id, product_id, sales, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY sales DESC) as rank FROM product_sales WHERE rank <= 3;", tier: 4 },
  { question: "Find common user followers.", ans: "SELECT f1.follower_id FROM followers f1 JOIN followers f2 ON f1.follower_id = f2.follower_id WHERE f1.user_id = 1 AND f2.user_id = 2;", tier: 4 },
];

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

export default function SqlSniper() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(12);
  const [level, setLevel] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  
  // --- Device Detection Logic ---
  const getDeviceMetadata = () => {
    if (typeof window === "undefined") return { isMobile: false, browser: "Unknown" };
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    const isMobile = /Mobi|Android|iPhone/i.test(ua) || window.innerWidth < 768;
    return { isMobile, browser };
  };

  // --- Identity & Telemetry Sync ---
  const getIdentity = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : { id: "guest_node", name: "Guest", email: "anonymous@void.com" };
    } catch { return { id: "guest_node", name: "Guest", email: "anonymous@void.com" }; }
  };

  const pushStatsToBackend = async (finalScore: number, finalLevel: number) => {
    setGameState('SYNCING');
    const user = getIdentity();
    const payload = {
      userId: user.id || user._id,
      name: user.name,
      email: user.email,
      game: "SQL Sniper",
      stats: {
        score: finalScore,
        level: finalLevel,
        timestamp: new Date().toISOString()
      },
      device: getDeviceMetadata()
    };

    try {
      await api.post("/general/game-stats", payload);
      toast.success("TELEMETRY SYNCED");
    } catch (error) {
      // Silent fail for arcade feel
    } finally {
      setGameState('GAMEOVER');
    }
  };

  useEffect(() => {
    const savedHigh = localStorage.getItem("sql_sniper_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  // --- Core Game Logic ---
  const generateQuestion = useCallback(() => {
    // HARDER SCALING: Introduce T3/T4 queries much earlier
    const targetTier = level < 5 ? 1 : level < 12 ? 2 : level < 20 ? 3 : 4;
    const pool = SQL_POOL.filter(q => q.tier <= targetTier);
    const nextIdx = Math.floor(Math.random() * pool.length);
    
    // Find absolute index in main pool
    const actualIdx = SQL_POOL.findIndex(s => s.question === pool[nextIdx].question);
    setCurrentIdx(actualIdx);

    // Hard Options Generation: Pick similar queries to confuse the user
    const correctAns = pool[nextIdx].ans;
    const opts = new Set<string>();
    opts.add(correctAns);
    while (opts.size < 4) {
      opts.add(SQL_POOL[Math.floor(Math.random() * SQL_POOL.length)].ans);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));

    // Time decay: Starts at 12s, floor at 4s
    setTimeLeft(Math.max(4.0, 12 - (level * 0.35)));
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

  const handleAnswer = (choice: string) => {
    if (choice === SQL_POOL[currentIdx].ans) {
      setScore(s => s + (50 * SQL_POOL[currentIdx].tier));
      setLevel(l => l + 1);
      generateQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("SYNTAX ERROR - CONNECTION UNSTABLE");
      generateQuestion();
    } else {
      pushStatsToBackend(score, level);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-600/30 overflow-hidden">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[60vh] bg-emerald-600/5 blur-[120px] pointer-events-none" />

      {/* --- Desktop Navbar --- */}
      <nav className="hidden md:flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl fixed top-0 w-full z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-black">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white uppercase">
            VOID<span className="text-emerald-600 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">ARCADE</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
            <Link href="/tools" className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors">Exit</Link>
            <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 uppercase tracking-widest text-[10px] bg-emerald-500/5">Database Div</Badge>
        </div>
      </nav>

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Database className="text-emerald-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">SQL SNIPER</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-4xl mx-auto min-h-[80vh]">
        
        {/* --- HUD --- */}
        <div className="w-full max-w-2xl bg-neutral-900/40 border border-white/5 p-6 rounded-[2.5rem] md:rounded-full backdrop-blur-md mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 opacity-50" />
          
          <div className="relative z-10 flex justify-between items-center px-2 md:px-6">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <Database size={24} />
              </div>
              <div>
                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Rows Fetched</p>
                <p className="text-2xl font-black tabular-nums tracking-tighter">{score}</p>
              </div>
            </div>

            {/* Lives */}
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} size={22} className={cn("transition-all", i < lives ? "text-red-600 fill-red-600" : "text-neutral-900 fill-neutral-900")} />
              ))}
            </div>

            {/* Timer */}
            <div className="text-right">
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Breach Time</p>
              <span className={cn("text-xl font-black tabular-nums", timeLeft < 3 ? "text-red-600 animate-pulse" : "text-white")}>
                {timeLeft.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl w-full relative z-10">
          <AnimatePresence mode="wait">
            
            {/* --- VIEW: START --- */}
            {gameState === 'START' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-12">
                <div className="space-y-4">
                  <div className="inline-flex p-10 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                    <Terminal size={100} className="text-emerald-500" />
                  </div>
                  <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none">
                    SQL_<span className="text-emerald-500">SNIPER</span>
                  </h1>
                  <p className="text-neutral-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                    Analyze_Requirement // Inject_Correct_Query // Phase_v4.0
                  </p>
                </div>
                <Button onClick={() => { setScore(0); setLives(3); setLevel(1); setGameState('PLAYING'); generateQuestion(); }} 
                  className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all uppercase italic tracking-widest">
                  Initialize <Play size={28} className="ml-3 fill-black" />
                </Button>
              </motion.div>
            )}

            {/* --- VIEW: PLAYING --- */}
            {gameState === 'PLAYING' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 12) * 100}%` }}
                    className={cn("h-full transition-colors", timeLeft < 3 ? "bg-red-600" : "bg-emerald-500")}
                  />
                </div>

                {/* Data Requirement Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />
                  <Card className="bg-neutral-900/40 border-2 border-white/5 rounded-[4rem] p-10 md:p-16 text-center relative z-10 backdrop-blur-xl">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] mb-6 tracking-[0.4em]">DATA_SPECIFICATION</Badge>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight italic drop-shadow-lg">
                      "{SQL_POOL[currentIdx].question}"
                    </h2>
                  </Card>
                </div>

                {/* Answer Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((opt, i) => (
                    <Button 
                      key={i} 
                      onClick={() => handleAnswer(opt)}
                      className="h-auto min-h-[100px] py-6 px-8 bg-neutral-900 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-left justify-start rounded-[2rem] transition-all transform active:scale-95 group"
                    >
                      <div className="flex gap-4 items-start w-full">
                        <ChevronRight size={18} className="text-neutral-700 group-hover:text-emerald-500 mt-1 shrink-0" />
                        <span className="font-mono text-sm md:text-base text-emerald-400 break-all leading-relaxed w-full">{opt}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- VIEW: GAMEOVER --- */}
            {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-900/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                    <h2 className="text-6xl md:text-8xl font-black text-red-600 uppercase italic tracking-tighter mb-10 relative z-10">CONNECTION_LOST</h2>
                    
                    <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                      <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                        <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Rows_Secured</p>
                        <p className="text-5xl font-black text-emerald-500 leading-none">{score}</p>
                      </div>
                      <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                        <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Max_Depth</p>
                        <p className="text-5xl font-black text-white leading-none">L{level}</p>
                      </div>
                    </div>

                    {gameState === 'SYNCING' ? (
                      <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                         <Loader2 size={16} className="animate-spin" /> UPLOADING_MISSION_STATS...
                      </div>
                    ) : (
                      <Button onClick={() => setGameState('START')} className="w-full h-20 bg-white text-black font-black text-2xl rounded-[2.5rem] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-2xl uppercase italic tracking-widest">
                       Reboot System <RotateCcw size={24} className="ml-3" />
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
          <span className="flex items-center gap-2"><HardDrive size={14} /> pb_node: {highScore}</span>
        </div>

      </main>

      <Footer />
    </div>
  );
}