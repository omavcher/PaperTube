"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Binary, BarChart3, Zap, Terminal, Trophy, Cpu, 
  Activity, Flame, ShieldCheck, FlaskConical, Database, Hash,
  Globe, Keyboard, Search, Target, MousePointer2, Sparkles,
  ArrowUpRight, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

// --- USER DATA (UNTOUCHED) ---
const GAMES = [
  { id: "binary-blitz", title: "Binary Blitz", description: "Decode 8-bit strings and logic paths.", icon: <Binary />, path: "/games/binary-blitz", difficulty: "Medium", category: "Programming", color: "text-blue-400", stats: "1.2k Syncs", image: "./games_thumb/binary-blitz.webp" },
  { id: "sort-fu", title: "Sort-Fu", description: "Numerical reflexes and sorting logic.", icon: <BarChart3 />, path: "/games/sort-fu", difficulty: "Easy", category: "Logic", color: "text-emerald-400", stats: "850 Syncs", image: "./games_thumb/sort-fu.webp" },
  { id: "circuit-breaker", title: "Circuit Breaker", description: "Deploy gates to light the system bulb.", icon: <Zap />, path: "/games/circuit-breaker", difficulty: "Hard", category: "Programming", color: "text-orange-400", stats: "420 Syncs", image: "./games_thumb/circuit-breaker.webp" },
  { id: "complexity-dash", title: "Complexity Dash", description: "Master Big-O analysis in real-time.", icon: <Terminal />, path: "/games/complexity-dash", difficulty: "Expert", category: "CS Core", color: "text-red-400", stats: "210 Syncs", image: "./games_thumb/complexity-dash.webp" },
  { id: "symbol-strike", title: "Symbol Strike", description: "Match atomic names to periodic symbols.", icon: <FlaskConical />, path: "/games/symbol-strike", difficulty: "Medium", category: "Science", color: "text-emerald-400", stats: "1.1k Syncs", image: "./games_thumb/symbol-strike.webp" },
  { id: "sql-sniper", title: "SQL Sniper", description: "Select correct queries for DB results.", icon: <Database />, path: "/games/sql-sniper", difficulty: "Hard", category: "CS Core", color: "text-blue-400", stats: "630 Syncs", image: "./games_thumb/sql-sniper.webp" },
  { id: "logic-leap", title: "Logic Leap", description: "Fill the gap in complex sequences.", icon: <Hash />, path: "/games/logic-leap", difficulty: "Medium", category: "Math", color: "text-purple-400", stats: "940 Syncs", image: "./games_thumb/logic-leap.webp" },
  { id: "flag-mastery", title: "Flag Mastery", description: "Global identification protocol.", icon: <Globe />, path: "/games/flag-mastery", difficulty: "Easy", category: "General", color: "text-cyan-400", stats: "2.4k Syncs", image: "./games_thumb/flag-mastery.webp" },
  { id: "keyword-crypt", title: "Keyword Crypt", description: "Decrypt engineering terms from hints.", icon: <Keyboard />, path: "/games/keyword-crypt", difficulty: "Expert", category: "Logic", color: "text-red-400", stats: "150 Syncs", image: "./games_thumb/keyword-crypt.webp" }
];

const categories = ["All", "Programming", "Math", "CS Core", "Logic", "Science"];

export default function PureBlackGamesHub() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      const matchesTab = activeTab === "All" || game.category === activeTab;
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      
      {/* --- Matrix Environment --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(16,185,129,0.05)_50%)] bg-[size:100%_4px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1)_0%,transparent_50%)]" />
      </div>

      {/* --- Tactical Hero Section --- */}
      <section className="relative pt-20 pb-10 z-10 text-center px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 mb-6"
        >
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_8px_emerald]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">8.2k Engineers In_Session</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-[10rem] font-black tracking-tighter uppercase italic leading-[0.8] mb-8">
          THE_<span className="text-emerald-500">VOID</span><br />LABS
        </h1>

        <div className="max-w-md mx-auto relative group">
          <div className="absolute -inset-1 bg-emerald-500/10 blur opacity-0 group-focus-within:opacity-100 transition duration-500 rounded-2xl" />
          <div className="relative flex items-center bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
            <Search className="ml-4 h-4 w-4 text-neutral-600" />
            <input 
              type="text" 
              placeholder="SEARCH_LOGIC_NODE..." 
              className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 text-white font-black uppercase text-xs tracking-widest outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* --- Sticky Swiper Navigation --- */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-y border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-6 py-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === cat 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                  : "bg-white/5 text-neutral-500 border border-white/5 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* --- Mission Matrix (2-Column Mobile) --- */}
      <main className="container mx-auto px-4 py-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={game.id}
              >
                <Link href={game.path} className="group relative block h-full active:scale-95 transition-transform">
                  <Card className="h-full bg-neutral-900/30 border-white/5 group-hover:border-emerald-500/50 transition-all duration-300 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
                    
                    {/* Visual Port: 16:9 Image */}
                    <div className="relative aspect-video w-full overflow-hidden border-b border-white/5">
                      <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
                      
                      {/* Floating Difficulty */}
                      <div className="absolute top-3 right-3">
                        <Badge className={cn(
                          "bg-black/60 backdrop-blur-md text-[7px] font-black border-white/10 px-2 py-0.5",
                          game.difficulty === 'Expert' ? "text-red-500" : "text-emerald-500"
                        )}>
                          {game.difficulty}
                        </Badge>
                      </div>

                      {/* Icon Branding */}
                      <div className={cn(
                        "absolute bottom-4 left-4 p-2.5 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 transition-transform group-hover:scale-110 shadow-2xl",
                        game.color
                      )}>
                        {React.cloneElement(game.icon as any, { size: 16 })}
                      </div>
                    </div>

                    <CardContent className="p-4 md:p-8 space-y-2 bg-gradient-to-b from-transparent to-black/20">
                      <p className="text-[7px] md:text-[9px] font-black text-neutral-600 uppercase tracking-widest">{game.category}</p>
                      <CardTitle className="text-xs md:text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-emerald-400 truncate">
                        {game.title}
                      </CardTitle>
                      <p className="text-neutral-500 text-[9px] md:text-xs font-bold leading-tight line-clamp-2 uppercase">
                        {game.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Activity size={10} className="text-emerald-500" />
                          <span className="text-[8px] md:text-[10px] font-black text-neutral-600">{game.stats}</span>
                        </div>
                        <span className="text-[8px] font-black text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">SYNC_NOW</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- System Health HUD --- */}
      <section className="px-6 py-20 border-t border-white/5 bg-neutral-950/50 backdrop-blur-3xl">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <StatHUD icon={<Trophy className="text-yellow-500" />} label="Status" val="Elite_Node" />
            <StatHUD icon={<Cpu className="text-blue-500" />} label="Process" val="V8_Neural" />
            <StatHUD icon={<Flame className="text-orange-500" />} label="Heat" val="Optimized" />
            <StatHUD icon={<Activity className="text-emerald-500" />} label="Uptime" val="99.9%" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Initialize_Global_Sync</h3>
              <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Connect with 10k+ engineers in the leaderboard.</p>
            </div>
            <Button size="lg" className="w-full md:w-auto h-16 px-12 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-2xl">
              Launch Console <ArrowUpRight className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// --- Specialized UI Components ---

function StatHUD({ icon, label, val }: any) {
  return (
    <div className="space-y-3">
      <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
        <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">{label}</p>
        <p className="text-lg md:text-2xl font-black text-white italic tracking-tighter leading-none">{val}</p>
      </div>
    </div>
  );
}