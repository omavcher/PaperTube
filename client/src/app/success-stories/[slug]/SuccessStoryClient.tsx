"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Trophy, 
  Zap, 
  Share2, 
  CheckCircle2,
  MoveRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import api from "@/config/api";

// Re-use types or import from a shared file
interface JourneyStep {
  _id: string;
  title: string;
  content: string;
}

interface StoryDetail {
  _id: string;
  name: string;
  handle: string;
  avatar: string;
  exam: string;
  rank: string;
  heroTitle: string;
  summary: string;
  fullJourney: JourneyStep[];
  date: string;
  slug: string;
}

const DEFAULT_TOOLS = ["AI Note Synthesis", "Neural Flashcards", "Custom Quiz Engine"];

export default function SuccessStoryClient({ story }: { story: StoryDetail }) {
  
  // --- Analytics Tracking ---
  useEffect(() => {
    // We assume api.post is non-blocking and safe
    const trackView = async () => {
        try {
            await api.post('/general/track', {
                type: 'story',
                id: story.slug,
                metric: 'view'
            });
        } catch (e) {
            // Silently fail analytics
            console.error("Analytics Error", e);
        }
    };
    trackView();
  }, [story.slug]);

  // --- Share Handler ---
  const handleShare = async () => {
    const shareData = {
        title: story.heroTitle,
        text: `Read how ${story.name} cracked ${story.exam} with PaperTube!`,
        url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        api.post('/general/track', { type: 'story', id: story.slug, metric: 'share' });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      api.post('/general/track', { type: 'story', id: story.slug, metric: 'share' });
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-900/50 pb-20 overflow-x-hidden">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-red-600/10 blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 py-6 md:py-8 relative z-10 max-w-5xl">
        
        {/* --- Top Navigation --- */}
        <nav className="flex items-center justify-between mb-8 md:mb-12 pt-20">
          <Link href="/success-stories">
            <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 gap-2 px-0 text-xs md:text-sm">
              <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Stories</span><span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <Button variant="outline" onClick={handleShare} className="border-white/10 bg-neutral-950/50 text-neutral-400 hover:text-white gap-2 rounded-xl text-xs md:text-sm h-9 md:h-10 transition-all">
            <Share2 size={16} /> Share
          </Button>
        </nav>

        {/* --- Hero Section --- */}
        <header className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-10">
            
            {/* 16:9 Cinematic Image Section */}
            <div className="relative w-full md:w-[45%] shrink-0 group">
              {/* Glow Effect behind the image */}
              <div className="absolute -inset-1 bg-red-600/20 blur-2xl rounded-[1.5rem] animate-pulse" />
              
              {/* Image Container */}
              <div className="aspect-video w-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative z-10 bg-neutral-900">
                <img 
                    src={story.avatar} 
                    alt={story.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              </div>
            </div>
            
            {/* User Info Section */}
            <div className="text-center md:text-left space-y-5 md:space-y-6 w-full flex-1">
              
              {/* Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 size={12} className="fill-current text-emerald-900" />
                  <span>Verified</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/30">
                  <Trophy size={12} className="fill-white/20" />
                  <span>Rank {story.rank}</span>
                </div>
              </div>

              {/* Name & Handle */}
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] mb-4 drop-shadow-2xl">
                  {story.name}
                </h1>
                
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4">
                  {/* Social Handle Chip */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 group cursor-pointer hover:border-red-600/50 hover:bg-red-600/5 transition-all duration-300">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-red-500 transition-colors">
                      Social
                    </span>
                    <MoveRight size={12} className="text-neutral-600 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all duration-300" />
                    <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider ml-1">
                      {story.handle.replace('@', '')}
                    </p>
                  </div>

                  <div className="hidden sm:block h-1 w-1 rounded-full bg-neutral-800" />

                  <p className="text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-600/5 px-3 py-1.5 rounded border border-red-600/10">
                    {story.exam}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Content Card */}
          <div className="bg-neutral-950/50 border border-white/5 rounded-[2rem] p-6 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] rounded-full pointer-events-none" />
              <h2 className="text-xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-4 md:mb-6 leading-tight">
                {story.heroTitle}
              </h2>
              <p className="text-neutral-400 text-sm md:text-lg font-medium leading-relaxed italic border-l-4 border-red-600 pl-4 md:pl-6">
                "{story.summary}"
              </p>
          </div>
        </header>

        {/* --- Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Main Content (Journey) */}
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            {story.fullJourney.map((step, i) => (
              <motion.section 
                key={step._id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3 md:space-y-4"
              >
                <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-red-600 flex items-center gap-3">
                  <div className="w-6 md:w-8 h-[1px] bg-red-600/30" /> {step.title}
                </h3>
                <div className="text-neutral-300 text-sm md:text-base leading-relaxed font-medium whitespace-pre-line pl-0 md:pl-4">
                  {step.content}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Sidebar Stats */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-[2rem] space-y-6 sticky top-24">
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4">Milestone Data</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <Calendar size={18} className="text-red-600 shrink-0" />
                    <span className="text-neutral-400 text-xs md:text-sm">Achieved: <span className="text-white">{story.date}</span></span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <Trophy size={18} className="text-red-600 shrink-0" />
                    <span className="text-neutral-400 text-xs md:text-sm">Exam: <span className="text-white">{story.exam}</span></span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-white/5" />

              {/* Tools Used */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4">Neural Stack</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_TOOLS.map((tool, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-white/5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider text-neutral-300">
                      <Zap size={10} className="text-red-500 shrink-0" /> {tool}
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest text-[10px] py-6 rounded-xl mt-4 transition-all active:scale-95 shadow-lg shadow-red-900/20">
                  Start Your Journey
                </Button>
              </Link>

            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}