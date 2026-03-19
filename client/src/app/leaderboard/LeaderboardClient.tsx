"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import api from "@/config/api";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Trophy, Zap, ArrowRight, Crown, Gamepad2, Medal } from "lucide-react";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CONFIG (unchanged) ---
const ASSETS = {
  crown: "/crown.png",
  gamepad: "/gamepad.png",
  badges: {
    basic: "/badges/basic.png",
    master: "/badges/master.png",
    legendary: "/badges/legendary.png",
  },
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

// ─── Rank medal color palette matching site's red accent ─────────────────────
const RANK_STYLES = {
  1: {
    bar: "from-yellow-950 via-yellow-700 to-yellow-400",
    border: "border-yellow-500/60",
    ring: "from-yellow-300 to-yellow-600",
    text: "text-yellow-400",
    glow: "rgba(234,179,8,0.4)",
    label: "CHAMPION",
    height: "h-52 md:h-64",
  },
  2: {
    bar: "from-slate-900 via-slate-600 to-slate-300",
    border: "border-slate-400/50",
    ring: "from-slate-200 to-slate-500",
    text: "text-slate-300",
    glow: "rgba(148,163,184,0.3)",
    label: "RUNNER-UP",
    height: "h-36 md:h-48",
  },
  3: {
    bar: "from-orange-950 via-orange-700 to-orange-500",
    border: "border-orange-500/50",
    ring: "from-orange-300 to-orange-600",
    text: "text-orange-400",
    glow: "rgba(249,115,22,0.3)",
    label: "THIRD",
    height: "h-24 md:h-36",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLIENT COMPONENT — logic preserved exactly, only visuals changed
// ─────────────────────────────────────────────────────────────────────────────
export default function LeaderboardClient({ initialData }: { initialData: LeaderboardUser[] }) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>(initialData);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(initialData.length === 0);

  const mapApiUserToUi = (apiUser: ApiUserResponse, currentUserId: string): LeaderboardUser => {
    const tier = (ASSETS.badges[apiUser.badge as BadgeTier] ? apiUser.badge : "basic") as BadgeTier;
    return {
      rank: apiUser.position,
      name: apiUser.name,
      username: apiUser.username,
      avatarUrl: apiUser.avatar,
      totalXP: apiUser.xp,
      badges: [{ id: `badge-${apiUser.userId}`, tier, name: apiUser.badge.charAt(0).toUpperCase() + apiUser.badge.slice(1) }],
      isCurrentUser: apiUser.userId === currentUserId,
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
            setLeaderboardData(rawLeaderboard.map((user) => mapApiUserToUi(user, storedUserId)));
            if (rawCurrentUser) setCurrentUser(mapApiUserToUi(rawCurrentUser, storedUserId));
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
    const [first, second, third] = leaderboardData;
    const result = [];
    if (second) result.push(second);
    if (first)  result.push(first);
    if (third)  result.push(third);
    return result;
  }, [leaderboardData]);

  const listUsers = useMemo(() => leaderboardData.slice(3), [leaderboardData]);
  const showStickyFooter = currentUser && currentUser.rank > 13;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-900/40">

      {/* ── Background — matches HomeMain exactly ──────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at top, rgba(23,23,23,0.6) 0%, black 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Red atmosphere glow — same as site hero */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(220,38,38,0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-40 max-w-5xl">

        {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center mb-10"
        >
          {/* Status badge — identical pattern to HomeMain */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-neutral-900/80 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: "0 0 6px #ef4444" }} />
            Global Rankings — Live
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] pb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400">
              Global{" "}
            </span>
            <span
              className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700"
              style={{ filter: "drop-shadow(0 0 20px rgba(220,38,38,0.3))" }}
            >
              Leaderboard
            </span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-neutral-500 font-medium max-w-md mx-auto">
            Compete globally. Earn XP. Rise to the top.
          </p>
        </motion.div>

        {/* ── GAMIFIED CTA CARD — matching the HomeMain card style ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="mb-14"
        >
          <div
            className="w-full bg-neutral-900/60 border border-white/10 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl"
            style={{ backdropFilter: "blur(12px)" }}
          >
            {/* Left side */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center">
                  <Gamepad2 size={26} className="text-red-400" />
                </div>
                {/* Live indicator */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5">
                  Want to climb the ranks?
                </p>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  Play Games &amp; Earn XP!
                </p>
              </div>
            </div>

            {/* CTA button — matches site's primary button */}
            <Link href="/games">
              <button className="group w-full md:w-auto h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] active:scale-95">
                <Zap size={15} fill="currentColor" />
                Play Now
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ── LOADING STATE ───────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-2 border-t-red-500 border-white/10 rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold font-mono">
              Fetching Rankings...
            </p>
          </div>
        ) : (
          <>
            {/* ── PODIUM ──────────────────────────────────────────────────── */}
            {podiumOrder.length > 0 && (
              <div className="flex justify-center items-end gap-4 md:gap-10 mb-16 mt-8 h-[360px] md:h-[440px]">
                {podiumOrder.map((user) => (
                  <PodiumItem key={user.rank} user={user} position={user.rank} />
                ))}
              </div>
            )}

            {/* ── LEADERBOARD LIST ─────────────────────────────────────────── */}
            <motion.div
              layout
              className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
              style={{ background: "rgba(10,10,10,0.80)", backdropFilter: "blur(12px)" }}
            >
              {/* Top accent line — same red gradient as HomeLine */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-6 md:col-span-5 pl-1">Player</div>
                <div className="col-span-4 md:col-span-3 text-right pr-4">XP Score</div>
                <div className="hidden md:block md:col-span-2 text-center">Badge</div>
              </div>

              <div className="divide-y divide-white/[0.04]">
                <AnimatePresence mode="popLayout">
                  {listUsers.map((user) => (
                    <LeaderboardRow key={user.rank} user={user} />
                  ))}
                </AnimatePresence>
              </div>

              <div className="px-5 py-4 text-center text-[9px] text-neutral-700 font-mono uppercase tracking-widest border-t border-white/5">
                — Top 100 Players Shown —
              </div>
            </motion.div>

            {/* ── MOBILE BOTTOM CTA ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 md:hidden"
            >
              <Link href="/games">
                <button className="w-full h-12 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.08)] active:scale-95 transition-transform">
                  <Gamepad2 size={16} />
                  Play Games to Earn XP
                  <ArrowRight size={14} />
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </div>

      {/* ── STICKY CURRENT-USER FOOTER ─────────────────────────────────────── */}
      <AnimatePresence>
        {showStickyFooter && currentUser && (
          <CurrentUserFooter user={currentUser} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS — Logic 100% preserved, visuals overhauled
// ═══════════════════════════════════════════════════════════════════════════════

// ── Podium Item ───────────────────────────────────────────────────────────────
const PodiumItem = ({ user, position }: { user: LeaderboardUser; position: number }) => {
  const isFirst  = position === 1;
  const isSecond = position === 2;
  const style = RANK_STYLES[position as 1 | 2 | 3] || RANK_STYLES[3];
  const WIDTH = isFirst ? "w-28 md:w-40" : "w-24 md:w-32";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: isFirst ? 0.1 : isSecond ? 0.2 : 0.25 }}
      className={cn("flex flex-col items-center relative", WIDTH, isFirst ? "z-20" : "z-10")}
    >
      {/* Avatar area */}
      <div className="flex flex-col items-center mb-3 relative w-full">
        {/* Crown for #1 */}
        {isFirst && (
          <motion.img
            src={ASSETS.crown}
            alt="Crown"
            animate={{ y: [0, -8, 0], rotate: [0, -4, 0, 4, 0] }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
            className="absolute -top-12 md:-top-16 w-10 h-10 md:w-14 md:h-14 drop-shadow-[0_0_12px_rgba(234,179,8,0.7)] z-20"
          />
        )}

        {/* Glow ring behind avatar */}
        <div
          className="absolute -inset-2 rounded-full blur-lg opacity-40"
          style={{ background: `radial-gradient(circle, ${style.glow}, transparent 70%)` }}
        />

        {/* Avatar ring */}
        <div className={cn("rounded-full p-[2px] bg-gradient-to-b relative z-10", style.ring)}>
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="rounded-full bg-neutral-900 object-cover w-14 h-14 md:w-20 md:h-20"
          />
          {/* Rank badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-white/15 px-2 py-0.5 rounded-full shadow-lg">
            <span className={cn("text-[9px] md:text-[10px] font-black", style.text)}>#{position}</span>
          </div>
        </div>

        {/* Name + badges below avatar */}
        <div className="mt-5 text-center w-full">
          <p className={cn("text-[10px] md:text-sm font-bold truncate px-1 mb-1", user.isCurrentUser ? "text-red-400" : "text-white")}>
            {user.isCurrentUser ? "You" : user.name}
          </p>
          <p className={cn("text-[8px] font-bold uppercase tracking-widest mb-2", style.text)}>
            {style.label}
          </p>
          <div className="flex justify-center gap-1 flex-wrap">
            {user.badges.slice(0, 2).map((b) => (
              <div key={b.id} className="relative">
                <img
                  src={ASSETS.badges[b.tier]}
                  className="w-5 h-5 md:w-7 md:h-7 object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.25)] hover:scale-125 transition-transform"
                  title={b.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Podium bar */}
      <div
        className={cn(
          "w-full rounded-t-2xl relative border border-white/10 overflow-hidden",
          `bg-gradient-to-t ${style.bar}`,
          style.height
        )}
      >
        <div className="absolute inset-0 bg-white/5" />
        {/* Big rank number watermark */}
        <div className="absolute bottom-2 inset-x-0 text-center text-white/[0.07] font-black text-5xl md:text-7xl italic select-none">
          {position}
        </div>
        {/* XP score on the bar */}
        <div className="absolute top-3 inset-x-0 text-center">
          <span className={cn("text-[9px] md:text-[10px] font-black font-mono", style.text)}>
            {user.totalXP.toLocaleString()} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── Leaderboard Row ───────────────────────────────────────────────────────────
const LeaderboardRow = ({ user }: { user: LeaderboardUser }) => {
  const isMe = user.isCurrentUser;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "grid grid-cols-12 gap-2 px-5 py-4 items-center transition-colors duration-200 group relative",
        isMe
          ? "bg-red-500/[0.06] border-l-2 border-red-500"
          : "hover:bg-white/[0.03] border-l-2 border-transparent"
      )}
    >
      {/* Rank number */}
      <div className={cn(
        "col-span-2 text-center font-black text-sm md:text-lg tabular-nums",
        isMe ? "text-red-500" : "text-neutral-600"
      )}>
        {user.rank}
      </div>

      {/* Player info */}
      <div className="col-span-6 md:col-span-5 flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className={cn(
              "w-9 h-9 md:w-11 md:h-11 rounded-full border object-cover bg-neutral-900",
              isMe ? "border-red-500/50" : "border-white/10"
            )}
          />
          {isMe && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "font-bold text-xs md:text-sm truncate",
            isMe ? "text-red-400" : "text-white"
          )}>
            {isMe ? "You" : user.name}
          </span>
          <span className="text-[9px] text-neutral-600 font-mono truncate">
            @{user.username}
          </span>
        </div>
      </div>

      {/* XP score */}
      <div className="col-span-4 md:col-span-3 text-right pr-4">
        <span className={cn(
          "font-mono font-black text-xs md:text-base tabular-nums",
          isMe ? "text-red-400" : "text-neutral-300"
        )}>
          {user.totalXP.toLocaleString()}
        </span>
        <span className="text-[9px] text-neutral-700 ml-1 font-bold">XP</span>
      </div>

      {/* Badge */}
      <div className="hidden md:flex col-span-2 justify-center items-center gap-1.5">
        {user.badges.map((badge) => (
          <div
            key={badge.id}
            className="p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/10 transition-colors"
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

// ── Current User Sticky Footer ────────────────────────────────────────────────
const CurrentUserFooter = ({ user }: { user: LeaderboardUser }) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 22, stiffness: 160 }}
      className="fixed bottom-[70px] md:bottom-0 inset-x-0 z-40"
    >
      <div
        className="border-t border-red-500/30 py-3 px-4 md:py-4 md:px-8 shadow-[0_-12px_40px_rgba(220,38,38,0.15)]"
        style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)" }}
      >
        {/* Top red accent line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Rank box */}
            <div className="flex flex-col items-center justify-center bg-neutral-900 border border-white/10 rounded-xl w-12 h-12 md:w-14 md:h-14 shrink-0">
              <span className="text-[7px] uppercase text-neutral-600 font-bold tracking-widest">Rank</span>
              <span className="text-sm md:text-xl font-black text-white tabular-nums">{user.rank}</span>
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-red-500/50 object-cover"
                alt="You"
              />
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm md:text-base leading-tight">You</span>
                <div className="flex gap-1.5 mt-1">
                  {user.badges.map((b) => (
                    <img
                      key={b.id}
                      src={ASSETS.badges[b.tier]}
                      className="w-4 h-4 md:w-5 md:h-5 object-contain hover:scale-125 transition-transform"
                      title={b.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* XP + CTA */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Your XP</span>
              <span className="font-black text-lg md:text-2xl text-red-400 tabular-nums font-mono">
                {user.totalXP.toLocaleString()}
              </span>
            </div>
            <Link href="/games" className="hidden md:block">
              <button className="h-10 px-5 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-neutral-200 transition-colors">
                <Zap size={13} fill="currentColor" />
                Earn XP
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};