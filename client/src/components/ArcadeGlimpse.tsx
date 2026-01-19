"use client";

import React from "react";
import { 
  Gamepad2, Binary, Terminal, Zap, 
  ArrowRight, Cpu, Activity, Sparkles, 
  Play, ShieldAlert, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Updated with image paths from your collection
const PREVIEW_GAMES = [
  { 
    id: "binary-blitz", 
    title: "Binary Blitz", 
    category: "Logic", 
    difficulty: "Med", 
    color: "text-blue-500", 
    icon: <Binary size={20} />,
    image: "./games_thumb/binary-blitz.webp"
  },
  { 
    id: "complexity-dash", 
    title: "Complexity Dash", 
    category: "CS Core", 
    difficulty: "Expert", 
    color: "text-red-500", 
    icon: <Terminal size={20} />,
    image: "./games_thumb/complexity-dash.webp"
  },
  { 
    id: "circuit-breaker", 
    title: "Circuit Breaker", 
    category: "Hardware", 
    difficulty: "Hard", 
    color: "text-orange-500", 
    icon: <Zap size={20} />,
    image: "./games_thumb/circuit-breaker.webp"
  },
];

export default function ArcadeGlimpse() {
  return (
    <section className="py-24 bg-[#000000] relative overflow-hidden border-t border-white/5">
      {/* Ambient Red Glow for Depth */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/5 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.4em]"
            >
              <Gamepad2 size={12} /> Neural Training Lab
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
              THE <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">ARCADE</span>
            </h2>
            <p className="text-neutral-500 max-w-lg font-medium text-lg">
              Stop studying, start playing. Build muscle memory for complex engineering concepts through high-speed arcade modules.
            </p>
          </div>

          <Link href="/games">
            <Button className="h-16 px-10 bg-white text-black hover:bg-red-600 hover:text-white rounded-2xl font-black uppercase italic transition-all shadow-2xl active:scale-95 group">
              Enter The Void <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* --- The Tactical Preview Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PREVIEW_GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative bg-neutral-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-red-600/40 shadow-2xl flex flex-col"
            >
              {/* Image Header: Enforced 16:9 Aspect Ratio */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 border-b border-white/5">
                <img 
                  src={game.image} 
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                
                {/* Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Floating Difficulty Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/10 bg-black/60 backdrop-blur-md px-3 py-1 text-white">
                    {game.difficulty}
                  </Badge>
                </div>

                {/* Floating Category Icon */}
                <div className={cn(
                  "absolute bottom-4 left-4 p-3 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl transition-all duration-500",
                  game.color
                )}>
                  {game.icon}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-8 relative z-10 flex flex-col flex-grow">
                {/* Scanline Effect Overlay (Visible on Hover) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,#dc2626_50%)] bg-[size:100%_4px]" />

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-red-600/50 tracking-[0.2em]">{game.category}</p>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-red-500 transition-colors leading-tight">
                    {game.title}
                  </h3>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-neutral-700 group-hover:text-red-500 transition-colors" />
                    <span className="text-[9px] font-black uppercase text-neutral-800 group-hover:text-neutral-500 tracking-widest">Active Link</span>
                  </div>
                  <Play size={16} className="text-neutral-800 group-hover:text-red-500 transition-all group-hover:scale-110 fill-transparent group-hover:fill-red-500" />
                </div>
              </div>

              {/* Invisible Link Wrapper */}
              <Link href={`/games/${game.id}`} className="absolute inset-0 z-30" />
            </motion.div>
          ))}
        </div>

        {/* --- Psychological Status Bar --- */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-12 text-[9px] font-black text-neutral-800 uppercase tracking-[0.4em]">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-red-600/20" />
            <span>9 Ready Modules</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-red-600/20" />
            <span>1.4k Active Players</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-red-600/20" />
            <span>Latency: 0.8ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-red-600/20" />
            <span>V-Engine 4.0</span>
          </div>
        </div>
      </div>
    </section>
  );
}