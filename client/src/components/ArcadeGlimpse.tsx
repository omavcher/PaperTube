"use client";

import React from "react";
import { 
  Gamepad2, 
  Binary, 
  Terminal, 
  Zap, 
  ArrowRight, 
  Cpu, 
  Activity, 
  Play, 
  ShieldCheck, 
  TrendingUp,
  Brain,
  Code2,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- Configuration ---
const PREVIEW_GAMES = [
  { 
    id: "binary-blitz", 
    title: "Binary Blitz", 
    category: "Logic", 
    difficulty: "Medium", 
    color: "text-blue-400", 
    icon: <Binary size={20} />,
    image: "/games_thumb/binary-blitz.webp", // Replace with your image path
    accent: "blue"
  },
  { 
    id: "complexity-dash", 
    title: "Complexity Dash", 
    category: "CS Core", 
    difficulty: "Expert", 
    color: "text-red-400", 
    icon: <Terminal size={20} />,
    image: "/games_thumb/complexity-dash.webp", // Replace with your image path
    accent: "red"
  },
  { 
    id: "circuit-breaker", 
    title: "Circuit Breaker", 
    category: "Hardware", 
    difficulty: "Hard", 
    color: "text-yellow-400", 
    icon: <Zap size={20} />,
    image: "/games_thumb/circuit-breaker.webp", // Replace with your image path
    accent: "yellow"
  },
];

export default function ArcadeGlimpse() {
  return (
    <section className="py-24 bg-black relative overflow-hidden border-t border-white/5">
      
      {/* --- Background Atmosphere --- */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="space-y-6 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400"
            >
              <Gamepad2 size={12} className="text-white" /> 
              <span>Neural Training Lab</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none"
            >
              The <span className="text-white">Arcade.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 font-light leading-relaxed max-w-lg"
            >
              Stop studying, start playing. Build muscle memory for complex engineering concepts through high-speed neural modules.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <Link href="/games">
              <Button className="group bg-white text-black hover:bg-neutral-200 rounded-2xl h-14 px-8 font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Enter The Void <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* --- The Games Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREVIEW_GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-white/10 hover:bg-neutral-900/60 shadow-2xl flex flex-col"
            >
              <Link href={`/games/${game.id}`} className="absolute inset-0 z-30" />

              {/* Image Container (16:9 Aspect Ratio) */}
              <div className="relative w-full aspect-video overflow-hidden bg-black border-b border-white/5">
                <div className="absolute inset-0 bg-neutral-800 animate-pulse" /> {/* Placeholder while loading */}
                <img 
                  src={game.image} 
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                   <Badge variant="outline" className="border-white/10 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                      {game.difficulty}
                   </Badge>
                </div>

                {/* Icon Badge */}
                <div className="absolute bottom-4 left-4 z-20">
                   <div className={cn(
                     "p-2.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white shadow-lg",
                     game.color
                   )}>
                      {game.icon}
                   </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 relative z-10 flex flex-col flex-grow">
                
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 group-hover:bg-white transition-colors"></span>
                     <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest group-hover:text-neutral-400 transition-colors">{game.category}</p>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform">
                    {game.title}
                  </h3>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Activity size={14} className="text-green-500" />
                    <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Online</span>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Play size={12} className="ml-0.5 fill-current" />
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-8 md:hidden">
            <Link href="/games" className="block w-full">
                <Button className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-2xl font-bold uppercase tracking-widest text-xs">
                   Enter The Void
                </Button>
            </Link>
        </div>

        {/* --- Stats Footer --- */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-20 border-t border-white/5 pt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
        >
          <StatItem icon={Cpu} label="9 Simulation Modules" />
          <StatItem icon={TrendingUp} label="1.4k Active Players" />
          <StatItem icon={ShieldCheck} label="0.8ms Latency" />
        </motion.div>

      </div>
    </section>
  );
}

// Helper for Footer Stats
const StatItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-3 text-neutral-500 group cursor-default hover:text-white transition-colors">
    <Icon size={14} className="text-neutral-600 group-hover:text-white transition-colors" />
    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
  </div>
);