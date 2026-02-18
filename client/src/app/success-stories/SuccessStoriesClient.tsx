"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquarePlus, 
  ArrowRight, 
  Quote,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Types ---
interface Story {
  _id: string;
  name: string;
  avatar: string;
  exam: string;
  rank: string;
  heroTitle: string;
  slug: string;
  summary?: string;
}

interface SuccessStoriesClientProps {
  initialStories: Story[];
}

export default function SuccessStoriesClient({ initialStories }: SuccessStoriesClientProps) {
  // Initialize state with Server Data (No loading state needed!)
  const [stories] = useState<Story[]>(initialStories);
  const [activeSlide, setActiveSlide] = useState(0);
  const [filter, setFilter] = useState("All");
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // --- Auto-Play Logic for Slider ---
  useEffect(() => {
    if (stories.length > 0) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 6000); // 6 seconds per slide
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeSlide, stories.length]);

  const nextSlide = () => {
    if (stories.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % stories.length);
  };
  
  const prevSlide = () => {
    if (stories.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + stories.length) % stories.length);
  };

  // --- Filtering Logic ---
  const filteredStories = stories.filter(s => 
    filter === "All" ? true : s.exam === filter
  );

  const examOptions = ["All", ...Array.from(new Set(stories.map(s => s.exam)))];

  // Empty State Handling
  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-neutral-500 gap-4">
        <Loader2 className="animate-spin text-red-600" />
        <p className="text-sm tracking-widest uppercase">Waiting for Success Stories...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-900/50 pb-20 overflow-x-hidden font-sans">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto px-3 md:px-4 pt-24 py-6 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none text-center md:text-left">
            <span className="text-white">STUDENT</span> <span className="text-red-600">SUCCESS</span>
          </h1>
          
          <Link href="/share-story" className="w-full md:w-auto">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all text-xs md:text-sm flex items-center justify-center gap-2">
              <MessageSquarePlus size={16} /> SHARE STORY
            </Button>
          </Link>
        </header>

        {/* --- Featured Story Slider (Responsive) --- */}
        <section className="relative w-full mb-12 md:mb-20">
          {/* Mobile: Taller Aspect Ratio | Desktop: Wider Aspect Ratio */}
          <div className="w-full aspect-[4/5] md:aspect-[21/9] max-h-[550px] bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={stories[activeSlide]._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Background Image */}
                <img 
                  src={stories[activeSlide].avatar} 
                  alt={`${stories[activeSlide].name} Success Story`} 
                  className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-[3s]" 
                />
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent md:bg-gradient-to-r md:from-black md:via-black/80 md:to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end md:justify-center items-start">
                  <div className="max-w-2xl space-y-3 md:space-y-6 relative z-10">
                    
                    {/* Badge */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/30 px-3 py-1 rounded-full backdrop-blur-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-red-100">Featured Story</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl md:text-6xl font-black italic uppercase text-white leading-[0.95] tracking-tight drop-shadow-xl line-clamp-3 md:line-clamp-2"
                    >
                      {stories[activeSlide].heroTitle}
                    </motion.h2>
                    
                    {/* Quote/Summary */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-3 md:gap-4 border-l-2 border-red-600 pl-3 md:pl-6"
                    >
                      <p className="text-neutral-300 text-xs md:text-lg font-medium leading-relaxed italic line-clamp-3">
                        &quot;{stories[activeSlide].summary || "Success is the result of perfection, hard work, learning from failure, loyalty, and persistence."}&quot;
                      </p>
                    </motion.div>
                    
                    {/* Action Button */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-2 md:pt-4"
                    >
                      <Link href={`/success-stories/${stories[activeSlide].slug}`}>
                        <Button className="bg-white text-black hover:bg-red-600 hover:text-white font-black uppercase tracking-widest px-6 py-4 md:px-10 md:py-6 rounded-xl text-[10px] md:text-xs shadow-xl transition-all group/btn w-full md:w-auto">
                          Read Full Journey <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            <div className="absolute bottom-6 right-6 flex gap-2 z-20 hidden md:flex">
              <button onClick={prevSlide} className="bg-black/50 hover:bg-white/10 border border-white/20 p-3 rounded-full backdrop-blur-md transition-all text-white">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextSlide} className="bg-black/50 hover:bg-white/10 border border-white/20 p-3 rounded-full backdrop-blur-md transition-all text-white">
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Mobile Touch Targets (Invisible) */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-10 md:hidden" onClick={prevSlide} />
            <div className="absolute inset-y-0 right-0 w-1/4 z-10 md:hidden" onClick={nextSlide} />
          </div>
        </section>

        {/* --- Success Cards Grid --- */}
        <section>
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between mb-6 gap-4 border-b border-white/10 pb-4">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide text-white self-start">
              SUCCESS CARDS
            </h3>
            
            <div className="relative w-full md:w-auto">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                <ChevronLeft className="-rotate-90 w-3 h-3" />
              </span>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full md:w-48 bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-neutral-300 focus:outline-none focus:border-red-600 appearance-none cursor-pointer"
              >
                {examOptions.map(opt => (
                  <option key={opt} value={opt}>{opt === "All" ? "FILTER BY EXAM" : opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            <AnimatePresence>
              {filteredStories.map((story, i) => (
                <SuccessCard key={story._id} story={story} delay={i * 0.05} />
              ))}
            </AnimatePresence>
          </div>
        </section>

      </div>
    </div>
  );
}

// --- Compact Success Card Component (SEO Friendly) ---
const SuccessCard = ({ story, delay }: { story: Story, delay: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px" }}
    transition={{ delay, duration: 0.4 }}
    className="bg-[#0f0f0f] border border-white/10 rounded-xl md:rounded-2xl overflow-hidden hover:border-red-600/50 transition-all duration-300 group flex flex-col h-full"
  >
    <Link href={`/success-stories/${story.slug}`} className="flex flex-col h-full">
      {/* 16:9 Image Container */}
      <div className="w-full aspect-[4/3] md:aspect-video relative bg-neutral-900 overflow-hidden">
        <img 
          src={story.avatar} 
          alt={`${story.name} - ${story.exam}`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {/* Gradient for text visibility over image (Mobile style) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
        
        {/* Overlay Info (Mobile Only) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:hidden">
          <h4 className="text-xs font-bold text-white leading-tight line-clamp-1 drop-shadow-md">
            {story.name}
          </h4>
          <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest mt-0.5">
            {story.exam}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3 md:p-5 flex flex-col flex-1 bg-[#0f0f0f]">
        {/* Desktop Header */}
        <div className="hidden md:block mb-3">
          <h4 className="text-lg font-bold text-white mb-1 leading-tight line-clamp-1">
            {story.name}
          </h4>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
            {story.exam} • Rank {story.rank}
          </p>
        </div>

        {/* Quote / Summary */}
        <div className="relative mb-3 md:mb-4 flex-1">
          <Quote className="absolute -top-1 -left-1 text-white/10 w-3 h-3 md:w-4 md:h-4 transform -scale-x-100" />
          <p className="text-neutral-400 text-[9px] md:text-xs font-medium italic leading-relaxed line-clamp-3 pl-2 md:pl-4">
            {story.summary || "A story of dedication."}
          </p>
        </div>

        <div className="w-full mt-auto">
          <Button className="w-full bg-neutral-900 hover:bg-red-600 hover:text-white border border-white/10 text-neutral-400 font-black uppercase italic tracking-widest text-[8px] md:text-[10px] h-8 md:h-10 rounded-lg transition-all active:scale-95">
            View Story
          </Button>
        </div>
      </div>
    </Link>
  </motion.article>
);