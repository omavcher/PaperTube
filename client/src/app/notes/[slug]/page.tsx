"use client";

import React, { useState, useRef, useEffect, useCallback, use } from "react";
import { createPortal } from "react-dom";
import { THEMES, NoteTheme, getThemePlan, isThemePremium } from "@/config/themes";
import { Editor } from "@tinymce/tinymce-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
// @ts-ignore
import renderMathInElement from "katex/dist/contrib/auto-render";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
// @ts-ignore
import TurndownService from "turndown";
import { motion, AnimatePresence } from "framer-motion";

import {
  Download,
  Send,
  Save,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Edit,
  Lock,
  AlertCircle,
  X,
  FileText,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Home,
  RefreshCw,
  Plus,
  ChevronDown,
  BookOpen,
  Brain,
  HelpCircle,
  Lightbulb,
  Zap,
  ArrowRight,
  Check,
  ZoomIn,
  ZoomOut,
  Copy,
  Maximize2,
  Share2,
  Palette,
  GraduationCap,
  Target,
  Search,
  Code,
  Calculator
} from "lucide-react";

import api from "@/config/api";
import { LoaderX } from "@/components/LoaderX";
import { MOCK_NOTES } from "@/config/mock-notes";
import { LoginDialog } from "@/components/LoginDialog";
import FlashcardViewer from "@/components/FlashcardViewer";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exportNotesToPdf } from "@/lib/pdfExporter";

// --- AUTH HELPERS ---
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

// --- TYPES ---
interface ApiMessage {
  _id: string;
  role: string;
  content: string;
  timestamp: string;
  videoLink?: string;
  feedback?: "good" | "bad" | null;
  mode?: string;
}
interface ApiMessagesResponse {
  messages: ApiMessage[];
}
interface NoteData {
  _id: string;
  title: string;
  content: string;
  thumbnail?: string;
  generationDetails?: any;
  videoUrl?: string;
  videoId?: string;
  ownerName?: string;
  slug?: string;
}

type UserPlan = "free" | "pro" | "power";

// --- CHAT AI MODELS ---
const CHAT_AI_MODELS = [
  {
    id: "paperchat",
    name: "PaperChat",
    desc: "Paperxify's native AI model",
    logoUrl: "/paperxify.jpeg",
    logoFallback: "📄",
    tier: "free" as const,
    accentColor: "#ef4444",
    freeLimit: Infinity,
    persona: "You are PaperChat, Paperxify's own advanced AI study assistant. You are expert at helping students understand notes, generate quizzes, and explain complex topics clearly."
  },
  {
    id: "gpt4o",
    name: "ChatGPT 4o",
    desc: "OpenAI · Frontier Intelligence",
    logoUrl: "/chatgpt.png",
    logoFallback: "🤖",
    tier: "pro" as const,
    accentColor: "#10b981",
    freeLimit: 2,
    persona: "You are ChatGPT 4o, OpenAI's most advanced model. You provide detailed, accurate, and well-reasoned responses with exceptional clarity."
  },
  {
    id: "deepseek",
    name: "DeepSeek V4 Flash",
    desc: "DeepSeek · Logic & Reasoning",
    logoUrl: "/deepseek.png",
    logoFallback: "🐬",
    tier: "pro" as const,
    accentColor: "#3b82f6",
    freeLimit: 2,
    persona: "You are DeepSeek V4 Flash, an advanced language model trained by DeepSeek. You are highly accurate, extremely fast, and provide deep reasoning and clear assistance."
  },
  {
    id: "claude",
    name: "Claude 3.5",
    desc: "Anthropic · Nuanced Thought",
    logoUrl: "/claude-color.png",
    logoFallback: "🌟",
    tier: "power" as const,
    accentColor: "#f97316",
    freeLimit: 2,
    persona: "You are Claude 3.5 by Anthropic. You are thoughtful, nuanced, and highly accurate. You excel at deep reasoning and safe, helpful responses."
  },
  {
    id: "gemini",
    name: "Gemini 2.0",
    desc: "Google DeepMind · Multimodal",
    logoUrl: "/gemini.png",
    logoFallback: "♊",
    tier: "power" as const,
    accentColor: "#4285f4",
    freeLimit: 2,
    persona: "You are Gemini 2.0 by Google DeepMind. You are a multimodal AI that provides precise, structured, and helpful academic assistance."
  }
];

const PLAN_UNLIMITED: Record<UserPlan, string[]> = {
  free: ["paperchat"],
  pro: ["paperchat", "gpt4o", "deepseek"],
  power: ["paperchat", "gpt4o", "deepseek", "claude", "gemini"]
};

const PLAN_META: Record<UserPlan, { label: string; color: string }> = {
  free: { label: "Free", color: "#9ca3af" },
  pro: { label: "Pro", color: "#a855f7" },
  power: { label: "Power", color: "#f59e0b" }
};

const TIER_REQUIRED_PLAN: Record<string, UserPlan> = {
  free: "free",
  pro: "pro",
  power: "power"
};

const CHAT_MODES = [
  { id: "tutor", label: "AI Tutor", description: "Guided Socratic reasoning & knowledge checks", icon: Brain, color: "#8b5cf6" },
  { id: "study", label: "Study Mode", description: "Interactive 1-on-1 lecture study session", icon: GraduationCap, color: "#3b82f6" },
  { id: "exam_prep", label: "Exam Prep", description: "High-yield topics, pitfalls & test tips", icon: Target, color: "#ef4444" },
  { id: "quick", label: "Quick Answer", description: "Direct, concise, bulleted facts", icon: Zap, color: "#eab308" },
  { id: "deep_dive", label: "Deep Dive", description: "Exhaustive academic & mathematical analysis", icon: Search, color: "#06b6d4" },
  { id: "explain_simply", label: "Explain Simply", description: "Intuitive ELI5 everyday analogies", icon: Lightbulb, color: "#f97316" },
  { id: "coding_tutor", label: "Coding Tutor", description: "Code syntax, tracing & practice challenges", icon: Code, color: "#10b981" },
  { id: "problem_solver", label: "Problem Solver", description: "Step-by-step KaTeX math problem solver", icon: Calculator, color: "#ec4899" },
  { id: "quiz", label: "Quiz Me", description: "Active recall test with instant evaluation", icon: Brain, color: "#10b981" },
  { id: "revision", label: "Revision", description: "Lightning 2-minute memory summary", icon: RefreshCw, color: "#6366f1" }
];

const QUICK_ACTIONS = [
  { label: "Teach me the core concept", icon: Brain, color: "#8b5cf6" },
  { label: "What are the high-yield exam points?", icon: Target, color: "#ef4444" },
  { label: "Quiz me on this topic", icon: GraduationCap, color: "#3b82f6" },
  { label: "Explain in simple ELI5 terms", icon: Lightbulb, color: "#f59e0b" },
  { label: "List all formulas & equations", icon: Calculator, color: "#ec4899" },
  { label: "Give a 2-minute fast revision", icon: RefreshCw, color: "#6366f1" }
];

// --- TIMESTAMP UTILITIES ---
function extractYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/[^\d:]/g, "");
  const parts = clean.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

function makeTimestampsClickable(content: string, videoUrl?: string): string {
  if (!content) return "";

  const videoId = extractYouTubeVideoId(videoUrl);
  const baseVideoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (videoUrl || "https://www.youtube.com");

  // 1. Replace range timestamps: [00:00 - 01:00] or [01:00:00 - 02:00:00]
  let result = content.replace(/(?<!!)\[\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\](?!\()/g, (_match, start, end) => {
    const sec = parseTimeToSeconds(start);
    const href = videoId ? `https://www.youtube.com/watch?v=${videoId}&t=${sec}s` : `${baseVideoUrl}#t=${sec}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="paperxify-timestamp-badge" title="Watch on YouTube at ${start} (${end})" data-timestamp="${sec}"><svg class="timestamp-play-icon inline-block w-3 h-3 mr-1 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span>${start} - ${end}</span></a>`;
  });

  // 2. Replace single timestamps: [ 01:23:45 ] or [05:30]
  result = result.replace(/(?<!!)\[\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\](?!\()/g, (_match, time) => {
    const sec = parseTimeToSeconds(time);
    const href = videoId ? `https://www.youtube.com/watch?v=${videoId}&t=${sec}s` : `${baseVideoUrl}#t=${sec}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="paperxify-timestamp-badge" title="Watch on YouTube at ${time}" data-timestamp="${sec}"><svg class="timestamp-play-icon inline-block w-3 h-3 mr-1 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span>${time}</span></a>`;
  });

  return result;
}

// --- 1. PDF & NOTE CANVAS PREVIEW COMPONENT ---
const PDFPreviewWithThumbnail: React.FC<{
  content: string;
  isGenerating?: boolean;
  onGeneratePDF?: () => void;
  themeId?: string;
  onThemeChange?: (theme: NoteTheme) => void;
  onOpenThemeModal?: () => void;
  videoUrl?: string;
}> = ({ content, isGenerating = false, onGeneratePDF, themeId = "atmosphere", onThemeChange, onOpenThemeModal, videoUrl }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and listen for Escape key when fullscreen modal is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowFullPreview(false);
    };
    if (showFullPreview) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showFullPreview]);

  const processedContent = React.useMemo(() => {
    return makeTimestampsClickable(content, videoUrl);
  }, [content, videoUrl]);

  const isHtml = /^\s*</.test(processedContent);
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const displayBg = theme.bg;
  const displayText = theme.text;
  const displayBorder = theme.border;
  const displayCardBg = theme.cardBg;
  const displayFont = theme.font || "'Inter', sans-serif";

  useEffect(() => {
    const renderMath = (element: HTMLDivElement | null) => {
      if (element) {
        try {
          renderMathInElement(element, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\(", right: "\\)", display: false },
              { left: "\\[", right: "\\]", display: true }
            ],
            throwOnError: false
          });
        } catch (err) {
          console.error("Error rendering math with KaTeX:", err);
        }
      }
    };

    renderMath(containerRef.current);
    if (showFullPreview) {
      const timer = setTimeout(() => {
        renderMath(modalContainerRef.current);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [processedContent, isGenerating, showFullPreview, zoomLevel]);

  const copyAllText = () => {
    try {
      const text = containerRef.current?.innerText || content;
      navigator.clipboard.writeText(text);
      toast.success("Note content copied to clipboard!");
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const renderContent = (className: string) => {
    if (isHtml || processedContent.includes("paperxify-timestamp-badge")) {
      return <div dangerouslySetInnerHTML={{ __html: processedContent }} className={className} />;
    }
    return (
      <div className={className}>
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden bg-[#070709] rounded-none sm:rounded-2xl border-0 sm:border border-white/[0.08]"
      style={{ fontFamily: displayFont }}
    >
      {/* Load theme Google Font */}
      {theme.googleFont && <link rel="stylesheet" href={theme.googleFont} />}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .premium-note-render-container .premium-note-render .max-w-none > *[style*="padding" i] {
          padding: 0px !important;
        }
        .premium-note-render-container,
        .premium-note-render-container .premium-note-render {
          font-family: ${displayFont} !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .premium-note-render-container .premium-note-render h1,
        .premium-note-render-container .premium-note-render h2,
        .premium-note-render-container .premium-note-render h3,
        .premium-note-render-container .premium-note-render h4,
        .premium-note-render-container .premium-note-render h5,
        .premium-note-render-container .premium-note-render h6,
        .premium-note-render-container .premium-note-render p,
        .premium-note-render-container .premium-note-render li,
        .premium-note-render-container .premium-note-render span:not(.katex *):not(code *),
        .premium-note-render-container .premium-note-render div:not(.katex *):not(pre *),
        .premium-note-render-container .premium-note-render blockquote,
        .premium-note-render-container .premium-note-render table,
        .premium-note-render-container .premium-note-render th,
        .premium-note-render-container .premium-note-render td {
          font-family: ${displayFont} !important;
        }
        .premium-note-render-container .premium-note-render h1 {
          color: ${theme.primary} !important;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          line-height: 1.3;
        }
        .premium-note-render-container .premium-note-render h2 {
          color: ${theme.primary} !important;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-top: 32px;
          margin-bottom: 14px;
          border-bottom: 1.5px solid ${displayBorder} !important;
          padding-bottom: 8px;
          line-height: 1.4;
        }
        .premium-note-render-container .premium-note-render h3 {
          color: ${theme.primary} !important;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.015em;
          margin-top: 22px;
          margin-bottom: 10px;
          line-height: 1.4;
        }
        .premium-note-render-container .premium-note-render p,
        .premium-note-render-container .premium-note-render li {
          color: ${displayText} !important;
          font-size: 15px;
          line-height: 1.75;
          letter-spacing: -0.005em;
          font-weight: 400;
        }
        .premium-note-render-container .premium-note-render p {
          margin-bottom: 16px;
        }
        .premium-note-render-container .premium-note-render strong {
          color: ${displayText} !important;
          font-weight: 700;
        }
        .premium-note-render-container .premium-note-render a {
          color: ${theme.link} !important;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .premium-note-render-container .premium-note-render blockquote {
          background-color: ${displayCardBg} !important;
          border-left: 3.5px solid ${theme.primary} !important;
          color: ${displayText} !important;
          padding: 14px 18px;
          border-radius: 0 12px 12px 0;
          margin: 20px 0;
          font-size: 14.5px;
          line-height: 1.7;
        }
        .premium-note-render-container .premium-note-render table {
          border: 1px solid ${displayBorder} !important;
          background-color: ${displayCardBg} !important;
          width: 100%;
          border-radius: 12px;
          margin: 20px 0;
          border-collapse: separate;
          border-spacing: 0;
          overflow: hidden;
          font-size: 14px;
        }
        .premium-note-render-container .premium-note-render th {
          background-color: ${displayBorder} !important;
          color: ${theme.primary} !important;
          font-weight: 700;
          padding: 10px 14px;
          text-align: left;
          font-size: 13px;
          letter-spacing: 0.03em;
        }
        .premium-note-render-container .premium-note-render td {
          border-bottom: 1px solid ${displayBorder} !important;
          color: ${displayText} !important;
          padding: 10px 14px;
        }
        .premium-note-render-container .premium-note-render tr:last-child td {
          border-bottom: none !important;
        }
        .premium-note-render-container .premium-note-render code {
          background-color: ${displayCardBg} !important;
          color: ${theme.accent} !important;
          border: 1px solid ${displayBorder} !important;
          padding: 2px 6px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 13px;
          font-weight: 500;
        }
        .premium-note-render-container .premium-note-render pre {
          background-color: #0c0d12 !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 14px;
          padding: 18px;
          margin: 20px 0;
          overflow-x: auto;
          font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 13.5px;
        }
        .premium-note-render-container .premium-note-render pre code {
          background: transparent !important;
          border: none !important;
          color: inherit !important;
          padding: 0 !important;
        }
        .premium-note-render-container .premium-note-render .katex,
        .premium-note-render-container .premium-note-render .katex * {
          font-family: KaTeX_Main, 'Times New Roman', serif !important;
        }
        .premium-note-render-container .premium-note-render li::marker {
          color: ${theme.primary} !important;
          font-weight: bold;
        }
        .premium-note-render-container .premium-note-render img {
          max-width: 100%;
          border-radius: 14px;
          margin: 22px auto;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          border: 1px solid ${displayBorder};
          display: block;
        }
        .premium-note-render-container .premium-note-render .paperxify-timestamp-badge,
        .paperxify-timestamp-badge {
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          background: rgba(239, 68, 68, 0.12) !important;
          border: 1px solid rgba(239, 68, 68, 0.35) !important;
          color: #ef4444 !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 0.82em !important;
          font-weight: 700 !important;
          padding: 2px 8px !important;
          border-radius: 6px !important;
          text-decoration: none !important;
          vertical-align: middle !important;
          margin: 0 3px !important;
          cursor: pointer !important;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .premium-note-render-container .premium-note-render .paperxify-timestamp-badge:hover,
        .paperxify-timestamp-badge:hover {
          background: rgba(239, 68, 68, 0.25) !important;
          border-color: rgba(239, 68, 68, 0.7) !important;
          color: #ff6b6b !important;
          transform: translateY(-1px) scale(1.03) !important;
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.35) !important;
        }
      `
        }}
      />

      {/* Floating Canvas Action Bar (Desktop Top Right) */}
      <div className="hidden sm:flex absolute top-3 right-3 z-30 items-center gap-1.5 p-1 rounded-xl bg-black/75 backdrop-blur-xl border border-white/[0.12] shadow-xl">
        <button
          onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
        <span className="text-[10px] font-mono text-neutral-400 px-1 font-semibold">{zoomLevel}%</span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
        <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />
        <button
          onClick={copyAllText}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
          title="Copy Markdown"
        >
          <Copy size={13} />
        </button>
        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors flex items-center gap-1"
            title="Choose Theme"
          >
            <Palette size={13} style={{ color: theme.primary }} />
          </button>
        )}
        <button
          onClick={() => setShowFullPreview(true)}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
          title="Fullscreen Reading Mode"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-2 sm:p-6 md:p-8 pb-20 sm:pb-8 custom-scrollbar flex justify-center items-start premium-note-render-container">
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-3" />
            <p className="text-neutral-400 text-sm font-medium">Assembling Document Canvas...</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full max-w-[820px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border rounded-2xl p-4 sm:p-10 md:p-14 flex flex-col premium-note-render transition-transform duration-200 origin-top"
            style={{
              backgroundColor: displayBg,
              color: displayText,
              borderColor: displayBorder,
              minHeight: "min(297mm, 100%)",
              height: "fit-content",
              transform: `scale(${zoomLevel / 100})`
            }}
          >
            {renderContent("max-w-none")}
          </div>
        )}
      </div>

      {/* Fullscreen Reading Modal (Mounted directly to document.body) */}
      {showFullPreview &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-2 sm:p-6 overflow-hidden">
            {/* Backdrop overlay */}
            <div className="absolute inset-0" onClick={() => setShowFullPreview(false)} />

            {/* Modal Window */}
            <div
              className="relative z-10 w-full max-w-5xl h-[94vh] max-h-[94vh] flex flex-col rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-[#07070a] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] overflow-hidden"
              style={{ fontFamily: displayFont }}
            >
              {/* Modal Header */}
              <div className="h-14 bg-[#0a0a0e]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-none truncate">
                      Fullscreen Reading Canvas
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="font-semibold text-neutral-300">{theme.name} Theme</span>
                      <span className="text-neutral-600 hidden sm:inline">•</span>
                      <span className="text-neutral-500 hidden sm:inline">Press ESC to exit</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenThemeModal && (
                    <button
                      onClick={onOpenThemeModal}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <Palette size={13} style={{ color: theme.primary }} />
                      <span>Theme</span>
                    </button>
                  )}
                  {onGeneratePDF && (
                    <button
                      onClick={onGeneratePDF}
                      disabled={isGenerating}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
                    </button>
                  )}
                  <button
                    onClick={copyAllText}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>Copy Text</span>
                  </button>
                  <button
                    className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    onClick={() => setShowFullPreview(false)}
                    title="Close Fullscreen (Esc)"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Canvas Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar flex justify-center items-start premium-note-render-container">
                <div
                  ref={modalContainerRef}
                  className="w-full max-w-[840px] shadow-2xl border rounded-2xl p-6 sm:p-12 md:p-16 flex flex-col premium-note-render my-auto"
                  style={{
                    backgroundColor: displayBg,
                    color: displayText,
                    borderColor: displayBorder,
                    minHeight: "min(297mm, 100%)",
                    height: "fit-content"
                  }}
                >
                  {renderContent("max-w-none")}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

// --- 2. QUIZ MODE INTERACTIVE RENDERER ---
const QuizRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const questions = content.split(/(?=\n(?:Q\d+|Question \d+|\d+\.)[:\s])/i).filter(Boolean);

  const toggleReveal = (idx: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (questions.length <= 1) {
    return (
      <div className="prose prose-invert prose-sm max-w-none chat-prose">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
        <Brain size={14} className="text-emerald-400" />
        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Active Recall Quiz</span>
      </div>

      <div className="space-y-2.5">
        {questions.map((q, idx) => {
          const isRevealed = revealed.has(idx);
          const parts = q.split(/(?=\n(?:Answer|Correct Answer|Ans)[:\s])/i);
          const questionText = parts[0];
          const answerText = parts.slice(1).join("\n").replace(/^(?:Answer|Correct Answer|Ans)[:\s]*/i, "");

          return (
            <div
              key={idx}
              className="bg-[#0f0f13] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-200"
            >
              <div className="p-3">
                <div className="prose prose-invert prose-xs max-w-none chat-prose">
                  <ReactMarkdown>{questionText}</ReactMarkdown>
                </div>
                {answerText && (
                  <button
                    type="button"
                    onClick={() => toggleReveal(idx)}
                    className={cn(
                      "mt-2.5 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                      isRevealed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.08]"
                    )}
                  >
                    {isRevealed ? "✅ Answer Revealed" : "👁 Reveal Answer"}
                  </button>
                )}
              </div>
              <AnimatePresence>
                {isRevealed && answerText && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#061810] border-t border-emerald-500/30 p-3"
                  >
                    <div className="prose prose-invert prose-xs max-w-none chat-prose text-emerald-200">
                      <ReactMarkdown>{`✅ **Answer:** ${answerText}`}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-neutral-500 text-center mt-2">🎯 Test your active recall by answering each question before revealing.</p>
    </div>
  );
};

// --- 3. MODE AWARE MESSAGE RENDERER ---
const ModeMessageRenderer: React.FC<{ 
  content: string; 
  mode?: string;
  onActionClick?: (actionPrompt: string) => void;
}> = ({ content, mode, onActionClick }) => {
  if (!content) return null;

  if (mode === "quiz") {
    return <QuizRenderer content={content} />;
  }

  // Extract trailing action tags ```actions [⚡ Explain Simply] [💡 Give Example] ... ```
  let mainContent = content;
  let actionChips: string[] = [];
  const actionMatch = content.match(/```actions\s*([\s\S]*?)\s*```/i);
  if (actionMatch) {
    mainContent = content.replace(actionMatch[0], "").trim();
    const rawChips = actionMatch[1].match(/\[(.*?)\]/g);
    if (rawChips) {
      actionChips = rawChips.map((c) => c.replace(/^\[|\]$/g, "").trim()).filter(Boolean);
    }
  }

  // Clean redundant 00:00 timestamps from text
  mainContent = mainContent
    .replace(/\(\s*\[(?:⏱️\s*)?0{1,2}:00(?::00)?\]\([^)]*\)\s*\)/g, "")
    .replace(/\[(?:⏱️\s*)?0{1,2}:00(?::00)?\]\([^)]*\)/g, "")
    .replace(/\(\s*(?:⏱️\s*)?0{1,2}:00(?::00)?\s*\)/g, "")
    .trim();

  const modeBadgeMap: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    tutor: { label: "Socratic AI Tutor", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/25" },
    study: { label: "Active Study Session", icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/25" },
    exam_prep: { label: "High-Yield Exam Prep", icon: Target, color: "text-red-400", bg: "bg-red-500/10 border-red-500/25" },
    deep_dive: { label: "Academic Deep Dive", icon: Search, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/25" },
    explain_simply: { label: "Explain Simply (ELI5)", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25" },
    coding_tutor: { label: "Coding Tutor", icon: Code, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
    problem_solver: { label: "Math & Problem Solver", icon: Calculator, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/25" },
    quick: { label: "Quick Answer", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/25" },
    revision: { label: "Rapid Revision", icon: RefreshCw, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/25" }
  };

  const badge = mode ? modeBadgeMap[mode] : null;

  return (
    <div className="font-sans space-y-2.5">
      {badge && (
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm", badge.bg)}>
          <badge.icon size={11} className={badge.color} />
          <span className={badge.color}>{badge.label}</span>
        </div>
      )}

      <div className="prose prose-invert prose-sm max-w-none chat-prose">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h3: ({ children, ...props }) => {
              const text = String(children || "");
              if (text.includes("💡") || text.toLowerCase().includes("analogy") || text.toLowerCase().includes("intuition")) {
                return (
                  <div className="mt-3.5 mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 font-bold text-xs flex items-center gap-2">
                    <Lightbulb size={13} className="text-amber-400 shrink-0" />
                    <span>{children}</span>
                  </div>
                );
              }
              if (text.includes("🔴") || text.toLowerCase().includes("exam") || text.toLowerCase().includes("takeaway")) {
                return (
                  <div className="mt-3.5 mb-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 font-bold text-xs flex items-center gap-2">
                    <Target size={13} className="text-red-400 shrink-0" />
                    <span>{children}</span>
                  </div>
                );
              }
              if (text.includes("⚠️") || text.toLowerCase().includes("pitfall") || text.toLowerCase().includes("trap")) {
                return (
                  <div className="mt-3.5 mb-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/35 text-amber-200 font-bold text-xs flex items-center gap-2">
                    <AlertCircle size={13} className="text-amber-400 shrink-0" />
                    <span>{children}</span>
                  </div>
                );
              }
              if (text.includes("🎯") || text.toLowerCase().includes("check") || text.toLowerCase().includes("question")) {
                return (
                  <div className="mt-3.5 mb-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 font-bold text-xs flex items-center gap-2">
                    <Brain size={13} className="text-purple-400 shrink-0" />
                    <span>{children}</span>
                  </div>
                );
              }
              if (text.includes("💻") || text.toLowerCase().includes("code")) {
                return (
                  <div className="mt-3.5 mb-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-bold text-xs flex items-center gap-2">
                    <Code size={13} className="text-emerald-400 shrink-0" />
                    <span>{children}</span>
                  </div>
                );
              }
              if (text.includes("🧮") || text.toLowerCase().includes("formula") || text.toLowerCase().includes("derivation")) {
                return (
                  <div className="mt-3.5 mb-2 p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/25 text-pink-300 font-bold text-xs flex items-center gap-2">
                    <Calculator size={13} className="text-pink-400 shrink-0" />
                    <span>{children}</span>
                  </div>
                );
              }
              return <h3 className="text-xs font-bold text-neutral-200 mt-3 mb-1.5" {...props}>{children}</h3>;
            },
            pre: ({ children, ...props }) => (
              <div className="relative group my-2.5">
                <pre className="bg-[#0b0c10] border border-white/10 rounded-xl p-3.5 overflow-x-auto text-[11.5px] font-mono text-neutral-200" {...props}>
                  {children}
                </pre>
              </div>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-white/[0.08] text-red-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-white/[0.06]" {...props}>
                    {children}
                  </code>
                );
              }
              return <code className={className} {...props}>{children}</code>;
            },
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-2 border-red-500/60 bg-white/[0.03] pl-3 py-1.5 my-2 rounded-r-lg text-neutral-300 text-xs italic" {...props}>
                {children}
              </blockquote>
            ),
            a: ({ href, children, ...props }) => {
              const isTimestamp = href?.includes("youtube.com") && href?.includes("&t=");
              if (isTimestamp) {
                const isZero = href?.includes("&t=0s") || href?.includes("&t=0") || String(children).includes("00:00") || String(children).includes("0:00");
                if (isZero) return null;

                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paperxify-timestamp-badge"
                    {...props}
                  >
                    <svg className="timestamp-play-icon inline-block w-2.5 h-2.5 mr-1 text-red-500 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>{children}</span>
                  </a>
                );
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-400 underline hover:text-red-300 font-medium" {...props}>
                  {children}
                </a>
              );
            }
          }}
        >
          {mainContent}
        </ReactMarkdown>
      </div>

      {actionChips.length > 0 && onActionClick && (
        <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500 mr-0.5">Quick Actions:</span>
          {actionChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onActionClick(chip)}
              className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-red-500/15 border border-white/[0.08] hover:border-red-500/30 text-neutral-300 hover:text-red-300 text-[10.5px] font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-[0.97]"
            >
              <span>{chip}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 4. EXPORT DIALOG COMPONENT ---
interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSubscribed: boolean;
  onExportPDF: () => void;
  onExportMarkdown: () => void;
  isGeneratingPDF: boolean;
  router: any;
  noteTitle: string;
  noteContent: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  isSubscribed,
  onExportPDF,
  onExportMarkdown,
  isGeneratingPDF,
  router,
  noteTitle,
  noteContent
}) => {
  const [notionStep, setNotionStep] = useState<"options" | "upgrade" | "connect" | "syncing">("options");

  useEffect(() => {
    if (!isOpen) setNotionStep("options");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNotionClick = () => {
    if (!isSubscribed) {
      setNotionStep("upgrade");
    } else {
      const savedToken = localStorage.getItem("notion_token");
      if (savedToken) {
        triggerNotionSync();
      } else {
        setNotionStep("connect");
      }
    }
  };

  const triggerNotionSync = async () => {
    setNotionStep("syncing");
    const notionToken = localStorage.getItem("notion_token");
    try {
      const isHtml = /<[a-z][\s\S]*>/i.test(noteContent);
      let markdown = noteContent;
      if (isHtml) {
        const turndownService = new TurndownService();
        markdown = turndownService.turndown(noteContent);
      }

      const response = await fetch("/api/notion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteTitle,
          noteContent: markdown,
          notionToken
        })
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success("Note synced to Notion successfully!");
        onClose();
        if (resData.pageUrl) window.open(resData.pageUrl, "_blank");
      } else {
        toast.error(resData.message || "Failed to sync to Notion");
        setNotionStep("options");
      }
    } catch (err) {
      console.error(err);
      toast.error("Notion sync failed due to network error.");
      setNotionStep("options");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-[#09090d]/98 border border-white/[0.12] rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] overflow-hidden z-10"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        {notionStep === "options" && (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Paperxify Export Engine
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Export Your Study Notes</h3>
              <p className="text-xs text-neutral-400 mt-1">Convert and export notes in your favorite productivity formats.</p>
            </div>

            <div className="space-y-3">
              {/* PDF Export */}
              <button
                onClick={() => {
                  onExportPDF();
                  onClose();
                }}
                disabled={isGeneratingPDF}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#121216] border border-white/[0.08] hover:border-red-500/40 hover:bg-[#18181f] text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 group-hover:scale-105 transition-transform shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Export as PDF Document</div>
                  <div className="text-xs text-neutral-400 truncate">Print-ready document styled with active theme colors</div>
                </div>
              </button>

              {/* Markdown Export */}
              <button
                onClick={() => {
                  onExportMarkdown();
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#121216] border border-white/[0.08] hover:border-blue-500/40 hover:bg-[#18181f] text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                  <Download size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Export as Markdown (.md)</div>
                  <div className="text-xs text-neutral-400 truncate">Perfect for Obsidian, Logseq, and Notion imports</div>
                </div>
              </button>

              {/* Notion Sync */}
              <button
                onClick={handleNotionClick}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#121216] border border-white/[0.08] hover:border-amber-500/40 hover:bg-[#18181f] text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M4.459 4.208c.15-.226.338-.376.812-.489l11.458-1.579c.902-.131 1.09.113 1.09.808v16.143c0 .545-.169.752-.77.827L5.85 20.916c-.507.075-.77-.132-.77-.733V4.866c0-.282.169-.47.282-.658h.097zM2.017 3.325c-.244.188-.413.489-.413.921v16.293c0 .921.619 1.485 1.54 1.353l17.788-2.312c.732-.094.957-.451.957-1.127V2.518c0-.752-.451-1.071-1.127-.978L3.107 3.006c-.544.075-.92.15-1.09.319zm13.111 4.549c.282-.038.508.15.508.47v7.501c0 .282-.207.451-.508.489l-2.067.169v-.094c.169-.131.282-.376.282-.676v-5.263l-4.116 5.864c-.169.244-.413.395-.732.413l-1.955.15c-.282.019-.488-.169-.488-.47v-7.389c0-.282.207-.47.507-.507l1.936-.15v.094c-.15.113-.263.357-.263.639v5.094l3.966-5.714c.188-.263.413-.395.77-.413l2.171-.17v.019z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    <span>Sync to Notion Workspace</span>
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Pro</span>
                  </div>
                  <div className="text-xs text-neutral-400 truncate">Push formatted notes straight into your Notion pages</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {notionStep === "upgrade" && (
          <div className="text-center py-4 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mb-4">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Notion Sync is a Pro Feature</h3>
            <p className="text-xs text-neutral-400 mt-2 max-w-xs leading-relaxed">
              Upgrade to Paperxify Pro to unlock direct Notion syncing, publication PDF exports, and deep AI models.
            </p>
            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setNotionStep("options")}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Upgrade to Pro →
              </button>
            </div>
          </div>
        )}

        {notionStep === "connect" && (
          <div className="text-center py-4 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Connect Notion Account</h3>
            <p className="text-xs text-neutral-400 mt-2 max-w-xs leading-relaxed">
              Grant Paperxify access to create and sync notes in your Notion workspace.
            </p>
            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setNotionStep("options")}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("notion_redirect_back", window.location.pathname);
                  window.location.href =
                    "https://api.notion.com/v1/oauth/authorize?client_id=36ad872b-594c-8107-a869-00370d5b7599&response_type=code&owner=user&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fnotion%2Fcallback";
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Authorize Notion
              </button>
            </div>
          </div>
        )}

        {notionStep === "syncing" && (
          <div className="text-center py-8 flex flex-col items-center">
            <Loader2 className="animate-spin text-red-500 mb-4" size={36} />
            <h3 className="text-lg font-bold text-white">Syncing to Notion...</h3>
            <p className="text-xs text-neutral-400 mt-1">Publishing formatted blocks to your Notion workspace.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- THEME STUDIO MODAL COMPONENT ---
interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTheme: NoteTheme;
  onSelectTheme: (t: NoteTheme) => void;
  userPlan?: UserPlan;
}

const THEME_CATEGORIES = [
  { id: "all", label: "All Themes", icon: "✨" },
  { id: "light", label: "Light", icon: "☀️" },
  { id: "professional", label: "Professional", icon: "🏛️" },
  { id: "colorful", label: "Colorful", icon: "🎨" },
  { id: "dark", label: "Dark Mode", icon: "🌙" },
];

const ThemeStudioModal: React.FC<ThemeStudioModalProps> = ({
  isOpen,
  onClose,
  selectedTheme,
  onSelectTheme,
  userPlan = "free",
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const filteredThemes = THEMES.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.font.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative w-full max-w-3xl bg-[#09090d]/95 backdrop-blur-2xl border border-white/[0.12] rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-10 max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-[#0d0d12]/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
                <Palette size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Document Theme Studio</h3>
                <p className="text-[11px] text-neutral-400">Choose from 26 tailored typography & color systems</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Search & Category Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by theme name, font, or mood..."
                className="w-full h-8 pl-3 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-neutral-500 focus:border-red-500/50 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Segmented Filter */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-0.5 bg-black/40 border border-white/[0.06] rounded-xl">
              {THEME_CATEGORIES.map((cat) => {
                const count =
                  cat.id === "all" ? THEMES.length : THEMES.filter((t) => t.category === cat.id).length;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1",
                      isActive
                        ? "bg-white/[0.12] text-white shadow-sm font-bold"
                        : "text-neutral-400 hover:text-neutral-200"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className="text-[9px] opacity-60 ml-0.5">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {filteredThemes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-medium text-neutral-400">No themes found matching "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white font-semibold transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredThemes.map((t) => {
                const isSelected = selectedTheme.id === t.id;
                const plan = getThemePlan(t.id);

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTheme(t);
                      onClose();
                      toast.success(`Applied ${t.name} Theme`);
                    }}
                    className={cn(
                      "group relative p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between gap-3 overflow-hidden",
                      isSelected
                        ? "bg-gradient-to-br from-red-950/40 to-[#0e0e14] border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)] ring-1 ring-red-500/30"
                        : "bg-[#0f0f14]/80 hover:bg-[#14141c] border-white/[0.08] hover:border-white/20 shadow-md"
                    )}
                  >
                    {/* Top Row: Mini Paper Canvas + Header info */}
                    <div className="flex items-start gap-3">
                      {/* Mini Paper Swatch Preview */}
                      <div
                        className="w-14 h-16 rounded-xl border shadow-inner shrink-0 p-1.5 flex flex-col justify-between transition-transform group-hover:scale-105"
                        style={{ backgroundColor: t.bg, borderColor: t.border }}
                      >
                        <div
                          className="text-[8px] font-black uppercase tracking-tight truncate leading-none"
                          style={{ color: t.primary }}
                        >
                          Heading
                        </div>
                        <div className="space-y-0.5">
                          <div className="h-1 rounded-full opacity-60" style={{ backgroundColor: t.text }} />
                          <div className="h-1 w-3/4 rounded-full opacity-40" style={{ backgroundColor: t.text }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: t.primary }} />
                          <span className="w-1.5 h-1.5 rounded-full opacity-70" style={{ backgroundColor: t.accent }} />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">
                            {t.name}
                          </h4>
                          {plan === "free" ? (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Free
                            </span>
                          ) : plan === "power" ? (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20">
                              Power
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              Pro
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                          {t.desc || "Crisp clean textbook styling"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Font tag + Selection CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px]">
                      <span className="font-mono text-neutral-500 truncate max-w-[170px]">
                        {t.font.replace(/'/g, "").split(",")[0]}
                      </span>

                      {isSelected ? (
                        <span className="flex items-center gap-1 font-bold text-red-400">
                          <Check size={12} strokeWidth={3} />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400 group-hover:text-white font-medium transition-colors">
                          Apply Theme →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// --- MAIN NOTE PAGE COMPONENT ---
export default function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  // Data State
  const [data, setData] = useState<NoteData | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "editor" | "chat">("preview");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  // Active theme state
  const [selectedTheme, setSelectedTheme] = useState<NoteTheme>(THEMES[0]);

  // Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan>("free");

  // Editor State
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const tinyMceRef = useRef<any>(null);

  // Chat State
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("Thinking...");
  const [selectedMode, setSelectedMode] = useState(CHAT_MODES[0]);

  // Persisted AI model selection
  const [selectedChatModel, setSelectedChatModelRaw] = useState(() => {
    if (typeof window === "undefined") return CHAT_AI_MODELS[0];
    const saved = localStorage.getItem("paperchat_selected_model");
    if (saved) {
      const found = CHAT_AI_MODELS.find((m) => m.id === saved);
      if (found) return found;
    }
    return CHAT_AI_MODELS[0];
  });

  const setSelectedChatModel = (m: (typeof CHAT_AI_MODELS)[0]) => {
    setSelectedChatModelRaw(m);
    if (typeof window !== "undefined") {
      localStorage.setItem("paperchat_selected_model", m.id);
    }
  };

  const [showModelPicker, setShowModelPicker] = useState(false);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  // Persisted free message counts
  const [freeModelCounts, setFreeModelCountsRaw] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("paperchat_free_counts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const setFreeModelCounts = (updater: (prev: Record<string, number>) => Record<string, number>) => {
    setFreeModelCountsRaw((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        localStorage.setItem("paperchat_free_counts", JSON.stringify(next));
      }
      return next;
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // PDF Generation State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Close model picker on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch Note Data
  const loadNoteData = useCallback(async () => {
    try {
      setLoading(true);
      const authToken = getAuthToken();

      // Check User Subscription
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          const active = !!userObj.membership?.isActive;
          setIsSubscribed(active);
          if (active) {
            const planName = (userObj.membership?.plan || "").toLowerCase();
            if (planName.includes("power")) setUserPlan("power");
            else setUserPlan("pro");
          } else {
            setUserPlan("free");
          }
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }

      // Check Mock Notes First
      if (MOCK_NOTES[slug]) {
        const mockNote = MOCK_NOTES[slug];
        setData({
          _id: mockNote._id,
          title: mockNote.title,
          content: mockNote.content,
          videoUrl: mockNote.videoUrl,
          thumbnail: mockNote.thumbnail,
          generationDetails: mockNote.generationDetails
        });

        // Set theme
        const tId = mockNote.generationDetails?.theme || "atmosphere";
        const foundT = THEMES.find((t) => t.id === tId) || THEMES[0];
        setSelectedTheme(foundT);

        const rawContent = mockNote.content || "";
        const isRawHtml = /^\s*</.test(rawContent);
        let htmlContent = rawContent;
        if (!isRawHtml && rawContent.trim()) {
          htmlContent = marked.parse(rawContent) as string;
        }
        htmlContent = makeTimestampsClickable(htmlContent, mockNote.videoUrl);
        setMarkdownContent(htmlContent);
        setMessages(mockNote.messages);
        setLoading(false);
        return;
      }

      // Fetch Real Note from API
      const res = await api.get(`/notes/slug/${slug}`, { headers: { Auth: authToken } });
      setData(res.data);

      const tId = res.data.generationDetails?.theme || "atmosphere";
      const foundT = THEMES.find((t) => t.id === tId) || THEMES[0];
      setSelectedTheme(foundT);

      const rawContent = res.data.content || "";
      const isRawHtml = /^\s*</.test(rawContent);
      const isFlashcardNote =
        res.data.generationDetails?.format === "flashcards" ||
        (rawContent.trim().startsWith("[") && rawContent.includes('"front"'));

      let htmlContent = rawContent;
      if (!isRawHtml && !isFlashcardNote && rawContent.trim()) {
        htmlContent = marked.parse(rawContent) as string;
      }
      htmlContent = makeTimestampsClickable(htmlContent, res.data.videoUrl);
      setMarkdownContent(htmlContent);

      // Load Messages
      try {
        const msgRes = await api.get<ApiMessagesResponse>(`/chat/getMessages/${res.data._id}`, { headers: { Auth: authToken } });
        if (msgRes.data && Array.isArray(msgRes.data.messages) && msgRes.data.messages.length > 0) {
          setMessages(msgRes.data.messages);
        } else {
          setMessages([
            {
              _id: "welcome-" + Date.now(),
              role: "assistant",
              content: `Hello! I am PaperChat, your personal AI Tutor for **${res.data.title}**. Let's explore the key concepts, formulas, exam tips, or run an active recall quiz!`,
              timestamp: new Date().toISOString(),
              mode: "tutor"
            }
          ]);
        }
      } catch (e) {
        setMessages([
          {
            _id: "welcome-" + Date.now(),
            role: "assistant",
            content: `Hello! I am PaperChat, your personal AI Tutor for **${res.data.title}**. How can I help you explore this note?`,
            timestamp: new Date().toISOString(),
            mode: "tutor"
          }
        ]);
      }
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        setHasPermission(false);
        setShowLoginDialog(true);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadNoteData();
  }, [loadNoteData]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === "chat" || (typeof window !== "undefined" && window.innerWidth >= 1024)) {
      const timer = setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isThinking, activeTab]);

  // Thinking Message Cycler
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isThinking) {
      const msgs = ["Analyzing note content...", "Reasoning...", "Synthesizing answer...", "Formulating response..."];
      let i = 0;
      interval = setInterval(() => {
        setThinkingMessage(msgs[i % msgs.length]);
        i++;
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  // Save Note Changes
  const handleSave = async () => {
    if (!data?._id) return;
    if (data._id.startsWith("mock-note")) {
      setIsDirty(false);
      toast.success("Note saved successfully (Demo Mode)");
      return;
    }
    try {
      await api.put(`/notes/update/${data._id}`, { content: markdownContent }, { headers: { Auth: getAuthToken() } });
      setIsDirty(false);
      toast.success("Note changes saved to cloud!");
    } catch {
      toast.error("Failed to save changes");
    }
  };

  // Feedback handler
  const handleFeedback = async (messageId: string, feedback: "good" | "bad") => {
    if (!data?._id) return;
    setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, feedback } : msg)));

    if (data._id.startsWith("mock-note")) {
      toast.success(feedback === "good" ? "Glad this was helpful!" : "Thanks for the feedback.");
      return;
    }
    try {
      await api.post("/chat/feedback", { noteId: data._id, messageId, feedback });
      toast.success(feedback === "good" ? "Glad this was helpful!" : "Thanks for the feedback.");
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  // Check model permission
  const currentModelFreeCount = freeModelCounts[selectedChatModel.id] || 0;
  const isModelUnlimited = PLAN_UNLIMITED[userPlan].includes(selectedChatModel.id);
  const canUseModel = isModelUnlimited || currentModelFreeCount < selectedChatModel.freeLimit;

  // Send Chat Message with custom text & mode support
  const sendCustomMessage = async (customText?: string, customMode?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isThinking || !canUseModel) return;

    const currentMode = customMode || selectedMode.id;
    const userMsg: ApiMessage = {
      _id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
      mode: currentMode
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setIsThinking(true);

    try {
      const authToken = getAuthToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Auth: authToken || ""
        },
        body: JSON.stringify({
          noteId: data?._id || "mock-note-general",
          message: userMsg.content,
          mode: currentMode,
          chatModelPersona: selectedChatModel.persona,
          chatModelId: selectedChatModel.id,
          userPlan: userPlan,
          noteTitle: data?.title || "Study Lecture Notes",
          noteContent: markdownContent || "",
          videoUrl: data?.videoUrl || "https://www.youtube.com"
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        if (response.status === 403 || errJson?.code === "QUOTA_EXCEEDED") {
          setMessages((prev) => [
            ...prev,
            {
              _id: "quota-err-" + Date.now(),
              role: "assistant",
              content: `⚠️ **Message Quota Limit Reached**\n\n${errJson?.message || "You've reached your PaperChat message quota for this billing period."}\n\n👉 [**Upgrade to Pro or Power Scholar**](/pricing) to unlock thousands of messages, turbo priority queue, and advanced models.`,
              timestamp: new Date().toISOString(),
              mode: currentMode
            }
          ]);
          return;
        }
        throw new Error(errJson?.message || "Failed to connect to chat service");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const aiMsgId = (Date.now() + 1).toString();
      const initialAiMsg: ApiMessage = {
        _id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        videoLink: data?.videoUrl,
        mode: currentMode
      };

      setMessages((prev) => [...prev, initialAiMsg]);
      setIsThinking(false);

      let accumulatedContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              if (dataStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  setMessages((prev) =>
                    prev.map((msg) => (msg._id === aiMsgId ? { ...msg, content: accumulatedContent } : msg))
                  );
                }
              } catch (e) {
                console.warn("Error parsing chunk", e);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Chat Error:", e);
      setMessages((prev) => [
        ...prev,
        {
          _id: "err-" + Date.now(),
          role: "assistant",
          content: "Sorry, I encountered an error while connecting to the AI Tutor. Please try asking again.",
          timestamp: new Date().toISOString(),
          mode: currentMode
        }
      ]);
    } finally {
      setIsThinking(false);
      if (!isModelUnlimited) {
        setFreeModelCounts((prev) => ({
          ...prev,
          [selectedChatModel.id]: (prev[selectedChatModel.id] || 0) + 1
        }));
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendCustomMessage();
  };

  // Generate Production-Grade Themed PDF
  const generatePDF = async () => {
    if (!data || !markdownContent) return;

    setIsGeneratingPDF(true);
    const toastId = toast.loading("⏳ Assembling High-Resolution Publication PDF...");

    try {
      const targetEl = (document.querySelector(".premium-note-render") || document.querySelector(".premium-note-render-container")) as HTMLElement | null;

      if (!targetEl) {
        throw new Error("Note canvas element is not ready. Please try again.");
      }

      const result = await exportNotesToPdf({
        title: data.title || "Lecture Study Guide",
        videoUrl: data.videoUrl,
        videoId: data.videoId,
        theme: selectedTheme,
        targetElement: targetEl,
        authorName: data.ownerName || "Paperxify Scholar",
      });

      if (result.success) {
        toast.success(`✅ PDF exported successfully! (${result.pageCount} page${result.pageCount !== 1 ? "s" : ""})`, { id: toastId });
      }
    } catch (err: any) {
      console.error("Client-side PDF export error:", err);
      toast.error(err.message || "PDF export failed. Please try again.", { id: toastId });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Export Markdown
  const exportMarkdown = () => {
    if (!markdownContent || !data) return;
    try {
      const isHtml = /<[a-z][\s\S]*>/i.test(markdownContent);
      let md = markdownContent;
      if (isHtml) {
        const turndownService = new TurndownService();
        md = turndownService.turndown(markdownContent);
      }
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${data.title.replace(/[^\w\s.-]/gi, "_").substring(0, 80)}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Markdown file downloaded!");
    } catch {
      toast.error("Failed to export Markdown");
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Share link copied to clipboard!");
    }
  };

  const isFlashcard =
    data?.generationDetails?.format === "flashcards" ||
    (data?.content && data.content.trim().startsWith("[") && data.content.includes('"front"'));

  if (loading) return <LoaderX />;

  if (!hasPermission)
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <Lock className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <Button onClick={() => setShowLoginDialog(true)} className="mt-4 bg-red-600">
          Sign In to Access Notes
        </Button>
        <LoginDialog
          isOpen={showLoginDialog}
          onClose={() => router.push("/youtube-to-notes")}
          onSuccess={() => {
            setShowLoginDialog(false);
            loadNoteData();
          }}
        />
      </div>
    );

  return (
    <div className="h-screen h-[100dvh] w-screen bg-black flex flex-col overflow-hidden text-neutral-200 font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
      </div>

      {/* ─── 1. TOP STUDIO WORKSPACE NAVIGATION BAR ─── */}
      <header className="h-14 bg-[#08080a]/95 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-5 shrink-0 z-40 relative">
        {/* Left: Back Action + Note Title + Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => router.push("/youtube-to-notes")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-neutral-300 hover:text-white transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Workspace</span>
          </button>

          <div className="w-[1px] h-4 bg-white/10 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[150px] sm:max-w-[280px] md:max-w-[380px]">
              {data?.title || "Study Note"}
            </h1>

            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[10px] font-bold text-red-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {isFlashcard ? "Flashcards" : "Smart Notes"}
            </span>

            {isDirty ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 shrink-0">
                ● Unsaved
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 shrink-0">
                <Check size={11} strokeWidth={3} /> Saved
              </span>
            )}
          </div>
        </div>

        {/* Center: Desktop Segmented View Control */}
        <div className="hidden lg:flex items-center p-1 rounded-xl bg-[#121216] border border-white/[0.08]">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeTab === "preview"
                ? "bg-white text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Eye size={13} />
            <span>Document Preview</span>
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeTab === "editor"
                ? "bg-white text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Edit size={13} />
            <span>Live Editor</span>
          </button>
        </div>

        {/* Right: Theme Picker & Export & Share */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Selector Button */}
          {!isFlashcard && (
            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Change Document Theme"
            >
              <div
                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: selectedTheme.primary }}
              />
              <span className="hidden sm:inline">{selectedTheme.name}</span>
            </button>
          )}

          {/* Export Note Button */}
          {!isFlashcard && (
            <button
              onClick={() => setShowExportDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export Note</span>
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={copyShareLink}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Copy Share Link"
          >
            <Share2 size={13} />
          </button>
        </div>
      </header>

      {/* ─── 2. MAIN WORKSPACE BODY ─── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* LEFT / CENTER PANEL: Document Preview & Live Editor */}
        <div className={`flex-1 flex flex-col min-h-0 lg:border-r border-white/[0.08] ${activeTab === "chat" ? "hidden lg:flex" : "flex"}`}>
          
          <div className="flex-1 overflow-hidden relative">
            
            {/* VIEW: DOCUMENT PREVIEW */}
            <div className={`absolute inset-0 p-0 sm:p-3 lg:p-4 transition-opacity duration-200 ${activeTab === "preview" ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}>
              {isFlashcard ? (
                <div className="w-full h-full border border-white/[0.08] shadow-2xl overflow-hidden rounded-2xl bg-[#0c0c0e] relative flex flex-col">
                  <FlashcardViewer content={markdownContent} />
                </div>
              ) : (
                <PDFPreviewWithThumbnail
                  content={markdownContent}
                  isGenerating={isGeneratingPDF}
                  onGeneratePDF={generatePDF}
                  themeId={selectedTheme.id}
                  onThemeChange={setSelectedTheme}
                  onOpenThemeModal={() => setShowThemeModal(true)}
                  videoUrl={data?.videoUrl}
                />
              )}
            </div>

            {/* VIEW: LIVE NOTE EDITOR */}
            <div className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${activeTab === "editor" ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}>
              {/* Editor Top Control Bar */}
              <div className="px-3.5 py-2.5 bg-[#0a0a0d] border-b border-white/[0.08] flex items-center justify-between shrink-0 gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-200">Live Editor</span>
                  </div>

                  {/* Theme Switcher Pill in Editor */}
                  <button
                    onClick={() => setShowThemeModal(true)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs transition-colors group cursor-pointer"
                    title="Change Theme for Editor & Notes"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: selectedTheme.primary }}
                    />
                    <span className="text-neutral-300 font-semibold group-hover:text-white truncate max-w-[120px]">
                      {selectedTheme.name}
                    </span>
                    <Palette size={11} className="text-neutral-500 group-hover:text-neutral-300 ml-0.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>View Preview</span>
                  </button>

                  {isDirty && (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer animate-bounce-short"
                    >
                      <Save size={13} />
                      <span>Save Changes</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TinyMCE Container Styled with Theme */}
              <div
                className="flex-1 overflow-hidden"
                style={{ backgroundColor: selectedTheme.bg }}
              >
                <Editor
                  key={`tinymce-editor-${selectedTheme.id}`}
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  onInit={(_, editor) => (tinyMceRef.current = editor)}
                  value={markdownContent}
                  init={{
                    height: "100%",
                    menubar: true,
                    skin: selectedTheme.bg === "#000000" || selectedTheme.bg.startsWith("#0") || selectedTheme.bg.startsWith("#1") ? "oxide-dark" : "oxide",
                    content_css: selectedTheme.bg === "#000000" || selectedTheme.bg.startsWith("#0") || selectedTheme.bg.startsWith("#1") ? "dark" : "default",
                    plugins: [
                      "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                      "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                      "insertdatetime", "media", "table", "help", "wordcount"
                    ],
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | " +
                      "bold italic underline strikethrough | forecolor backcolor | " +
                      "alignleft aligncenter alignright alignjustify | " +
                      "bullist numlist outdent indent | table link image code | removeformat",
                    content_style: `
                      @import url('${selectedTheme.googleFont || "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"}');
                      body { 
                        font-family: ${selectedTheme.font || "'Inter', sans-serif"} !important; 
                        background-color: ${selectedTheme.bg} !important;
                        color: ${selectedTheme.text} !important;
                        font-size: 15px !important; 
                        padding: 36px 28px !important; 
                        line-height: 1.75 !important;
                        max-width: 820px !important;
                        margin: 0 auto !important;
                        -webkit-font-smoothing: antialiased;
                      }
                      body > *[style*="padding" i] {
                        padding: 0px !important;
                      }
                      h1, h2, h3, h4, h5, h6 {
                        color: ${selectedTheme.primary} !important;
                        font-family: ${selectedTheme.font || "'Inter', sans-serif"} !important;
                        font-weight: 700;
                        margin-top: 24px;
                        margin-bottom: 12px;
                        line-height: 1.35;
                      }
                      h1 { font-size: 26px; font-weight: 800; margin-bottom: 20px; }
                      h2 { font-size: 19px; border-bottom: 1.5px solid ${selectedTheme.border} !important; padding-bottom: 8px; margin-top: 32px; margin-bottom: 14px; }
                      h3 { font-size: 16px; font-weight: 600; margin-top: 22px; margin-bottom: 10px; }
                      p, li { 
                        color: ${selectedTheme.text} !important; 
                        font-size: 15px !important;
                        line-height: 1.75 !important;
                        margin-bottom: 16px; 
                      }
                      ul, ol { margin-bottom: 16px; padding-left: 24px; }
                      li { margin-bottom: 6px; }
                      blockquote {
                        background-color: ${selectedTheme.cardBg} !important;
                        border-left: 3.5px solid ${selectedTheme.primary} !important;
                        color: ${selectedTheme.text} !important;
                        padding: 14px 18px;
                        border-radius: 0 12px 12px 0;
                        margin: 20px 0;
                        font-size: 14.5px;
                        line-height: 1.7;
                      }
                      table {
                        border: 1px solid ${selectedTheme.border} !important;
                        background-color: ${selectedTheme.cardBg} !important;
                        width: 100%;
                        border-radius: 12px;
                        margin: 20px 0;
                        border-collapse: separate;
                        border-spacing: 0;
                        overflow: hidden;
                      }
                      th {
                        background-color: ${selectedTheme.border} !important;
                        color: ${selectedTheme.primary} !important;
                        font-weight: 700;
                        padding: 10px 14px;
                        text-align: left;
                        font-size: 13px;
                      }
                      td {
                        border-bottom: 1px solid ${selectedTheme.border} !important;
                        color: ${selectedTheme.text} !important;
                        padding: 10px 14px;
                      }
                      tr:last-child td {
                        border-bottom: none !important;
                      }
                      code {
                        background-color: ${selectedTheme.cardBg} !important;
                        color: ${selectedTheme.accent} !important;
                        border: 1px solid ${selectedTheme.border} !important;
                        padding: 2px 6px;
                        border-radius: 6px;
                        font-family: 'JetBrains Mono', monospace !important;
                        font-size: 13px;
                      }
                      pre {
                        background-color: #0c0d12 !important;
                        color: #e2e8f0 !important;
                        border: 1px solid rgba(255,255,255,0.1) !important;
                        border-radius: 14px;
                        padding: 18px;
                        margin: 20px 0;
                        overflow-x: auto;
                        font-family: 'JetBrains Mono', monospace !important;
                      }
                      a {
                        color: ${selectedTheme.link} !important;
                        text-decoration: underline;
                        text-underline-offset: 3px;
                      }
                      .paperxify-timestamp-badge {
                        display: inline-flex !important;
                        align-items: center !important;
                        background: rgba(239, 68, 68, 0.12) !important;
                        border: 1px solid rgba(239, 68, 68, 0.35) !important;
                        color: #ef4444 !important;
                        padding: 2px 8px !important;
                        border-radius: 6px !important;
                        font-weight: 700 !important;
                        font-size: 0.82em !important;
                        text-decoration: none !important;
                        margin: 0 3px !important;
                      }
                      img {
                        max-width: 100%;
                        border-radius: 14px;
                        margin: 22px auto;
                        border: 1px solid ${selectedTheme.border};
                        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                        display: block;
                      }
                    `
                  }}
                  onEditorChange={(c) => {
                    setMarkdownContent(c);
                    setIsDirty(true);
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PaperChat AI Study Studio */}
        <div className={`flex-1 lg:flex-[0_0_420px] xl:flex-[0_0_460px] bg-[#08080a] flex flex-col min-h-0 ${activeTab === "chat" ? "flex" : "hidden lg:flex"}`}>
          
          {/* Chat Studio Header */}
          <div className="p-3 border-b border-white/[0.08] bg-[#0c0c0f] shrink-0 relative z-30">
            <div className="flex items-center justify-between gap-2">
              
              {/* Active Model Display */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 bg-neutral-900 flex items-center justify-center shrink-0">
                  <img
                    src={selectedChatModel.logoUrl}
                    alt={selectedChatModel.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-xs" style={{ display: "none" }}>{selectedChatModel.logoFallback}</span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-none">{selectedChatModel.name}</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online
                    {!isModelUnlimited && selectedChatModel.freeLimit !== Infinity && (
                      <span className="text-neutral-500 ml-1">
                        · {Math.max(0, selectedChatModel.freeLimit - currentModelFreeCount)} free msgs
                      </span>
                    )}
                    {isModelUnlimited && <span className="text-emerald-400 font-medium ml-1">· Active</span>}
                  </p>
                </div>
              </div>

              {/* Model Switcher Button */}
              <div className="relative" ref={modelPickerRef}>
                <button
                  onClick={() => setShowModelPicker((p) => !p)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <Sparkles size={11} className="text-red-400" />
                  <span>Models</span>
                  <ChevronDown size={11} className={cn("transition-transform", showModelPicker && "rotate-180")} />
                </button>

                {/* Model Selector Dropdown */}
                <AnimatePresence>
                  {showModelPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-[#0d0d11] border border-white/[0.12] rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50"
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 px-3 py-2">Select Study AI Model</p>
                      <div className="space-y-1">
                        {CHAT_AI_MODELS.map((m) => {
                          const count = freeModelCounts[m.id] || 0;
                          const isUnlimited = PLAN_UNLIMITED[userPlan].includes(m.id);
                          const remaining = isUnlimited ? Infinity : Math.max(0, m.freeLimit - count);
                          const isLocked = !isUnlimited && remaining === 0;
                          const isActive = selectedChatModel.id === m.id;

                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                setSelectedChatModel(m);
                                setShowModelPicker(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-left cursor-pointer",
                                isActive ? "bg-white/[0.08] border border-white/10" : "hover:bg-white/[0.04]",
                                isLocked && "opacity-60"
                              )}
                            >
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10 bg-black/40">
                                <img src={m.logoUrl} alt={m.name} className="w-4 h-4 object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white truncate">{m.name}</span>
                                  {isUnlimited ? (
                                    <span className="text-[8px] font-black uppercase px-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                      UNLOCKED
                                    </span>
                                  ) : remaining > 0 ? (
                                    <span className="text-[8px] font-bold px-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                      {remaining} free
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-bold px-1 rounded bg-red-500/15 text-red-400 border border-red-500/20 flex items-center gap-0.5">
                                      <Lock size={7} /> Lock
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9.5px] text-neutral-400 truncate">{m.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {userPlan !== "power" && (
                        <div className="mt-2 pt-2 border-t border-white/[0.06] p-1">
                          <button
                            onClick={() => router.push("/pricing")}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-black uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer"
                          >
                            Upgrade to Unlock All Models →
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Quick Modes Ribbon */}
            <div
              className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar scrollbar-none pb-0.5 scroll-smooth select-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {CHAT_MODES.map((mode) => {
                const isActive = selectedMode.id === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold shrink-0 transition-all cursor-pointer border",
                      isActive
                        ? "bg-red-500/15 border-red-500/40 text-red-400 shadow-sm"
                        : "bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/15"
                    )}
                  >
                    <mode.icon size={11} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="relative flex-1 flex flex-col min-h-0">
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 pb-20 lg:pb-4 custom-scrollbar">
              <div className="space-y-3.5">
                {messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "user" ? (
                      <div className="max-w-[85%] flex flex-col items-end gap-1">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-md">
                          {msg.content}
                        </div>
                        {msg.mode && msg.mode !== "ask" && (
                          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wide pr-1">
                            {msg.mode} mode
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="max-w-[92%] bg-[#121216] border border-white/[0.08] rounded-2xl rounded-tl-sm p-3.5 text-xs leading-relaxed break-words shadow-sm">
                        <ModeMessageRenderer 
                          content={msg.content} 
                          mode={msg.mode} 
                          onActionClick={(prompt) => sendCustomMessage(prompt)}
                        />

                        {msg.videoLink && (
                          <a
                            href={msg.videoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2.5 p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 hover:bg-black/60 transition-colors text-red-400 text-xs font-semibold"
                          >
                            <ExternalLink size={12} />
                            <span>Jump to Video Chapter</span>
                          </a>
                        )}

                        {/* Bottom Feedback Bar */}
                        <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-neutral-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFeedback(msg._id, "good")}
                              className={cn(
                                "p-1 rounded hover:text-white transition-colors cursor-pointer",
                                msg.feedback === "good" && "text-emerald-400"
                              )}
                              title="Helpful"
                            >
                              <ThumbsUp size={11} />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg._id, "bad")}
                              className={cn(
                                "p-1 rounded hover:text-white transition-colors cursor-pointer",
                                msg.feedback === "bad" && "text-red-400"
                              )}
                              title="Not helpful"
                            >
                              <ThumbsDown size={11} />
                            </button>
                          </div>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-[#121216] border border-white/[0.08] rounded-2xl rounded-tl-sm p-3 text-xs flex items-center gap-2.5">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" />
                      </div>
                      <span className="text-neutral-400 font-medium">{thinkingMessage}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* PaperChat Input Bar */}
            <div className="p-3 border-t border-white/[0.08] bg-[#0c0c0f] shrink-0 mb-16 lg:mb-0 relative z-20">
              <div className="bg-[#141418] border border-white/[0.10] rounded-2xl p-2.5 focus-within:border-red-500/50 transition-colors shadow-lg">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={canUseModel ? `Ask PaperChat (${selectedMode.label} mode)... (Enter to send)` : `Message limit reached on ${selectedChatModel.name}`}
                  disabled={!canUseModel}
                  rows={2}
                  className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder:text-neutral-500 resize-none custom-scrollbar leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  {/* Quick Prompts Dropdown */}
                  <div
                    className="flex items-center gap-1.5 overflow-x-auto max-w-[80%] no-scrollbar scrollbar-none"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {QUICK_ACTIONS.slice(0, 3).map((qa, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendCustomMessage(qa.label)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[10px] text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        <qa.icon size={10} style={{ color: qa.color }} />
                        <span className="truncate max-w-[130px]">{qa.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Send Action */}
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isThinking || !canUseModel}
                    className="w-7 h-7 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 disabled:hover:from-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-[0.95]"
                  >
                    {isThinking ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ─── 3. THEME SELECTOR MODAL ─── */}
      <AnimatePresence>
        {showThemeModal && (
          <ThemeStudioModal
            isOpen={showThemeModal}
            onClose={() => setShowThemeModal(false)}
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
            userPlan={userPlan}
          />
        )}
      </AnimatePresence>

      {/* ─── 4. EXPORT MODAL ─── */}
      <AnimatePresence>
        {showExportDialog && (
          <ExportDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            isSubscribed={isSubscribed}
            onExportPDF={generatePDF}
            onExportMarkdown={exportMarkdown}
            isGeneratingPDF={isGeneratingPDF}
            router={router}
            noteTitle={data?.title || "Study Note"}
            noteContent={markdownContent}
          />
        )}
      </AnimatePresence>

      {/* ─── 5. MOBILE FLOATING GLASS CAPSULE DOCK ─── */}
      <div className="lg:hidden fixed bottom-3 inset-x-0 z-[70] flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-[370px] h-[52px] rounded-full bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/[0.14] shadow-[0_16px_45px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)] p-1.5 flex items-center justify-between gap-1">
          {/* Workspace Home Back Button */}
          <button
            type="button"
            onClick={() => router.push("/youtube-to-notes")}
            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.10] active:scale-90 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Back to Workspace"
          >
            <Home size={16} />
          </button>

          <div className="w-[1px] h-4 bg-white/10 shrink-0 mx-0.5" />

          {/* Segmented Workspace Tabs Container */}
          <div className="flex-1 flex items-center justify-between gap-1 h-full">
            {/* Read Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "relative flex-1 h-full rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none active:scale-95",
                activeTab === "preview" ? "text-white" : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              {activeTab === "preview" && (
                <motion.span
                  layoutId="active-mobile-dock-pill"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-[0_2px_12px_rgba(239,68,68,0.55)]"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Eye size={14} />
                <span className="leading-none text-[11px] font-bold">Read</span>
              </span>
            </button>

            {/* Edit Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={cn(
                "relative flex-1 h-full rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none active:scale-95",
                activeTab === "editor" ? "text-white" : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              {activeTab === "editor" && (
                <motion.span
                  layoutId="active-mobile-dock-pill"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-[0_2px_12px_rgba(239,68,68,0.55)]"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Edit size={14} />
                <span className="leading-none text-[11px] font-bold">Edit</span>
              </span>
            </button>

            {/* PaperChat Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={cn(
                "relative flex-1 h-full rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none active:scale-95",
                activeTab === "chat" ? "text-white" : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              {activeTab === "chat" && (
                <motion.span
                  layoutId="active-mobile-dock-pill"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-[0_2px_12px_rgba(239,68,68,0.55)]"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <div className="relative flex items-center">
                  <MessageSquare size={14} />
                  {activeTab !== "chat" && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse" />
                  )}
                </div>
                <span className="leading-none text-[11px] font-bold">AI Chat</span>
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}