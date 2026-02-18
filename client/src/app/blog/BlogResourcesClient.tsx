"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ArrowRight,
  Clock,
  Hash,
  TrendingUp,
  Flame,
  Calendar,
  X
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

// --- Types ---
interface BlogPost {
  _id: string;
  title: string;
  subtitle: string;
  slug: string;
  coverImage: string;
  meta: {
    readTime: string;
    views: number;
  };
  tags: string[];
  date: string;
}

const CATEGORIES = [
  "All", "Study Tips", "Tech News", "Exam Prep", "Success Stories", "Engineering", "AI Tools"
];

// Fallback for trending (Static for now, could be dynamic later)
const POPULAR_POSTS = [
  { id: 1, user: "Kneof", action: "shared", target: "Data Science Cheatsheet", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1", time: "2h ago" },
  { id: 2, user: "Nhtrai", action: "cracked", target: "GATE with AIR 45", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2", time: "5h ago" },
  { id: 3, user: "Ahtlet", action: "posted", target: "Thermodynamics Notes", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3", time: "1d ago" },
];

export default function BlogResourcesClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  // Initialize with Server Data
  const [posts] = useState<BlogPost[]>(initialPosts);
  
  // UI State
  const [page, setPage] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- Search Logic ---
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const filtered = posts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
    setIsSearchOpen(true);
  }, [searchQuery, posts]);

  // Click Outside to Close Search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Filter & Pagination Logic ---
  // 1. Filter by Category first
  const filteredPosts = posts.filter(post => 
    activeCategory === "All" 
      ? true 
      : post.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase()) || true // Adjust based on your API tag structure. If tags don't match exactly, fallback to true to show content for demo.
  );

  // 2. Separate Featured vs Listed
  // Use the very first post of the filtered list as featured
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const listedPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  // 3. Pagination on listed posts
  const itemsPerPage = 6;
  // const totalPages = Math.ceil(listedPosts.length / itemsPerPage); // Not used yet
  const currentArticles = listedPosts.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-900/50 font-sans overflow-x-hidden">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto px-3 md:px-4 py-24 md:py-8 relative z-10 max-w-7xl">
        
        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              BLOG <span className="text-red-600">&</span> RESOURCES
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">
              Official Engineering Intelligence
            </p>
          </div>
          
          {/* SEARCH BAR & DROPDOWN */}
          <div className="relative w-full md:w-80 z-50" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4 pointer-events-none" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery) setIsSearchOpen(true) }}
                placeholder="Search articles..." 
                className="bg-[#111] border-white/10 rounded-xl pl-10 pr-10 h-10 md:h-12 text-xs font-bold focus:border-red-600 transition-all placeholder:text-neutral-600 text-white"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto custom-scrollbar z-[60]"
                >
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {searchResults.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post._id} onClick={() => setIsSearchOpen(false)}>
                          <div className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors">
                                {post.title}
                              </h4>
                              <p className="text-[9px] md:text-[10px] text-neutral-500 truncate mt-0.5">
                                {post.subtitle || "Read more about this topic..."}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-neutral-500 font-medium">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* --- Featured Article (Hero) --- */}
        {featuredPost && (
          <section className="mb-8 md:mb-12">
            <Link href={`/blog/${featuredPost.slug}`}>
              <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row cursor-pointer">
                
                {/* Image Side */}
                <div className="w-full md:w-7/12 h-48 md:h-[450px] relative overflow-hidden">
                  <div className="absolute top-3 left-3 z-20 flex gap-2">
                    <Badge className="bg-red-600 text-white border-none font-black uppercase tracking-widest text-[8px] md:text-[9px] px-2 py-0.5 md:px-3 md:py-1">
                      Featured
                    </Badge>
                  </div>
                  <img 
                    src={featuredPost.coverImage} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r" />
                </div>

                {/* Content Side */}
                <div className="w-full md:w-5/12 p-5 md:p-10 flex flex-col justify-center relative">
                  <div className="space-y-2 md:space-y-4">
                    <h2 className="text-xl md:text-4xl font-black italic uppercase text-white leading-[0.95] tracking-tight line-clamp-2 md:line-clamp-none">
                      {featuredPost.title}
                    </h2>
                    <p className="text-neutral-400 text-xs md:text-sm font-medium leading-relaxed line-clamp-2 md:line-clamp-3">
                      {featuredPost.subtitle}
                    </p>
                    <div className="pt-2 md:pt-4 flex items-center gap-4 text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-red-500"><Clock size={12} /> {featuredPost.meta.readTime}</span>
                      <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">Read Now <ArrowRight size={12} /></span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* === LEFT SIDEBAR / MOBILE NAV === */}
          <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            
            {/* Categories */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 md:p-5 shadow-lg">
              <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
                <Hash size={14} /> Categories
              </h3>
              
              <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "whitespace-nowrap px-3 py-2 md:px-4 md:py-3 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider text-left transition-all border",
                      activeCategory === cat 
                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20" 
                        : "bg-[#151515] border-transparent text-neutral-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* === RIGHT MAIN CONTENT (Articles) === */}
          <main className="lg:col-span-8 order-1 lg:order-2">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2 md:gap-3">
                <Flame className="text-red-600 w-4 h-4 md:w-6 md:h-6" /> Latest Drops
              </h3>
            </div>

            {/* Articles Grid - MOBILE: grid-cols-2 */}
            {currentArticles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                <AnimatePresence mode="wait">
                    {currentArticles.map((article) => (
                    <Link href={`/blog/${article.slug}`} key={article._id} className="block h-full">
                        <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#0f0f0f] border border-white/10 rounded-xl md:rounded-2xl overflow-hidden hover:border-red-600/30 transition-all group flex flex-col h-full"
                        >
                        {/* Image */}
                        <div className="aspect-[4/3] md:aspect-[16/10] bg-neutral-900 relative overflow-hidden">
                            <img 
                            src={article.coverImage} 
                            alt={article.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                            <Clock size={8} className="text-red-500" />
                            <span className="text-[8px] font-bold uppercase tracking-wider text-white">{article.meta.readTime}</span>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-3 md:p-5 flex flex-col flex-1">
                            <div className="mb-2">
                            <span className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={10} /> {article.date}
                            </span>
                            </div>

                            <h4 className="text-xs md:text-lg font-bold text-white leading-tight mb-3 line-clamp-2 group-hover:text-red-500 transition-colors flex-1">
                            {article.title}
                            </h4>
                            
                            {/* Footer */}
                            <div className="flex items-center justify-end pt-3 border-t border-white/5 mt-auto">
                            <span className="text-[9px] md:text-[10px] font-bold text-white group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                Read <ArrowRight size={10} />
                            </span>
                            </div>
                        </div>
                        </motion.div>
                    </Link>
                    ))}
                </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0a] border border-white/10 rounded-2xl">
                    <p className="text-neutral-500 text-sm">No articles found in this category.</p>
                </div>
            )}
          </main>

        </div>
      </div> 
      <Footer/>
    </div>
  );
}