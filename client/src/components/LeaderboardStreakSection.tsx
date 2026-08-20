"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Flame, Trophy, Gift, Lock, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import api from "@/config/api";

interface LeaderboardUser {
  position: number;
  userId: string;
  name: string;
  username?: string;
  avatar?: string;
  xp: number;
  coins: number;
}

export default function LeaderboardStreakSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      let storedUserId = "";
      try {
        const token = localStorage.getItem("authToken");
        setIsLoggedIn(!!token);

        const userRaw = localStorage.getItem("user");
        if (userRaw) {
          const user = JSON.parse(userRaw);
          storedUserId = user?._id || user?.id || "";
          if (user?.streak?.count !== undefined) {
            setStreakCount(Number(user.streak.count) || 0);
          }
        }
      } catch (e) {
        console.error("Local user parse error:", e);
      }

      // 1. Fetch real leaderboard from backend
      try {
        const res = await api.post("/users/get-groble-leaderboard", {
          userId: storedUserId || "guest_node"
        });

        if (res.data?.success && Array.isArray(res.data.leaderboard)) {
          const mapped: LeaderboardUser[] = res.data.leaderboard.slice(0, 5).map((u: any, idx: number) => ({
            position: idx + 1,
            userId: u.userId || u._id || String(idx + 1),
            name: u.name || u.username || "Scholar",
            username: u.username,
            avatar: u.avatar || u.picture || "/avatar.png",
            xp: Number(u.xp) || 0,
            coins: Number(u.coins ?? (u.xp ? u.xp * 4 : 0))
          }));

          if (isMounted) {
            setLeaderboard(mapped);
          }
        }
      } catch (err) {
        console.error("Leaderboard API fetch error:", err);
      }

      // 2. Fetch fresh user streak & tokens if logged in
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (token) {
        try {
          const tokenRes = await api.get("/users/tokens", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (tokenRes.data?.streak !== undefined && isMounted) {
            setStreakCount(Number(tokenRes.data.streak) || 0);
          }
        } catch (e) {}
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveStreak = streakCount;
  const progressPercent = Math.min(100, Math.max(0, (effectiveStreak / 7) * 100));

  return (
    <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
        
        {/* ─── CARD 1: CLIMB THE LEADERBOARD ─── */}
        <div className="lg:col-span-4 rounded-2xl bg-[#09090c] border border-white/[0.08] hover:border-white/[0.14] p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-sm transition-all group">
          
          <div className="flex items-center lg:items-start justify-between gap-3 relative z-10">
            {/* Mobile Trophy */}
            <div className="w-12 h-12 shrink-0 lg:hidden flex items-center justify-center">
              <img
                src="/red-trophy.png"
                alt="Trophy"
                className="w-full h-full object-contain opacity-90"
              />
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-medium text-neutral-400 uppercase tracking-wider">
                <span>Community</span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white leading-tight tracking-tight">
                Climb the Leaderboard.<br className="hidden sm:inline" />{" "}
                <span className="text-[#ef4444]">Top Scholar</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-normal leading-relaxed">
                Compete with learners worldwide, earn XP, and unlock rewards.
              </p>
            </div>

            {/* Mobile Chevron */}
            <Link
              href="/leaderboard"
              className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex lg:hidden items-center justify-center text-neutral-400 shrink-0 hover:text-white transition-colors"
            >
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Desktop Trophy */}
          <div className="hidden lg:flex absolute right-2 bottom-2 w-32 h-32 aspect-square pointer-events-none items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
            <img
              src="/red-trophy.png"
              alt="Leaderboard Trophy"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Bottom Action Button */}
          <div className="relative z-10 pt-4">
            <Link
              href="/leaderboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs transition-all active:scale-98 cursor-pointer"
            >
              <span>View Full Leaderboard</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>


        {/* ─── CARD 2: TOP SCHOLARS THIS WEEK ─── */}
        <div className="lg:col-span-4 rounded-2xl bg-[#09090c] border border-white/[0.08] hover:border-white/[0.14] p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5 pb-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Top Scholars This Week
            </h4>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          {/* 5 Ranks Rows */}
          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
            {loading ? (
              <div className="space-y-2 py-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/[0.05]" />
                      <div className="w-6 h-6 rounded-full bg-white/[0.05]" />
                      <div className="w-16 h-3 bg-white/[0.05] rounded" />
                    </div>
                    <div className="w-12 h-3 bg-white/[0.05] rounded" />
                  </div>
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              leaderboard.map((item) => {
                let rankStyle = "bg-white/[0.04] text-neutral-400 border border-white/[0.06]";
                if (item.position === 1) rankStyle = "bg-amber-500/20 text-amber-300 border border-amber-500/30";
                else if (item.position === 2) rankStyle = "bg-neutral-300/20 text-neutral-200 border border-neutral-300/30";
                else if (item.position === 3) rankStyle = "bg-amber-800/20 text-amber-400 border border-amber-800/30";

                return (
                  <div
                    key={item.userId || item.position}
                    className="flex items-center justify-between p-1 sm:p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Left: Rank + Avatar + Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${rankStyle}`}>
                        {item.position}
                      </span>
                      <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full border border-white/10 overflow-hidden bg-neutral-800 shrink-0">
                        <img 
                          src={item.avatar || "/avatar.png"} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLImageElement).src = "/avatar.png"; }}
                        />
                      </div>
                      <span className="text-xs font-medium text-neutral-200 truncate max-w-[100px] sm:max-w-[125px]">
                        {item.name}
                      </span>
                    </div>

                    {/* Right: Flame XP & Coins */}
                    <div className="flex items-center gap-2.5 shrink-0 pl-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-300" title={`${item.xp} XP`}>
                        <Flame size={12} className="text-orange-400 fill-orange-400" />
                        <span>{item.xp.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-300" title={`${item.coins} Coins`}>
                        <span className="text-[11px]">🪙</span>
                        <span>{item.coins.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-neutral-400">
                <Trophy size={18} className="mx-auto text-neutral-600 mb-1.5" />
                <p>Start studying to take the #1 spot!</p>
              </div>
            )}
          </div>

        </div>


        {/* ─── CARD 3: DAILY REWARDS & STREAK ─── */}
        <div className="lg:col-span-4 rounded-2xl bg-[#09090c] border border-white/[0.08] hover:border-white/[0.14] p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all">
          
          {/* Top Info Row */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Circular Progress Gauge */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#ef4444"
                  strokeWidth="5"
                  strokeDasharray="238"
                  strokeDashoffset={238 - (238 * (progressPercent / 100))}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300">
                  <Gift size={15} />
                </div>
              </div>
            </div>

            {/* Streak & Rewards Information */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Daily Rewards
              </h4>
              <p className="text-[10px] text-neutral-400 font-normal">
                Keep your study streak active
              </p>
              <p className="text-xs font-semibold text-neutral-200 pt-0.5">
                {effectiveStreak > 0 ? `${effectiveStreak} Day Streak` : "Start Your Streak"}
              </p>
              <p className="text-[9.5px] text-neutral-400 font-normal leading-tight truncate">
                {effectiveStreak > 0 
                  ? "Return tomorrow for rewards!" 
                  : (isLoggedIn ? "Study today to start streak!" : "Sign in to unlock daily rewards!")}
              </p>
            </div>

            {/* Mobile Chevron */}
            <Link
              href="/leaderboard"
              className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex lg:hidden items-center justify-center text-neutral-400 shrink-0 hover:text-white transition-colors"
            >
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* 7-Day Live Tracker Strip */}
          <div className="pt-2.5 border-t border-white/[0.04] mt-2">
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isCompleted = effectiveStreak > 0 && day <= effectiveStreak;

                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-xl transition-all ${
                      isCompleted
                        ? "bg-red-500/10 border border-red-500/30 text-white"
                        : "bg-white/[0.02] border border-white/[0.05] text-neutral-500"
                    }`}
                  >
                    <span className={`text-[9.5px] font-bold ${isCompleted ? "text-white" : "text-neutral-500"}`}>
                      {day}
                    </span>
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <Check size={9} className="text-red-400 stroke-[2.5]" />
                      ) : (
                        <Lock size={8} className="text-neutral-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

