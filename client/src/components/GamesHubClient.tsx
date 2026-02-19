"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Binary, BarChart3, Zap, Terminal, Trophy, Cpu, 
  Activity, Flame, ShieldCheck, FlaskConical, Database, Hash,
  Globe, Keyboard, Search, Target, MousePointer2, Sparkles,
  ArrowUpRight, TrendingUp, Home, Grid, Settings, Gamepad2,
  Code2
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

// --- DATA ---
const GAMES = [
  { id: "binary-blitz", title: "Binary Blitz", description: "Decode 8-bit strings.", icon: <Binary />, path: "/games/binary-blitz", difficulty: "Medium", category: "Programming", color: "text-blue-400", bg: "from-blue-900/40", stats: "1.2k Syncs", image: "/games_thumb/binary-blitz.webp" },
  { id: "sort-fu", title: "Sort-Fu", description: "Sorting logic reflexes.", icon: <BarChart3 />, path: "/games/sort-fu", difficulty: "Easy", category: "Logic", color: "text-emerald-400", bg: "from-emerald-900/40", stats: "850 Syncs", image: "/games_thumb/sort-fu.webp" },
  { id: "circuit-breaker", title: "Circuit Breaker", description: "Deploy logic gates.", icon: <Zap />, path: "/games/circuit-breaker", difficulty: "Hard", category: "Programming", color: "text-orange-400", bg: "from-orange-900/40", stats: "420 Syncs", image: "/games_thumb/circuit-breaker.webp" },
  { id: "complexity-dash", title: "Complexity Dash", description: "Master Big-O analysis.", icon: <Terminal />, path: "/games/complexity-dash", difficulty: "Expert", category: "CS Core", color: "text-red-400", bg: "from-red-900/40", stats: "210 Syncs", image: "/games_thumb/complexity-dash.webp" },
  { id: "symbol-strike", title: "Symbol Strike", description: "Periodic table reflex.", icon: <FlaskConical />, path: "/games/symbol-strike", difficulty: "Medium", category: "Science", color: "text-emerald-400", bg: "from-emerald-900/40", stats: "1.1k Syncs", image: "/games_thumb/symbol-strike.webp" },
  { id: "sql-sniper", title: "SQL Sniper", description: "Query selection drill.", icon: <Database />, path: "/games/sql-sniper", difficulty: "Hard", category: "CS Core", color: "text-blue-400", bg: "from-blue-900/40", stats: "630 Syncs", image: "/games_thumb/sql-sniper.webp" },
  { id: "logic-leap", title: "Logic Leap", description: "Sequence completion.", icon: <Hash />, path: "/games/logic-leap", difficulty: "Medium", category: "Math", color: "text-purple-400", bg: "from-purple-900/40", stats: "940 Syncs", image: "/games_thumb/logic-leap.webp" },
  { id: "flag-mastery", title: "Flag Mastery", description: "Global geo-protocol.", icon: <Globe />, path: "/games/flag-mastery", difficulty: "Easy", category: "General", color: "text-cyan-400", bg: "from-cyan-900/40", stats: "2.4k Syncs", image: "/games_thumb/flag-mastery.webp" },
  { id: "keyword-crypt", title: "Keyword Crypt", description: "Decrypt tech terms.", icon: <Keyboard />, path: "/games/keyword-crypt", difficulty: "Expert", category: "Logic", color: "text-red-400", bg: "from-red-900/40", stats: "150 Syncs", image: "/games_thumb/keyword-crypt.webp" }
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
    <div className="min-h-screen bg-black text-white selection:bg-emerald-900/50 overflow-x-hidden font-sans flex flex-col">
      
      {/* --- Background Atmosphere --- */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>
      <div className="fixed inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="relative z-10 flex-1 pt-2 md:pt-24 px-4 md:px-6 container mx-auto max-w-7xl">
        
        {/* --- Hero Section --- */}
        <section className="text-center mb-10 md:mb-16 space-y-4 md:space-y-6">
           <motion.div 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }} 
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 mt-4 md:mt-0"
           >
             <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
             <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-500">8.2k Engineers Active</span>
           </motion.div>
           
           <h1 className="text-4xl md:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-[0.9]">
             The <span className="text-emerald-500">Void</span> <br /> Laboratory.
           </h1>

           {/* Search */}
           <div className="max-w-md mx-auto relative group pt-2 md:pt-4">
             <div className="relative flex items-center bg-neutral-900/50 border border-white/10 rounded-2xl p-1 transition-all focus-within:border-emerald-500/50 focus-within:bg-neutral-900">
               <Search className="ml-3 md:ml-4 h-4 w-4 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search logic module..." 
                 className="w-full bg-transparent border-none focus:ring-0 px-3 md:px-4 py-2.5 md:py-3 text-white text-xs md:text-sm font-medium outline-none placeholder:text-neutral-600"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </div>
        </section>

        {/* --- Filter Tabs --- */}
        <div className="sticky top-0 md:top-20 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-3 md:py-4 bg-black/80 backdrop-blur-xl border-y border-white/5 mb-6 md:mb-10">
          <div className="flex items-center gap-2 md:gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-w-7xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                  "px-4 py-2 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border flex-shrink-0",
                  activeTab === cat 
                    ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                    : "bg-neutral-900/40 text-neutral-400 border-white/5 hover:text-white hover:bg-neutral-900"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Game Matrix --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-24">
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
                  <Card className="h-full bg-neutral-900/20 backdrop-blur-md border border-white/5 group-hover:border-emerald-500/30 transition-all duration-500 rounded-[1.25rem] md:rounded-3xl overflow-hidden flex flex-col hover:bg-neutral-900/40">
                    
                    {/* Thumbnail: 16:9 Aspect Ratio */}
                    <div className="relative w-full aspect-video overflow-hidden border-b border-white/5 bg-neutral-900">
                      
                      {/* Gradient Fallback */}
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity duration-700", game.bg)} />
                      
                      <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      {/* Floating UI Elements */}
                      <div className="absolute top-2 right-2 md:top-3 md:right-3">
                        <Badge className={cn(
                          "backdrop-blur-xl border border-white/10 px-1.5 py-0.5 md:px-2 md:py-0.5 text-[6px] md:text-[9px] font-bold uppercase tracking-widest",
                          game.difficulty === 'Expert' ? "bg-red-500/20 text-red-400" : 
                          game.difficulty === 'Hard' ? "bg-orange-500/20 text-orange-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        )}>
                          {game.difficulty}
                        </Badge>
                      </div>

                      <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3">
                         <div className={cn("p-1.5 md:p-2 rounded-lg md:rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg text-white", game.color)}>
                            <div className="scale-75 md:scale-100">
                                {React.cloneElement(game.icon as any, { size: 16 })}
                            </div>
                         </div>
                      </div>
                    </div>

                    <CardContent className="p-3.5 md:p-5 flex-1 flex flex-col">
                      <div className="space-y-1 mb-2 md:mb-4">
                          <p className="text-[7px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1 md:gap-1.5">
                             <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-emerald-500 transition-colors"></span>
                             {game.category}
                          </p>
                          <CardTitle className="text-[11px] md:text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors leading-tight line-clamp-1 md:line-clamp-none">
                            {game.title}
                          </CardTitle>
                          <p className="text-[9px] md:text-xs text-neutral-400 font-medium leading-snug line-clamp-2">
                            {game.description}
                          </p>
                      </div>
                      
                      <div className="mt-auto pt-3 md:pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1 md:gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Activity className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                          <span className="text-[8px] md:text-[10px] font-mono text-neutral-300">{game.stats}</span>
                        </div>
                        <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                            <ArrowUpRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}