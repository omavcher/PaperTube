"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, Globe, Zap, Eye, Heart, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

// --- Sample Intelligence Data ---
const MOCK_ARCHIVE = [
  { id: "1", title: "Advanced Quantum Computing Protocols", slug: "quantum-protocols", category: "Physics", views: 12400, likes: 850, creator: { name: "Dr. Aris", username: "aris_node" }, thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80" },
  { id: "2", title: "Mastering the MERN Stack in 2026", slug: "mern-stack-2026", category: "Dev", views: 45000, likes: 3200, creator: { name: "Code Commander", username: "dev_zero" }, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80" },
  { id: "3", title: "Neural Network Optimization Techniques", slug: "neural-opt", category: "AI", views: 8200, likes: 420, creator: { name: "AI Architect", username: "neural_king" }, thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" },
  { id: "4", title: "Global Finance Market Analysis", slug: "finance-2026", category: "Finance", views: 1500, likes: 98, creator: { name: "Equity Node", username: "trade_pulse" }, thumbnail: "https://images.unsplash.com/photo-1611974714014-4b52adac18e0?w=800&q=80" },
  { id: "5", title: "Clean Architecture for Next.js 15", slug: "clean-arch-nextjs", category: "Dev", views: 28000, likes: 1500, creator: { name: "Om Awchar", username: "omawchar" }, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80" },
  { id: "6", title: "Bio-Tech Engineering Fundamentals", slug: "biotech-eng", category: "Engineering", views: 5400, likes: 210, creator: { name: "Genesis Lab", username: "bio_gen" }, thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?w=800&q=80" },
];

const CATEGORIES = ["All", "AI", "Dev", "Engineering", "Physics", "Finance", "Medical"];

export default function ExploreArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const router = useRouter();

  const filteredArchive = useMemo(() => {
    return MOCK_ARCHIVE.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCat === "All" || item.category === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCat]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans overflow-x-hidden">
      {/* Tactical Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-radial-gradient from-red-600/10 via-transparent to-transparent"></div>
      </div>

      <main className="container mx-auto px-4 pt-20 pb-20 relative z-10 lg:pt-32">
        
        {/* --- HERO HUD --- */}
        <div className="flex flex-col items-center text-center mb-12 space-y-6 md:mb-20 md:space-y-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full bg-red-600/10 border border-red-600/20 px-3 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
            <Globe size={12} className="animate-pulse" /> Global Intelligence Archive
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
            EXPLORE THE <br />
            <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">VOID_ARTIFACTS</span>
          </h1>
          
          <p className="text-neutral-500 font-medium uppercase tracking-widest text-[9px] md:text-xs max-w-xl mx-auto px-4">
            Search through millions of pre-synthesized intelligence nodes across the neural network.
          </p>

          {/* High-Speed Search Command */}
          <div className="w-full max-w-2xl group relative mt-4">
            <div className="absolute -inset-1 bg-red-600/20 blur opacity-0 group-focus-within:opacity-100 transition duration-500 rounded-3xl" />
            <div className="relative flex items-center bg-neutral-950 border border-white/5 rounded-2xl md:rounded-[2rem] p-1.5 md:p-2 shadow-2xl backdrop-blur-3xl">
               <Search className="ml-4 h-5 w-5 md:h-6 md:w-6 text-neutral-800 group-focus-within:text-red-600 transition-colors" />
               <input 
                 type="text" 
                 placeholder="SCAN PROTOCOLS..." 
                 className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 md:px-4 md:py-5 text-white font-black outline-none uppercase text-xs md:text-sm tracking-widest placeholder:text-neutral-900"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
          </div>

          {/* Category Protocol Switcher - Horizontal Scroll on small screens */}
          <div className="w-full flex justify-start sm:justify-center overflow-x-auto no-scrollbar py-2 px-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "whitespace-nowrap px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase italic tracking-widest transition-all border shrink-0",
                  activeCat === cat 
                    ? "bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                    : "bg-neutral-900 border-white/5 text-neutral-500 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- DISCOVERY GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-2 md:px-0">
          <AnimatePresence mode="popLayout">
            {filteredArchive.map((note, i) => (
              <motion.div
                layout
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <ArtifactCard note={note} router={router} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty Search Signal */}
        {filteredArchive.length === 0 && (
          <div className="py-20 md:py-40 text-center space-y-6 px-4">
             <Terminal size={48} className="mx-auto text-neutral-900 animate-pulse md:size-16" />
             <p className="text-neutral-700 font-black uppercase italic tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-sm">Signal Lost :: No Matching Artifacts Found</p>
             <Button onClick={() => { setSearchQuery(""); setActiveCat("All"); }} variant="ghost" className="text-red-500 uppercase text-[10px] md:text-xs font-black italic hover:bg-red-600/5">Reset Frequency</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// --- Visual Sub-Components ---

function ArtifactCard({ note, router }: any) {
  const signalStrength = note.views > 20000 ? "HIGH" : note.views > 5000 ? "MEDIUM" : "STABLE";
  
  return (
    <Card
      onClick={() => router.push(`/note/${note.creator.username}/${note.slug}`)}
      className={cn(
        "group relative bg-neutral-950 border rounded-3xl md:rounded-[2.5rem] overflow-hidden transition-all duration-500 cursor-pointer flex flex-col h-full",
        signalStrength === "HIGH" ? "border-red-600/40 shadow-[0_0_40px_rgba(220,38,38,0.15)]" : "border-white/5 hover:border-red-600/20"
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[16/10]">
         <Image 
           src={note.thumbnail} 
           alt={note.title} 
           fill 
           className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-100" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
         
         <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 flex justify-between items-center z-20">
            <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-white font-black italic uppercase text-[7px] md:text-[8px] px-2 py-0.5 md:px-3 md:py-1">
               {note.category}
            </Badge>
            <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[7px] md:text-[8px] font-black italic shadow-lg">
               <Zap size={10} fill="currentColor" /> {signalStrength}
            </div>
         </div>
      </div>

      <div className="p-5 md:p-8 flex-1 flex flex-col">
         <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white mb-4 md:mb-6 group-hover:text-red-500 transition-colors line-clamp-2 leading-tight">
            {note.title}
         </h3>

         <div className="mt-auto space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 border border-white/10 flex-shrink-0">
                     <AvatarFallback className="bg-neutral-800 text-[8px] md:text-[10px] font-black italic">ID</AvatarFallback>
                  </Avatar>
                  <span className="text-[8px] md:text-[10px] font-black uppercase text-neutral-500 tracking-widest truncate">@{note.creator.username}</span>
               </div>
               <div className="flex items-center gap-3 md:gap-4 text-neutral-600 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold">
                     <Eye size={12} className="text-red-500" /> {note.views > 1000 ? `${(note.views/1000).toFixed(1)}K` : note.views}
                  </div>
                  <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold">
                     <Heart size={12} className="text-red-500" /> {note.likes}
                  </div>
               </div>
            </div>

            <Button className="w-full h-10 md:h-12 bg-neutral-900 border border-white/5 rounded-xl text-[9px] md:text-[10px] font-black uppercase italic tracking-[0.2em] text-neutral-400 group-hover:bg-white group-hover:text-black transition-all">
               Initialize Sync
            </Button>
         </div>
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </Card>
  );
}