"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Binary, BarChart3, Zap, Terminal, Trophy, Cpu, 
  Activity, Flame, ShieldCheck, FlaskConical, Database, Hash,
  Globe, Keyboard, Search, Target, MousePointer2, Sparkles,
  ArrowUpRight, TrendingUp, Home, Grid, Settings, Gamepad2
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

// --- DATA ---
const GAMES = [
  { id: "binary-blitz", title: "Binary Blitz", description: "Decode 8-bit strings.", icon: <Binary />, path: "/games/binary-blitz", difficulty: "Medium", category: "Programming", color: "text-blue-400", bg: "from-blue-500", stats: "1.2k Syncs", image: "/games_thumb/binary-blitz.webp" },
  { id: "sort-fu", title: "Sort-Fu", description: "Sorting logic reflexes.", icon: <BarChart3 />, path: "/games/sort-fu", difficulty: "Easy", category: "Logic", color: "text-emerald-400", bg: "from-emerald-500", stats: "850 Syncs", image: "/games_thumb/sort-fu.webp" },
  { id: "circuit-breaker", title: "Circuit Breaker", description: "Deploy logic gates.", icon: <Zap />, path: "/games/circuit-breaker", difficulty: "Hard", category: "Programming", color: "text-orange-400", bg: "from-orange-500", stats: "420 Syncs", image: "/games_thumb/circuit-breaker.webp" },
  { id: "complexity-dash", title: "Complexity Dash", description: "Master Big-O analysis.", icon: <Terminal />, path: "/games/complexity-dash", difficulty: "Expert", category: "CS Core", color: "text-red-400", bg: "from-red-500", stats: "210 Syncs", image: "/games_thumb/complexity-dash.webp" },
  { id: "symbol-strike", title: "Symbol Strike", description: "Periodic table reflex.", icon: <FlaskConical />, path: "/games/symbol-strike", difficulty: "Medium", category: "Science", color: "text-emerald-400", bg: "from-emerald-500", stats: "1.1k Syncs", image: "/games_thumb/symbol-strike.webp" },
  { id: "sql-sniper", title: "SQL Sniper", description: "Query selection drill.", icon: <Database />, path: "/games/sql-sniper", difficulty: "Hard", category: "CS Core", color: "text-blue-400", bg: "from-blue-500", stats: "630 Syncs", image: "/games_thumb/sql-sniper.webp" },
  { id: "logic-leap", title: "Logic Leap", description: "Sequence completion.", icon: <Hash />, path: "/games/logic-leap", difficulty: "Medium", category: "Math", color: "text-purple-400", bg: "from-purple-500", stats: "940 Syncs", image: "/games_thumb/logic-leap.webp" },
  { id: "flag-mastery", title: "Flag Mastery", description: "Global geo-protocol.", icon: <Globe />, path: "/games/flag-mastery", difficulty: "Easy", category: "General", color: "text-cyan-400", bg: "from-cyan-500", stats: "2.4k Syncs", image: "/games_thumb/flag-mastery.webp" },
  { id: "keyword-crypt", title: "Keyword Crypt", description: "Decrypt tech terms.", icon: <Keyboard />, path: "/games/keyword-crypt", difficulty: "Expert", category: "Logic", color: "text-red-400", bg: "from-red-500", stats: "150 Syncs", image: "/games_thumb/keyword-crypt.webp" }
];

const categories = ["All", "Programming", "Math", "CS Core", "Logic", "Science"];

export default function GamesHubClient() {
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
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans flex flex-col pb-20 md:pb-0">
      
      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-emerald-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">ARCADE</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-emerald-500" />
        </div>
      </div>

      <main className="flex-1 pt-6 md:pt-28 px-4 container mx-auto">
        
        {/* --- Hero Section --- */}
        <section className="text-center mb-8">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 mb-4">
             <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">8.2k Engineers Active</span>
           </motion.div>
           
           <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6">
             THE_<span className="text-emerald-500">VOID</span><br />LABORATORY
           </h1>

           {/* Search */}
           <div className="max-w-md mx-auto relative group">
             <div className="absolute -inset-0.5 bg-emerald-500/20 blur opacity-0 group-focus-within:opacity-100 transition duration-500 rounded-2xl" />
             <div className="relative flex items-center bg-neutral-900 border border-white/10 rounded-2xl p-1">
               <Search className="ml-3 h-4 w-4 text-neutral-500" />
               <input 
                 type="text" 
                 placeholder="SEARCH_LOGIC_NODE..." 
                 className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 text-white font-bold uppercase text-[10px] tracking-widest outline-none placeholder:text-neutral-700"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </div>
        </section>

        {/* --- Filter Tabs --- */}
        <div className="sticky top-16 md:top-24 z-30 bg-black/80 backdrop-blur-md -mx-4 px-4 py-2 border-y border-white/5 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 border",
                  activeTab === cat 
                    ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                    : "bg-neutral-900 text-neutral-500 border-white/5 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Game Matrix --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-12">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={game.id}
              >
                <Link href={game.path} className="group relative block h-full">
                  <Card className="h-full bg-neutral-900/40 border-white/5 group-hover:border-emerald-500/50 transition-all duration-300 rounded-2xl md:rounded-[2rem] overflow-hidden">
                    
                    {/* Thumbnail: 16:9 Aspect Ratio enforced */}
                    <div className="relative w-full aspect-video overflow-hidden border-b border-white/5">
                      {/* Fallback gradient if image fails to load, or use actual image */}
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", game.bg)} /> 
                      <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'; // Hide if broken
                        }}
                      />
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Difficulty Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={cn(
                          "backdrop-blur-md text-[7px] font-black border-white/10 px-1.5 py-0",
                          game.difficulty === 'Expert' ? "bg-red-500/20 text-red-500" : 
                          game.difficulty === 'Hard' ? "bg-orange-500/20 text-orange-500" :
                          "bg-emerald-500/20 text-emerald-500"
                        )}>
                          {game.difficulty}
                        </Badge>
                      </div>

                      {/* Icon */}
                      <div className={cn(
                        "absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10",
                        game.color
                      )}>
                        {React.cloneElement(game.icon as any, { size: 14 })}
                      </div>
                    </div>

                    <CardContent className="p-3 md:p-5">
                      <p className="text-[7px] font-black text-neutral-500 uppercase tracking-widest mb-1">{game.category}</p>
                      <CardTitle className="text-[10px] md:text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-emerald-400 truncate leading-tight">
                        {game.title}
                      </CardTitle>
                      <p className="text-neutral-500 text-[8px] md:text-xs font-medium leading-tight line-clamp-2 mt-1">
                        {game.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          <Activity size={10} className="text-emerald-500" />
                          <span className="text-[8px] font-bold text-neutral-600">{game.stats}</span>
                        </div>
                        <ArrowUpRight size={12} className="text-neutral-700 group-hover:text-white transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-emerald-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}