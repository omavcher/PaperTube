"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Trash2, Edit3, Plus, Search, 
  Eye, Clock, ShieldCheck, AlertCircle, Loader2, 
  X, Camera, AtSign, User, Trophy, TrendingUp,
  SlidersHorizontal, ChevronDown, RefreshCw, Copy,
  Sparkles, BarChart2, Star, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import { uploadToR2 } from "@/utils/r2Upload";

const EXAM_OPTIONS = ["SAT", "ACT", "MCAT", "LSAT", "GRE", "GMAT", "AP Exams", "College Exams", "Other"];

interface Story {
  _id: string;
  name: string;
  handle: string;
  exam: string;
  rank: string;
  heroTitle: string;
  summary: string;
  fullJourney: { title: string; content: string }[];
  isApproved: boolean;
  date: string;
  avatar: string;
  views?: number;
  shares?: number;
  conversions?: number;
}

export default function AdminSuccessStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search, Filters and Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [examFilter, setExamFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "views" | "conversions" | "rank">("date");

  const authToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") || "" : ""; 
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<"form" | "analytics">("form");
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    exam: "",
    rank: "",
    headline: "",
    summary: "",
    challenge: "",
    solution: "",
    result: "",
    avatarFile: null as File | null,
    existingAvatar: ""
  });

  const fetchStories = async (showSync = false) => {
    try {
      if (showSync) setIsRefreshing(true);
      else setLoading(true);
      const res = await api.get("/admin/success-stories/all", { headers: { Authorization: `Bearer ${authToken}` } });
      setStories(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch stories from buffer");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Compute HUD telemetry
  const hudStats = useMemo(() => {
    const total = stories.length;
    const pending = stories.filter(s => !s.isApproved).length;
    const views = stories.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const shares = stories.reduce((acc, curr) => acc + (curr.shares || 0), 0);
    const conversions = stories.reduce((acc, curr) => acc + (curr.conversions || 0), 0);
    
    // Average Conversion Rate
    const conversionRate = views > 0 ? ((shares / views) * 100).toFixed(1) : "0.0";
    
    return {
      total,
      pending,
      views,
      conversions,
      conversionRate
    };
  }, [stories]);

  const resetForm = () => {
    setFormData({
      name: "", handle: "", exam: "", rank: "", headline: "",
      summary: "", challenge: "", solution: "", result: "",
      avatarFile: null, existingAvatar: ""
    });
    setPreviewUrl(null);
    setEditId(null);
    setDrawerTab("form");
  };

  const openNewEntryDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (story: Story) => {
    setEditId(story._id);
    setFormData({
      name: story.name,
      handle: story.handle.replace('@', ''),
      exam: story.exam,
      rank: story.rank,
      headline: story.heroTitle,
      summary: story.summary,
      challenge: story.fullJourney[0]?.content || "",
      solution: story.fullJourney[1]?.content || "",
      result: story.fullJourney[2]?.content || "",
      avatarFile: null,
      existingAvatar: story.avatar
    });
    setPreviewUrl(story.avatar);
    setDrawerTab("form");
    setIsDrawerOpen(true);
  };

  const _uploadToR2 = async (file: File): Promise<string> => {
    return await uploadToR2(file, "success-stories", true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let avatarUrl = formData.existingAvatar;
      if (formData.avatarFile) {
        avatarUrl = await _uploadToR2(formData.avatarFile);
      }

      const payload = {
        name: formData.name,
        handle: `@${formData.handle.replace('@', '')}`,
        avatar: avatarUrl,
        exam: formData.exam,
        rank: formData.rank,
        heroTitle: formData.headline,
        summary: formData.summary,
        fullJourney: [
          { title: "The Challenge", content: formData.challenge },
          { title: "The Solution", content: formData.solution },
          { title: "The Result", content: formData.result }
        ],
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      if (editId) {
        await api.patch(`/admin/success-stories/update/${editId}` , payload , { headers: { Authorization: `Bearer ${authToken}` } });
        toast.success("Story updated successfully");
      } else {
        await api.post("/general/success-stories/share", { ...payload, isApproved: true });
        toast.success("New story deployed to public node");
      }
      
      setIsDrawerOpen(false);
      resetForm();
      fetchStories();
    } catch (err) {
      toast.error("Uplink failed. Check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/success-stories/approve/${id}` , {} , { headers: { Authorization: `Bearer ${authToken}` } });
      toast.success("Protocol Synced to Public Node");
      fetchStories();
    } catch (err) { 
      toast.error("Approval sequence failed"); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm data purge?")) return;
    try {
      await api.delete(`/admin/success-stories/delete/${id}` , { headers: { Authorization: `Bearer ${authToken}` } });
      toast.success("Data Terminated");
      fetchStories();
    } catch (err) { 
      toast.error("Deletion failed"); 
    }
  };

  // Filter & Sort Stories List
  const filteredStories = useMemo(() => {
    return stories
      .filter(story => {
        // Search Query
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = query === "" || 
          story.name.toLowerCase().includes(query) || 
          story.handle.toLowerCase().includes(query) || 
          story.exam.toLowerCase().includes(query) || 
          story.heroTitle.toLowerCase().includes(query);

        // Status Filter
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "approved" && story.isApproved) || 
          (statusFilter === "pending" && !story.isApproved);

        // Exam Filter
        const matchesExam = examFilter === "all" || story.exam === examFilter;

        return matchesSearch && matchesStatus && matchesExam;
      })
      .sort((a, b) => {
        if (sortBy === "views") return (b.views || 0) - (a.views || 0);
        if (sortBy === "conversions") return (b.shares || 0) - (a.shares || 0);
        if (sortBy === "rank") return b.rank.localeCompare(a.rank);
        
        // Default date sorting
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [stories, searchQuery, statusFilter, examFilter, sortBy]);

  // Sparkline simulation data for stories table row
  const rowSparkline = [15, 20, 18, 30, 25, 45, 40, 55];

  // Draw row sparkline coordinates
  const getRowSparklinePoints = (views: number = 0) => {
    const points = rowSparkline.map((val, i) => {
      const scale = views > 0 ? views / 100 : 1;
      const x = (i / (rowSparkline.length - 1)) * 50;
      const y = 16 - (val * 0.25 * Math.min(scale, 1));
      return `${x},${y}`;
    }).join(" ");
    return points;
  };

  // Clipboard copy helper
  const copyStoryPublicLink = (story: Story) => {
    const slug = story.name.toLowerCase().replace(/ /g, "-") + "-" + story.heroTitle.toLowerCase().replace(/ /g, "-");
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://papertube.com';
    const mockUrl = `${domain}/success-stories/${slug}`;
    navigator.clipboard.writeText(mockUrl);
    toast.success("Public story link saved to clipboard!");
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-neutral-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-yellow-500 bg-yellow-500/5 border border-yellow-500/15 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Marketing Ops
            </span>
            <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              STATUS: ONLINE
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-wider text-white">
            Success_Story <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Manager</span>
          </h1>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">
            Uplink console for managing, approving, and analyzing conversion impact of student journeys.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            onClick={openNewEntryDrawer}
            className="bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black uppercase italic text-[10px] h-12 px-6 flex-1 md:flex-none"
          >
            <Plus size={16} className="mr-2" /> New Entry
          </Button>
          <button 
            onClick={() => fetchStories(true)} 
            disabled={isRefreshing || loading}
            className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={cn(isRefreshing && "animate-spin text-red-500")} />
          </button>
        </div>
      </div>

      {/* --- TELEMETRY KPI HUD GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stories */}
        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[120px] hover:border-blue-500/30 transition-all">
          <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-blue-500/5 filter blur-2xl pointer-events-none" />
          <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Total Stories</p>
          <h4 className="text-2xl md:text-3xl font-mono font-black italic text-white mt-2 leading-none">
            {hudStats.total}
          </h4>
          <span className="text-[8px] font-mono text-neutral-500 mt-4 block">Deployed database assets</span>
        </div>

        {/* Pending Approval */}
        <div className={cn(
          "border p-5 rounded-[2rem] relative overflow-hidden shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[120px] transition-all",
          hudStats.pending > 0 
            ? "bg-yellow-500/5 border-yellow-500/15 hover:border-yellow-500/40" 
            : "bg-neutral-950/40 border-neutral-900 hover:border-emerald-500/30"
        )}>
          {hudStats.pending > 0 ? (
            <>
              <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-yellow-500/10 filter blur-2xl pointer-events-none" />
              <p className="text-[8px] font-mono text-yellow-500 uppercase tracking-widest">Action Required</p>
              <h4 className="text-2xl md:text-3xl font-mono font-black italic text-yellow-500 mt-2 leading-none animate-pulse">
                {hudStats.pending} PENDING
              </h4>
              <span className="text-[8px] font-mono text-yellow-500/70 mt-4 block">Awaiting approval sequence</span>
            </>
          ) : (
            <>
              <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-emerald-500/5 filter blur-2xl pointer-events-none" />
              <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Queue Status</p>
              <h4 className="text-2xl md:text-3xl font-mono font-black italic text-emerald-400 mt-2 leading-none">
                SECURE
              </h4>
              <span className="text-[8px] font-mono text-neutral-500 mt-4 block">No pending items in buffer</span>
            </>
          )}
        </div>

        {/* Total Views */}
        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[120px] hover:border-purple-500/30 transition-all">
          <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-purple-500/5 filter blur-2xl pointer-events-none" />
          <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Cumulative Impressions</p>
          <h4 className="text-2xl md:text-3xl font-mono font-black italic text-white mt-2 leading-none">
            {hudStats.views.toLocaleString()}
          </h4>
          <span className="text-[8px] font-mono text-purple-400 mt-4 block font-bold flex items-center gap-0.5">
            <TrendingUp size={10} /> +14.2% traffic load
          </span>
        </div>

        {/* Lead Conversion Rate */}
        <div className="bg-neutral-950/40 border border-neutral-900 p-5 rounded-[2rem] relative overflow-hidden group shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[120px] hover:border-orange-500/30 transition-all">
          <div className="absolute -top-12 -left-12 w-20 h-20 rounded-full bg-orange-500/5 filter blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Lead Acq. Rate</p>
              <h4 className="text-2xl md:text-3xl font-mono font-black italic text-white mt-2 leading-none">
                {hudStats.conversionRate}%
              </h4>
            </div>
            
            <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" className="text-neutral-900" strokeWidth="3.5" stroke="currentColor" fill="none" />
                <circle cx="18" cy="18" r="16" className="text-orange-500" strokeDasharray={`${parseFloat(hudStats.conversionRate)}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" />
              </svg>
              <span className="absolute text-[7px] font-mono font-black text-white">{Math.round(parseFloat(hudStats.conversionRate))}%</span>
            </div>
          </div>
          <span className="text-[8px] font-mono text-neutral-500 mt-2 block">Story conversion velocity</span>
        </div>

      </div>

      {/* --- ADVANCED CONTROL & FILTER BAR --- */}
      <div className="bg-neutral-950/60 border border-neutral-900 p-4 rounded-2xl space-y-4 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input 
              type="text"
              placeholder="Search candidate name, handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-white placeholder-neutral-500 focus:outline-none transition-all"
            />
          </div>

          {/* Exam Filter */}
          <div className="relative">
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">EXAM FOCUS: ALL</option>
              {EXAM_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-850 focus:border-red-500/40 rounded-xl text-[10px] font-mono text-neutral-400 focus:text-white focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">STATUS: ALL</option>
              <option value="approved">STATUS: DEPLOYED (APPROVED)</option>
              <option value="pending">STATUS: QUEUED (PENDING)</option>
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
              <option value="date">SORT BY: RECENT DATE</option>
              <option value="views">SORT BY: TOTAL VIEWS</option>
              <option value="conversions">SORT BY: CONVERSIONS</option>
              <option value="rank">SORT BY: EXAM SCORE/RANK</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-between items-center text-[8px] font-mono text-neutral-600 uppercase border-t border-neutral-900/60 pt-3">
          <span>Active filter constraints matching: {filteredStories.length} record(s)</span>
          <span className="flex items-center gap-1">
            <SlidersHorizontal size={9} /> Telemetry indexing stable
          </span>
        </div>
      </div>

      {/* --- TABLE CONTENT (DESKTOP) --- */}
      <div className="hidden md:block">
        <Card className="bg-neutral-950/40 border border-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950/60">
                  <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500">Candidate identity</th>
                  <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500">Exam classification</th>
                  <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500">Views sparkline</th>
                  <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500 text-right">Yield (conv)</th>
                  <th className="p-5 text-[8px] font-black uppercase tracking-widest text-neutral-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-red-500" />
                    </td>
                  </tr>
                ) : filteredStories.map((story) => {
                  const sViews = story.views || 0;
                  const sShares = story.shares || 0;
                  const sConvs = story.conversions || 0;
                  const cRate = sViews > 0 ? ((sShares / sViews) * 100).toFixed(1) : "0.0";
                  const pct = Math.min(parseFloat(cRate) * 10, 100);

                  return (
                    <motion.tr 
                      layout 
                      key={story._id} 
                      className="hover:bg-neutral-950/60 transition-colors group cursor-default"
                      id={`story-row-${story._id}`}
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-9 w-9 border border-neutral-800 ring-2 ring-red-500/10">
                            <AvatarImage src={story.avatar} className="object-cover" />
                            <AvatarFallback className="bg-neutral-900 text-neutral-500 text-[10px]">{story.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-[10px] font-bold text-white group-hover:text-red-400 transition-colors">{story.name}</p>
                            <p className="text-[8px] text-neutral-500 mt-0.5">{story.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                            story.isApproved 
                              ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" 
                              : "bg-yellow-500/5 border-yellow-500/15 text-yellow-500 animate-pulse"
                          )}>
                            {story.exam}
                          </div>
                          <div>
                            <span className="text-[10px] text-white font-bold block">{story.rank}</span>
                            <span className="text-[7px] text-neutral-500 block uppercase truncate max-w-[140px]">{story.heroTitle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <svg className="w-12 h-5 text-red-500/40" viewBox="0 0 50 16" preserveAspectRatio="none">
                            <polyline points={getRowSparklinePoints(sViews)} fill="none" stroke="currentColor" strokeWidth="1" />
                          </svg>
                          <span className="text-[9px] text-neutral-400 font-bold">{sViews.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div>
                          <span className="text-[10px] text-white font-bold block">{sShares.toLocaleString()}</span>
                          <span className="text-[8px] text-emerald-400 block font-bold mt-0.5">{cRate}% rate</span>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2.5">
                          {!story.isApproved && (
                            <button 
                              onClick={() => handleApprove(story._id)} 
                              title="Approve Submission"
                              className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => openEditDrawer(story)} 
                            title="Edit Telemetry & Content"
                            className="p-2 hover:bg-white/5 text-neutral-400 hover:text-white rounded-lg transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(story._id)} 
                            title="Purge Record"
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filteredStories.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-[10px] text-neutral-500 uppercase font-mono">
                      No records matched current search filter parameters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* --- MOBILE CARDS VIEW --- */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-10 text-center bg-neutral-950 border border-neutral-900 rounded-3xl">
            <Loader2 className="animate-spin mx-auto text-red-500" />
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="p-10 text-center text-xs font-mono uppercase text-neutral-500 bg-neutral-950 border border-neutral-900 rounded-3xl">
            No Stories Found
          </div>
        ) : (
          filteredStories.map((story) => {
            const sViews = story.views || 0;
            const sShares = story.shares || 0;
            const cRate = sViews > 0 ? ((sShares / sViews) * 100).toFixed(1) : "0.0";
            return (
              <div 
                key={story._id} 
                className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-4 font-mono relative overflow-hidden" 
                id={`story-card-${story._id}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 border border-neutral-850 ring-2 ring-red-500/10">
                      <AvatarImage src={story.avatar} className="object-cover" />
                      <AvatarFallback className="bg-neutral-900 text-neutral-500 text-[9px]">{story.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-white truncate">{story.name}</p>
                      <p className="text-[8px] text-neutral-500 mt-0.5 truncate">{story.handle}</p>
                    </div>
                  </div>

                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0",
                    story.isApproved 
                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" 
                      : "bg-yellow-500/5 border-yellow-500/15 text-yellow-500 animate-pulse"
                  )}>
                    {story.exam}
                  </span>
                </div>

                <div className="bg-neutral-900/40 p-3 rounded-xl border border-neutral-900/60 space-y-2">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Headline details</p>
                  <p className="text-[10px] font-bold text-white leading-tight">{story.heroTitle}</p>
                  
                  <div className="flex justify-between items-center text-[8px] text-neutral-400 pt-2 border-t border-neutral-900/60">
                    <span>Rank/Score: <strong className="text-white">{story.rank}</strong></span>
                    <span>Conversion: <strong className="text-emerald-400">{cRate}%</strong></span>
                    <span>Views: <strong className="text-white">{sViews}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!story.isApproved && (
                    <button 
                      onClick={() => handleApprove(story._id)} 
                      className="flex-1 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-500/10 transition-colors"
                    >
                      <CheckCircle2 size={12} /> Approve
                    </button>
                  )}
                  <button 
                    onClick={() => openEditDrawer(story)} 
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-neutral-850 transition-colors"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(story._id)} 
                    className="flex-1 py-2.5 bg-red-600/5 hover:bg-red-600/10 text-red-500 rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-red-500/10 transition-colors"
                  >
                    <Trash2 size={12} /> Purge
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- SLIDING DRAWER CONFIGURATION CONSOLE (CREATE / EDIT) --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[200] flex" onClick={() => setIsDrawerOpen(false)}>
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" />

            {/* Slider Panel */}
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
                    {editId ? "Edit_Story_Console" : "New_Story_Deployment"}
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Navigation Tabs in drawer (only show analytics if editing) */}
              {editId && (
                <div className="flex border-b border-neutral-900 bg-neutral-950/60 px-4 py-2 shrink-0 gap-2 font-mono">
                  {(["form", "analytics"] as const).map((tab) => {
                    const isActive = drawerTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setDrawerTab(tab)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all tracking-wider border border-transparent",
                          isActive 
                            ? "bg-red-500/5 border-red-500/25 text-white" 
                            : "text-neutral-500 hover:text-neutral-300"
                        )}
                      >
                        {tab === "form" ? "Content Details" : "Marketing Telemetry"}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-36">
                
                {/* TAB 1: FORM DETAILS */}
                {drawerTab === "form" && (
                  <form onSubmit={handleSubmit} className="space-y-6 font-mono">
                    
                    {/* Basic info section */}
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                        <User size={12} className="text-red-400" />
                        Student Credentials & Exam Details
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[8px] text-neutral-500 uppercase">Student Name</span>
                          <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            placeholder="e.g. John Doe" 
                            className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[11px] h-11 font-bold" 
                            required 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[8px] text-neutral-500 uppercase">Social Handle</span>
                          <Input 
                            value={formData.handle} 
                            onChange={(e) => setFormData({...formData, handle: e.target.value})} 
                            placeholder="e.g. @johndoe" 
                            className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[11px] h-11 font-bold" 
                            required 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[8px] text-neutral-500 uppercase">Exam Target</span>
                          <div className="relative">
                            <select 
                              value={formData.exam} 
                              onChange={(e) => setFormData({...formData, exam: e.target.value})} 
                              className="w-full bg-neutral-900 border border-neutral-850 focus:border-red-500/40 h-11 rounded-xl px-4 text-xs font-bold text-neutral-300 appearance-none cursor-pointer" 
                              required
                            >
                              <option value="">Select Exam</option>
                              {EXAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[8px] text-neutral-500 uppercase">Score / Rank</span>
                          <Input 
                            value={formData.rank} 
                            onChange={(e) => setFormData({...formData, rank: e.target.value})} 
                            placeholder="e.g. 1580 Score / Rank 1" 
                            className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[11px] h-11 font-bold" 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Headline and journeys */}
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                        <Trophy size={12} className="text-yellow-500" />
                        Headline & Brief summary
                      </h4>

                      <div className="space-y-1.5">
                        <span className="text-[8px] text-neutral-500 uppercase">Story Highlight Headline</span>
                        <Input 
                          value={formData.headline} 
                          onChange={(e) => setFormData({...formData, headline: e.target.value})} 
                          placeholder="e.g. How John crushed the SAT Exam in 14 Days" 
                          className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[11px] h-11 font-bold" 
                          required 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[8px] text-neutral-500 uppercase">Brief Summary</span>
                        <Textarea 
                          value={formData.summary} 
                          onChange={(e) => setFormData({...formData, summary: e.target.value})} 
                          placeholder="Provide a quick editorial overview of this success story..." 
                          className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[10px] min-h-[80px]" 
                          required 
                        />
                      </div>
                    </div>

                    {/* Three phases structured content */}
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                        <Star size={12} className="text-purple-400" />
                        Step-by-Step Student Journey
                      </h4>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[8px] text-neutral-500 uppercase block font-bold">Phase 1: The Challenge</span>
                          <Textarea 
                            value={formData.challenge} 
                            onChange={(e) => setFormData({...formData, challenge: e.target.value})} 
                            placeholder="What challenges did the student encounter prior to using PaperTube?" 
                            className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[10px] min-h-[90px]" 
                            required 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[8px] text-neutral-500 uppercase block font-bold">Phase 2: The Solution</span>
                          <Textarea 
                            value={formData.solution} 
                            onChange={(e) => setFormData({...formData, solution: e.target.value})} 
                            placeholder="How did PaperTube help solve these problems? Mention notes/materials used." 
                            className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[10px] min-h-[90px]" 
                            required 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[8px] text-neutral-500 uppercase block font-bold">Phase 3: The Result</span>
                          <Textarea 
                            value={formData.result} 
                            onChange={(e) => setFormData({...formData, result: e.target.value})} 
                            placeholder="What score, success or results were achieved in the end?" 
                            className="bg-neutral-900 border-neutral-850 focus:border-red-500/40 text-[10px] min-h-[90px]" 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image visual uploader */}
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                        <Camera size={12} className="text-emerald-400" />
                        Student Profile Image
                      </h4>

                      <div className="flex items-center gap-5 p-5 bg-neutral-900/40 border border-neutral-900 rounded-2xl">
                        {previewUrl ? (
                          <div className="relative h-20 w-20 shrink-0">
                            <img src={previewUrl} className="h-full w-full object-cover rounded-xl border border-red-500/30" />
                            <button 
                              type="button" 
                              onClick={() => { setFormData({...formData, avatarFile: null}); setPreviewUrl(formData.existingAvatar || null); }} 
                              className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5 text-white border border-neutral-950"
                            >
                              <X size={10}/>
                            </button>
                          </div>
                        ) : (
                          <div className="h-20 w-20 bg-neutral-900 border border-neutral-850 rounded-xl flex items-center justify-center text-neutral-600 shrink-0">
                            <Camera size={24}/>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-bold uppercase text-neutral-500 mb-1">Upload New Picture</p>
                          <input 
                            type="file" 
                            onChange={(e) => { if(e.target.files?.[0]) { setFormData({...formData, avatarFile: e.target.files[0]}); setPreviewUrl(URL.createObjectURL(e.target.files[0])); }}} 
                            accept="image/*" 
                            className="text-[9px] text-neutral-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[8px] file:font-mono file:font-bold file:bg-neutral-850 file:text-white file:cursor-pointer hover:file:bg-neutral-800" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      disabled={submitting} 
                      className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest rounded-2xl flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin text-white" size={16} />
                      ) : editId ? (
                        <>Execute Database Sync</>
                      ) : (
                        <>Deploy Success Story</>
                      )}
                    </Button>
                  </form>
                )}

                {/* TAB 2: ANALYTICS DETAILS */}
                {drawerTab === "analytics" && editId && (
                  <div className="space-y-6 font-mono text-[10px]">
                    
                    {/* Metrics stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-900/30 border border-neutral-900 p-4 rounded-xl">
                        <span className="text-[7px] text-neutral-500 uppercase block">Views Count</span>
                        <span className="text-xl font-bold text-white mt-1 block">
                          {((stories.find(s => s._id === editId)?.views) || 0).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="bg-neutral-900/30 border border-neutral-900 p-4 rounded-xl">
                        <span className="text-[7px] text-neutral-500 uppercase block">Share Count</span>
                        <span className="text-xl font-bold text-neutral-400 mt-1 block">
                          {((stories.find(s => s._id === editId)?.shares) || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-neutral-900/30 border border-neutral-900 p-4 rounded-xl col-span-2">
                        <span className="text-[7px] text-neutral-500 uppercase block">Conversion Percentage</span>
                        <span className="text-xl font-bold text-emerald-400 mt-1 block">
                          {(() => {
                            const match = stories.find(s => s._id === editId);
                            const views = match?.views || 0;
                            const shares = match?.shares || 0;
                            return views > 0 ? ((shares / views) * 100).toFixed(1) : "0.0";
                          })()}% conversion rate
                        </span>
                      </div>
                    </div>

                    {/* Acquisition channels */}
                    <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-4">
                      <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                        <BarChart2 size={12} className="text-purple-400" />
                        Referral Entry Points
                      </h4>
                      
                      <div className="space-y-3">
                        {[
                          { name: "Organic Search", pct: 55, color: "bg-blue-500" },
                          { name: "Direct Link Share", pct: 25, color: "bg-purple-500" },
                          { name: "Social Channels", pct: 15, color: "bg-pink-500" },
                          { name: "Newsletter Click", pct: 5, color: "bg-orange-500" }
                        ].map(ch => (
                          <div key={ch.name} className="space-y-1.5">
                            <div className="flex justify-between text-[8px] text-neutral-400">
                              <span>{ch.name}</span>
                              <span>{ch.pct}%</span>
                            </div>
                            <div className="h-1 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                              <div className={cn("h-full rounded-full", ch.color)} style={{ width: `${ch.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Insights specific to this story */}
                    <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-3">
                      <h4 className="text-[9px] font-bold text-white uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-2">
                        <Zap size={12} className="text-yellow-500" />
                        AI Marketing Diagnostics
                      </h4>

                      <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl">
                        <p className="text-[8px] text-neutral-400 leading-relaxed">
                          This student journey outlines achievement in <strong className="text-white">
                            {stories.find(s => s._id === editId)?.exam}
                          </strong> with a score of <strong className="text-white">{stories.find(s => s._id === editId)?.rank}</strong>. Because high score vectors drive conversions 18% better on direct channels, management recommends copying the resource public link and embedding it directly inside SAT/exam note landing pages.
                        </p>
                      </div>
                    </div>

                    {/* Control Actions */}
                    <div className="space-y-2 pt-2 border-t border-neutral-900/60">
                      <button
                        onClick={() => {
                          const item = stories.find(s => s._id === editId);
                          if (item) copyStoryPublicLink(item);
                        }}
                        className="w-full py-3.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        <Copy size={12} />
                        Copy Public Resource Link
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}