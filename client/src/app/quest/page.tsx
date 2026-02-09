"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Check, Gift, Flame, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const leaderboardData = [
  { id: 1, name: "Alex Conesher", handle: "@dQuestMaster", score: "7520XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
  { id: 2, name: "Nel Reibarto", handle: "@NY Questing", score: "2490XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2", isCurrentUser: true },
  { id: 3, name: "Sarah", handle: "Online Friend", score: "2130XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" },
  { id: 4, name: "Sarno Raeborn", handle: "Campus Friend", score: "2150XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4" },
  { id: 5, name: "Noi Guather", handle: "Dev Booster", score: "2010XP", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5" },
];

export default function QuestPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden relative font-sans selection:bg-red-900/50 pb-20">
      
      {/* --- Tactical Background Effects --- */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black pointer-events-none" />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-900/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 py-10 relative z-10 max-w-6xl">
        
        {/* --- Top Utility Bar --- */}
        <div className="w-full flex justify-center lg:justify-start mb-8">
           <Button variant="outline" className="bg-yellow-500/5 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400 gap-2 h-12 rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-lg shadow-yellow-500/5">
              <Trophy size={16} /> Play Mini-Quiz for 2x XP
            </Button>
        </div>

        {/* --- Main Hero Section: Side-by-Side on Large Screens --- */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 mb-24">
          
          {/* Left Side: Streak Indicator */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-20 relative"
          >
            <div className="absolute inset-0 bg-red-600/10 blur-[100px] rounded-full scale-150 pointer-events-none" />
            
            <div className="relative inline-flex flex-col items-center lg:items-start">
               <div className="relative">
                 <Flame size={200} className="text-orange-500 fill-orange-600 drop-shadow-[0_0_40px_rgba(234,88,12,0.6)] animate-pulse" />
                 <div className="absolute inset-0 flex items-center justify-center pt-10">
                   <div className="bg-gradient-to-br from-red-600 to-red-800 w-20 h-20 rounded-full flex items-center justify-center border-[5px] border-orange-400/50 shadow-2xl">
                      <span className="text-4xl font-black italic text-white drop-shadow-md">x1</span>
                   </div>
                 </div>
               </div>
               
               <div className="mt-6 space-y-2">
                 <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                   <Flame size={12} className="animate-pulse" /> Protocol Active
                 </div>
                 <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
                  5-DAY <br className="hidden lg:block"/><span className="text-red-600">STREAK!</span>
                </h2>
               </div>
            </div>
          </motion.div>

          {/* Right Side: Leaderboard Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-sm"
          >
            <Card className="bg-neutral-950/50 backdrop-blur-xl border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
              <CardContent className="p-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-6 flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-600" /> Top Questers Today
                </h3>
                <div className="space-y-4">
                  {leaderboardData.map((user, index) => (
                    <div key={user.id} className={cn(
                      "flex items-center justify-between p-3 rounded-2xl transition-all", 
                      user.isCurrentUser ? "bg-red-600/10 border border-red-500/20 ring-1 ring-red-500/10" : "hover:bg-white/5"
                    )}>
                      <div className="flex items-center gap-4">
                        <span className={cn("font-black text-[11px] w-5 text-center", index < 3 ? "text-yellow-500" : "text-neutral-600")}>
                          {index + 1}
                        </span>
                        <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-neutral-900 text-[11px]">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className={cn("text-[12px] font-black uppercase italic tracking-tight", user.isCurrentUser ? "text-red-500" : "text-white")}>{user.name}</span>
                          <span className="text-[10px] font-bold text-neutral-500">{user.handle}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-black italic text-neutral-300">{user.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* --- Bottom Mission Card --- */}
        <Card className="bg-neutral-950/80 backdrop-blur-3xl border-emerald-500/20 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 space-y-8 w-full">
              <div className="space-y-3">
                <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">TODAY'S <span className="text-emerald-500">MISSION</span></h3>
                <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-lg">
                  Initialize the neural synthesis protocol by completing your daily assessment. Confirm the streak and synchronize with the global quester network.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sync Progress</span>
                    <span className="text-[12px] font-black italic text-emerald-500">1350 / 2000 XP</span>
                </div>
                <Progress value={65} className="h-3 bg-neutral-900 border border-white/5" indicatorClassName="bg-gradient-to-r from-emerald-600 to-emerald-400" />
              </div>

              <Button className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white h-16 px-12 rounded-2xl font-black uppercase italic tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all active:scale-95">
                 Execute Mission
              </Button>
            </div>

            {/* Mystery Box Component */}
            <div className="flex flex-col items-center justify-center shrink-0">
               <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-500/40 transition-all duration-500" />
                  <div className="relative w-64 h-64 bg-gradient-to-br from-emerald-900 to-teal-950 p-4 rounded-[3rem] border-2 border-emerald-500/30 shadow-2xl transform transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-2 flex justify-center items-center">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-[30px] rounded-full animate-pulse" />
                    <img src="/gift-box.png" alt="Mystery Box" className="relative w-48 h-48 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]" />
                  </div>
                  <Sparkle className="-top-4 -left-4" delay={0} />
                  <Sparkle className="top-1/4 -right-6" delay={0.7} />
                  <Sparkle className="bottom-0 left-4" delay={1.4} size={10} />
               </div>
               <h3 className="mt-8 text-2xl font-black italic uppercase tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 drop-shadow-lg">
                  Mystery Box
               </h3>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// --- Visual Sub-Components ---

const CheckPoint = ({ state, color }: { state: 'completed' | 'current' | 'locked', color: 'cyan' | 'orange' | 'red' }) => {
  const styles = {
    cyan: "text-cyan-400 bg-cyan-950/40 border-cyan-400/50 shadow-cyan-400/20",
    orange: "text-orange-400 bg-orange-950/40 border-orange-400/50 shadow-orange-400/20",
    red: "text-red-500 bg-red-950/40 border-red-500/50 shadow-red-500/40",
  };

  return (
    <div className={cn(
      "relative rounded-full p-4 border-[3px] flex items-center justify-center backdrop-blur-md z-20 transition-all duration-500 shadow-xl",
      styles[color],
      state === 'current' && "scale-125 ring-4 ring-red-500/20"
    )}>
        {state === 'current' && (
          <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping" />
        )}
        <Flame size={28} className={cn("transition-all", state === 'current' ? "fill-red-500" : "fill-transparent opacity-60")} />
        {state === 'completed' && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-black">
            <Check size={10} className="text-black font-black" strokeWidth={4} />
          </div>
        )}
    </div>
  );
};

const Sparkle = ({ className, delay = 0, size = 14 }: { className?: string, delay?: number, size?: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], rotate: [0, 90, 180] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
    className={cn("absolute text-emerald-300 pointer-events-none drop-shadow-lg", className)}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  </motion.div>
);