"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Grid,
  List,
  Lock,
  User,
  Trash2,
  Clock,
  ChevronRight,
  Loader2,
  GraduationCap,
  Zap,
  Target,
  Languages
} from "lucide-react";
import api from "@/config/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StudyWorkspaceProps {
  savedHomeworks: any[];
  savedMaths: any[];
  savedPlans: any[];
  savedLessons: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onLoadHomework: (hw: any) => void;
  onLoadMath: (math: any) => void;
  onLoadLesson: (lesson: any) => void;
  onLoadPlan: (plan: any) => void;
}

const CATEGORY_TABS = [
  { id: "all", label: "All Study Docs", icon: GraduationCap, color: "#ec4899" }, // pink
  { id: "homework", label: "Homework", icon: GraduationCap, color: "#a855f7" }, // purple
  { id: "math", label: "Math Solver", icon: Zap, color: "#10b981" }, // emerald
  { id: "planner", label: "Prep Plans", icon: Target, color: "#f59e0b" }, // amber
  { id: "tutor", label: "Language Lessons", icon: Languages, color: "#6366f1" } // indigo
];

export default function StudyWorkspace({
  savedHomeworks,
  savedMaths,
  savedPlans,
  savedLessons,
  isLoading,
  onRefresh,
  onLoadHomework,
  onLoadMath,
  onLoadLesson,
  onLoadPlan
}: StudyWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Authenticate check
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  // Format date helper
  const formatTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  // Build unified items array with categories
  const allItems = useMemo(() => {
    const hwMapped = savedHomeworks.map(item => ({
      ...item,
      category: "homework",
      label: "Homework Guide",
      icon: GraduationCap,
      color: "#a855f7",
      onClick: () => onLoadHomework(item),
      subtitle: item.question || ""
    }));

    const mathMapped = savedMaths.map(item => ({
      ...item,
      category: "math",
      label: "Math Solution",
      icon: Zap,
      color: "#10b981",
      onClick: () => onLoadMath(item),
      subtitle: item.image ? "🖼️ Image Problem" : (item.question || "")
    }));

    const planMapped = savedPlans.map(item => ({
      ...item,
      category: "planner",
      label: "Prep Plan",
      icon: Target,
      color: "#f59e0b",
      onClick: () => onLoadPlan(item),
      subtitle: `Exam: ${item.examName || ""} · ${item.prepLevel || ""}`
    }));

    const lessonMapped = savedLessons.map(item => ({
      ...item,
      category: "tutor",
      label: "Language Lesson",
      icon: Languages,
      color: "#6366f1",
      onClick: () => onLoadLesson(item),
      subtitle: `Topic: ${item.topic || ""} · Target: ${item.targetLanguage || ""}`
    }));

    // Combine and sort by date descending
    return [...hwMapped, ...mathMapped, ...planMapped, ...lessonMapped].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [savedHomeworks, savedMaths, savedPlans, savedLessons, onLoadHomework, onLoadMath, onLoadLesson, onLoadPlan]);

  // Filter items by tab and search query
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [allItems, activeTab, searchQuery]);

  // Handle item deletion
  const handleDelete = async (id: string, category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete this ${category} document?`)) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      let endpoint = `/study/homework/${id}`;
      if (category === "math") endpoint = `/study/math/${id}`;
      else if (category === "planner") endpoint = `/study/planner/${id}`;
      else if (category === "tutor") endpoint = `/study/tutor/${id}`;

      const res = await api.delete(endpoint, { headers: { Auth: token } });
      if (res.data.success) {
        toast.success("Document deleted successfully");
        onRefresh();
      } else {
        toast.error(res.data.message || "Failed to delete document");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting document");
    }
  };

  if (isAuthenticated === false) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center space-y-4 max-w-sm p-6 bg-neutral-900/40 border border-white/10 rounded-3xl backdrop-blur-md">
          <div className="w-12 h-12 bg-pink-600/10 rounded-2xl mx-auto flex items-center justify-center border border-pink-600/20 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
            <Lock className="w-6 h-6 text-pink-500" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-md font-bold text-white">Access Locked</h4>
            <p className="text-xs text-neutral-500">Sign in to save and sync your study guides, math sheets, and planners.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full bg-[#050505] text-white py-12 px-4 md:px-8 border-t border-white/[0.04] mt-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="text-pink-500 animate-pulse" size={20} /> Your Personal Study Suite Library
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Review, load, and manage your saved AI homework sheets, math solutions, and planners.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search study guides..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.07] focus:border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 outline-none transition-all"
              />
            </div>

            {/* View Mode */}
            <div className="flex bg-neutral-900 border border-white/5 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300")}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === "list" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300")}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 border-b border-white/[0.02] pb-4 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",
                  isActive
                    ? "bg-white text-black border-white shadow-lg"
                    : "bg-white/[0.02] text-neutral-400 border-white/[0.06] hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <IconComponent size={13} style={{ color: isActive ? "#000" : tab.color }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center">
            <Loader2 className="text-pink-500 animate-spin" size={24} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="w-full text-center py-16 bg-neutral-900/20 border border-white/[0.04] rounded-3xl p-6">
            <GraduationCap className="mx-auto text-neutral-700 mb-4" size={32} />
            <h4 className="text-sm font-bold text-white">No documents found</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
              {searchQuery ? "No matches for your search query." : "Generate your first study document above and it will be stored here."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={item.onClick}
                    className="group cursor-pointer flex flex-col h-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:border-pink-500/20 hover:bg-white/[0.03] transition-all relative overflow-hidden shadow-xl"
                  >
                    {/* Glowing effect inside card */}
                    <div
                      className="absolute -right-12 -top-12 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
                      style={{ backgroundColor: item.color }}
                    />

                    {/* Top Action & Type Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border"
                        style={{
                          color: item.color,
                          backgroundColor: `${item.color}15`,
                          borderColor: `${item.color}30`
                        }}
                      >
                        <IconComponent size={9} />
                        {item.label}
                      </div>

                      <button
                        onClick={e => handleDelete(item._id, item.category, e)}
                        className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* Content details */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-[13px] leading-snug text-white group-hover:text-pink-300 transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-neutral-500 line-clamp-1 italic mt-2">
                          {item.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-[9px] text-neutral-500 font-bold uppercase">
                        <span className="flex items-center gap-1">
                          <User size={10} /> Mine
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={9} /> {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* List View Layout */
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={item.onClick}
                    className="group cursor-pointer flex items-center bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] hover:border-pink-500/10 rounded-xl p-3.5 justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Icon container */}
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${item.color}10`,
                          borderColor: `${item.color}25`,
                          color: item.color
                        }}
                      >
                        <IconComponent size={18} />
                      </div>

                      {/* Metadata details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="font-bold text-xs text-white group-hover:text-pink-300 transition-colors truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[9px] text-neutral-500 uppercase font-bold flex-wrap">
                          <span style={{ color: item.color }}>{item.label}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-neutral-800" />
                          <span className="truncate max-w-[200px] italic">"{item.subtitle}"</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-neutral-800" />
                          <span>{formatTimeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={e => handleDelete(item._id, item.category, e)}
                        className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center text-neutral-500">
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
