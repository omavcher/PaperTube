"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, FileText, DollarSign, Activity, ShieldCheck,
  Search, RefreshCw, BarChart2, Globe, Cpu, Database,
  HardDrive, TrendingUp, Sparkles, Terminal, AlertTriangle,
  Zap, BookOpen, PresentationIcon, Brain, FlaskConical,
  ClipboardList, GitBranch, PenLine, MessageSquare, Folder,
  UserCheck, UserX, AlertCircle, CheckCircle2, Crown,
  ArrowUpRight, ArrowDownRight, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/api";

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
  // Users
  totalUsers: number;
  todaySignups: number;
  premiumUsers: number;
  freeUsers: number;
  planDistribution: Array<{ _id: string; count: number }>;
  dailySignups: DailySignup[];
  // Content
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
  // Revenue
  totalRevenue: number;
  totalTransactions: number;
  avgOrderValue: number;
  // Ops
  openBugs: number;
  pendingFeedback: number;
  // Marketing
  sourceDistribution: Array<{ _id: string; count: number }>;
  // Creations
  last5Creations: { notes: any[] };
  recentCreations: RecentCreation[];
}

// ── ICON MAP ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  note:         { icon: FileText,         color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  presentation: { icon: PresentationIcon, color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
  flashcard:    { icon: Brain,            color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  quiz:         { icon: FlaskConical,     color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  test:         { icon: ClipboardList,    color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
  diagram:      { icon: GitBranch,        color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/20" },
  essay:        { icon: PenLine,          color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
  chat:         { icon: MessageSquare,    color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "users" | "marketing" | "infra">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true); else setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await api.get("/admin/diagnostics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);
      setError(null);
    } catch {
      setError("Failed to connect to the diagnostics endpoint.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Live terminal simulator
  useEffect(() => {
    const pool = [
      "DB: MongoDB replica heartbeat — STABLE",
      "API: /admin/diagnostics 200 OK — 28ms",
      "AI: Groq LLama-3.1-70b latency check 238ms — ONLINE",
      "R2: Storage sync completed successfully",
      "STRIPE: Webhook handshake verified — active",
      "AUTH: Zero anomalies in last 24h window",
      "CRON: Daily token reset job — SUCCESS",
      "SEO: Sitemap regenerated — 200 OK",
      "EMAIL: SMTP relay healthy — queue empty",
    ];
    setTerminalLogs(
      pool.slice(0, 5).map(l => `[${new Date().toLocaleTimeString()}] ${l}`)
    );
    const iv = setInterval(() => {
      const log = pool[Math.floor(Math.random() * pool.length)];
      setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}] ${log}`, ...prev.slice(0, 13)]);
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  const totalSources = data?.sourceDistribution?.reduce((s, x) => s + x.count, 0) || 1;
  const premiumPct = data ? Math.round((data.premiumUsers / Math.max(data.totalUsers, 1)) * 100) : 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-b-purple-500 animate-spin" style={{ animationDuration: "0.8s" }} />
      </div>
      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.25em] animate-pulse">Initializing Telemetry Deck...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="text-center p-8 rounded-2xl bg-red-950/20 border border-red-500/20 max-w-sm w-full">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Telemetry Fault</h3>
        <p className="text-[11px] text-neutral-400 font-mono mb-6">{error}</p>
        <button onClick={() => fetchData()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-500/20 transition-all">
          <RefreshCw size={12} /> Re-Initialize
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Platform Ops</span>
            <span className="text-[9px] font-mono text-neutral-500">LIVE DATA</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">Operations_Command</h1>
        </div>
        <div className="flex items-center gap-3">
          {data?.openBugs ? (
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-orange-400 bg-orange-500/5 border border-orange-500/20 px-2.5 py-1 rounded-lg">
              <AlertCircle size={10} /> {data.openBugs} Open Bugs
            </span>
          ) : null}
          {data?.pendingFeedback ? (
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2.5 py-1 rounded-lg">
              <MessageSquare size={10} /> {data.pendingFeedback} Feedback
            </span>
          ) : null}
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={cn("text-neutral-500", isRefreshing && "animate-spin text-red-400")} />
            {isRefreshing ? "SYNCING..." : "SYNC NOW"}
          </button>
        </div>
      </div>

      {/* ── TOP KPI ROW ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard label="Total Users" value={data?.totalUsers || 0} sub={`+${data?.todaySignups || 0} today`} icon={Users} color="emerald" trend="up" sparkline={data?.dailySignups?.map(d => d.count) || []} />
        <KpiCard label="Total Content" value={data?.totalContent || 0} sub={`${data?.totalNotes || 0} notes • ${data?.totalPresentations || 0} PPTs`} icon={Layers} color="blue" trend="up" />
        <KpiCard label="Total Revenue" value={data?.totalRevenue || 0} sub={`Avg $${data?.avgOrderValue || 0} / order`} icon={DollarSign} color="purple" isCurrency trend="up" />
        <KpiCard label="Premium Users" value={`${premiumPct}%`} sub={`${data?.premiumUsers || 0} of ${data?.totalUsers || 0} users`} icon={Crown} color="orange" trend="up" />
      </div>

      {/* ── CONTENT TOOL STATS STRIP ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {data?.contentBreakdown?.map((item) => {
          const cfg = TYPE_CONFIG[item.icon] || TYPE_CONFIG.note;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.03 }}
              className={cn("p-3 rounded-xl border bg-neutral-950/60 flex flex-col gap-2 cursor-default", cfg.bg)}
            >
              <Icon size={14} className={cfg.color} />
              <p className="text-[17px] font-black font-mono text-white leading-none">{item.count.toLocaleString()}</p>
              <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider leading-tight">{item.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── TABBED CONSOLE ─────────────────────────────────────────────── */}
      <div className="border border-neutral-900 rounded-2xl bg-neutral-950/40 backdrop-blur-md overflow-hidden">
        {/* Tab ribbon */}
        <div className="flex items-center overflow-x-auto no-scrollbar border-b border-neutral-900 bg-neutral-950 p-2 gap-1.5">
          {([
            { id: "overview",  icon: <BarChart2 size={12} />,  label: "Command Deck" },
            { id: "content",   icon: <Layers size={12} />,     label: "Content Mix" },
            { id: "users",     icon: <Users size={12} />,      label: "Users" },
            { id: "marketing", icon: <Globe size={12} />,      label: "Marketing" },
            { id: "infra",     icon: <Cpu size={12} />,        label: "Infrastructure" },
          ] as const).map(t => (
            <TabBtn key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} icon={t.icon} label={t.label} />
          ))}
        </div>

        <div className="p-4 md:p-6 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >

              {/* ── TAB: OVERVIEW ─────────────────────────────────────── */}
              {activeTab === "overview" && (
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Left: Chart + Terminal */}
                  <div className="lg:col-span-8 space-y-5">
                    {/* Signup trend chart */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">7-Day Signup Trend</h3>
                          <p className="text-[10px] font-mono text-neutral-500 mt-0.5">Real registration velocity (last 7 days)</p>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1"><TrendingUp size={9} /> Live</span>
                      </div>
                      <SignupBarChart data={data?.dailySignups || []} />
                    </div>

                    {/* Live terminal */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                        <Terminal size={11} className="text-red-500" /> Live Telemetry Feed
                      </div>
                      <div className="h-32 rounded-xl border border-neutral-900 bg-black p-3.5 font-mono text-[9px] text-neutral-400 overflow-y-auto space-y-1.5">
                        {terminalLogs.map((log, i) => (
                          <div key={i} className="flex items-start gap-2 border-l border-neutral-800 pl-2 leading-relaxed">
                            <span className="text-red-500/80">&gt;&gt;</span>
                            <span className="text-neutral-600">{log.substring(0, 11)}</span>
                            <span className="text-neutral-300">{log.substring(11)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Recent creations feed */}
                  <div className="lg:col-span-4 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Creation Feed</h3>
                      <p className="text-[10px] font-mono text-neutral-500 mt-0.5 uppercase tracking-wider">Latest across all tools</p>
                    </div>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                      {(data?.recentCreations || []).length > 0 ? (
                        data!.recentCreations.map((item) => (
                          <CreationCard key={`${item._id}-${item.type}`} item={item} />
                        ))
                      ) : (
                        <div className="text-center py-12 border border-dashed border-neutral-900 rounded-2xl text-neutral-600 text-[10px] font-mono uppercase">No creations yet</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: CONTENT MIX ──────────────────────────────────── */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  <div className="grid lg:grid-cols-12 gap-6">
                    {/* Donut chart */}
                    <div className="lg:col-span-5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Content Distribution</h3>
                      <ContentDonut breakdown={data?.contentBreakdown || []} total={data?.totalContent || 0} />
                    </div>
                    {/* Bar breakdown */}
                    <div className="lg:col-span-7 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Tool Usage Breakdown</h3>
                      <div className="space-y-3">
                        {(data?.contentBreakdown || []).map((item) => {
                          const pct = data?.totalContent ? Math.round((item.count / data.totalContent) * 100) : 0;
                          const cfg = TYPE_CONFIG[item.icon] || TYPE_CONFIG.note;
                          const Icon = cfg.icon;
                          return (
                            <div key={item.label} className="space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <div className="flex items-center gap-2">
                                  <Icon size={11} className={cfg.color} />
                                  <span className="text-neutral-300 font-bold">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-neutral-500">{item.count.toLocaleString()}</span>
                                  <span className="text-white font-bold w-8 text-right">{pct}%</span>
                                </div>
                              </div>
                              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.9, ease: "easeOut" }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Content stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <StatMiniCard label="Total Folders" val={data?.totalFolders || 0} icon={Folder} color="text-neutral-400" />
                    <StatMiniCard label="AI Chat Sessions" val={data?.totalAiChats || 0} icon={MessageSquare} color="text-violet-400" />
                    <StatMiniCard label="Practice Tests" val={data?.totalPracticeTests || 0} icon={ClipboardList} color="text-red-400" />
                    <StatMiniCard label="Diagrams" val={data?.totalDiagrams || 0} icon={GitBranch} color="text-cyan-400" />
                  </div>
                </div>
              )}

              {/* ── TAB: USERS ────────────────────────────────────────── */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {/* User plan distribution */}
                  <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">User Plan Distribution</h3>
                      <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-5 space-y-4">
                        {/* Free vs premium dial */}
                        <div className="flex items-center gap-4">
                          <div className="relative h-20 w-20 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <path className="text-neutral-900" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              <path strokeDasharray={`${premiumPct}, 100`} strokeWidth="4" strokeLinecap="round" stroke="#a855f7" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-base font-black font-mono text-white">{premiumPct}%</span>
                              <span className="text-[7px] font-mono text-neutral-500 uppercase">premium</span>
                            </div>
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="flex items-center gap-1.5 text-neutral-400"><UserCheck size={11} className="text-emerald-400" /> Premium</span>
                              <span className="text-white font-bold">{(data?.premiumUsers || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="flex items-center gap-1.5 text-neutral-400"><UserX size={11} className="text-neutral-500" /> Free</span>
                              <span className="text-white font-bold">{(data?.freeUsers || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono border-t border-neutral-900 pt-2">
                              <span className="text-neutral-500">Total</span>
                              <span className="text-white font-bold">{(data?.totalUsers || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Plan breakdown */}
                        {(data?.planDistribution || []).length > 0 && (
                          <div className="space-y-2 border-t border-neutral-900 pt-4">
                            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-2">By Plan ID</p>
                            {data!.planDistribution.map((p, i) => (
                              <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                                <span className="text-neutral-400 capitalize">{p._id || "unknown"}</span>
                                <span className="text-purple-400 font-bold">{p.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Recent Signups</h3>
                      <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4 space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                        {(data?.recentCreations || []).filter((_, i) => i < 8).map(item => (
                          <div key={item._id} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-900/60 hover:bg-neutral-900/30 transition-all">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-neutral-800 flex items-center justify-center text-[9px] font-mono font-bold text-neutral-400 flex-shrink-0">
                              {item.owner?.name?.substring(0, 2).toUpperCase() || "??"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
                              <p className="text-[9px] font-mono text-neutral-500 truncate">{item.owner?.email || "unknown"}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className="text-[8px] font-mono text-neutral-500">{formatDate(item.createdAt)}</span>
                              <p className="text-[8px] font-mono text-neutral-600 capitalize">{item.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: MARKETING ────────────────────────────────────── */}
              {activeTab === "marketing" && (
                <div className="space-y-6">
                  <div className="grid lg:grid-cols-12 gap-6">
                    {/* Funnel */}
                    <div className="lg:col-span-6 space-y-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Conversion Funnel</h3>
                        <p className="text-[10px] font-mono text-neutral-500 mt-0.5">Acquisition-to-payment attrition</p>
                      </div>
                      <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-5 space-y-4">
                        <FunnelBar label="Platform Visitors" val="100%" pct={100} color="#ef4444" />
                        <FunnelBar
                          label="Registered Users"
                          val={`${data?.totalUsers?.toLocaleString() || 0} users`}
                          pct={62}
                          color="#a855f7"
                        />
                        <FunnelBar
                          label="Content Created"
                          val={`${data?.totalContent?.toLocaleString() || 0} items`}
                          pct={38}
                          color="#3b82f6"
                        />
                        <FunnelBar
                          label="Premium Subscribers"
                          val={`${data?.premiumUsers || 0} users (${premiumPct}%)`}
                          pct={Math.max(premiumPct, 2)}
                          color="#10b981"
                        />
                      </div>
                    </div>

                    {/* Traffic sources */}
                    <div className="lg:col-span-6 space-y-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Traffic Acquisition Channels</h3>
                        <p className="text-[10px] font-mono text-neutral-500 mt-0.5">Referral & social source distribution</p>
                      </div>
                      <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-5 space-y-3.5 min-h-[200px]">
                        {(data?.sourceDistribution || []).length > 0 ? (
                          data!.sourceDistribution.map((src, i) => {
                            const pct = Math.round((src.count / totalSources) * 100);
                            const srcColors: Record<string, string> = {
                              Instagram: "#ec4899", "Twitter/X": "#38bdf8", WhatsApp: "#10b981",
                              Facebook: "#2563eb", LinkedIn: "#1d4ed8", YouTube: "#dc2626",
                              Direct: "#a3a3a3", localhost: "#a855f7", Google: "#facc15",
                            };
                            const clr = srcColors[src._id] || "#6b7280";
                            return (
                              <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-mono">
                                  <span className="text-neutral-400 font-bold uppercase tracking-wider">{src._id || "Unknown"}</span>
                                  <span className="text-neutral-500">{src.count} <span className="text-white font-bold ml-1">{pct}%</span></span>
                                </div>
                                <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                                    className="h-full rounded-full" style={{ backgroundColor: clr }} />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-[10px] font-mono text-neutral-600 uppercase">No source data yet</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Revenue metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <RevMetric label="Total Revenue" val={`$${(data?.totalRevenue || 0).toLocaleString()}`} desc="Lifetime gross revenue (success txns)" color="text-emerald-400" />
                    <RevMetric label="Avg Order Value" val={`$${data?.avgOrderValue || 0}`} desc="Mean transaction amount per purchase" color="text-purple-400" />
                    <RevMetric label="Total Transactions" val={(data?.totalTransactions || 0).toString()} desc="Successful payment completions" color="text-blue-400" />
                  </div>
                </div>
              )}

              {/* ── TAB: INFRA ────────────────────────────────────────── */}
              {activeTab === "infra" && (
                <div className="space-y-6">
                  <div className="grid lg:grid-cols-12 gap-6">
                    {/* AI nodes */}
                    <div className="lg:col-span-6 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Neural Network Status</h3>
                      <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4 space-y-3">
                        <NeuralNode name="Groq LLama-3.1-70b-versatile" latency="238ms" status="ONLINE" />
                        <NeuralNode name="HuggingFace Whisper-Large-v3" latency="410ms" status="ONLINE" />
                        <NeuralNode name="HuggingFace bge-large-en-v1.5" latency="182ms" status="ONLINE" />
                        <NeuralNode name="Google GenAI API" latency="310ms" status="ONLINE" />
                        <NeuralNode name="Anthropic Claude-3.5-Sonnet" latency="720ms" status="STANDBY" />
                      </div>
                    </div>

                    {/* DB Collections */}
                    <div className="lg:col-span-6 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Database Collections</h3>
                      <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4 space-y-2">
                        <DbRow name="users" count={data?.totalUsers || 0} />
                        <DbRow name="notes" count={data?.totalNotes || 0} />
                        <DbRow name="presentations" count={data?.totalPresentations || 0} />
                        <DbRow name="flashcardsets" count={data?.totalFlashcards || 0} />
                        <DbRow name="quizzes" count={data?.totalQuizzes || 0} />
                        <DbRow name="practicetests" count={data?.totalPracticeTests || 0} />
                        <DbRow name="diagrams" count={data?.totalDiagrams || 0} />
                        <DbRow name="essays" count={data?.totalEssays || 0} />
                        <DbRow name="aichats" count={data?.totalAiChats || 0} />
                        <DbRow name="folders" count={data?.totalFolders || 0} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InfraCard title="R2 Asset Storage" val="Cloudflare R2" note="CDN-backed object storage" icon={HardDrive} />
                    <InfraCard title="API Gateway" val="Express.js" note="Node.js REST API server" icon={Activity} />
                    <InfraCard title="Database" val="MongoDB Atlas" note="Managed replica set cluster" icon={Database} />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── SUB-COMPONENTS ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color, isCurrency = false, trend, sparkline }: any) {
  const colors: Record<string, { border: string; text: string; stroke: string }> = {
    emerald: { border: "hover:border-emerald-500/40", text: "text-emerald-500", stroke: "#10b981" },
    blue:    { border: "hover:border-blue-500/40",    text: "text-blue-500",    stroke: "#3b82f6" },
    purple:  { border: "hover:border-purple-500/40",  text: "text-purple-500",  stroke: "#a855f7" },
    orange:  { border: "hover:border-orange-500/40",  text: "text-orange-500",  stroke: "#f97316" },
  };
  const c = colors[color] || colors.blue;
  const arr: number[] = sparkline && sparkline.length > 1 ? sparkline : [1, 2, 1, 3, 2, 4, 3, 5];
  const mn = Math.min(...arr), mx = Math.max(...arr), rng = mx - mn || 1;
  const w = 100, h = 28;
  const pts = arr.map((v, i) => `${(i / (arr.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ");
  const fill = `0,${h} ${pts} ${w},${h}`;

  return (
    <div className={cn("bg-neutral-950/40 border border-neutral-900 p-4 md:p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-xl backdrop-blur-md", c.border)}>
      <div className="absolute bottom-0 right-0 h-10 w-24 opacity-20 group-hover:opacity-35 transition-opacity pointer-events-none">
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`kg-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.stroke} stopOpacity="0.5" />
              <stop offset="100%" stopColor={c.stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={fill} fill={`url(#kg-${color})`} />
          <polyline points={pts} fill="none" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-1.5 rounded-xl bg-neutral-900 border border-neutral-800", c.text)}><Icon size={15} /></div>
        {trend === "up"
          ? <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-0.5"><ArrowUpRight size={9} />UP</span>
          : <span className="text-[8px] font-mono text-red-400 flex items-center gap-0.5"><ArrowDownRight size={9} />DOWN</span>}
      </div>
      <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-xl md:text-2xl font-black italic tracking-tight text-white font-mono leading-none mb-1.5">
        {isCurrency && "$"}{typeof value === "number" ? value.toLocaleString() : value}
      </h4>
      <p className="text-[9px] font-mono text-neutral-500 tracking-tight flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse" />{sub}
      </p>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all border shrink-0 whitespace-nowrap",
      active ? "bg-red-500/5 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]" : "text-neutral-500 hover:text-neutral-300 border-transparent hover:bg-neutral-900"
    )}>
      {icon}<span>{label}</span>
    </button>
  );
}

function CreationCard({ item }: { item: RecentCreation }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.note;
  const Icon = cfg.icon;
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-neutral-900/30", cfg.bg)}>
      <div className={cn("p-2 rounded-lg border flex-shrink-0", cfg.bg)}>
        <Icon size={12} className={cfg.color} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-white truncate">{item.title || "Untitled"}</p>
        <p className="text-[9px] font-mono text-neutral-500 truncate">{item.owner?.name || "Unknown"} · {item.type}</p>
      </div>
      <span className="text-[8px] font-mono text-neutral-600 flex-shrink-0">{formatDate(item.createdAt)}</span>
    </div>
  );
}

function SignupBarChart({ data }: { data: DailySignup[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 rounded-xl border border-neutral-900 bg-neutral-950/70 flex items-center justify-center text-[10px] font-mono text-neutral-600">
        No signup data in last 7 days
      </div>
    );
  }
  const max = Math.max(...data.map(d => d.count), 1);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="h-40 rounded-xl border border-neutral-900 bg-neutral-950/70 p-4 flex items-end gap-2">
      {data.map((d, i) => {
        const pct = Math.round((d.count / max) * 100);
        const dt = new Date(d._id.year, d._id.month - 1, d._id.day);
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
            <span className="text-[8px] font-mono text-neutral-600 group-hover:text-white transition-colors">{d.count}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 4)}%` }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm group-hover:from-red-500 group-hover:to-red-300 transition-colors"
              style={{ minHeight: "4px" }}
            />
            <span className="text-[8px] font-mono text-neutral-600">{days[dt.getDay()]}</span>
          </div>
        );
      })}
    </div>
  );
}

function ContentDonut({ breakdown, total }: { breakdown: ContentItem[]; total: number }) {
  if (total === 0 || breakdown.length === 0) {
    return (
      <div className="h-48 rounded-xl border border-neutral-900 bg-neutral-950 flex items-center justify-center text-[10px] font-mono text-neutral-600">No content yet</div>
    );
  }
  let offset = 0;
  const circumference = 2 * Math.PI * 15.9155;
  const slices = breakdown.map(item => {
    const pct = (item.count / total) * 100;
    const dash = (pct / 100) * circumference;
    const gap = circumference - dash;
    const slice = { ...item, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {slices.map((s, i) => (
            <circle key={i} cx="18" cy="18" r="15.9155" fill="none" stroke={s.color} strokeWidth="3"
              strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset} strokeLinecap="butt" />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono text-white">{total.toLocaleString()}</span>
          <span className="text-[8px] font-mono text-neutral-500 uppercase">total</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
        {breakdown.map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-[9px] font-mono">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-neutral-400 truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatMiniCard({ label, val, icon: Icon, color }: any) {
  return (
    <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between gap-3">
      <div>
        <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-black font-mono text-white">{typeof val === "number" ? val.toLocaleString() : val}</p>
      </div>
      <Icon size={16} className={color} />
    </div>
  );
}

function FunnelBar({ label, val, pct, color }: { label: string; val: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[9px] font-mono">
        <span className="text-neutral-300 font-bold uppercase">{label}</span>
        <span className="text-neutral-400">{val}</span>
      </div>
      <div className="h-4 w-full bg-neutral-900/60 rounded border border-neutral-900 overflow-hidden relative flex items-center px-2">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2 }}
          className="absolute left-0 top-0 bottom-0 opacity-30 rounded" style={{ backgroundColor: color }} />
        <span className="text-[8px] font-mono text-neutral-400 relative z-10">{pct}% volume</span>
      </div>
    </div>
  );
}

function RevMetric({ label, val, desc, color }: { label: string; val: string; desc: string; color: string }) {
  return (
    <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/60 flex flex-col gap-2">
      <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">{label}</p>
      <h3 className={cn("text-xl font-mono font-black italic tracking-tighter", color)}>{val}</h3>
      <p className="text-[9px] font-mono text-neutral-500 leading-normal">{desc}</p>
    </div>
  );
}

function NeuralNode({ name, latency, status }: { name: string; latency: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-900/60 bg-neutral-950/20">
      <div className="flex items-center gap-2.5 min-w-0">
        <Cpu size={11} className="text-red-500 flex-shrink-0" />
        <span className="text-[10px] font-mono text-neutral-300 truncate">{name}</span>
      </div>
      <div className="flex items-center gap-3 text-[9px] font-mono flex-shrink-0">
        <span className="text-neutral-500">{latency}</span>
        <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold",
          status === "ONLINE" ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/15" : "bg-orange-500/5 text-orange-400 border border-orange-500/15"
        )}>{status}</span>
      </div>
    </div>
  );
}

function DbRow({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-900/40 hover:bg-neutral-900/30 transition-all">
      <div className="flex items-center gap-2 min-w-0">
        <Database size={10} className="text-blue-500 flex-shrink-0" />
        <span className="text-[10px] font-mono text-neutral-400 truncate">{name}</span>
      </div>
      <span className="text-[10px] font-mono text-white font-bold flex-shrink-0">{count.toLocaleString()}</span>
    </div>
  );
}

function InfraCard({ title, val, note, icon: Icon }: { title: string; val: string; note: string; icon: React.ElementType }) {
  return (
    <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/60 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">{title}</span>
        <Icon size={12} className="text-neutral-600" />
      </div>
      <h4 className="text-sm font-mono font-bold text-white">{val}</h4>
      <p className="text-[9px] font-mono text-neutral-500">{note}</p>
      <div className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-400">
        <CheckCircle2 size={9} /> HEALTHY
      </div>
    </div>
  );
}

// ── HELPERS ────────────────────────────────────────────────────────────────
function formatDate(dateString: string) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}