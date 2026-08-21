"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Sparkles, 
  BookOpen, 
  History, 
  Heart, 
  LayoutGrid, 
  Code2, 
  FileText, 
  GraduationCap, 
  Settings, 
  Trophy, 
  MessageSquare, 
  Gift, 
  Users, 
  Zap, 
  ChevronRight, 
  Menu as MenuIcon, 
  Crown, 
  PanelLeftClose, 
  PanelLeftOpen, 
  LogOut, 
  User as UserIcon,
  Presentation,
  GitBranch,
  PenTool,
  Youtube,
  HelpCircle,
  Layers,
  Calculator,
  Calendar,
  Languages,
  ShieldAlert,
  FileSearch,
  Newspaper,
  Search,
  Trash2,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";
import { toast } from "sonner";

interface DesktopSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  isLoggedIn: boolean;
  user: any;
  tokenInfo: any;
  onLogout: () => void;
  onOpenLogin: () => void;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 340,
  damping: 32,
  mass: 0.8
};

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "";
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function DesktopSidebar({
  isExpanded,
  onToggle,
  isLoggedIn,
  user,
  tokenInfo,
  onLogout,
  onOpenLogin
}: DesktopSidebarProps) {
  const pathname = usePathname();

  // Dynamic User details & plan status from backend data
  const userName = isLoggedIn ? (user?.name || "User") : "Guest User";
  const userAvatar = user?.picture || "/avatar.png";
  const isPro = Boolean(user?.membership?.isActive || tokenInfo?.isSubscribed);
  const planName = user?.membership?.planName || tokenInfo?.planName || (isPro ? "Pro Scholar" : "Free Plan");

  // History / Creations State
  const [creations, setCreations] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'notes' | 'ppt' | 'quiz' | 'flashcard' | 'diagram' | 'study'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch creations from backend or local storage
  const fetchCreations = useCallback(async () => {
    if (isLoggedIn) {
      try {
        setHistoryLoading(true);
        const token = localStorage.getItem("authToken");
        const res = await api.get(`/users/creations/recent?limit=25&type=${historyFilter}&search=${encodeURIComponent(historySearch)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setCreations(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load user creations:", err);
      } finally {
        setHistoryLoading(false);
      }
    } else {
      // Guest local fallback
      try {
        const local = localStorage.getItem("paperxify_local_history");
        if (local) {
          const parsed = JSON.parse(local);
          let filtered = parsed;
          if (historyFilter !== 'all') {
            filtered = filtered.filter((i: any) => i.type === historyFilter);
          }
          if (historySearch) {
            filtered = filtered.filter((i: any) => i.title?.toLowerCase().includes(historySearch.toLowerCase()));
          }
          setCreations(filtered.slice(0, 15));
        } else {
          setCreations([]);
        }
      } catch {
        setCreations([]);
      }
    }
  }, [isLoggedIn, historyFilter, historySearch]);

  useEffect(() => {
    fetchCreations();
    const handleCreationSaved = () => fetchCreations();
    window.addEventListener("creation-saved", handleCreationSaved);
    return () => window.removeEventListener("creation-saved", handleCreationSaved);
  }, [fetchCreations]);

  // Delete creation handler
  const handleDeleteCreation = async (type: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setDeletingId(id);
      if (isLoggedIn) {
        const token = localStorage.getItem("authToken");
        await api.delete(`/users/creations/${type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setCreations(prev => prev.filter(item => item.id !== id && item._id !== id));
      toast.success("Removed from history");
    } catch {
      toast.error("Failed to delete creation");
    } finally {
      setDeletingId(null);
    }
  };

  const getCreationIcon = (type: string) => {
    switch (type) {
      case 'notes':
        return <Youtube size={13} className="text-red-500 shrink-0" />;
      case 'presentation':
      case 'ppt':
        return <Presentation size={13} className="text-orange-400 shrink-0" />;
      case 'quiz':
        return <HelpCircle size={13} className="text-purple-400 shrink-0" />;
      case 'flashcard':
        return <Layers size={13} className="text-blue-400 shrink-0" />;
      case 'diagram':
        return <GitBranch size={13} className="text-emerald-400 shrink-0" />;
      case 'study':
        return <GraduationCap size={13} className="text-cyan-400 shrink-0" />;
      default:
        return <Sparkles size={13} className="text-amber-400 shrink-0" />;
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 260 : 64 }}
      transition={springTransition}
      className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-[110] bg-[#070707] border-r border-white/[0.08] font-sans select-none shadow-[4px_0_24px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      {/* ──── TOP HEADER: LOGO & COLLAPSE TOGGLE ──── */}
      <div className={cn(
        "h-14 flex items-center border-b border-white/[0.06] shrink-0",
        isExpanded ? "justify-between px-3.5" : "justify-center px-2"
      )}>
        {isExpanded ? (
          <>
            <Link href="/" className="flex items-center gap-1.5 group min-w-0">
              <span className="text-[15px] font-black italic tracking-tight uppercase text-white whitespace-nowrap">
                Paper<span className="text-[#ef4444]">xify</span>
              </span>
              <span className="text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                AI
              </span>
            </Link>

            <button
              onClick={onToggle}
              title="Collapse sidebar"
              className="w-7 h-7 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
          >
            <PanelLeftOpen size={17} />
          </button>
        )}
      </div>

      {/* ──── SCROLLABLE NAVIGATION LIST ──── */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 no-scrollbar">
        
        {/* ─── 1. CORE WORKSPACE ─── */}
        <div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5 whitespace-nowrap overflow-hidden"
              >
                CORE WORKSPACE
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            <SidebarCardItem
              href="/"
              icon={<Home size={15} />}
              label="Dashboard"
              active={pathname === "/" || pathname === "/dashboard"}
              isExpanded={isExpanded}
              rightElement={<MenuIcon size={12} className="text-red-500/80" />}
              variant="active-dashboard"
            />
            <SidebarCardItem
              href="/youtube-to-notes"
              icon={<Youtube size={15} className="text-red-500" />}
              label="YouTube to Notes"
              active={pathname === "/youtube-to-notes"}
              isExpanded={isExpanded}
              badge="CORE"
              variant="study-suite"
            />
            <SidebarCardItem
              href="/presentation-generator"
              icon={<Presentation size={15} className="text-orange-400" />}
              label="AI Presentation (PPT)"
              active={pathname === "/presentation-generator"}
              isExpanded={isExpanded}
              badge="HOT"
              variant="card"
            />
            <SidebarCardItem
              href="/profile"
              icon={<BookOpen size={15} />}
              label="Backpack Library"
              active={pathname === "/profile"}
              isExpanded={isExpanded}
              rightElement={<ChevronRight size={13} className="text-neutral-500" />}
              variant="card"
            />
          </div>
        </div>

        {/* ─── 2. RECENT CREATIONS & HISTORY ─── */}
        <div>
          <div className={cn("flex items-center justify-between px-2.5 mb-1.5", !isExpanded && "justify-center px-0")}>
            {isExpanded ? (
              <>
                <button
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                  className="flex items-center gap-1.5 text-[9.5px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <History size={11} className="text-red-500" />
                  <span>RECENT CREATIONS ({creations.length})</span>
                  {historyExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={fetchCreations}
                    title="Refresh history"
                    className="p-1 rounded text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <RefreshCw size={11} className={cn(historyLoading && "animate-spin text-red-400")} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onToggle}
                title="Expand to view Recent History"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <History size={15} className="text-red-400" />
              </button>
            )}
          </div>

          {isExpanded && historyExpanded && (
            <div className="space-y-1.5 pt-0.5">
              {/* Search & Filter pills */}
              <div className="space-y-1.5 px-0.5">
                <div className="relative">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search creations..."
                    className="w-full bg-[#0e0e0e] border border-white/[0.06] focus:border-white/20 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[9.5px]">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'notes', label: 'Notes' },
                    { id: 'ppt', label: 'PPT' },
                    { id: 'quiz', label: 'Quiz' },
                    { id: 'flashcard', label: 'Flash' },
                    { id: 'diagram', label: 'Diagram' },
                    { id: 'study', label: 'Study' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setHistoryFilter(f.id as any)}
                      className={cn(
                        "px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition-all cursor-pointer",
                        historyFilter === f.id
                          ? "bg-red-500/15 border border-red-500/30 text-red-400"
                          : "bg-white/[0.03] hover:bg-white/[0.07] text-neutral-400 hover:text-white"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-0.5 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-4 text-neutral-500 text-xs gap-2">
                    <Loader2 size={13} className="animate-spin text-red-400" />
                    <span>Loading history...</span>
                  </div>
                ) : creations.length === 0 ? (
                  <div className="p-3 text-center bg-[#0d0d0d] border border-white/[0.04] rounded-xl text-[11px] text-neutral-500">
                    <p>No creations found</p>
                    <Link href="/youtube-to-notes" className="text-[10px] text-red-400 hover:underline mt-1 inline-block">
                      Generate your first note →
                    </Link>
                  </div>
                ) : (
                  creations.map((item) => (
                    <Link
                      key={item.id || item._id}
                      href={item.url || `/notes/${item.slug}`}
                      className="group flex items-center justify-between p-1.5 rounded-lg bg-[#0e0e0e]/80 hover:bg-[#151515] border border-white/[0.04] hover:border-white/10 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <div className="p-1 rounded bg-black/40 border border-white/[0.06] shrink-0">
                          {getCreationIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11.5px] font-medium text-neutral-200 group-hover:text-white truncate leading-tight">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9.5px] text-neutral-500 mt-0.5">
                            <span>{item.typeLabel || item.type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={8.5} />
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDeleteCreation(item.type, item.id || item._id, e)}
                          title="Delete"
                          disabled={deletingId === (item.id || item._id)}
                          className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                        <div className="p-1 text-neutral-400 group-hover:text-white">
                          <ArrowUpRight size={11} />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* View all button */}
              {creations.length > 0 && (
                <Link
                  href="/profile"
                  className="w-full flex items-center justify-center gap-1 py-1 text-[10.5px] font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  <span>View All in Backpack Library</span>
                  <ChevronRight size={11} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ─── 2. AI STUDY ROOM ─── */}
        <div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5 whitespace-nowrap overflow-hidden"
              >
                AI STUDY ROOM
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-0.5">
            <SidebarListItem
              href="/ai-study/homework-helper"
              icon={<GraduationCap size={15} />}
              label="Homework Helper"
              active={pathname === "/ai-study/homework-helper"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/ai-study/math-solver"
              icon={<Calculator size={15} />}
              label="AI Math Solver"
              active={pathname === "/ai-study/math-solver"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/ai-study/exam-planner"
              icon={<Calendar size={15} />}
              label="Exam Prep Planner"
              active={pathname === "/ai-study/exam-planner"}
              badge="NEW"
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/ai-study/language-tutor"
              icon={<Languages size={15} />}
              label="AI Language Tutor"
              active={pathname === "/ai-study/language-tutor"}
              badge="AUDIO"
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/youtube-to-quiz"
              icon={<HelpCircle size={15} />}
              label="YouTube to Quiz"
              active={pathname === "/youtube-to-quiz"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/youtube-to-flashcards"
              icon={<Layers size={15} />}
              label="AI Flashcards"
              active={pathname === "/youtube-to-flashcards"}
              isExpanded={isExpanded}
            />
          </div>
        </div>

        {/* ─── 3. AI WRITER & DIAGRAMS ─── */}
        <div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5 whitespace-nowrap overflow-hidden"
              >
                WRITER & DIAGRAMS
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-0.5">
            <SidebarListItem
              href="/ai-writer/ai-detector"
              icon={<ShieldAlert size={15} />}
              label="AI Detector & Certs"
              active={pathname === "/ai-writer/ai-detector"}
              badge="VERIFIED"
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/ai-writer/ai-humanizer"
              icon={<Sparkles size={15} />}
              label="AI Humanizer"
              active={pathname === "/ai-writer/ai-humanizer"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/ai-writer/essay-writer"
              icon={<FileText size={15} />}
              label="AI Essay Writer"
              active={pathname === "/ai-writer/essay-writer"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/ai-writer/plagiarism"
              icon={<FileSearch size={15} />}
              label="Plagiarism Checker"
              active={pathname === "/ai-writer/plagiarism"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/ai-diagram"
              icon={<GitBranch size={15} />}
              label="AI Mind Maps & Charts"
              active={pathname.startsWith("/ai-diagram")}
              isExpanded={isExpanded}
            />
          </div>
        </div>

        {/* ─── 4. DEV TOOLS & COMMUNITY ─── */}
        <div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 mb-1.5 whitespace-nowrap overflow-hidden"
              >
                DEV UTILITIES & COMMUNITY
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-0.5">
            <SidebarListItem
              href="/tools"
              icon={<LayoutGrid size={15} />}
              label="All 25+ Developer Tools"
              active={pathname === "/tools"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/tools/code-to-image"
              icon={<Code2 size={15} />}
              label="Code to Image"
              active={pathname === "/tools/code-to-image"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/leaderboard"
              icon={<Trophy size={15} />}
              label="Global Leaderboard"
              active={pathname === "/leaderboard"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/success-stories"
              icon={<MessageSquare size={15} />}
              label="Success Stories"
              active={pathname === "/success-stories"}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/blog"
              icon={<Newspaper size={15} />}
              label="Blog & Tutorials"
              active={pathname.startsWith("/blog")}
              isExpanded={isExpanded}
            />
            <SidebarListItem
              href="/pricing"
              icon={<Zap size={15} />}
              label="Pricing & Plans"
              active={pathname === "/pricing"}
              isExpanded={isExpanded}
            />
          </div>
        </div>

        {/* ─── 4. UPGRADE TO PRO SCHOLAR CARD ─── */}
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="upgrade-expanded"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="bg-gradient-to-b from-[#180a0c] to-[#0c0506] border border-red-500/30 hover:border-red-500/50 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(239,68,68,0.12)] relative overflow-hidden transition-all group"
            >
              {/* Subtle top-right sparkle */}
              <Sparkles size={12} className="absolute top-2.5 right-2.5 text-red-500/40 pointer-events-none" />

              <div className="flex items-start gap-2.5 mb-2.5">
                {/* Crown Avatar Icon */}
                <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                  <Crown size={15} className="fill-amber-400/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      Upgrade to <span className="text-red-500">Pro Scholar</span>
                    </h4>
                    <ChevronRight size={12} className="text-neutral-500 group-hover:text-red-400 transition-colors" />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                    Unlock 120 Pro notes, slide decks, quizzes & priority AI!
                  </p>
                </div>
              </div>

              {/* Upgrade Button */}
              <Link
                href="/pricing"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <Zap size={13} className="fill-white" />
                <span>Upgrade Plan</span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="upgrade-collapsed"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              className="pt-1 flex justify-center"
            >
              <Link
                href="/pricing"
                title="Upgrade to Pro Scholar"
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all hover:scale-105"
              >
                <Crown size={14} className="fill-amber-300" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ──── 5. BOTTOM USER PROFILE & PLAN BAR ──── */}
      <div className="p-2.5 border-t border-white/[0.07] bg-[#090909] shrink-0">
        {isExpanded ? (
          isLoggedIn ? (
            /* Logged-In User Profile & Plan Status */
            <div className="bg-[#0e0e0e] border border-white/[0.06] rounded-2xl p-2.5 space-y-2">
              <div 
                onClick={() => {
                  window.location.href = "/profile";
                }} 
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full border border-neutral-700 overflow-hidden bg-neutral-800 shrink-0 group-hover:border-red-500 transition-colors">
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-red-400 transition-colors">
                      {userName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Crown size={10} className={cn(isPro ? "text-red-500 fill-red-500/20" : "text-neutral-500")} />
                      <span className={cn("text-[10px] font-semibold leading-none", isPro ? "text-red-500" : "text-neutral-400")}>
                        {planName}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={13} className="text-neutral-500 group-hover:text-white transition-colors shrink-0" />
              </div>

              {/* Plan Status Bar */}
              <div className="pt-1 border-t border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-medium text-neutral-400">
                  <span className={cn("w-1.5 h-1.5 rounded-full", isPro ? "bg-emerald-400" : "bg-neutral-500")} />
                  <span>{isPro ? "Full Scholar Suite" : "Standard Tier"}</span>
                </div>
                <Link
                  href="/pricing"
                  className={cn(
                    "text-[9.5px] font-bold px-2 py-0.5 rounded-md transition-all shrink-0 cursor-pointer",
                    isPro 
                      ? "text-neutral-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10" 
                      : "text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
                  )}
                >
                  {isPro ? "Manage" : "Upgrade →"}
                </Link>
              </div>
            </div>
          ) : (
            /* Guest / Not Logged In State */
            <div className="bg-[#0e0e0e] border border-white/[0.06] rounded-2xl p-3 space-y-2.5 text-center">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 shrink-0">
                  <UserIcon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight">Welcome to Paperxify</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5 truncate">Sign in to save study notes</p>
                </div>
              </div>

              <button
                onClick={onOpenLogin}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <UserIcon size={12} />
                <span>Sign In / Register</span>
              </button>
            </div>
          )
        ) : (
          /* Collapsed View */
          <div className="flex justify-center">
            {isLoggedIn ? (
              <button 
                onClick={() => {
                  window.location.href = "/profile";
                }}
                title={`${userName} (${planName})`}
                className="cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full border border-red-500/40 overflow-hidden bg-neutral-800 hover:border-red-500 transition-colors">
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                </div>
              </button>
            ) : (
              <button 
                onClick={onOpenLogin}
                title="Sign In / Register"
                className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] hover:border-red-500/50 hover:bg-red-500/10 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                <UserIcon size={15} />
              </button>
            )}
          </div>
        )}
      </div>

    </motion.aside>
  );
}

// ──── HELPER: CARD ITEM (MENU SECTION) ────
interface SidebarCardItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isExpanded: boolean;
  rightElement?: React.ReactNode;
  badge?: string;
  variant?: "active-dashboard" | "study-suite" | "card";
}

function SidebarCardItem({ href, icon, label, active, isExpanded, rightElement, badge, variant = "card" }: SidebarCardItemProps) {
  let containerStyle = "bg-[#0f0f0f] border border-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.04]";

  if (variant === "active-dashboard" || (active && variant !== "study-suite")) {
    containerStyle = "bg-red-950/20 border border-red-500/40 text-red-400 shadow-[inset_0_0_12px_rgba(239,68,68,0.08)] font-semibold";
  } else if (variant === "study-suite") {
    containerStyle = "bg-[#111111] border-l-2 border-red-500 text-white font-medium";
  }

  return (
    <Link
      href={href}
      title={!isExpanded ? label : undefined}
      className={cn(
        "flex items-center justify-between rounded-xl transition-all duration-200 group overflow-hidden",
        isExpanded ? "px-3 py-2 text-xs" : "justify-center p-2 text-xs",
        containerStyle
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 transition-transform group-hover:scale-105">
          {icon}
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="truncate leading-tight whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {isExpanded && (
        <div className="shrink-0 pl-1 flex items-center gap-1">
          {badge && (
            <span className={cn(
              "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
              badge === "CORE" ? "bg-red-500/15 border-red-500/30 text-red-400" :
              badge === "HOT" ? "bg-orange-500/15 border-orange-500/30 text-orange-400" :
              "bg-neutral-800 border-white/10 text-neutral-300"
            )}>
              {badge}
            </span>
          )}
          {rightElement}
        </div>
      )}
    </Link>
  );
}

// ──── HELPER: LIST ITEM (TOOLS & COMMUNITY SECTION) ────
interface SidebarListItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  isExpanded: boolean;
}

function SidebarListItem({ href, icon, label, badge, active, isExpanded }: SidebarListItemProps) {
  return (
    <Link
      href={href}
      title={!isExpanded ? label : undefined}
      className={cn(
        "flex items-center justify-between rounded-lg transition-all duration-200 group overflow-hidden",
        isExpanded ? "px-2.5 py-1.5 text-xs" : "justify-center p-2 text-xs",
        active
          ? "bg-red-500/10 text-red-400 font-semibold"
          : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 transition-colors group-hover:text-white">
          {icon}
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="truncate leading-tight whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {isExpanded && badge && (
        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
          {badge}
        </span>
      )}
    </Link>
  );
}
