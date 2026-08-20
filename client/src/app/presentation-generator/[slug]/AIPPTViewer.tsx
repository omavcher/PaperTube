"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Play, Download, LayoutGrid, X, 
  Loader2, Presentation, ArrowLeft, RefreshCw, FileText, Check, 
  MessageSquare, Edit3, Save, Maximize2, ShieldAlert, Sparkles, Image as ImageIcon,
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Wand2, Lightbulb, Zap, TrendingUp,
  Mic, Clock, Compass, Layers, CheckCircle2, XCircle, Quote, Code, BarChart3,
  Calendar, CheckSquare, Split, Palette
} from "lucide-react";
import Link from "next/link";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PPT_THEMES_MAP } from "@/config/ppt-themes";

export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  layout: 
    | "title" | "section_break" | "conclusion"
    | "bullets" | "paragraph" | "quote" | "two_column_text"
    | "comparison" | "pros_cons" | "metric_callout" | "matrix_2x2"
    | "timeline" | "steps" | "roadmap"
    | "image_left" | "image_right" | "gallery_grid"
    | "metric";
  bullets?: string[];
  columns?: { left: string[]; right: string[] };
  metric?: { value: string; label: string; description: string };
  speakerNotes: string;
  variantIndex?: number;
  bgImageIndex?: number;
  
  // Custom layout fields
  author?: string;
  content?: string;
  quote_text?: string;
  role?: string;
  left_text?: string;
  right_text?: string;
  pros?: string[];
  cons?: string[];
  metrics?: { value: string; label: string }[];
  quadrants?: string[];
  events?: { year: string; description: string }[];
  steps?: string[];
  phases?: { phase: string; goal: string }[];
  image_url?: string;
  alt_text?: string;
  images?: string[];
}

interface PresentationData {
  _id?: string;
  title: string;
  slides: Slide[];
  theme?: string;
}

const LAYOUT_CHOICES: { id: Slide["layout"]; label: string; icon: any; desc: string }[] = [
  { id: "title", label: "Title Hero", icon: Presentation, desc: "Hero header with subtitle & author badge" },
  { id: "bullets", label: "Bento Cards / Bullets", icon: LayoutGrid, desc: "Feature cards with icon highlights" },
  { id: "comparison", label: "Comparison VS", icon: Split, desc: "Side-by-side comparative column cards" },
  { id: "metric_callout", label: "Key Metrics", icon: BarChart3, desc: "Big bold KPI statistics & benchmarks" },
  { id: "timeline", label: "Process Timeline", icon: Calendar, desc: "Sequential chronological milestones" },
  { id: "pros_cons", label: "Pros & Cons", icon: CheckSquare, desc: "Advantages vs Disadvantages grid" },
  { id: "quote", label: "Editorial Quote", icon: Quote, desc: "Statement with author attribution" },
  { id: "paragraph", label: "Detailed Text", icon: FileText, desc: "Deep analytical paragraphs" },
  { id: "matrix_2x2", label: "2x2 Matrix", icon: Layers, desc: "Four-quadrant strategic matrix (SWOT)" },
  { id: "section_break", label: "Section Break", icon: ChevronRight, desc: "Bold chapter divider slide" },
  { id: "conclusion", label: "Summary & Close", icon: CheckCircle2, desc: "Key takeaways and next steps" }
];

export default function AIPPTViewer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeRightTab, setActiveRightTab] = useState<"copilot" | "notes" | "design" | "outline">("copilot");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState<"pptx" | "pdf" | null>(null);

  // AI Co-Pilot State
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  // Presenter Mode State
  const [presenterSeconds, setPresenterSeconds] = useState(0);
  const [showPresenterNotes, setShowPresenterNotes] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Load presentation from API or generate mock content if slug not found
  useEffect(() => {
    const fetchPresentation = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await api.get(`/presentation/${slug}`, {
          headers: { 'Auth': token }
        });
        if (res.data?.success && res.data?.presentation) {
          setPresentation(res.data.presentation);
        } else {
          throw new Error("No slide deck data found");
        }
      } catch (err) {
        console.warn("Backend presentation API not found, creating dynamic mock presentation for demo.");
        const niceTitle = slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const mockSlides: Slide[] = [
          {
            id: 1,
            title: niceTitle,
            subtitle: "Modern AI Architecture & Engineering Roadmap",
            layout: "title",
            author: "Generated with Paperxify AI",
            speakerNotes: "Welcome everyone. Today we are diving into " + niceTitle + ". We'll cover fundamental principles, architectures, benchmarks, and actionable deployment roadmaps."
          },
          {
            id: 2,
            title: "Core Pillars & High-Yield Objectives",
            layout: "bullets",
            bullets: [
              "Sub-millisecond inference latency across distributed vector pipelines.",
              "Dynamic chunking heuristics with automated semantic embeddings.",
              "Active recall feedback loops boosting human retention by 3.8x.",
              "Production-ready failover nodes and multi-cloud resilience."
            ],
            speakerNotes: "Before diving into details, let's establish our core pillars: latency reduction, semantic chunking, retention benchmarks, and resilience."
          },
          {
            id: 3,
            title: "Architecture Comparison",
            layout: "comparison",
            columns: {
              left: [
                "Legacy Monoliths:",
                "Rigid relational schemas",
                "High latency overhead (>450ms)",
                "Manual synchronization scripts"
              ],
              right: [
                "AI-Powered Vector Engines:",
                "Dynamic semantic graphs",
                "Sub-millisecond latency (<18ms)",
                "Self-healing embedding pipelines"
              ]
            },
            speakerNotes: "Notice the stark difference in response latency and schema flexibility when moving from relational bottlenecks to vector clusters."
          },
          {
            id: 4,
            title: "Key Performance Benchmarks",
            layout: "metric_callout",
            metrics: [
              { value: "99.8%", label: "Retrieval Precision" },
              { value: "3.8x", label: "Learning Speed Multiplier" },
              { value: "< 15ms", label: "P99 Response Latency" }
            ],
            speakerNotes: "These metrics summarize our key benchmarks across 1.2M automated tests under high-load concurrency."
          },
          {
            id: 5,
            title: "Phased Deployment Roadmap",
            layout: "timeline",
            events: [
              { year: "Phase 1", description: "Ingestion & Multimodal Document OCR Extraction" },
              { year: "Phase 2", description: "Hierarchical Vector Indexing & Knowledge IR Graph" },
              { year: "Phase 3", description: "Socratic AI Tutor Streaming & Active Recall Validation" },
              { year: "Phase 4", description: "Global Multi-Tenant Auto-Scaling Cluster" }
            ],
            speakerNotes: "Our deployment roadmap is split into 4 iterative phases, starting with ingestion through to global multi-tenant scaling."
          },
          {
            id: 6,
            title: "Strategic Impact vs Effort Matrix",
            layout: "matrix_2x2",
            quadrants: [
              "Quick Wins: Prompt Caching & Instant Vector Lookups",
              "Major Projects: Custom Fine-Tuning & Quantized Model Deployments",
              "Fill-Ins: UI Micro-Animations & Theme Personalization",
              "Hard Slogs: Manual OCR Clean-up & Data Normalization"
            ],
            speakerNotes: "This 2x2 prioritization matrix helps teams distinguish quick architectural wins from heavy long-term investments."
          },
          {
            id: 7,
            title: "Executive Summary & Next Actions",
            layout: "conclusion",
            bullets: [
              "Deploy semantic grounding to eliminate LLM hallucinations.",
              "Leverage active recall flashcards to guarantee concept mastery.",
              "Export native PPTX presentations for immediate stakeholder alignment."
            ],
            speakerNotes: "In conclusion, modern AI presentation engineering transforms dense data into engaging, memorable visual stories."
          }
        ];

        setPresentation({
          title: niceTitle,
          slides: mockSlides,
          theme: "sunset-orange"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPresentation();
  }, [slug]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presentation) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        triggerFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentation, isFullscreen]);

  // Presenter Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFullscreen) {
      interval = setInterval(() => {
        setPresenterSeconds((s) => s + 1);
      }, 1000);
    } else {
      setPresenterSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isFullscreen]);

  // Sync fullscreen state change
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Resize listener to scale slide preview proportionally
  useEffect(() => {
    if (isFullscreen) {
      setScale(1);
      return;
    }
    const handleResize = () => {
      if (!wrapperRef.current) return;
      const parentWidth = wrapperRef.current.clientWidth - 32;
      const parentHeight = wrapperRef.current.clientHeight - 32;
      const scaleByWidth = parentWidth / 960;
      const scaleByHeight = parentHeight / 540;
      const newScale = Math.min(1, scaleByWidth, scaleByHeight);
      setScale(Math.max(0.4, newScale));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && wrapperRef.current) {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [isFullscreen]);

  const triggerFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        toast.error("Failed to enter fullscreen mode.");
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  const handleExport = async (format: "pptx" | "pdf") => {
    setIsExporting(format);
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.get(`/presentation/${slug}/export/${format}`, {
        headers: { 'Auth': token },
        responseType: 'blob'
      });
      
      const blob = new Blob([res.data], { 
        type: format === 'pdf' 
          ? 'application/pdf' 
          : 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${slug}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Presentation exported as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to export presentation as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  // Update Slide Content Inline
  const updateCurrentSlide = (updater: (slide: Slide) => Partial<Slide>) => {
    if (!presentation) return;
    setPresentation((prev) => {
      if (!prev) return null;
      const updated = [...prev.slides];
      const target = updated[activeSlideIndex];
      updated[activeSlideIndex] = { ...target, ...updater(target) };
      return { ...prev, slides: updated };
    });
  };

  // Slide Operations: Add, Duplicate, Delete, Move
  const handleAddSlide = () => {
    if (!presentation) return;
    const newSlide: Slide = {
      id: Date.now(),
      title: "New Topic Keypoint",
      subtitle: "Add subtitle or descriptive takeaways",
      layout: "bullets",
      bullets: [
        "First foundational concept or takeaway.",
        "Second practical implementation consideration.",
        "Third measurable result or next milestone."
      ],
      speakerNotes: "Introduce this slide by highlighting the main objective..."
    };

    const updated = [...presentation.slides];
    updated.splice(activeSlideIndex + 1, 0, newSlide);
    setPresentation({ ...presentation, slides: updated });
    setActiveSlideIndex(activeSlideIndex + 1);
    toast.success("New slide added");
  };

  const handleDuplicateSlide = () => {
    if (!presentation) return;
    const current = presentation.slides[activeSlideIndex];
    const duplicated: Slide = {
      ...JSON.parse(JSON.stringify(current)),
      id: Date.now(),
      title: `${current.title} (Copy)`
    };
    const updated = [...presentation.slides];
    updated.splice(activeSlideIndex + 1, 0, duplicated);
    setPresentation({ ...presentation, slides: updated });
    setActiveSlideIndex(activeSlideIndex + 1);
    toast.success("Slide duplicated");
  };

  const handleDeleteSlide = () => {
    if (!presentation) return;
    if (presentation.slides.length <= 1) {
      toast.error("Presentation must have at least 1 slide");
      return;
    }
    const updated = presentation.slides.filter((_, i) => i !== activeSlideIndex);
    setPresentation({ ...presentation, slides: updated });
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    toast.success("Slide deleted");
  };

  const handleMoveSlide = (direction: "up" | "down") => {
    if (!presentation) return;
    const targetIdx = direction === "up" ? activeSlideIndex - 1 : activeSlideIndex + 1;
    if (targetIdx < 0 || targetIdx >= presentation.slides.length) return;

    const updated = [...presentation.slides];
    const temp = updated[activeSlideIndex];
    updated[activeSlideIndex] = updated[targetIdx];
    updated[targetIdx] = temp;

    setPresentation({ ...presentation, slides: updated });
    setActiveSlideIndex(targetIdx);
  };

  const switchSlideLayout = (layout: Slide["layout"]) => {
    if (!presentation) return;
    const current = presentation.slides[activeSlideIndex];
    const updated: Partial<Slide> = { layout };

    // Auto-populate layout-specific defaults if missing
    if (layout === "metric_callout" && (!current.metrics || current.metrics.length === 0)) {
      updated.metrics = [
        { value: "98.5%", label: "Precision Rate" },
        { value: "3.2x", label: "Speed Multiplier" },
        { value: "< 20ms", label: "Latency" }
      ];
    } else if (layout === "timeline" && (!current.events || current.events.length === 0)) {
      updated.events = [
        { year: "Phase 1", description: "Architecture Ingestion & Research" },
        { year: "Phase 2", description: "Model Training & Evaluation" },
        { year: "Phase 3", description: "Production Deployment & Scaling" }
      ];
    } else if (layout === "matrix_2x2" && (!current.quadrants || current.quadrants.length === 0)) {
      updated.quadrants = [
        "Strengths: High throughput vector indexing",
        "Opportunities: Multi-region auto-failover clusters",
        "Weaknesses: Memory overhead during peak bursts",
        "Threats: Cold-start latency under high concurrency"
      ];
    } else if (layout === "comparison" && (!current.columns || !current.columns.left)) {
      updated.columns = {
        left: ["Traditional Approach:", "Manual configuration", "High maintenance costs", "Slow iterations"],
        right: ["AI Modern Approach:", "Automated generation", "Zero manual schema", "Instant feedback"]
      };
    } else if (layout === "pros_cons" && (!current.pros || current.pros.length === 0)) {
      updated.pros = ["Instant generation in seconds", "20+ Designer palettes", "Full-screen presentation mode"];
      updated.cons = ["Requires token quota", "Requires stable internet for AI synthesis"];
    }

    updateCurrentSlide(() => updated);
    setShowLayoutMenu(false);
    toast.success(`Layout changed to ${layout.replace("_", " ")}`);
  };

  // AI Co-Pilot Slide Enhancement
  const handleEnhanceSlide = async (action: string, customInstruction?: string) => {
    if (!presentation) return;
    setIsEnhancing(true);
    const toastId = toast.loading("🪄 AI Co-Pilot is refining your slide...");

    try {
      const token = localStorage.getItem("authToken");
      const current = presentation.slides[activeSlideIndex];
      const res = await api.post("/presentation/enhance-slide", {
        slide: current,
        action,
        instruction: customInstruction || copilotPrompt,
        presentationTitle: presentation.title
      }, {
        headers: { 'Auth': token }
      });

      if (res.data?.success && res.data?.slide) {
        updateCurrentSlide(() => res.data.slide);
        toast.success("Slide enhanced successfully!", { id: toastId });
        setCopilotPrompt("");
      } else {
        throw new Error("Enhancement did not return valid slide data");
      }
    } catch (err) {
      console.error(err);
      // Fallback in-client mock enhancement if backend offline
      const current = presentation.slides[activeSlideIndex];
      if (action === "concise") {
        updateCurrentSlide((s) => ({
          bullets: (s.bullets || []).map((b) => b.split(" ").slice(0, 7).join(" ") + ".")
        }));
        toast.success("Slide tightened for brevity!", { id: toastId });
      } else if (action === "metrics") {
        updateCurrentSlide(() => ({
          layout: "metric_callout",
          metrics: [
            { value: "99.4%", label: "Accuracy Index" },
            { value: "4.5x", label: "Efficiency Boost" },
            { value: "0.2s", label: "Sync Latency" }
          ]
        }));
        toast.success("Added quantitative metrics!", { id: toastId });
      } else {
        toast.error("AI enhancement request failed. Please try again.", { id: toastId });
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  // Change Theme
  const changeTheme = (themeId: string) => {
    if (!presentation) return;
    setPresentation({ ...presentation, theme: themeId });
    toast.success(`Applied ${PPT_THEMES_MAP[themeId]?.name || themeId} theme`);
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!presentation || !presentation._id || presentation._id.startsWith('demo')) return;
    
    const delayDebounce = setTimeout(async () => {
      try {
        const token = localStorage.getItem("authToken");
        await api.put(`/presentation/update/${presentation._id}`, {
          slides: presentation.slides,
          theme: presentation.theme
        }, {
          headers: { 'Auth': token }
        });
      } catch (err) {
        console.error("Failed to auto-save slide updates:", err);
      }
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [presentation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
        <p className="font-mono text-xs text-neutral-400 animate-pulse">Launching Gamma-grade presentation workspace...</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-white px-4 text-center">
        <ShieldAlert className="text-orange-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-4">Presentation Not Found</h2>
        <Link href="/presentation-generator" className="px-5 py-2.5 bg-orange-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const slides = presentation.slides;
  const currentSlide = slides[activeSlideIndex] || slides[0];

  const activeThemeId = presentation.theme || "sunset-orange";
  const activeTheme = PPT_THEMES_MAP[activeThemeId] || PPT_THEMES_MAP["sunset-orange"];

  return (
    <div className="h-screen bg-[#060608] text-white flex flex-col font-sans select-none relative overflow-hidden pt-16">
      
      {/* HEADER CONTROL BAR */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#0a0a0d]/90 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-4 lg:px-8 z-40 shadow-md">
        <div className="flex items-center gap-3.5">
          <Link href="/presentation-generator" className="p-2 bg-neutral-900 border border-white/[0.08] hover:border-orange-500/40 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={presentation.title}
                onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
                className="font-bold text-sm tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.04] px-1.5 py-0.5 rounded-lg transition-colors max-w-[200px] sm:max-w-md truncate"
              />
            </div>
            <div className="flex items-center gap-2 text-[9.5px] font-black uppercase tracking-widest text-neutral-500">
              <span className="text-orange-400 flex items-center gap-1">
                <Presentation size={10} /> Presentation Studio
              </span>
              <span>•</span>
              <span>{slides.length} Slides</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Present Slideshow */}
          <button 
            onClick={triggerFullscreen}
            className="flex items-center gap-1.5 h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl text-[10.5px] font-bold uppercase tracking-widest text-black bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Play size={12} fill="currentColor" />
            <span className="hidden sm:inline">Present</span> (F)
          </button>

          {/* Theme Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 h-9 sm:h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-all outline-none shrink-0 cursor-pointer">
              <Palette size={13} style={{ color: activeTheme.colors.primary }} />
              <span className="hidden md:inline">{activeTheme.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0e0e12] border border-white/[0.12] text-white p-2 rounded-2xl shadow-2xl z-50 w-60 max-h-80 overflow-y-auto custom-scrollbar">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 px-2 py-1">Select Designer Palette</p>
              <div className="space-y-1">
                {Object.values(PPT_THEMES_MAP).map((t: any) => {
                  const isSelected = t.id === activeThemeId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => changeTheme(t.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer",
                        isSelected ? "bg-white/[0.10] text-white border border-white/10" : "hover:bg-white/[0.04] text-neutral-400 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: t.colors.primary }} />
                        <span>{t.name}</span>
                      </div>
                      {isSelected && <Check size={12} className="text-orange-400" />}
                    </button>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 h-9 sm:h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-all outline-none shrink-0 cursor-pointer">
              {isExporting ? <Loader2 size={13} className="animate-spin text-orange-500" /> : <Download size={13} />}
              <span>Export</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0e0e12] border border-white/[0.12] text-white p-1.5 rounded-2xl shadow-2xl z-50 w-48">
              <DropdownMenuItem 
                onClick={() => handleExport("pptx")}
                className="flex items-center gap-2.5 text-xs font-bold rounded-xl cursor-pointer px-3 py-2.5 hover:bg-white/5 focus:bg-white/5 text-neutral-200 hover:text-white"
              >
                <Presentation size={14} className="text-orange-500" /> Export as PowerPoint (.pptx)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2.5 text-xs font-bold rounded-xl cursor-pointer px-3 py-2.5 hover:bg-white/5 focus:bg-white/5 text-neutral-200 hover:text-white"
              >
                <FileText size={14} className="text-red-500" /> Export as PDF Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* CORE WORKSPACE PANES */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-64px)]">
        
        {/* LEFT PANEL: SLIDE THUMBNAIL MANAGER */}
        <aside className="w-56 shrink-0 bg-[#08080a] border-r border-white/[0.06] p-3.5 overflow-y-auto hidden md:flex flex-col gap-2.5 custom-scrollbar h-full">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Slides Deck</span>
            <button
              onClick={handleAddSlide}
              className="p-1 rounded-lg bg-white/[0.04] hover:bg-orange-500/20 text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer"
              title="Add New Slide"
            >
              <Plus size={13} />
            </button>
          </div>

          {slides.map((slide, idx) => {
            const isActive = activeSlideIndex === idx;
            return (
              <div
                key={slide.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={cn(
                  "cursor-pointer flex flex-col gap-1.5 p-2.5 rounded-2xl border transition-all text-left group relative",
                  isActive 
                    ? "bg-orange-500/10 border-orange-500/40 shadow-sm" 
                    : "bg-white/[0.01] border-white/[0.05] hover:border-white/15 hover:bg-white/[0.02]"
                )}
              >
                <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                  <span className="font-bold">Slide {idx + 1}</span>
                  <span className="text-[8px] uppercase tracking-wider px-1.5 rounded bg-white/[0.04] text-neutral-400">
                    {slide.layout.replace("_", " ")}
                  </span>
                </div>
                <span className={cn("text-[11px] font-bold truncate", isActive ? "text-orange-400" : "text-neutral-300 group-hover:text-white")}>
                  {slide.title || `Slide ${idx + 1}`}
                </span>
                
                {/* Visual Thumbnail Mockup */}
                <div className="w-full aspect-[16/9] rounded-xl bg-black/60 border border-white/[0.06] mt-0.5 p-1.5 flex flex-col justify-between overflow-hidden">
                  <div className="h-1.5 w-1/2 rounded bg-white/20" />
                  <div className="space-y-0.5">
                    <div className="h-1 w-full rounded bg-white/10" />
                    <div className="h-1 w-3/4 rounded bg-white/10" />
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* CENTER PANEL: INTERACTIVE WYSIWYG CANVAS */}
        <main className="flex-1 bg-black p-3 sm:p-6 flex flex-col items-center justify-between overflow-hidden h-full relative">
          
          {/* Top Canvas Action Pill Toolbar */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-2 z-20">
            {/* Layout Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/[0.10] hover:border-orange-500/40 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <LayoutGrid size={13} className="text-orange-400" />
                <span className="capitalize">{currentSlide.layout.replace("_", " ")} Layout</span>
                <ChevronLeft size={12} className={cn("transition-transform", showLayoutMenu ? "rotate-90" : "-rotate-90")} />
              </button>

              <AnimatePresence>
                {showLayoutMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-[#0e0e12] border border-white/[0.12] rounded-2xl p-2 shadow-2xl z-50 space-y-1"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 px-2 py-1">Switch Slide Layout</p>
                    {LAYOUT_CHOICES.map((choice) => {
                      const isCurr = currentSlide.layout === choice.id;
                      return (
                        <button
                          key={choice.id}
                          onClick={() => switchSlideLayout(choice.id)}
                          className={cn(
                            "w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer",
                            isCurr ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "hover:bg-white/[0.04] text-neutral-300 hover:text-white"
                          )}
                        >
                          <choice.icon size={15} className="mt-0.5 shrink-0 text-neutral-400" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold block">{choice.label}</span>
                            <span className="text-[9.5px] text-neutral-500 block truncate">{choice.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Slide Manipulation Actions */}
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/[0.08] p-1 rounded-xl">
              <button
                onClick={() => handleMoveSlide("up")}
                disabled={activeSlideIndex === 0}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Move Slide Up"
              >
                <ArrowUp size={13} />
              </button>
              <button
                onClick={() => handleMoveSlide("down")}
                disabled={activeSlideIndex === slides.length - 1}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Move Slide Down"
              >
                <ArrowDown size={13} />
              </button>
              <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
              <button
                onClick={handleDuplicateSlide}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Duplicate Slide"
              >
                <Copy size={13} />
              </button>
              <button
                onClick={handleDeleteSlide}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Delete Slide"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={handleAddSlide}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 text-xs font-bold transition-colors cursor-pointer"
                title="Add New Slide"
              >
                <Plus size={12} />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Active 16:9 Slide Canvas */}
          <div ref={wrapperRef} className="w-full flex-1 flex items-center justify-center relative overflow-hidden min-h-0">
            <div 
              ref={containerRef}
              className={cn(
                "rounded-3xl border shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden transition-all duration-300",
                isFullscreen 
                  ? "w-screen h-screen max-w-none rounded-none border-none bg-black p-12 sm:p-20 fixed inset-0 z-50" 
                  : `border-white/[0.12] p-8 sm:p-12 absolute`
              )}
              style={{
                fontFamily: activeTheme.fontFamily,
                backgroundColor: activeTheme.colors.bg,
                backgroundImage: `linear-gradient(to bottom right, ${activeTheme.colors.bg}, #000000)`,
                width: isFullscreen ? "100%" : "960px",
                height: isFullscreen ? "100%" : "540px",
                transform: isFullscreen ? "none" : `translate(-50%, -50%) scale(${scale})`,
                left: isFullscreen ? "0" : "50%",
                top: isFullscreen ? "0" : "50%",
                transformOrigin: "center center"
              }}
            >
              {/* Background ambient lighting */}
              <div 
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: activeTheme.colors.primary }}
              />
              <div 
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
                style={{ backgroundColor: activeTheme.colors.accent }}
              />

              {/* Header inside slide */}
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 z-10">
                <span className="font-bold tracking-wider">{presentation.title}</span>
                <span 
                  className="uppercase tracking-widest text-[8.5px] px-2.5 py-0.5 rounded-full border"
                  style={{ color: activeTheme.colors.primary, borderColor: `${activeTheme.colors.primary}40`, backgroundColor: `${activeTheme.colors.primary}10` }}
                >
                  {currentSlide.layout.replace("_", " ")}
                </span>
              </div>

              {/* WYSIWYG Content Area */}
              <div className="my-auto flex-1 flex flex-col justify-center min-h-0 py-4 z-10">
                <SlideEditableCanvas 
                  slide={currentSlide}
                  theme={activeTheme}
                  onUpdate={updateCurrentSlide}
                />
              </div>

              {/* Footer inside slide */}
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 pt-2 border-t border-white/[0.06] z-10">
                <span>Paperxify AI Presentations</span>
                <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
              </div>

              {/* Presenter Mode Overlay Dock (Fullscreen Only) */}
              {isFullscreen && (
                <div className="fixed bottom-6 inset-x-0 flex flex-col items-center gap-3 z-50 pointer-events-auto">
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/15 shadow-2xl">
                    <button
                      onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activeSlideIndex === 0}
                      className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-2">
                      {activeSlideIndex + 1} / {slides.length}
                    </span>
                    <button
                      onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                      disabled={activeSlideIndex === slides.length - 1}
                      className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <div className="w-[1px] h-4 bg-white/20 mx-1" />
                    <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400">
                      <Clock size={13} />
                      <span>{Math.floor(presenterSeconds / 60)}:{(presenterSeconds % 60).toString().padStart(2, "0")}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-white/20 mx-1" />
                    <button
                      onClick={() => setShowPresenterNotes(!showPresenterNotes)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                        showPresenterNotes ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <MessageSquare size={13} className="inline mr-1" /> Notes
                    </button>
                    <button
                      onClick={triggerFullscreen}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer ml-1"
                      title="Exit Fullscreen (Esc)"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Presenter Speaker Notes Drawer */}
                  {showPresenterNotes && currentSlide.speakerNotes && (
                    <div className="max-w-2xl w-full p-4 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/15 text-neutral-200 text-xs leading-relaxed shadow-2xl max-h-32 overflow-y-auto custom-scrollbar">
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 block mb-1">Speaker Notes Teleprompter</span>
                      {currentSlide.speakerNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation Pagination Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between pt-2 border-t border-white/[0.06] z-20">
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 disabled:opacity-30 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="text-xs font-mono font-bold text-neutral-400">
              Slide {activeSlideIndex + 1} of {slides.length}
            </span>

            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === slides.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 disabled:opacity-30 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </main>

        {/* RIGHT PANEL: AI CO-PILOT & PRESENTER NOTES */}
        <aside className="w-80 shrink-0 bg-[#09090c] border-l border-white/[0.06] flex flex-col h-full overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/[0.06] bg-[#0c0c10] p-1.5 gap-1 shrink-0">
            <button
              onClick={() => setActiveRightTab("copilot")}
              className={cn(
                "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                activeRightTab === "copilot" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "text-neutral-400 hover:text-white"
              )}
            >
              <Wand2 size={13} /> AI Co-Pilot
            </button>
            <button
              onClick={() => setActiveRightTab("notes")}
              className={cn(
                "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                activeRightTab === "notes" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "text-neutral-400 hover:text-white"
              )}
            >
              <Mic size={13} /> Script
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
            {activeRightTab === "copilot" ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-950/30 to-[#0e0e12] border border-orange-500/25">
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-wider mb-1">
                    <Sparkles size={14} />
                    <span>Gamma AI Slide Actions</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Refine, summarize, expand with data, or rewrite this slide with 1 click.
                  </p>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Quick AI Actions</p>
                  <button
                    onClick={() => handleEnhanceSlide("concise")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left transition-all cursor-pointer text-xs font-bold text-neutral-200 hover:text-orange-300"
                  >
                    <Zap size={14} className="text-amber-400 shrink-0" />
                    <span>Make More Concise & Punchy</span>
                  </button>

                  <button
                    onClick={() => handleEnhanceSlide("expand")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left transition-all cursor-pointer text-xs font-bold text-neutral-200 hover:text-orange-300"
                  >
                    <Lightbulb size={14} className="text-yellow-400 shrink-0" />
                    <span>Enrich with Real-World Examples</span>
                  </button>

                  <button
                    onClick={() => handleEnhanceSlide("metrics")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left transition-all cursor-pointer text-xs font-bold text-neutral-200 hover:text-orange-300"
                  >
                    <TrendingUp size={14} className="text-emerald-400 shrink-0" />
                    <span>Add Key Statistics & Metrics</span>
                  </button>

                  <button
                    onClick={() => handleEnhanceSlide("professional")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left transition-all cursor-pointer text-xs font-bold text-neutral-200 hover:text-orange-300"
                  >
                    <Compass size={14} className="text-blue-400 shrink-0" />
                    <span>Elevate to Executive C-Suite Tone</span>
                  </button>

                  <button
                    onClick={() => handleEnhanceSlide("notes")}
                    disabled={isEnhancing}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/30 text-left transition-all cursor-pointer text-xs font-bold text-neutral-200 hover:text-orange-300"
                  >
                    <Mic size={14} className="text-purple-400 shrink-0" />
                    <span>Generate Presenter Script</span>
                  </button>
                </div>

                {/* Custom Prompt Input */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Custom Slide Prompt</p>
                  <textarea
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    placeholder="e.g. Add 3 comparative bullet points on serverless latency vs dedicated GPUs..."
                    rows={3}
                    className="w-full bg-[#121216] border border-white/[0.10] rounded-xl p-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-orange-500/50 resize-none custom-scrollbar leading-relaxed"
                  />
                  <button
                    onClick={() => handleEnhanceSlide("custom", copilotPrompt)}
                    disabled={!copilotPrompt.trim() || isEnhancing}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-40 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    {isEnhancing ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                    <span>Enhance Slide</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Presenter Notes Editor */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Presenter Script</span>
                  <button
                    onClick={() => handleEnhanceSlide("notes")}
                    disabled={isEnhancing}
                    className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={11} /> AI Auto-Draft
                  </button>
                </div>
                <textarea
                  value={currentSlide.speakerNotes || ""}
                  onChange={(e) => updateCurrentSlide(() => ({ speakerNotes: e.target.value }))}
                  placeholder="Write the talking points or transcript for this slide..."
                  rows={14}
                  className="w-full bg-[#121216] border border-white/[0.10] rounded-2xl p-3.5 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none focus:border-orange-500/50 resize-none custom-scrollbar leading-relaxed"
                />
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}

// --- SUB-COMPONENT: WYSIWYG EDITABLE SLIDE CANVAS ---
function SlideEditableCanvas({
  slide,
  theme,
  onUpdate
}: {
  slide: Slide;
  theme: any;
  onUpdate: (updater: (s: Slide) => Partial<Slide>) => void;
}) {
  const colors = theme.colors;

  switch (slide.layout) {
    case "title":
      return (
        <div className="text-center space-y-5 max-w-3xl mx-auto py-6">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            placeholder="Presentation Title"
            className="w-full text-center text-3xl sm:text-5xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-2xl p-2 transition-colors leading-tight"
          />
          <div 
            className="h-1.5 w-24 mx-auto rounded-full"
            style={{ backgroundColor: colors.primary, boxShadow: `0 0 15px ${colors.primary}` }}
          />
          <textarea
            value={slide.subtitle || ""}
            onChange={(e) => onUpdate(() => ({ subtitle: e.target.value }))}
            placeholder="Add subtitle or key premise..."
            rows={2}
            className="w-full text-center text-sm sm:text-base text-neutral-300 font-light max-w-xl mx-auto bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-2 transition-colors resize-none leading-relaxed"
          />
          {slide.author && (
            <input
              type="text"
              value={slide.author}
              onChange={(e) => onUpdate(() => ({ author: e.target.value }))}
              className="text-xs uppercase font-mono tracking-widest text-center bg-transparent border-0 outline-none hover:bg-white/[0.03] px-3 py-1 rounded-lg"
              style={{ color: colors.primary }}
            />
          )}
        </div>
      );

    case "metric_callout":
    case "metric":
      return (
        <div className="space-y-6 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-1 w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(slide.metrics || [
              { value: slide.metric?.value || "99.4%", label: slide.metric?.label || "Metric KPI" },
              { value: "3.5x", label: "Acceleration" },
              { value: "< 10ms", label: "Latency" }
            ]).map((m, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border flex flex-col justify-center items-center text-center shadow-lg transition-all hover:scale-[1.02]"
                style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}CC` }}
              >
                <input
                  type="text"
                  value={m.value}
                  onChange={(e) => {
                    const nextMetrics = [...(slide.metrics || [])];
                    if (nextMetrics[idx]) nextMetrics[idx].value = e.target.value;
                    onUpdate(() => ({ metrics: nextMetrics }));
                  }}
                  className="text-3xl sm:text-4xl font-black tracking-tight text-center bg-transparent border-0 outline-none w-full"
                  style={{ color: colors.primary }}
                />
                <input
                  type="text"
                  value={m.label}
                  onChange={(e) => {
                    const nextMetrics = [...(slide.metrics || [])];
                    if (nextMetrics[idx]) nextMetrics[idx].label = e.target.value;
                    onUpdate(() => ({ metrics: nextMetrics }));
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-300 text-center bg-transparent border-0 outline-none w-full mt-1"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "timeline":
    case "steps":
    case "roadmap":
      return (
        <div className="space-y-6 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-1 w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            {(slide.events || [
              { year: "Step 1", description: "Architecture Discovery" },
              { year: "Step 2", description: "Semantic Indexing" },
              { year: "Step 3", description: "Inference Tuning" },
              { year: "Step 4", description: "Production Scale" }
            ]).map((ev, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border flex flex-col gap-2 relative shadow-md"
                style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}DD` }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md border"
                    style={{ color: colors.accent, borderColor: colors.border, backgroundColor: `${colors.primary}15` }}
                  >
                    {ev.year}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500">0{idx + 1}</span>
                </div>
                <textarea
                  value={ev.description}
                  onChange={(e) => {
                    const nextEvents = [...(slide.events || [])];
                    if (nextEvents[idx]) nextEvents[idx].description = e.target.value;
                    onUpdate(() => ({ events: nextEvents }));
                  }}
                  rows={3}
                  className="text-xs text-neutral-200 font-light leading-relaxed bg-transparent border-0 outline-none resize-none hover:bg-white/[0.03] rounded-lg p-1"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "comparison":
    case "two_column_text":
      return (
        <div className="space-y-5 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-1 w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left Column */}
            <div 
              className="p-5 rounded-2xl border shadow-lg space-y-3"
              style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}DD` }}
            >
              <span className="text-xs font-black uppercase tracking-wider block" style={{ color: colors.primary }}>
                Option A / Baseline
              </span>
              <div className="space-y-2">
                {(slide.columns?.left || ["First legacy bottleneck", "Higher operational cost", "Slow execution"]).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const cols = { ...slide.columns } as any;
                        if (!cols.left) cols.left = [];
                        cols.left[i] = e.target.value;
                        onUpdate(() => ({ columns: cols }));
                      }}
                      className="bg-transparent border-0 outline-none text-neutral-200 text-xs w-full hover:bg-white/[0.03] px-1 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div 
              className="p-5 rounded-2xl border shadow-lg space-y-3"
              style={{ borderColor: `${colors.primary}50`, backgroundColor: `${colors.primary}10` }}
            >
              <span className="text-xs font-black uppercase tracking-wider block" style={{ color: colors.accent }}>
                Option B / AI Modern
              </span>
              <div className="space-y-2">
                {(slide.columns?.right || ["Autonomous clustering", "Near-zero overhead", "Instant responses"]).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-neutral-200 font-medium">
                    <CheckCircle2 size={13} style={{ color: colors.accent }} />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const cols = { ...slide.columns } as any;
                        if (!cols.right) cols.right = [];
                        cols.right[i] = e.target.value;
                        onUpdate(() => ({ columns: cols }));
                      }}
                      className="bg-transparent border-0 outline-none text-white text-xs w-full hover:bg-white/[0.03] px-1 rounded font-semibold"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "pros_cons":
      return (
        <div className="space-y-5 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-1 w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-2.5 shadow-lg">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Advantages & Benefits
              </span>
              {(slide.pros || ["High accuracy", "Cost reduction", "Scale"]).map((p, i) => (
                <input
                  key={i}
                  type="text"
                  value={p}
                  onChange={(e) => {
                    const nextPros = [...(slide.pros || [])];
                    nextPros[i] = e.target.value;
                    onUpdate(() => ({ pros: nextPros }));
                  }}
                  className="bg-transparent border-0 outline-none text-neutral-200 text-xs w-full hover:bg-white/[0.04] px-1.5 py-0.5 rounded"
                />
              ))}
            </div>

            <div className="p-5 rounded-2xl border border-red-500/30 bg-red-950/20 space-y-2.5 shadow-lg">
              <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <XCircle size={14} /> Key Challenges & Constraints
              </span>
              {(slide.cons || ["Initial setup overhead", "Requires token quota"]).map((c, i) => (
                <input
                  key={i}
                  type="text"
                  value={c}
                  onChange={(e) => {
                    const nextCons = [...(slide.cons || [])];
                    nextCons[i] = e.target.value;
                    onUpdate(() => ({ cons: nextCons }));
                  }}
                  className="bg-transparent border-0 outline-none text-neutral-200 text-xs w-full hover:bg-white/[0.04] px-1.5 py-0.5 rounded"
                />
              ))}
            </div>
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="max-w-2xl mx-auto text-center space-y-5 py-4">
          <Quote size={32} className="mx-auto opacity-70" style={{ color: colors.primary }} />
          <textarea
            value={slide.quote_text || slide.title || ""}
            onChange={(e) => onUpdate(() => ({ quote_text: e.target.value }))}
            rows={3}
            className="w-full text-center text-xl sm:text-2xl font-serif italic text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-2xl p-2 resize-none leading-relaxed"
          />
          <div className="space-y-1">
            <input
              type="text"
              value={slide.author || "Author Name"}
              onChange={(e) => onUpdate(() => ({ author: e.target.value }))}
              className="text-xs font-bold uppercase tracking-widest text-center bg-transparent border-0 outline-none w-full"
              style={{ color: colors.primary }}
            />
            <input
              type="text"
              value={slide.role || "Executive / Researcher"}
              onChange={(e) => onUpdate(() => ({ role: e.target.value }))}
              className="text-[11px] text-neutral-400 text-center bg-transparent border-0 outline-none w-full"
            />
          </div>
        </div>
      );

    case "matrix_2x2":
      return (
        <div className="space-y-5 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-1 w-full"
          />
          <div className="grid grid-cols-2 gap-3.5">
            {(slide.quadrants || ["Quadrant 1: Top Left", "Quadrant 2: Top Right", "Quadrant 3: Bottom Left", "Quadrant 4: Bottom Right"]).map((q, i) => (
              <div 
                key={i}
                className="p-4 rounded-2xl border shadow-md flex items-center gap-2"
                style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}CC` }}
              >
                <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                  Q{i + 1}
                </span>
                <textarea
                  value={q}
                  onChange={(e) => {
                    const nextQ = [...(slide.quadrants || [])];
                    nextQ[i] = e.target.value;
                    onUpdate(() => ({ quadrants: nextQ }));
                  }}
                  rows={2}
                  className="bg-transparent border-0 outline-none text-neutral-200 text-xs w-full resize-none hover:bg-white/[0.03] p-1 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "bullets":
    case "conclusion":
    default:
      return (
        <div className="space-y-5 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            placeholder="Slide Heading"
            className="text-2xl sm:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-1 w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(slide.bullets || ["First key insight or concept", "Second structural milestone", "Third actionable recommendation"]).map((bullet, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border flex gap-3 items-start shadow-md transition-all hover:scale-[1.01]"
                style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}DD` }}
              >
                <span 
                  className="w-5 h-5 rounded-full border font-mono text-[9.5px] font-black flex items-center justify-center shrink-0 mt-0.5"
                  style={{ color: colors.accent, borderColor: colors.border, backgroundColor: `${colors.primary}15` }}
                >
                  0{idx + 1}
                </span>
                <textarea
                  value={bullet}
                  onChange={(e) => {
                    const nextBullets = [...(slide.bullets || [])];
                    nextBullets[idx] = e.target.value;
                    onUpdate(() => ({ bullets: nextBullets }));
                  }}
                  rows={2}
                  className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed bg-transparent border-0 outline-none resize-none hover:bg-white/[0.03] rounded-lg w-full p-0.5"
                />
              </div>
            ))}
          </div>
        </div>
      );
  }
}
