"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Globe, Zap, Eye, Heart, Terminal, 
  TrendingUp, Play, Flame, Clock, 
  BarChart3, Share2, Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

// --- Psychological FOMO Data ---
const MOCK_ARCHIVE = [
  { id: "1", title: "Advanced Quantum Computing Protocols", slug: "quantum-protocols", category: "Physics", views: 12400, likes: 850, creator: { name: "Dr. Aris", username: "aris_node" }, thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80", isTrending: true, timeAgo: "2m ago" },
  { id: "2", title: "Mastering the MERN Stack in 2026", slug: "mern-stack-2026", category: "Dev", views: 45000, likes: 3200, creator: { name: "Code Commander", username: "dev_zero" }, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80", isLive: true, timeAgo: "LIVE" },
  { id: "3", title: "Neural Network Optimization Techniques", slug: "neural-opt", category: "AI", views: 8200, likes: 420, creator: { name: "AI Architect", username: "neural_king" }, thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", isExpiring: true, timeAgo: "1h left" },
  { id: "4", title: "Global Finance Market Analysis", slug: "finance-2026", category: "Finance", views: 1500, likes: 98, creator: { name: "Equity Node", username: "trade_pulse" }, thumbnail: "https://images.unsplash.com/photo-1611974714014-4b52adac18e0?w=800&q=80", timeAgo: "5h ago" },
  { id: "5", title: "Clean Architecture for Next.js 15", slug: "clean-arch-nextjs", category: "Dev", views: 28000, likes: 1500, creator: { name: "Om Awchar", username: "omawchar" }, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80", isTrending: true, timeAgo: "12m ago" },
  { id: "6", title: "Bio-Tech Engineering Fundamentals", slug: "biotech-eng", category: "Engineering", views: 5400, likes: 210, creator: { name: "Genesis Lab", username: "bio_gen" }, thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?w=800&q=80", timeAgo: "1d ago" },
];

const CATEGORIES = ["All", "AI", "Dev", "Engineering", "Physics", "Finance", "Medical"];

export default function ExploreArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [activeUsers, setActiveUsers] = useState(1402);
  const router = useRouter();

  // Social Proof: Simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredArchive = useMemo(() => {
    return MOCK_ARCHIVE.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCat === "All" || item.category === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCat]);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-red-500/30 overflow-x-hidden">
      
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#dc262615,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="container mx-auto px-4 pt-24 pb-32 relative z-10 lg:pt-40">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="flex items-center gap-3 bg-neutral-900/50 border border-white/5 px-4 py-2 rounded-full">
            <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className="h-5 w-5 rounded-full border-2 border-black bg-neutral-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                    </div>
                ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
              {activeUsers.toLocaleString()} Nodes Syncing Now
            </p>
          </div>

          <h1 className="text-5xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mix-blend-difference">
            Feed Your <br />
            <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]">Instinct</span>
          </h1>

          {/* Search Command with "Hacker" Feel */}
          <div className="w-full max-w-xl relative mt-8 group">
            <div className="absolute -inset-1 bg-red-600/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-black border border-white/10 rounded-2xl flex items-center p-1.5 backdrop-blur-xl">
                <Search className="ml-4 text-neutral-600 group-hover:text-red-600 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="DECRYPT PROTOCOLS..." 
                    className="w-full bg-transparent px-4 py-4 text-sm font-black uppercase tracking-widest outline-none placeholder:text-neutral-800"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black italic px-6 hidden md:block">
                    SCAN
                </Button>
            </div>
          </div>

          {/* Horizontal Scroller Categories */}
          <div className="w-full flex justify-center gap-3 overflow-x-auto no-scrollbar py-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 border",
                  activeCat === cat 
                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110" 
                    : "bg-neutral-900/50 text-neutral-500 border-white/5 hover:border-red-600/50 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- DISCOVERY GRID (INSTA/YT STYLE) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          <AnimatePresence mode="popLayout">
            {filteredArchive.map((note, i) => (
              <motion.div
                layout
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <DiscoveryCard note={note} router={router} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </main>

      <Footer />
    </div>
  );
}

function DiscoveryCard({ note, router }: any) {
  return (
    <div 
      onClick={() => router.push(`/note/${note.slug}`)}
      className="group relative flex flex-col bg-[#080808] border border-white/5 rounded-[2rem] overflow-hidden cursor-pointer hover:border-red-600/30 transition-all duration-500 hover:shadow-[0_20px_80px_rgba(220,38,38,0.1)]"
    >
      {/* Thumbnail with Dynamic Badges */}
      <div className="relative aspect-video overflow-hidden">
        <Image 
          src={note.thumbnail} 
          alt="" 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1" 
        />
        
        {/* FOMO Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 flex gap-2">
            {note.isLive && (
                <Badge className="bg-red-600 text-white animate-pulse border-none px-3 py-1 font-black italic text-[9px]">LIVE</Badge>
            )}
            {note.isExpiring && (
                <Badge className="bg-yellow-500 text-black border-none px-3 py-1 font-black italic text-[9px] flex items-center gap-1">
                    <Clock size={10} /> {note.timeAgo}
                </Badge>
            )}
            {!note.isLive && !note.isExpiring && (
                <Badge className="bg-black/80 backdrop-blur-md border border-white/10 text-neutral-400 font-black text-[8px]">{note.timeAgo}</Badge>
            )}
        </div>

        {/* Action Quick Tools */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <QuickAction icon={<Bookmark size={14} />} />
            <QuickAction icon={<Share2 size={14} />} />
        </div>

        {/* Play Button Center (YT Style) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-16 w-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                <Play size={24} fill="currentColor" />
            </div>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{note.category}</span>
            {note.isTrending && <Flame size={14} className="text-red-600" />}
        </div>

        <h3 className="text-lg md:text-xl font-bold leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
            {note.title}
        </h3>

        <div className="pt-4 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-red-600/30">
                    <AvatarFallback className="text-[8px] bg-neutral-900 font-black">ID</AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-bold text-neutral-500 uppercase italic">@{note.creator.username}</span>
            </div>
            
            <div className="flex items-center gap-4 text-neutral-500">
                <div className="flex items-center gap-1 text-[10px] font-bold">
                    <Eye size={12} className="text-red-600" /> {(note.views/1000).toFixed(1)}K
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                    <Heart size={12} className="text-red-600" /> {note.likes}
                </div>
            </div>
        </div>

        {/* Progress Bar (Gives feeling of completion) */}
        <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5 }}
                className="h-full bg-gradient-to-r from-red-600 to-red-400 opacity-20 group-hover:opacity-100 transition-opacity"
            />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="h-10 w-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-90">
            {icon}
        </button>
    );
}

