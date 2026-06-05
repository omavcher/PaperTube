"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Globe, Zap, Eye, Heart, 
  TrendingUp, FileText, Flame, Clock, 
  Share2, Bookmark, Loader2, RefreshCw, Layers,
  Laptop, Code, Sparkles, Cpu, Atom, Activity,
  Grid, List, ArrowUpDown, ChevronRight, User, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// --- Types ---
interface Creator {
  _id: string;
  name: string;
  avatarUrl?: string;
  username?: string;
}

interface Note {
  _id: string;
  slug: string;
  title: string;
  content?: string;
  videoUrl?: string;
  updatedAt: string;
  createdAt: string;
  creator?: Creator;
  views?: number;
  thumbnail?: string;
  likes?: number;
  category?: string;
  type?: string;
}

interface ExploreResponse {
  success: boolean;
  data: {
    items: Note[];
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNext: boolean;
    };
  };
}

// --- Helpers ---
const getYouTubeThumbnail = (url: string | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` 
    : null;
};

const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } catch {
    return "";
  }
};

const CATEGORIES = ["All", "Tech", "Dev", "AI", "Finance", "Science", "General"];

const CATEGORY_ITEMS = [
  { id: "All", label: "All Topics", icon: Globe },
  { id: "Tech", label: "Tech", icon: Laptop },
  { id: "Dev", label: "Dev", icon: Code },
  { id: "AI", label: "AI", icon: Sparkles },
  { id: "Finance", label: "Finance", icon: TrendingUp },
  { id: "Science", label: "Science", icon: Atom },
  { id: "General", label: "General", icon: FileText }
];

const SORT_OPTIONS = [
  { label: "Latest", sortBy: "updatedAt", sortOrder: "desc", icon: Clock },
  { label: "Trending", sortBy: "views", sortOrder: "desc", icon: Flame },
  { label: "Most Liked", sortBy: "likes", sortOrder: "desc", icon: Heart },
  { label: "Oldest", sortBy: "updatedAt", sortOrder: "asc", icon: Clock },
];

interface ExploreClientProps {
  initialItems?: Note[];
  initialPagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
  };
}

// --- Sub-Component: Discovery Grid Card ---
const DiscoveryGridCard = React.memo(({
  note, searchQuery, onClick, highlightText
}: {
  note: Note; searchQuery: string;
  onClick: (note: Note) => void;
  highlightText: (text: string, highlight: string) => string | React.ReactNode;
}) => {
  const thumbnail = note.thumbnail || getYouTubeThumbnail(note.videoUrl);
  return (
    <motion.div
      onClick={() => onClick(note)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group cursor-pointer flex flex-col h-full relative rounded-2xl overflow-hidden animate-in fade-in duration-500"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(220,38,38,0.3), 0 8px 32px rgba(220,38,38,0.08)' }} />
      <div className="relative overflow-hidden bg-neutral-950 w-full aspect-video flex-shrink-0">
        {thumbnail ? (
          <img src={thumbnail} alt={note.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06] opacity-80 group-hover:opacity-100" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
              {note.type === 'flashcard' ? <Layers size={20} className="text-amber-500 opacity-60" /> : <FileText size={20} className="text-red-500 opacity-60" />}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${note.type === 'flashcard' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {note.type === 'flashcard' ? 'Cards' : (note.category || "General")}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 border border-white/5 text-neutral-400">
            {formatTimeAgo(note.updatedAt || note.createdAt)}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs bg-red-600 text-white backdrop-blur-md">
            <FileText size={13} /> View Note
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className="font-semibold text-white leading-snug group-hover:text-red-400 transition-colors duration-200 text-[13px] line-clamp-2 mb-3">
          {searchQuery ? highlightText(note.title, searchQuery) : note.title}
        </h3>
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5 border border-white/10 flex-shrink-0">
              <AvatarImage src={note.creator?.avatarUrl} />
              <AvatarFallback className="text-[8px] bg-neutral-800 text-neutral-400">{note.creator?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[80px]">@{note.creator?.username || 'anonymous'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-neutral-500 text-[10px] font-bold">
            {note.views !== undefined && note.views > 0 && (
              <span className="flex items-center gap-1"><Eye size={10} /> {note.views > 1000 ? `${(note.views/1000).toFixed(1)}k` : note.views}</span>
            )}
            <span className="flex items-center gap-1 group-hover:text-red-500 transition-colors"><Heart size={10} /> {note.likes || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
DiscoveryGridCard.displayName = "DiscoveryGridCard";

// --- Sub-Component: Discovery List Card ---
const DiscoveryListCard = React.memo(({
  note, searchQuery, onClick, highlightText
}: {
  note: Note; searchQuery: string;
  onClick: (note: Note) => void;
  highlightText: (text: string, highlight: string) => string | React.ReactNode;
}) => {
  const thumbnail = note.thumbnail || getYouTubeThumbnail(note.videoUrl);
  return (
    <motion.div
      onClick={() => onClick(note)}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="group cursor-pointer flex flex-row items-stretch relative rounded-xl overflow-hidden animate-in fade-in duration-500"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="relative overflow-hidden bg-neutral-950 w-20 sm:w-32 md:w-44 flex-shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        {thumbnail ? (
          <img src={thumbnail} alt={note.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-90" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center min-h-[70px]" style={{ background: 'linear-gradient(135deg,#0d0d0d,#111)' }}>
            <FileText size={16} style={{ color: '#dc2626', opacity: 0.4 }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 pointer-events-none" />
        <div className="absolute top-1.5 left-1.5">
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase border ${note.type === 'flashcard' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {note.type === 'flashcard' ? 'Cards' : (note.category || "General")}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex items-center px-4 py-3 gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="font-semibold text-white leading-snug group-hover:text-red-400 transition-colors duration-200 text-sm line-clamp-1">
            {searchQuery ? highlightText(note.title, searchQuery) : note.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-4 w-4 border border-white/10 flex-shrink-0">
                <AvatarImage src={note.creator?.avatarUrl} />
                <AvatarFallback className="text-[7px] bg-neutral-800 text-neutral-400">{note.creator?.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[120px]">@{note.creator?.username || 'anonymous'}</span>
            </div>
            <span className="w-0.5 h-0.5 rounded-full bg-neutral-700 hidden sm:block" />
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-neutral-600">
              <Clock size={9} /> {formatTimeAgo(note.updatedAt || note.createdAt)}
            </span>
            {note.views !== undefined && note.views > 0 && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-neutral-700 hidden md:block" />
                <span className="hidden md:flex items-center gap-1 text-[10px] text-neutral-600">
                  <Eye size={9} /> {note.views > 1000 ? `${(note.views/1000).toFixed(1)}k` : note.views}
                </span>
              </>
            )}
            <span className="w-0.5 h-0.5 rounded-full bg-neutral-700 hidden md:block" />
            <span className="hidden md:flex items-center gap-1 text-[10px] text-neutral-600 group-hover:text-red-500 transition-colors">
              <Heart size={9} /> {note.likes || 0}
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200" style={{ background: 'rgba(255,255,255,0.03)', color: '#555' }}>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
});
DiscoveryListCard.displayName = "DiscoveryListCard";

// --- Main Client Component ---
export default function ExploreClient({ 
  initialItems = [], 
  initialPagination = { currentPage: 1, totalPages: 1, hasNext: false } 
}: ExploreClientProps = {}) {
  const router = useRouter();
  
  // Logic State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [items, setItems] = useState<Note[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [page, setPage] = useState(initialPagination.currentPage);
  const [hasMore, setHasMore] = useState(initialPagination.hasNext);
  
  // UI/Filter State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [activeSort, setActiveSort] = useState(SORT_OPTIONS[0]);
  const [activeUsers, setActiveUsers] = useState(842);

  // Social Proof Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1. Auth Check
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  // 2. Fetch Data
  const fetchExploreData = useCallback(async (pageNum: number, append = false, search = '', sort = SORT_OPTIONS[0]) => {
    const token = localStorage.getItem('authToken');

    try {
      if (!append) setLoading(true);
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        type: 'notes',
        search: search
      });

      const headers: Record<string, string> = {};
      if (token) {
        headers['Auth'] = token;
      }

      const response = await api.get<ExploreResponse>(`/notes/explore?${params.toString()}`, {
        headers
      });

      if (response.data.success) {
        const { items: newItems, pagination } = response.data.data;
        setItems(prev => append ? [...prev, ...newItems] : newItems);
        setPage(pagination.currentPage);
        setHasMore(pagination.hasNext);
      }
    } catch (error) {
      console.error("Failed to fetch explore data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Category, Search & Sort Filter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialItems.length > 0 && searchQuery === '' && activeCat === "All" && activeSort.label === "Latest" && page === 1 && !loading) return;
      if (isAuthenticated !== null) {
        const queryWithCat = activeCat === "All" ? searchQuery.trim() : `${activeCat} ${searchQuery}`.trim();
        fetchExploreData(1, false, queryWithCat, activeSort);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCat, activeSort, isAuthenticated, fetchExploreData, initialItems.length]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      const queryWithCat = activeCat === "All" ? searchQuery.trim() : `${activeCat} ${searchQuery}`.trim();
      fetchExploreData(page + 1, true, queryWithCat, activeSort);
    }
  }, [hasMore, loading, page, activeCat, searchQuery, activeSort, fetchExploreData]);

  // Infinite Scroll Trigger
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, { threshold: 0.5 });
    
    const target = document.getElementById("infinite-scroll-trigger");
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  const highlightText = useCallback((text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return <>{parts.map((p, i) => p.toLowerCase() === highlight.toLowerCase() ? <mark key={i} className="bg-red-500/30 text-red-200 rounded px-0.5">{p}</mark> : p)}</>;
  }, []);

  const handleCardClick = useCallback((note: Note) => {
    if (note.type === 'flashcard') {
      router.push(`/flashcards/${note.slug}`);
    } else {
      router.push(`/note/${note.creator?.username || 'user'}/${note.slug}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans relative overflow-hidden">
      
      {/* Subtle Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent pointer-events-none opacity-60" />
      
      {/* --- HEADER BAR --- */}
      <div className="sticky top-0 z-40 w-full transform-gpu" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(220,38,38,0.5) 40%, rgba(220,38,38,0.5) 60%, transparent)' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 py-3 md:py-3.5">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl blur-md" style={{ background: 'rgba(220,38,38,0.4)' }} />
                <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#dc2626,#7f1d1d)', boxShadow: '0 0 0 1px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                  <Globe size={15} style={{ color: '#fff' }} />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[15px] font-bold tracking-tight text-white leading-none mb-0.5">Explore Workspace</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-red-500" />
                  <p className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {activeUsers.toLocaleString()} Systems Active
                  </p>
                </div>
              </div>
            </div>

            {/* === RIGHT: Search + Controls === */}
            <div className="flex items-center gap-2 flex-grow justify-end">
              {/* Search bar */}
              <div className="relative group hidden md:flex w-52 lg:w-64">
                <div className="flex items-center w-full h-9 px-3 rounded-xl transition-all duration-200 gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(220,38,38,0.45)'; e.currentTarget.style.background = 'rgba(220,38,38,0.04)'; }}
                  onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <Search size={13} style={{ color: '#555', flexShrink: 0 }} className="group-focus-within:!text-red-500 transition-colors" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search public notes…"
                    className="w-full bg-transparent border-none focus:outline-none text-[12px] text-white placeholder:text-neutral-600"
                    style={{ lineHeight: 1 }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="flex-shrink-0 text-neutral-600 hover:text-white transition-colors">
                      <X size={11} className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* View mode pills */}
              <div className="flex items-center rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {([['grid', Grid], ['list', List]] as const).map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode as 'grid' | 'list')}
                    className="p-2 transition-all duration-150"
                    style={viewMode === mode
                      ? { background: 'rgba(220,38,38,0.2)', color: '#f87171' }
                      : { color: 'rgba(255,255,255,0.3)' }
                    }
                  >
                    <Icon size={13} />
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    <ArrowUpDown size={11} />
                    <span className="hidden sm:inline">{activeSort.label}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0d0d0d] border-white/[0.08] text-white rounded-xl p-1.5 w-48 shadow-2xl z-50">
                  {SORT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <DropdownMenuItem key={opt.label} onClick={() => setActiveSort(opt)}
                        className={cn('text-[11px] font-medium rounded-lg cursor-pointer gap-2 px-3 py-2 focus:bg-white/5', activeSort.label === opt.label ? 'text-red-400' : 'text-neutral-400')}>
                        <Icon size={12} /> {opt.label}
                        {activeSort.label === opt.label && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* === MOBILE: Search row === */}
          <div className="md:hidden pb-2.5 flex items-center w-full">
            <div className="flex items-center h-8 px-2.5 rounded-xl gap-1.5 w-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Search size={12} style={{ color: '#555', flexShrink: 0 }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search public notes…"
                className="w-full bg-transparent border-none focus:outline-none text-[11px] text-white placeholder:text-neutral-600" />
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 min-h-[70vh] relative z-10">
        
        {/* Mobile Categories Scrollable List */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-4 pt-1 mb-2 custom-scrollbar shrink-0">
          {CATEGORY_ITEMS.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-1.5",
                  activeCat === cat.id
                    ? "bg-white text-black"
                    : "bg-white/5 text-neutral-400 border border-white/5"
                )}
              >
                <Icon size={10} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Layout container */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
          
          {/* DESKTOP CATEGORIES SIDEBAR */}
          <div className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 space-y-5 border-r border-white/[0.04] pr-6 lg:pr-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                <Globe size={12} /> Topics
              </h3>
            </div>
            
            <div className="flex flex-col gap-1">
              {CATEGORY_ITEMS.map(cat => {
                const Icon = cat.icon;
                const isSelected = activeCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border",
                      isSelected
                        ? "bg-white/5 border-white/10 text-white shadow-lg"
                        : "bg-transparent border-transparent text-neutral-400 hover:bg-white/[0.02] hover:text-white"
                    )}
                  >
                    <Icon size={14} className={isSelected ? "text-red-500" : "text-neutral-500"} />
                    <span className="flex-1 truncate">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* MAIN RESULTS GRID/LIST */}
          <div className="flex-1 min-w-0">
            
            {/* Results Count */}
            {!loading && items.length > 0 && (
              <div className="mb-5 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.6)]" />
                <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  {items.length} {items.length === 1 ? 'signal' : 'signals'} found
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
              </div>
            )}

            <AnimatePresence mode="wait">
              {loading && items.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-pulse aspect-[4/5]" />
                  ))}
                </div>
              ) : items.length > 0 ? (
                <motion.div 
                  key={`${viewMode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* GRID VIEW */}
                  {viewMode === "grid" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                      {items.map((note) => (
                        <DiscoveryGridCard 
                          key={note._id} 
                          note={note} 
                          searchQuery={searchQuery}
                          onClick={handleCardClick}
                          highlightText={highlightText}
                        />
                      ))}
                    </div>
                  )}

                  {/* LIST VIEW */}
                  {viewMode === "list" && (
                    <div className="flex flex-col gap-2 md:gap-2.5">
                      {items.map((note) => (
                        <DiscoveryListCard 
                          key={note._id} 
                          note={note} 
                          searchQuery={searchQuery}
                          onClick={handleCardClick}
                          highlightText={highlightText}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="py-24 md:py-32 flex justify-center"
                >
                  <div className="text-center py-20 text-neutral-600 border border-white/[0.06] bg-neutral-900/30 rounded-[2rem] p-8 max-w-sm w-full backdrop-blur-sm">
                     <Globe className="w-12 h-12 mx-auto mb-4 opacity-20 text-neutral-400" />
                     <h3 className="text-white text-lg font-bold tracking-tight">No signals found</h3>
                     <p className="text-neutral-400 text-xs mt-2 leading-relaxed">Try a different search query or select another topic.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- INFINITE SCROLL LOADER --- */}
            {hasMore && (
              <div id="infinite-scroll-trigger" className="flex justify-center mt-16 w-full py-8">
                {loading ? (
                   <Loader2 className="animate-spin text-red-500" size={32} />
                ) : (
                   <div className="h-1" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}