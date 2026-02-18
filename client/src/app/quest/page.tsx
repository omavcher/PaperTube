"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Check, 
  Flame, 
  Sparkles, 
  Zap, 
  Brain, 
  ChevronRight, 
  Target,
  ArrowRight,
  Users
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- Mock Data ---
const leaderboardData = [
  { id: 1, name: "Alex Conesher", handle: "@quest_master", score: "7520 XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
  { id: 2, name: "Nel Reibarto", handle: "@ny_research", score: "2490 XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2", isCurrentUser: true },
  { id: 3, name: "Sarah Jenkins", handle: "@sarah_ai", score: "2130 XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" },
  { id: 4, name: "Sarno Raeborn", handle: "@campus_lead", score: "2150 XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4" },
  { id: 5, name: "Noi Guather", handle: "@dev_booster", score: "2010 XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5" },
];

export default function QuestPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neutral-800 selection:text-white pb-20">
      
      {/* --- Background Atmosphere --- */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
        
        {/* --- Top Utility Bar --- */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
            Neural Training Active
          </div>
          
          <Link href='/games' className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-[10px] font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500/10 transition-all">
            <Trophy size={14} /> 
            <span>Play Quiz for 2x XP</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* --- Hero Section: Streak & Stats --- */}
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left: Streak Indicator */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="relative">
                {/* Subtle Neural Glow */}
                <div className="absolute -inset-20 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="space-y-4 relative">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none">
                      05 Day <br />
                      <span className="text-white">Synapse.</span>
                    </h1>
                    <p className="text-lg text-neutral-500 font-light max-w-md">
                      Your neural consistency is at <span className="text-white">98.4%</span>. Maintain your daily streak to unlock advanced AI models.
                    </p>
                </div>
            </div>
          </motion.div>

          {/* Right: Leaderboard Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Regional Ranking</h3>
                    <Users size={14} className="text-neutral-600" />
                </div>

                <div className="space-y-2">
                  {leaderboardData.map((user, index) => (
                    <div key={user.id} className={cn(
                      "flex items-center justify-between p-3 rounded-2xl transition-all group", 
                      user.isCurrentUser ? "bg-white/5 border border-white/10" : "hover:bg-white/5"
                    )}>
                      <div className="flex items-center gap-4">
                        <span className={cn("text-[10px] font-bold w-4 text-center", index < 3 ? "text-white" : "text-neutral-600")}>
                          0{index + 1}
                        </span>
                        <Avatar className="h-10 w-10 border border-white/5 grayscale group-hover:grayscale-0 transition-all">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className={cn("text-xs font-bold uppercase tracking-tight", user.isCurrentUser ? "text-white" : "text-neutral-300")}>{user.name}</span>
                          <span className="text-[9px] font-medium text-neutral-600 group-hover:text-neutral-400 transition-colors">{user.handle}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{user.score}</span>
                    </div>
                  ))}
                </div>
            </div>
          </motion.div>
        </div>

        {/* --- Bottom Objective Card --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-neutral-900/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative"
        >
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8 w-full">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                    <Brain size={14} /> Priority Objective
                </div>
                <h3 className="text-4xl font-bold text-white tracking-tight">Daily Synthesis</h3>
                <p className="text-neutral-500 text-sm font-light leading-relaxed max-w-lg">
                  Initialize your daily learning protocol. Convert your first video to notes today to synchronize with the global quester network.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Synapse Progress</span>
                    <span className="text-xs font-mono text-white">1,350 / 2,000 XP</span>
                </div>
                <Progress value={65} className="h-1.5 bg-neutral-900 border border-white/5" indicatorClassName="bg-white" />
              </div>

              <Link href='/games' className="group w-full md:w-auto bg-white text-black h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Execute Training
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mystery Reward Component (Code Only - No Images) */}
            <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative group cursor-pointer">
                   {/* Radial Pulse Effect */}
                   <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-all duration-700" />
                   
                   <div className="relative w-56 h-56 rounded-[3rem] flex items-center justify-center transform transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-1">
                    <img src="/gift-box.png" alt="Mystery Box" className="relative w-98 h-98 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]" />
                      
                      {/* Floating Sparkles */}
                      <Sparkle className="-top-4 -left-4" delay={0} />
                      <Sparkle className="top-1/4 -right-6" delay={0.7} />
                      <Sparkle className="bottom-0 left-4" delay={1.4} size={10} />
                   </div>
                </div>
                <h3 className="mt-8 text-xs font-bold uppercase tracking-[0.4em] text-neutral-400">
                   Neural Cache
                </h3>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// --- Visual Sub-Components ---

const Sparkle = ({ className, delay = 0, size = 14 }: { className?: string, delay?: number, size?: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
    className={cn("absolute text-white pointer-events-none opacity-40", className)}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  </motion.div>
);