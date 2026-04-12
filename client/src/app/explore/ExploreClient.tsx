"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Globe, Zap, Eye, Heart, 
  TrendingUp, FileText, Flame, Clock, 
  Share2, Bookmark, Loader2, RefreshCw, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import api from "@/config/api"; // Ensure this path is correct
import { LoaderX } from "@/components/LoaderX";
// import Footer from "@/components/Footer"; // Uncomment if you have a footer

// --- Types (from your workspace) ---
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
  likes?: number; // Assuming API returns this, or defaulting to 0
  category?: string; // Assuming API returns this
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
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const CATEGORIES = ["All", "Tech", "Dev", "AI", "Finance", "Science"];

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

  // Handle Category, Search & Sort Filter (Server-side instead of client-side!)
  // Whenever category, search or sort changes, reset page and fetch:
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

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans">

      <main className="container mx-auto px-4 pt-24 pb-32 relative z-10 max-w-7xl">
        
        {/* --- HERO HEADER --- */}
        <div className="flex flex-col items-center text-center mb-20 space-y-6">
          
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-white/5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {activeUsers.toLocaleString()} Systems Active
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none">
            DISCOVER <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
              INTELLIGENCE
            </span>
          </h1>

          {/* Search Bar */}
          <div className="w-full max-w-xl relative mt-4 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/30 to-blue-600/30 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-700" />
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl flex items-center p-2 backdrop-blur-xl shadow-2xl">
              <Search className="ml-3 text-neutral-500 group-hover:text-white transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search protocols, notes, creators..." 
                className="w-full bg-transparent px-4 py-3 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="hidden sm:flex items-center gap-1 pr-2">
                 <span className="text-[10px] text-neutral-600 border border-neutral-800 rounded px-1.5 py-0.5">⌘K</span>
              </div>
            </div>
          </div>

          {/* Filters & Categories */}
          <div className="flex flex-col gap-4 w-full max-w-3xl pt-4">
            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border",
                    activeCat === cat 
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                      : "bg-neutral-900/50 text-neutral-500 border-white/5 hover:border-white/20 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {SORT_OPTIONS.map((sort) => {
                const Icon = sort.icon;
                const isActive = activeSort.label === sort.label;
                return (
                  <button
                    key={sort.label}
                    onClick={() => setActiveSort(sort)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border",
                      isActive 
                        ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
                        : "bg-transparent text-neutral-500 border-transparent hover:bg-white/5 hover:text-neutral-300"
                    )}
                  >
                    <Icon size={12} />
                    {sort.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-pulse">
                <div className="aspect-video bg-white/5 w-full"></div>
                <div className="p-5 flex flex-col flex-1 h-32 justify-between">
                  <div className="h-3 w-1/4 bg-white/10 rounded"></div>
                  <div className="h-4 w-full bg-white/10 rounded mt-3"></div>
                  <div className="h-4 w-3/4 bg-white/10 rounded mt-2"></div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex gap-2 items-center"><div className="w-5 h-5 rounded-full bg-white/10"></div><div className="w-12 h-3 bg-white/10 rounded"></div></div>
                    <div className="h-3 w-8 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6">
            <AnimatePresence>
              {items.map((note, i) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35 }}
                >
                  <DiscoveryCard note={note} router={router} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* --- INFINITE SCROLL LOADER --- */}
        {hasMore && (
          <div id="infinite-scroll-trigger" className="flex justify-center mt-16 w-full py-8">
            {loading ? (
               <Loader2 className="animate-spin text-red-500" size={32} />
            ) : (
               <div className="h-1" /> /* Sentinel */
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-20 text-neutral-600">
             <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
             <p className="text-sm">No signals found matching your query.</p>
          </div>
        )}

      </main>
      
      {/* <Footer /> */}
    </div>
  );
}

// --- SUB-COMPONENT: Minimalist Card ---
const DiscoveryCard = ({ note, router }: { note: Note; router: any }) => {
  const thumbnail = note.thumbnail || getYouTubeThumbnail(note.videoUrl);
  const formattedCreatorName = note.creator?.name?.toLowerCase().replace(/\s+/g, '-') || 'anonymous';
  
  return (
    <div 
      onClick={() => {
        if (note.type === 'flashcard') {
          router.push(`/flashcards/${note.slug}`);
        } else {
          router.push(`/note/${note.creator?.username || 'user'}/${note.slug}`);
        }
      }}
      className="group relative flex flex-col bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-neutral-900">
        {thumbnail ? (
           <img 
             src={thumbnail} 
             alt={note.title} 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
             loading="lazy"
           />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-white transition-colors shadow-inner border border-white/5">
              {note.type === 'flashcard' ? <Layers size={20} /> : <FileText size={20} />}
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Floating Time Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300 font-mono text-[9px] px-2 h-5">
             {formatTimeAgo(note.updatedAt || note.createdAt)}
          </Badge>
        </div>

        {/* Icon Overlay (Hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
              {note.type === 'flashcard' ? <Layers size={18} /> : <FileText size={18} />}
           </div>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
           <span className={`text-[9px] font-bold uppercase tracking-wider ${note.type === 'flashcard' ? 'text-amber-500' : 'text-red-500'}`}>
             {note.type === 'flashcard' ? 'Flashcards' : (note.category || "General")}
           </span>
           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1 group-hover:translate-y-0">
              <button className="text-neutral-400 hover:text-white"><Bookmark size={14} /></button>
              <button className="text-neutral-400 hover:text-white"><Share2 size={14} /></button>
           </div>
        </div>

        <h3 className="text-base font-semibold text-neutral-200 group-hover:text-white transition-colors line-clamp-2 leading-snug mb-4">
          {note.title}
        </h3>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          {/* Creator */}
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 border border-white/10">
              <AvatarImage src={note.creator?.avatarUrl} />
              <AvatarFallback className="text-[8px] bg-neutral-800 text-neutral-400">
                {note.creator?.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium text-neutral-500 group-hover:text-neutral-300 transition-colors">
              @{note.creator?.username || 'anonymous'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-neutral-600 text-[10px] font-bold">
             {note.views && note.views > 0 && (
               <span className="flex items-center gap-1">
                 <Eye size={10} /> {note.views > 1000 ? `${(note.views/1000).toFixed(1)}k` : note.views}
               </span>
             )}
             <span className="flex items-center gap-1 group-hover:text-red-500 transition-colors">
               <Heart size={10} /> {note.likes || 0}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};