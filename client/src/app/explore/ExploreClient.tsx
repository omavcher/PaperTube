"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Globe, Zap, Eye, Heart, 
  TrendingUp, Play, Flame, Clock, 
  Share2, Bookmark, Loader2, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import api from "@/config/api"; // Ensure this path is correct
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

export default function ExploreClient() {
  const router = useRouter();
  
  // Logic State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // UI/Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
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
    // If you want to allow public viewing without auth, remove the strict check below
    if (!token) {
        // Option A: Redirect to login
        // router.push('/login');
        // Option B: Allow limited public view (requires API support)
        setLoading(false); 
    }
  }, [router]);

  // 2. Fetch Data
  const fetchExploreData = useCallback(async (pageNum: number, append = false, search = '') => {
    const token = localStorage.getItem('authToken');
    if (!token) return; // Or handle public API logic

    try {
      if (!append) setLoading(true);
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        type: 'notes',
        search: search
      });

      const response = await api.get<ExploreResponse>(`/notes/explore?${params.toString()}`, {
        headers: { 'Auth': token }
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

  // Initial Fetch & Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        fetchExploreData(1, false, searchQuery);
      }
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery, isAuthenticated, fetchExploreData]);

  // Handle Category Filter (Client-side filtering for visual effect, ideally API based)
  const filteredItems = useMemo(() => {
    if (activeCat === "All") return items;
    // Note: Since real API might not return explicit category, this is a placeholder logic
    // You should pass 'category' to API if backend supports it.
    return items.filter(item => item.category === activeCat || item.title.includes(activeCat));
  }, [items, activeCat]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchExploreData(page + 1, true, searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

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

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border",
                  activeCat === cat 
                    ? "bg-white text-black border-white" 
                    : "bg-neutral-900/50 text-neutral-500 border-white/5 hover:border-white/20 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        {loading && items.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-neutral-600 gap-4">
             <Loader2 className="w-8 h-8 animate-spin" />
             <p className="text-xs uppercase tracking-widest">Decrypting Data...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((note, i) => (
                <motion.div
                  layout
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <DiscoveryCard note={note} router={router} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* --- LOAD MORE --- */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-16">
            <Button 
              onClick={handleLoadMore}
              variant="outline" 
              className="bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/30 hover:bg-white/5 uppercase text-xs font-bold tracking-widest px-8 py-6 rounded-xl"
            >
              Load More Data
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
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
      onClick={() => router.push(`/note/${note.creator?.username || 'user'}/${note.slug}`)}
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
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600 group-hover:text-white transition-colors">
              <Play size={20} fill="currentColor" />
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

        {/* Play Icon (Hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white">
              <Play size={18} fill="currentColor" className="ml-0.5" />
           </div>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
             {note.category || "General"}
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