"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, Play, Download, LayoutGrid, X, 
  Loader2, Presentation, ArrowLeft, RefreshCw, FileText, Check, 
  MessageSquare, Edit3, Save, Maximize2, ShieldAlert, Sparkles, Image as ImageIcon,
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Wand2, Lightbulb, Zap, TrendingUp,
  Mic, Clock, Compass, Layers, CheckCircle2, XCircle, Quote, Code, BarChart3,
  Calendar, CheckSquare, Split, Palette, Eye, ExternalLink, Link2
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
  { id: "image_left", label: "Visual Split (Image Left)", icon: ImageIcon, desc: "50% visual image, 50% detailed takeaways" },
  { id: "image_right", label: "Visual Split (Image Right)", icon: ImageIcon, desc: "50% detailed takeaways, 50% visual image" },
  { id: "bullets", label: "Bento Cards / Bullets", icon: LayoutGrid, desc: "Feature cards with deep takeaways" },
  { id: "comparison", label: "Comparison VS", icon: Split, desc: "Side-by-side comparative column cards" },
  { id: "metric_callout", label: "Key Metrics", icon: BarChart3, desc: "Big bold KPI statistics & benchmarks" },
  { id: "timeline", label: "Process Timeline", icon: Calendar, desc: "Sequential chronological milestones" },
  { id: "gallery_grid", label: "Visual Gallery Showcase", icon: Layers, desc: "Multi-image showcase with captions" },
  { id: "pros_cons", label: "Pros & Cons", icon: CheckSquare, desc: "Advantages vs Disadvantages grid" },
  { id: "quote", label: "Editorial Quote", icon: Quote, desc: "Statement with author attribution" },
  { id: "paragraph", label: "Deep-Dive Analysis", icon: FileText, desc: "Detailed analytical explanation" },
  { id: "matrix_2x2", label: "2x2 Matrix", icon: Layers, desc: "Four-quadrant strategic matrix (SWOT)" },
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

  // Mobile navigation tabs & modal drawers
  const [mobileTab, setMobileTab] = useState<"canvas" | "deck" | "copilot" | "notes">("canvas");
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  // AI Co-Pilot State
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Presenter Mode State
  const [presenterSeconds, setPresenterSeconds] = useState(0);
  const [showPresenterNotes, setShowPresenterNotes] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Touch Swipe Handling for Mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Load presentation from API or generate dynamic rich presentation content
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
        console.warn("Backend presentation API not found, creating dynamic presentation for demo.");
        const niceTitle = slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const mockSlides: Slide[] = [
          {
            id: 1,
            title: niceTitle,
            subtitle: "Production-Grade AI Architecture, Ingestion Pipelines & Deployment Roadmap",
            layout: "title",
            author: "Generated with Paperxify AI",
            speakerNotes: "Welcome everyone. Today we are exploring " + niceTitle + ". We will examine the foundational architecture, ingestion mechanics, key benchmarks, and evolutionary milestones."
          },
          {
            id: 2,
            title: "Core Mechanics & Architectural Foundation",
            layout: "image_left",
            image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
            bullets: [
              "Semantic Chunking Heuristics: Context-aware document partitioning preserves parent-child relational continuity.",
              "Vector Space Optimization: Hierarchical HNSW indexing accelerates sub-millisecond similarity lookups.",
              "Dynamic Routing: Socratic query classification prevents token exhaustion and context pollution."
            ],
            speakerNotes: "Let us examine the foundational mechanics: semantic chunking, vector indexing, and dynamic query routing."
          },
          {
            id: 3,
            title: "Key Performance Benchmarks",
            layout: "metric_callout",
            metrics: [
              { value: "99.8%", label: "Retrieval Precision Index" },
              { value: "3.8x", label: "Learning Speed Multiplier" },
              { value: "< 15ms", label: "P99 Inference Latency" }
            ],
            speakerNotes: "These metrics summarize our key benchmarks across 1.2M automated queries under peak high-load concurrency."
          },
          {
            id: 4,
            title: "Architecture Comparison: Legacy vs AI-Native",
            layout: "comparison",
            columns: {
              left: [
                "Legacy Relational Monoliths:",
                "Rigid relational schemas with severe bottleneck overhead (>450ms)",
                "Manual synchronization scripts prone to data drift",
                "High operational complexity and linear infrastructure cost"
              ],
              right: [
                "AI-Native Vector Graphs:",
                "Dynamic semantic embeddings with sub-millisecond retrieval (<15ms)",
                "Self-healing knowledge graphs with automated re-indexing",
                "Infinite horizontal scaling on serverless edge clusters"
              ]
            },
            speakerNotes: "Notice the stark difference in response latency and schema flexibility when transitioning from legacy databases to vector graphs."
          },
          {
            id: 5,
            title: "Evolutionary Deployment Roadmap",
            layout: "timeline",
            events: [
              { year: "Phase 1", description: "Multimodal Document OCR Extraction & Vector Partitioning" },
              { year: "Phase 2", description: "Hierarchical Indexing & Socratic Retrieval Clustering" },
              { year: "Phase 3", description: "Active Recall Flashcards & Real-Time Stream Engine" },
              { year: "Phase 4", description: "Global Multi-Tenant Auto-Scaling Mesh Deployment" }
            ],
            speakerNotes: "Our deployment roadmap spans 4 distinct phases, from ingestion to global auto-scaling."
          },
          {
            id: 6,
            title: "System Capabilities & High-Yield Features",
            layout: "image_right",
            image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
            bullets: [
              "Sub-Millisecond Cache Invalidation: Edge workers keep document state synchronized in real-time.",
              "Active Recall Knowledge Testing: Automated Spaced Repetition reinforces 3.8x better concept retention.",
              "Universal Multi-Format Export: Direct native generation of vector PDFs and PowerPoint presentations."
            ],
            speakerNotes: "These high-yield capabilities ensure maximum learner engagement and seamless knowledge handoffs."
          },
          {
            id: 7,
            title: "Strategic Impact vs Complexity Matrix",
            layout: "matrix_2x2",
            quadrants: [
              "Quick Wins: Prompt Caching & Edge Vector Lookups",
              "Major Projects: Custom Fine-Tuning & Quantized Model Deployments",
              "Fill-Ins: UI Micro-Animations & Theme Personalization",
              "Hard Slogs: Manual OCR Clean-up & Data Normalization"
            ],
            speakerNotes: "This 2x2 prioritization matrix helps teams distinguish quick architectural wins from heavy long-term investments."
          },
          {
            id: 8,
            title: "Executive Summary & Next Actions",
            layout: "conclusion",
            bullets: [
              "Deploy semantic grounding to eliminate LLM hallucinations across production queries.",
              "Leverage active recall flashcards to guarantee concept mastery and lifelong retention.",
              "Export native PPTX presentations for immediate stakeholder alignment and board briefings."
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
      title: "New Strategic Concept",
      subtitle: "Add detailed takeaways and key premise",
      layout: "image_left",
      image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
      bullets: [
        "First foundational mechanism or takeaway.",
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

    if ((layout === "image_left" || layout === "image_right") && !current.image_url) {
      updated.image_url = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";
      if (!current.bullets || current.bullets.length === 0) {
        updated.bullets = [
          "Key Takeaway 1: Deep architectural principle and execution.",
          "Key Takeaway 2: Sub-millisecond performance telemetry.",
          "Key Takeaway 3: Scalable resilient knowledge graph."
        ];
      }
    } else if (layout === "metric_callout" && (!current.metrics || current.metrics.length === 0)) {
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
        "Weaknesses: High initial memory footprint",
        "Opportunities: Multi-modal document embeddings",
        "Threats: Third-party API rate limits"
      ];
    }

    updateCurrentSlide(() => updated);
    setShowLayoutMenu(false);
    toast.success(`Switched to ${layout.replace("_", " ")} layout`);
  };

  // 1-Click AI Co-Pilot Enhancements
  const handleEnhanceSlide = async (action: string, customPromptText?: string) => {
    if (!presentation) return;
    setIsEnhancing(true);
    const toastId = toast.loading("🪄 Gamma AI refining slide layout & copy...");

    try {
      const token = localStorage.getItem("authToken");
      const current = presentation.slides[activeSlideIndex];
      const res = await api.post(`/presentation/${slug}/enhance-slide`, {
        slide: current,
        action,
        customPrompt: customPromptText
      }, {
        headers: { 'Auth': token }
      });

      if (res.data?.success && res.data?.slide) {
        updateCurrentSlide(() => res.data.slide);
        toast.success("Slide enhanced with AI!", { id: toastId });
        setCopilotPrompt("");
      } else {
        throw new Error("AI refinement response empty");
      }
    } catch (e) {
      if (action === "concise") {
        updateCurrentSlide((s) => ({
          bullets: (s.bullets || []).map((b) => b.split(" ").slice(0, 10).join(" ") + ".")
        }));
        toast.success("Slide tightened for clarity!", { id: toastId });
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

  // Touch Swipe Handlers for Mobile Slide Navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || !presentation) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        setActiveSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1));
      } else {
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
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
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-white px-4 text-center">
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
    <div className="h-screen bg-[#060608] text-white flex flex-col font-sans select-none relative overflow-hidden pt-14 sm:pt-16">
      
      {/* ─── HEADER CONTROL BAR ─── */}
      <header className="fixed top-0 inset-x-0 h-14 sm:h-16 bg-[#0a0a0d]/95 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-6 z-40 shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 mr-2">
          <Link 
            href="/presentation-generator" 
            className="p-2 bg-neutral-900 border border-white/[0.08] hover:border-orange-500/40 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer shrink-0"
            title="Back to Presentations"
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={presentation.title}
                onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
                className="font-bold text-xs sm:text-sm tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.04] px-1 py-0.5 rounded-lg transition-colors w-full max-w-[180px] sm:max-w-md truncate"
                placeholder="Presentation Title"
              />
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-neutral-500 truncate">
              <span className="text-orange-400 flex items-center gap-1">
                <Presentation size={10} /> Gamma Studio
              </span>
              <span>•</span>
              <span>{slides.length} Slides</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Present Slideshow Button */}
          <button 
            onClick={triggerFullscreen}
            className="flex items-center gap-1.5 h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest text-black bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all active:scale-95 shrink-0 cursor-pointer shadow-md"
            title="Start Slideshow (F)"
          >
            <Play size={11} fill="currentColor" />
            <span>Present</span>
            <span className="hidden md:inline font-mono opacity-80">(F)</span>
          </button>

          {/* Theme Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 h-8 sm:h-10 px-2 sm:px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-all outline-none shrink-0 cursor-pointer">
              <Palette size={13} style={{ color: activeTheme.colors.primary }} />
              <span className="hidden md:inline">{activeTheme.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0e0e12] border border-white/[0.12] text-white p-2 rounded-2xl shadow-2xl z-50 w-60 max-h-80 overflow-y-auto custom-scrollbar">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 px-2 py-1">Select Theme Palette</p>
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
            <DropdownMenuTrigger className="flex items-center gap-1.5 h-8 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-all outline-none shrink-0 cursor-pointer">
              {isExporting ? <Loader2 size={13} className="animate-spin text-orange-500" /> : <Download size={13} />}
              <span className="hidden sm:inline">Export</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0e0e12] border border-white/[0.12] text-white p-1.5 rounded-2xl shadow-2xl z-50 w-52">
              <DropdownMenuItem 
                onClick={() => handleExport("pptx")}
                className="flex items-center gap-2.5 text-xs font-bold rounded-xl cursor-pointer px-3 py-2.5 hover:bg-white/5 focus:bg-white/5 text-neutral-200 hover:text-white"
              >
                <Presentation size={14} className="text-orange-500" /> PowerPoint (.pptx)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2.5 text-xs font-bold rounded-xl cursor-pointer px-3 py-2.5 hover:bg-white/5 focus:bg-white/5 text-neutral-200 hover:text-white"
              >
                <FileText size={14} className="text-red-500" /> PDF Document (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ─── CORE WORKSPACE BODY ─── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] pb-16 md:pb-0">
        
        {/* ─── LEFT PANEL: DESKTOP SLIDE THUMBNAIL MANAGER ─── */}
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
                
                <div className="w-full aspect-[16/9] rounded-xl bg-black/60 border border-white/[0.06] mt-0.5 p-1.5 flex flex-col justify-between overflow-hidden relative">
                  {slide.image_url ? (
                    <img src={slide.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  ) : null}
                  <div className="h-1.5 w-1/2 rounded bg-white/20 relative z-10" />
                  <div className="space-y-0.5 relative z-10">
                    <div className="h-1 w-full rounded bg-white/10" />
                    <div className="h-1 w-3/4 rounded bg-white/10" />
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* ─── CENTER PANEL: UNIFIED 16:9 WYSIWYG CANVAS ─── */}
        <main className="flex-1 bg-[#060608] p-3 sm:p-6 flex flex-col justify-center items-center overflow-hidden h-full relative">
          
          {/* Top Canvas Action Pill Toolbar */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-2 sm:mb-3 z-20 gap-2 shrink-0">
            {/* Layout Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/[0.10] hover:border-orange-500/40 text-[11px] sm:text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <LayoutGrid size={13} className="text-orange-400 shrink-0" />
                <span className="capitalize truncate max-w-[130px] sm:max-w-none">{currentSlide.layout.replace("_", " ")}</span>
                <ChevronLeft size={12} className={cn("transition-transform shrink-0", showLayoutMenu ? "rotate-90" : "-rotate-90")} />
              </button>

              <AnimatePresence>
                {showLayoutMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-[#0e0e12] border border-white/[0.12] rounded-2xl p-2 shadow-2xl z-50 space-y-1 max-h-80 overflow-y-auto custom-scrollbar"
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
            <div className="flex items-center gap-1 bg-neutral-900 border border-white/[0.08] p-1 rounded-xl shrink-0">
              <button
                onClick={() => handleMoveSlide("up")}
                disabled={activeSlideIndex === 0}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Move Slide Up / Left"
              >
                <ArrowUp size={13} />
              </button>
              <button
                onClick={() => handleMoveSlide("down")}
                disabled={activeSlideIndex === slides.length - 1}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Move Slide Down / Right"
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
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer"
                title="Add New Slide"
              >
                <Plus size={12} />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>
          </div>

          {/* ─── UNIFIED TRUE 16:9 SLIDE CONTAINER ─── */}
          <div 
            ref={wrapperRef} 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full max-w-4xl flex items-center justify-center relative min-h-0 shrink"
          >
            <div 
              ref={containerRef}
              className={cn(
                "w-full aspect-[16/9] rounded-2xl sm:rounded-3xl border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden relative transition-all duration-200",
                isFullscreen 
                  ? "w-screen h-screen max-w-none rounded-none border-none bg-black p-8 sm:p-16 fixed inset-0 z-50" 
                  : "p-3.5 sm:p-7 md:p-10"
              )}
              style={{
                fontFamily: activeTheme.fontFamily,
                backgroundColor: activeTheme.colors.bg,
                backgroundImage: `linear-gradient(to bottom right, ${activeTheme.colors.bg}, #000000)`,
              }}
            >
              {/* Background ambient lighting */}
              <div 
                className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: activeTheme.colors.primary }}
              />
              <div 
                className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
                style={{ backgroundColor: activeTheme.colors.accent }}
              />

              {/* Slide Internal Header */}
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-neutral-400 z-10">
                <span className="font-bold tracking-wider truncate max-w-[200px] sm:max-w-md">{presentation.title}</span>
                <span 
                  className="uppercase tracking-widest text-[7.5px] sm:text-[8.5px] px-2 sm:px-2.5 py-0.5 rounded-full border shrink-0"
                  style={{ color: activeTheme.colors.primary, borderColor: `${activeTheme.colors.primary}40`, backgroundColor: `${activeTheme.colors.primary}10` }}
                >
                  {currentSlide.layout.replace("_", " ")}
                </span>
              </div>

              {/* Slide WYSIWYG Content Area */}
              <div className="my-auto flex-1 flex flex-col justify-center min-h-0 py-1 sm:py-3 z-10 overflow-hidden">
                <SlideEditableCanvas 
                  slide={currentSlide}
                  theme={activeTheme}
                  onUpdate={updateCurrentSlide}
                />
              </div>

              {/* Slide Internal Footer */}
              <div className="flex justify-between items-center text-[8.5px] sm:text-[10px] font-mono text-neutral-500 pt-1.5 sm:pt-2 border-t border-white/[0.06] z-10">
                <span className="hidden sm:inline">Paperxify AI Presentations</span>
                <span className="sm:hidden text-orange-400 font-bold flex items-center gap-1">
                  <Sparkles size={10} /> Swipe
                </span>
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

          {/* Quick Pagination Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between pt-2 sm:pt-3 z-20 shrink-0">
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 disabled:opacity-30 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft size={14} /> <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="text-xs font-mono font-bold text-neutral-400">
              Slide {activeSlideIndex + 1} of {slides.length}
            </span>

            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === slides.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 disabled:opacity-30 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight size={14} />
            </button>
          </div>
        </main>

        {/* ─── RIGHT PANEL: DESKTOP AI CO-PILOT & PRESENTER NOTES ─── */}
        <aside className="w-80 shrink-0 bg-[#09090c] border-l border-white/[0.06] hidden md:flex flex-col h-full overflow-hidden">
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

      {/* ─── 5. MOBILE FLOATING GLASS CAPSULE DOCK ─── */}
      <div className="md:hidden fixed bottom-3 inset-x-0 z-[70] flex justify-center px-3 pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-[380px] h-[52px] rounded-full bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/[0.14] shadow-[0_16px_45px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)] p-1.5 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={() => setMobileTab("deck")}
            className={cn(
              "relative flex-1 h-full rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none active:scale-95",
              mobileTab === "deck" ? "text-black font-extrabold" : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            {mobileTab === "deck" && (
              <motion.span
                layoutId="active-mobile-ppt-pill"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_2px_12px_rgba(249,115,22,0.55)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Layers size={13} />
              <span className="leading-none text-[10.5px]">Deck</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("canvas")}
            className={cn(
              "relative flex-1 h-full rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none active:scale-95",
              mobileTab === "canvas" ? "text-black font-extrabold" : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            {mobileTab === "canvas" && (
              <motion.span
                layoutId="active-mobile-ppt-pill"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_2px_12px_rgba(249,115,22,0.55)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Eye size={13} />
              <span className="leading-none text-[10.5px]">Slide</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("copilot")}
            className={cn(
              "relative flex-1 h-full rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none active:scale-95",
              mobileTab === "copilot" ? "text-black font-extrabold" : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            {mobileTab === "copilot" && (
              <motion.span
                layoutId="active-mobile-ppt-pill"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_2px_12px_rgba(249,115,22,0.55)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Wand2 size={13} />
              <span className="leading-none text-[10.5px]">AI Co-Pilot</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("notes")}
            className={cn(
              "relative flex-1 h-full rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none active:scale-95",
              mobileTab === "notes" ? "text-black font-extrabold" : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            {mobileTab === "notes" && (
              <motion.span
                layoutId="active-mobile-ppt-pill"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_2px_12px_rgba(249,115,22,0.55)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Mic size={13} />
              <span className="leading-none text-[10.5px]">Script</span>
            </span>
          </button>
        </nav>
      </div>

      {/* ─── 6. MOBILE MODAL DRAWERS ─── */}
      <AnimatePresence>
        {/* Mobile Slide Deck Drawer Sheet */}
        {mobileTab === "deck" && (
          <div className="md:hidden fixed inset-0 z-[80] flex flex-col justify-end bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0" 
              onClick={() => setMobileTab("canvas")} 
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full bg-[#0d0d12] border-t border-white/[0.14] rounded-t-[2.5rem] p-5 shadow-2xl max-h-[82vh] flex flex-col z-10"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 shrink-0" />
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                  <h3 className="text-base font-black text-white">Slide Deck Overview</h3>
                  <p className="text-[11px] text-neutral-400">{slides.length} slides in presentation</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddSlide}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 text-black text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus size={13} /> Add Slide
                  </button>
                  <button
                    onClick={() => setMobileTab("canvas")}
                    className="p-1.5 rounded-full bg-white/[0.06] text-neutral-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Grid of Slide Cards */}
              <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-3 pb-8">
                {slides.map((slide, idx) => {
                  const isActive = activeSlideIndex === idx;
                  return (
                    <div
                      key={slide.id}
                      onClick={() => {
                        setActiveSlideIndex(idx);
                        setMobileTab("canvas");
                      }}
                      className={cn(
                        "cursor-pointer flex flex-col gap-1.5 p-3 rounded-2xl border transition-all text-left group relative",
                        isActive 
                          ? "bg-orange-500/15 border-orange-500/60 shadow-lg" 
                          : "bg-white/[0.02] border-white/[0.08] hover:border-white/20"
                      )}
                    >
                      <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                        <span className="font-bold text-white">#{idx + 1}</span>
                        <span className="uppercase text-[8px] px-1.5 py-0.5 rounded bg-white/[0.06]">
                          {slide.layout.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-neutral-200 line-clamp-2">
                        {slide.title || `Slide ${idx + 1}`}
                      </span>
                      
                      <div className="w-full aspect-[16/9] rounded-xl bg-black/60 border border-white/[0.06] p-1.5 flex flex-col justify-between overflow-hidden mt-1 relative">
                        {slide.image_url ? (
                          <img src={slide.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                        ) : null}
                        <div className="h-1.5 w-1/2 rounded bg-white/30 relative z-10" />
                        <div className="space-y-0.5 relative z-10">
                          <div className="h-1 w-full rounded bg-white/15" />
                          <div className="h-1 w-3/4 rounded bg-white/15" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Mobile AI Co-Pilot Drawer Sheet */}
        {mobileTab === "copilot" && (
          <div className="md:hidden fixed inset-0 z-[80] flex flex-col justify-end bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0" 
              onClick={() => setMobileTab("canvas")} 
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full bg-[#0d0d12] border-t border-white/[0.14] rounded-t-[2.5rem] p-5 shadow-2xl max-h-[85vh] flex flex-col z-10"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 shrink-0" />
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Wand2 size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Gamma AI Co-Pilot</h3>
                    <p className="text-[10.5px] text-neutral-400">Slide {activeSlideIndex + 1} Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileTab("canvas")}
                  className="p-1.5 rounded-full bg-white/[0.06] text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-8">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      handleEnhanceSlide("concise");
                      setMobileTab("canvas");
                    }}
                    disabled={isEnhancing}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] active:bg-orange-500/15 border border-white/[0.08] text-left text-xs font-bold text-neutral-200"
                  >
                    <Zap size={15} className="text-amber-400 shrink-0" />
                    <span>Make More Concise & Punchy</span>
                  </button>

                  <button
                    onClick={() => {
                      handleEnhanceSlide("expand");
                      setMobileTab("canvas");
                    }}
                    disabled={isEnhancing}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] active:bg-orange-500/15 border border-white/[0.08] text-left text-xs font-bold text-neutral-200"
                  >
                    <Lightbulb size={15} className="text-yellow-400 shrink-0" />
                    <span>Enrich with Practical Examples</span>
                  </button>

                  <button
                    onClick={() => {
                      handleEnhanceSlide("metrics");
                      setMobileTab("canvas");
                    }}
                    disabled={isEnhancing}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] active:bg-orange-500/15 border border-white/[0.08] text-left text-xs font-bold text-neutral-200"
                  >
                    <TrendingUp size={15} className="text-emerald-400 shrink-0" />
                    <span>Add Key Statistics & Metrics</span>
                  </button>

                  <button
                    onClick={() => {
                      handleEnhanceSlide("professional");
                      setMobileTab("canvas");
                    }}
                    disabled={isEnhancing}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] active:bg-orange-500/15 border border-white/[0.08] text-left text-xs font-bold text-neutral-200"
                  >
                    <Compass size={15} className="text-blue-400 shrink-0" />
                    <span>Elevate to Executive C-Suite Tone</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Custom Slide Prompt</span>
                  <textarea
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    placeholder="e.g. Add 3 comparative bullet points on serverless latency vs dedicated GPUs..."
                    rows={3}
                    className="w-full bg-[#141418] border border-white/[0.12] rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-orange-500/60 resize-none leading-relaxed"
                  />
                  <button
                    onClick={() => {
                      handleEnhanceSlide("custom", copilotPrompt);
                      setMobileTab("canvas");
                    }}
                    disabled={!copilotPrompt.trim() || isEnhancing}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 disabled:opacity-40 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                  >
                    {isEnhancing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    <span>Enhance Slide</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Mobile Presenter Script Drawer Sheet */}
        {mobileTab === "notes" && (
          <div className="md:hidden fixed inset-0 z-[80] flex flex-col justify-end bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0" 
              onClick={() => setMobileTab("canvas")} 
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full bg-[#0d0d12] border-t border-white/[0.14] rounded-t-[2.5rem] p-5 shadow-2xl max-h-[85vh] flex flex-col z-10"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 shrink-0" />
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Mic size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Presenter Teleprompter Script</h3>
                    <p className="text-[10.5px] text-neutral-400">Slide {activeSlideIndex + 1} Talking Points</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileTab("canvas")}
                  className="p-1.5 rounded-full bg-white/[0.06] text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Speech Notes</span>
                  <button
                    onClick={() => handleEnhanceSlide("notes")}
                    disabled={isEnhancing}
                    className="text-xs font-bold text-orange-400 flex items-center gap-1"
                  >
                    <Sparkles size={12} /> AI Auto-Draft
                  </button>
                </div>
                <textarea
                  value={currentSlide.speakerNotes || ""}
                  onChange={(e) => updateCurrentSlide(() => ({ speakerNotes: e.target.value }))}
                  placeholder="Write the talking points or transcript for this slide..."
                  rows={8}
                  className="w-full bg-[#141418] border border-white/[0.12] rounded-2xl p-3.5 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none focus:border-orange-500/60 resize-none leading-relaxed"
                />
                <button
                  onClick={() => setMobileTab("canvas")}
                  className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-white text-xs font-bold"
                >
                  Done Editing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ─── SUB-COMPONENT: PROPORTIONAL 16:9 WYSIWYG EDITABLE SLIDE CANVAS ───
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
  const [showImagePrompt, setShowImagePrompt] = useState(false);

  switch (slide.layout) {
    case "title":
      return (
        <div className="text-center space-y-2 sm:space-y-4 max-w-3xl mx-auto py-1 sm:py-3">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            placeholder="Presentation Title"
            className="w-full text-center text-lg sm:text-3xl md:text-5xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-2xl p-1 sm:p-2 transition-colors leading-tight"
          />
          <div 
            className="h-1 sm:h-1.5 w-16 sm:w-24 mx-auto rounded-full"
            style={{ backgroundColor: colors.primary, boxShadow: `0 0 15px ${colors.primary}` }}
          />
          <textarea
            value={slide.subtitle || ""}
            onChange={(e) => onUpdate(() => ({ subtitle: e.target.value }))}
            placeholder="Add subtitle or key premise..."
            rows={2}
            className="w-full text-center text-[10.5px] sm:text-sm md:text-base text-neutral-300 font-light max-w-xl mx-auto bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-1 sm:p-2 transition-colors resize-none leading-snug sm:leading-relaxed"
          />
          {slide.author && (
            <input
              type="text"
              value={slide.author}
              onChange={(e) => onUpdate(() => ({ author: e.target.value }))}
              className="text-[9px] sm:text-xs uppercase font-mono tracking-widest text-center bg-transparent border-0 outline-none hover:bg-white/[0.03] px-2 py-0.5 rounded-lg"
              style={{ color: colors.primary }}
            />
          )}
        </div>
      );

    // ─── VISUAL SPLIT: IMAGE LEFT ───
    case "image_left":
      return (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center h-full text-left">
          {/* Left Visual Illustration - Clean & Immersive */}
          <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border shadow-lg group" style={{ borderColor: colors.border }}>
            <img 
              src={slide.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"} 
              alt={slide.title || "Illustration"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right Detailed Content */}
          <div className="space-y-1.5 sm:space-y-3">
            <input
              type="text"
              value={slide.title || ""}
              onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
              className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-lg p-0.5 w-full leading-snug"
              placeholder="Topic Headline"
            />
            <div className="space-y-1.5 sm:space-y-2">
              {(slide.bullets || [
                "Semantic Layering: Context-aware document partitioning preserves schema continuity.",
                "Vector Caching: HNSW indexing accelerates sub-millisecond retrieval by 3.8x."
              ]).map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[9px] sm:text-xs text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: colors.primary }} />
                  <textarea
                    value={bullet}
                    onChange={(e) => {
                      const next = [...(slide.bullets || [])];
                      next[idx] = e.target.value;
                      onUpdate(() => ({ bullets: next }));
                    }}
                    rows={2}
                    className="w-full bg-transparent border-0 outline-none resize-none leading-snug p-0.5 hover:bg-white/[0.02] rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    // ─── VISUAL SPLIT: IMAGE RIGHT ───
    case "image_right":
      return (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center h-full text-left">
          {/* Left Detailed Content */}
          <div className="space-y-1.5 sm:space-y-3">
            <input
              type="text"
              value={slide.title || ""}
              onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
              className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-lg p-0.5 w-full leading-snug"
              placeholder="Topic Headline"
            />
            <div className="space-y-1.5 sm:space-y-2">
              {(slide.bullets || [
                "Sub-Millisecond Edge Telemetry: Serverless edge workers synchronize state in real-time.",
                "Active Recall Validation: Automated active recall tests boost retention by 3.8x."
              ]).map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[9px] sm:text-xs text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: colors.accent }} />
                  <textarea
                    value={bullet}
                    onChange={(e) => {
                      const next = [...(slide.bullets || [])];
                      next[idx] = e.target.value;
                      onUpdate(() => ({ bullets: next }));
                    }}
                    rows={2}
                    className="w-full bg-transparent border-0 outline-none resize-none leading-snug p-0.5 hover:bg-white/[0.02] rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Illustration - Clean & Immersive */}
          <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border shadow-lg group" style={{ borderColor: colors.border }}>
            <img 
              src={slide.image_url || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"} 
              alt={slide.title || "Illustration"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      );

    // ─── VISUAL GALLERY SHOWCASE ───
    case "gallery_grid":
      return (
        <div className="space-y-2 sm:space-y-3 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-base sm:text-2xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-0.5 sm:p-1 w-full"
            placeholder="Visual Showcase Headline"
          />
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(slide.images || [
              "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
              "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
              "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800"
            ]).map((img, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10 relative group">
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      );

    // ─── DEEP DIVE PARAGRAPH ANALYSIS ───
    case "paragraph":
      return (
        <div className="space-y-2 sm:space-y-3 text-left max-w-3xl mx-auto">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-0.5 sm:p-1 w-full"
            placeholder="Deep-Dive Analysis Headline"
          />
          <div className="p-3 sm:p-5 rounded-2xl border shadow-lg space-y-2" style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}DD` }}>
            <textarea
              value={slide.content || "Detailed architectural deep dive into technical implementation, performance benchmarks, error recovery heuristics, and scalability parameters."}
              onChange={(e) => onUpdate(() => ({ content: e.target.value }))}
              rows={4}
              className="w-full text-xs sm:text-sm text-neutral-200 font-light leading-relaxed bg-transparent border-0 outline-none resize-none hover:bg-white/[0.02] p-1 rounded"
            />
          </div>
        </div>
      );

    case "metric_callout":
    case "metric":
      return (
        <div className="space-y-2 sm:space-y-4 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-0.5 sm:p-1 w-full"
            placeholder="Key Metrics Title"
          />
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5">
            {(slide.metrics || [
              { value: slide.metric?.value || "99.4%", label: slide.metric?.label || "Metric KPI" },
              { value: "3.5x", label: "Acceleration" },
              { value: "< 10ms", label: "Latency" }
            ]).map((m, idx) => (
              <div 
                key={idx}
                className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col justify-center items-center text-center shadow-lg transition-all hover:scale-[1.02]"
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
                  className="text-sm sm:text-2xl md:text-4xl font-black tracking-tight text-center bg-transparent border-0 outline-none w-full"
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
                  className="text-[8px] sm:text-[10.5px] font-bold uppercase tracking-wider text-neutral-300 text-center bg-transparent border-0 outline-none w-full mt-0.5"
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
        <div className="space-y-2 sm:space-y-4 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-0.5 sm:p-1 w-full"
            placeholder="Process Timeline Title"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
            {(slide.events || [
              { year: "Step 1", description: "Architecture Discovery" },
              { year: "Step 2", description: "Semantic Indexing" },
              { year: "Step 3", description: "Inference Tuning" },
              { year: "Step 4", description: "Production Scale" }
            ]).map((ev, idx) => (
              <div 
                key={idx}
                className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border flex flex-col gap-1 relative shadow-md"
                style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}DD` }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[8.5px] sm:text-[10px] font-mono font-black uppercase px-1.5 py-0.5 rounded-md border"
                    style={{ color: colors.accent, borderColor: colors.border, backgroundColor: `${colors.primary}15` }}
                  >
                    {ev.year}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-500">0{idx + 1}</span>
                </div>
                <textarea
                  value={ev.description}
                  onChange={(e) => {
                    const nextEvents = [...(slide.events || [])];
                    if (nextEvents[idx]) nextEvents[idx].description = e.target.value;
                    onUpdate(() => ({ events: nextEvents }));
                  }}
                  rows={2}
                  className="text-[9.5px] sm:text-xs text-neutral-200 font-light leading-snug bg-transparent border-0 outline-none resize-none hover:bg-white/[0.03] rounded p-0.5"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "comparison":
    case "two_column_text":
      return (
        <div className="space-y-2 sm:space-y-4 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-0.5 sm:p-1 w-full"
            placeholder="Comparison Title"
          />
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {/* Left Column */}
            <div 
              className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border shadow-lg space-y-1.5 sm:space-y-2.5"
              style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}DD` }}
            >
              <span className="text-[9.5px] sm:text-xs font-black uppercase tracking-wider block" style={{ color: colors.primary }}>
                Option A / Baseline
              </span>
              <div className="space-y-1 sm:space-y-1.5">
                {(slide.columns?.left || ["Legacy bottleneck", "Higher cost", "Slow response"]).map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[9.5px] sm:text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colors.primary }} />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const cols = { ...slide.columns } as any;
                        if (!cols.left) cols.left = [];
                        cols.left[i] = e.target.value;
                        onUpdate(() => ({ columns: cols }));
                      }}
                      className="bg-transparent border-0 outline-none text-neutral-200 text-[9.5px] sm:text-xs w-full hover:bg-white/[0.03] px-1 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div 
              className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border shadow-lg space-y-1.5 sm:space-y-2.5"
              style={{ borderColor: `${colors.primary}50`, backgroundColor: `${colors.primary}10` }}
            >
              <span className="text-[9.5px] sm:text-xs font-black uppercase tracking-wider block" style={{ color: colors.accent }}>
                Option B / AI Modern
              </span>
              <div className="space-y-1 sm:space-y-1.5">
                {(slide.columns?.right || ["Vector clustering", "Zero overhead", "Instant responses"]).map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[9.5px] sm:text-xs text-neutral-200 font-medium">
                    <CheckCircle2 size={12} className="shrink-0" style={{ color: colors.accent }} />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const cols = { ...slide.columns } as any;
                        if (!cols.right) cols.right = [];
                        cols.right[i] = e.target.value;
                        onUpdate(() => ({ columns: cols }));
                      }}
                      className="bg-transparent border-0 outline-none text-white text-[9.5px] sm:text-xs w-full hover:bg-white/[0.03] px-1 rounded font-semibold"
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
        <div className="space-y-2 sm:space-y-4 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-0.5 sm:p-1 w-full"
            placeholder="Pros & Cons Title"
          />
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-1 sm:space-y-1.5 shadow-lg">
              <span className="text-[9.5px] sm:text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> Advantages
              </span>
              {(slide.pros || ["High accuracy", "Cost reduction", "Infinite scale"]).map((p, i) => (
                <input
                  key={i}
                  type="text"
                  value={p}
                  onChange={(e) => {
                    const nextPros = [...(slide.pros || [])];
                    nextPros[i] = e.target.value;
                    onUpdate(() => ({ pros: nextPros }));
                  }}
                  className="bg-transparent border-0 outline-none text-neutral-200 text-[9.5px] sm:text-xs w-full hover:bg-white/[0.04] px-1 rounded"
                />
              ))}
            </div>

            <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-red-500/30 bg-red-950/20 space-y-1 sm:space-y-1.5 shadow-lg">
              <span className="text-[9.5px] sm:text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                <XCircle size={12} /> Challenges
              </span>
              {(slide.cons || ["Initial setup", "Token allocation", "Latency budget"]).map((c, i) => (
                <input
                  key={i}
                  type="text"
                  value={c}
                  onChange={(e) => {
                    const nextCons = [...(slide.cons || [])];
                    nextCons[i] = e.target.value;
                    onUpdate(() => ({ cons: nextCons }));
                  }}
                  className="bg-transparent border-0 outline-none text-neutral-200 text-[9.5px] sm:text-xs w-full hover:bg-white/[0.04] px-1 rounded"
                />
              ))}
            </div>
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="max-w-2xl mx-auto text-center space-y-2 sm:space-y-4 py-1 sm:py-3">
          <Quote size={22} className="mx-auto opacity-70" style={{ color: colors.primary }} />
          <textarea
            value={slide.quote_text || slide.title || ""}
            onChange={(e) => onUpdate(() => ({ quote_text: e.target.value }))}
            rows={3}
            className="w-full text-center text-xs sm:text-lg md:text-2xl font-serif italic text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-2xl p-1 resize-none leading-snug sm:leading-relaxed"
          />
          <div className="space-y-0.5">
            <input
              type="text"
              value={slide.author || "Author Name"}
              onChange={(e) => onUpdate(() => ({ author: e.target.value }))}
              className="text-[9.5px] sm:text-xs font-bold uppercase tracking-widest text-center bg-transparent border-0 outline-none w-full"
              style={{ color: colors.primary }}
            />
            <input
              type="text"
              value={slide.role || "Executive / Researcher"}
              onChange={(e) => onUpdate(() => ({ role: e.target.value }))}
              className="text-[8.5px] sm:text-[11px] text-neutral-400 text-center bg-transparent border-0 outline-none w-full"
            />
          </div>
        </div>
      );

    case "matrix_2x2":
      return (
        <div className="space-y-2 sm:space-y-4 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-0.5 sm:p-1 w-full"
            placeholder="Strategic Matrix Title"
          />
          <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
            {(slide.quadrants || ["Q1: Quick Wins", "Q2: Major Projects", "Q3: Fill-Ins", "Q4: Heavy Lifts"]).map((q, i) => (
              <div 
                key={i}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl border shadow-md flex items-center gap-1.5"
                style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}CC` }}
              >
                <span className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold font-mono" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
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
                  className="bg-transparent border-0 outline-none text-neutral-200 text-[9.5px] sm:text-xs w-full resize-none hover:bg-white/[0.03] p-0.5 rounded leading-tight"
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
        <div className="space-y-2 sm:space-y-4 text-left">
          <input
            type="text"
            value={slide.title || ""}
            onChange={(e) => onUpdate(() => ({ title: e.target.value }))}
            placeholder="Slide Heading"
            className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.03] rounded-xl p-0.5 sm:p-1 w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3">
            {(slide.bullets || ["First key insight or concept", "Second structural milestone", "Third actionable recommendation", "Fourth scaling objective"]).map((bullet, idx) => (
              <div 
                key={idx}
                className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border flex gap-2 items-start shadow-md transition-all hover:scale-[1.01]"
                style={{ borderColor: colors.border, backgroundColor: `${colors.cardBg}DD` }}
              >
                <span 
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border font-mono text-[8px] sm:text-[9.5px] font-black flex items-center justify-center shrink-0 mt-0.5"
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
                  className="text-[10px] sm:text-xs md:text-sm text-neutral-200 font-light leading-snug bg-transparent border-0 outline-none resize-none hover:bg-white/[0.03] rounded w-full p-0.5"
                />
              </div>
            ))}
          </div>
        </div>
      );
  }
}
