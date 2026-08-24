"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ChevronLeft, ChevronRight, Play, Download, LayoutGrid, X, 
  Loader2, Presentation, ArrowLeft, RefreshCw, FileText, Check, 
  MessageSquare, Edit3, Save, Maximize2, ShieldAlert, Sparkles, Image as ImageIcon,
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Wand2, Lightbulb, Zap, TrendingUp,
  Clock, Compass, Layers, CheckCircle2, XCircle, Quote, Code, BarChart3,
  Calendar, CheckSquare, Split, Palette, Eye, ExternalLink, Link2, Share2,
  Send, Eraser, Moon, Sun, Sliders, Sparkle, Upload, Globe, Fullscreen,
  Minimize2
} from "lucide-react";
import Link from "next/link";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PPT_THEMES_MAP, PPTThemeConfig } from "@/config/ppt-themes";
import { exportPresentationToPPTX, fetchImageAsBase64 } from "@/lib/presentationExporter";
import html2canvas from "html2canvas";

interface Slide {
  id: number | string;
  title: string;
  subtitle?: string;
  layout: string;
  bullets?: string[];
  columns?: { left: string[]; right: string[] };
  metric?: { value: string; label: string; description?: string };
  speakerNotes?: string;
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
  imageCandidates?: any[];
  sources?: string[];
  alt_text?: string;
  images?: string[];
  [key: string]: any;
}

interface PresentationData {
  _id?: string;
  slug: string;
  title: string;
  theme: string;
  slides: Slide[];
  [key: string]: any;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  toolAction?: string;
  timestamp: Date;
}

const SLIDE_LAYOUT_OPTIONS = [
  { id: "title", label: "Title Hero", icon: Presentation, desc: "Hero title & thesis banner" },
  { id: "image_left", label: "Visual Split Left", icon: Split, desc: "50% Image left, 50% Takeaways right" },
  { id: "image_right", label: "Visual Split Right", icon: Split, desc: "50% Takeaways left, 50% Image right" },
  { id: "bullets", label: "Bento Cards", icon: LayoutGrid, desc: "Structured key insight feature cards" },
  { id: "comparison", label: "Comparison VS", icon: Split, desc: "Side-by-side comparative column cards" },
  { id: "metric_callout", label: "Key Metrics & KPIs", icon: BarChart3, desc: "High-impact bold data benchmarks" },
  { id: "timeline", label: "Process Timeline", icon: Calendar, desc: "Sequential phase roadmap" },
  { id: "gallery_grid", label: "Visual Showcase", icon: ImageIcon, desc: "Multi-image showcase grid" },
  { id: "pros_cons", label: "Pros & Cons", icon: CheckSquare, desc: "Advantages vs Disadvantages grid" },
  { id: "quote", label: "Editorial Quote", icon: Quote, desc: "Executive quote with author attribution" },
  { id: "paragraph", label: "Deep-Dive Analysis", icon: FileText, desc: "Detailed analytical explanation" },
  { id: "matrix_2x2", label: "2x2 Matrix", icon: Layers, desc: "Four-quadrant strategic matrix" },
  { id: "conclusion", label: "Summary & Close", icon: CheckCircle2, desc: "Key takeaways and next steps" }
];

export default function AIPPTViewer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeRightTab, setActiveRightTab] = useState<"copilot" | "layouts" | "notes">("copilot");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState<"pptx" | "pdf" | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState("");
  const [exportSlideIndex, setExportSlideIndex] = useState<number | null>(null);
  const [exportSlidesData, setExportSlidesData] = useState<Slide[]>([]);
  const exportStageRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [isSlidePulsing, setIsSlidePulsing] = useState(false);

  // Conversational AI Agent State
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "👋 Welcome to your AI Presentation Studio! I can rewrite slides, add 3-KPI metrics, switch to comparison/timeline layouts, replace photography, or draft speaker scripts.",
      timestamp: new Date()
    }
  ]);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Visual Studio Modal State
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [visualCandidates, setVisualCandidates] = useState<any[]>([]);
  const [customImagePrompt, setCustomImagePrompt] = useState("");

  // Load presentation data
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
        console.warn("Backend presentation API fallback to starter slides.");
        const niceTitle = slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const mockSlides: Slide[] = [
          {
            id: 1,
            title: niceTitle,
            subtitle: "Strategic Architecture, Core Mechanics & Deployment Roadmap",
            layout: "title",
            author: "Paperxify Presentation Studio",
            speakerNotes: "Welcome everyone. Today we are presenting " + niceTitle + "."
          },
          {
            id: 2,
            title: "Core Mechanics & Architectural Foundation",
            layout: "image_left",
            image_url: `https://image.pollinations.ai/prompt/${encodeURIComponent("technology architecture network graphic 16:9 modern")}&width=1280&height=720&nologo=true`,
            bullets: [
              "Semantic Layering: Context-aware document partitioning preserves schema continuity.",
              "Vector Caching: HNSW indexing accelerates sub-millisecond retrieval by 3.8x.",
              "Real-time Feedback: Telemetry triggers automated healing cycles."
            ],
            speakerNotes: "This slide outlines the primary architecture pillars."
          },
          {
            id: 3,
            title: "Quantitative Impact & KPI Benchmarks",
            layout: "metric_callout",
            metrics: [
              { value: "99.8%", label: "Accuracy Target" },
              { value: "4.2x", label: "Throughput Multiplier" },
              { value: "< 18ms", label: "Latency Benchmark" }
            ],
            speakerNotes: "Key metrics demonstrating performance gains."
          }
        ];

        setPresentation({
          _id: "demo-id",
          slug,
          title: niceTitle,
          theme: "sunset-orange",
          slides: mockSlides
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
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.min((presentation?.slides.length || 1) - 1, prev + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "f" || e.key === "F") {
        setIsFullscreen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentation]);

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

  // Helper to update current active slide
  const updateCurrentSlide = useCallback((updater: (current: Slide) => Partial<Slide>) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      const updatedSlides = [...prev.slides];
      const target = updatedSlides[activeSlideIndex];
      if (!target) return prev;
      updatedSlides[activeSlideIndex] = { ...target, ...updater(target) };
      return { ...prev, slides: updatedSlides };
    });
  }, [activeSlideIndex]);

  // Slide Deck operations
  const handleAddSlide = () => {
    if (!presentation) return;
    const newSlide: Slide = {
      id: Date.now(),
      title: "New Strategic Slide",
      subtitle: "Click to edit key description and takeaways",
      layout: "image_left",
      image_url: `https://image.pollinations.ai/prompt/${encodeURIComponent("clean corporate presentation graphic 16:9 modern")}&width=1280&height=720&nologo=true&seed=${Date.now() % 9999}`,
      bullets: [
        "First foundational premise and actionable insight.",
        "Second quantitative benchmark or key implementation step."
      ],
      speakerNotes: "Speaker notes for this new slide."
    };
    const updated = [...presentation.slides];
    updated.splice(activeSlideIndex + 1, 0, newSlide);
    setPresentation({ ...presentation, slides: updated });
    setActiveSlideIndex(activeSlideIndex + 1);
    toast.success("New slide added!");
  };

  const handleDeleteSlide = (idx: number) => {
    if (!presentation || presentation.slides.length <= 1) {
      toast.error("Presentation must have at least 1 slide.");
      return;
    }
    const updated = presentation.slides.filter((_, i) => i !== idx);
    setPresentation({ ...presentation, slides: updated });
    setActiveSlideIndex((prev) => Math.min(updated.length - 1, prev));
    toast.success("Slide deleted.");
  };

  const handleMoveSlide = (idx: number, direction: "up" | "down") => {
    if (!presentation) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= presentation.slides.length) return;
    const updated = [...presentation.slides];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPresentation({ ...presentation, slides: updated });
    setActiveSlideIndex(targetIdx);
  };

  // Image candidates helpers
  const handleOpenImagePicker = async () => {
    const active = presentation?.slides?.[activeSlideIndex];
    if (!active) return;
    setIsImagePickerOpen(true);
    if (active.imageCandidates && active.imageCandidates.length > 0) {
      setVisualCandidates(active.imageCandidates);
    } else {
      handleRefreshVisualCandidates();
    }
  };

  const handleRefreshVisualCandidates = async () => {
    const active = presentation?.slides?.[activeSlideIndex];
    if (!active) return;
    setIsGeneratingVisuals(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post("/presentation/image-candidates", {
        slideTitle: active.title,
        slideDesc: active.subtitle || active.content || "",
        layout: active.layout || "image_left",
        topic: presentation?.title || "",
        slideIndex: activeSlideIndex
      }, { headers: { 'Auth': token } });

      if (res.data?.success && res.data?.candidates) {
        setVisualCandidates(res.data.candidates);
        updateCurrentSlide(() => ({ imageCandidates: res.data.candidates }));
        toast.success("Generated 4 AI visual choices!");
      }
    } catch (e) {
      toast.error("Could not generate visual candidates");
    } finally {
      setIsGeneratingVisuals(false);
    }
  };

  const handleSelectVisualCandidate = (cand: any) => {
    updateCurrentSlide(() => ({
      image_url: cand.url,
      alt_text: cand.title
    }));
    setIsImagePickerOpen(false);
    toast.success(`Applied ${cand.style || "selected"} visual!`);
  };

  const handleGenerateCustomImage = () => {
    if (!customImagePrompt.trim()) return;
    const cleanPrompt = customImagePrompt.trim();
    const seed = Date.now() % 99999;
    const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ", 16:9 widescreen, professional presentation photography, 8k uhd")}&width=1280&height=720&nologo=true&seed=${seed}`;
    
    updateCurrentSlide(() => ({
      image_url: aiUrl,
      alt_text: cleanPrompt
    }));
    setIsImagePickerOpen(false);
    setCustomImagePrompt("");
    toast.success("Generated & applied custom visual!");
  };

  // Auto-scroll chat on message updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isEnhancing]);

  // AI Co-Pilot Agent Action (Gamma Grade)
  const handleSendCopilotPrompt = async (presetPrompt?: string) => {
    const query = presetPrompt || copilotPrompt;
    if (!query.trim() || !presentation) return;

    const currentSlide = presentation.slides[activeSlideIndex];
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date()
    };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetPrompt) setCopilotPrompt("");
    setIsEnhancing(true);

    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post("/presentation/agent-action", {
        action: "chat_agent",
        slide: currentSlide,
        slides: presentation.slides,
        activeSlideIndex: activeSlideIndex,
        instruction: query,
        presentationTitle: presentation.title,
        theme: presentation.theme
      }, { headers: { 'Auth': token } });

      if (res.data?.success) {
        const tool = res.data.tool;
        const msg = res.data.message || "Updated slide based on your instruction.";

        if ((tool === "regenerate_slide" || tool === "search_facts") && res.data.slide) {
          updateCurrentSlide(() => res.data.slide);
          setIsSlidePulsing(true);
          setTimeout(() => setIsSlidePulsing(false), 1800);
        } else if (tool === "create_slide" && res.data.slide) {
          const updated = [...presentation.slides];
          updated.splice(activeSlideIndex + 1, 0, res.data.slide);
          setPresentation({ ...presentation, slides: updated });
          setActiveSlideIndex(activeSlideIndex + 1);
          setIsSlidePulsing(true);
          setTimeout(() => setIsSlidePulsing(false), 1800);
        } else if (tool === "change_theme" && res.data.themeId) {
          setPresentation({ ...presentation, theme: res.data.themeId });
        } else if (tool === "replace_image" && res.data.imageUrl) {
          updateCurrentSlide(() => ({ image_url: res.data.imageUrl }));
          setIsSlidePulsing(true);
          setTimeout(() => setIsSlidePulsing(false), 1800);
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "agent",
            text: msg,
            toolAction: tool,
            timestamp: new Date()
          }
        ]);
        toast.success("AI Copilot updated slide!");
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: "I encountered an issue processing that instruction. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsEnhancing(false);
    }
  };

  // 1:1 Pixel-Perfect HD Canvas Slide Exporter (PDF & PowerPoint) with Linear Progress HUD
  const handleExport = async (format: "pptx" | "pdf") => {
    if (!presentation) return;
    setIsExporting(format);
    setExportProgress(5);
    setExportStatusText("Inlining high-resolution photography & diagrams...");
    try {
      // Step 1: Pre-convert all images to Base64 (using direct fetch + server proxy fallback)
      const inlinedSlides: Slide[] = await Promise.all(
        presentation.slides.map(async (s, i) => {
          if (s.image_url) {
            const b64 = await fetchImageAsBase64(s.image_url);
            setExportProgress(Math.round(5 + ((i + 1) / presentation.slides.length) * 20));
            return { ...s, image_url: b64 || s.image_url };
          }
          return s;
        })
      );

      setExportSlidesData(inlinedSlides);
      setExportProgress(25);
      setExportStatusText("Initializing widescreen graphics pipeline...");

      let pptxInstance: any = null;
      let pdfInstance: any = null;

      if (format === "pptx") {
        const pptxgenModule = await import("pptxgenjs");
        const PptxClass = pptxgenModule.default || pptxgenModule;
        pptxInstance = new (PptxClass as any)();
        pptxInstance.layout = "LAYOUT_16x9";
        pptxInstance.title = presentation.title || "Presentation";
      } else {
        const jsPDFModule = await import("jspdf");
        const jsPDFClass = jsPDFModule.default || (jsPDFModule as any).jsPDF || jsPDFModule;
        pdfInstance = new (jsPDFClass as any)({
          orientation: "landscape",
          unit: "mm",
          format: [297, 167.0625]
        });
      }

      const totalSlides = inlinedSlides.length;
      for (let i = 0; i < totalSlides; i++) {
        setExportSlideIndex(i);
        const currentPct = Math.round(25 + ((i + 1) / totalSlides) * 65);
        setExportProgress(currentPct);
        setExportStatusText(`Rendering slide ${i + 1} of ${totalSlides} at 2x Retina HD...`);
        
        // Wait for React DOM to mount
        await new Promise((r) => setTimeout(r, 120));

        if (exportStageRef.current) {
          // Preload and decode all images in the stage before taking snapshot
          const imgs = Array.from(exportStageRef.current.querySelectorAll("img"));
          await Promise.all(
            imgs.map(async (img) => {
              if (!img.complete) {
                await new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve;
                  setTimeout(resolve, 800);
                });
              }
              if (img.decode) {
                try { await img.decode(); } catch {}
              }
            })
          );

          // Allow DOM repaint
          await new Promise((r) => setTimeout(r, 80));

          const canvas = await html2canvas(exportStageRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: activeTheme.colors.bg || "#060608",
            logging: false
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);

          if (format === "pptx") {
            const slideObj = pptxInstance.addSlide();
            slideObj.addImage({
              data: imgData,
              x: 0,
              y: 0,
              w: 10,
              h: 5.625
            });
            if (inlinedSlides[i].speakerNotes) {
              slideObj.addNotes(inlinedSlides[i].speakerNotes);
            }
          } else {
            if (i > 0) pdfInstance.addPage([297, 167.0625], "landscape");
            pdfInstance.addImage(imgData, "JPEG", 0, 0, 297, 167.0625);
          }
        }
      }

      setExportProgress(95);
      setExportStatusText(`Finalizing & packaging ${format.toUpperCase()} deck...`);
      await new Promise((r) => setTimeout(r, 200));

      setExportSlideIndex(null);
      const cleanTitle = (presentation.title || "presentation").replace(/[^\w\s.-]/gi, "_").substring(0, 50);

      if (format === "pptx") {
        await pptxInstance.writeFile({ fileName: `${cleanTitle}.pptx` });
      } else {
        pdfInstance.save(`${cleanTitle}.pdf`);
      }

      setExportProgress(100);
      setExportStatusText("Export complete! Starting download...");
      toast.success(`1:1 Pixel-Perfect ${format.toUpperCase()} downloaded successfully!`);
      await new Promise((r) => setTimeout(r, 400));
    } catch (err: any) {
      console.error("Client export error:", err);
      toast.error(`Export failed: ${err.message || "Please try again"}`);
    } finally {
      setIsExporting(null);
      setExportSlideIndex(null);
      setExportProgress(0);
      setExportStatusText("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center text-white px-4 text-center">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={36} />
        <p className="font-mono text-xs text-neutral-400">Loading Presentation Studio...</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center text-white px-4 text-center">
        <ShieldAlert className="text-orange-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-4">Presentation Not Found</h2>
        <Link href="/presentation-generator" className="px-5 py-2.5 bg-orange-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl">
          Return to Presentations
        </Link>
      </div>
    );
  }

  const slides = presentation.slides;
  const currentSlide = slides[activeSlideIndex] || slides[0];
  const activeThemeId = presentation.theme || "sunset-orange";
  const activeTheme = PPT_THEMES_MAP[activeThemeId] || PPT_THEMES_MAP["sunset-orange"];
  const publicShareUrl = typeof window !== 'undefined' ? `${window.location.origin}/presentation-generator/${slug}` : `https://paperxify.com/presentation-generator/${slug}`;

  return (
    <div className="h-screen bg-[#060608] text-white flex flex-col font-sans select-none relative overflow-hidden pt-14">
      
      {/* ─── 1. TOP EXECUTIVE HEADER BAR ─── */}
      <header className="fixed top-0 inset-x-0 h-14 bg-[#0a0a0d]/95 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          <Link 
            href="/presentation-generator" 
            className="p-2 bg-neutral-900 border border-white/[0.08] hover:border-orange-500/40 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer shrink-0"
            title="Back to Presentations"
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={presentation.title}
              onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
              className="font-bold text-sm tracking-tight text-white bg-transparent border-0 outline-none hover:bg-white/[0.04] px-1 py-0.5 rounded-lg transition-colors w-full max-w-md truncate"
              placeholder="Presentation Title"
            />
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Theme Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer transition-all outline-none">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTheme.colors.primary }} />
              <span className="hidden sm:inline">{activeTheme.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#111115] border-white/10 text-white rounded-2xl p-2 w-56 max-h-72 overflow-y-auto custom-scrollbar">
              {Object.values(PPT_THEMES_MAP).map((th) => (
                <DropdownMenuItem
                  key={th.id}
                  onClick={() => setPresentation({ ...presentation, theme: th.id })}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.08] cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: th.colors.primary }} />
                    <span className="font-semibold">{th.name}</span>
                  </div>
                  {activeThemeId === th.id && <Check size={12} className="text-orange-400" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen Present */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            title="Present Fullscreen (F)"
          >
            <Play size={13} fill="currentColor" />
            <span className="hidden sm:inline">Present</span>
          </button>

          {/* Share Modal Trigger */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Direct One-Click PPTX Export Button */}
          <button
            onClick={() => handleExport("pptx")}
            disabled={isExporting !== null}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            title="Download PowerPoint Presentation (.pptx)"
          >
            {isExporting === "pptx" ? <Loader2 size={13} className="animate-spin" /> : <Presentation size={13} />}
            <span>Export PPTX</span>
          </button>

          {/* Export Dropdown for PDF & other options */}
          <DropdownMenu>
            <DropdownMenuTrigger 
              disabled={isExporting !== null}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer outline-none"
              title="More export options (PDF)"
            >
              <Download size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#111115] border-white/10 text-white rounded-2xl p-1.5 w-48 shadow-2xl">
              <DropdownMenuItem 
                onClick={() => handleExport("pptx")}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] cursor-pointer text-xs font-bold"
              >
                <Presentation size={14} className="text-orange-400" />
                <span>PowerPoint (.pptx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] cursor-pointer text-xs font-bold"
              >
                <FileText size={14} className="text-red-400" />
                <span>Adobe PDF (.pdf)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ─── 2. MAIN 3-PANEL WORKSPACE ─── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: SLIDE DECK NAVIGATOR RAIL */}
        <aside className="w-56 bg-[#08080a] border-r border-white/[0.06] flex flex-col z-20 shrink-0">
          <div className="p-3 border-b border-white/[0.06] flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Slide Deck ({slides.length})</span>
            <button
              onClick={handleAddSlide}
              className="p-1 rounded-lg bg-white/[0.05] hover:bg-orange-500 hover:text-black text-neutral-300 transition-all cursor-pointer"
              title="Add New Slide"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Thumbnails list */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {slides.map((s, idx) => {
              const isActive = activeSlideIndex === idx;
              return (
                <div
                  key={s.id || idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={cn(
                    "group relative rounded-xl p-2 transition-all cursor-pointer border flex flex-col gap-1.5",
                    isActive 
                      ? "bg-orange-500/10 border-orange-500 shadow-md ring-1 ring-orange-500/30" 
                      : "bg-[#0d0d11] border-white/[0.05] hover:border-white/20 opacity-70 hover:opacity-100"
                  )}
                >
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="font-bold text-neutral-400">{idx + 1}</span>
                    <span className="text-[8px] uppercase tracking-wider text-neutral-500">{s.layout.replace("_", " ")}</span>
                    
                    {/* Hover actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, "up");
                        }}
                        disabled={idx === 0}
                        className="p-0.5 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, "down");
                        }}
                        disabled={idx === slides.length - 1}
                        className="p-0.5 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(idx);
                        }}
                        className="p-0.5 text-neutral-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Real-time Rich Thumbnail Preview */}
                  <SlideThumbnailPreview slide={s} theme={activeTheme} />
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER PANEL: PRISTINE 16:9 PRESENTATION CANVAS */}
        <main className="flex-1 bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
          
          {/* Main Slide Card Container */}
          <div 
            className={cn(
              "relative w-full max-w-4xl min-h-[480px] max-h-[85vh] aspect-[16/9] rounded-3xl border shadow-2xl p-6 sm:p-10 flex flex-col justify-center overflow-hidden transition-all duration-500",
              isSlidePulsing && "ring-2 ring-orange-500 shadow-[0_0_70px_rgba(249,115,22,0.4)] scale-[1.008]"
            )}
            style={{
              backgroundColor: activeTheme.colors.bg,
              borderColor: activeTheme.colors.border || "rgba(255,255,255,0.08)",
              fontFamily: activeTheme.fontFamily
            }}
          >
            {/* Ambient Background Gradient Accent */}
            <div 
              className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeTheme.colors.primary }}
            />

            {/* Slide WYSIWYG Editable Content Area */}
            <div className="flex-1 flex flex-col justify-center min-h-0 z-10 overflow-hidden">
              <SlideEditableCanvas 
                slide={currentSlide}
                theme={activeTheme}
                onUpdate={updateCurrentSlide}
                onOpenImagePicker={handleOpenImagePicker}
              />
            </div>
          </div>

          {/* Bottom Floating Slide Counter and Navigation Bar */}
          <div className="mt-4 flex items-center gap-3 z-10">
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-white disabled:opacity-20 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs font-mono font-bold text-neutral-400 px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06]">
              Slide {activeSlideIndex + 1} of {slides.length}
            </span>
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === slides.length - 1}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-white disabled:opacity-20 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </main>

        {/* RIGHT PANEL: AI CO-PILOT & SLIDE INSPECTOR */}
        <aside className="w-80 bg-[#08080a] border-l border-white/[0.06] flex flex-col z-20 shrink-0">
          
          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-white/[0.06] p-1.5 gap-1 bg-black/40">
            <button
              onClick={() => setActiveRightTab("copilot")}
              className={cn(
                "py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1",
                activeRightTab === "copilot" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "text-neutral-400 hover:text-white"
              )}
            >
              <Wand2 size={11} /> Co-Pilot
            </button>
            <button
              onClick={() => setActiveRightTab("layouts")}
              className={cn(
                "py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1",
                activeRightTab === "layouts" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "text-neutral-400 hover:text-white"
              )}
            >
              <LayoutGrid size={11} /> Layout
            </button>
            <button
              onClick={() => setActiveRightTab("notes")}
              className={cn(
                "py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1",
                activeRightTab === "notes" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "text-neutral-400 hover:text-white"
              )}
            >
              <FileText size={11} /> Notes
            </button>
          </div>

          {/* TAB CONTENT: 1. AI CO-PILOT (GAMMA GRADE) */}
          {activeRightTab === "copilot" && (
            <div className="flex-1 flex flex-col p-3.5 space-y-3 overflow-hidden">
              
              {/* Quick AI Actions Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Quick AI Actions</span>
                  <span className="text-[9px] font-mono text-orange-400 font-bold">Slide {activeSlideIndex + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleSendCopilotPrompt("Rewrite and sharpen this slide for maximum clarity, punch, and visual hierarchy.")}
                    disabled={isEnhancing}
                    className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/[0.08] hover:border-orange-500/40 text-left text-[9.5px] font-bold text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <span>🪄</span> Rewrite & Polish
                  </button>
                  <button
                    onClick={() => handleSendCopilotPrompt("Transform this slide into a 3-metric KPI counter with real quantitative data benchmarks.")}
                    disabled={isEnhancing}
                    className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/[0.08] hover:border-orange-500/40 text-left text-[9.5px] font-bold text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <span>📊</span> 3-Metric KPIs
                  </button>
                  <button
                    onClick={() => handleSendCopilotPrompt("Convert this slide into a side-by-side comparative analysis layout.")}
                    disabled={isEnhancing}
                    className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/[0.08] hover:border-orange-500/40 text-left text-[9.5px] font-bold text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <span>⚖️</span> Comparison
                  </button>
                  <button
                    onClick={() => handleSendCopilotPrompt("Convert this slide into a sequential process timeline roadmap.")}
                    disabled={isEnhancing}
                    className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/[0.08] hover:border-orange-500/40 text-left text-[9.5px] font-bold text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <span>🗺️</span> Timeline
                  </button>
                  <button
                    onClick={() => handleSendCopilotPrompt("Find and apply a cinematic, high-resolution photography visual for this slide topic.")}
                    disabled={isEnhancing}
                    className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/[0.08] hover:border-orange-500/40 text-left text-[9.5px] font-bold text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <span>🖼️</span> Replace Visual
                  </button>
                  <button
                    onClick={() => handleSendCopilotPrompt("Add the next logical slide in this narrative with high-contrast copy.")}
                    disabled={isEnhancing}
                    className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/[0.08] hover:border-orange-500/40 text-left text-[9.5px] font-bold text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <span>➕</span> Insert Next Slide
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-3 rounded-2xl max-w-[92%] space-y-1.5 shadow-md transition-all",
                      msg.sender === "user" 
                        ? "ml-auto bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-br-none" 
                        : "bg-[#121216] border border-white/[0.08] text-neutral-200 rounded-bl-none"
                    )}
                  >
                    <p className="text-[11px] leading-relaxed">{msg.text}</p>
                    {msg.toolAction && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[8.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold">
                          ✓ Action: {msg.toolAction.replace("_", " ")}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {isEnhancing && (
                  <div className="p-3 rounded-2xl bg-[#121216] border border-orange-500/30 text-orange-400 text-[11px] flex items-center gap-2 shadow-lg animate-pulse">
                    <Loader2 size={14} className="animate-spin text-orange-400" />
                    <span>AI Copilot is optimizing slide #{activeSlideIndex + 1}...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Prompt Input Box */}
              <div className="relative pt-1">
                <textarea
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendCopilotPrompt();
                    }
                  }}
                  placeholder="Ask Copilot (e.g. 'Add 3 stats', 'Make it comparison', 'Rewrite')..."
                  rows={2}
                  className="w-full bg-[#121216] border border-white/10 rounded-2xl p-3 pr-10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-orange-500/50 resize-none shadow-inner"
                />
                <button
                  onClick={() => handleSendCopilotPrompt()}
                  disabled={!copilotPrompt.trim() || isEnhancing}
                  className="absolute right-2.5 bottom-3.5 p-1.5 rounded-xl bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-20 transition-all cursor-pointer shadow-md"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. LAYOUT SWITCHER */}
          {activeRightTab === "layouts" && (
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scrollbar">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Switch Slide Layout</span>
              <div className="grid grid-cols-1 gap-2">
                {SLIDE_LAYOUT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = currentSlide.layout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => updateCurrentSlide(() => ({ layout: opt.id }))}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer",
                        isSelected 
                          ? "bg-orange-500/15 border-orange-500 text-white" 
                          : "bg-[#111115] border-white/[0.06] hover:border-white/20 text-neutral-300"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", isSelected ? "bg-orange-500 text-black" : "bg-white/[0.05] text-orange-400")}>
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-tight">{opt.label}</p>
                        <p className="text-[9.5px] text-neutral-500 truncate mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. PRESENTER NOTES */}
          {activeRightTab === "notes" && (
            <div className="flex-1 p-3.5 space-y-3 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Presenter Teleprompter</span>
                <button
                  onClick={() => handleSendCopilotPrompt("Draft a natural, engaging presenter talking script for this slide.")}
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
                rows={16}
                className="w-full flex-1 bg-[#121216] border border-white/10 rounded-2xl p-3.5 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none focus:border-orange-500/50 resize-none leading-relaxed custom-scrollbar"
              />
            </div>
          )}
        </aside>

      </div>

      {/* ─── 3. FULLSCREEN PRESENTATION MODE MODAL ─── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 select-none">
          <div className="relative w-full max-w-5xl aspect-[16/9] rounded-3xl border border-white/10 p-10 flex flex-col justify-between shadow-2xl overflow-hidden"
            style={{
              backgroundColor: activeTheme.colors.bg,
              borderColor: activeTheme.colors.border,
              fontFamily: activeTheme.fontFamily
            }}
          >
            {/* Slide WYSIWYG Editable Content Area */}
            <div className="flex-1 flex flex-col justify-center min-h-0 z-10 overflow-hidden">
              <SlideEditableCanvas 
                slide={currentSlide}
                theme={activeTheme}
                onUpdate={updateCurrentSlide}
              />
            </div>
          </div>

          {/* Presenter Bottom Floating Controller */}
          <div className="fixed bottom-6 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/15 shadow-2xl">
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-mono font-bold text-white px-2">
              {activeSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === slides.length - 1}
              className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
            <div className="h-4 w-px bg-white/20 mx-1" />
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              title="Exit Fullscreen"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── 4. VISUAL CHOICES STUDIO MODAL ─── */}
      <AnimatePresence>
        {isImagePickerOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div onClick={() => setIsImagePickerOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0e0e12] border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <ImageIcon size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Slide Visual Studio</h3>
                    <p className="text-[10px] text-neutral-400 font-light">Select an AI-generated candidate or type a custom prompt.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImagePickerOpen(false)}
                  className="p-2 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Custom Prompt Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateCustomImage()}
                  placeholder="Describe custom image to generate with AI..."
                  className="flex-1 bg-[#141418] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-orange-500/50"
                />
                <button
                  onClick={handleGenerateCustomImage}
                  disabled={!customImagePrompt.trim()}
                  className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-30 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Sparkles size={12} /> Generate
                </button>
              </div>

              {/* Candidates Grid */}
              <div className="grid grid-cols-2 gap-3.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {visualCandidates.map((cand, idx) => (
                  <div
                    key={cand.id || idx}
                    onClick={() => handleSelectVisualCandidate(cand)}
                    className="group/item relative rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/60 p-2 bg-black/50 hover:bg-black/80 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10">
                      <img src={cand.url} alt="" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-orange-400 border border-orange-500/40">
                        {cand.score || 92}/100 Match
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[9px] font-bold text-white border border-white/20">
                        {cand.style || "Photorealistic"}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white truncate">{cand.title || "Visual Option"}</h4>
                      <p className="text-[9px] text-neutral-400 line-clamp-1">{cand.description || "16:9 AI Visual"}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVisualCandidate(cand);
                      }}
                      className="w-full py-1.5 rounded-lg bg-white/[0.05] group-hover/item:bg-orange-500 group-hover/item:text-black text-neutral-300 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check size={11} /> Select Visual
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
                <span className="text-[10px] font-mono text-neutral-500">All visuals are generated in 16:9 widescreen format</span>
                <button
                  onClick={handleRefreshVisualCandidates}
                  disabled={isGeneratingVisuals}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-orange-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isGeneratingVisuals ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Refresh 4 AI Choices
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 5. SHARE MODAL ─── */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div onClick={() => setIsShareModalOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0e0e12] border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 size={16} className="text-orange-400" /> Share Presentation
                </h3>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-black/60 border border-white/[0.08] rounded-2xl space-y-2">
                <div className="p-3 bg-white rounded-xl shadow-inner">
                  <QRCode value={publicShareUrl} size={120} />
                </div>
                <span className="text-[9.5px] text-neutral-400 font-mono">Scan to view deck on mobile</span>
              </div>

              {/* Public Link */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Public Deck URL</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={publicShareUrl}
                    className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono outline-none truncate"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicShareUrl);
                      setCopiedLink(true);
                      toast.success("Deck link copied!");
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 6. 1:1 PIXEL-PERFECT LIVE DOM EXPORT STAGE ─── */}
      {exportSlideIndex !== null && exportSlidesData[exportSlideIndex] && (
        <div className="fixed -left-[9999px] top-0 z-[-9999] pointer-events-none">
          <div
            ref={exportStageRef}
            className="w-[1280px] h-[720px] aspect-[16/9] p-12 flex flex-col justify-center overflow-hidden relative"
            style={{
              backgroundColor: activeTheme.colors.bg,
              fontFamily: activeTheme.fontFamily
            }}
          >
            {/* Ambient Background Gradient Accent */}
            <div 
              className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeTheme.colors.primary }}
            />

            {/* Slide Pure Typography & Layout Static View for 100% Crisp PDF Rendering */}
            <div className="flex-1 flex flex-col justify-center min-h-0 z-10 overflow-hidden">
              <SlideStaticView 
                slide={exportSlidesData[exportSlideIndex]}
                theme={activeTheme}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. PROFESSIONAL LINEAR EXPORT PROGRESS HUD MODAL ─── */}
      <AnimatePresence>
        {isExporting && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-[#0e0e13]/95 border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-5 overflow-hidden"
              style={{ boxShadow: "0 25px 70px -15px rgba(0,0,0,0.95), 0 0 50px rgba(249,115,22,0.2)" }}
            >
              {/* Top ambient glow */}
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  {isExporting === "pptx" ? <Presentation size={24} className="animate-pulse" /> : <FileText size={24} className="animate-pulse" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      Exporting {isExporting === "pptx" ? "PowerPoint (.pptx)" : "Adobe PDF (.pdf)"}
                    </h3>
                    <span className="text-sm font-mono font-black text-orange-400">
                      {exportProgress}%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-light truncate mt-0.5">
                    {exportStatusText || "Generating presentation assets..."}
                  </p>
                </div>
              </div>

              {/* Live Slide Stream Card */}
              {exportSlideIndex !== null && exportSlidesData[exportSlideIndex] && (
                <div className="rounded-2xl border border-white/10 p-3 bg-black/60 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping inline-block" />
                      Live Canvas Stream
                    </span>
                    <span>Slide {exportSlideIndex + 1} of {exportSlidesData.length}</span>
                  </div>
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-[#060608] relative">
                    <SlideThumbnailPreview slide={exportSlidesData[exportSlideIndex]} theme={activeTheme} />
                  </div>
                </div>
              )}

              {/* Linear Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress}%` }}
                    transition={{ ease: "easeOut", duration: 0.3 }}
                    style={{ boxShadow: "0 0 14px rgba(249,115,22,0.7)" }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 px-0.5">
                  <span>100% Studio Visual Parity</span>
                  <span>{exportSlideIndex !== null ? `Processing Slide ${(exportSlideIndex + 1)} / ${exportSlidesData.length}` : "Preparing..."}</span>
                </div>
              </div>

              {/* 3-Stage Process Checklist */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06]">
                <div className={cn("p-2 rounded-xl border text-center space-y-1 transition-all", exportProgress >= 25 ? "bg-orange-500/10 border-orange-500/30 text-orange-300" : "bg-white/[0.02] border-white/5 text-neutral-500")}>
                  <p className="text-[9.5px] font-mono uppercase font-bold">1. Inlining Media</p>
                  <span className="text-[10px] block">{exportProgress >= 25 ? "✓ Complete" : "Pending"}</span>
                </div>
                <div className={cn("p-2 rounded-xl border text-center space-y-1 transition-all", exportProgress >= 85 ? "bg-orange-500/10 border-orange-500/30 text-orange-300" : exportProgress >= 25 ? "bg-white/[0.05] border-white/10 text-white" : "bg-white/[0.02] border-white/5 text-neutral-500")}>
                  <p className="text-[9.5px] font-mono uppercase font-bold">2. 2x HD Sampling</p>
                  <span className="text-[10px] block">{exportProgress >= 85 ? "✓ Complete" : exportProgress >= 25 ? "Sampling..." : "Pending"}</span>
                </div>
                <div className={cn("p-2 rounded-xl border text-center space-y-1 transition-all", exportProgress >= 100 ? "bg-orange-500/10 border-orange-500/30 text-orange-300" : "bg-white/[0.02] border-white/5 text-neutral-500")}>
                  <p className="text-[9.5px] font-mono uppercase font-bold">3. Direct Download</p>
                  <span className="text-[10px] block">{exportProgress >= 100 ? "✓ Downloaded" : "Packaging"}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ─── SUB-COMPONENT: REAL-TIME RICH SLIDE THUMBNAIL PREVIEW ───
function SlideThumbnailPreview({ slide, theme }: { slide: Slide; theme: PPTThemeConfig }) {
  const colors = theme.colors;

  switch (slide.layout) {
    case "title":
      return (
        <div 
          className="aspect-[16/9] w-full rounded-lg border p-2 flex flex-col justify-center items-center text-center relative overflow-hidden transition-all shadow-inner"
          style={{ backgroundColor: colors.bg, borderColor: colors.border || "rgba(255,255,255,0.08)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: colors.primary }} />
          <p className="text-[7.5px] font-black text-white line-clamp-2 leading-tight drop-shadow">{slide.title || "Untitled Presentation"}</p>
          {slide.subtitle && <p className="text-[5.5px] text-neutral-400 line-clamp-1 mt-0.5">{slide.subtitle}</p>}
        </div>
      );

    case "image_left":
      return (
        <div 
          className="aspect-[16/9] w-full rounded-lg border p-1.5 grid grid-cols-2 gap-1.5 items-center relative overflow-hidden transition-all shadow-inner"
          style={{ backgroundColor: colors.bg, borderColor: colors.border || "rgba(255,255,255,0.08)" }}
        >
          <div className="w-full h-full rounded bg-neutral-800 overflow-hidden relative">
            <img 
              src={slide.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"} 
              alt="" 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"; }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-0.5 overflow-hidden">
            <p className="text-[6.5px] font-bold text-white line-clamp-1 leading-tight">{slide.title || "Topic"}</p>
            <div className="space-y-0.5">
              <div className="h-0.5 w-full bg-white/20 rounded" />
              <div className="h-0.5 w-3/4 bg-white/10 rounded" />
              <div className="h-0.5 w-1/2 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      );

    case "image_right":
      return (
        <div 
          className="aspect-[16/9] w-full rounded-lg border p-1.5 grid grid-cols-2 gap-1.5 items-center relative overflow-hidden transition-all shadow-inner"
          style={{ backgroundColor: colors.bg, borderColor: colors.border || "rgba(255,255,255,0.08)" }}
        >
          <div className="flex flex-col justify-center gap-0.5 overflow-hidden">
            <p className="text-[6.5px] font-bold text-white line-clamp-1 leading-tight">{slide.title || "Topic"}</p>
            <div className="space-y-0.5">
              <div className="h-0.5 w-full bg-white/20 rounded" />
              <div className="h-0.5 w-3/4 bg-white/10 rounded" />
              <div className="h-0.5 w-1/2 bg-white/10 rounded" />
            </div>
          </div>
          <div className="w-full h-full rounded bg-neutral-800 overflow-hidden relative">
            <img 
              src={slide.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"} 
              alt="" 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"; }}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      );

    case "metric_callout":
      return (
        <div 
          className="aspect-[16/9] w-full rounded-lg border p-1.5 flex flex-col justify-between relative overflow-hidden transition-all shadow-inner"
          style={{ backgroundColor: colors.bg, borderColor: colors.border || "rgba(255,255,255,0.08)" }}
        >
          <p className="text-[6.5px] font-bold text-white line-clamp-1 text-center">{slide.title || "Metrics"}</p>
          <div className="grid grid-cols-3 gap-1 my-auto">
            {(slide.metrics?.slice(0, 3) || [{ value: "99%" }, { value: "4x" }, { value: "<15ms" }]).map((m, i) => (
              <div key={i} className="p-0.5 rounded bg-black/40 border border-white/10 text-center">
                <span className="text-[6px] font-black block" style={{ color: i === 0 ? colors.primary : colors.accent }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "comparison":
      return (
        <div 
          className="aspect-[16/9] w-full rounded-lg border p-1.5 flex flex-col justify-between relative overflow-hidden transition-all shadow-inner"
          style={{ backgroundColor: colors.bg, borderColor: colors.border || "rgba(255,255,255,0.08)" }}
        >
          <p className="text-[6.5px] font-bold text-white line-clamp-1">{slide.title || "Comparison"}</p>
          <div className="grid grid-cols-2 gap-1 my-auto">
            <div className="p-1 rounded bg-black/40 border border-white/10 space-y-0.5">
              <span className="text-[4.5px] font-bold text-neutral-400 uppercase block">Baseline</span>
              <div className="h-0.5 w-full bg-white/20 rounded" />
              <div className="h-0.5 w-2/3 bg-white/10 rounded" />
            </div>
            <div className="p-1 rounded bg-orange-500/10 border border-orange-500/30 space-y-0.5">
              <span className="text-[4.5px] font-bold text-orange-400 uppercase block">Modern</span>
              <div className="h-0.5 w-full bg-orange-400/40 rounded" />
              <div className="h-0.5 w-2/3 bg-orange-400/20 rounded" />
            </div>
          </div>
        </div>
      );

    case "conclusion":
      return (
        <div 
          className="aspect-[16/9] w-full rounded-lg border p-1.5 flex flex-col justify-between relative overflow-hidden transition-all shadow-inner"
          style={{ backgroundColor: colors.bg, borderColor: colors.border || "rgba(255,255,255,0.08)" }}
        >
          <p className="text-[6.5px] font-bold text-white line-clamp-1">{slide.title || "Conclusion"}</p>
          <div className="grid grid-cols-3 gap-1 my-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-0.5 rounded bg-black/40 border border-white/10 space-y-0.5">
                <span className="w-1 h-1 rounded-full block" style={{ backgroundColor: colors.primary }} />
                <div className="h-0.5 w-full bg-white/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      );

    case "gallery_grid":
      return (
        <div 
          className="aspect-[16/9] w-full rounded-lg border p-1.5 flex flex-col justify-between relative overflow-hidden transition-all shadow-inner"
          style={{ backgroundColor: colors.bg, borderColor: colors.border || "rgba(255,255,255,0.08)" }}
        >
          <p className="text-[6.5px] font-bold text-white line-clamp-1">{slide.title || "Gallery"}</p>
          <div className="grid grid-cols-3 gap-1 my-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[16/10] rounded bg-neutral-800 overflow-hidden relative">
                <img 
                  src={slide.images?.[i] || slide.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"} 
                  alt="" 
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"; }}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "bullets":
    default:
      return (
        <div 
          className="aspect-[16/9] w-full rounded-lg border p-1.5 flex flex-col justify-between relative overflow-hidden transition-all shadow-inner"
          style={{ backgroundColor: colors.bg, borderColor: colors.border || "rgba(255,255,255,0.08)" }}
        >
          <p className="text-[6.5px] font-bold text-white line-clamp-1">{slide.title || "Overview"}</p>
          <div className="grid grid-cols-2 gap-1 my-auto">
            {(slide.bullets?.slice(0, 4) || ["Pillar 1", "Pillar 2"]).map((b, idx) => (
              <div key={idx} className="p-0.5 rounded bg-black/40 border border-white/10 space-y-0.5">
                <div className="flex items-center gap-0.5">
                  <span className="w-0.5 h-0.5 rounded-full shrink-0" style={{ backgroundColor: colors.primary }} />
                  <p className="text-[5px] text-neutral-300 line-clamp-1">{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

// ─── HELPER COMPONENT: AUTO-GROWING TEXTAREA WITH ZERO SCROLLBARS ───
function AutoExpandText({
  value,
  onChange,
  className,
  placeholder,
  rows = 1
}: {
  value: string;
  onChange?: (val: string) => void;
  className?: string;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value || ""}
      onChange={(e) => {
        if (onChange) onChange(e.target.value);
        if (ref.current) {
          ref.current.style.height = "auto";
          ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
      }}
      rows={rows}
      placeholder={placeholder}
      className={cn(
        "w-full bg-transparent border-0 outline-none resize-none overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all",
        className
      )}
    />
  );
}

// ─── SUB-COMPONENT: PRISTINE STATIC SLIDE VIEW (FOR CRISP 100% STUDIO-GRADE PDF EXPORT) ───
function SlideStaticView({ slide, theme }: { slide: Slide; theme: PPTThemeConfig }) {
  const colors = theme.colors;

  switch (slide.layout) {
    case "title":
      return (
        <div className="text-center space-y-5 max-w-4xl mx-auto py-4 flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white text-center leading-tight">
            {slide.title || "Presentation Title"}
          </h1>
          <div 
            className="h-1.5 w-24 mx-auto rounded-full my-2"
            style={{ backgroundColor: colors.primary, boxShadow: `0 0 20px ${colors.primary}` }}
          />
          {slide.subtitle && (
            <p className="text-base sm:text-lg text-neutral-300 font-light max-w-3xl mx-auto text-center leading-relaxed">
              {slide.subtitle}
            </p>
          )}
          {slide.author && (
            <div 
              className="text-xs uppercase font-mono tracking-widest text-center px-4 py-1 rounded-full border mt-2 font-bold"
              style={{ color: colors.primary, borderColor: colors.border || "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              {slide.author}
            </div>
          )}
        </div>
      );

    case "image_left": {
      const bullets = (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets
        : ["Key insight and structural milestone.", "Quantitative benchmark telemetry."];

      return (
        <div className="grid grid-cols-2 gap-8 items-center h-full text-left">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: colors.border }}>
            <img 
              src={slide.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"} 
              alt="" 
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
              }}
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="space-y-4 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
              {slide.title || "Topic Analysis"}
            </h2>
            <div className="space-y-3">
              {bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-neutral-200">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.primary}` }} />
                  <p className="leading-relaxed font-light">{bullet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "image_right": {
      const bullets = (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets
        : ["Strategic insight and core competitive advantage.", "Validation benchmark and performance telemetry."];

      return (
        <div className="grid grid-cols-2 gap-8 items-center h-full text-left">
          <div className="space-y-4 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
              {slide.title || "Topic Analysis"}
            </h2>
            <div className="space-y-3">
              {bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-neutral-200">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: colors.accent, boxShadow: `0 0 8px ${colors.accent}` }} />
                  <p className="leading-relaxed font-light">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: colors.border }}>
            <img 
              src={slide.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"} 
              alt="" 
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
              }}
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      );
    }

    case "comparison": {
      const leftItems = slide.columns?.left || slide.pros || ["Baseline Strategy", "Standard Deployment"];
      const rightItems = slide.columns?.right || slide.cons || ["Modern AI Acceleration", "Real-time Telemetry"];

      return (
        <div className="space-y-5 flex flex-col justify-center h-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {slide.title || "Comparative Analysis"}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border space-y-3 bg-black/40 shadow-lg" style={{ borderColor: colors.border }}>
              <span className="text-xs font-mono font-black uppercase tracking-wider block" style={{ color: colors.primary }}>
                Option A / Baseline
              </span>
              <div className="space-y-2">
                {leftItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: colors.primary }} />
                    <p className="leading-relaxed font-light">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border space-y-3 bg-black/40 shadow-lg" style={{ borderColor: colors.accent || colors.primary }}>
              <span className="text-xs font-mono font-black uppercase tracking-wider block" style={{ color: colors.accent }}>
                Option B / Modern AI
              </span>
              <div className="space-y-2">
                {rightItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-white">
                    <span className="text-xs shrink-0 font-bold" style={{ color: colors.accent }}>✓</span>
                    <p className="leading-relaxed font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "metric_callout": {
      const metrics = slide.metrics || [
        { value: "99.8%", label: "Accuracy Multiplier" },
        { value: "4.2x", label: "Velocity Benchmark" },
        { value: "< 18ms", label: "P99 Telemetry" }
      ];

      return (
        <div className="text-center space-y-6 flex flex-col justify-center h-full">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {slide.title || "Key Metrics & KPIs"}
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {metrics.slice(0, 3).map((m, idx) => (
              <div key={idx} className="p-6 rounded-2xl border bg-black/40 space-y-2 shadow-lg" style={{ borderColor: idx === 0 ? colors.primary : colors.border }}>
                <p className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: idx === 0 ? colors.primary : colors.accent }}>
                  {m.value}
                </p>
                <p className="text-xs uppercase font-mono font-bold text-neutral-400 tracking-wider">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "timeline": {
      const events = (slide.events || [
        { year: "Phase 1", description: "Architecture Discovery" },
        { year: "Phase 2", description: "Semantic Indexing" },
        { year: "Phase 3", description: "Global Scale" }
      ]).slice(0, 3);

      return (
        <div className="space-y-6 flex flex-col justify-center h-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {slide.title || "Process Roadmap"}
          </h2>
          <div className="grid grid-cols-3 gap-5">
            {events.map((ev, idx) => (
              <div key={idx} className="p-6 rounded-2xl border bg-black/40 space-y-3 shadow-lg flex flex-col justify-between" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg border font-bold" style={{ color: colors.primary, borderColor: colors.primary, backgroundColor: "rgba(255,255,255,0.05)" }}>
                    {ev.year}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                  {ev.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "gallery_grid": {
      const images = (slide.images && slide.images.length > 0)
        ? slide.images
        : [
            slide.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800"
          ];
      return (
        <div className="space-y-4 flex flex-col justify-center h-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {slide.title || "Visual Showcase"}
          </h2>
          <div className="grid grid-cols-3 gap-4 h-64">
            {images.slice(0, 3).map((imgUrl, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border shadow-lg" style={{ borderColor: colors.border }}>
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "pros_cons": {
      const prosList = (slide.pros && slide.pros.length > 0) ? slide.pros : ["Strategic Efficiency Multiplier", "Accelerated Velocity"];
      const consList = (slide.cons && slide.cons.length > 0) ? slide.cons : ["Implementation Overhead", "Migration Complexity"];
      return (
        <div className="space-y-5 flex flex-col justify-center h-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {slide.title || "Advantages vs Trade-offs"}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border bg-black/40 space-y-3 shadow-lg" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
              <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-400 block">✓ Key Advantages</span>
              <div className="space-y-2">
                {prosList.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-200">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <p className="leading-relaxed font-light">{p}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl border bg-black/40 space-y-3 shadow-lg" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
              <span className="text-xs font-mono font-black uppercase tracking-wider text-red-400 block">⚠ Trade-offs & Limitations</span>
              <div className="space-y-2">
                {consList.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-200">
                    <span className="text-red-400 font-bold">✕</span>
                    <p className="leading-relaxed font-light">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "quote":
      return (
        <div className="text-center space-y-6 max-w-3xl mx-auto flex flex-col items-center justify-center h-full">
          <span className="text-5xl font-serif text-orange-400 font-black">“</span>
          <p className="text-xl sm:text-2xl font-light italic text-white leading-relaxed">
            {slide.quote_text || slide.subtitle || "The future of architectural engineering lies in the union of sustainable mastery and digital preservation."}
          </p>
          {(slide.author || slide.role) && (
            <div className="space-y-1">
              <p className="text-sm font-bold text-white tracking-wide">{slide.author || "Executive Leadership"}</p>
              {slide.role && <p className="text-xs font-mono text-neutral-400">{slide.role}</p>}
            </div>
          )}
        </div>
      );

    case "matrix_2x2": {
      const quads = slide.quadrants || ["Q1: High Impact / Low Effort", "Q2: High Impact / High Effort", "Q3: Low Impact / Low Effort", "Q4: Low Impact / High Effort"];
      return (
        <div className="space-y-4 flex flex-col justify-center h-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {slide.title || "Strategic 2x2 Matrix"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quads.slice(0, 4).map((q, idx) => (
              <div key={idx} className="p-5 rounded-2xl border bg-black/40 space-y-2 shadow-lg" style={{ borderColor: idx === 0 ? colors.primary : colors.border }}>
                <span className="text-[10px] font-mono font-black uppercase text-orange-400 block">Quadrant 0{idx + 1}</span>
                <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "conclusion": {
      const bullets = (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets
        : [
            "Sustainable Execution: Implement protective policies and international partnerships.",
            "Technological Heritage: Leverage 3D LiDAR scanning and automated telemetry for preservation.",
            "Global Stewardship: Engage local communities and educational initiatives for long-term impact."
          ];
      return (
        <div className="space-y-6 flex flex-col justify-center h-full text-left max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {slide.title || "Summary & Next Steps"}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {bullets.slice(0, 3).map((bullet, idx) => (
              <div key={idx} className="p-5 rounded-2xl border bg-black/40 flex flex-col justify-between space-y-3 shadow-lg" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2 pb-1 border-b border-white/[0.08]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">Takeaway 0{idx + 1}</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "bullets":
    default: {
      const bullets = (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets
        : [
            "Strategic implementation milestone across infrastructure.",
            "Quantitative performance telemetry and latency targets.",
            "Long-term sustainable deployment and architectural agility."
          ];

      return (
        <div className="space-y-6 flex flex-col justify-center h-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {slide.title || "Key Strategic Takeaways"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {bullets.slice(0, 4).map((bullet, idx) => (
              <div key={idx} className="p-5 rounded-2xl border bg-black/40 flex items-start gap-3.5 shadow-lg" style={{ borderColor: colors.border }}>
                <span className="w-7 h-7 rounded-full border flex items-center justify-center font-mono text-xs font-black shrink-0 mt-0.5" style={{ color: colors.primary, borderColor: colors.primary, backgroundColor: "rgba(255,255,255,0.05)" }}>
                  0{idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed">
                  {bullet}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
}

// ─── SUB-COMPONENT: 16:9 WYSIWYG EDITABLE SLIDE CANVAS ───
function SlideEditableCanvas({
  slide,
  theme,
  onUpdate,
  onOpenImagePicker
}: {
  slide: Slide;
  theme: PPTThemeConfig;
  onUpdate: (updater: (s: Slide) => Partial<Slide>) => void;
  onOpenImagePicker?: () => void;
}) {
  const colors = theme.colors;

  switch (slide.layout) {
    case "title":
      return (
        <div className="text-center space-y-4 max-w-3xl mx-auto py-2 flex flex-col items-center justify-center h-full">
          <AutoExpandText
            value={slide.title || ""}
            onChange={(val) => onUpdate(() => ({ title: val }))}
            placeholder="Presentation Title"
            rows={2}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white text-center hover:bg-white/[0.03] rounded-2xl p-2 leading-tight"
          />
          <div 
            className="h-1.5 w-20 mx-auto rounded-full my-1"
            style={{ backgroundColor: colors.primary, boxShadow: `0 0 15px ${colors.primary}` }}
          />
          <AutoExpandText
            value={slide.subtitle || ""}
            onChange={(val) => onUpdate(() => ({ subtitle: val }))}
            placeholder="Add subtitle or key thesis premise..."
            rows={2}
            className="text-sm sm:text-base text-neutral-300 font-light max-w-2xl mx-auto text-center hover:bg-white/[0.03] rounded-xl p-2 leading-relaxed"
          />
          {slide.author && (
            <input
              type="text"
              value={slide.author}
              onChange={(e) => onUpdate(() => ({ author: e.target.value }))}
              className="text-xs uppercase font-mono tracking-widest text-center bg-transparent border-0 outline-none hover:bg-white/[0.03] px-3 py-1 rounded-lg mt-2"
              style={{ color: colors.primary }}
            />
          )}
        </div>
      );

    case "image_left": {
      const bullets = (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets
        : [
            "Foundational premise and architectural overview.",
            "Quantitative benchmark and implementation methodology."
          ];

      return (
        <div className="grid grid-cols-2 gap-6 items-center h-full text-left">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border shadow-lg group" style={{ borderColor: colors.border }}>
            <img 
              src={slide.image_url || `https://images.unsplash.com/photo-1518770660439-4636190af475?w=800`} 
              alt=""
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {onOpenImagePicker && (
              <button
                onClick={onOpenImagePicker}
                className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/80 hover:bg-orange-500 hover:text-black text-white text-[10px] font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-sm z-20 cursor-pointer"
              >
                <Sparkles size={11} /> Change Visual
              </button>
            )}
          </div>

          <div className="space-y-3 flex flex-col justify-center">
            <AutoExpandText
              value={slide.title || ""}
              onChange={(val) => onUpdate(() => ({ title: val }))}
              rows={2}
              className="text-xl sm:text-2xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-lg p-0.5 leading-snug"
              placeholder="Topic Headline"
            />
            <div className="space-y-2.5">
              {bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: colors.primary }} />
                  <AutoExpandText
                    value={bullet}
                    onChange={(val) => {
                      const next = [...bullets];
                      next[idx] = val;
                      onUpdate(() => ({ bullets: next }));
                    }}
                    rows={2}
                    className="leading-relaxed hover:bg-white/[0.02] rounded text-neutral-200 text-xs sm:text-sm p-0.5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "image_right": {
      const bullets = (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets
        : [
            "Strategic insight and core competitive advantage.",
            "Validation benchmark and performance telemetry."
          ];

      return (
        <div className="grid grid-cols-2 gap-6 items-center h-full text-left">
          <div className="space-y-3 flex flex-col justify-center">
            <AutoExpandText
              value={slide.title || ""}
              onChange={(val) => onUpdate(() => ({ title: val }))}
              rows={2}
              className="text-xl sm:text-2xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-lg p-0.5 leading-snug"
              placeholder="Topic Headline"
            />
            <div className="space-y-2.5">
              {bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: colors.accent }} />
                  <AutoExpandText
                    value={bullet}
                    onChange={(val) => {
                      const next = [...bullets];
                      next[idx] = val;
                      onUpdate(() => ({ bullets: next }));
                    }}
                    rows={2}
                    className="leading-relaxed hover:bg-white/[0.02] rounded text-neutral-200 text-xs sm:text-sm p-0.5"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border shadow-lg group" style={{ borderColor: colors.border }}>
            <img 
              src={slide.image_url || `https://images.unsplash.com/photo-1518770660439-4636190af475?w=800`} 
              alt=""
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {onOpenImagePicker && (
              <button
                onClick={onOpenImagePicker}
                className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/80 hover:bg-orange-500 hover:text-black text-white text-[10px] font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-sm z-20 cursor-pointer"
              >
                <Sparkles size={11} /> Change Visual
              </button>
            )}
          </div>
        </div>
      );
    }

    case "metric_callout":
      return (
        <div className="space-y-6 text-center max-w-3xl mx-auto py-2 flex flex-col justify-center h-full">
          <AutoExpandText
            value={slide.title || ""}
            onChange={(val) => onUpdate(() => ({ title: val }))}
            rows={2}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-xl p-1 text-center leading-tight"
            placeholder="Key Metrics Headline"
          />
          <div className="grid grid-cols-3 gap-4">
            {(slide.metrics || [
              { value: "99.8%", label: "Accuracy Target" },
              { value: "4.2x", label: "Velocity Multiplier" },
              { value: "< 18ms", label: "Latency Benchmark" }
            ]).map((m, i) => (
              <div 
                key={i} 
                className="p-5 rounded-2xl border shadow-lg space-y-1.5 bg-black/40"
                style={{ borderColor: colors.border }}
              >
                <input
                  type="text"
                  value={m.value}
                  onChange={(e) => {
                    const next = [...(slide.metrics || [])];
                    next[i] = { ...m, value: e.target.value };
                    onUpdate(() => ({ metrics: next }));
                  }}
                  className="text-3xl sm:text-4xl font-black tracking-tight text-center bg-transparent border-0 outline-none w-full"
                  style={{ color: i === 0 ? colors.primary : colors.accent }}
                />
                <input
                  type="text"
                  value={m.label}
                  onChange={(e) => {
                    const next = [...(slide.metrics || [])];
                    next[i] = { ...m, label: e.target.value };
                    onUpdate(() => ({ metrics: next }));
                  }}
                  className="text-xs uppercase font-mono tracking-wider text-neutral-400 text-center bg-transparent border-0 outline-none w-full"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "conclusion": {
      const conclusionItems = (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets
        : (slide.pros && slide.pros.length > 0)
        ? slide.pros
        : (slide.steps && slide.steps.length > 0)
        ? slide.steps.map(s => typeof s === 'string' ? s : (s as any).title || (s as any).description || "Action Item")
        : (slide.content && slide.content.length > 5)
        ? [
            slide.content,
            "Implementation Roadmap: Execute targeted milestones with continuous telemetry monitoring.",
            "Long-Term Impact: Maintain sustainable performance, cultural preservation, and strategic agility."
          ]
        : [
            "Sustainable Preservation: Implement protective policies and international conservation partnerships.",
            "Technological Heritage: Leverage 3D LiDAR scanning and AR simulations for historical preservation.",
            "Global Stewardship: Engage local communities and educational initiatives for long-term impact."
          ];

      return (
        <div className="space-y-4 text-left flex flex-col justify-center h-full max-w-4xl mx-auto">
          <AutoExpandText
            value={slide.title || ""}
            onChange={(val) => onUpdate(() => ({ title: val }))}
            rows={2}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-xl p-1 leading-tight"
            placeholder="Conclusion & Summary"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {conclusionItems.map((bullet, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border shadow-md space-y-2 bg-black/40 flex flex-col justify-between"
                style={{ borderColor: colors.border }}
              >
                <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">Takeaway {idx + 1}</span>
                </div>
                <AutoExpandText
                  value={bullet}
                  onChange={(val) => {
                    const next = [...conclusionItems];
                    next[idx] = val;
                    onUpdate(() => ({ bullets: next }));
                  }}
                  rows={3}
                  className="text-xs text-neutral-200 leading-relaxed hover:bg-white/[0.02] rounded p-0.5"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "comparison": {
      const leftItems = (slide.columns?.left && slide.columns.left.length > 0)
        ? slide.columns.left
        : (slide.pros && slide.pros.length > 0)
        ? slide.pros
        : (slide.bullets && slide.bullets.length > 1)
        ? slide.bullets.slice(0, Math.ceil(slide.bullets.length / 2))
        : [
            slide.left_text || "Baseline Approach: Manual coordination with linear scaling overhead.",
            "Latency Overhead: Sequential processing creates bottlenecks under high load.",
            "Resource Consumption: Higher compute footprint with fragmented data stores."
          ];

      const rightItems = (slide.columns?.right && slide.columns.right.length > 0)
        ? slide.columns.right
        : (slide.cons && slide.cons.length > 0)
        ? slide.cons
        : (slide.bullets && slide.bullets.length > 1)
        ? slide.bullets.slice(Math.ceil(slide.bullets.length / 2))
        : [
            slide.right_text || "Modern Architecture: Event-driven orchestration with autonomous workers.",
            "Sub-Millisecond Response: Distributed vector indexing accelerates retrieval 4.2x.",
            "Automated Telemetry: Self-healing error loops prevent context pollution."
          ];

      return (
        <div className="space-y-4 text-left flex flex-col justify-center h-full">
          <AutoExpandText
            value={slide.title || ""}
            onChange={(val) => onUpdate(() => ({ title: val }))}
            rows={2}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-xl p-1 leading-tight"
            placeholder="Comparative Analysis Headline"
          />
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column Card */}
            <div className="p-4 rounded-2xl border bg-black/40 space-y-3" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Option A / Baseline</span>
              </div>
              <div className="space-y-2.5">
                {leftItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 bg-neutral-500" />
                    <AutoExpandText
                      value={item}
                      onChange={(val) => {
                        const next = [...leftItems];
                        next[idx] = val;
                        onUpdate(() => ({ columns: { left: next, right: rightItems } }));
                      }}
                      rows={2}
                      className="leading-relaxed text-neutral-300 text-xs hover:bg-white/[0.02] rounded p-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Card */}
            <div className="p-4 rounded-2xl border bg-orange-500/5 space-y-3" style={{ borderColor: colors.primary }}>
              <div className="flex items-center gap-2 pb-2 border-b border-orange-500/20">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Option B / Modern</span>
              </div>
              <div className="space-y-2.5">
                {rightItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: colors.primary }} />
                    <AutoExpandText
                      value={item}
                      onChange={(val) => {
                        const next = [...rightItems];
                        next[idx] = val;
                        onUpdate(() => ({ columns: { left: leftItems, right: next } }));
                      }}
                      rows={2}
                      className="leading-relaxed text-neutral-100 text-xs hover:bg-white/[0.02] rounded p-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "pros_cons": {
      const pros = (slide.pros && slide.pros.length > 0) ? slide.pros : (slide.bullets?.slice(0, 2) || ["Accelerated Deployment Velocity", "Cost Reduction across Infrastructure"]);
      const cons = (slide.cons && slide.cons.length > 0) ? slide.cons : (slide.bullets?.slice(2) || ["Initial Migration Complexity", "Legacy System Compatibility"]);

      return (
        <div className="space-y-4 text-left flex flex-col justify-center h-full">
          <AutoExpandText
            value={slide.title || ""}
            onChange={(val) => onUpdate(() => ({ title: val }))}
            rows={2}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-xl p-1 leading-tight"
            placeholder="Pros & Cons Headline"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block pb-1 border-b border-emerald-500/20">Key Advantages</span>
              {pros.map((p, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <AutoExpandText
                    value={p}
                    onChange={(val) => {
                      const next = [...pros];
                      next[idx] = val;
                      onUpdate(() => ({ pros: next }));
                    }}
                    rows={2}
                    className="leading-snug text-neutral-200 text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-2.5">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block pb-1 border-b border-rose-500/20">Considerations & Risks</span>
              {cons.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                  <span className="text-rose-400 font-bold">✗</span>
                  <AutoExpandText
                    value={c}
                    onChange={(val) => {
                      const next = [...cons];
                      next[idx] = val;
                      onUpdate(() => ({ cons: next }));
                    }}
                    rows={2}
                    className="leading-snug text-neutral-200 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "timeline": {
      const events = (slide.events && slide.events.length > 0)
        ? slide.events
        : (slide.steps && slide.steps.length > 0)
        ? slide.steps.map((st, i) => ({ year: `Stage ${i + 1}`, description: typeof st === "string" ? st : (st as any).title || "Execution Step" }))
        : [
            { year: "Phase 1", description: "Architecture Discovery & Data Schema Definition" },
            { year: "Phase 2", description: "Pilot Deployment with Telemetry Monitoring" },
            { year: "Phase 3", description: "Global Rollout & Performance Optimization" }
          ];

      return (
        <div className="space-y-5 text-left flex flex-col justify-center h-full">
          <AutoExpandText
            value={slide.title || ""}
            onChange={(val) => onUpdate(() => ({ title: val }))}
            rows={2}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-xl p-1 leading-tight"
            placeholder="Roadmap Timeline Headline"
          />
          <div className="grid grid-cols-3 gap-3">
            {events.map((ev, idx) => (
              <div key={idx} className="p-4 rounded-2xl border bg-black/40 space-y-2 relative" style={{ borderColor: colors.border }}>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold inline-block" style={{ backgroundColor: colors.primary, color: '#000' }}>
                  {ev.year}
                </span>
                <AutoExpandText
                  value={ev.description}
                  onChange={(val) => {
                    const next = [...events];
                    next[idx] = { ...ev, description: val };
                    onUpdate(() => ({ events: next }));
                  }}
                  rows={3}
                  className="text-xs text-neutral-200 leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "quote": {
      return (
        <div className="text-center space-y-4 max-w-2xl mx-auto py-2 flex flex-col items-center justify-center h-full">
          <span className="text-4xl text-orange-400 font-serif leading-none">“</span>
          <AutoExpandText
            value={slide.quote_text || slide.title || "Innovation distinguishes between a leader and a follower."}
            onChange={(val) => onUpdate(() => ({ quote_text: val }))}
            rows={3}
            className="text-center text-lg sm:text-xl font-medium italic text-neutral-200 leading-relaxed"
          />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-white uppercase tracking-wider">{slide.author || "Executive Leadership"}</p>
            {slide.role && <p className="text-[10px] text-neutral-400 font-mono">{slide.role}</p>}
          </div>
        </div>
      );
    }

    case "gallery_grid": {
      const images = (slide.images && slide.images.length > 0)
        ? slide.images
        : [slide.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"];

      return (
        <div className="space-y-4 text-left flex flex-col justify-center h-full">
          <AutoExpandText
            value={slide.title || ""}
            onChange={(val) => onUpdate(() => ({ title: val }))}
            rows={2}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-xl p-1 leading-tight"
            placeholder="Visual Showcase Headline"
          />
          <div className="grid grid-cols-3 gap-3">
            {images.slice(0, 3).map((img, idx) => (
              <div key={idx} className="relative aspect-[16/10] rounded-2xl overflow-hidden border shadow-md" style={{ borderColor: colors.border }}>
                <img 
                  src={img} 
                  alt="" 
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"; }}
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "bullets":
    default: {
      const bulletsList = (slide.bullets && slide.bullets.length > 0)
        ? slide.bullets
        : [
            "Foundational Pillar: Context-aware document partitioning preserves structural integrity.",
            "Vector Caching: HNSW indexing accelerates sub-millisecond retrieval by 3.8x.",
            "Dynamic Routing: Socratic classification prevents token exhaustion.",
            "Continuous Feedback: Automated active recall tests reinforce retention."
          ];
      const isDense = bulletsList.length > 4;

      return (
        <div className="space-y-3 text-left flex flex-col justify-center h-full">
          <AutoExpandText
            value={slide.title || ""}
            onChange={(val) => onUpdate(() => ({ title: val }))}
            rows={2}
            className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:bg-white/[0.03] rounded-xl p-1 leading-tight"
            placeholder="Slide Topic Headline"
          />
          <div className={cn("grid gap-2.5", isDense ? "grid-cols-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar" : "grid-cols-2")}>
            {bulletsList.map((bullet, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl border shadow-md space-y-1 bg-black/40 flex items-start gap-2.5"
                style={{ borderColor: colors.border }}
              >
                <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: colors.primary }} />
                <AutoExpandText
                  value={bullet}
                  onChange={(val) => {
                    const next = [...bulletsList];
                    next[idx] = val;
                    onUpdate(() => ({ bullets: next }));
                  }}
                  rows={2}
                  className="text-xs sm:text-sm text-neutral-200 leading-relaxed hover:bg-white/[0.02] rounded p-0.5"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
}
