"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, DollarSign, Layers, Crown, RefreshCw,
  AlertCircle, MessageSquare, ExternalLink, ChevronRight,
  TrendingUp, ArrowUpRight, BarChart3, Globe,
  FileText, PresentationIcon, Brain, FlaskConical,
  ClipboardList, GitBranch, PenLine, Folder,
  CheckCircle2, CreditCard, TicketPercent, Bug,
  Activity, MapPin, Sparkles, Filter, ShieldCheck,
  Calendar, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import MapboxGlobalMap from "@/components/MapboxGlobalMap";
import { toast } from "sonner";

// ── TYPES ──────────────────────────────────────────────────────────────────
interface ContentItem {
  label: string;
  count: number;
  color: string;
  icon: string;
}

interface RecentCreation {
  _id: string;
  title: string;
  type: string;
  owner: { name?: string; email?: string; picture?: string } | null;
  createdAt: string;
}

interface DailySignup {
  _id: { year: number; month: number; day: number };
  count: number;
}

interface Diagnostics {
  totalUsers: number;
  todaySignups: number;
  premiumUsers: number;
  freeUsers: number;
  planDistribution: Array<{ _id: string; count: number }>;
  dailySignups: DailySignup[];
  totalNotes: number;
  totalPresentations: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalPracticeTests: number;
  totalDiagrams: number;
  totalEssays: number;
  totalAiChats: number;
  totalFolders: number;
  totalContent: number;
  contentBreakdown: ContentItem[];
  totalRevenue: number;
  totalTransactions: number;
  avgOrderValue: number;
  openBugs: number;
  pendingFeedback: number;
  sourceDistribution: Array<{ _id: string; count: number }>;
  recentCreations: RecentCreation[];
  mapUsers?: any[];
}

// ── TOOL ICON & ROUTING CONFIG ─────────────────────────────────────────────
const TOOL_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; href: string }> = {
  note:         { label: "Notes",            icon: FileText,         color: "text-blue-400",    href: "/admin/content" },
  ppt:          { label: "Presentations",    icon: PresentationIcon, color: "text-indigo-400",  href: "/admin/content" },
  presentation: { label: "Presentations",    icon: PresentationIcon, color: "text-indigo-400",  href: "/admin/content" },
  flashcard:    { label: "Flashcards",       icon: Brain,            color: "text-amber-400",   href: "/admin/content" },
  quiz:         { label: "Quizzes",          icon: FlaskConical,     color: "text-emerald-400", href: "/admin/content" },
  test:         { label: "Practice Tests",   icon: ClipboardList,    color: "text-rose-400",    href: "/admin/content" },
  diagram:      { label: "Diagrams",         icon: GitBranch,        color: "text-cyan-400",    href: "/admin/content" },
  essay:        { label: "Essays",           icon: PenLine,          color: "text-orange-400",  href: "/admin/content" },
  chat:         { label: "AI Chats",         icon: MessageSquare,    color: "text-purple-400",  href: "/admin/content" },
};

export default function AdminDashboard() {
  const [data, setData] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  const fetchData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true); else setLoading(true);
      const res = await api.get("/admin/diagnostics");
      setData(res.data.data);
      setLastSyncTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setError(null);
      if (isManualRefresh) {
        toast.success("Dashboard data updated successfully");
      }
    } catch (err: any) {
      console.error("Diagnostics Fetch Error:", err);
      setError("Unable to load admin telemetry. Please check your connection and privileges.");
      if (isManualRefresh) {
        toast.error("Failed to refresh telemetry data");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived real metrics
  const premiumPct = useMemo(() => {
    if (!data || !data.totalUsers) return 0;
    return Math.round((data.premiumUsers / data.totalUsers) * 100);
  }, [data]);

  const totalSources = useMemo(() => {
    return data?.sourceDistribution?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;
  }, [data]);

  // Filtered recent creations
  const filteredCreations = useMemo(() => {
    if (!data?.recentCreations) return [];
    if (activityFilter === "all") return data.recentCreations;
    return data.recentCreations.filter(item => {
      if (activityFilter === "note") return item.type === "note";
      if (activityFilter === "presentation") return item.type === "presentation" || item.type === "ppt";
      if (activityFilter === "flashcard") return item.type === "flashcard";
      if (activityFilter === "quiz") return item.type === "quiz";
      return true;
    });
  }, [data?.recentCreations, activityFilter]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse pb-12">
        <div className="h-14 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-zinc-900/60 rounded-2xl border border-zinc-800/80" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-zinc-900/60 rounded-2xl border border-zinc-800/80" />
          <div className="lg:col-span-4 h-96 bg-zinc-900/60 rounded-2xl border border-zinc-800/80" />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="text-center p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 max-w-md w-full shadow-2xl backdrop-blur-md">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Connection Issue</h3>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md active:scale-98"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ── TOP HEADER BAR ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 border border-zinc-700/60 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Updated: {lastSyncTime || "Just now"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
            Admin Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time platform statistics, user growth, revenue metrics, and content generation.
          </p>
        </div>

        {/* Action Badges & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {data?.openBugs ? (
            <Link
              href="/admin/bugs"
              className="flex items-center gap-2 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl hover:bg-rose-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Bug size={14} className="text-rose-400" />
              <span>{data.openBugs} Open Bugs</span>
            </Link>
          ) : null}

          {data?.pendingFeedback ? (
            <Link
              href="/admin/feedback"
              className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <MessageSquare size={14} className="text-amber-400" />
              <span>{data.pendingFeedback} Feedback</span>
            </Link>
          ) : null}

          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 shadow-sm"
          >
            <RefreshCw size={13} className={cn("text-zinc-400", isRefreshing && "animate-spin text-indigo-400")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── 4 PRIMARY KPI METRIC CARDS (WITH GROW EFFECT) ───────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <MetricCard
          label="Total Users"
          value={data?.totalUsers || 0}
          badge={`+${data?.todaySignups || 0} today`}
          badgeColor="emerald"
          secondary={`${(data?.freeUsers || 0).toLocaleString()} free · ${(data?.premiumUsers || 0).toLocaleString()} paid`}
          icon={Users}
        />

        {/* Card 2: Active Subscribers */}
        <MetricCard
          label="Paid Subscribers"
          value={data?.premiumUsers || 0}
          badge={`${premiumPct}% conversion`}
          badgeColor="indigo"
          secondary={`Across active membership tiers`}
          icon={Crown}
        />

        {/* Card 3: Revenue */}
        <MetricCard
          label="Gross Revenue"
          value={data?.totalRevenue || 0}
          isCurrency
          badge={`${data?.totalTransactions || 0} orders`}
          badgeColor="emerald"
          secondary={`Avg $${data?.avgOrderValue || 0} / checkout`}
          icon={DollarSign}
        />

        {/* Card 4: Total Content Items */}
        <MetricCard
          label="Content Generated"
          value={data?.totalContent || 0}
          badge="Across 8 tools"
          badgeColor="zinc"
          secondary={`${(data?.totalNotes || 0).toLocaleString()} notes · ${(data?.totalPresentations || 0).toLocaleString()} decks`}
          icon={Layers}
        />
      </div>

      {/* ── QUICK ADMIN NAVIGATION HUBS (FUNKY GROW EFFECT) ─────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <QuickNavTile href="/admin/users" icon={Users} label="User Directory" desc="Manage accounts" />
        <QuickNavTile href="/admin/transactions" icon={CreditCard} label="Transactions" desc="Payment logs" />
        <QuickNavTile href="/admin/content" icon={FileText} label="Content Vault" desc="Inspect items" />
        <QuickNavTile href="/admin/bugs" icon={Bug} label="Bug Tracker" desc="Review reports" count={data?.openBugs} />
        <QuickNavTile href="/admin/feedback" icon={MessageSquare} label="Feedback" desc="User reviews" count={data?.pendingFeedback} />
        <QuickNavTile href="/admin/promo" icon={TicketPercent} label="Promo Codes" desc="Discounts" />
      </div>

      {/* ── FULL-WIDTH INTERACTIVE WORLD MAP (GLOBAL USER TELEMETRY) ─────── */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-lg backdrop-blur-md transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-indigo-500/5">
        <div className="p-4 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                Global User Distribution
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                  {data?.mapUsers?.length || 0} Geo-Nodes Active
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time interactive telemetry map showing registered user locations globally
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1 rounded-lg">
              Live Mapbox Feed
            </span>
          </div>
        </div>
        <MapboxGlobalMap users={data?.mapUsers || []} />
      </div>

      {/* ── MAIN ANALYTICS SECTION (7-DAY SIGNUPS & REAL-TIME CREATION STREAM) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): 7-Day Velocity Chart & Content Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Real 7-Day User Registration Velocity */}
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-indigo-500/5 group">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-400" />
                  7-Day User Registration Velocity
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Actual daily signups captured over the last 7 calendar days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                  Total 7d: {data?.dailySignups?.reduce((acc, d) => acc + d.count, 0) || 0}
                </span>
              </div>
            </div>

            {/* Dynamic Bar Chart Component */}
            <DynamicSignupChart dailySignups={data?.dailySignups || []} />
          </div>

          {/* Real Content Generation Breakdown Grid (8 Types) */}
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <Layers size={16} className="text-indigo-400" />
                  Content Studio Inventory
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Total breakdown across all {data?.totalContent ? data.totalContent.toLocaleString() : 0} generated assets
                </p>
              </div>
              <Link
                href="/admin/content"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>View all</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Horizontal Tool Distribution Bar */}
            {data?.totalContent ? (
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex mb-5 border border-zinc-700/50">
                {data?.contentBreakdown?.map((item, idx) => {
                  const pct = (item.count / Math.max(data.totalContent, 1)) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={idx}
                      className="h-full transition-all duration-500 hover:opacity-80"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color || "#6366f1"
                      }}
                      title={`${item.label}: ${item.count} items (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>
            ) : null}

            {/* 8 Clean Content Type Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data?.contentBreakdown?.map((item) => {
                const cfg = TOOL_CONFIG[item.icon] || TOOL_CONFIG.note;
                const Icon = cfg.icon;
                const pct = data?.totalContent ? Math.round((item.count / data.totalContent) * 100) : 0;
                return (
                  <Link
                    key={item.label}
                    href={cfg.href}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 group-hover:text-white transition-colors">
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400">
                        {pct}%
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-mono text-white leading-tight">
                        {item.count.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                        {item.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Creation Stream (Real User Activity) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-sm h-full flex flex-col transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <Activity size={16} className="text-indigo-400" />
                  Recent Activity
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Latest assets created by users
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 border-b border-zinc-800/80">
              {[
                { id: "all", label: "All" },
                { id: "note", label: "Notes" },
                { id: "presentation", label: "Decks" },
                { id: "quiz", label: "Quizzes" },
                { id: "flashcard", label: "Cards" },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 shrink-0",
                    activityFilter === f.id
                      ? "bg-zinc-800 text-white border border-zinc-700 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Creation Rows */}
            <div className="space-y-2 mt-4 flex-1 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredCreations.length > 0 ? (
                filteredCreations.map((item) => {
                  const cfg = TOOL_CONFIG[item.type] || TOOL_CONFIG.note;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item._id}
                      className="p-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 hover:bg-zinc-800/50 hover:border-zinc-700 hover:scale-[1.01] hover:translate-x-0.5 transition-all duration-200 flex items-start gap-3 group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center flex-shrink-0 text-zinc-300 group-hover:text-white">
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {item.title || "Untitled Creation"}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.owner?.name || item.owner?.email || "Anonymous User"}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-medium">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs font-medium">
                  No activity found in this category
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── LOWER SECONDARY GRIDS (TRAFFIC SOURCES & MEMBERSHIP PLANS) ───── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referral / Traffic Sources */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Globe size={16} className="text-indigo-400" />
                Traffic Acquisition Channels
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real referral sources logged across platform visitors
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60">
              {data?.sourceDistribution?.length || 0} Channels
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {(data?.sourceDistribution || []).length > 0 ? (
              data!.sourceDistribution.map((src, i) => {
                const count = src.count || 0;
                const pct = Math.round((count / totalSources) * 100);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-300">{src._id || "Direct / Organic"}</span>
                      <span className="font-mono text-zinc-400">
                        {count.toLocaleString()} visits <span className="text-white font-bold ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 2)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                No referral sources recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Subscription Plan Distribution */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Crown size={16} className="text-indigo-400" />
                Subscription Tiers
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Active paid subscriber breakdown by plan
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Manage users</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3 mt-4">
            {/* Free vs Paid Overview Bar */}
            <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-400">Paid Conversion Rate</span>
                <span className="font-mono text-emerald-400 font-bold">{premiumPct}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${premiumPct}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${100 - premiumPct}%` }} className="bg-zinc-700 h-full" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  {(data?.premiumUsers || 0).toLocaleString()} Paid
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-zinc-700 inline-block" />
                  {(data?.freeUsers || 0).toLocaleString()} Free
                </span>
              </div>
            </div>

            {/* Individual Plans */}
            {(data?.planDistribution || []).length > 0 ? (
              <div className="space-y-2 pt-2">
                {data!.planDistribution.map((plan, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/30 text-xs"
                  >
                    <span className="font-medium text-zinc-200 capitalize">
                      {plan._id || "Standard Plan"}
                    </span>
                    <span className="font-mono text-white font-bold">
                      {plan.count.toLocaleString()} subscribers
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs">
                No custom plan breakdown recorded
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── SUB-COMPONENTS ─────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  badge,
  badgeColor,
  secondary,
  icon: Icon,
  isCurrency = false
}: {
  label: string;
  value: number | string;
  badge: string;
  badgeColor: "emerald" | "indigo" | "zinc";
  secondary: string;
  icon: React.ElementType;
  isCurrency?: boolean;
}) {
  const badgeClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700/60",
  }[badgeColor];

  return (
    <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-indigo-500/5 group flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400 tracking-tight">{label}</span>
        <div className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 group-hover:text-indigo-400 transition-colors">
          <Icon size={16} />
        </div>
      </div>

      <div>
        <h3 className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-white leading-none">
          {isCurrency && "$"}{typeof value === "number" ? value.toLocaleString() : value}
        </h3>

        <div className="flex items-center gap-2 mt-3">
          <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium", badgeClasses)}>
            {badge}
          </span>
          <span className="text-[11px] text-zinc-400 truncate">
            {secondary}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuickNavTile({
  href,
  icon: Icon,
  label,
  desc,
  count
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-95 group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-400 group-hover:text-white transition-colors">
          <Icon size={15} />
        </div>
        {typeof count === "number" && count > 0 && (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {count}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">
          {label}
        </p>
        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{desc}</p>
      </div>
    </Link>
  );
}

function DynamicSignupChart({ dailySignups }: { dailySignups: DailySignup[] }) {
  if (!dailySignups || dailySignups.length === 0) {
    return (
      <div className="h-48 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-xs text-zinc-500">
        No signup records found in the last 7 days
      </div>
    );
  }

  const max = Math.max(...dailySignups.map(d => d.count), 1);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-48 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 flex items-end gap-3 md:gap-6">
      {dailySignups.map((item, idx) => {
        const dateObj = new Date(item._id.year, item._id.month - 1, item._id.day);
        const dayLabel = dayNames[dateObj.getDay()];
        const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const heightPct = Math.round((item.count / max) * 100);

        return (
          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
            {/* Tooltip on Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 px-2 py-1 bg-zinc-800 border border-zinc-700 text-white rounded text-[10px] font-mono whitespace-nowrap pointer-events-none shadow-md z-10">
              {item.count} signups · {formattedDate}
            </div>

            {/* Count above bar */}
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white font-semibold transition-colors mb-1.5">
              {item.count}
            </span>

            {/* Bar */}
            <div className="w-full max-w-[42px] bg-zinc-800 rounded-t-lg overflow-hidden h-full flex items-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(heightPct, 6)}%` }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
                className="w-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors rounded-t-lg shadow-sm"
              />
            </div>

            {/* Day Label */}
            <span className="text-[10px] font-mono text-zinc-400 mt-2 font-medium">
              {dayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatRelativeTime(dateString: string) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}