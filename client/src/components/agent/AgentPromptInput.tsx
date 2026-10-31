"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Paperclip, 
  Mic, 
  ArrowUp, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Folder,
  Settings,
  FilePlus2,
  LayoutGrid,
  Layers,
  RotateCw,
  Globe,
  Presentation,
  ListTodo,
  ScanSearch,
  Code2,
  PenTool,
  Youtube,
  Newspaper,
  Check, 
  X, 
  UploadCloud, 
  Link as LinkIcon,
  SlidersHorizontal,
  Pause,
  Play,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Music,
  File,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/config/api";

export interface AgentModel {
  id: string;
  name: string;
  tag: string;
  badge?: string;
  desc: string;
  icon: string;
}

export interface AgentCapability {
  id: string;
  name: string;
  icon: any;
  iconColor: string;
  desc: string;
  placeholder: string;
}

export const AGENT_MODELS: AgentModel[] = [
  { 
    id: "paper-fast", 
    name: "Paper Fast", 
    tag: "Ace Fast", 
    badge: "Speed", 
    desc: "Blazing-fast reasoning for daily study & workflows",
    icon: "⚡"
  },
  { 
    id: "deepseek-r1", 
    name: "DeepSeek R1", 
    tag: "Reasoning", 
    badge: "High IQ", 
    desc: "Deep algorithmic problem solving & mathematical proofs",
    icon: "🧠"
  },
  { 
    id: "gemini-2.5-flash", 
    name: "Gemini 2.5 Flash", 
    tag: "Multimodal", 
    badge: "Fast", 
    desc: "Ultra-fast multimodal search & document comprehension",
    icon: "✨"
  },
  { 
    id: "gpt-4o-mini", 
    name: "GPT-4o Mini", 
    tag: "Balanced", 
    badge: "Smart", 
    desc: "High accuracy general knowledge & synthesis",
    icon: "🤖"
  },
  { 
    id: "claude-3.7-sonnet", 
    name: "Claude 3.7 Sonnet", 
    tag: "Pro", 
    badge: "Top Tier", 
    desc: "Masterful writing, coding & nuanced logic",
    icon: "🔮"
  }
];

export const AGENT_CAPABILITIES: AgentCapability[] = [
  {
    id: "auto",
    name: "Auto",
    icon: RotateCw,
    iconColor: "text-red-400",
    desc: "Automatically chooses the best agent & tools",
    placeholder: "What do you need done?"
  },
  {
    id: "image",
    name: "Image Gen",
    icon: ImageIcon,
    iconColor: "text-red-400",
    desc: "Generate high-resolution photorealistic & artistic images in 2K HDR",
    placeholder: "Describe the image you want to create (e.g., cyberpunk city at night with neon rain, cinematic lighting)..."
  },
  {
    id: "web-apps",
    name: "Web Apps",
    icon: Globe,
    iconColor: "text-red-400",
    desc: "Build full-stack web applications & React components",
    placeholder: "Describe the web app, UI layout, or full-stack feature..."
  },
  {
    id: "slides",
    name: "Slides",
    icon: Presentation,
    iconColor: "text-red-400",
    desc: "Design professional 16:9 keynote slide decks & visual reports",
    placeholder: "Describe your presentation topic or paste an outline..."
  },
  {
    id: "plan",
    name: "Plan",
    icon: ListTodo,
    iconColor: "text-red-400",
    desc: "Architect study milestones, syllabus trackers & action roadmaps",
    placeholder: "Enter your study syllabus, goals, or multi-step execution plan..."
  },
  {
    id: "deepsearch",
    name: "DeepSearch",
    icon: ScanSearch,
    iconColor: "text-red-400",
    desc: "Autonomous deep multi-source research & academic citations",
    placeholder: "Enter research topic or academic question to investigate..."
  },
  {
    id: "code",
    name: "Code",
    icon: Code2,
    iconColor: "text-red-400",
    desc: "Full-stack code generation, debugging & algorithmic proofs",
    placeholder: "Paste code, bug report, algorithm or architecture question..."
  },
  {
    id: "whiteboard",
    name: "Whiteboard",
    icon: PenTool,
    iconColor: "text-red-400",
    desc: "Architect Excalidraw flowcharts, system topology & wireframes",
    placeholder: "Describe the system architecture, flowchart, or diagram to draw..."
  },
  {
    id: "youtube-notes",
    name: "YouTube Notes",
    icon: Youtube,
    iconColor: "text-red-400",
    desc: "Extract timestamped notes & takeaways from lecture videos",
    placeholder: "Paste a YouTube link or describe the video lecture topic..."
  },
  {
    id: "news",
    name: "News Hub",
    icon: Newspaper,
    iconColor: "text-red-400",
    desc: "Real-time global & regional tech news, AI breakthroughs & curated briefings",
    placeholder: "Search tech news, today's AI breakthroughs, or get curated global updates..."
  },
  {
    id: "video-explanation",
    name: "AI Video Explainer",
    icon: Video,
    iconColor: "text-violet-400",
    desc: "Synthesize visual animations with Sarvam Bulbul V3 neural voiceover",
    placeholder: "Describe the concept to explain or attach a diagram image..."
  }
];

/**
 * Intelligent Local Fallback Punctuation & Formatting Engine
 */
function localFormatVoiceTranscript(rawText: string): string {
  if (!rawText || !rawText.trim()) return "";
  let text = rawText.trim();

  // 1. Capitalize first letter of sentences
  text = text.charAt(0).toUpperCase() + text.slice(1);
  text = text.replace(/([.?!]\s+)([a-z])/g, (_, sep, letter) => sep + letter.toUpperCase());

  // 2. Format common acronyms & tech terms
  text = text.replace(/\b(i|i'm|i'll|i've|i'd)\b/gi, (m) => m.charAt(0).toUpperCase() + m.slice(1));
  text = text.replace(/\b(ai|api|apis|ui|ux|llm|gpt|pdf|html|css|js|ts|sql|mongodb|react|nextjs)\b/gi, (m) => m.toUpperCase());

  // 3. Question mark detection for inquiries
  const trimmed = text.trim();
  const lastChar = trimmed.slice(-1);
  if (![".", "?", "!", ";"].includes(lastChar)) {
    const lower = trimmed.toLowerCase();
    const isQuestion = 
      lower.startsWith("what") ||
      lower.startsWith("how") ||
      lower.startsWith("why") ||
      lower.startsWith("when") ||
      lower.startsWith("where") ||
      lower.startsWith("who") ||
      lower.startsWith("can you") ||
      lower.startsWith("could you") ||
      lower.startsWith("would you") ||
      lower.startsWith("is it") ||
      lower.startsWith("will");

    if (isQuestion) {
      text = trimmed + "?";
    }
  }

  return text;
}

// Format seconds into MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export interface AspectRatioOption {
  id: string;
  ratio: string;
  name: string;
  w: number;
  h: number;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: "2:3", ratio: "2:3", name: "Poster", w: 2, h: 3 },
  { id: "3:2", ratio: "3:2", name: "Photo Print", w: 3, h: 2 },
  { id: "4:3", ratio: "4:3", name: "Presentation", w: 4, h: 3 },
  { id: "1:1", ratio: "1:1", name: "Square", w: 1, h: 1 },
  { id: "9:16", ratio: "9:16", name: "Story", w: 9, h: 16 },
  { id: "16:9", ratio: "16:9", name: "Widescreen", w: 16, h: 9 },
  { id: "21:9", ratio: "21:9", name: "Cinematic", w: 21, h: 9 },
  { id: "5:2", ratio: "5:2", name: "Banner", w: 5, h: 2 }
];

function computeRatioPreviewDims(item: AspectRatioOption) {
  const maxW = 142;
  const maxH = 142;
  const r = item.w / item.h;
  if (r >= maxW / maxH) {
    const width = maxW;
    const height = Math.max(32, Math.round(maxW / r));
    return { width, height };
  } else {
    const height = maxH;
    const width = Math.max(32, Math.round(maxH * r));
    return { width, height };
  }
}

export interface ImageStyleOption {
  id: string;
  label: string;
  icon: string;
}

export const IMAGE_STYLES: ImageStyleOption[] = [
  { id: "photorealistic", label: "Photorealistic", icon: "📸" },
  { id: "cinematic", label: "Cinematic", icon: "🎬" },
  { id: "anime", label: "Anime", icon: "✨" },
  { id: "digital-art", label: "Concept Art", icon: "🎨" },
  { id: "cyberpunk", label: "Cyberpunk", icon: "⚡" }
];

export function getFileFormatMeta(name: string = "", type: string = "") {
  const ext = (name.split('.').pop() || '').toLowerCase();
  
  if (type === "image" || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(ext)) {
    return {
      category: "image",
      label: ext.toUpperCase() || "IMG",
      badgeClass: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      cardClass: "border-pink-500/25 bg-pink-950/25 hover:border-pink-500/40",
      iconColor: "text-pink-400",
      icon: ImageIcon
    };
  }
  if (type === "pdf" || ext === "pdf") {
    return {
      category: "pdf",
      label: "PDF",
      badgeClass: "bg-red-600/25 text-red-400 border-red-500/35",
      cardClass: "border-red-500/25 bg-red-950/25 hover:border-red-500/40",
      iconColor: "text-red-400",
      icon: FileText
    };
  }
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext) || type === "word") {
    return {
      category: "word",
      label: ext.toUpperCase() || "DOCX",
      badgeClass: "bg-blue-600/25 text-blue-400 border-blue-500/35",
      cardClass: "border-blue-500/25 bg-blue-950/25 hover:border-blue-500/40",
      iconColor: "text-blue-400",
      icon: FileText
    };
  }
  if (['xls', 'xlsx', 'csv', 'tsv'].includes(ext) || type === "sheets") {
    return {
      category: "sheets",
      label: ext.toUpperCase() || "XLSX",
      badgeClass: "bg-emerald-600/25 text-emerald-400 border-emerald-500/35",
      cardClass: "border-emerald-500/25 bg-emerald-950/25 hover:border-emerald-500/40",
      iconColor: "text-emerald-400",
      icon: FileSpreadsheet
    };
  }
  if (['ppt', 'pptx', 'key', 'odp'].includes(ext) || type === "presentation") {
    return {
      category: "presentation",
      label: ext.toUpperCase() || "PPTX",
      badgeClass: "bg-amber-600/25 text-amber-400 border-amber-500/35",
      cardClass: "border-amber-500/25 bg-amber-950/25 hover:border-amber-500/40",
      iconColor: "text-amber-400",
      icon: Presentation
    };
  }
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'php', 'html', 'css', 'json', 'sql', 'sh', 'yaml', 'yml', 'toml', 'xml', 'bash', 'zsh', 'rb', 'swift'].includes(ext) || type === "code") {
    return {
      category: "code",
      label: ext ? ext.toUpperCase() : "CODE",
      badgeClass: "bg-purple-600/25 text-purple-400 border-purple-500/35",
      cardClass: "border-purple-500/25 bg-purple-950/25 hover:border-purple-500/40",
      iconColor: "text-purple-400",
      icon: FileCode
    };
  }
  if (['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'wma'].includes(ext) || type === "audio") {
    return {
      category: "audio",
      label: ext.toUpperCase() || "AUDIO",
      badgeClass: "bg-rose-600/25 text-rose-400 border-rose-500/35",
      cardClass: "border-rose-500/25 bg-rose-950/25 hover:border-rose-500/40",
      iconColor: "text-rose-400",
      icon: Music
    };
  }
  if (['zip', 'tar', 'gz', '7z', 'rar', 'bz2'].includes(ext) || type === "archive") {
    return {
      category: "archive",
      label: ext.toUpperCase() || "ZIP",
      badgeClass: "bg-indigo-600/25 text-indigo-400 border-indigo-500/35",
      cardClass: "border-indigo-500/25 bg-indigo-950/25 hover:border-indigo-500/40",
      iconColor: "text-indigo-400",
      icon: FileArchive
    };
  }
  if (['txt', 'md', 'rst', 'log', 'tex', 'env'].includes(ext) || type === "text") {
    return {
      category: "text",
      label: ext.toUpperCase() || "TXT",
      badgeClass: "bg-neutral-600/25 text-neutral-300 border-neutral-500/35",
      cardClass: "border-neutral-500/25 bg-neutral-900/40 hover:border-neutral-500/40",
      iconColor: "text-neutral-300",
      icon: FileText
    };
  }
  return {
    category: "doc",
    label: ext ? ext.toUpperCase() : "FILE",
    badgeClass: "bg-white/[0.08] text-neutral-300 border-white/[0.12]",
    cardClass: "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.16]",
    iconColor: "text-neutral-400",
    icon: File
  };
}

interface AgentPromptInputProps {
  value?: string;
  onChange?: (val: string) => void;
  onSubmit: (data: {
    query: string;
    model: string;
    capability: string;
    attachments: any[];
    imageOptions?: {
      aspectRatio: string;
      resolution: "1K" | "2K";
      style: string;
      magicEnhance: boolean;
    };
  }) => void;
  placeholder?: string;
  autoFocus?: boolean;
  isLoading?: boolean;
  className?: string;
  size?: "default" | "compact" | "hero";
  showQuickPills?: boolean;
  onSelectSuggestion?: (text: string) => void;
  onOpenIntegrations?: () => void;
  dropdownPlacement?: "auto" | "top" | "bottom";
}

export function AgentPromptInput({
  value = "",
  onChange,
  onSubmit,
  placeholder,
  autoFocus = false,
  isLoading = false,
  className = "",
  size = "hero",
  showQuickPills = false,
  onSelectSuggestion,
  onOpenIntegrations,
  dropdownPlacement = "auto"
}: AgentPromptInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [selectedModel, setSelectedModel] = useState("paper-fast");
  const [selectedCapability, setSelectedCapability] = useState("auto");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // ──── Qwen Image 3 Generation Controls State ────
  const [imageAspectRatio, setImageAspectRatio] = useState<string>("16:9");
  const [imageResolution, setImageResolution] = useState<"1K" | "2K">("1K");
  const [imageStyle, setImageStyle] = useState<string>("photorealistic");
  const [isMagicEnhanceActive, setIsMagicEnhanceActive] = useState<boolean>(true);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  
  // ──── Premium Voice Recording & Processing State ────
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [voiceInterimText, setVoiceInterimText] = useState("");
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(72).fill(3));

  // Popover dropdown states
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isCapabilityDropdownOpen, setIsCapabilityDropdownOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<"project" | "recent" | "skills" | "connectors" | null>(null);
  const [connectorsState, setConnectorsState] = useState<Record<string, boolean>>({
    gmail: true,
    googledrive: true,
    github: false,
    notion: true
  });
  const [liveConnectors, setLiveConnectors] = useState<any[]>([]);
  const [loadingConnectors, setLoadingConnectors] = useState(false);
  const [isAspectRatioDropdownOpen, setIsAspectRatioDropdownOpen] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [hoveredAspectRatio, setHoveredAspectRatio] = useState<string | null>(null);
  const [attachUrl, setAttachUrl] = useState("");
  const [showContextTooltip, setShowContextTooltip] = useState(false);

  const attachUrlRef = useRef<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const capabilityDropdownRef = useRef<HTMLDivElement>(null);
  const attachDropdownRef = useRef<HTMLDivElement>(null);
  const aspectRatioDropdownRef = useRef<HTMLDivElement>(null);
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic smart placement calculation for popovers (prevents disturbing navbar)
  const getSmartDirection = (el: HTMLElement | null): "up" | "down" => {
    if (dropdownPlacement === "top") return "up";
    if (dropdownPlacement === "bottom") return "down";
    
    // In hero size, always open downwards under the component so it stays properly in screen
    if (size === "hero") {
      return "down";
    }

    if (el && typeof window !== "undefined") {
      const rect = el.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceAbove >= 260) {
        return "up";
      }
      if (spaceBelow >= 260) {
        return "down";
      }
      return spaceAbove >= spaceBelow ? "up" : "down";
    }

    return "up";
  };

  const defaultDirection = size === "hero" ? "down" : "up";
  const [capabilityMenuDirection, setCapabilityMenuDirection] = useState<"up" | "down">(defaultDirection);
  const [attachMenuDirection, setAttachMenuDirection] = useState<"up" | "down">(defaultDirection);
  const [aspectRatioMenuDirection, setAspectRatioMenuDirection] = useState<"up" | "down">(defaultDirection);
  const [styleMenuDirection, setStyleMenuDirection] = useState<"up" | "down">(defaultDirection);
  
  // Audio context, MediaRecorder & recognition references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>("");
  const prevLevelsRef = useRef<number[]>(new Array(72).fill(3));

  // Sync external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Fetch real live connectors
  const fetchLiveConnectors = useCallback(async () => {
    try {
      setLoadingConnectors(true);
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?._id || user?.id || "guest";
      const res = await api.get(`/agent/integrations?userId=${userId}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const apps = res.data.data;
        setLiveConnectors(apps);
        // Default connected apps to true in state
        const nextState: Record<string, boolean> = {};
        apps.forEach((app: any) => {
          if (app.isConnected) {
            nextState[app.id] = true;
          }
        });
        setConnectorsState(prev => ({ ...nextState, ...prev }));
      }
    } catch (e) {
      // Non-blocking
    } finally {
      setLoadingConnectors(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveConnectors();
    const handleSync = () => fetchLiveConnectors();
    window.addEventListener("integrations-updated", handleSync);
    return () => window.removeEventListener("integrations-updated", handleSync);
  }, [fetchLiveConnectors]);

  // Authentication status check
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      setIsLoggedIn(Boolean(token && token !== "null" && token !== "undefined"));
    };
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  // Real capacity usage state (pure percentage, zero credit math)
  const [capacity, setCapacity] = useState<{
    percentage: number;
    remainingPercentage: number;
    status: "optimal" | "high" | "critical" | "exceeded";
    planId: string;
    planName: string;
    period: string;
    resetsAt: string | null;
    isExceeded: boolean;
  } | null>(null);

  const fetchCapacity = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token || token === "null" || token === "undefined") {
      setCapacity(null);
      return;
    }
    try {
      const res = await api.get("/users/capacity");
      if (res.data?.success && res.data?.data) {
        setCapacity(res.data.data);
      }
    } catch {
      // Non-blocking fallback
    }
  }, []);

  useEffect(() => {
    fetchCapacity();
    const handleCapacitySync = () => fetchCapacity();
    window.addEventListener("capacity-updated", handleCapacitySync);
    window.addEventListener("auth-change", handleCapacitySync);
    return () => {
      window.removeEventListener("capacity-updated", handleCapacitySync);
      window.removeEventListener("auth-change", handleCapacitySync);
    };
  }, [fetchCapacity]);

  // Auto-resize textarea smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = size === "hero" ? 220 : 160;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [internalValue, size]);

  // Click outside listener for dropdown popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (capabilityDropdownRef.current && !capabilityDropdownRef.current.contains(e.target as Node)) {
        setIsCapabilityDropdownOpen(false);
      }
      if (attachDropdownRef.current && !attachDropdownRef.current.contains(e.target as Node)) {
        setIsAttachModalOpen(false);
        setActiveSubmenu(null);
      }
      if (aspectRatioDropdownRef.current && !aspectRatioDropdownRef.current.contains(e.target as Node)) {
        setIsAspectRatioDropdownOpen(false);
      }
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(e.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentCapability = AGENT_CAPABILITIES.find(c => c.id === selectedCapability) || AGENT_CAPABILITIES[0];
  const currentModel = AGENT_MODELS.find(m => m.id === selectedModel) || AGENT_MODELS[0];
  const CapIcon = currentCapability.icon;

  const activeRatioItem = ASPECT_RATIOS.find(r => r.id === imageAspectRatio) || ASPECT_RATIOS[5];
  const previewRatioItem = (hoveredAspectRatio ? ASPECT_RATIOS.find(r => r.id === hoveredAspectRatio) : null) || activeRatioItem;
  const previewDims = computeRatioPreviewDims(previewRatioItem);
  const activeStyleItem = IMAGE_STYLES.find(s => s.id === imageStyle) || IMAGE_STYLES[0];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    onChange?.(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // On-demand AI Cinematographer Prompt Enhancer
  const handleEnhancePrompt = async () => {
    if (!internalValue.trim() || isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBase}/api/agent/image/enhance-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: internalValue.trim(), style: imageStyle })
      });
      if (!res.ok) throw new Error("Failed to enhance prompt");
      const data = await res.json();
      if (data.enhancedPrompt) {
        setInternalValue(data.enhancedPrompt);
        onChange?.(data.enhancedPrompt);
        toast.success("Prompt enhanced by AI Visual Director!");
      }
    } catch (err) {
      toast.error("Could not enhance prompt");
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleSend = () => {
    if ((!internalValue.trim() && attachments.length === 0) || isLoading) return;

    // Strict Auth Gate: User cannot send any message until properly logged in
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!authToken || authToken === "null" || authToken === "undefined") {
      toast.info("Please sign in to send messages and run autonomous agent workflows.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("open-login"));
      }
      return;
    }

    // Pre-flight Capacity Check: Prevent sending if capacity is already 100% reached
    if (capacity?.isExceeded || (typeof capacity?.percentage === "number" && capacity.percentage >= 100)) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-capacity-modal", { detail: capacity }));
      }
      toast.info("100% study capacity reached. Opening plan options...");
      return;
    }

    const q = internalValue.trim().toLowerCase();
    
    const visualNouns = "image|images|img|imgs|photo|photos|photograph|picture|pictures|pic|pics|illustration|painting|portrait|wallpaper|drawing|artwork|poster|render|visual|banner|graphic|avatar|concept art|digital art";
    const visualVerbs = "generate|create|make|draw|paint|sketch|render|design|produce|give me|show me|illustrate|craft|synthesize|build|want|need";

    // Comprehensive Image Generation Intent Classifier
    const isImageIntent = selectedCapability === "image" || (
      !/\b(?:draw (?:conclusion|inference|comparison|parallel)|flowchart|diagram|architecture diagram|erd|wireframe|html|css|code|react|component|docker|schema|sql|table|database|api|backend code|frontend code)\b/i.test(q) && (
        new RegExp(`\\b(?:${visualVerbs})\\b.*\\b(?:${visualNouns})\\b`, "i").test(q) ||
        new RegExp(`\\b(?:${visualNouns})\\b.*\\b(?:of|for|showing|depicting|with|in|at|on)\\b`, "i").test(q) ||
        new RegExp(`\\b[a-z0-9]+\\s+(?:car|cat|dog|bike|vehicle|building|landscape|sunset|character|hero|girl|boy|robot|view|scene)?\\s*(?:${visualNouns})\\b`, "i").test(q) ||
        /\b(?:draw|paint|sketch)\s+(?:me\s+)?(?:an?|the|[a-z0-9])/i.test(q) ||
        /\b(?:3d render|cinematic photo|photorealistic|digital art|concept art|anime art|pixel art|vector art|cyberpunk art|oil painting)\b/i.test(q) ||
        /^(?:image|images|img|imgs|photo|photos|pic|picture|wallpaper|render|draw|paint|sketch)\s*[:\-]?\s*.+/i.test(q) ||
        /\bai\s+(?:image|photo|picture|art|pic|illustration)\b/i.test(q)
      )
    );

    // Auto-infer options if not explicitly set
    let inferredAspect = imageAspectRatio;
    if (!inferredAspect || inferredAspect === "1:1") {
      if (/wallpaper|desktop|widescreen|banner|landscape|16:9|wide/i.test(q)) inferredAspect = "16:9";
      else if (/phone|mobile|story|reel|tiktok|vertical|portrait|9:16/i.test(q)) inferredAspect = "9:16";
    }

    let inferredStyle = imageStyle;
    if (!inferredStyle || inferredStyle === "photorealistic") {
      if (/anime|manga|ghibli|shonen/i.test(q)) inferredStyle = "anime";
      else if (/cyberpunk|synthwave|futuristic|neon/i.test(q)) inferredStyle = "cyberpunk";
      else if (/cinematic|movie still|35mm|bokeh/i.test(q)) inferredStyle = "cinematic";
      else if (/3d render|octane render|unreal engine|blender/i.test(q)) inferredStyle = "3d_render";
      else if (/digital art|concept art|illustration/i.test(q)) inferredStyle = "digital_art";
      else if (/watercolor|oil painting|acrylic|fine art/i.test(q)) inferredStyle = "oil_painting";
      else if (/sketch|pencil drawing|charcoal/i.test(q)) inferredStyle = "sketch";
      else if (/pixel art|8-bit|16-bit/i.test(q)) inferredStyle = "pixel_art";
    }

    const effectiveCapability = isImageIntent && (!selectedCapability || selectedCapability === "universal" || selectedCapability === "auto" || selectedCapability === "chat")
      ? "image"
      : selectedCapability;

    onSubmit({
      query: internalValue.trim(),
      model: selectedModel,
      capability: effectiveCapability,
      attachments,
      ...(isImageIntent ? {
        imageOptions: {
          aspectRatio: inferredAspect || "1:1",
          resolution: imageResolution || "1K",
          style: inferredStyle || "photorealistic",
          magicEnhance: true
        }
      } : {})
    });

    setInternalValue("");
    setAttachments([]);
    onChange?.("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const processedPromises = fileArray.map((file) => {
      return new Promise<any>((resolve) => {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const isPdf = file.type.includes("pdf") || ext === "pdf";
        const isImage = file.type.startsWith("image/") || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(ext);
        const isWord = ['doc', 'docx', 'rtf', 'odt'].includes(ext) || file.type.includes("word") || file.type.includes("officedocument.wordprocessingml");
        const isSheets = ['xls', 'xlsx', 'csv', 'tsv'].includes(ext) || file.type.includes("sheet") || file.type.includes("excel") || file.type.includes("csv");
        const isPresentation = ['ppt', 'pptx', 'key', 'odp'].includes(ext) || file.type.includes("presentation") || file.type.includes("powerpoint");
        const isCode = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'php', 'html', 'css', 'json', 'sql', 'sh', 'yaml', 'yml', 'toml', 'xml', 'bash', 'zsh', 'rb', 'swift'].includes(ext);
        const isAudio = file.type.startsWith("audio/") || ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'wma'].includes(ext);
        const isArchive = ['zip', 'tar', 'gz', '7z', 'rar', 'bz2'].includes(ext) || file.type.includes("zip") || file.type.includes("tar");
        const isText = ['txt', 'md', 'rst', 'log', 'tex', 'env'].includes(ext) || file.type.startsWith("text/");

        let detectedType = "doc";
        if (isImage) detectedType = "image";
        else if (isPdf) detectedType = "pdf";
        else if (isWord) detectedType = "word";
        else if (isSheets) detectedType = "sheets";
        else if (isPresentation) detectedType = "presentation";
        else if (isCode) detectedType = "code";
        else if (isAudio) detectedType = "audio";
        else if (isArchive) detectedType = "archive";
        else if (isText) detectedType = "text";

        const previewUrl = (isImage || isPdf) && typeof window !== "undefined" ? URL.createObjectURL(file) : undefined;
        const sizeFormatted = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : file.size > 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${file.size} B`;

        const id = Math.random().toString(36).substring(7);

        // 1. Live image preview via FileReader dataURL
        if (isImage) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            resolve({
              id,
              name: file.name,
              size: sizeFormatted,
              type: "image",
              extension: ext,
              previewUrl,
              base64: ev.target?.result as string,
              rawFile: file
            });
          };
          reader.onerror = () => {
            resolve({
              id,
              name: file.name,
              size: sizeFormatted,
              type: "image",
              extension: ext,
              previewUrl,
              rawFile: file
            });
          };
          reader.readAsDataURL(file);
          return;
        }

        // 2. Read text content for code, scripts, markdown, csv, json, sql, txt (< 3MB)
        const canReadAsText = (isCode || isText || ext === 'csv' || ext === 'tsv' || ext === 'json' || ext === 'sql' || ext === 'md') && file.size < 3 * 1024 * 1024;

        if (canReadAsText) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const textContent = ev.target?.result as string;
            resolve({
              id,
              name: file.name,
              size: sizeFormatted,
              type: detectedType,
              extension: ext,
              previewUrl,
              textContent,
              rawFile: file
            });
          };
          reader.onerror = () => {
            resolve({
              id,
              name: file.name,
              size: sizeFormatted,
              type: detectedType,
              extension: ext,
              previewUrl,
              rawFile: file
            });
          };
          reader.readAsText(file);
          return;
        }

        // 3. For binary documents (Word, Excel, PPT, Audio, Zip, PDF, etc.)
        resolve({
          id,
          name: file.name,
          size: sizeFormatted,
          type: detectedType,
          extension: ext,
          previewUrl,
          rawFile: file
        });
      });
    });

    const newAttachments = await Promise.all(processedPromises);
    setAttachments(prev => [...prev, ...newAttachments]);
    toast.success(`Attached ${newAttachments.length} file${newAttachments.length > 1 ? "s" : ""}`);
    setIsAttachModalOpen(false);
  };

  // Local file upload handling with input value reset
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!authToken || authToken === "null" || authToken === "undefined") {
        toast.info("Please sign in to attach files.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("open-login"));
        }
        e.target.value = "";
        return;
      }
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  // Helper to extract clean YouTube video ID from any string/URL
  const extractYouTubeVideoId = (urlOrText: string): string | null => {
    if (!urlOrText) return null;
    const match = urlOrText.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  // Intelligent YouTube Video attachment with real thumbnail & title
  const attachYouTubeUrl = async (rawUrl: string) => {
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!authToken || authToken === "null" || authToken === "undefined") {
      toast.info("Please sign in to attach resources.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("open-login"));
      }
      return false;
    }

    const videoId = extractYouTubeVideoId(rawUrl);
    if (!videoId) return false;

    const newId = Math.random().toString(36).substring(7);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    // Initial optimistic attachment
    const initialYtItem = {
      id: newId,
      name: `YouTube Video (${videoId})`,
      url: rawUrl,
      type: "youtube",
      videoId,
      thumbnailUrl,
      channelTitle: "YouTube Lecture"
    };

    setAttachments(prev => [...prev.filter(a => a.videoId !== videoId), initialYtItem]);
    setSelectedCapability("youtube-notes");
    toast.success("YouTube lecture attached!");

    // Fetch rich title & channel name via oEmbed asynchronously
    try {
      const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          setAttachments(prev => prev.map(a => a.id === newId ? {
            ...a,
            name: data.title,
            channelTitle: data.author_name || "YouTube Lecture"
          } : a));
        }
      }
    } catch {}

    return true;
  };

  // Clipboard paste support (e.g. pasting screenshots / images / raw YouTube links)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 1. Check for raw YouTube URL paste
    const textData = e.clipboardData?.getData("text") || "";
    const ytVideoId = extractYouTubeVideoId(textData.trim());
    if (ytVideoId && textData.trim().startsWith("http") && !internalValue.trim()) {
      e.preventDefault();
      attachYouTubeUrl(textData.trim());
      return;
    }

    // 2. Check for image files in clipboard
    const items = e.clipboardData?.items;
    if (!items) return;

    const filesToProcess: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) filesToProcess.push(file);
      }
    }

    if (filesToProcess.length > 0) {
      e.preventDefault();
      processFiles(filesToProcess);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // URL/Link attachment handling
  const handleAddLink = async () => {
    if (!attachUrl.trim()) return;
    const isYt = extractYouTubeVideoId(attachUrl.trim());
    
    if (isYt) {
      await attachYouTubeUrl(attachUrl.trim());
    } else {
      setAttachments(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          name: attachUrl.trim(),
          url: attachUrl.trim(),
          type: "link"
        }
      ]);
      toast.success("Link attached to context");
    }

    setAttachUrl("");
    setIsAttachModalOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // ──── CLEANUP HARDWARE RESOURCES ────
  const cleanupAudioHardware = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    isRecordingRef.current = false;
  }, []);

  // ──── START VOICE RECORDING ────
  const startRecording = async () => {
    if (typeof window === "undefined") return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken || authToken === "null" || authToken === "undefined") {
      toast.info("Please sign in to use voice input.");
      window.dispatchEvent(new Event("open-login"));
      return;
    }

    // Pre-flight Capacity Check: Prevent voice recording if capacity is already 100% reached
    if (capacity?.isExceeded || (typeof capacity?.percentage === "number" && capacity.percentage >= 100)) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-capacity-modal", { detail: capacity }));
      }
      toast.info("100% study capacity reached. Opening plan options...");
      return;
    }

    try {
      // 1. Request Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 2. Setup MediaRecorder for audio blob
      audioChunksRef.current = [];
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.start(250); // Collect chunk every 250ms

      // 3. Setup AudioContext & Analyser for Live Responsive Waveform
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);
      let timeStep = 0;

      // Real-time Apple-grade organic audio waveform loop
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(freqData);
        analyserRef.current.getByteTimeDomainData(timeData);
        timeStep += 0.08;

        // 1. Calculate real RMS volume from time domain
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const norm = (timeData[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);
        const volumeFactor = Math.min(1, rms * 4.5); // High sensitivity volume gain

        // 2. Calculate average frequency energy
        let freqSum = 0;
        for (let i = 0; i < 32; i++) {
          freqSum += freqData[i];
        }
        const vocalEnergy = (freqSum / 32) / 255;
        const isSpeaking = volumeFactor > 0.03 || vocalEnergy > 0.05;

        const numBars = 72;
        const currentLevels: number[] = [];

        for (let i = 0; i < numBars; i++) {
          let targetHeight = 3.5;

          if (isSpeaking) {
            // Map bar index to frequency spectrum
            const freqIndex = Math.min(bufferLength - 1, Math.floor((i / numBars) * 36));
            const freqVal = freqData[freqIndex] / 255;

            // Ripple wave dynamics across center
            const centerDist = Math.abs(i - numBars / 2) / (numBars / 2);
            const bellCurve = Math.exp(-Math.pow(centerDist * 1.5, 2));

            const dynamicSine = Math.sin(timeStep * 3 + i * 0.35) * 4;
            const amp = (freqVal * 0.5 + volumeFactor * 0.5) * 30 * bellCurve;

            targetHeight = Math.max(3.5, Math.min(32, 3.5 + amp + Math.abs(dynamicSine) * volumeFactor));
          } else {
            // Subtle ambient idle breathing
            const idleSine = Math.sin(timeStep * 1.5 + i * 0.2) * 0.8;
            targetHeight = Math.max(3, 3 + idleSine);
          }

          // Smooth lerp damping
          const prev = prevLevelsRef.current[i] || 3.5;
          const smoothed = prev + (targetHeight - prev) * 0.45;
          currentLevels.push(smoothed);
          prevLevelsRef.current[i] = smoothed;
        }

        setAudioLevels(currentLevels);
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      // 4. Background Web Speech Recognition (Real-time fallback)
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        try {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          accumulatedTranscriptRef.current = "";

          recognition.onresult = (event: any) => {
            let interim = "";
            let final = "";

            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) {
                final += result[0].transcript + " ";
              } else {
                interim += result[0].transcript;
              }
            }

            if (final) {
              accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + " " + final).trim();
            }

            const display = (accumulatedTranscriptRef.current + " " + interim).trim();
            setVoiceInterimText(display);
          };

          recognition.onerror = (err: any) => {
            // Ignore normal non-fatal speech pauses
          };

          recognition.onend = () => {
            if (isRecordingRef.current && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch (e) {}
            }
          };

          recognition.start();
        } catch (e) {}
      }

      // 5. Timer Start
      setRecordingSeconds(0);
      setIsPaused(false);
      setIsRecording(true);
      isRecordingRef.current = true;

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          // Enforce 20 min safe maximum
          if (s >= 1200) {
            finishRecordingAndTranscribe();
            return 1200;
          }
          return s + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error("Microphone access failed:", err);
      toast.error("Microphone permission denied. Please allow microphone access in your browser.");
      cleanupAudioHardware();
      setIsRecording(false);
    }
  };

  // ──── TOGGLE PAUSE RECORDING ────
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.suspend();
      setIsPaused(true);
      toast.info("Recording paused");
    } else if (mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      if (audioContextRef.current) audioContextRef.current.resume();
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
      setIsPaused(false);
      toast.info("Recording resumed");
    }
  };

  // ──── CANCEL RECORDING ────
  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    cleanupAudioHardware();
    audioChunksRef.current = [];
    accumulatedTranscriptRef.current = "";
    setVoiceInterimText("");
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessingVoice(false);
    toast.info("Voice recording cancelled");
  };

  // ──── DONE: FINISH RECORDING & RUN INTELLIGENT POLISHING PIPELINE ────
  const finishRecordingAndTranscribe = async () => {
    const finalRecordingTime = recordingSeconds;
    const fallbackText = (accumulatedTranscriptRef.current || voiceInterimText || "").trim();

    // 1. Stop recorder and audio hardware
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    cleanupAudioHardware();
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessingVoice(true);
    setProcessingStep(1); // Recording complete

    try {
      // 2. Micro-delay to collect final audio chunk and step 2
      await new Promise(r => setTimeout(r, 250));
      setProcessingStep(2); // Transcribing speech

      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      if (audioBlob.size > 0) {
        formData.append("audio", audioBlob, "recording.webm");
      }
      if (fallbackText) {
        formData.append("transcript", fallbackText);
      }

      setProcessingStep(3); // Cleaning & Polishing prompt

      const res = await fetch("http://localhost:5000/api/agent/transcribe", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const polishedResult = data.text || fallbackText;

      if (polishedResult) {
        setInternalValue(prev => {
          const next = prev ? `${prev} ${polishedResult}` : polishedResult;
          onChange?.(next);
          return next;
        });
        toast.success("Voice prompt polished & ready!");
      } else {
        toast.error("Could not capture clear speech. Please try speaking closer to the mic.");
      }

    } catch (err: any) {
      console.warn("Backend transcription failed, applying high-accuracy local formatting:", err);
      // Fallback to local formatting engine
      if (fallbackText) {
        const formatted = localFormatVoiceTranscript(fallbackText);
        setInternalValue(prev => {
          const next = prev ? `${prev} ${formatted}` : formatted;
          onChange?.(next);
          return next;
        });
        toast.success("Voice prompt ready!");
      } else {
        toast.error("Could not transcribe voice audio.");
      }
    } finally {
      setIsProcessingVoice(false);
      audioChunksRef.current = [];
      accumulatedTranscriptRef.current = "";
      setVoiceInterimText("");
      setAudioLevels(new Array(72).fill(3));
      prevLevelsRef.current = new Array(72).fill(3);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Keyboard shortcut: Ctrl + Shift + V toggles voice recording
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "V" || e.key === "v")) {
        e.preventDefault();
        if (isRecording) {
          finishRecordingAndTranscribe();
        } else if (!isProcessingVoice) {
          startRecording();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, isProcessingVoice]);

  // Clean up hardware on unmount
  useEffect(() => {
    return () => {
      cleanupAudioHardware();
    };
  }, [cleanupAudioHardware]);

  const hasText = internalValue.trim().length > 0 || attachments.length > 0;

  return (
    <div className={cn("w-full relative flex flex-col font-sans", className)}>
      
      {/* Hidden Native Universal File Input (Always mounted at root) */}
      <input
        id="agent-universal-file-input"
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "w-full transition-all duration-300 relative z-30 border flex flex-col backdrop-blur-2xl",
          size === "compact" 
            ? "rounded-2xl bg-[#0e0e14]/98 p-2 sm:p-2.5 shadow-xl" 
            : "rounded-[24px] sm:rounded-[28px] bg-[#0c0c12]/95 p-3.5 sm:p-4 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.7)]",
          isDragging
            ? "border-red-500 border-dashed bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            : isRecording 
            ? "border-red-500/30 shadow-[0_16px_50px_rgba(239,68,68,0.08)]"
            : isFocused
            ? "border-red-500/40 ring-1 ring-red-500/20 shadow-[0_0_35px_rgba(239,68,68,0.12)]"
            : "border-white/[0.08] hover:border-red-500/30"
        )}
      >
        
        {/* Attachment Pill Badges & Image Thumbnails */}
        {attachments.length > 0 && !isRecording && !isProcessingVoice && (
          <div className="flex items-center gap-2 flex-wrap pb-2.5 px-1">
            {attachments.map((att) => {
              // 1. Live Image Thumbnail Card
              if (att.type === "image" && (att.previewUrl || att.base64)) {
                const meta = getFileFormatMeta(att.name, att.type);
                return (
                  <div
                    key={att.id}
                    className="relative group rounded-xl overflow-hidden border border-white/[0.14] bg-neutral-900 w-14 h-14 shrink-0 shadow-md flex items-center justify-center transition-all hover:scale-105"
                  >
                    <img
                      src={att.previewUrl || att.base64}
                      alt={att.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-[8.5px] font-bold font-mono bg-black/75 text-white backdrop-blur-sm border border-white/10">
                      {meta.label}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1 rounded-full bg-red-600/95 text-white hover:bg-red-500 transition-colors cursor-pointer shadow-lg"
                        title="Remove image"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                );
              }

              // 2. YouTube Lecture Card
              if (att.type === "youtube") {
                const vidId = att.videoId || extractYouTubeVideoId(att.url || att.name);
                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl bg-[#181115] border border-red-500/30 text-xs text-neutral-200 shadow-md max-w-xs group"
                  >
                    <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-white/[0.08] bg-black">
                      <img
                        src={att.thumbnailUrl || (vidId ? `https://img.youtube.com/vi/${vidId}/hqdefault.jpg` : "")}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
                          <Play size={8} className="fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate font-semibold text-white text-[11.5px] leading-tight">
                        {att.name}
                      </span>
                      <span className="text-[10px] text-red-400 font-mono mt-0.5 flex items-center gap-1">
                        <Youtube size={10} />
                        <span className="truncate">{att.channelTitle || "YouTube Lecture"}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              }

              // 3. Universal File Format Card (PDF, Word, Excel, PPTX, Code, Audio, Zip, Text, Generic)
              const meta = getFileFormatMeta(att.name, att.type);
              const IconComp = meta.icon || FileText;

              return (
                <div
                  key={att.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs text-neutral-200 shadow-sm transition-all duration-200 group",
                    meta.cardClass
                  )}
                >
                  <div className={cn(
                    "min-w-6 h-6 px-1.5 rounded-lg font-bold text-[9.5px] flex items-center justify-center border font-mono tracking-tight",
                    meta.badgeClass
                  )}>
                    {meta.label}
                  </div>
                  <div className="flex flex-col min-w-0 max-w-[150px]">
                    <span className="truncate font-medium text-[11.5px] text-neutral-200 group-hover:text-white transition-colors" title={att.name}>
                      {att.name}
                    </span>
                    <span className="text-[9.5px] text-neutral-400 font-mono flex items-center gap-1">
                      <IconComp size={9} className={meta.iconColor} />
                      <span>{att.size || "File"}</span>
                      {att.textContent && <span className="text-emerald-400/90 font-sans">• parsed</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors ml-1 cursor-pointer"
                    title="Remove file"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ──── 1. NORMAL TEXTAREA STATE ──── */}
        {!isRecording && !isProcessingVoice && (
          <textarea
            ref={textareaRef}
            value={internalValue}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus={autoFocus}
            rows={1}
            placeholder={placeholder || currentCapability.placeholder}
            className={cn(
              "w-full bg-transparent text-white placeholder:text-neutral-500 resize-none outline-none custom-scrollbar leading-relaxed tracking-normal font-sans",
              size === "compact"
                ? "text-[14px] sm:text-[14.5px] px-1.5 py-1 min-h-[34px] max-h-[140px]"
                : "text-[15px] sm:text-[16px] px-2 py-1.5 min-h-[46px] max-h-[220px]"
            )}
          />
        )}

        {/* ──── IMAGE GENERATION STUDIO CONTROLS (WHEN IMAGE CAPABILITY SELECTED) ──── */}
        <AnimatePresence>
          {selectedCapability === "image" && !isRecording && !isProcessingVoice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="relative border-t border-white/[0.08] pt-1.5 pb-0.5 mt-1"
              style={{ overflow: "visible" }}
            >
              {/* Single Low-Profile Controls Row */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap relative">
                
                {/* Left Cluster: Aspect Ratio + Segmented Resolution (1K/2K) + Style Menu */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                  
                  {/* Interactive Dual-Pane Aspect Ratio Popover */}
                  <div ref={aspectRatioDropdownRef} className="relative z-40">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAspectRatioDropdownOpen) {
                          setAspectRatioMenuDirection(getSmartDirection(aspectRatioDropdownRef.current));
                        }
                        setIsAspectRatioDropdownOpen(!isAspectRatioDropdownOpen);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none border",
                        isAspectRatioDropdownOpen
                          ? "bg-white/[0.14] border-white/[0.25] text-white shadow-md"
                          : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-200 hover:text-white"
                      )}
                      title="Choose aspect ratio with live visual frame preview"
                    >
                      <div className="w-3.5 h-2.5 rounded-[2px] border border-neutral-300 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1 rounded-[1px] bg-neutral-300 opacity-60" />
                      </div>
                      <span className="font-semibold text-[11.5px] font-mono">{activeRatioItem.ratio}</span>
                      <span className="text-neutral-400 text-[11px] hidden md:inline">{activeRatioItem.name}</span>
                      <ChevronDown size={11} className={cn("text-neutral-400 transition-transform duration-200", isAspectRatioDropdownOpen && "rotate-180")} />
                    </button>

                    {/* Dual-Pane Aspect Ratio Popover (Solid 100% Opaque Obsidian Glass) */}
                    <AnimatePresence>
                      {isAspectRatioDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: aspectRatioMenuDirection === "down" ? -8 : 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: aspectRatioMenuDirection === "down" ? -8 : 8, scale: 0.96 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className={cn(
                            "absolute left-0 z-[999] rounded-3xl border border-white/[0.16] shadow-[0_30px_90px_rgba(0,0,0,0.98)] flex flex-col sm:flex-row overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] max-w-[calc(100vw-24px)]",
                            aspectRatioMenuDirection === "down" ? "top-full mt-3" : "bottom-full mb-3"
                          )}
                          style={{ backgroundColor: "#14141d" }}
                        >
                          {/* ──── LEFT PANE: Interactive Spatial Grid & Animated Frame Preview ──── */}
                          <div className="w-full sm:w-52 bg-[#0e0e16] p-3.5 flex flex-col items-center justify-between select-none relative shrink-0">
                            
                            {/* 3x3 Photography Rule-of-Thirds Grid Card */}
                            <div className="relative w-44 h-44 rounded-2xl bg-[#08080d] border border-white/[0.08] flex items-center justify-center overflow-hidden shadow-inner">
                              <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-x-0 top-1/3 border-b border-white/[0.06]" />
                                <div className="absolute inset-x-0 top-2/3 border-b border-white/[0.06]" />
                                <div className="absolute inset-y-0 left-1/3 border-r border-white/[0.06]" />
                                <div className="absolute inset-y-0 left-2/3 border-r border-white/[0.06]" />
                              </div>

                              <motion.div
                                animate={{
                                  width: previewDims.width,
                                  height: previewDims.height
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 420,
                                  damping: 28
                                }}
                                className="relative rounded-xl border-[2px] border-white/95 bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.12)] flex items-center justify-center pointer-events-none"
                              />
                            </div>

                            <div className="pt-2.5 pb-0.5 text-center">
                              <motion.div
                                key={previewRatioItem.id}
                                initial={{ opacity: 0, y: 2 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.12 }}
                                className="flex flex-col items-center"
                              >
                                <span className="text-[13px] font-semibold text-white tracking-wide">
                                  {previewRatioItem.name}
                                </span>
                              </motion.div>
                            </div>

                          </div>

                          {/* ──── RIGHT PANE: Vertical Curated Aspect Ratio List ──── */}
                          <div 
                            className="w-full sm:w-48 bg-[#14141d] p-2 flex flex-col space-y-0.5 overflow-y-auto max-h-[200px] sm:max-h-[270px] custom-scrollbar select-none"
                            onMouseLeave={() => setHoveredAspectRatio(null)}
                          >
                            {ASPECT_RATIOS.map((opt) => {
                              const isSelected = imageAspectRatio === opt.id;
                              const isHovered = (hoveredAspectRatio || imageAspectRatio) === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onMouseEnter={() => setHoveredAspectRatio(opt.id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageAspectRatio(opt.id);
                                    setIsAspectRatioDropdownOpen(false);
                                    setHoveredAspectRatio(null);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left group",
                                    isSelected 
                                      ? "bg-white/[0.12] text-white font-medium" 
                                      : isHovered
                                      ? "bg-white/[0.07] text-white"
                                      : "text-neutral-300 hover:bg-white/[0.05] hover:text-white"
                                  )}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className={cn(
                                      "font-bold font-mono text-[12.5px] min-w-[34px]",
                                      isSelected ? "text-white font-semibold" : "text-neutral-200"
                                    )}>
                                      {opt.ratio}
                                    </span>
                                    <span className="text-[12.5px] text-neutral-300 truncate">
                                      {opt.name}
                                    </span>
                                  </div>

                                  {isSelected && (
                                    <Check size={14} className="text-white shrink-0 ml-1 stroke-[2.5]" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Segmented Resolution Switch (1K vs 2K) */}
                  <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    {(["1K", "2K"] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setImageResolution(res)}
                        className={cn(
                          "px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer select-none",
                          imageResolution === res
                            ? "bg-white/[0.15] text-white shadow-sm font-semibold"
                            : "text-neutral-400 hover:text-white"
                        )}
                      >
                        {res}
                      </button>
                    ))}
                  </div>

                  {/* Compact Apple Style Dropdown */}
                  <div ref={styleDropdownRef} className="relative z-40">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isStyleDropdownOpen) {
                          setStyleMenuDirection(getSmartDirection(styleDropdownRef.current));
                        }
                        setIsStyleDropdownOpen(!isStyleDropdownOpen);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none border",
                        isStyleDropdownOpen
                          ? "bg-white/[0.14] border-white/[0.25] text-white shadow-md"
                          : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-200 hover:text-white"
                      )}
                      title="Select visual style"
                    >
                      <span className="text-[12px]">{activeStyleItem?.icon || "🎨"}</span>
                      <span className="text-[11.5px] font-medium text-neutral-200">{activeStyleItem?.label || "Photorealistic"}</span>
                      <ChevronDown size={11} className={cn("text-neutral-400 transition-transform duration-200", isStyleDropdownOpen && "rotate-180")} />
                    </button>

                    {/* Style Dropdown Popover */}
                    <AnimatePresence>
                      {isStyleDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: styleMenuDirection === "down" ? -8 : 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: styleMenuDirection === "down" ? -8 : 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className={cn(
                            "absolute left-0 w-48 rounded-2xl border border-white/[0.14] shadow-[0_25px_80px_rgba(0,0,0,0.98)] p-1.5 z-[999] space-y-0.5 select-none",
                            styleMenuDirection === "down" ? "top-full mt-2.5" : "bottom-full mb-2.5"
                          )}
                          style={{ backgroundColor: "#14141d" }}
                        >
                          {IMAGE_STYLES.map((st) => {
                            const isSelected = imageStyle === st.id;
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  setImageStyle(st.id);
                                  setIsStyleDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left",
                                  isSelected
                                    ? "bg-white/[0.14] text-white font-medium"
                                    : "text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{st.icon}</span>
                                  <span className="text-[12px]">{st.label}</span>
                                </div>
                                {isSelected && <Check size={13} className="text-white ml-1 stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──── 2. LIVE RECORDING STATE (MATCHING USER SPECIFICATION) ──── */}
        {isRecording && (
          <div className="w-full flex flex-col justify-center px-1 sm:px-2 py-1 space-y-2.5">
            
            {/* Top Indicator Header: 🔴 Recording + Live Timer */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full bg-red-500",
                  !isPaused ? "animate-ping" : "opacity-60"
                )} />
                <span className="font-semibold text-neutral-200 tracking-tight">
                  {isPaused ? "Paused" : "Recording voice"}
                </span>
              </div>
              <div className="font-mono text-neutral-400 font-medium text-[11.5px] sm:text-xs">
                {formatTime(recordingSeconds)}
              </div>
            </div>

            {/* Live Audio Visualizer Pill Waves (Symmetrical Center-Aligned Horizontal Wave) */}
            <div className="w-full flex items-center justify-between gap-[2px] sm:gap-[2.5px] h-10 sm:h-12 overflow-hidden px-1">
              {audioLevels.map((lvl, idx) => {
                const isActive = lvl > 3.8;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "w-[2px] sm:w-[2.5px] rounded-full transition-all duration-75 shrink-0",
                      isActive
                        ? "bg-gradient-to-t from-red-600 via-rose-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        : "bg-white/[0.12]"
                    )}
                    style={{
                      height: `${Math.max(3, lvl)}px`,
                      opacity: isActive ? 1 : 0.4
                    }}
                  />
                );
              })}
            </div>

          </div>
        )}

        {/* ──── 3. SKELETON LOADING STATE (ZERO TEXT, PURE SHIMMER) ──── */}
        {isProcessingVoice && (
          <div className="w-full min-h-[44px] flex flex-col justify-center gap-2 px-2 py-2 animate-pulse">
            <div className="h-3 w-3/5 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.14] to-white/[0.06]" />
            <div className="h-2.5 w-1/3 rounded-full bg-gradient-to-r from-white/[0.06] via-white/[0.10] to-white/[0.04]" />
          </div>
        )}

        {/* ──── 4. BOTTOM CONTROLS BAR ──── */}
        <div className={cn(
          "flex items-center justify-between gap-2 border-t border-white/[0.05]",
          size === "compact" ? "pt-1.5 mt-0.5" : "pt-2.5 mt-1"
        )}>
          
          {/* Left Controls: Paperclip Attachment + Compact Capability Mode Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* ──── PLUS ACTION MENU & POPOVER (MATCHING REFERENCE IMAGES 1 & 2) ──── */}
            <div ref={attachDropdownRef} className="relative z-40">
              <button
                type="button"
                disabled={isRecording || isProcessingVoice}
                onClick={() => {
                  if (!isAttachModalOpen) {
                    setAttachMenuDirection(getSmartDirection(attachDropdownRef.current));
                  }
                  setIsAttachModalOpen(!isAttachModalOpen);
                  setActiveSubmenu(null);
                }}
                className={cn(
                  "rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center disabled:opacity-40 select-none border",
                  isAttachModalOpen
                    ? "bg-white/[0.14] text-white border-white/[0.22] shadow-sm scale-105"
                    : "text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.07]",
                  size === "compact" ? "w-7 h-7" : "w-8 h-8"
                )}
                title="Add files, projects, skills, or connectors"
              >
                <Plus 
                  size={15} 
                  className={cn(
                    "transition-transform duration-200", 
                    isAttachModalOpen && "rotate-45"
                  )} 
                />
              </button>

              {/* Apple macOS / Anthropic Claude Style Floating Obsidian Popover */}
              <AnimatePresence>
                {isAttachModalOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: attachMenuDirection === "down" ? -8 : 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: attachMenuDirection === "down" ? -8 : 8, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className={cn(
                      "absolute left-0 w-56 sm:w-60 max-w-[calc(100vw-32px)] rounded-2xl border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.98)] p-1.5 z-[999] select-none",
                      attachMenuDirection === "down" ? "top-full mt-2.5" : "bottom-full mb-2.5"
                    )}
                    style={{ backgroundColor: "#14141c" }}
                  >
                    {/* 1. Upload a file */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAttachModalOpen(false);
                        setActiveSubmenu(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                          fileInputRef.current.click();
                        }
                      }}
                      onMouseEnter={() => setActiveSubmenu(null)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group select-none text-left"
                    >
                      <FilePlus2 size={16} className="text-neutral-400 group-hover:text-white shrink-0" />
                      <span>Upload a file</span>
                    </button>

                    {/* 2. Add to project > */}
                    <div 
                      className="relative"
                      onMouseEnter={() => setActiveSubmenu("project")}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSubmenu(activeSubmenu === "project" ? null : "project")}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer group",
                          activeSubmenu === "project" 
                            ? "bg-white/[0.1] text-white" 
                            : "text-neutral-200 hover:text-white hover:bg-white/[0.08]"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Folder size={16} className="text-neutral-400 group-hover:text-white shrink-0" />
                          <span>Add to project</span>
                        </div>
                        <ChevronRight size={14} className="text-neutral-500 group-hover:text-neutral-300 shrink-0" />
                      </button>

                      {/* Submenu: Add to project */}
                      <AnimatePresence>
                        {activeSubmenu === "project" && (
                          <motion.div
                            initial={{ opacity: 0, x: 6, scale: 0.96 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 6, scale: 0.96 }}
                            transition={{ duration: 0.14 }}
                            className={cn(
                              "absolute inset-0 sm:inset-auto sm:left-full sm:ml-2 w-full sm:w-56 max-w-none sm:max-w-[280px] rounded-2xl border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.98)] p-2 z-[1000] space-y-0.5 flex flex-col justify-between",
                              attachMenuDirection === "down" ? "sm:top-0" : "sm:bottom-0"
                            )}
                            style={{ backgroundColor: "#14141c" }}
                          >
                            <div className="space-y-1">
                              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/[0.06] mb-1 flex items-center justify-between">
                                <button 
                                  type="button" 
                                  onClick={(e) => { e.stopPropagation(); setActiveSubmenu(null); }}
                                  className="sm:hidden text-neutral-400 hover:text-white"
                                >
                                  ← Back
                                </button>
                                <span>Target Project</span>
                              </div>
                              {[
                                { id: "active-workspace", name: "Active Studio Workspace", active: true },
                                { id: "cloud-notebook", name: "Paperxify Cloud Notebook", active: false },
                                { id: "study-deck", name: "Exam Revision Deck", active: false }
                              ].map((proj) => (
                                <button
                                  key={proj.id}
                                  type="button"
                                  onClick={() => {
                                    toast.success(`Context bound to "${proj.name}"`);
                                    setIsAttachModalOpen(false);
                                    setActiveSubmenu(null);
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                                >
                                  <span className="truncate">{proj.name}</span>
                                  {proj.active && <Check size={13} className="text-emerald-400 shrink-0 ml-1" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 3. Recent files > */}
                    <div 
                      className="relative"
                      onMouseEnter={() => setActiveSubmenu("recent")}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSubmenu(activeSubmenu === "recent" ? null : "recent")}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer group",
                          activeSubmenu === "recent" 
                            ? "bg-white/[0.1] text-white" 
                            : "text-neutral-200 hover:text-white hover:bg-white/[0.08]"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <RotateCw size={16} className="text-neutral-400 group-hover:text-white shrink-0" />
                          <span>Recent files</span>
                        </div>
                        <ChevronRight size={14} className="text-neutral-500 group-hover:text-neutral-300 shrink-0" />
                      </button>

                      {/* Submenu: Recent files */}
                      <AnimatePresence>
                        {activeSubmenu === "recent" && (
                          <motion.div
                            initial={{ opacity: 0, x: 6, scale: 0.96 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 6, scale: 0.96 }}
                            transition={{ duration: 0.14 }}
                            className={cn(
                              "absolute inset-0 sm:inset-auto sm:left-full sm:ml-2 w-full sm:w-64 max-w-none sm:max-w-[280px] rounded-2xl border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.98)] p-2 z-[1000] space-y-0.5 flex flex-col justify-between",
                              attachMenuDirection === "down" ? "sm:top-0" : "sm:bottom-0"
                            )}
                            style={{ backgroundColor: "#14141c" }}
                          >
                            <div className="space-y-1">
                              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/[0.06] mb-1 flex items-center justify-between">
                                <button 
                                  type="button" 
                                  onClick={(e) => { e.stopPropagation(); setActiveSubmenu(null); }}
                                  className="sm:hidden text-neutral-400 hover:text-white"
                                >
                                  ← Back
                                </button>
                                <span>Workspace Vault</span>
                              </div>
                              {[
                                { name: "Autonomous_Agent_Architecture.pdf", type: "application/pdf", size: "2.4 MB" },
                                { name: "Computer_Networks_Cheatsheet.md", type: "text/markdown", size: "142 KB" },
                                { name: "Machine_Learning_Notes.docx", type: "application/docx", size: "1.8 MB" }
                              ].map((f, idx) => {
                                const meta = getFileFormatMeta(f.name, f.type);
                                const IconComp = meta.icon;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setAttachments(prev => [...prev, {
                                        id: `recent_${Date.now()}_${idx}`,
                                        name: f.name,
                                        type: f.type,
                                        size: f.size,
                                        status: "ready"
                                      }]);
                                      toast.success(`Attached "${f.name}"`);
                                      setIsAttachModalOpen(false);
                                      setActiveSubmenu(null);
                                    }}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left group"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      <div className={cn(
                                        "min-w-5 h-5 px-1 rounded-md font-bold text-[8.5px] flex items-center justify-center border font-mono",
                                        meta.badgeClass
                                      )}>
                                        {meta.label}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="truncate font-medium text-[11px] text-neutral-200 group-hover:text-white">{f.name}</span>
                                        <span className="text-[9px] text-neutral-500 font-mono">{f.size}</span>
                                      </div>
                                    </div>
                                    <IconComp size={12} className={cn("shrink-0 opacity-70 group-hover:opacity-100", meta.iconColor)} />
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 4. Connectors > (MATCHING REFERENCE IMAGE 2) */}
                    <div 
                      className="relative"
                      onMouseEnter={() => setActiveSubmenu("connectors")}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSubmenu(activeSubmenu === "connectors" ? null : "connectors")}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer group",
                          activeSubmenu === "connectors" 
                            ? "bg-white/[0.1] text-white" 
                            : "text-neutral-200 hover:text-white hover:bg-white/[0.08]"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers size={16} className="text-neutral-400 group-hover:text-white shrink-0" />
                          <span>Connectors</span>
                        </div>
                        <ChevronRight size={14} className="text-neutral-500 group-hover:text-neutral-300 shrink-0" />
                      </button>

                      {/* Submenu: Connectors (Live Real Data) */}
                      <AnimatePresence>
                        {activeSubmenu === "connectors" && (
                          <motion.div
                            initial={{ opacity: 0, x: 6, scale: 0.96 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 6, scale: 0.96 }}
                            transition={{ duration: 0.14 }}
                            className={cn(
                              "absolute inset-0 sm:inset-auto sm:left-full sm:ml-2 w-full sm:w-72 max-w-none sm:max-w-[320px] rounded-2xl border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.98)] p-2.5 z-[1000] space-y-2 select-none overflow-hidden flex flex-col justify-between",
                              attachMenuDirection === "down" ? "sm:top-0" : "sm:bottom-0"
                            )}
                            style={{ backgroundColor: "#14141c" }}
                          >
                            <div className="px-2 py-1 flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setActiveSubmenu(null); }}
                                className="sm:hidden text-[11px] text-neutral-400 hover:text-white"
                              >
                                ← Back
                              </button>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Live Connectors</span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-500/20">
                                {liveConnectors.filter(c => c.isConnected).length} Active
                              </span>
                            </div>

                            {/* Live Connectors List */}
                            <div className="space-y-1 max-h-52 sm:max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                              {loadingConnectors && liveConnectors.length === 0 && (
                                <div className="space-y-2 py-2">
                                  {[1, 2].map(i => (
                                    <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/[0.02] animate-pulse">
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-lg bg-white/[0.08]" />
                                        <div className="w-16 h-3 rounded bg-white/[0.08]" />
                                      </div>
                                      <div className="w-8 h-4 rounded-full bg-white/[0.08]" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {!loadingConnectors && liveConnectors.filter(c => c.isConnected).length === 0 && (
                                <div className="py-4 px-3 text-center space-y-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-400">
                                    <Layers size={14} />
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-[11.5px] font-semibold text-white">No active connectors</p>
                                    <p className="text-[10px] text-neutral-400 leading-snug">
                                      Connect Gmail, LinkedIn, Calendar & more to enable live tools.
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsAttachModalOpen(false);
                                      setActiveSubmenu(null);
                                      onOpenIntegrations?.();
                                    }}
                                    className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-[11px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                                  >
                                    <Plus size={12} />
                                    <span>Connect tools</span>
                                  </button>
                                </div>
                              )}

                              {liveConnectors.filter(c => c.isConnected).map((app) => {
                                const isEnabled = connectorsState[app.id] ?? true;
                                return (
                                  <div
                                    key={app.id}
                                    className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                      <div className="w-5 h-5 rounded-lg bg-[#181824] border border-white/[0.08] flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
                                        {app.logoUrl ? (
                                          <img
                                            src={app.logoUrl}
                                            alt={app.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                              (e.target as HTMLElement).style.display = 'none';
                                            }}
                                          />
                                        ) : (
                                          <span className="text-xs">{app.icon || "⚡"}</span>
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[12.5px] font-medium text-white truncate">{app.name}</span>
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_#34d399]" />
                                        </div>
                                        {app.userAccountIdentifier && (
                                          <span className="text-[9.5px] text-neutral-400 font-mono truncate max-w-[110px]">
                                            {app.userAccountIdentifier}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConnectorsState(prev => {
                                          const next = !(prev[app.id] ?? true);
                                          toast(next ? `${app.name} connector enabled` : `${app.name} connector paused`);
                                          return { ...prev, [app.id]: next };
                                        });
                                      }}
                                      className={cn(
                                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                        isEnabled ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-neutral-700"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                                          isEnabled ? "translate-x-4" : "translate-x-0"
                                        )}
                                      />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="border-t border-white/[0.06] pt-1.5 space-y-0.5">
                              {/* Add connector */}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAttachModalOpen(false);
                                  setActiveSubmenu(null);
                                  onOpenIntegrations?.();
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                              >
                                <Plus size={14} className="text-red-400" />
                                <span>Add connector</span>
                              </button>

                              {/* Manage connectors */}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAttachModalOpen(false);
                                  setActiveSubmenu(null);
                                  onOpenIntegrations?.();
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                              >
                                <Settings size={14} className="text-neutral-400" />
                                <span>Manage connectors</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bottom Quick Link Attachment Input */}
                    <div className="pt-1.5 mt-1 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1.5 bg-[#0f0f16] border border-white/[0.08] rounded-xl px-2 py-1 focus-within:border-white/[0.2]">
                        <LinkIcon size={12} className="text-neutral-400 shrink-0" />
                        <input
                          type="url"
                          placeholder="Paste YouTube / Web URL..."
                          value={attachUrl}
                          onChange={(e) => setAttachUrl(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddLink(); }}
                          className="w-full bg-transparent text-[11px] text-white placeholder:text-neutral-500 outline-none min-w-0"
                        />
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sleek Apple-Grade Capability Mode Selector Capsule Pill */}
            <div ref={capabilityDropdownRef} className="relative z-40">
              <button
                type="button"
                disabled={isRecording || isProcessingVoice}
                onClick={() => {
                  if (!isCapabilityDropdownOpen) {
                    setCapabilityMenuDirection(getSmartDirection(capabilityDropdownRef.current));
                  }
                  setIsCapabilityDropdownOpen(!isCapabilityDropdownOpen);
                }}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none border disabled:opacity-40 active:scale-95",
                  size === "compact" ? "px-2.5 py-1" : "px-3 py-1.5",
                  selectedCapability !== "auto"
                    ? "bg-white/[0.08] hover:bg-white/[0.12] border-white/[0.16] text-white shadow-sm"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.07] text-neutral-300 hover:text-white"
                )}
                title={`Active Mode: ${currentCapability.name}`}
              >
                <CapIcon size={12} className={cn("shrink-0", selectedCapability !== "auto" ? "text-white" : currentCapability.iconColor)} />
                <span className="text-[11.5px] sm:text-[12px] font-medium tracking-tight whitespace-nowrap">
                  {currentCapability.name}
                </span>
                <ChevronDown 
                  size={10} 
                  className={cn(
                    "text-neutral-400 transition-transform duration-200 shrink-0",
                    isCapabilityDropdownOpen && "rotate-180 text-white"
                  )} 
                />
              </button>

              {/* Apple macOS / iOS Style Capability Popover Menu (100% Solid Opaque) */}
              <AnimatePresence>
                {isCapabilityDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: capabilityMenuDirection === "down" ? -8 : 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: capabilityMenuDirection === "down" ? -8 : 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "absolute left-0 w-72 sm:w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.98)] p-2 z-[999] space-y-1 select-none",
                      capabilityMenuDirection === "down" ? "top-full mt-2.5" : "bottom-full mb-2.5"
                    )}
                    style={{ backgroundColor: "#121218" }}
                  >
                    <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-white/[0.06] mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Capability Mode
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {AGENT_CAPABILITIES.length} tools
                      </span>
                    </div>

                    <div className="space-y-0.5 max-h-[250px] sm:max-h-[290px] overflow-y-auto custom-scrollbar pr-0.5">
                      {AGENT_CAPABILITIES.map((cap) => {
                        const Icon = cap.icon;
                        const isSelected = cap.id === selectedCapability;
                        return (
                          <button
                            key={cap.id}
                            type="button"
                            onClick={() => {
                              setSelectedCapability(cap.id);
                              setIsCapabilityDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer group select-none border",
                              isSelected 
                                ? "bg-white/[0.1] text-white shadow-sm border-white/[0.12]" 
                                : "hover:bg-white/[0.05] text-neutral-300 hover:text-white border-transparent"
                            )}
                          >
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors border",
                              isSelected
                                ? "bg-white text-black border-white/20"
                                : "bg-white/[0.04] text-neutral-400 group-hover:text-white border-white/[0.06] group-hover:border-white/[0.1]"
                            )}>
                              <Icon size={14} className={isSelected ? "text-black" : cap.iconColor} />
                            </div>

                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[12.5px] font-medium tracking-tight truncate text-white">
                                  {cap.name}
                                </span>
                                {isSelected && (
                                  <Check size={13} className="text-white shrink-0 ml-1 stroke-[2.5]" />
                                )}
                              </div>
                              <span className="text-[10.5px] text-neutral-400 truncate leading-snug">
                                {cap.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Controls: Context Meter + Voice/Send */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* AI Capacity Meter Indicator (Only shown when user is logged in) */}
            {isLoggedIn && capacity && (() => {
              const pct = capacity?.percentage ?? 0;
              const isExceeded = capacity?.isExceeded || pct >= 100;
              const ringColor = pct >= 90 
                ? "text-rose-500" 
                : pct >= 70 
                  ? "text-amber-400" 
                  : "text-emerald-400";
              const strokeVal = Math.min(100, Math.max(pct === 0 ? 0 : 3, pct));

              return (
                <div 
                  className="relative flex items-center justify-center cursor-pointer p-1 group"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-capacity-modal", { detail: capacity }))}
                  onMouseEnter={() => setShowContextTooltip(true)}
                  onMouseLeave={() => setShowContextTooltip(false)}
                  title="Click to view AI capacity"
                >
                  <svg className="w-4 h-4 -rotate-90 transform transition-transform duration-300 group-hover:scale-110" viewBox="0 0 36 36">
                    <path
                      className="text-white/[0.08]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={cn(ringColor, "stroke-current transition-all duration-700 ease-out")}
                      strokeWidth="3.5"
                      strokeDasharray={`${strokeVal}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>

                  {/* Clean Percentage Tooltip (No raw tokens / credits) */}
                  <AnimatePresence>
                    {showContextTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className={cn(
                        "absolute right-0 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#14141c] border border-white/[0.12] text-xs text-neutral-200 shadow-2xl z-50 pointer-events-none",
                        size === "hero" ? "top-full mt-2" : "bottom-full mb-2"
                      )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            pct >= 90 ? "bg-rose-500 animate-pulse" : pct >= 70 ? "bg-amber-400" : "bg-emerald-400"
                          )} />
                          <span className="font-semibold text-white">{pct}% capacity used</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {capacity?.planName || "Free Plan"} • {isExceeded ? "Limit reached • Click to upgrade" : "Click to view capacity"}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}

            {/* ──── CONDITIONAL CONTROLS: RECORDING STATE VS NORMAL STATE ──── */}
            {isRecording ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                
                {/* 1. Cancel Recording Button */}
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-2.5 py-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
                  title="Cancel and discard recording"
                >
                  <X size={14} />
                  <span className="hidden sm:inline">Cancel</span>
                </button>

                {/* 2. Pause / Resume Recording Button */}
                <button
                  type="button"
                  onClick={togglePause}
                  className="p-2 rounded-xl text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center justify-center cursor-pointer"
                  title={isPaused ? "Resume recording" : "Pause recording"}
                >
                  {isPaused ? <Play size={13} className="fill-current" /> : <Pause size={13} />}
                </button>

                {/* 3. Done / Complete Recording Button */}
                <button
                  type="button"
                  onClick={finishRecordingAndTranscribe}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-sm flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  title="Finish recording and polish prompt"
                >
                  <Check size={14} className="stroke-[2.5]" />
                  <span>Done</span>
                </button>

              </div>
            ) : (
              <>
                {/* Voice Mic Button */}
                <button
                  type="button"
                  disabled={isProcessingVoice}
                  onClick={startRecording}
                  className="w-8 h-8 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center justify-center active:scale-95 cursor-pointer disabled:opacity-40"
                  title="Voice input mode (Ctrl+Shift+V)"
                >
                  <Mic size={15} />
                </button>

                {/* Apple-Grade Circular Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!hasText || isLoading || isProcessingVoice}
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 select-none",
                    hasText && !isLoading
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_2px_14px_rgba(239,68,68,0.45)] hover:scale-105 active:scale-95 cursor-pointer"
                      : "bg-white/[0.05] text-neutral-600 cursor-not-allowed border border-white/[0.04]"
                  )}
                  title="Submit prompt (Enter)"
                >
                  {isLoading || isProcessingVoice ? (
                    <div className="w-4 h-4 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowUp size={16} className={cn("stroke-[2.5]", hasText ? "text-white" : "text-neutral-600")} />
                  )}
                </button>
              </>
            )}

          </div>

        </div>

      </div>

      {/* ──── QUICK HORIZONTAL CAPABILITY PILLS (PAPERXIFY RED BRAND THEME) ──── */}
      {showQuickPills && !isRecording && !isProcessingVoice && (
        <div className="flex items-center gap-1.5 sm:gap-2 pt-3 pb-1 overflow-x-auto no-scrollbar max-w-full relative z-0">
          {[
            { label: "Image Gen", capId: "image", icon: ImageIcon, prompt: "Create a cinematic photorealistic 8k render of an autonomous futuristic AI laboratory in Tokyo at night" },
            { label: "Web Apps", capId: "web-apps", icon: Globe, prompt: "Build a modern interactive web app with clean UI and state management" },
            { label: "Slides", capId: "slides", icon: Presentation, prompt: "Create a 10-slide presentation deck explaining autonomous AI agents in 2026" },
            { label: "Plan", capId: "plan", icon: ListTodo, prompt: "Create a structured study syllabus and execution plan with milestones" },
            { label: "DeepSearch", capId: "deepsearch", icon: ScanSearch, prompt: "Perform deep academic research on quantum computing breakthroughs with citations" },
            { label: "Code", capId: "code", icon: Code2, prompt: "Write production-ready code solving this algorithm with complexity analysis" },
            { label: "Whiteboard", capId: "whiteboard", icon: PenTool, prompt: "Draw an Excalidraw architecture diagram of a scalable microservices cloud backend" }
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedCapability(item.capId);
                setInternalValue(item.prompt);
                onChange?.(item.prompt);
                onSelectSuggestion?.(item.prompt);
                textareaRef.current?.focus();
              }}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full border text-[11.5px] sm:text-xs transition-all active:scale-95 cursor-pointer shrink-0 group",
                selectedCapability === item.capId
                  ? "bg-red-500/15 text-white font-semibold border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  : "bg-[#0e0e15]/80 hover:bg-[#151522] border-white/[0.07] hover:border-red-500/40 text-neutral-300 hover:text-white shadow-sm"
              )}
            >
              <item.icon size={13} className={cn(selectedCapability === item.capId ? "text-red-400" : "text-red-400/90 group-hover:text-red-400", "transition-transform group-hover:scale-110")} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
