"use client";
// Paperxify HomePortal - Apple & Linear-Grade Hero, Metrics & Tools Showroom
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Youtube, 
  LayoutGrid, 
  Play, 
  Volume2, 
  Settings, 
  Maximize, 
  FileText, 
  Presentation, 
  HelpCircle, 
  Layers, 
  GitBranch, 
  Code2, 
  FileCheck2, 
  Grid, 
  Users, 
  Clock, 
  Trophy, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Subtitles,
  Download,
  Share2,
  Bookmark,
  GraduationCap,
  Calculator,
  Calendar,
  Languages,
  ShieldAlert,
  FileSearch,
  Database,
  Network,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HomePortalProps {
  region?: string;
}

// Student avatars data
const AVATARS = [
  { name: "Sarah K.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" },
  { name: "David M.", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80" },
  { name: "Priya P.", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80" },
  { name: "Alex R.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" }
];

// 20+ Tools Section Carousel Data
const TOOLS_CAROUSEL = [
  {
    id: "yt-notes",
    title: "YouTube to Notes",
    desc: "AI video notes & timestamps",
    icon: Youtube,
    iconColor: "text-red-400",
    badge: "Popular",
    href: "/youtube-to-notes",
  },
  {
    id: "yt-ppt",
    title: "YouTube to PPT",
    desc: "AI generated presentations",
    icon: Presentation,
    iconColor: "text-orange-400",
    badge: "Popular",
    href: "/presentation-generator",
  },
  {
    id: "quiz-gen",
    title: "YouTube to Quiz",
    desc: "Auto-generate quizzes",
    icon: HelpCircle,
    iconColor: "text-purple-400",
    badge: "AI Study",
    href: "/youtube-to-quiz",
  },
  {
    id: "ai-flashcards",
    title: "AI Flashcards",
    desc: "Spaced repetition flashcards",
    icon: Layers,
    iconColor: "text-blue-400",
    href: "/youtube-to-flashcards",
  },
  {
    id: "mind-maps",
    title: "AI Mind Maps",
    desc: "Visual diagrams & flowcharts",
    icon: GitBranch,
    iconColor: "text-emerald-400",
    badge: "Visual",
    href: "/ai-diagram",
  },
  {
    id: "homework-helper",
    title: "AI Homework Helper",
    desc: "Step-by-step problem solver",
    icon: GraduationCap,
    iconColor: "text-amber-400",
    href: "/ai-study/homework-helper",
  },
  {
    id: "math-solver",
    title: "AI Math Solver",
    desc: "LaTeX proofs & calculus solver",
    icon: Calculator,
    iconColor: "text-cyan-400",
    href: "/ai-study/math-solver",
  },
  {
    id: "exam-planner",
    title: "Exam Prep Planner",
    desc: "Personalized study schedules",
    icon: Calendar,
    iconColor: "text-pink-400",
    badge: "New",
    href: "/ai-study/exam-planner",
  },
  {
    id: "language-tutor",
    title: "AI Language Tutor",
    desc: "Speech TTS & native dialogues",
    icon: Languages,
    iconColor: "text-violet-400",
    badge: "Audio",
    href: "/ai-study/language-tutor",
  },
  {
    id: "ai-detector",
    title: "AI Detector & Cert",
    desc: "Authenticity verify & certs",
    icon: ShieldAlert,
    iconColor: "text-yellow-400",
    badge: "Verified",
    href: "/ai-writer/ai-detector",
  },
  {
    id: "ai-humanizer",
    title: "AI Humanizer",
    desc: "Bypass AI detectors cleanly",
    icon: Sparkles,
    iconColor: "text-emerald-400",
    href: "/ai-writer/ai-humanizer",
  },
  {
    id: "essay-writer",
    title: "AI Essay Writer",
    desc: "Structured citations & thesis",
    icon: FileText,
    iconColor: "text-blue-400",
    href: "/ai-writer/essay-writer",
  },
  {
    id: "plagiarism",
    title: "Plagiarism Checker",
    desc: "Deep source similarity check",
    icon: FileSearch,
    iconColor: "text-rose-400",
    href: "/ai-writer/plagiarism",
  },
  {
    id: "flowchart",
    title: "Flowchart Maker",
    desc: "AI workflow architecture",
    icon: Network,
    iconColor: "text-indigo-400",
    href: "/ai-diagram/flowchart",
  },
  {
    id: "sequence-diagram",
    title: "Sequence Diagram",
    desc: "API calls & message lifelines",
    icon: GitBranch,
    iconColor: "text-teal-400",
    href: "/ai-diagram/sequence",
  },
  {
    id: "er-diagram",
    title: "ER & DB Diagram",
    desc: "Database schema modeling",
    icon: Database,
    iconColor: "text-sky-400",
    href: "/ai-diagram/er",
  },
  {
    id: "code-to-image",
    title: "Code to Image",
    desc: "Convert snippets to images",
    icon: Code2,
    iconColor: "text-cyan-400",
    href: "/tools/code-to-image",
  },
  {
    id: "sql-architect",
    title: "SQL Architect",
    desc: "Query visualizer & optimizer",
    icon: Cpu,
    iconColor: "text-amber-400",
    href: "/tools/sql-architect",
  },
  {
    id: "pdf-tools",
    title: "PDF Suite",
    desc: "Merge, split & convert docs",
    icon: FileCheck2,
    iconColor: "text-rose-400",
    href: "/tools",
  },
  {
    id: "all-more",
    title: "Explore All 25+ Tools",
    desc: "Complete developer & student kit",
    icon: Grid,
    iconColor: "text-neutral-400",
    badge: "All",
    href: "/tools",
  },
];

export default function HomePortal({ region }: HomePortalProps) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(typeof window !== "undefined" && window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const cardWidth = 160;
    const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setCarouselIndex(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    }
  };

  return (
    <div className="w-full max-w-full flex flex-col items-center selection:bg-red-500/20 font-sans overflow-x-hidden">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Desktop 2-col, Mobile 1-col)
      ────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 relative overflow-hidden">
        
        {/* Subtle Ambient Vignette Behind Hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] lg:w-[900px] h-[250px] sm:h-[350px] bg-red-600/[0.04] blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* ──── LEFT HERO COLUMN ──── */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="col-span-1 lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5 sm:space-y-4 max-w-xl lg:max-w-none mx-auto lg:mx-0 w-full"
          >
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-medium text-neutral-300 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Your Complete AI Study Partner</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[32px] sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-white leading-[1.08] lg:leading-[1.1]">
              Turn YouTube Videos <br />
              into <span className="text-[#ef4444]">Smart Study Notes</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-xs sm:text-sm lg:text-[15px] text-neutral-400 font-normal leading-relaxed max-w-md">
              From lectures to mastery. Generate structured notes, PDFs, presentations, quizzes, flashcards & mind maps in seconds with AI.
            </p>

            {/* Social Proof Row */}
            <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-0.5">
              {/* Overlapping Avatars */}
              <div className="flex items-center -space-x-2">
                {AVATARS.map((avatar, idx) => (
                  <div 
                    key={idx} 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-neutral-950 overflow-hidden bg-neutral-800 shadow-sm relative shrink-0"
                  >
                    <img 
                      src={avatar.img} 
                      alt={avatar.name} 
                      className="w-full h-full object-cover" 
                      loading="eager"
                    />
                  </div>
                ))}
              </div>

              {/* Stars + Rating Text */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-0.5 text-amber-400 text-xs leading-none">
                  {"★★★★★"}
                </div>
                <span className="text-[10.5px] sm:text-xs font-medium text-neutral-300 mt-0.5">
                  Loved by 200,000+ Students
                </span>
              </div>
            </div>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full pt-1">
              <button
                onClick={() => router.push("/youtube-to-notes")}
                className="flex items-center justify-center gap-2 h-11 sm:h-12 px-6 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md transition-all transform active:scale-[0.98] cursor-pointer w-full sm:w-auto"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Upload YouTube Video</span>
              </button>

              <button
                onClick={() => router.push("/tools")}
                className="flex items-center justify-center gap-2 h-11 sm:h-12 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-neutral-200 font-medium text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer w-full sm:w-auto"
              >
                <LayoutGrid size={14} className="text-neutral-400" />
                <span>Explore AI Tools</span>
              </button>
            </div>

            {/* Hero Trust Features */}
            <div className="flex items-center justify-center lg:justify-start flex-wrap gap-3 sm:gap-4 pt-1 text-[11px] sm:text-xs text-neutral-400 font-normal">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-neutral-300" />
                <span>Instant & Precise</span>
              </div>
              <span className="text-neutral-700">•</span>
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-neutral-300" />
                <span>LaTeX & Code Support</span>
              </div>
              <span className="text-neutral-700">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-neutral-300" />
                <span>Encrypted & Private</span>
              </div>
            </div>

          </motion.div>

          {/* ──── RIGHT HERO PRODUCT PREVIEW (macOS/iPadOS Glass Showroom) ──── */}
          {isDesktop && (
            <div 
              data-desktop-preview="true"
              className="hidden lg:block lg:col-span-6 w-full max-w-lg lg:max-w-none mx-auto"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.08 }}
              >
                {/* Outer Glassmorphic Window Card */}
                <div className="relative rounded-2xl bg-[#09090c] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all">
                  
                  {/* Window Title Bar */}
                  <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                      <span className="text-[11px] font-medium text-neutral-400 ml-2">
                        CS229: Machine Learning • Stanford
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-medium text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>AI Ready</span>
                    </div>
                  </div>

                  {/* Body Workspace Grid */}
                  <div className="p-4 space-y-3.5">
                    
                    {/* Video Player + Output Checklist Grid */}
                    <div className="grid grid-cols-12 gap-3 items-stretch">
                      
                      {/* Video Player Mockup (7 cols) */}
                      <div 
                        onClick={() => router.push("/youtube-to-notes")}
                        className="col-span-7 relative aspect-[16/10] rounded-xl overflow-hidden bg-black border border-white/[0.06] group cursor-pointer"
                      >
                        <img 
                          src="/stanford-lecture.jpg" 
                          alt="Stanford ML Lecture" 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />

                        {/* Subtle Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <Play size={13} className="fill-white translate-x-0.5" />
                          </div>
                        </div>

                        {/* Video Controls Bar */}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/95 to-transparent space-y-1">
                          <div className="w-full h-0.5 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-[38%] h-full bg-[#ef4444]" />
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-neutral-300 font-mono">
                            <div className="flex items-center gap-1.5">
                              <Volume2 size={9} />
                              <span>12:45 / 1:24:36</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Settings size={9} />
                              <Maximize size={9} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Output Tabs Checklist (5 cols) */}
                      <div className="col-span-5 flex flex-col justify-between gap-1 bg-white/[0.02] rounded-xl p-1.5 border border-white/[0.05]">
                        {[
                          { id: "notes", title: "Smart Notes", icon: FileText, color: "text-red-400" },
                          { id: "ppt", title: "PPT Slides", icon: Presentation, color: "text-orange-400" },
                          { id: "quiz", title: "Interactive Quiz", icon: HelpCircle, color: "text-purple-400" },
                          { id: "cards", title: "Flashcards", icon: Layers, color: "text-blue-400" },
                          { id: "mindmap", title: "Mind Map", icon: GitBranch, color: "text-emerald-400" }
                        ].map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                              "flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer text-left",
                              activeTab === item.id 
                                ? "bg-white/[0.08] border-white/[0.12]" 
                                : "bg-transparent border-transparent hover:bg-white/[0.03]"
                            )}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className={cn("w-4 h-4 rounded flex items-center justify-center shrink-0", item.color)}>
                                <item.icon size={11} />
                              </div>
                              <span className="text-[10px] font-medium text-neutral-200 truncate">
                                {item.title}
                              </span>
                            </div>
                            <Check size={9} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                          </div>
                        ))}
                      </div>

                    </div>

                    {/* AI Structured Notes Preview Snippet */}
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                          <Sparkles size={11} className="text-red-400" />
                          <span>Generated Summary & Formulas</span>
                        </div>
                        <span className="text-[9px] text-neutral-500 font-mono">04:12 Timestamp</span>
                      </div>

                      <p className="text-[10.5px] text-neutral-400 leading-snug font-normal">
                        • <strong className="text-neutral-300">Cost Function:</strong> <span className="font-mono text-neutral-300 text-[10px]">J(θ) = 1/2m ∑ (h_θ(x) - y)²</span> calculates regression error across m training examples.
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[9.5px] text-neutral-400">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-300">PDF Ready</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-300">Notion Sync</span>
                        </div>
                        <span className="text-neutral-500">Processed in 8.4s</span>
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            </div>
          )}

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          2. STATISTICS STRIP (5 Metrics In 1 Row)
      ────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="w-full rounded-2xl bg-[#09090c] border border-white/[0.08] backdrop-blur-xl py-3.5 px-3 sm:px-6 shadow-sm">
          <div className="grid grid-cols-5 divide-x divide-white/[0.06] text-center">
            
            {/* Stat 1: 200K+ Students */}
            <div className="flex flex-col items-center justify-center px-1 sm:px-4 py-0.5">
              <div className="text-neutral-300 mb-1">
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
                200K+
              </span>
              <span className="text-[8.5px] sm:text-[11px] text-neutral-400 font-normal leading-tight mt-0.5">
                Active Learners
              </span>
            </div>

            {/* Stat 2: 5M+ Notes Generated */}
            <div className="flex flex-col items-center justify-center px-1 sm:px-4 py-0.5">
              <div className="text-neutral-300 mb-1">
                <FileText size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
                5M+
              </span>
              <span className="text-[8.5px] sm:text-[11px] text-neutral-400 font-normal leading-tight mt-0.5">
                Notes Generated
              </span>
            </div>

            {/* Stat 3: 10M+ Hours Saved */}
            <div className="flex flex-col items-center justify-center px-1 sm:px-4 py-0.5">
              <div className="text-neutral-300 mb-1">
                <Clock size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
                10M+
              </span>
              <span className="text-[8.5px] sm:text-[11px] text-neutral-400 font-normal leading-tight mt-0.5">
                Hours Saved
              </span>
            </div>

            {/* Stat 4: #1 AI Study Platform */}
            <div className="flex flex-col items-center justify-center px-1 sm:px-4 py-0.5">
              <div className="text-neutral-300 mb-1">
                <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
                #1
              </span>
              <span className="text-[8.5px] sm:text-[11px] text-neutral-400 font-normal leading-tight mt-0.5">
                AI Study Suite
              </span>
            </div>

            {/* Stat 5: 99.9% Secure & Private */}
            <div className="flex flex-col items-center justify-center px-1 sm:px-4 py-0.5">
              <div className="text-neutral-300 mb-1">
                <ShieldCheck size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
              </div>
              <span className="text-xs sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
                99.9%
              </span>
              <span className="text-[8.5px] sm:text-[11px] text-neutral-400 font-normal leading-tight mt-0.5">
                Accuracy Rate
              </span>
            </div>

          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          3. TRUSTED ORGANIZATIONS SECTION
      ────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center">
        <h3 className="text-xs sm:text-sm font-medium text-neutral-400 tracking-tight mb-3.5 sm:mb-4">
          Trusted by Students & Researchers from
        </h3>

        {/* 6 Partner Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "Google", img: "/homepage_con/google.png", scale: "scale-105", sub: "Research & innovation" },
            { name: "Microsoft", img: "/homepage_con/microsoft.png", scale: "scale-100", sub: "Global tech & cloud" },
            { name: "Stanford University", img: "/homepage_con/stainford.png", scale: "scale-100", sub: "Academic excellence" },
            { name: "MIT", img: "/homepage_con/mit.png", scale: "scale-100", sub: "Engineering & science" },
            { name: "Harvard University", img: "/homepage_con/havard.png", scale: "scale-100", sub: "Higher education" },
            { name: "National University of Singapore", img: "/homepage_con/nus.png", scale: "scale-100", sub: "Global research" },
          ].map((partner, idx) => (
            <div 
              key={idx} 
              className="bg-[#09090c] border border-white/[0.06] hover:border-white/[0.14] rounded-2xl p-3.5 flex flex-col items-center justify-between text-center transition-all duration-200 group overflow-hidden"
            >
              <div className="h-8 sm:h-9 w-full flex items-center justify-center overflow-hidden">
                <img 
                  src={partner.img} 
                  alt={partner.name} 
                  className={cn("h-6 sm:h-7 w-auto max-w-[100px] max-h-7 object-contain opacity-75 group-hover:opacity-100 transition-opacity", partner.scale)}
                />
              </div>
              <p className="text-[10px] text-neutral-500 group-hover:text-neutral-400 font-normal leading-tight mt-2 transition-colors">
                {partner.sub}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          4. 20+ POWERFUL TOOLS SECTION & CAROUSEL
      ────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-hidden">
        
        {/* Section Header */}
        <div className="flex items-start sm:items-end justify-between gap-2 mb-3.5 sm:mb-5">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
              <span>All-In-One Toolkit</span>
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              20+ Powerful Tools for Students & Developers
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Everything you need to convert lectures, synthesize notes, and study faster.
            </p>
          </div>

          {/* Right Action + Arrow Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/tools")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-all cursor-pointer group"
            >
              <span>View All Tools</span>
              <ArrowRight size={11} className="text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Carousel Cards with Controls */}
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollCarousel("left")}
            className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#09090c] border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-95 opacity-0 group-hover/carousel:opacity-100 sm:opacity-90"
            aria-label="Previous"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollCarousel("right")}
            className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#09090c] border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-95 opacity-0 group-hover/carousel:opacity-100 sm:opacity-90"
            aria-label="Next"
          >
            <ChevronRight size={14} />
          </button>

          {/* Cards Container */}
          <div 
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 w-full max-w-full"
          >
            {TOOLS_CAROUSEL.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => router.push(tool.href)}
                  className="w-[140px] sm:w-[155px] lg:w-[165px] min-w-[140px] sm:min-w-[155px] lg:min-w-[165px] flex-1 rounded-2xl p-4 bg-[#09090c] border border-white/[0.07] hover:border-white/[0.16] transition-all duration-200 cursor-pointer snap-start flex flex-col justify-between group hover:-translate-y-0.5 relative overflow-hidden"
                >
                  {/* Popular Tag */}
                  {tool.badge && (
                    <span className="absolute top-2.5 right-2.5 text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                      {tool.badge}
                    </span>
                  )}

                  {/* Card Icon */}
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white/[0.08] transition-colors">
                    <Icon size={17} className={tool.iconColor} />
                  </div>

                  {/* Card Content */}
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold text-white tracking-tight group-hover:text-red-400 transition-colors leading-tight">
                      {tool.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Bottom Indicator Bar */}
        <div className="flex justify-center mt-3 sm:mt-4">
          <div className="w-16 sm:w-20 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ef4444] rounded-full transition-all duration-300"
              style={{
                width: "40%",
                transform: `translateX(${carouselIndex * 150}%)`
              }}
            />
          </div>
        </div>

      </section>

    </div>
  );
}

