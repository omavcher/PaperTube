"use client";
// Paperxify HomePortal - Apple & Linear-Grade Hero, Metrics & Tools Showroom
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { HeroAgentSection } from "@/components/agent/HeroAgentSection";
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
  Cpu,
  Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_METRICS } from "@/config/siteMetrics";

interface HomePortalProps {
  region?: string;
  user?: any;
}

// Student avatars data with descriptive roles for accessibility
const AVATARS = [
  { name: "Sarah K.", role: "Stanford Student", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" },
  { name: "David M.", role: "MIT Engineering", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80" },
  { name: "Priya P.", role: "Medical Student", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80" },
  { name: "Alex R.", role: "CS Undergraduate", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" }
];

// 1. Study & Academic Suite
const STUDY_TOOLS = [
  {
    id: "yt-notes",
    title: "YouTube to Notes",
    desc: "AI video notes & timestamps",
    icon: Youtube,
    iconColor: "text-red-400",
    badge: "Most Popular",
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
    badge: "Study",
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
    id: "essay-writer",
    title: "AI Essay Writer",
    desc: "Structured citations & thesis",
    icon: FileText,
    iconColor: "text-blue-400",
    href: "/ai-writer/essay-writer",
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
    id: "ai-detector",
    title: "AI Detector & Cert",
    desc: "Authenticity verify & certs",
    icon: ShieldAlert,
    iconColor: "text-yellow-400",
    badge: "Verified",
    href: "/ai-writer/ai-detector",
  },
];

// 2. Developer & PDF Utilities Lab
const DEV_TOOLS = [
  {
    id: "pdf-merge",
    title: "Merge PDF",
    desc: "Combine documents seamlessly",
    icon: FileCheck2,
    iconColor: "text-red-400",
    badge: "Popular",
    href: "/tools/merge",
  },
  {
    id: "pdf-split",
    title: "Split PDF",
    desc: "Extract & separate pages",
    icon: FileText,
    iconColor: "text-emerald-400",
    href: "/tools/split",
  },
  {
    id: "json-formatter",
    title: "JSON Formatter & Validator",
    desc: "Beautify, inspect & fix JSON",
    icon: Code2,
    iconColor: "text-blue-400",
    badge: "Utility",
    href: "/tools/json-formatter",
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
    id: "code-to-image",
    title: "Code to Image",
    desc: "Render beautiful snippets",
    icon: Code2,
    iconColor: "text-cyan-400",
    href: "/tools/code-to-image",
  },
  {
    id: "base-converter",
    title: "Base Converter",
    desc: "Binary, Hex, Octal & Decimal",
    icon: Calculator,
    iconColor: "text-slate-400",
    href: "/tools/base-converter",
  },
  {
    id: "ai-metadata-remover",
    title: "AI Metadata Remover",
    desc: "Strip AI markers from images",
    icon: ShieldAlert,
    iconColor: "text-rose-400",
    badge: "Privacy",
    href: "/tools/ai-metadata-remover",
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
    id: "typing-test",
    title: "Typing Speed Test",
    desc: "Precision WPM velocity test",
    icon: Zap,
    iconColor: "text-emerald-400",
    href: "/tools/typing-test",
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

// 4 Curated PDF Study Guides from User Lectures
const PDF_STUDY_GUIDES = [
  {
    id: "cs229",
    title: "Neural Networks & Backpropagation",
    subtitle: "Lecture 10: Deep Learning Foundations",
    channel: "Stanford University • Prof. Andrew Ng",
    tag: "Stanford CS229 • Lecture 10",
    url: "https://youtu.be/jGW0_UgTS7I",
    slug: "notes-stanford-cs229-ml-jgwo_ugts7i",
    pages: "3 Pages",
    edition: "Minimalist Edition",
    img: "/pdf-preview-1.webp",
    badge: "Machine Learning",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    duration: "11:24",
    videoInfo: "5 study outputs · 11.2 min lecture",
  },
  {
    id: "mit-804",
    title: "Introduction to Superposition & Dirac Ket",
    subtitle: "Lecture 1: Quantum Physics Foundations",
    channel: "MIT OpenCourseWare • Prof. Allan Adams",
    tag: "MIT 8.04 • Lecture 1",
    url: "https://youtu.be/lZ3bPUKo5zc",
    slug: "notes-mit-804-quantum-physics-lz3bpuko5zc",
    pages: "2 Pages",
    edition: "Atmosphere Edition",
    img: "/pdf-preview-2.webp",
    badge: "Quantum Physics",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    duration: "7:04",
    videoInfo: "5 study outputs · 7.5 min lecture",
  },
  {
    id: "econ-4",
    title: "Supply & Demand Market Equilibrium",
    subtitle: "Crash Course Economics Episode 4",
    channel: "Crash Course • Adriene Hill & Jacob Clifford",
    tag: "Crash Course • Economics #4",
    url: "https://youtu.be/g9aDizJpd_s",
    slug: "notes-supply-and-demand-g9adizjpds",
    pages: "3 Pages",
    edition: "Kraft Edition",
    img: "/pdf-preview-3.webp",
    badge: "Economics",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    duration: "10:22",
    videoInfo: "5 study outputs · 10.3 min video",
  },
  {
    id: "bio-cells",
    title: "Cell Structure, Organelles & Membranes",
    subtitle: "Eukaryotic Organelles & Transport",
    channel: "Bozeman Science • Paul Andersen",
    tag: "AP Biology • Cell Unit",
    url: "https://youtu.be/URUJD5NEXC8",
    slug: "notes-biology-cell-structure-urujd5nexc8",
    pages: "3 Pages",
    edition: "Atmosphere Edition",
    img: "/pdf-preview-4.webp",
    badge: "Cell Biology",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    duration: "9:45",
    videoInfo: "5 study outputs · 9.8 min lecture",
  },
];

function HeroInteractiveShowroom({
  selectedPill,
  setSelectedPill,
  onAction,
  isMobile = false,
  anchorRef,
  onLoadedChange,
  isLoaded = false,
  onSelectGuide,
}: {
  selectedPill: string;
  setSelectedPill: (pill: string) => void;
  onAction: () => void;
  isMobile?: boolean;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
  onLoadedChange?: (loaded: boolean) => void;
  isLoaded?: boolean;
  onSelectGuide?: (url: string, slug?: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalized mouse coordinates from -0.5 to 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth, springy iOS physics
  const springConfig = { stiffness: 90, damping: 20, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 1. Foreground card: 3D perspective tilt & slight shift
  const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const cardX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const cardY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  // 2. Left Background Card (lemon-marks.webp) - Deep counter parallax & floating
  const lemonX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const lemonY = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const lemonRotate = useTransform(smoothX, [-0.5, 0.5], [-4, -1]);

  // 3. Top-Right Background Card (burst.webp) - Secondary parallax & floating
  const burstX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const burstY = useTransform(smoothY, [-0.5, 0.5], [-16, 16]);
  const burstRotate = useTransform(smoothY, [-0.5, 0.5], [0, 3.5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Eases mouse coordinates to neutral on page scroll
  useEffect(() => {
    const handleScroll = () => {
      mouseX.set(0);
      mouseY.set(0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mouseX, mouseY]);

  // Cinematic Interactive Loop State
  const [activePdfIdx] = useState(0);
  const [displayedUrl, setDisplayedUrl] = useState("https://");
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isBtnClicked, setIsBtnClicked] = useState(false);
  const [mobileStackVisible, setMobileStackVisible] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const timeouts: NodeJS.Timeout[] = [];

    const sleep = (ms: number) =>
      new Promise((resolve) => {
        const id = setTimeout(resolve, ms);
        timeouts.push(id);
      });

    const runCinematicSequence = async () => {
      const currentGuide = PDF_STUDY_GUIDES[activePdfIdx] || PDF_STUDY_GUIDES[0];

      // Step 1: Initial Compact State - Stack is strictly hidden while loading
      onLoadedChange?.(false);
      setMobileStackVisible(false);
      setIsExpanded(false);
      setActiveStepIndex(-1);
      setIsBtnClicked(false);
      setDisplayedUrl("https://");

      await sleep(350);
      if (isCancelled) return;

      // Step 2: Realistic typing of the YouTube link character by character
      const urlSuffix = currentGuide.url.slice("https://".length);
      for (let i = 1; i <= urlSuffix.length; i++) {
        if (isCancelled) return;
        setDisplayedUrl("https://" + urlSuffix.slice(0, i));
        await sleep(isMobile ? 18 : 24);
      }

      await sleep(300);
      if (isCancelled) return;

      // Step 3: Button press feedback
      setIsBtnClicked(true);
      await sleep(240);
      setIsBtnClicked(false);
      if (isCancelled) return;

      // Step 4: Expand smoothly like iOS Dynamic Island
      setIsExpanded(true);
      await sleep(220);

      // Step 5: Sequential step loading with progress checks
      for (let step = 0; step < 5; step++) {
        if (isCancelled) return;
        setActiveStepIndex(step);
        await sleep(isMobile ? 260 : 300);
      }

      if (isCancelled) return;
      setActiveStepIndex(5);

      // Step 6: Step loading is complete! Reveal the preview stack
      await sleep(150);
      if (isCancelled) return;
      onLoadedChange?.(true);
      setMobileStackVisible(true);

      // On mobile, hold the finished state for 6.5s, then loop seamlessly
      if (isMobile) {
        await sleep(6500);
        if (isCancelled) return;
        runCinematicSequence();
      }
    };

    runCinematicSequence();

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [activePdfIdx, isMobile, onLoadedChange]);

  const currentGuide = PDF_STUDY_GUIDES[activePdfIdx] || PDF_STUDY_GUIDES[0];

  const PIPELINE_ITEMS = [
    { label: "Download & Audio Extract", time: "1:00" },
    { label: "Subtitles & Timestamp Sync", time: "creator's" },
    { label: "Formulas & Key Moments", time: "0:25" },
    { label: "Structured Markdown Notes", time: "1:15" },
    { label: "Build PDF Study Guide & PPT", time: "2:30" },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-desktop-preview={isMobile ? undefined : "true"}
      className={cn(
        "relative select-none",
        isMobile
          ? "w-full max-w-[330px] sm:max-w-[360px] mx-auto pt-4 pb-8"
          : "w-full max-w-[470px] xl:max-w-[500px] mx-auto min-h-[430px] pt-3 pb-5 cursor-default"
      )}
      style={{ perspective: isMobile ? undefined : 1200 }}
    >
      {/* 1. Left Background Card (lemon-marks.webp) */}
      <motion.div
        style={!isMobile ? {
          x: lemonX,
          y: lemonY,
          rotate: lemonRotate,
        } : undefined}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className={cn(
          "absolute rounded-[22px] sm:rounded-[24px] overflow-hidden shadow-[0_22px_50px_rgba(0,0,0,0.7)] border border-white/10 z-0 pointer-events-none select-none",
          isMobile
            ? "-left-4 sm:-left-6 -top-4 w-[160px] sm:w-[185px] h-[250px] sm:h-[280px]"
            : "-left-5 sm:-left-7 top-6 w-[215px] sm:w-[235px] h-[310px] sm:h-[335px]"
        )}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <img
            src="/lemon-marks.webp"
            alt="Lemon Marks Textured Art Card"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>
      </motion.div>

      {/* 2. Right Background Card (burst.webp) */}
      <motion.div
        style={!isMobile ? {
          x: burstX,
          y: burstY,
          rotate: burstRotate,
        } : undefined}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className={cn(
          "absolute rounded-[22px] sm:rounded-[24px] overflow-hidden shadow-[0_22px_50px_rgba(0,0,0,0.7)] border border-white/10 z-0 pointer-events-none select-none",
          isMobile
            ? "-right-4 sm:-right-6 -bottom-6 w-[165px] sm:w-[195px] h-[190px] sm:h-[220px]"
            : "-right-5 sm:-right-7 -top-2 w-[220px] sm:w-[245px] h-[220px] sm:h-[245px]"
        )}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 1 }}
          className="w-full h-full"
        >
          <img
            src="/burst.webp"
            alt="Burst Geometric Art Card"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>
      </motion.div>

      {/* 3. Foreground iOS / macOS Window Card */}
      <motion.div
        layout
        style={{
          rotateX: isMobile ? 0 : cardRotateX,
          rotateY: isMobile ? 0 : cardRotateY,
          x: isMobile ? 0 : cardX,
          y: isMobile ? 0 : cardY,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          layout: { type: "spring", stiffness: 160, damping: 22 },
          duration: 0.45,
        }}
        className={cn(
          "relative z-10 w-full mx-auto rounded-[24px] sm:rounded-[26px] bg-[#141417]/95 backdrop-blur-2xl border border-white/[0.09] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.06)] select-none",
          isMobile ? "max-w-[305px] sm:max-w-[335px] p-3.5 space-y-3" : "max-w-[400px] sm:max-w-[420px] p-4 sm:p-4.5 space-y-2.5"
        )}
      >
        {/* macOS Window Header */}
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-sm" />
          </div>
          <div className="flex-1 text-center pr-6">
            <span className="font-serif italic text-sm text-neutral-200 tracking-tight">Paperxify</span>
          </div>
        </div>

        {/* URL Input Bar */}
        <div
          onClick={onAction}
          className="rounded-xl bg-[#1c1c21] border border-white/[0.08] px-3 py-2 flex items-center gap-2 shadow-inner cursor-pointer hover:border-white/20 transition-all group"
        >
          <Link2 size={13} className="text-neutral-400 group-hover:text-white transition-colors shrink-0" />
          <span className="font-mono text-[11px] text-neutral-300 truncate flex-1">
            {displayedUrl}
          </span>
          <span className="w-0.5 h-3 bg-neutral-200 animate-pulse shrink-0" />
        </div>

        {/* Feature / Tool Pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {["Notes", "PPT Decks", "Quizzes", "Flashcards", "Mind Map"].map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setSelectedPill(pill)}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer",
                selectedPill === pill
                  ? "bg-white text-neutral-900 font-semibold shadow-sm"
                  : "bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 border border-white/[0.06]"
              )}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Signature Action Button */}
        <button
          onClick={onAction}
          className={cn(
            "w-full py-2.5 rounded-full bg-[#ede9de] hover:bg-white text-neutral-900 font-bold text-xs tracking-tight shadow-md hover:shadow-xl transition-all transform cursor-pointer flex items-center justify-center gap-1.5",
            isBtnClicked ? "scale-95 bg-white shadow-inner" : "active:scale-[0.99]"
          )}
        >
          <span>{isExpanded ? "✓ Study Suite Generated" : "Turn into Study Suite"}</span>
        </button>

        {/* Dynamic Expanding Checklist & Duration Section (Desktop & Mobile) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="dynamic-checklist"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2 pt-0.5 overflow-hidden"
            >
              {/* Status Pipeline Checklist */}
              <div className={cn(
                "space-y-1 font-mono text-[10.5px]",
                isMobile ? "max-w-[150px] sm:max-w-[170px]" : "max-w-[195px] sm:max-w-[215px]"
              )}>
                {PIPELINE_ITEMS.map((item, idx) => {
                  const isDone = activeStepIndex > idx;
                  const isCurrent = activeStepIndex === idx;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      className="flex items-center justify-between text-neutral-400 py-0.2"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isDone ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] shrink-0 transition-colors" />
                        ) : isCurrent ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "font-sans text-[10.5px] sm:text-[11px] transition-colors truncate",
                            isDone
                              ? "text-neutral-200 font-medium"
                              : isCurrent
                              ? "text-emerald-300 font-medium"
                              : "text-neutral-500"
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "font-mono text-[9px] sm:text-[9.5px] transition-colors pl-1 shrink-0",
                          isDone
                            ? "text-neutral-400"
                            : isCurrent
                            ? "text-emerald-400/80 font-semibold"
                            : "text-neutral-600"
                        )}
                      >
                        {isCurrent ? "..." : item.time}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Duration Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-baseline justify-between pt-1.5 border-t border-white/[0.06]",
                  isMobile ? "pr-24 sm:pr-28" : "pr-28 sm:pr-36"
                )}
              >
                <span className="font-serif italic text-2xl font-light text-white tracking-tight">
                  {currentGuide.duration}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium font-sans truncate ml-1.5">
                  {currentGuide.videoInfo}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Anchor point at bottom-right of the Mac card (Target for real cards on desktop) */}
        {!isMobile && (
          <div 
            ref={anchorRef}
            className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-4 w-[140px] sm:w-[158px] aspect-[1/1.4] z-30 select-none pointer-events-none"
          />
        )}

        {/* Mobile Fanned PDF Preview Stack (Attached to Mac card, animated when generated) */}
        {isMobile && (
          <AnimatePresence>
            {(isLoaded || mobileStackVisible) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 w-[126px] sm:w-[142px] aspect-[1/1.4] z-30 select-none"
              >
                {PDF_STUDY_GUIDES.map((guide, idx) => {
                  const fanAngles = [-3, 3, 9, 15];
                  const fanOffsets = [
                    { x: 0, y: 0 },
                    { x: 10, y: 3 },
                    { x: 20, y: 6 },
                    { x: 30, y: 9 },
                  ];

                  return (
                    <motion.div
                      key={guide.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectGuide) {
                          onSelectGuide(guide.url, guide.slug);
                        } else {
                          onAction();
                        }
                      }}
                      style={{
                        zIndex: 40 - idx * 5,
                        transformOrigin: "center center",
                      }}
                      animate={{
                        x: fanOffsets[idx].x,
                        y: fanOffsets[idx].y,
                        rotate: fanAngles[idx],
                      }}
                      transition={{ type: "spring", stiffness: 180, damping: 18 }}
                      className="absolute inset-0 aspect-[1/1.4] w-full rounded-2xl overflow-hidden bg-[#121217] border-2 border-white/70 shadow-[0_16px_36px_rgba(0,0,0,0.85)] cursor-pointer hover:border-white transition-all transform-gpu"
                    >
                      {/* Retina PDF Cover */}
                      <img
                        src={guide.img}
                        alt={`${guide.title} Front Cover`}
                        className="w-full h-full object-cover object-top select-none pointer-events-none"
                        loading="eager"
                      />

                      {/* Gloss sheen */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/75 pointer-events-none" />

                      {/* Top Category Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[8px] font-bold text-white shadow-sm pointer-events-none">
                        <span>{guide.tag}</span>
                      </div>

                      {/* Bottom Overlay Info Pill */}
                      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between pointer-events-none">
                        <span className={cn("text-[7.5px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-md border font-mono uppercase tracking-wider", guide.badgeColor)}>
                          {guide.badge}
                        </span>
                        <span className="text-[8px] font-mono font-medium text-neutral-300 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10">
                          {guide.duration}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}

// ── DESKTOP UNIFIED HERO & SCROLL SHOWCASE (Framer Motion Stack-to-Row Transition) ──
function DesktopHeroStudyShowcase({
  selectedPill,
  setSelectedPill,
  onAction,
  onSelectGuide,
  router,
}: {
  selectedPill: string;
  setSelectedPill: (pill: string) => void;
  onAction: () => void;
  onSelectGuide: (url: string, slug?: string) => void;
  router: any;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const macAnchorRef = useRef<HTMLDivElement>(null);

  const slot0Ref = useRef<HTMLDivElement>(null);
  const slot1Ref = useRef<HTMLDivElement>(null);
  const slot2Ref = useRef<HTMLDivElement>(null);
  const slot3Ref = useRef<HTMLDivElement>(null);

  const slotRefs = [slot0Ref, slot1Ref, slot2Ref, slot3Ref];

  // Loading state: preview stack is hidden until URL typing & checklist items complete
  const [isLoaded, setIsLoaded] = useState(false);

  // User's fine-tuned golden settings
  const ARRANGE_END = 0.10;
  const ROW_OFFSET_Y = 0;
  const SWOOP_AMOUNT = 85;
  const STAGE_PADDING_TOP = 80;
  const CONTAINER_VH = 120;

  // Framer Motion scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Apple-grade spring smoothing for physical momentum - silky iOS fluid dynamics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.35,
    restDelta: 0.0005,
  });

  // Fallback vectors (Mac stack anchor is bottom-right of Mac window, row slots are centered)
  const [vectors, setVectors] = useState([
    { dx: 460, dy: -25, scale: 0.70 },
    { dx: 230, dy: -20, scale: 0.70 },
    { dx: 0,   dy: -15, scale: 0.70 },
    { dx: -230, dy: -10, scale: 0.70 },
  ]);

  // iOS Smoothstep / Hermite Cubic Easing Function
  // Soft initial acceleration, fluid organic momentum, buttery cushioned arrival
  const easeIOS = (raw: number) => {
    const t = Math.max(0, Math.min(1, raw));
    return t * t * (3 - 2 * t);
  };

  // Base progress for the row as a whole
  const getProgressT = (p: number) => {
    if (p <= 0.02) return 0;
    if (p >= ARRANGE_END) return 1;
    const raw = (p - 0.02) / Math.max(0.01, ARRANGE_END - 0.02);
    return easeIOS(raw);
  };

  // iOS Card Cascade Function (each card peels off with natural physical micro-stagger)
  const getCardT = (p: number, cardIdx: number) => {
    const stagger = cardIdx * 0.007; // 7ms micro-stagger for tactile peeling sensation
    const start = 0.02 + stagger;
    const end = Math.max(start + 0.03, ARRANGE_END + stagger * 0.4);
    if (p <= start) return 0;
    if (p >= end) return 1;
    const raw = (p - start) / (end - start);
    return easeIOS(raw);
  };

  // Motion values with iOS easing curves
  const heroY = useTransform(smoothProgress, (p) => -(easeIOS(Math.min(1, Math.max(0, (p - 0.02) / Math.max(0.05, ARRANGE_END * 0.75)))) * 120));
  const heroOpacity = useTransform(smoothProgress, (p) => (p < 0.02 ? 1 : Math.max(0, 1 - easeIOS((p - 0.02) / Math.max(0.05, ARRANGE_END * 0.65)))));
  const heroPointerEvents = useTransform(smoothProgress, (p) => (p > ARRANGE_END * 0.7 ? "none" : "auto"));

  // Row Y: starts slightly down (+35px), moves smoothly into ROW_OFFSET_Y (dead center) and stays locked
  const rowY = useTransform(smoothProgress, (p) => {
    const t = getProgressT(p);
    return (1 - t) * 35 + ROW_OFFSET_Y;
  });
  const rowPointerEvents = useTransform(smoothProgress, (p) => (p > ARRANGE_END * 0.7 ? "auto" : "none"));

  const subtitleOpacity = useTransform(smoothProgress, (p) => easeIOS(Math.min(1, Math.max(0, (p - 0.04) / Math.max(0.05, ARRANGE_END * 0.6)))));
  const captionsOpacity = useTransform(smoothProgress, (p) => easeIOS(Math.min(1, Math.max(0, (p - ARRANGE_END * 0.5) / Math.max(0.05, ARRANGE_END * 0.5)))));
  const plus20Opacity = useTransform(smoothProgress, (p) => easeIOS(Math.min(1, Math.max(0, (p - ARRANGE_END * 0.5) / Math.max(0.05, ARRANGE_END * 0.5)))));
  const plus20Scale = useTransform(smoothProgress, (p) => 0.90 + easeIOS(Math.min(1, Math.max(0, (p - ARRANGE_END * 0.5) / Math.max(0.05, ARRANGE_END * 0.5)))) * 0.10);

  const updateVectors = useCallback(() => {
    if (!macAnchorRef.current) return;
    const macRect = macAnchorRef.current.getBoundingClientRect();
    if (macRect.width === 0 || macRect.height === 0) return;

    // Compensate for active motion translations so vectors are invariant at-rest deltas
    const currentHeroY = heroY.get();
    const currentRowY = rowY.get();

    const macCenterX = macRect.left + macRect.width / 2;
    const macCenterY = (macRect.top + macRect.height / 2) - currentHeroY;

    const fanOffsets = [
      { x: 0, y: 0 },
      { x: 16, y: 5 },
      { x: 32, y: 10 },
      { x: 48, y: 15 },
    ];

    setVectors((prev) => {
      return slotRefs.map((ref, idx) => {
        if (!ref.current) return prev[idx];
        const slotRect = ref.current.getBoundingClientRect();
        if (slotRect.width === 0 || slotRect.height === 0) return prev[idx];
        const slotCenterX = slotRect.left + slotRect.width / 2;
        const slotCenterY = (slotRect.top + slotRect.height / 2) - currentRowY;
        return {
          dx: (macCenterX - slotCenterX) + fanOffsets[idx].x,
          dy: (macCenterY - (slotCenterY + (35 + ROW_OFFSET_Y))) + fanOffsets[idx].y,
          scale: Math.min(1, Math.max(0.4, macRect.width / slotRect.width)),
        };
      });
    });
  }, [heroY, rowY]);

  useEffect(() => {
    updateVectors();
    const t1 = setTimeout(updateVectors, 250);
    const t2 = setTimeout(updateVectors, 600);
    const t3 = setTimeout(updateVectors, 1200);
    window.addEventListener("resize", updateVectors);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", updateVectors);
    };
  }, [updateVectors, isLoaded]);

  // Auto-show cards after 1.5s OR on any scroll so they're never invisible
  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > 0.005) {
        setIsLoaded(true);
      }
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [scrollYProgress, isLoaded]);

  const fanAngles = [-3, 3, 9, 15];

  // Reactive transform functions for the 4 study cards (with iOS fluid dynamics & downward swoop)
  const card0X = useTransform(smoothProgress, (p) => (1 - getCardT(p, 0)) * vectors[0].dx);
  const card0Y = useTransform(smoothProgress, (p) => {
    const t = getCardT(p, 0);
    const swoop = Math.sin(t * Math.PI) * SWOOP_AMOUNT;
    return (1 - t) * vectors[0].dy + swoop;
  });
  const card0Rotate = useTransform(smoothProgress, (p) => (1 - getCardT(p, 0)) * fanAngles[0]);
  const card0Scale = useTransform(smoothProgress, (p) => {
    const t = getCardT(p, 0);
    return vectors[0].scale + t * (1 - vectors[0].scale);
  });

  const card1X = useTransform(smoothProgress, (p) => (1 - getCardT(p, 1)) * vectors[1].dx);
  const card1Y = useTransform(smoothProgress, (p) => {
    const t = getCardT(p, 1);
    const swoop = Math.sin(t * Math.PI) * SWOOP_AMOUNT;
    return (1 - t) * vectors[1].dy + swoop;
  });
  const card1Rotate = useTransform(smoothProgress, (p) => (1 - getCardT(p, 1)) * fanAngles[1]);
  const card1Scale = useTransform(smoothProgress, (p) => {
    const t = getCardT(p, 1);
    return vectors[1].scale + t * (1 - vectors[1].scale);
  });

  const card2X = useTransform(smoothProgress, (p) => (1 - getCardT(p, 2)) * vectors[2].dx);
  const card2Y = useTransform(smoothProgress, (p) => {
    const t = getCardT(p, 2);
    const swoop = Math.sin(t * Math.PI) * SWOOP_AMOUNT;
    return (1 - t) * vectors[2].dy + swoop;
  });
  const card2Rotate = useTransform(smoothProgress, (p) => (1 - getCardT(p, 2)) * fanAngles[2]);
  const card2Scale = useTransform(smoothProgress, (p) => {
    const t = getCardT(p, 2);
    return vectors[2].scale + t * (1 - vectors[2].scale);
  });

  const card3X = useTransform(smoothProgress, (p) => (1 - getCardT(p, 3)) * vectors[3].dx);
  const card3Y = useTransform(smoothProgress, (p) => {
    const t = getCardT(p, 3);
    const swoop = Math.sin(t * Math.PI) * SWOOP_AMOUNT;
    return (1 - t) * vectors[3].dy + swoop;
  });
  const card3Rotate = useTransform(smoothProgress, (p) => (1 - getCardT(p, 3)) * fanAngles[3]);
  const card3Scale = useTransform(smoothProgress, (p) => {
    const t = getCardT(p, 3);
    return vectors[3].scale + t * (1 - vectors[3].scale);
  });

  const cardTransforms = [
    { x: card0X, y: card0Y, rotate: card0Rotate, scale: card0Scale, ref: slot0Ref },
    { x: card1X, y: card1Y, rotate: card1Rotate, scale: card1Scale, ref: slot1Ref },
    { x: card2X, y: card2Y, rotate: card2Rotate, scale: card2Scale, ref: slot2Ref },
    { x: card3X, y: card3Y, rotate: card3Rotate, scale: card3Scale, ref: slot3Ref },
  ];

  return (
    <div 
      ref={containerRef} 
      style={{ minHeight: `${CONTAINER_VH}vh` }}
      className="hidden lg:block relative w-full select-none"
    >
      {/* Sticky Full-Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Ambient Vignette Behind Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-red-600/[0.04] blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Unified Centered Stage */}
        <div className="relative w-full max-w-[1240px] h-screen flex items-center justify-center pointer-events-none">

          {/* ──── HERO LAYER (Vertically Centered at Scroll 0) ──── */}
          <div 
            style={{ paddingTop: `${STAGE_PADDING_TOP}px` }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              style={{
                y: heroY,
                opacity: heroOpacity,
                pointerEvents: heroPointerEvents as any,
              }}
              className="w-full grid grid-cols-12 gap-8 items-center z-10 pt-2 pointer-events-auto"
            >
              {/* Left Hero Column */}
              <div className="col-span-6 flex flex-col items-start text-left space-y-4 w-full">
                {/* Top Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-neutral-300 backdrop-blur-md shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Your Complete AI Study Partner</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl lg:text-[46px] font-extrabold tracking-tight text-white leading-[1.08] lg:leading-[1.1]">
                  Turn YouTube Videos <br />
                  into <span className="text-[#ef4444]">Smart Study Notes</span>
                </h1>

                {/* Supporting Subtitle */}
                <p className="text-sm lg:text-[15px] text-neutral-400 font-normal leading-relaxed max-w-md">
                  From lectures to mastery. Generate structured notes, PDFs, presentations, quizzes, flashcards &amp; mind maps in seconds with AI.
                </p>

                {/* Social Proof Row */}
                <div className="flex items-center gap-2.5 pt-0.5">
                  <div className="flex items-center -space-x-2">
                    {AVATARS.map((avatar, idx) => (
                      <div 
                        key={idx} 
                        className="w-8 h-8 rounded-full border-2 border-neutral-950 overflow-hidden bg-neutral-800 shadow-sm relative shrink-0"
                      >
                        <img 
                          src={avatar.img} 
                          alt={`Verified learner ${avatar.name} – ${avatar.role}`} 
                          className="w-full h-full object-cover" 
                          loading="eager"
                          width={32}
                          height={32}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-0.5 text-amber-400 text-xs leading-none">
                      {"★★★★★"}
                    </div>
                    <span className="text-xs font-medium text-neutral-300 mt-0.5">
                      {SITE_METRICS.heroSocialProof}
                    </span>
                  </div>
                </div>

                {/* CTA Buttons Row */}
                <div className="flex items-center gap-3 w-full pt-1">
                  <button
                    onClick={() => router.push("/youtube-to-notes")}
                    className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold text-sm tracking-wide shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all transform active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span>Upload YouTube Video · Free</span>
                  </button>

                  <button
                    onClick={() => router.push("/tools")}
                    className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-neutral-200 font-medium text-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <LayoutGrid size={14} className="text-neutral-400" />
                    <span>Explore AI Tools</span>
                  </button>
                </div>

                {/* Hero Trust Features */}
                <div className="flex items-center flex-wrap gap-4 pt-1 text-xs text-neutral-400 font-normal">
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} className="text-neutral-300" />
                    <span>Instant &amp; Precise</span>
                  </div>
                  <span className="text-neutral-700">•</span>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-neutral-300" />
                    <span>LaTeX &amp; Code Support</span>
                  </div>
                  <span className="text-neutral-700">•</span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-neutral-300" />
                    <span>100% Private &amp; Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Column: Mac Window Showroom */}
              <div className="col-span-6 flex justify-end">
                <HeroInteractiveShowroom
                  selectedPill={selectedPill}
                  setSelectedPill={setSelectedPill}
                  onAction={onAction}
                  anchorRef={macAnchorRef}
                  onLoadedChange={setIsLoaded}
                  isLoaded={isLoaded}
                />
              </div>
            </motion.div>
          </div>

          {/* ──── CASE LIBRARY ROW (Centered Vertically in Field of View) ──── */}
          <div 
            style={{ paddingTop: `${STAGE_PADDING_TOP}px` }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              style={{
                y: rowY,
                pointerEvents: rowPointerEvents as any,
              }}
              className="w-full z-20 pointer-events-auto"
            >
              {/* Subtitle Bar matching Reference Image 4 */}
              <motion.div
                style={{ opacity: subtitleOpacity }}
                className="flex items-center gap-2 mb-4 font-mono text-xs select-none overflow-hidden"
              >
                <span className="text-neutral-400 font-medium shrink-0">That one link →</span>
                <span className="text-white font-semibold truncate">
                  Stanford CS229 • MIT 8.04 • Crash Course Economics • AP Biology
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-neutral-400 font-medium">→</span>
                  <span className="text-neutral-200 font-medium">4 Complete Study Suites</span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[11px]">100% Free</span>
                </div>
              </motion.div>

              {/* 5-Column Grid Row */}
              <div className="grid grid-cols-5 gap-4 items-start">
                {PDF_STUDY_GUIDES.map((guide, idx) => {
                  const transform = cardTransforms[idx];

                  return (
                    <div key={guide.id} className="relative flex flex-col group select-none">
                      {/* Slot Target */}
                      <div
                        ref={transform.ref}
                        className="relative aspect-[1/1.4] w-full"
                      >
                        {/* The One Real Card (Glides from Mac stack into this slot) */}
                        <motion.div
                          style={{
                            x: transform.x,
                            y: transform.y,
                            rotate: transform.rotate,
                            scale: transform.scale,
                            zIndex: 40 - idx * 5,
                            transformOrigin: "center center",
                            willChange: "transform",
                          }}
                          animate={{
                            opacity: isLoaded ? 1 : 0,
                          }}
                          transition={{
                            opacity: { duration: 0.35, ease: "easeOut" },
                          }}
                          onClick={() => onSelectGuide(guide.url, guide.slug)}
                          className="absolute inset-0 aspect-[1/1.4] w-full rounded-2xl overflow-hidden bg-[#121217] border-2 border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.85)] cursor-pointer hover:border-white transition-all hover:scale-[1.02] transform-gpu"
                        >
                          {/* Retina PDF Cover */}
                          <img
                            src={guide.img}
                            alt={`${guide.title} Front Cover`}
                            className="w-full h-full object-cover object-top select-none pointer-events-none"
                            loading="eager"
                          />

                          {/* Gloss sheen */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/75 pointer-events-none" />

                          {/* Top Category Badge */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white shadow-sm pointer-events-none">
                            <span>{guide.tag}</span>
                          </div>

                          {/* Bottom Overlay Info Pill */}
                          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                            <span className={cn("text-[8.5px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md border font-mono uppercase tracking-wider", guide.badgeColor)}>
                              {guide.badge}
                            </span>
                            <span className="text-[9px] font-mono font-medium text-neutral-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                              {guide.duration}
                            </span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Title & Author Captions (Fade in as cards settle into row) */}
                      <motion.div
                        style={{ opacity: captionsOpacity }}
                        className="mt-2.5 px-0.5 text-left"
                      >
                        <h4 
                          onClick={() => onSelectGuide(guide.url, guide.slug)}
                          className="text-[13px] font-bold text-white leading-snug truncate hover:text-red-400 transition-colors cursor-pointer"
                          title={guide.title}
                        >
                          {guide.title}
                        </h4>
                        <p 
                          className="text-[11.5px] font-medium text-neutral-300 mt-0.5 truncate hover:text-neutral-100 transition-colors"
                          title={guide.channel}
                        >
                          {guide.channel}
                        </p>
                      </motion.div>
                    </div>
                  );
                })}

                {/* 5th Column: "+20 More in the study library" */}
                <div className="relative flex flex-col group select-none">
                  <motion.div
                    style={{
                      opacity: plus20Opacity,
                      scale: plus20Scale,
                    }}
                    transition={{ duration: 0.2 }}
                    onClick={() => router.push("/notes")}
                    className="relative aspect-[1/1.4] w-full rounded-2xl overflow-hidden bg-[#0c0c10] border border-white/[0.08] hover:border-white/20 p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-[0_15px_35px_rgba(0,0,0,0.7)] select-none hover:scale-[1.02]"
                  >
                    <span className="font-serif italic text-5xl text-neutral-200 group-hover:scale-110 transition-transform font-light">
                      +20
                    </span>
                    <span className="text-sm font-medium text-neutral-400 mt-2.5 leading-snug">
                      More in the study library
                    </span>
                    <div className="mt-4 flex items-center gap-1.5 text-[10.5px] font-medium text-neutral-300 group-hover:text-white transition-colors">
                      <span>Explore all suites</span>
                      <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>

                  {/* Caption spacer to align with other cards */}
                  <div className="mt-2.5 px-0.5 h-[38px]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MOBILE HERO & SHOWCASE SECTION (Responsive, touch-friendly, no separate row section) ──
function MobileHeroStudyShowcase({
  selectedPill,
  setSelectedPill,
  onAction,
  onSelectGuide,
  router,
}: {
  selectedPill: string;
  setSelectedPill: (pill: string) => void;
  onAction: () => void;
  onSelectGuide: (url: string, slug?: string) => void;
  router: any;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className="w-full max-w-[1240px] mx-auto px-4 pt-3 pb-8 space-y-4">
      {/* Mobile Hero Content */}
      <div className="flex flex-col items-center text-center space-y-3.5 max-w-md mx-auto">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-neutral-300 backdrop-blur-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>Your Complete AI Study Partner</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-[32px] sm:text-4xl font-extrabold tracking-tight text-white leading-[1.08]">
          Turn YouTube Videos <br />
          into <span className="text-[#ef4444]">Smart Study Notes</span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed max-w-sm">
          From lectures to mastery. Generate structured notes, PDFs, presentations, quizzes, flashcards &amp; mind maps in seconds with AI.
        </p>

        {/* Social Proof Row */}
        <div className="flex items-center gap-2.5 pt-0.5">
          <div className="flex items-center -space-x-2">
            {AVATARS.map((avatar, idx) => (
              <div 
                key={idx} 
                className="w-7 h-7 rounded-full border-2 border-neutral-950 overflow-hidden bg-neutral-800 shadow-sm relative shrink-0"
              >
                <img 
                  src={avatar.img} 
                  alt={`Verified learner ${avatar.name} – ${avatar.role}`} 
                  className="w-full h-full object-cover" 
                  loading="eager"
                  width={28}
                  height={28}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-0.5 text-amber-400 text-[11px] leading-none">
              {"★★★★★"}
            </div>
            <span className="text-[11px] font-medium text-neutral-300 mt-0.5">
              {SITE_METRICS.heroSocialProof}
            </span>
          </div>
        </div>

        {/* Hero Trust Features */}
        <div className="flex items-center flex-wrap justify-center gap-2.5 sm:gap-3 pt-0.5 text-[11px] text-neutral-400 font-normal">
          <div className="flex items-center gap-1">
            <Zap size={11} className="text-neutral-300" />
            <span>Instant &amp; Precise</span>
          </div>
          <span className="text-neutral-700">•</span>
          <div className="flex items-center gap-1">
            <Sparkles size={11} className="text-neutral-300" />
            <span>LaTeX &amp; Code Support</span>
          </div>
          <span className="text-neutral-700">•</span>
          <div className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-neutral-300" />
            <span>100% Private &amp; Encrypted</span>
          </div>
        </div>

        {/* Mobile Mac Showroom with full typing animation, expanding checklist, and fanned PDF preview stack */}
        <div className="w-full pt-3 pb-2">
          <HeroInteractiveShowroom
            selectedPill={selectedPill}
            setSelectedPill={setSelectedPill}
            onAction={onAction}
            onSelectGuide={onSelectGuide}
            isMobile={true}
            isLoaded={isLoaded}
            onLoadedChange={setIsLoaded}
          />
        </div>
      </div>
    </section>
  );
}

export default function HomePortal({ region, user }: HomePortalProps) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const heroAnchorRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("notes");
  const [selectedPill, setSelectedPill] = useState("Notes");
  const [persona, setPersona] = useState<"study" | "dev">("study");

  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
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
          0. TOP CHATGPT / RACCOON-GRADE AGENT HERO INPUT
      ────────────────────────────────────────────────────────────── */}
      <HeroAgentSection user={user} />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO & STUDY GUIDE SHOWCASE (Framer Motion Stack-to-Row on Scroll)
      ────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block w-full">
        {(!mounted || isDesktop) && (
          <DesktopHeroStudyShowcase
            selectedPill={selectedPill}
            setSelectedPill={setSelectedPill}
            onAction={() => router.push("/youtube-to-notes")}
            onSelectGuide={(url, slug) => {
              if (slug) {
                router.push(`/notes/${slug}`);
              } else {
                router.push(`/notes`);
              }
            }}
            router={router}
          />
        )}
      </div>

      <div className="block lg:hidden w-full">
        {(!mounted || !isDesktop) && (
          <MobileHeroStudyShowcase
            selectedPill={selectedPill}
            setSelectedPill={setSelectedPill}
            onAction={() => router.push("/youtube-to-notes")}
            onSelectGuide={(url, slug) => {
              if (slug) {
                router.push(`/notes/${slug}`);
              } else {
                router.push(`/notes`);
              }
            }}
            router={router}
          />
        )}
      </div>





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
        
        {/* Section Header with Persona Switcher */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-medium text-neutral-400 uppercase tracking-wider mb-2">
              <Sparkles size={11} className="text-red-400" />
              <span>Modular Intelligence Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {persona === "study" ? "20+ AI Tools for Students & Researchers" : "Developer Utilities & PDF Lab"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-lg">
              {persona === "study"
                ? "Convert lectures, synthesize notes, build slide decks, and master exams faster."
                : "Client-side developer utilities, PDF organizers, schema visualizers, and code tools."}
            </p>
          </div>

          {/* Persona Switcher Tabs + View All Button */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center p-1 rounded-xl bg-[#09090c] border border-white/[0.08] shadow-inner">
              <button
                type="button"
                onClick={() => setPersona("study")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  persona === "study" 
                    ? "bg-[#ef4444] text-white shadow-sm" 
                    : "text-neutral-400 hover:text-white"
                )}
              >
                <GraduationCap size={13} />
                <span>Study Suite</span>
              </button>
              <button
                type="button"
                onClick={() => setPersona("dev")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  persona === "dev" 
                    ? "bg-white/[0.12] text-white shadow-sm" 
                    : "text-neutral-400 hover:text-white"
                )}
              >
                <Code2 size={13} />
                <span>Developer Lab</span>
              </button>
            </div>

            <button
              onClick={() => router.push("/tools")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all cursor-pointer group"
            >
              <span>View All</span>
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
            {(persona === "study" ? STUDY_TOOLS : DEV_TOOLS).map((tool) => {
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

