"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import api from "@/config/api";
import Footer from "@/components/Footer";
import Link from "next/link";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CONFIG ---
const ASSETS = {
  crown: "/crown.png",
  gamepad: "/gamepad.png",
  badges: {
    basic: "/badges/basic.png",
    master: "/badges/master.png",
    legendary: "/badges/legendary.png",
  }
};

type BadgeTier = "basic" | "master" | "legendary";

interface BadgeItem {
  id: string;
  tier: BadgeTier;
  name: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  avatarUrl: string;
  totalXP: number;
  badges: BadgeItem[];
  isCurrentUser?: boolean;
}

interface ApiUserResponse {
  position: number;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  xp: number;
  badge: string;
}

// --- MAIN CLIENT COMPONENT ---
export default function LeaderboardClient({ initialData }: { initialData: LeaderboardUser[] }) {
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>(initialData);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(initialData.length === 0);

  const mapApiUserToUi = (apiUser: ApiUserResponse, currentUserId: string): LeaderboardUser => {
    const tier = (ASSETS.badges[apiUser.badge as BadgeTier] ? apiUser.badge : 'basic') as BadgeTier;
    return {
      rank: apiUser.position,
      name: apiUser.name,
      username: apiUser.username,
      avatarUrl: apiUser.avatar,
      totalXP: apiUser.xp,
      badges: [{
        id: `badge-${apiUser.userId}`,
        tier: tier,
        name: apiUser.badge.charAt(0).toUpperCase() + apiUser.badge.slice(1)
      }],
      isCurrentUser: apiUser.userId === currentUserId
    };
  };

  useEffect(() => {
    const hydrateUserData = async () => {
      let storedUserId = "";
      try {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
          const user = JSON.parse(userRaw);
          storedUserId = user?._id || "";
        }
      } catch (e) { console.error(e); }

      if (storedUserId) {
        try {
          const res = await api.post("/users/get-groble-leaderboard", { userId: storedUserId });
          if (res.data && res.data.success) {
            const rawLeaderboard: ApiUserResponse[] = res.data.leaderboard || [];
            const rawCurrentUser: ApiUserResponse | null = res.data.currentUserRank;

            setLeaderboardData(rawLeaderboard.map(user => mapApiUserToUi(user, storedUserId)));

            if (rawCurrentUser) {
              setCurrentUser(mapApiUserToUi(rawCurrentUser, storedUserId));
            }
          }
        } catch (error) {
          console.error("Personal Rank Fetch Error", error);
        }
      }
      setIsLoading(false);
    };

    hydrateUserData();
  }, []);

  const podiumOrder = useMemo(() => {
    if (leaderboardData.length === 0) return [];
    const first = leaderboardData[0];
    const second = leaderboardData[1];
    const third = leaderboardData[2];
    const result = [];
    if (second) result.push(second);
    if (first) result.push(first);
    if (third) result.push(third);
    return result;
  }, [leaderboardData]);

  const listUsers = useMemo(() => leaderboardData.slice(3), [leaderboardData]);
  
  const showStickyFooter = currentUser && currentUser.rank > 13;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-red-500/30">
      
      <MobileBottomNav />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-red-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-40 relative z-10 max-w-5xl">
        
        {/* Header with CTA */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-2xl mb-4">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Ranking</span>
          </h1>
          
          {/* Gamified CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 p-[1px] rounded-2xl">
              <div className="bg-neutral-900/90 backdrop-blur-xl rounded-2xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
                        <span className="text-2xl md:text-3xl">🎮</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-neutral-900 animate-ping" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs md:text-sm text-neutral-400 uppercase tracking-wider">Want to climb the ranks?</p>
                      <p className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                        Play Games & Earn XP!
                      </p>
                    </div>
                  </div>
                  
                  <Link href="/games">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-black text-sm md:text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-300 w-full md:w-auto"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Play Now
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                    </motion.button>
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            {/* 3D Podium */}
            {podiumOrder.length > 0 && (
              <div className="flex justify-center items-end gap-3 md:gap-8 mb-16 h-[340px] md:h-[420px] mt-12">
                {podiumOrder.map((user) => (
                  <PodiumItem key={user.rank} user={user} position={user.rank} />
                ))}
              </div>
            )}

            {/* Leaderboard List */}
            <motion.div 
              layout
              className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
              
              <div className="grid grid-cols-12 gap-2 p-4 border-b border-white/5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-6 md:col-span-5">Player</div>
                <div className="col-span-4 md:col-span-3 text-right pr-4">XP</div>
                <div className="hidden md:block md:col-span-2 text-center">Badges</div>
              </div>

              <div className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {listUsers.map((user) => (
                    <LeaderboardRow key={user.rank} user={user} />
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="p-4 text-center text-xs text-neutral-600 font-mono uppercase tracking-widest">
                — Top Players —
              </div>
            </motion.div>

            {/* Bottom CTA for Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 md:hidden"
            >
              <Link href="/games">
                <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2">
                  <span>🎮</span>
                  Play Games to Earn More XP
                  <span>→</span>
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </div>

      {/* Sticky Footer */}
      <AnimatePresence>
        {showStickyFooter && currentUser && (
          <CurrentUserFooter user={currentUser} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

const MobileBottomNav = () => (
  <nav className="md:hidden fixed bottom-0 w-full h-[70px] bg-[#0a0a0a] border-t border-white/10 z-[100] grid grid-cols-4 items-center justify-items-center">
    <Link href="/" className="text-neutral-500 flex flex-col items-center gap-1">
      <div className="w-5 h-5 bg-neutral-600 rounded-sm" />
      <span className="text-[10px]">Home</span>
    </Link>
    <Link href="/leaderboard" className="text-red-500 flex flex-col items-center gap-1">
      <div className="w-5 h-5 bg-red-500 rounded-sm" />
      <span className="text-[10px]">Rank</span>
    </Link>
    <Link href="/games" className="text-neutral-500 flex flex-col items-center gap-1 relative">
      <div className="w-5 h-5 bg-neutral-600 rounded-sm" />
      <span className="text-[10px]">Games</span>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
    </Link>
    <Link href="/profile" className="text-neutral-500 flex flex-col items-center gap-1">
      <div className="w-5 h-5 bg-neutral-600 rounded-sm" />
      <span className="text-[10px]">Profile</span>
    </Link>
  </nav>
);

const PodiumItem = ({ user, position }: { user: LeaderboardUser; position: number }) => {
  const isFirst = position === 1;
  const isSecond = position === 2;
  const styles = {
    height: isFirst ? "h-48 md:h-64" : isSecond ? "h-36 md:h-48" : "h-24 md:h-32",
    width: "w-24 md:w-36",
    barGradient: isFirst 
      ? "bg-gradient-to-t from-yellow-900 via-yellow-600 to-yellow-400 border-yellow-500" 
      : isSecond 
      ? "bg-gradient-to-t from-slate-800 via-slate-600 to-slate-400 border-slate-400" 
      : "bg-gradient-to-t from-orange-900 via-orange-700 to-orange-500 border-orange-600",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      className={cn("flex flex-col items-center group relative", styles.width, isFirst ? "z-20" : "z-10")}
    >
      <div className="flex flex-col items-center mb-3 relative w-full">
        {isFirst && (
          <motion.img 
            src={ASSETS.crown}
            alt="Crown"
            animate={{ y: [0, -10, 0], rotate: [0, -5, 0, 5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
            className="z-20 w-10 h-10 md:w-16 md:h-16 absolute -top-12 md:-top-16 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"
          />
        )}

        <div className={cn("rounded-full p-1 bg-gradient-to-b relative", 
          isFirst ? "from-yellow-300 to-yellow-700" : isSecond ? "from-slate-300 to-slate-700" : "from-orange-300 to-orange-700"
        )}>
          <img src={user.avatarUrl} alt={user.name} className="rounded-full bg-neutral-900 object-cover w-12 h-12 md:w-20 md:h-20" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neutral-900 border border-white/20 px-2 rounded-full shadow-lg">
            <span className={cn("text-[10px] md:text-xs font-black", isFirst ? "text-yellow-400" : "text-white")}>#{position}</span>
          </div>
        </div>
        
        <div className="mt-4 text-center w-full">
          <p className={cn("text-[10px] md:text-sm font-bold truncate px-1", user.isCurrentUser ? "text-red-400" : "text-white")}>
            {user.isCurrentUser ? "You" : user.name}
          </p>
          <div className="flex justify-center gap-2 mt-2">
            {user.badges.slice(0, 3).map((b) => (
              <div key={b.id} className="relative group/badge">
                <img src={ASSETS.badges[b.tier]} className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] hover:scale-125 transition-transform" title={b.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={cn("w-full rounded-t-lg relative border-t-4 border-x border-white/10 overflow-hidden", styles.height, styles.barGradient)}>
        <div className="absolute inset-0 bg-white/20 opacity-30" />
        <div className="absolute bottom-2 inset-x-0 text-center text-white/20 font-black text-4xl md:text-6xl italic">{position}</div>
      </div>
    </motion.div>
  );
};

const LeaderboardRow = ({ user }: { user: LeaderboardUser }) => {
  const isMe = user.isCurrentUser;
  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "grid grid-cols-12 gap-2 p-4 md:p-5 items-center transition-all duration-300 group relative",
        isMe ? "bg-red-900/10 border-l-2 border-red-500" : "hover:bg-white/5 border-l-2 border-transparent"
      )}
    >
      <div className={cn("col-span-2 text-center font-black text-sm md:text-lg", isMe ? "text-red-500" : "text-neutral-500")}>{user.rank}</div>

      <div className="col-span-6 md:col-span-5 flex items-center gap-3 md:gap-4">
        <div className="relative">
          <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10 bg-neutral-800 object-cover" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={cn("font-bold text-xs md:text-base truncate", isMe ? "text-red-400" : "text-white")}>{isMe ? "You" : user.name}</span>
          <span className="text-[10px] text-neutral-500 md:hidden">{user.totalXP} XP</span>
        </div>
      </div>

      <div className="col-span-4 md:col-span-3 text-right pr-4 font-mono font-bold text-red-500/90 text-xs md:text-base">
        {user.totalXP.toLocaleString()} <span className="text-neutral-600 text-[10px]">XP</span>
      </div>

      <div className="hidden md:flex col-span-2 justify-center items-center gap-2">
        {user.badges.map((badge) => (
          <div key={badge.id} className="relative p-1 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors" title={badge.name}>
            <img src={ASSETS.badges[badge.tier]} alt={badge.name} className="w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-md hover:scale-125 transition-transform cursor-help" />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const CurrentUserFooter = ({ user }: { user: LeaderboardUser }) => {
  return (
    <motion.div 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="fixed bottom-[70px] md:bottom-0 inset-x-0 z-40"
    >
      <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-t-2 border-red-600 shadow-[0_-10px_40px_rgba(220,38,38,0.3)] py-3 px-4 md:py-4 md:px-8">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col items-center justify-center bg-neutral-900 rounded-lg w-10 h-10 md:w-14 md:h-14 border border-red-500/30">
              <span className="text-[8px] uppercase text-neutral-500 font-bold">Rank</span>
              <span className="text-sm md:text-xl font-black text-white">{user.rank}</span>
            </div>
            <div className="flex items-center gap-3">
              <img src={user.avatarUrl} className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-red-500 object-cover" />
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm md:text-base">You</span>
                <div className="flex gap-2 mt-1">
                  {user.badges.map(b => (
                    <img key={b.id} src={ASSETS.badges[b.tier]} className="w-5 h-5 md:w-6 md:h-6 object-contain drop-shadow-sm hover:scale-125 transition-transform" title={b.name} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">XP</span>
            <span className="font-black text-lg md:text-3xl text-red-500">{user.totalXP}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}