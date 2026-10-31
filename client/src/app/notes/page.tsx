"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Cpu, 
  ArrowLeft 
} from "lucide-react";
import { IconBrandYoutube } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SampleNote {
  slug: string;
  videoId: string;
  title: string;
  sub: string;
  tag: string;
  time: string;
  badge: string;
  badgeColor: string;
  ctaColor: string;
  category: "all" | "economics" | "ai" | "biology" | "geography" | "physics";
  description: string;
  highlights: string[];
}

const SAMPLE_NOTES: SampleNote[] = [
  {
    slug: "notes-supply-and-demand-g9adizjpds",
    videoId: "g9aDizJpd_s",
    title: "Supply & Demand Market Equilibrium",
    sub: "CrashCourse Economics • Adriene Hill & Jacob Clifford",
    tag: "Economics #4",
    time: "5 min read",
    badge: "📈 Economics",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    ctaColor: "text-amber-400",
    category: "economics",
    description: "Foundational pillars of market economics: equilibrium equations, shift factors, elasticity and price controls.",
    highlights: ["Law of Demand & Supply", "Market Equilibrium Shifts", "Elasticity & Price Ceilings"],
  },
  {
    slug: "notes-stanford-cs229-ml-jgwo_ugts7i",
    videoId: "jGwO_UgTS7I",
    title: "Neural Networks & Backpropagation",
    sub: "Stanford University • Prof. Andrew Ng",
    tag: "Stanford CS229",
    time: "8 min read",
    badge: "🤖 AI / ML",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    ctaColor: "text-purple-400",
    category: "ai",
    description: "Deep learning foundations: forward propagation, gradient descent vector calculus, and chain-rule backpropagation.",
    highlights: ["Multilayer Perceptrons", "Backpropagation Calculus", "Activation Functions"],
  },
  {
    slug: "notes-biology-cell-structure-urujd5nexc8",
    videoId: "URUJD5NEXC8",
    title: "Cell Structure, Organelles & Membranes",
    sub: "Bozeman Science • Paul Andersen",
    tag: "AP Biology",
    time: "6 min read",
    badge: "🔬 Biology",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    ctaColor: "text-emerald-400",
    category: "biology",
    description: "Comprehensive breakdown of eukaryotic and prokaryotic organelles, membrane transport, and cellular respiration.",
    highlights: ["Plant vs Animal Cells", "Phospholipid Bilayer", "ATP Synthesis & Mitochondria"],
  },
  {
    slug: "notes-something-finally-broke-between-us-and-europe-wydd0rf66de",
    videoId: "WYDD0RF66DE",
    title: "US-Europe Transatlantic Geopolitics",
    sub: "CSIS Strategic Analysis",
    tag: "Geopolitics",
    time: "7 min read",
    badge: "🌍 Geography",
    badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/25",
    ctaColor: "text-sky-400",
    category: "geography",
    description: "In-depth geopolitical analysis on trade relations, industrial policy divergences, and defense pact realignment.",
    highlights: ["Transatlantic Trade Alliances", "Energy Policy Repercussions", "Strategic Autonomy Shifts"],
  },
  {
    slug: "notes-mit-804-quantum-physics-lz3bpuko5zc",
    videoId: "lZ3bPUKo5zc",
    title: "Quantum Physics & Superposition",
    sub: "MIT OpenCourseWare • Prof. Allan Adams",
    tag: "MIT 8.04",
    time: "9 min read",
    badge: "⚛️ Physics",
    badgeColor: "bg-pink-500/15 text-pink-400 border-pink-500/25",
    ctaColor: "text-pink-400",
    category: "physics",
    description: "Introduction to quantum superposition, Mach-Zehnder interferometers, probability amplitudes, and Dirac bra-ket notation.",
    highlights: ["Superposition & Interference", "Dirac Bra-Ket Notation", "Wave-Particle Duality"],
  },
];

export default function NotesDirectoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredNotes = useMemo(() => {
    return SAMPLE_NOTES.filter((note) => {
      const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.sub.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q) ||
        note.tag.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen w-full bg-[#050508] text-white selection:bg-red-500/30 selection:text-white pb-20">
      
      {/* ── Top Glow Atmosphere ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-red-600/[0.05] blur-[140px] pointer-events-none rounded-full" />

      {/* ── Main Container ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/youtube-to-notes"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to YouTube to Notes Converter</span>
          </Link>

          <Link
            href="/youtube-to-notes"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <IconBrandYoutube size={14} />
            <span>Convert Your Video</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-neutral-300 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Curated Sample Notes • No Sign-In Required</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Academic Study Library
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
            Click any curated lecture note to explore structured summaries, LaTeX formulas, interactive quizzes, and AI tutor dialogue in real-time.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures, topics, or professors..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0e0e14] border border-white/[0.08] focus:border-red-500/50 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1">
            {[
              { id: "all", label: "All Notes" },
              { id: "economics", label: "Economics" },
              { id: "ai", label: "AI / ML" },
              { id: "biology", label: "Biology" },
              { id: "physics", label: "Physics" },
              { id: "geography", label: "Geopolitics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer",
                  selectedCategory === tab.id
                    ? "bg-white/10 text-white border border-white/20 shadow-sm"
                    : "text-neutral-400 hover:text-white bg-white/[0.02] border border-transparent hover:border-white/[0.06]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.slug}
              onClick={() => router.push(`/notes/${note.slug}`)}
              className="group flex flex-col justify-between rounded-2xl bg-[#0c0c10] border border-white/[0.08] hover:border-white/20 transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                  <img
                    src={`https://img.youtube.com/vi/${note.videoId}/mqdefault.jpg`}
                    alt={note.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-black/30 to-transparent" />
                  
                  {/* Category Pill */}
                  <span className={cn("absolute bottom-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm", note.badgeColor)}>
                    {note.badge}
                  </span>

                  {/* YouTube Tag Pill */}
                  <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-mono text-neutral-300 flex items-center gap-1">
                    <IconBrandYoutube size={11} className="text-red-400" />
                    <span>{note.tag}</span>
                  </span>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-2.5">
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                    {note.title}
                  </h3>
                  
                  <p className="text-xs text-neutral-400 font-medium">
                    {note.sub}
                  </p>

                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {note.description}
                  </p>

                  {/* Feature Highlights */}
                  <div className="pt-2 space-y-1">
                    {note.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                  <Clock size={11} />
                  <span>{note.time}</span>
                </span>

                <span className={cn("font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform", note.ctaColor)}>
                  <span>Open Full Study Suite</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Search State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <BookOpen size={32} className="mx-auto text-neutral-600" />
            <p className="text-neutral-400 text-sm">No sample notes found matching &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="text-xs text-red-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Bottom Converter Callout */}
        <section className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900/80 via-[#141216]/90 to-neutral-900/80 border border-white/[0.08] text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold">
              <Sparkles size={11} />
              <span>Turn Any Video Into Notes</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Have your own lecture or YouTube video?
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
              Paste any public YouTube link to generate timestamps, LaTeX equations, revision flashcards, and presentation slides in seconds.
            </p>

            <div className="pt-2">
              <Link
                href="/youtube-to-notes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                <span>Open YouTube to Notes Studio · Free</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

