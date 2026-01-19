"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Binary, BarChart3, Zap, 
  Terminal, Trophy, Cpu, 
  Activity, Flame, ShieldCheck, 
  FlaskConical, Database, Hash,
  Globe, Keyboard, Search, Target, 
  MousePointer2, Sparkles,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-[#000000] text-white selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* --- Visual Environment: Matrix Scanline --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(16,185,129,0.05)_50%)] bg-[size:100%_4px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1)_0%,transparent_50%)]" />
      </div>

      {/* --- Header Section --- */}
      <section className="relative pt-20 md:pt-32 pb-12 md:pb-20 z-10 text-center px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mb-6 md:mb-10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          >
            <Sparkles size={12} /> Neural Arcade Protocol v4.0
          </motion.div>
          
          <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-black mb-6 md:mb-8 tracking-tighter uppercase italic leading-[0.85] md:leading-[0.8] mix-blend-difference">
            THE <span className="text-emerald-500 drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]">VOID</span>
          </h1>
          
          <p className="text-neutral-500 max-w-xl mx-auto text-sm md:text-lg font-medium leading-relaxed mb-10 md:mb-12 px-4">
            Recalibrate your technical reflexes. Select a module to begin synchronization.
          </p>

          <div className="max-w-md mx-auto relative group px-2">
            <div className="absolute -inset-1 bg-emerald-500/20 blur opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl" />
            <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-1 shadow-2xl">
              <Search className="ml-4 h-5 w-5 text-neutral-700" />
              <input 
                type="text" 
                placeholder="SEARCH_COMMAND..." 
                className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 md:px-4 md:py-4 text-white font-mono text-xs md:text-sm placeholder:text-neutral-800 outline-none uppercase tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Sticky Mission Control --- */}
      <nav className="sticky top-0 z-50 bg-black/90 border-y border-white/5 backdrop-blur-2xl">
        <div className="container mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto flex-nowrap pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                  "px-5 py-2 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap shrink-0",
                  activeTab === cat 
                    ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                    : "bg-neutral-900/50 border-white/5 text-neutral-600 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-6 pr-4">
             <RankBadge icon={<Trophy className="text-yellow-500" />} label="Status" value="Elite Dev" />
             <RankBadge icon={<Activity className="text-emerald-500" />} label="Avg IQ" value="142.4" />
          </div>
        </div>
      </nav>

      {/* --- Main Mission Matrix --- */}
      <main className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10"
          >
            {filteredGames.map((game) => (
              <motion.div
                layout
                key={game.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className="active:scale-95 transition-transform"
              >
                <Link href={game.path} className="group block h-full">
                  <Card className="h-full bg-neutral-950 border border-white/10 group-hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden shadow-2xl rounded-2xl md:rounded-[2rem]">
                    
                    {/* Cover Image Container - Locked to 16:9 Aspect Ratio */}
                    <div className="relative aspect-video w-full overflow-hidden border-b border-white/5 bg-neutral-900">
                      <img 
                        src={game.image} 
                        alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      
                      {/* Overlay Gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60" />
                      <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Floating Difficulty Badge */}
                      <div className="absolute top-4 right-4 z-20">
                        <Badge variant="outline" className={cn(
                          "text-[8px] md:text-[9px] font-black px-2 md:px-3 border-white/20 bg-black/60 backdrop-blur-md",
                          game.difficulty === 'Expert' ? "text-red-500 border-red-500/50" : "text-emerald-500 border-emerald-500/50"
                        )}>
                          {game.difficulty}
                        </Badge>
                      </div>

                      {/* Floating Icon */}
                      <div className={cn(
                        "absolute bottom-4 left-4 p-3 md:p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1",
                        game.color,
                        "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                      )}>
                        {React.cloneElement(game.icon as React.ReactElement, { size: 24 })}
                      </div>
                    </div>

                    <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6 relative z-10 bg-neutral-950">
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-emerald-500/40 tracking-[0.2em] mb-1">{game.category}</p>
                        <CardTitle className="text-xl md:text-3xl font-black uppercase italic group-hover:text-emerald-400 transition-colors">{game.title}</CardTitle>
                        <CardDescription className="text-neutral-600 text-xs md:text-sm font-medium leading-relaxed group-hover:text-neutral-400 mt-2 line-clamp-2">
                          {game.description}
                        </CardDescription>
                      </div>
                      
                      <div className="pt-4 md:pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity size={12} className="text-neutral-800 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-[9px] md:text-[10px] font-black uppercase text-neutral-800 group-hover:text-neutral-500">{game.stats}</span>
                        </div>
                        <span className="flex items-center gap-1 text-emerald-500 font-black uppercase text-[8px] md:text-[10px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          START_SYNC <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- Footer HUD System --- */}
      <section className="container mx-auto px-4 pb-24 md:pb-32">
        <div className="p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-neutral-950 border border-white/10 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
               <StatusBox icon={<ShieldCheck size={20} className="text-emerald-500" />} label="Security" value="Hardened" />
               <StatusBox icon={<Cpu size={20} className="text-blue-500" />} label="Node" value="T-V12" />
               <StatusBox icon={<Flame size={20} className="text-orange-500" />} label="TPUT" value="990M" />
               <StatusBox icon={<Target size={20} className="text-red-500" />} label="Sync" value="98.2%" />
            </div>

            <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border-t border-white/5 pt-8 md:pt-12">
               <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="hidden sm:block p-3 bg-emerald-500/5 rounded-full border border-emerald-500/20">
                    <MousePointer2 size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-neutral-600 uppercase tracking-widest max-w-xs">
                    Latency optimized for sub-millisecond cognitive testing.
                  </p>
               </div>
               <Button className="w-full md:w-auto h-14 md:h-16 px-10 md:px-12 bg-white text-black font-black uppercase italic rounded-xl md:rounded-2xl hover:bg-emerald-500 transition-all active:scale-95">
                  Initialize Global Sync
               </Button>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function RankBadge({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
       {icon}
       <div className="text-left leading-none">
          <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-bold text-neutral-300 italic">{value}</p>
       </div>
    </div>
  );
}

function StatusBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-2 md:space-y-4 text-center md:text-left">
       <div className="p-3 bg-black border border-white/5 w-fit rounded-xl shadow-xl mx-auto md:mx-0">{icon}</div>
       <div>
          <p className="text-[8px] md:text-[10px] font-black text-neutral-700 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1">{label}</p>
          <p className="text-xl md:text-3xl font-black text-white italic tracking-tighter">{value}</p>
       </div>
    </div>
  );
}