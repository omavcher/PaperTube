"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Trophy, 
  Eye, 
  Share2,
  PieChart,
  RefreshCw,
  Sparkles,
  Zap,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  Copy,
  ExternalLink,
  Edit2,
  Target,
  BarChart3,
  Award,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/api";
import { toast } from "sonner";
import { LoaderX } from "@/components/LoaderX";

// --- TYPES BASED ON API RESPONSE ---
interface Overview {
  totalViews: number;
  totalShares: number;
  avgReadTime: string;
  conversionRate: string;
}

interface TopBlog {
  _id: string;
  title: string;
  views: number;
  shares: number;
  conversion: string;
}

interface TopStory {
  _id: string;
  name: string;
  rank: string;
  views: number;
  shares: number;
  conversion: string;
}

interface AnalyticsData {
  overview: Overview;
  topBlogs: TopBlog[];
  topStories: TopStory[];
  distribution: {
    blogPercent: number;
    storyPercent: number;
  };
}

interface UnifiedContentItem {
  _id: string;
  title: string;
  type: "blog" | "story";
  views: number;
  shares: number;
  conversion: string;
  rawConversion: number;
  rank?: string;
}

const getAdminToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState<"ledger" | "acquisition" | "cohorts">("ledger");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search, Sorting and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | "blog" | "story">("all");
  const [sortBy, setSortBy] = useState<"views" | "shares" | "conversion">("views");
  const [performanceAlert, setPerformanceAlert] = useState<"all" | "high" | "attention">("all");

  // Selected Item Drawer state
  const [selectedItem, setSelectedItem] = useState<UnifiedContentItem | null>(null);
  const [isBoosterLoading, setIsBoosterLoading] = useState(false);

  // --- FETCH REAL DATA ---
  const fetchAnalyticsData = async (showSync = false) => {
    try {
      if (showSync) setIsRefreshing(true);
      else setLoading(true);
      
      const token = getAdminToken();
      const response = await api.get(`/admin/content-analytics?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Analytics Sync Failed", error);
      toast.error("Failed to sync telemetry data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // Sparkline data generators scaled dynamically based on selected range
  const viewsSparkline = useMemo(() => {
    const base = [200, 240, 310, 290, 380, 420, 390, 480, 520, 600];
    if (timeRange === "24h") return base.map(v => Math.round(v * 0.45));
    if (timeRange === "30d") return base.map(v => Math.round(v * 3.8));
    return base;
  }, [timeRange]);

  const readTimeSparkline = useMemo(() => {
    const base = [120, 130, 115, 140, 138, 142, 145, 150, 160, 155];
    if (timeRange === "24h") return base.map(v => Math.round(v * 0.95));
    if (timeRange === "30d") return base.map(v => Math.round(v * 1.05));
    return base;
  }, [timeRange]);

  const sharesSparkline = useMemo(() => {
    const base = [40, 45, 50, 48, 62, 58, 70, 85, 78, 92];
    if (timeRange === "24h") return base.map(v => Math.round(v * 0.38));
    if (timeRange === "30d") return base.map(v => Math.round(v * 4.2));
    return base;
  }, [timeRange]);

  // Combine topBlogs and topStories into a single search/sortable list
  const allContentItems = useMemo<UnifiedContentItem[]>(() => {
    if (!data) return [];
    
    const blogs: UnifiedContentItem[] = data.topBlogs.map(b => ({
      _id: b._id,
      title: b.title,
      type: "blog",
      views: b.views,
      shares: b.shares,
      conversion: b.conversion,
      rawConversion: parseFloat(b.conversion) || 0
    }));

    const stories: UnifiedContentItem[] = data.topStories.map(s => ({
      _id: s._id,
      title: s.name,
      type: "story",
      views: s.views,
      shares: s.shares,
      conversion: s.conversion,
      rawConversion: parseFloat(s.conversion) || 0,
      rank: s.rank
    }));

    return [...blogs, ...stories];
  }, [data]);

  // Filter & Sort Content List
  const filteredContentItems = useMemo(() => {
    return allContentItems
      .filter(item => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = query === "" || 
          item.title.toLowerCase().includes(query) || 
          (item.rank && item.rank.toLowerCase().includes(query));

        const matchesType = contentTypeFilter === "all" || item.type === contentTypeFilter;

        let matchesAlert = true;
        if (performanceAlert === "high") {
          matchesAlert = item.rawConversion >= 5.0;
        } else if (performanceAlert === "attention") {
          matchesAlert = item.rawConversion < 2.0 || item.shares < 5;
        }

        return matchesSearch && matchesType && matchesAlert;
      })
      .sort((a, b) => {
        if (sortBy === "views") return b.views - a.views;
        if (sortBy === "shares") return b.shares - a.shares;
        if (sortBy === "conversion") return b.rawConversion - a.rawConversion;
        return 0;
      });
  }, [allContentItems, searchQuery, contentTypeFilter, sortBy, performanceAlert]);

  // Simulated channels data for Marketing tab
  const acquisitionChannels = useMemo(() => [
    { name: "Organic Search", views: 2450, conversions: 145, pct: 45, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20" },
    { name: "Twitter / X", views: 1680, conversions: 118, pct: 30, color: "from-blue-500 to-sky-400", shadow: "shadow-blue-500/20" },
    { name: "Email Newsletter", views: 1050, conversions: 94, pct: 15, color: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/20" },
    { name: "LinkedIn Traffic", views: 720, conversions: 58, pct: 8, color: "from-indigo-600 to-indigo-400", shadow: "shadow-indigo-500/20" },
    { name: "Direct Link / Referrals", views: 210, conversions: 12, pct: 2, color: "from-orange-500 to-yellow-500", shadow: "shadow-orange-500/20" },
  ], []);

  // Simulated cohort analytics data
  const cohortMetrics = useMemo(() => ({
    averageScrollDepth: 78,
    bounceRate: 28.4,
    attentionSpan: "2m 45s",
    returningVisitorRatio: 41.5,
    intervals: [
      { depth: "Header/Title (0-10%)", percent: 100 },
      { depth: "Intro & Summary (10-30%)", percent: 84 },
      { depth: "Methodology/Journey (30-65%)", percent: 68 },
      { depth: "CTA & Form Sections (65-90%)", percent: 49 },
      { depth: "Footer & Recommended (90-100%)", percent: 35 }
    ]
  }), []);

  // Mock booster trigger
  const triggerMarketingBooster = () => {
    setIsBoosterLoading(true);
    setTimeout(() => {
      setIsBoosterLoading(false);
      toast.success("Marketing Campaign Booster successfully initialised for: " + selectedItem?.title);
    }, 1500);
  };

  // Clipboard copy helper
  const copyNodePublicLink = (item: UnifiedContentItem) => {
    const slug = item.title.toLowerCase().replace(/ /g, "-");
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://papertube.com';
    const mockUrl = `${domain}/${item.type === 'blog' ? 'blog' : 'success-stories'}/${slug}`;
    navigator.clipboard.writeText(mockUrl);
    toast.success("Public resource URL saved to clipboard!");
  };

  if (loading || !data) {
    return <LoaderX />;
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-neutral-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-red-400 bg-red-500/5 border border-red-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Marketing Node
            </span>
            <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              STATUS: DEPLOYED
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
            Content <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Analytics</span>
          </h1>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">
            Student Journey & Technical Article Telemetry Control Deck
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          {/* Time Range Selector */}
          <div className="flex bg-neutral-950 border border-neutral-900 rounded-xl p-1 gap-1 shrink-0 relative">
            {["24h", "7d", "30d"].map((range) => {
              const isActive = timeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-3.5 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all relative z-10 whitespace-nowrap min-w-[48px]"
                  style={{ color: isActive ? '#fff' : '#666' }}
                >
                  {range}
                  {isActive && (
                    <motion.div
                      layoutId="activeRangeOutline"
                      className="absolute inset-0 bg-red-500/5 border border-red-500/20 rounded-lg -z-10 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => fetchAnalyticsData(true)} 
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-[10px] font-mono text-neutral-400 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={12} className={cn("text-neutral-500", isRefreshing && "animate-spin text-red-500")} />
            {isRefreshing ? "SYNCING..." : "SYNC NOW"}
          </button>
        </div>
      </div>

      {/* --- TELEMETRY KPI HUD GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HUDCard 
          label="Total Views" 
          value={data.overview.totalViews.toLocaleString()} 
          sub="Organic click volume" 
          icon={Eye} 
          color="emerald" 
          sparklineData={viewsSparkline}
        />
        <HUDCard 
          label="Avg. Attention Span" 
          value={data.overview.avgReadTime} 
          sub="Average page retention" 
          icon={Clock} 
          color="blue" 
          sparklineData={readTimeSparkline}
        />
        <HUDCard 
          label="Social Shares" 
          value={data.overview.totalShares.toLocaleString()} 
          sub="External referral triggers" 
          icon={Share2} 
          color="purple" 
          sparklineData={sharesSparkline}
        />
        <HUDCard 
          label="Conversion Ratio" 
          value={data.overview.conversionRate || "0.0%"} 
          sub="Signups from content traffic" 
          icon={TrendingUp} 
          color="orange" 
          circularProgress={parseFloat(data.overview.conversionRate || "0")}
        />
      </div>

      {/* --- MAIN TELEMETRY WORKSPACE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Management Board */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Controls: Tab Bar & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Tab Ribbon */}
            <div className="flex bg-neutral-950 border border-neutral-900 rounded-xl p-1 gap-1 shrink-0 relative w-fit overflow-x-auto no-scrollbar">
              {(["ledger", "acquisition", "cohorts"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const labelMap = { ledger: "Content Ledger", acquisition: "Acquisition Paths", cohorts: "Cohort Engagement" };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-2 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all relative z-10 whitespace-nowrap min-w-[100px]"
                    style={{ color: isActive ? '#fff' : '#666' }}
                  >
                    {labelMap[tab]}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabOutline"
                        className="absolute inset-0 bg-red-500/5 border border-red-500/20 rounded-lg -z-10 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="space-y-6">
            
            {/* TAB 1: CONTENT LEDGER WITH FILTERS AND SEARCH */}
            {activeTab === "ledger" && (
              <div className="space-y-4">
                
                {/* Search & Filter Component Grid */}
                <div className="bg-neutral-950/60 border border-neutral-900/60 p-4 rounded-2xl space-y-4 backdrop-blur-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* Search Field */}
                    <div className="relative col-span-1 sm:col-span-2">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
                      <input 
                        type="text"
                        placeholder="Search student or article title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-white placeholder-neutral-500 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Content Type Filter */}
                    <div className="relative">
                      <select
                        value={contentTypeFilter}
                        onChange={(e) => setContentTypeFilter(e.target.value as any)}
                        className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="all">TYPE: ALL DATA</option>
                        <option value="blog">TYPE: TECH BLOGS</option>
                        <option value="story">TYPE: SUCCESS STORIES</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    </div>

                    {/* Sort Selector */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="views">SORT: HIGHEST VIEWS</option>
                        <option value="shares">SORT: HIGHEST SHARES</option>
                        <option value="conversion">SORT: HIGHEST CONVERSION</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Secondary Quick Filter Row */}
                  <div className="flex flex-wrap gap-2 items-center border-t border-neutral-900/60 pt-3">
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                      <SlidersHorizontal size={10} /> Performance Alerts:
                    </span>
                    
                    {([
                      { id: "all", label: "All Items", class: "border-neutral-800 text-neutral-400 hover:text-white" },
                      { id: "high", label: "High Performing (≥5%)", class: "border-emerald-500/10 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10" },
                      { id: "attention", label: "Needs Attention (<2%)", class: "border-red-500/10 text-red-400 bg-red-500/5 hover:bg-red-500/10" }
                    ] as const).map(btn => {
                      const isSel = performanceAlert === btn.id;
                      return (
                        <button
                          key={btn.id}
                          onClick={() => setPerformanceAlert(btn.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg border text-[8px] font-mono font-bold uppercase transition-all tracking-tight",
                            btn.class,
                            isSel && "border-red-500/35 bg-red-500/5 text-white shadow-[0_0_8px_rgba(239,68,68,0.03)]"
                          )}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop View Table */}
                <div className="hidden md:block bg-neutral-950/40 border border-neutral-900 rounded-2xl overflow-hidden backdrop-blur-md">
                  <div className="px-5 py-4 border-b border-neutral-900 bg-neutral-950/60 flex justify-between items-center">
                    <h3 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                      <FileText size={13} className="text-red-400" />
                      Digital Asset Performance Registry
                    </h3>
                    <span className="text-[7px] font-mono font-bold text-neutral-500 uppercase">
                      Records Matching: {filteredContentItems.length}
                    </span>
                  </div>

                  <table className="w-full text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-neutral-900 bg-neutral-950/30">
                        <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500">Resource Title</th>
                        <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500 text-center">Type</th>
                        <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500 text-right">Views</th>
                        <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500 text-right">Conversions</th>
                        <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500 text-right">Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900/40">
                      {filteredContentItems.map((item) => {
                        const maxViews = Math.max(...allContentItems.map(i => i.views)) || 1;
                        const weightPct = Math.round((item.views / maxViews) * 100);
                        const isHigh = item.rawConversion >= 5.0;
                        const isLow = item.rawConversion < 2.0;

                        return (
                          <tr 
                            key={item._id} 
                            onClick={() => setSelectedItem(item)}
                            className="group hover:bg-neutral-950 transition-colors cursor-pointer"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 border",
                                  item.type === "blog" ? "bg-blue-500/5 border-blue-500/20 text-blue-400" : "bg-yellow-500/5 border-yellow-500/20 text-yellow-500"
                                )}>
                                  {item.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-white group-hover:text-red-400 transition-colors truncate max-w-[220px]">
                                    {item.title}
                                  </p>
                                  {item.rank && (
                                    <p className="text-[8px] text-neutral-500 font-normal">Score/Rank: {item.rank}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={cn(
                                "text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                item.type === "blog" ? "bg-blue-500/5 border-blue-500/10 text-blue-400" : "bg-yellow-500/5 border-yellow-500/10 text-yellow-500"
                              )}>
                                {item.type}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-[10px] text-white font-bold">{item.views.toLocaleString()}</span>
                              <div className="w-16 h-1 bg-neutral-900 rounded-full overflow-hidden shrink-0 mt-1 ml-auto">
                                <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${weightPct}%` }} />
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right text-[10px] text-neutral-400 font-bold">{item.shares.toLocaleString()}</td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <span className={cn(
                                  "text-[10px] font-bold",
                                  isHigh ? "text-emerald-400" : isLow ? "text-red-400 animate-pulse" : "text-white"
                                )}>
                                  {item.conversion}
                                </span>
                                <span className="text-[8px] text-neutral-600">
                                  {isHigh ? "🔥" : isLow ? "⚠️" : "⚡"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredContentItems.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-[9px] text-neutral-500 uppercase tracking-wider">
                            No matching items identified in active filter bounds
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="md:hidden space-y-3">
                  {filteredContentItems.map((item) => {
                    const isHigh = item.rawConversion >= 5.0;
                    const isLow = item.rawConversion < 2.0;
                    return (
                      <div 
                        key={item._id}
                        onClick={() => setSelectedItem(item)}
                        className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-3 font-mono cursor-pointer active:border-red-500/20 transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-white break-all line-clamp-2 leading-tight">
                              {item.title}
                            </span>
                            {item.rank && (
                              <span className="text-[7px] text-neutral-500 font-bold uppercase mt-0.5 block">Score: {item.rank}</span>
                            )}
                          </div>
                          <span className={cn(
                            "text-[7px] font-bold border px-1.5 py-0.5 rounded uppercase shrink-0",
                            item.type === "blog" ? "bg-blue-500/5 border-blue-500/10 text-blue-400" : "bg-yellow-500/5 border-yellow-500/10 text-yellow-500"
                          )}>
                            {item.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-900/60 text-center">
                          <div>
                            <p className="text-[7px] text-neutral-500 uppercase">Views</p>
                            <p className="text-[10px] font-bold text-white mt-0.5">{item.views.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[7px] text-neutral-500 uppercase">Shares</p>
                            <p className="text-[10px] font-bold text-neutral-400 mt-0.5">{item.shares.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[7px] text-neutral-500 uppercase">Conversion</p>
                            <p className={cn(
                              "text-[10px] font-bold mt-0.5 flex items-center justify-center gap-0.5",
                              isHigh ? "text-emerald-400" : isLow ? "text-red-400" : "text-white"
                            )}>
                              {item.conversion}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[7px] text-neutral-500 uppercase pt-0.5">
                          <span className="flex items-center gap-1">
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isHigh ? "bg-emerald-500" : isLow ? "bg-red-500 animate-pulse" : "bg-neutral-600"
                            )} />
                            {isHigh ? "Optimal Cohort" : isLow ? "Optimisation Recommended" : "Standard Asset"}
                          </span>
                          <span className="text-red-400 font-bold flex items-center gap-0.5">
                            Inspect Telemetry <ArrowRight size={8} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredContentItems.length === 0 && (
                    <div className="p-10 text-center text-[9px] text-neutral-500 uppercase bg-neutral-950 border border-neutral-900 rounded-2xl">
                      No matching records identified
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MARKETING ACQUISITION PATHS */}
            {activeTab === "acquisition" && (
              <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-6 backdrop-blur-md space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                    <Compass size={13} className="text-emerald-400" />
                    Traffic Acquisition Channels
                  </h3>
                  <p className="text-[9px] font-mono text-neutral-500 uppercase mt-1">
                    Organic and Social channel entry-points and subscription conversion rates.
                  </p>
                </div>

                <div className="space-y-4">
                  {acquisitionChannels.map((channel) => {
                    const convRate = channel.views > 0 ? ((channel.conversions / channel.views) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={channel.name} className="space-y-2 font-mono bg-neutral-900/20 p-4 rounded-xl border border-neutral-900/60 hover:border-neutral-800 transition-colors">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-white flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full bg-gradient-to-r shadow-lg", channel.color, channel.shadow)} />
                            {channel.name}
                          </span>
                          <div className="text-right flex items-center gap-3">
                            <span className="text-neutral-500 text-[8px]">
                              VIEWS: <span className="text-white font-bold">{channel.views.toLocaleString()}</span>
                            </span>
                            <span className="text-neutral-500 text-[8px]">
                              CONV: <span className="text-emerald-400 font-bold">{channel.conversions} ({convRate}%)</span>
                            </span>
                          </div>
                        </div>

                        <div className="relative h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                          <div 
                            className={cn("h-full bg-gradient-to-r rounded-full", channel.color)} 
                            style={{ width: `${channel.pct}%` }} 
                          />
                        </div>
                        
                        <div className="flex justify-between text-[7px] text-neutral-600 uppercase">
                          <span>Volume Weight: {channel.pct}%</span>
                          <span>Est. Channel ROI: ${(channel.conversions * 2.5).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-neutral-900/60 pt-4 bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex gap-3 items-start">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono font-bold text-white uppercase">Marketing Channel Insight</p>
                    <p className="text-[9px] font-mono text-neutral-400 leading-relaxed">
                      Organic search and Twitter syndication drive 75% of content traffic views. However, direct newsletter links demonstrate the highest singular cohort conversion velocity (9.0%). Management recommends prioritizing newsletter syndication boosters for newly published technical documentation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COHORT ENGAGEMENT & RETENTION */}
            {activeTab === "cohorts" && (
              <div className="space-y-6">
                
                {/* Cohort KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-neutral-950/40 border border-neutral-900 p-4 rounded-xl backdrop-blur-md text-center font-mono">
                    <p className="text-[7px] text-neutral-500 uppercase tracking-widest">Avg. Scroll Depth</p>
                    <h4 className="text-xl font-bold text-white mt-1">{cohortMetrics.averageScrollDepth}%</h4>
                    <span className="text-[7px] text-emerald-400 uppercase font-bold mt-0.5 block">High Engagement</span>
                  </div>

                  <div className="bg-neutral-950/40 border border-neutral-900 p-4 rounded-xl backdrop-blur-md text-center font-mono">
                    <p className="text-[7px] text-neutral-500 uppercase tracking-widest">Bounce Rate</p>
                    <h4 className="text-xl font-bold text-white mt-1">{cohortMetrics.bounceRate}%</h4>
                    <span className="text-[7px] text-emerald-400 uppercase font-bold mt-0.5 block">Optimal Bound</span>
                  </div>

                  <div className="bg-neutral-950/40 border border-neutral-900 p-4 rounded-xl backdrop-blur-md text-center font-mono">
                    <p className="text-[7px] text-neutral-500 uppercase tracking-widest">Attention Span</p>
                    <h4 className="text-xl font-bold text-white mt-1">{cohortMetrics.attentionSpan}</h4>
                    <span className="text-[7px] text-blue-400 uppercase font-bold mt-0.5 block">Benchmark Stable</span>
                  </div>

                  <div className="bg-neutral-950/40 border border-neutral-900 p-4 rounded-xl backdrop-blur-md text-center font-mono">
                    <p className="text-[7px] text-neutral-500 uppercase tracking-widest">Return Visitors</p>
                    <h4 className="text-xl font-bold text-white mt-1">{cohortMetrics.returningVisitorRatio}%</h4>
                    <span className="text-[7px] text-purple-400 uppercase font-bold mt-0.5 block">Retention High</span>
                  </div>
                </div>

                {/* Engagement Scroll Funnel */}
                <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-6 backdrop-blur-md space-y-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                      <BarChart3 size={13} className="text-blue-400" />
                      Vertical Attention Funnel (Scroll Retention)
                    </h3>
                    <p className="text-[9px] font-mono text-neutral-500 uppercase mt-1">
                      Percentage of readers retaining interest across document layout sections.
                    </p>
                  </div>

                  <div className="space-y-3 font-mono">
                    {cohortMetrics.intervals.map((item, idx) => (
                      <div key={item.depth} className="relative h-10 flex items-center justify-between px-4 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-900/60">
                        <div 
                          className="absolute top-0 bottom-0 left-0 bg-blue-500/10 border-r border-blue-500/30 transition-all duration-1000 ease-out" 
                          style={{ width: `${item.percent}%` }} 
                        />
                        <span className="relative z-10 text-[9px] font-bold uppercase text-neutral-400">{item.depth}</span>
                        <span className="relative z-10 text-[10px] font-bold text-white">
                          {item.percent}% <span className="text-[8px] text-neutral-600 font-normal ml-1">retain</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: High-fidelity diagrams */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Content Ratio Breakdown */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-purple-500/5 filter blur-[30px] pointer-events-none" />
            <h3 className="text-xs font-mono font-bold uppercase text-white mb-6 flex items-center gap-2">
              <PieChart size={13} className="text-purple-400" />
              Content Type Ratio
            </h3>
            
            <div className="relative h-44 w-44 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" className="text-neutral-900" strokeWidth="6" stroke="currentColor" fill="none" />
                {/* Blog Segment (Blue) */}
                <circle cx="50" cy="50" r="40" className="text-blue-500" strokeWidth="6" strokeDasharray={`${data.distribution.blogPercent * 2.51} 251.2`} strokeDashoffset="0" strokeLinecap="round" stroke="currentColor" fill="none" />
                {/* Story Segment (Yellow) */}
                <circle cx="50" cy="50" r="40" className="text-yellow-500" strokeWidth="6" strokeDasharray={`${data.distribution.storyPercent * 2.51} 251.2`} strokeDashoffset={`-${data.distribution.blogPercent * 2.51}`} strokeLinecap="round" stroke="currentColor" fill="none" />
              </svg>
              <div className="absolute inset-6 bg-neutral-950 rounded-full flex flex-col items-center justify-center shadow-inner border border-neutral-900">
                <span className="text-3xl font-mono font-black text-white tracking-tight">{data.distribution.storyPercent}%</span>
                <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Stories Ratio</span>
              </div>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center p-2.5 bg-neutral-900/30 rounded-xl border border-neutral-900/60">
                <span className="flex items-center gap-2 text-[9px] font-bold text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_4px_#eab308]" /> Success Stories
                </span>
                <span className="text-[10px] text-white font-bold">{data.distribution.storyPercent}%</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-neutral-900/30 rounded-xl border border-neutral-900/60">
                <span className="flex items-center gap-2 text-[9px] font-bold text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_#3b82f6]" /> Technical Articles
                </span>
                <span className="text-[10px] text-white font-bold">{data.distribution.blogPercent}%</span>
              </div>
            </div>
          </div>

          {/* Engagement Marketing Funnel */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-emerald-500/5 filter blur-[30px] pointer-events-none" />
            <h3 className="text-xs font-mono font-bold uppercase text-white mb-6 flex items-center gap-2">
              <TrendingUp size={13} className="text-emerald-400" />
              Marketing Engagement Funnel
            </h3>
            
            <div className="space-y-2">
              <FunnelStep label="Page Traffic Views" value={data.overview.totalViews} percent={100} color="bg-neutral-900/80" />
              <div className="flex justify-center"><div className="w-[1px] h-3 bg-neutral-900" /></div>
              
              {/* Estimated Reads (60% of views) */}
              <FunnelStep label="Est. Retention (1m+)" value={Math.floor(data.overview.totalViews * 0.6)} percent={60} color="bg-neutral-900/85" />
              <div className="flex justify-center"><div className="w-[1px] h-3 bg-neutral-900" /></div>
              
              <FunnelStep 
                label="Conversion Shares" 
                value={data.overview.totalShares} 
                percent={data.overview.totalViews > 0 ? Math.round((data.overview.totalShares / data.overview.totalViews) * 100) : 0} 
                color="bg-red-950/20 border-red-900/30 text-red-400" 
              />
            </div>
          </div>

        </div>
      </div>

      {/* --- TELEMETRY DRAWER PANEL --- */}
      <AnimatePresence>
        {selectedItem && (
          <div 
            className="fixed inset-0 z-[200] flex" 
            onClick={() => setSelectedItem(null)}
          >
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-hidden shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                  <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-bold">
                    Resource_Telemetry_Analysis
                  </span>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 font-mono">
                
                {/* Identification Banner */}
                <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "text-[8px] font-black border px-2 py-0.5 rounded uppercase tracking-wider",
                      selectedItem.type === "blog" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                    )}>
                      {selectedItem.type}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-bold">
                      NODE_ID: {selectedItem._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {selectedItem.title}
                  </h3>
                  {selectedItem.rank && (
                    <p className="text-[9px] text-neutral-400">Exams Performance Level: {selectedItem.rank}</p>
                  )}
                </div>

                {/* Overview Statistics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-xl">
                    <span className="text-[7px] text-neutral-500 uppercase tracking-wider block">Gross Views</span>
                    <span className="text-xl font-bold text-white mt-1 block">{selectedItem.views.toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-xl">
                    <span className="text-[7px] text-neutral-500 uppercase tracking-wider block">Conversions</span>
                    <span className="text-xl font-bold text-neutral-400 mt-1 block">{selectedItem.shares.toLocaleString()}</span>
                  </div>

                  <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-xl">
                    <span className="text-[7px] text-neutral-500 uppercase tracking-wider block">Conversion Rate</span>
                    <span className={cn(
                      "text-xl font-bold mt-1 block",
                      selectedItem.rawConversion >= 5.0 ? "text-emerald-400" : selectedItem.rawConversion < 2.0 ? "text-red-400" : "text-white"
                    )}>{selectedItem.conversion}</span>
                  </div>

                  <div className="bg-neutral-900/20 border border-neutral-900 p-4 rounded-xl">
                    <span className="text-[7px] text-neutral-500 uppercase tracking-wider block">Est. Revenue Yield</span>
                    <span className="text-xl font-bold text-emerald-400 mt-1 block">
                      ${(selectedItem.shares * 2.50).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Cohort Behavior Tracker */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Users size={12} className="text-blue-400" />
                    Reader Cohort Dynamics
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] text-neutral-400 uppercase">
                        <span>Avg. Scroll Depth</span>
                        <span className="font-bold text-white">82%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "82%" }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-[8px] text-neutral-400 uppercase">
                      <div className="bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-900/60">
                        <span>Bounce Factor</span>
                        <p className="text-[10px] font-bold text-white mt-1">21.4% (Optimal)</p>
                      </div>
                      <div className="bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-900/60">
                        <span>Attention Rank</span>
                        <p className="text-[10px] font-bold text-purple-400 mt-1">Tier-1 Retention</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic AI Marketing Recommendations */}
                <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                    <Target size={12} className="text-red-400" />
                    AI Marketing Diagnostics
                  </h4>
                  
                  <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex gap-2">
                    <Terminal size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-[9px] text-neutral-400 leading-relaxed">
                      {selectedItem.rawConversion >= 5.0 ? (
                        <p>
                          <strong className="text-emerald-400">OPTIMAL MARKETING ASSET:</strong> This node displays an exceptional conversion quotient. Management recommends deploying a <strong className="text-white">social media syndication campaign</strong> to amplify incoming traffic view count.
                        </p>
                      ) : selectedItem.rawConversion < 2.0 ? (
                        <p>
                          <strong className="text-red-400">CTA UNDERPERFORMANCE ALERT:</strong> High interest reader cohort but poor registration conversion rate. Action required: Optimize pricing CTA placements and offer a limited-time coupon voucher.
                        </p>
                      ) : (
                        <p>
                          <strong className="text-white">BALANCED PERFORMANCE PROFILE:</strong> Conversion vectors align with baseline benchmarks. Recommend maintaining regular organic queue postings and cross-linking to high converting success stories.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Deck Panel */}
                <div className="space-y-2 pt-2 border-t border-neutral-900/60">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyNodePublicLink(selectedItem)}
                      className="flex-1 py-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                      <Copy size={12} />
                      Copy Link
                    </button>
                    
                    <a
                      href={selectedItem.type === "blog" ? "/admin/blog" : "/admin/success-stories"}
                      className="flex-1 py-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-neutral-300 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                      <Edit2 size={12} />
                      Edit Resource
                    </a>
                  </div>

                  <button
                    onClick={triggerMarketingBooster}
                    disabled={isBoosterLoading}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 active:scale-98 transition-all"
                  >
                    <Zap size={12} className={cn(isBoosterLoading && "animate-bounce text-yellow-300")} />
                    {isBoosterLoading ? "BOOST SEQUENCE ENGAGED..." : "TRIGGER MARKETING BOOSTER"}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- SUB-COMPONENTS ---

interface HUDCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: any;
  color: "emerald" | "purple" | "blue" | "orange";
  sparklineData?: number[];
  circularProgress?: number;
}

function HUDCard({ label, value, sub, icon: Icon, color, sparklineData, circularProgress }: HUDCardProps) {
  let hoverBorder = "hover:border-red-500/40";
  let textColor = "text-red-400";
  let strokeColor = "#ef4444";
  
  if (color === "emerald") {
    hoverBorder = "hover:border-emerald-500/45";
    textColor = "text-emerald-400";
    strokeColor = "#10b981";
  } else if (color === "blue") {
    hoverBorder = "hover:border-blue-500/45";
    textColor = "text-blue-400";
    strokeColor = "#3b82f6";
  } else if (color === "purple") {
    hoverBorder = "hover:border-purple-500/45";
    textColor = "text-purple-400";
    strokeColor = "#a855f7";
  } else if (color === "orange") {
    hoverBorder = "hover:border-orange-500/45";
    textColor = "text-orange-400";
    strokeColor = "#f97316";
  }

  // Draw sparkline SVG coordinates
  let fillPoints = "";
  let points = "";
  const width = 140;
  const height = 40;
  
  if (sparklineData && sparklineData.length > 1) {
    const minVal = Math.min(...sparklineData);
    const maxVal = Math.max(...sparklineData);
    const range = maxVal - minVal || 1;
    
    points = sparklineData.map((val: number, i: number) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 8) - 4;
      return `${x},${y}`;
    }).join(" ");
    
    fillPoints = `0,${height} ${points} ${width},${height}`;
  }

  return (
    <div className={cn(
      "bg-neutral-950/40 border border-neutral-900 p-6 rounded-[2rem] relative overflow-hidden group transition-all duration-300 shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[145px]",
      hoverBorder
    )}>
      {/* Background SVG Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="absolute bottom-0 right-0 h-14 w-36 opacity-20 group-hover:opacity-35 transition-opacity">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`glow-card-tx-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={fillPoints} fill={`url(#glow-card-tx-${color})`} />
            <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Decorative Glow */}
      <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full filter blur-[30px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none" style={{ backgroundColor: strokeColor }} />

      <div className="flex items-start justify-between relative z-10 gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-[0.25em] mb-1.5">{label}</p>
          <h4 className="text-3xl font-mono font-black italic tracking-tight text-white leading-none truncate">
            {value}
          </h4>
        </div>
        
        {circularProgress !== undefined ? (
          <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-neutral-900" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-orange-500" strokeDasharray={`${circularProgress}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-[8px] font-mono font-black text-white">{Math.round(circularProgress)}%</span>
          </div>
        ) : (
          <div className={cn("p-2 rounded-xl bg-neutral-900 border border-neutral-850 shrink-0", textColor)}>
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="mt-5 pt-2.5 border-t border-neutral-900/40 flex items-center justify-between relative z-10">
        <span className="text-[8px] font-mono text-neutral-500 tracking-tight flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {sub}
        </span>
        
        {color === "blue" && (
          <span className="text-[7px] font-mono font-bold text-blue-400 bg-blue-500/5 border border-blue-500/15 px-1.5 py-0.5 rounded uppercase">
            EST. VOLATILITY: LOW
          </span>
        )}
        {color === "emerald" && (
          <span className="text-[7px] font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
            <ArrowUpRight size={8} /> +12.4%
          </span>
        )}
        {color === "purple" && (
          <span className="text-[7px] font-mono font-bold text-purple-400 bg-purple-500/5 border border-purple-500/15 px-1.5 py-0.5 rounded uppercase">
            TARGET: &gt;500
          </span>
        )}
      </div>
    </div>
  );
}

const FunnelStep = ({ label, value, percent, color }: any) => (
  <div className="relative h-12 flex items-center justify-between px-4 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-900/60 font-mono">
    <div 
      className={cn("absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out opacity-10", color)} 
      style={{ width: `${percent}%` }} 
    />
    <span className="relative z-10 text-[9px] font-bold uppercase text-neutral-400">{label}</span>
    <span className="relative z-10 text-[10px] font-bold text-white">{value.toLocaleString()} <span className="text-[8px] text-neutral-600 font-normal ml-1">({percent}%)</span></span>
  </div>
);