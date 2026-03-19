"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import api from "@/config/api";
import Link from "next/link";
import { Trophy, Zap, ArrowRight, Crown, Star, Medal } from "lucide-react";

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
    <section className="w-full min-h-screen relative flex flex-col items-center bg-black text-white font-sans selection:bg-neutral-800 selection:text-white overflow-x-hidden">

      {/* ── Background atmosphere (matches HomeMain) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black opacity-80" />
      <div className="fixed inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      {/* Red glow accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* ── Page Content ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-24 pb-44">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md shadow-lg mb-5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            Live Global Ranking
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2">
            Global{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              Leaderboard
            </span>
          </h1>
          <p className="text-neutral-500 text-sm md:text-base mt-3 font-medium">
            Compete, earn XP and climb the ranks.
          </p>
        </motion.div>

        {/* ── CTA Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 mb-14 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center shrink-0">
              <Zap className="text-red-500" size={22} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">Want to climb the ranks?</p>
              <p className="text-base md:text-lg font-black text-white tracking-tight">
                Play Games & Earn <span className="text-red-500">XP!</span>
              </p>
            </div>
          </div>
          <Link href="/games">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group w-full md:w-auto h-11 px-7 rounded-xl bg-white text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <span>Play Now</span> <ArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.div>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-red-500 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Loading Rankings...</p>
          </div>
        ) : (
          <>
            {/* ── Podium ── */}
            {podiumOrder.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center items-end gap-4 md:gap-8 mb-16 h-[320px] md:h-[400px] mt-4"
              >
                {podiumOrder.map((user) => (
                  <PodiumItem key={user.rank} user={user} position={user.rank} />
                ))}
              </motion.div>
            )}

            {/* ── Leaderboard Table ── */}
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Top red line accent */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-6 md:col-span-5">Player</div>
                <div className="col-span-4 md:col-span-3 text-right pr-4">XP Score</div>
                <div className="hidden md:block md:col-span-2 text-center">Badge</div>
              </div>

              <div className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {listUsers.map((user) => (
                    <LeaderboardRow key={user.rank} user={user} />
                  ))}
                </AnimatePresence>
              </div>

              <div className="px-5 py-4 text-center text-[10px] text-neutral-700 font-mono uppercase tracking-widest border-t border-white/5">
                — Top Players Worldwide —
              </div>
            </motion.div>

            {/* ── Mobile bottom CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 md:hidden"
            >
              <Link href="/games">
                <button className="w-full h-12 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] active:scale-95">
                  <Zap size={14} fill="currentColor" /> Play Games to Earn XP <ArrowRight size={14} />
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </div>

      {/* ── Sticky Current User Footer ── */}
      <AnimatePresence>
        {showStickyFooter && currentUser && (
          <CurrentUserFooter user={currentUser} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

const RANK_CONFIG: Record<number, { glow: string; ring: string; bar: string; label: string; icon: React.ReactNode }> = {
  1: {
    glow: "shadow-[0_0_40px_rgba(234,179,8,0.25)]",
    ring: "from-yellow-300 to-yellow-600",
    bar: "bg-gradient-to-t from-yellow-950 via-yellow-800/60 to-yellow-500/40 border-yellow-500/30",
    label: "text-yellow-400",
    icon: <Crown size={14} className="text-yellow-400" />,
  },
  2: {
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.2)]",
    ring: "from-slate-300 to-slate-600",
    bar: "bg-gradient-to-t from-slate-950 via-slate-700/60 to-slate-400/30 border-slate-500/30",
    label: "text-slate-300",
    icon: <Medal size={14} className="text-slate-400" />,
  },
  3: {
    glow: "shadow-[0_0_25px_rgba(251,146,60,0.2)]",
    ring: "from-orange-300 to-orange-700",
    bar: "bg-gradient-to-t from-orange-950 via-orange-800/60 to-orange-500/30 border-orange-600/30",
    label: "text-orange-400",
    icon: <Star size={14} className="text-orange-400" />,
  },
};

const PODIUM_HEIGHTS: Record<number, string> = {
  1: "h-44 md:h-60",
  2: "h-32 md:h-44",
  3: "h-20 md:h-28",
};

const PodiumItem = ({ user, position }: { user: LeaderboardUser; position: number }) => {
  const isFirst = position === 1;
  const cfg = RANK_CONFIG[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * position, duration: 0.5, ease: "easeOut" }}
      className={cn("flex flex-col items-center w-24 md:w-36", isFirst ? "z-20" : "z-10")}
    >
      {/* Avatar stack */}
      <div className="flex flex-col items-center mb-3 relative w-full">
        {isFirst && (
          <motion.img
            src={ASSETS.crown}
            alt="Crown"
            animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
            className="absolute -top-11 md:-top-14 left-1/2 -translate-x-1/2 z-20 w-9 h-9 md:w-14 md:h-14 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.7)]"
          />
        )}

        {/* Avatar ring */}
        <div className={cn(
          "rounded-full p-[2px] bg-gradient-to-b relative",
          cfg.ring, cfg.glow
        )}>
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="rounded-full bg-neutral-900 object-cover w-12 h-12 md:w-20 md:h-20"
          />
          {/* Rank badge on avatar */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            {cfg.icon}
            <span className={cn("text-[9px] md:text-[10px] font-black", cfg.label)}>#{position}</span>
          </div>
        </div>

        {/* Name & badges */}
        <div className="mt-4 text-center w-full">
          <p className={cn("text-[10px] md:text-sm font-bold truncate px-1", user.isCurrentUser ? "text-red-400" : "text-white")}>
            {user.isCurrentUser ? "You" : user.name}
          </p>
          <p className={cn("text-[9px] font-mono font-bold mt-0.5", cfg.label)}>
            {user.totalXP.toLocaleString()} XP
          </p>
          <div className="flex justify-center gap-1.5 mt-2">
            {user.badges.slice(0, 3).map((b) => (
              <img
                key={b.id}
                src={ASSETS.badges[b.tier]}
                className="w-5 h-5 md:w-7 md:h-7 object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] hover:scale-125 transition-transform"
                title={b.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Podium bar */}
      <div className={cn(
        "w-full rounded-t-xl border border-white/5 border-t-2 relative overflow-hidden",
        PODIUM_HEIGHTS[position], cfg.bar
      )}>
        <div className="absolute inset-0 bg-white/5" />
        <div className="absolute bottom-2 inset-x-0 text-center text-white/10 font-black text-4xl md:text-6xl italic select-none">
          {position}
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardRow = ({ user }: { user: LeaderboardUser }) => {
  const isMe = user.isCurrentUser;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "grid grid-cols-12 gap-2 px-5 py-4 md:py-5 items-center transition-all duration-200 group relative",
        isMe
          ? "bg-red-500/5 border-l-2 border-red-500"
          : "hover:bg-white/[0.03] border-l-2 border-transparent"
      )}
    >
      {/* Rank */}
      <div className={cn(
        "col-span-2 text-center font-mono font-black text-sm md:text-base",
        isMe ? "text-red-500" : "text-neutral-600"
      )}>
        {user.rank}
      </div>

      {/* Player */}
      <div className="col-span-6 md:col-span-5 flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border bg-neutral-800",
              isMe ? "border-red-500/50" : "border-white/10"
            )}
          />
          {isMe && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={cn("font-bold text-xs md:text-sm truncate", isMe ? "text-red-400" : "text-white group-hover:text-neutral-200 transition-colors")}>
            {isMe ? "You" : user.name}
          </span>
          <span className="text-[9px] text-neutral-600 font-mono truncate">@{user.username}</span>
        </div>
      </div>

      {/* XP */}
      <div className="col-span-4 md:col-span-3 text-right pr-4">
        <span className={cn("font-mono font-black text-sm md:text-base", isMe ? "text-red-400" : "text-neutral-300 group-hover:text-white transition-colors")}>
          {user.totalXP.toLocaleString()}
        </span>
        <span className="text-neutral-700 text-[9px] ml-1 font-bold uppercase">XP</span>
      </div>

      {/* Badges */}
      <div className="hidden md:flex col-span-2 justify-center items-center gap-1.5">
        {user.badges.map((badge) => (
          <div
            key={badge.id}
            className="p-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            title={badge.name}
          >
            <img
              src={ASSETS.badges[badge.tier]}
              alt={badge.name}
              className="w-7 h-7 object-contain hover:scale-125 transition-transform cursor-help"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const CurrentUserFooter = ({ user }: { user: LeaderboardUser }) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 22, stiffness: 120 }}
      className="fixed bottom-0 inset-x-0 z-50"
    >
      <div className="bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_60px_rgba(0,0,0,0.8)] py-3 px-4 md:py-4 md:px-8">
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Rank bubble */}
            <div className="flex flex-col items-center justify-center bg-neutral-900/80 border border-white/10 rounded-xl w-11 h-11 md:w-14 md:h-14 shrink-0">
              <span className="text-[8px] uppercase text-neutral-600 font-black tracking-widest leading-none mb-0.5">RANK</span>
              <span className="text-sm md:text-xl font-black text-white font-mono">{user.rank}</span>
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-red-500/60 object-cover shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm md:text-base">You</span>
                <div className="flex gap-1.5 mt-1">
                  {user.badges.map(b => (
                    <img key={b.id} src={ASSETS.badges[b.tier]} className="w-4 h-4 md:w-5 md:h-5 object-contain" title={b.name} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* XP */}
          <div className="text-right shrink-0">
            <span className="block text-[9px] text-neutral-600 font-black uppercase tracking-widest mb-0.5">Total XP</span>
            <span className="font-black text-xl md:text-3xl text-red-500 font-mono">{user.totalXP.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};