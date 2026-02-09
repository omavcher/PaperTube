"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Search, Play, Eye, Star, 
  ChevronRight, ExternalLink, Flame, 
  BookOpen, Trophy 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const TRENDING_VIDEOS = [
  { id: 1, title: "How to Generate Notes", views: "168M", time: "5:58", img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" },
  { id: 2, title: "Advanced Study Techniques", views: "138M", time: "5:38", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" },
  { id: 3, title: "Neural Link Integration", views: "779M", time: "5:25", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop" },
  { id: 4, title: "Mastering the MERN Stack", views: "92M", time: "8:12", img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop" },
];

const TOP_NOTES = [
  { id: 1, title: "User-Generated Notes", subject: "Scientist", rating: 5 },
  { id: 2, title: "Thermodynamics Core", subject: "Physics", rating: 5 },
  { id: 3, title: "Data Structures 101", subject: "CS Engineering", rating: 5 },
  { id: 4, title: "Organic Synthesis", subject: "Chemistry", rating: 4 },
];

const QUIZZES = [
  { id: 1, title: "Logic Gate Lab", plays: "340", color: "from-blue-600 to-indigo-900" },
  { id: 2, title: "Algo-Blitz", plays: "229", color: "from-orange-600 to-red-900" },
  { id: 3, title: "React Hooks", plays: "220", color: "from-purple-600 to-pink-900" },
];

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-900/50 pb-20">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 py-10 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col items-center mb-16">
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-center leading-none mb-10">
            DISCOVER <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">TRENDING CONTENT</span>
          </h1>
          
          <div className="w-full max-w-3xl relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search for videos, notes, quizzes..."
              className="w-full h-16 bg-neutral-950/50 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold tracking-wide focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 backdrop-blur-xl transition-all"
            />
          </div>
        </header>

        {/* --- Trending Videos Section --- */}
        <SectionTitle title="Trending Videos" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {TRENDING_VIDEOS.map((video, i) => (
            <VideoCard key={video.id} video={video} delay={i * 0.1} />
          ))}
        </div>

        {/* --- Top-Rated Notes Section --- */}
        <SectionTitle title="Top-Rated Notes" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {TOP_NOTES.map((note, i) => (
            <NoteCard key={note.id} note={note} delay={i * 0.1} />
          ))}
        </div>

        {/* --- Quizzes & Featured Creator Split --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8">
            <SectionTitle title="Popular Quizzes" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {QUIZZES.map((quiz, i) => (
                <QuizCard key={quiz.id} quiz={quiz} delay={i * 0.1} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <SectionTitle title="Featured Creator" />
            <FeaturedCreatorCard />
          </div>

        </div>

      </div>
    </div>
  );
}

// --- Internal Sub-Components ---

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white">
      {title}
    </h2>
    <ChevronRight className="text-neutral-600 cursor-pointer hover:text-white transition-colors" />
  </div>
);

const VideoCard = ({ video, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="group relative flex flex-col bg-neutral-950/50 border border-white/5 rounded-[2rem] overflow-hidden hover:border-red-600/30 transition-all shadow-2xl"
  >
    <div className="relative aspect-video overflow-hidden">
      <img src={video.img} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-red-600 p-3 rounded-full shadow-lg">
          <Play size={20} fill="white" />
        </div>
      </div>
      <span className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded-md text-[10px] font-black tracking-widest">{video.time}</span>
    </div>

    <div className="p-6 pt-8 relative">
      <div className="absolute -top-6 left-6 bg-red-600 p-3 rounded-xl shadow-xl">
        <Play size={16} fill="white" />
      </div>
      <h3 className="text-sm font-black uppercase italic tracking-tight mb-6 leading-tight h-10 line-clamp-2">
        {video.title}
      </h3>
      
      <div className="flex flex-col gap-4">
        <button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest text-[10px] rounded-xl transition-all active:scale-95 shadow-lg shadow-red-900/20">
          Generate Notes
        </button>
        <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-black uppercase tracking-widest">
          <Eye size={12} /> {video.views} Views
        </div>
      </div>
    </div>
  </motion.div>
);

const NoteCard = ({ note, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-neutral-950/50 border border-white/5 p-8 rounded-[2rem] flex flex-col justify-between hover:border-red-600/30 transition-all shadow-2xl min-h-[280px]"
  >
    <div>
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className={i < note.rating ? "text-yellow-500 fill-yellow-500" : "text-neutral-700"} />
        ))}
      </div>
      <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-2 leading-tight">
        {note.title}
      </h3>
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
        Subject: <span className="text-white">{note.subject}</span>
      </p>
    </div>

    <button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-red-900/20 mt-8">
      View Notes
    </button>
  </motion.div>
);

const QuizCard = ({ quiz, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={cn("p-6 rounded-[2.5rem] bg-gradient-to-br border border-white/5 flex flex-col justify-between shadow-2xl min-h-[220px] group overflow-hidden", quiz.color)}
  >
    <div className="relative z-10">
      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg leading-tight">
        {quiz.title}
      </h3>
    </div>
    
    <div className="relative z-10 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70">
        <Play size={12} fill="white" className="opacity-70" /> {quiz.plays} Plays
      </div>
      <button className="w-full h-11 bg-white text-black hover:bg-neutral-200 font-black uppercase italic tracking-widest text-[9px] rounded-xl transition-all active:scale-95 shadow-xl">
        Play Now
      </button>
    </div>
  </motion.div>
);

const FeaturedCreatorCard = () => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    className="bg-neutral-950/50 border border-white/5 p-8 rounded-[3rem] h-full shadow-2xl relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] rounded-full group-hover:bg-red-600/10 transition-colors" />
    
    <div className="flex items-center gap-4 mb-6">
      <div className="relative">
        <div className="absolute inset-0 bg-red-600/20 blur-lg rounded-full animate-pulse" />
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=creator" 
          alt="Creator" 
          className="w-16 h-16 rounded-2xl border-2 border-red-600 relative z-10 bg-neutral-900" 
        />
      </div>
      <div>
        <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">Ina Botther</h4>
        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">@kalnehalabo</p>
      </div>
    </div>

    <p className="text-[12px] font-medium text-neutral-400 leading-relaxed mb-8">
      PaperTube is a professor of bio inheritance, supporting unique biotechnologies and investigating neural link interventions.
    </p>

    <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-red-600 hover:text-red-500 transition-colors group/link">
      Link the profile <ExternalLink size={14} className="group-hover/link:translate-x-1 transition-transform" />
    </a>
  </motion.div>
);