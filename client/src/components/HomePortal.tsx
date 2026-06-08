"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Layout, 
  ArrowRight, 
  BrainCircuit,
  Workflow,
  PenTool,
  GraduationCap,
  Youtube,
  Play,
  Lock,
  Check,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import ToolLivePreview from "@/components/ToolLivePreview";
import { useRegionConfig } from "@/lib/localization";

interface HomePortalProps {
  region?: string;
}

export default function HomePortal({ region }: HomePortalProps) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const { config } = useRegionConfig(region);
  
  // 3D Card Tilt State & Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState("perspective(1000px) rotateX(4deg) rotateY(-6deg) scale3d(1, 1, 1)");

  const tools = [
    {
      id: "youtube-notes",
      title: "YouTube to Notes AI",
      shortTitle: "YT Notes",
      cardDescription: "Convert video lectures, crash courses & tutorials into notes & flashcards.",
      description: "Convert any YouTube lecture, crash course, or tutorial into clean structured notes, flashcard decks, and practice tests instantly.",
      features: [
        "Interactive video transcripts",
        "Flashcard deck generator",
        "Practice quiz generation",
        "Export notes to PDF & Markdown"
      ],
      previewImg: "/pro/home_papertu1.avif",
      previewGif: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cXBpdmh3d3V4OXA5bDR1OTZ6cTR0dHRxdTV1NmRxZzVnYmxsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2t2KAyvdxzyV1S/giphy.gif",
      previewUrl: "paperxify.com/youtube-to-notes",
      icon: Youtube,
      iconColor: "text-red-500",
      activeTextClass: "text-red-400",
      badge: "Popular & Active",
      badgeColor: "rgba(220, 38, 38, 0.15)",
      badgeTextColor: "#f87171",
      glowColor: "rgba(220, 38, 38, 0.2)",
      cta: "Launch Tool",
      action: () => router.push("/youtube-to-notes"),
      disabled: false
    },
    {
      id: "ai-ppt",
      title: "AI Slide Deck & PPT Maker",
      shortTitle: "Slide Maker",
      cardDescription: "Transform topics, transcripts, or notes into beautifully structured slide decks.",
      description: "Transform topics, transcripts, or notes into beautifully structured slide decks and study presentation PPT files automatically.",
      features: [
        "Topic to slide outlining",
        "PDF & PPTX file exports",
        "Curated visual slide designs",
        "Custom layout configuration"
      ],
      previewImg: "/pro/home_papertu2.avif",
      previewGif: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cXBpdmh3d3V4OXA5bDR1OTZ6cTR0dHRxdTV1NmRxZzVnYmxsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjei156/giphy.gif",
      previewUrl: "paperxify.com/presentation-generator",
      icon: Layout,
      iconColor: "text-orange-500",
      activeTextClass: "text-orange-400",
      badge: "Active Tool",
      badgeColor: "rgba(249, 115, 22, 0.15)",
      badgeTextColor: "#fdba74",
      glowColor: "rgba(249, 115, 22, 0.15)",
      cta: "Launch Tool",
      action: () => router.push("/presentation-generator"),
      disabled: false
    },
    {
      id: "ai-diagram",
      title: "AI Diagram & Flowchart",
      shortTitle: "Diagrams",
      cardDescription: "Generate concept maps, mind maps & interactive flowcharts from topics.",
      description: "Generate visual concept maps, mind maps, and interactive flowcharts from topics or notes to study visually.",
      features: [
        "Flowcharts & mindmaps",
        "Sequence & state diagrams",
        "Class & ER diagrams",
        "Mermaid.js interactive editor"
      ],
      previewImg: "/pro/home_papertu3.avif",
      previewGif: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cXBpdmh3d3V4OXA5bDR1OTZ6cTR0dHRxdTV1NmRxZzVnYmxsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9IgzoKnwFNmISR8I/giphy.gif",
      previewUrl: "paperxify.com/ai-diagram",
      icon: Workflow,
      iconColor: "text-cyan-500",
      activeTextClass: "text-cyan-400",
      badge: "New Release",
      badgeColor: "rgba(6, 182, 212, 0.15)",
      badgeTextColor: "#22d3ee",
      glowColor: "rgba(6, 182, 212, 0.15)",
      cta: "Launch Tool",
      action: () => router.push("/ai-diagram"),
      disabled: false
    },
    {
      id: "ai-writer",
      title: "AI Writer & Editor",
      shortTitle: "Writer",
      cardDescription: "Draft essays, research summaries & study guides with academic formatting.",
      description: "Draft high-quality essays, research summaries, study guides, and blog posts with advanced academic formatting.",
      features: [
        "AI Essay & Summarizer writer",
        "Custom citation styles",
        "Plagiarism & detector scanner",
        "Rich text editor workspace"
      ],
      previewImg: "/pro/home_papertu4.avif",
      previewGif: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cXBpdmh3d3V4OXA5bDR1OTZ6cTR0dHRxdTV1NmRxZzVnYmxsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1jkl6H6/giphy.gif",
      previewUrl: "paperxify.com/ai-writer",
      icon: PenTool,
      iconColor: "text-amber-500",
      activeTextClass: "text-amber-400",
      badge: "New Release",
      badgeColor: "rgba(245, 158, 11, 0.15)",
      badgeTextColor: "#fbbf24",
      glowColor: "rgba(245, 158, 11, 0.15)",
      cta: "Launch Tool",
      action: () => router.push("/ai-writer"),
      disabled: false
    },
    {
      id: "ai-study",
      title: "AI Study Room",
      shortTitle: "Study Room",
      cardDescription: "Homework helper, step-by-step math solver & MCQ quiz player.",
      description: "Supercharge your learning with AI Homework Helper, step-by-step AI Math Solver, and instant AI Quiz Generator tools.",
      features: [
        "Concept homework helper",
        "Step-by-step LaTeX math solver",
        "Interactive quiz taker & scoring",
        "Feynman learning workspace"
      ],
      previewImg: "/pro/home_papertu5.avif",
      previewGif: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cXBpdmh3d3V4OXA5bDR1OTZ6cTR0dHRxdTV1NmRxZzVnYmxsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2SpUNVz1T25rQcEw/giphy.gif",
      previewUrl: "paperxify.com/ai-study",
      icon: GraduationCap,
      iconColor: "text-pink-500",
      activeTextClass: "text-pink-400",
      badge: "New Release",
      badgeColor: "rgba(236, 72, 153, 0.15)",
      badgeTextColor: "#f472b6",
      glowColor: "rgba(236, 72, 153, 0.15)",
      cta: "Launch Tool",
      action: () => router.push("/ai-study"),
      disabled: false
    }
  ];

  const activeTool = tools[activeIdx];

  // 3D Card Tilt Math
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(hover: none)").matches) return;
    
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = -(xc - x) / 18; // tilt intensity
    const rotateX = (yc - y) / 12;
    setTiltStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTiltStyle("perspective(1000px) rotateX(4deg) rotateY(-6deg) scale3d(1, 1, 1)");
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-12 text-center relative z-10 selection:bg-red-900/50 font-sans">
      
      {/* Hero Header */}
      <div className="space-y-6 max-w-3xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-300"
        >
          <Sparkles size={11} className="text-red-500" />
          <span>Paperxify AI Study Suite</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight text-white"
        >
          {config.heroTitle}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed max-w-2xl mx-auto"
        >
          {config.heroSubtitle}
        </motion.p>
      </div>

      {/* ── DESKTOP/LAPTOP SHOWROOM VIEW ── */}
      <div className="hidden lg:grid grid-cols-12 gap-10 items-stretch text-left mt-10">
        
        {/* Left Column (Vertical Category List - 5 cols) */}
        <div className="col-span-5 flex flex-col gap-4.5 justify-center">
          {tools.map((tool, idx) => {
            const ToolIcon = tool.icon;
            const isActive = idx === activeIdx;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "relative text-left w-full m-1 p-5 rounded-2xl border transition-all duration-300 outline-none flex items-center gap-4 group cursor-pointer overflow-hidden",
                  isActive
                    ? tool.id === "youtube-notes" ? "border-red-500/30 bg-red-500/[0.03] shadow-[0_4px_20px_-5px_rgba(239,68,68,0.15)]" :
                      tool.id === "ai-ppt" ? "border-orange-500/30 bg-orange-500/[0.03] shadow-[0_4px_20px_-5px_rgba(249,115,22,0.15)]" :
                      tool.id === "ai-diagram" ? "border-cyan-500/30 bg-cyan-500/[0.03] shadow-[0_4px_20px_-5px_rgba(6,182,212,0.15)]" :
                      tool.id === "ai-writer" ? "border-amber-500/30 bg-amber-500/[0.03] shadow-[0_4px_20px_-5px_rgba(245,158,11,0.15)]" :
                      "border-pink-500/30 bg-pink-500/[0.03] shadow-[0_4px_20px_-5px_rgba(236,72,153,0.15)]"
                    : "border-white/[0.04] bg-white/[0.01] hover:border-white/[0.1] hover:bg-white/[0.02]"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveBar"
                    className={cn("absolute left-0 top-0 bottom-0 w-[4px]",
                      tool.id === "youtube-notes" ? "bg-red-500 shadow-[0_0_8px_#ef4848]" :
                      tool.id === "ai-ppt" ? "bg-orange-500 shadow-[0_0_8px_#f97316]" :
                      tool.id === "ai-diagram" ? "bg-cyan-500 shadow-[0_0_8px_#06b6d4]" :
                      tool.id === "ai-writer" ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
                      "bg-pink-500 shadow-[0_0_8px_#ec4899]"
                    )}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                
                {/* Brand Icon Container */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0",
                  isActive
                    ? tool.id === "youtube-notes" ? "bg-red-500/10 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)] text-red-500" :
                      tool.id === "ai-ppt" ? "bg-orange-500/10 border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.2)] text-orange-500" :
                      tool.id === "ai-diagram" ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)] text-cyan-500" :
                      tool.id === "ai-writer" ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)] text-amber-500" :
                      "bg-pink-500/10 border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.2)] text-pink-500"
                    : "bg-white/[0.02] border-white/[0.05] text-neutral-500 group-hover:text-neutral-300"
                )}>
                  <ToolIcon size={20} className={isActive ? "animate-pulse" : ""} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[14px] font-extrabold transition-colors leading-tight",
                      isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"
                    )}>
                      {tool.title}
                    </span>
                    {tool.badge && (
                      <span 
                        className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border border-white/[0.02] shrink-0 scale-90 origin-left"
                        style={{
                          background: tool.badgeColor,
                          color: tool.badgeTextColor
                        }}
                      >
                        {tool.badge.split(" ")[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light mt-1.5 leading-relaxed truncate group-hover:text-neutral-200 transition-colors">
                    {tool.cardDescription}
                  </p>
                </div>

                {/* Micro-arrow indicator */}
                <ArrowRight 
                  size={14} 
                  className={cn(
                    "text-neutral-600 transition-all duration-300 group-hover:text-neutral-400 shrink-0",
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  )} 
                />
              </button>
            );
          })}
        </div>
        
        {/* Right Column (Showroom visual mock + features/CTA - 7 cols) */}
        <div className="col-span-7 flex flex-col gap-6 justify-center">
          
          {/* Main 3D tilt preview */}
          <div className="relative w-full">
            
            {/* Radial brand-colored glow backdrop */}
            <div 
              className="absolute -inset-10 opacity-30 blur-[100px] rounded-full pointer-events-none transition-all duration-500 z-0" 
              style={{
                background: `radial-gradient(circle, ${activeTool.glowColor} 0%, transparent 70%)`
              }}
            />

            {/* Tilt Box */}
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => activeTool.action()}
              className={cn(
                "relative w-full aspect-[16/9.5] rounded-2xl border bg-black/85 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] transition-all duration-300 ease-out cursor-pointer group/preview z-10",
                activeTool.id === "youtube-notes" ? "border-red-500/10 hover:border-red-500/30 hover:shadow-[0_0_35px_rgba(239,68,68,0.25)]" :
                activeTool.id === "ai-ppt" ? "border-orange-500/10 hover:border-orange-500/30 hover:shadow-[0_0_35px_rgba(249,115,22,0.25)]" :
                activeTool.id === "ai-diagram" ? "border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)]" :
                activeTool.id === "ai-writer" ? "border-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]" :
                "border-pink-500/10 hover:border-pink-500/30 hover:shadow-[0_0_35px_rgba(236,72,153,0.25)]"
              )}
              style={{ 
                transform: tiltStyle,
                transformStyle: "preserve-3d"
              }}
            >
              {/* Browser control bar */}
              <div className="h-8 bg-neutral-950/80 border-b border-white/[0.04] flex items-center justify-between px-3.5 z-20 relative select-none">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={cn("w-1.5 h-1.5 rounded-full", 
                    activeTool.id === "youtube-notes" ? "bg-red-500/70" :
                    activeTool.id === "ai-ppt" ? "bg-orange-500/70" :
                    activeTool.id === "ai-diagram" ? "bg-cyan-500/70" :
                    activeTool.id === "ai-writer" ? "bg-amber-500/70" :
                    "bg-pink-500/70"
                  )} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
                
                <div className="bg-white/5 border border-white/[0.04] rounded-md px-3 py-0.5 text-[8.5px] font-mono text-neutral-400 flex items-center gap-1 truncate max-w-[240px] text-center">
                  <Lock size={7.5} className="text-neutral-500 shrink-0" />
                  <span className="truncate">{activeTool.previewUrl}</span>
                </div>
                <div className="w-[18px] h-1 bg-white/10 rounded-full shrink-0" />
              </div>

              {/* Viewport content */}
              <div className="absolute inset-x-0 bottom-0 top-8 overflow-hidden bg-[#050505] flex items-center justify-center">
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/75 border border-white/10 backdrop-blur-md">
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                    activeTool.id === "youtube-notes" ? "bg-red-500 shadow-[0_0_6px_#ef4848]" :
                    activeTool.id === "ai-ppt" ? "bg-orange-500 shadow-[0_0_6px_#f97316]" :
                    activeTool.id === "ai-diagram" ? "bg-cyan-500 shadow-[0_0_6px_#06b6d4]" :
                    activeTool.id === "ai-writer" ? "bg-amber-500 shadow-[0_0_6px_#f59e0b]" :
                    "bg-pink-500 shadow-[0_0_6px_#ec4899]"
                  )} />
                  <span className="text-[7.5px] font-bold uppercase tracking-widest text-neutral-400">Live Preview</span>
                </div>
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.015] to-white/0 pointer-events-none z-10" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTool.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full select-none pointer-events-none group-hover/preview:scale-103 transition-transform duration-500"
                  >
                    <ToolLivePreview toolId={activeTool.id} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Details below preview */}
          <div className="bg-neutral-900/35 border border-white/[0.04] p-6 rounded-2xl space-y-5 flex flex-col justify-between">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-3.5">
                <span 
                  className="inline-flex text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/[0.03]"
                  style={{
                    background: activeTool.badgeColor,
                    color: activeTool.badgeTextColor
                  }}
                >
                  {activeTool.badge}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-2">{activeTool.title}</h2>
              <p className="text-xs text-neutral-300 font-light mt-2 leading-relaxed max-w-2xl">{activeTool.description}</p>
            </div>

            {/* Features & Action section */}
            <div className="flex items-center justify-between gap-6 pt-5 border-t border-white/[0.04] w-full">
              {/* Checklist grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 flex-1">
                {activeTool.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-[10.5px] text-neutral-300">
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center border shrink-0",
                      activeTool.id === "youtube-notes" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                      activeTool.id === "ai-ppt" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                      activeTool.id === "ai-diagram" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                      activeTool.id === "ai-writer" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-pink-500/10 border-pink-500/20 text-pink-400"
                    )}>
                      <Check size={9} strokeWidth={3} />
                    </div>
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => activeTool.action()}
                className={cn(
                  "flex items-center justify-center gap-2.5 h-12 px-7 rounded-xl text-black font-extrabold uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shrink-0 group/btn cursor-pointer",
                  activeTool.id === "youtube-notes" ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_6px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.35)]" :
                  activeTool.id === "ai-ppt" ? "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_6px_20px_rgba(249,115,22,0.25)] hover:shadow-[0_8px_25px_rgba(249,115,22,0.35)]" :
                  activeTool.id === "ai-diagram" ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_6px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_8px_25px_rgba(6,182,212,0.35)]" :
                  activeTool.id === "ai-writer" ? "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_6px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.35)]" :
                  "bg-pink-500 hover:bg-pink-600 text-white shadow-[0_6px_20px_rgba(236,72,153,0.25)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.35)]"
                )}
              >
                <span>{activeTool.cta}</span>
                <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE/TABLET COMPACT VIEW (Vertical Accordion) ── */}
      <div className="lg:hidden flex flex-col gap-3.5 w-full max-w-md mx-auto mt-6">
        {tools.map((tool, idx) => {
          const ToolIcon = tool.icon;
          const isActive = idx === activeIdx;
          
          return (
            <div
              key={tool.id}
              className={cn(
                "w-full rounded-2xl border transition-all duration-300 relative overflow-hidden",
                isActive
                  ? tool.id === "youtube-notes" ? "border-red-500/30 bg-red-500/[0.03] shadow-[0_4px_20px_-5px_rgba(239,68,68,0.15)]" :
                    tool.id === "ai-ppt" ? "border-orange-500/30 bg-orange-500/[0.03] shadow-[0_4px_20px_-5px_rgba(249,115,22,0.15)]" :
                    tool.id === "ai-diagram" ? "border-cyan-500/30 bg-cyan-500/[0.03] shadow-[0_4px_20px_-5px_rgba(6,182,212,0.15)]" :
                    tool.id === "ai-writer" ? "border-amber-500/30 bg-amber-500/[0.03] shadow-[0_4px_20px_-5px_rgba(245,158,11,0.15)]" :
                    "border-pink-500/30 bg-pink-500/[0.03] shadow-[0_4px_20px_-5px_rgba(236,72,153,0.15)]"
                  : "border-white/[0.04] bg-white/[0.01]"
              )}
            >
              
              {/* Header block (clickable tab toggle) */}
              <button
                onClick={() => setActiveIdx(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-4.5 outline-none select-none text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-300 shrink-0",
                    isActive
                      ? tool.id === "youtube-notes" ? "bg-red-500/15 border-red-500/30 text-red-400 animate-pulse" :
                        tool.id === "ai-ppt" ? "bg-orange-500/15 border-orange-500/30 text-orange-400 animate-pulse" :
                        tool.id === "ai-diagram" ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400 animate-pulse" :
                        tool.id === "ai-writer" ? "bg-amber-500/15 border-amber-500/30 text-amber-400 animate-pulse" :
                        "bg-pink-500/15 border-pink-500/30 text-pink-400 animate-pulse"
                      : "bg-white/5 border-white/10 text-neutral-400"
                  )}>
                    <ToolIcon size={16} />
                  </div>
                  
                  <div>
                    <span className={cn(
                      "text-xs font-extrabold uppercase tracking-wider block transition-colors",
                      isActive ? "text-white" : "text-neutral-400"
                    )}>
                      {tool.title}
                    </span>
                    {!isActive && (
                      <span className="text-[9.5px] text-neutral-400 font-light block mt-0.5 leading-none">
                        {tool.cardDescription.substring(0, 48)}...
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {tool.badge && !isActive && (
                    <span 
                      className="text-[7.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border border-white/[0.02] scale-90 shrink-0"
                      style={{
                        background: tool.badgeColor,
                        color: tool.badgeTextColor
                      }}
                    >
                      {tool.badge.split(" ")[0]}
                    </span>
                  )}
                  
                  <ChevronDown 
                    size={14} 
                    className={cn(
                      "text-neutral-500 transition-transform duration-300 shrink-0",
                      isActive ? "rotate-180 text-white" : ""
                    )}
                  />
                </div>
              </button>

              {/* Animated Expansion Content Panel */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-5 pt-1.5 border-t border-white/[0.04] flex flex-col gap-4 text-left">
                      
                      {/* Description */}
                      <p className="text-[11px] text-neutral-300 font-light leading-relaxed">
                        {tool.description}
                      </p>

                      {/* visual GIF browser preview */}
                      <div 
                        onClick={() => tool.action()}
                        className={cn(
                          "relative w-full aspect-[16/9.5] rounded-xl border bg-black/85 overflow-hidden shadow-[0_12px_30px_-8px_rgba(0,0,0,0.85)] cursor-pointer",
                          tool.id === "youtube-notes" ? "border-red-500/10 active:border-red-500/30" :
                          tool.id === "ai-ppt" ? "border-orange-500/10 active:border-orange-500/30" :
                          tool.id === "ai-diagram" ? "border-cyan-500/10 active:border-cyan-500/30" :
                          tool.id === "ai-writer" ? "border-amber-500/10 active:border-amber-500/30" :
                          "border-pink-500/10 active:border-pink-500/30"
                        )}
                      >
                        {/* Chrome bar */}
                        <div className="h-7 bg-neutral-950/80 border-b border-white/[0.04] flex items-center justify-between px-2.5 z-20 relative select-none">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className={cn("w-1 h-1 rounded-full", 
                              tool.id === "youtube-notes" ? "bg-red-500/70" :
                              tool.id === "ai-ppt" ? "bg-orange-500/70" :
                              tool.id === "ai-diagram" ? "bg-cyan-500/70" :
                              tool.id === "ai-writer" ? "bg-amber-500/70" :
                              "bg-pink-500/70"
                            )} />
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                          </div>
                          
                          <div className="bg-white/5 border border-white/[0.04] rounded-md px-2 py-0.5 text-[7px] font-mono text-neutral-400 flex items-center gap-0.5 truncate max-w-[150px] text-center">
                            <Lock size={6.5} className="text-neutral-500 shrink-0" />
                            <span className="truncate">{tool.previewUrl}</span>
                          </div>
                          <div className="w-[12px] h-0.5 bg-white/10 rounded-full shrink-0" />
                        </div>

                        {/* Viewport */}
                        <div className="absolute inset-x-0 bottom-0 top-7 overflow-hidden bg-[#050505] flex items-center justify-center">
                          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/75 border border-white/10 backdrop-blur-md">
                            <span className={cn("w-1 h-1 rounded-full animate-pulse",
                              tool.id === "youtube-notes" ? "bg-red-500 shadow-[0_0_6px_#ef4848]" :
                              tool.id === "ai-ppt" ? "bg-orange-500 shadow-[0_0_6px_#f97316]" :
                              tool.id === "ai-diagram" ? "bg-cyan-500 shadow-[0_0_6px_#06b6d4]" :
                              tool.id === "ai-writer" ? "bg-amber-500 shadow-[0_0_6px_#f59e0b]" :
                              "bg-pink-500 shadow-[0_0_6px_#ec4899]"
                            )} />
                            <span className="text-[6.5px] font-bold uppercase tracking-widest text-neutral-400">Live Preview</span>
                          </div>


                          <div className="w-full h-full select-none pointer-events-none">
                            <ToolLivePreview toolId={tool.id} />
                          </div>
                        </div>
                      </div>

                      {/* Feature Capsules */}
                      <div className="flex flex-wrap gap-1.5">
                        {tool.features.map((feature, fIdx) => (
                          <span key={fIdx} className="text-[8.5px] text-neutral-300 bg-white/[0.02] border border-white/[0.04] px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                            <Check size={8} className="text-neutral-300" />
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Launch Button */}
                      <button
                        onClick={() => tool.action()}
                        className={cn(
                          "flex items-center justify-center gap-2 h-10 px-6 rounded-xl text-black font-extrabold uppercase tracking-widest text-[9.5px] transition-all active:scale-[0.97] w-full shadow-lg",
                          tool.id === "youtube-notes" ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)]" :
                          tool.id === "ai-ppt" ? "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]" :
                          tool.id === "ai-diagram" ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_4px_12px_rgba(6,182,212,0.3)]" :
                          tool.id === "ai-writer" ? "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]" :
                          "bg-pink-500 hover:bg-pink-600 text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]"
                        )}
                      >
                        <span>{tool.cta}</span>
                        <ArrowRight size={11} />
                      </button>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          );
        })}
      </div>
    </section>
  );
}
