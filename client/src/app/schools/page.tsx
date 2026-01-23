"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, Zap, Users, ArrowRight, 
  Search, GraduationCap, Flame, Target,
  Cpu, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

// --- Sample School Data ---
const EXAM_SCHOOLS = [
  { 
    id: "jee", 
    name: "JEE Main & Adv", 
    description: "Engineering entrance for IITs and NITs. Focus on Physics, Chemistry, and Mathematics.",
    activeUsers: 4203, 
    classrooms: 156,
    color: "from-blue-600 to-cyan-500",
    icon: <Target className="w-6 h-6" />
  },
  { 
    id: "gate", 
    name: "GATE CSE", 
    description: "Post-graduate engineering entrance. Algorithms, OS, DBMS, and System Design.",
    activeUsers: 1840, 
    classrooms: 84,
    color: "from-red-600 to-orange-500",
    icon: <Cpu className="w-6 h-6" />
  },
  { 
    id: "neet", 
    name: "NEET Medical", 
    description: "Medical entrance for MBBS/BDS. Deep dives into Biology, Zoology, and Chemistry.",
    activeUsers: 3100, 
    classrooms: 112,
    color: "from-emerald-600 to-teal-500",
    icon: <Activity className="w-6 h-6" />
  },
  { 
    id: "upsc", 
    name: "UPSC Civil Services", 
    description: "General studies and administrative protocols for civil service aspirants.",
    activeUsers: 5600, 
    classrooms: 210,
    color: "from-purple-600 to-pink-500",
    icon: <Globe className="w-6 h-6" />
  }
];

export default function SchoolsArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pulse, setPulse] = useState(14502);

  // Live Pulse Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => prev + Math.floor(Math.random() * 10) - 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredSchools = EXAM_SCHOOLS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden selection:bg-red-500/30">
      
      {/* --- Tactical Background --- */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b82f630,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 pt-24 pb-32 lg:pt-40">
        
        {/* --- Global HUD Header --- */}
        <div className="flex flex-col items-center text-center mb-20 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-900/80 border border-white/5 backdrop-blur-md"
          >
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-red-600 animate-ping absolute inset-0" />
              <div className="h-2 w-2 rounded-full bg-red-600 relative" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              Global Study Pulse: <span className="text-white">{pulse.toLocaleString()}</span> Syncing
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mix-blend-difference">
            SELECT YOUR <br />
            <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">LEARNING_SCHOOL</span>
          </h1>

          <p className="text-neutral-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl mx-auto">
            Find your tribe. Join high-frequency classrooms or create your own neural network for exam dominance.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-xl relative mt-8 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative bg-black border border-white/10 rounded-2xl flex items-center p-1 backdrop-blur-xl">
              <Search className="ml-4 text-neutral-700" size={20} />
              <input 
                type="text" 
                placeholder="SCAN EXAM PROTOCOLS..." 
                className="w-full bg-transparent px-4 py-4 text-xs font-black uppercase tracking-widest outline-none placeholder:text-neutral-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- Schools Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSchools.map((school, i) => (
              <motion.div
                layout
                key={school.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <SchoolCard school={school} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- Empty State --- */}
        {filteredSchools.length === 0 && (
          <div className="py-40 text-center space-y-4">
            <div className="inline-block p-6 bg-neutral-900 rounded-full border border-white/5 mb-4">
              <GraduationCap size={40} className="text-neutral-800" />
            </div>
            <p className="text-neutral-700 font-black uppercase italic tracking-widest">Protocol Not Found</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="text-red-500 font-black uppercase text-[10px] hover:underline"
            >
              Reset Frequency Scanner
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// --- Card Sub-Component ---

function SchoolCard({ school }: { school: any }) {
  return (
    <Link href={`/schools/${school.id}`}>
      <div className="group relative bg-[#080808] border border-white/5 rounded-[2.5rem] p-8 md:p-10 overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
        
        {/* Background Gradient Glow */}
        <div className={cn(
          "absolute -top-24 -right-24 h-64 w-64 blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity rounded-full bg-gradient-to-br",
          school.color
        )} />

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div className={cn(
              "p-4 rounded-2xl bg-neutral-900 border border-white/5 text-white group-hover:scale-110 transition-transform duration-500",
            )}>
              {school.icon}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                <Flame size={10} fill="currentColor" /> {school.activeUsers.toLocaleString()} Active
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter group-hover:text-red-600 transition-colors">
              {school.name}
            </h3>
            <p className="text-neutral-500 text-sm font-medium mt-2 leading-relaxed">
              {school.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-4 text-neutral-600">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Classrooms</span>
                <span className="text-sm font-bold text-white">{school.classrooms}</span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Sync Rank</span>
                <span className="text-sm font-bold text-white">#{Math.floor(Math.random() * 10) + 1}</span>
              </div>
            </div>
            
            <div className="h-12 w-12 bg-white text-black rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
              <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>
    </Link>
  );
}