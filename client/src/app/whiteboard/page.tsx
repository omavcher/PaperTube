"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PenTool,
  Plus,
  Sparkles,
  Search,
  Grid,
  Clock,
  Trash2,
  Copy,
  ArrowRight,
  ExternalLink,
  Layers,
  Cpu,
  Workflow,
  Network,
  Layout,
  GitFork,
  Database,
  Loader2,
  FolderPlus,
  RefreshCw,
  Share2,
  Coins,
  Crown,
  ChevronDown,
  Info,
  Check,
  Zap,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Compass,
  FileCode,
  SlidersHorizontal,
  FileText,
  Star,
  Trophy,
  ShieldCheck,
  Download,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { FAQAccordion } from "@/components/FAQAccordion";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WhiteboardItem {
  _id?: string;
  slug: string;
  title: string;
  thumbnail?: string;
  elementCount?: number;
  tags?: string[];
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}


const WHITEBOARD_FORMATS = [
  { id: "all", label: "Overview & Canvases", icon: PenTool, desc: "All saved projects & blank canvas" },
  { id: "architecture", label: "System Architecture", icon: Cpu, desc: "Microservices, cloud topology, caches" },
  { id: "flowchart", label: "Logic Flowchart", icon: Workflow, desc: "Decision branching & algorithms" },
  { id: "mindmap", label: "Concept Mind Map", icon: Network, desc: "Brainstorming & knowledge trees" },
  { id: "wireframe", label: "UI Wireframe", icon: Layout, desc: "SaaS layout blueprints & mockups" },
  { id: "sequence", label: "Sequence Diagram", icon: GitFork, desc: "APIs, webhooks & transaction flows" },
  { id: "er", label: "Database ERD", icon: Database, desc: "Relational schemas & entity tables" },
];

const STARTER_SUGGESTIONS: Record<string, { label: string; prompt: string }[]> = {
  architecture: [
    { label: "E-Commerce Microservices", prompt: "Design a scalable E-Commerce Microservices Architecture with API Gateway, Auth Service, Product Catalog, Redis Cache, Stripe Payments, Kafka Event Bus, and PostgreSQL Database." },
    { label: "AWS 3-Tier Web App", prompt: "Create an AWS 3-Tier Architecture featuring CloudFront CDN, Route53, Application Load Balancer, ECS Fargate containers in private subnets, RDS Multi-AZ database, and S3 static bucket." },
    { label: "Real-Time Chat Backend", prompt: "Architect a Real-Time Chat System with WebSocket Gateway, Node.js pub/sub workers, Redis Cluster message broker, MongoDB message history, and Push Notification service." },
  ],
  flowchart: [
    { label: "JWT Auth & Refresh Flow", prompt: "Flowchart showing user login, access token issue, API request with Authorization header, 401 interceptor, refresh token rotation with secure cookie, and session logout." },
    { label: "Order Checkout & Payment", prompt: "User checkout flowchart: Cart validation, stock verification, coupon calculation, 3D Secure payment gateway charge, inventory deduction, and invoice email dispatch." },
    { label: "AI Content Moderation", prompt: "Automated content moderation workflow: Text ingress, toxicity classification check, automated pass, human reviewer quarantine queue, and policy flag action." },
  ],
  mindmap: [
    { label: "Full-Stack Web Dev Roadmap", prompt: "Mind map breaking down modern Full-Stack Web Development: Frontend (React, Next.js, CSS), Backend (Node, Express, Python), Database (Postgres, Mongo, Redis), DevOps (Docker, CI/CD, AWS)." },
    { label: "Startup GTM Strategy", prompt: "Comprehensive Mind Map for Startup Go-To-Market Strategy: Ideal Customer Profile, Value Proposition, Content Marketing, Paid Acquisition, Referral Loops, and Sales Enablement." },
    { label: "Machine Learning Concepts", prompt: "Knowledge graph mind map of Machine Learning: Supervised Learning (Regression, Classification), Unsupervised (Clustering, PCA), Reinforcement Learning, and Deep Learning (Transformers, CNNs)." },
  ],
  wireframe: [
    { label: "SaaS Analytics Dashboard", prompt: "Wireframe layout for a modern SaaS Analytics Dashboard: Collapsible Left Sidebar, Top KPI Metric Cards (MRR, Users, Churn), Main Revenue Line Chart, and Recent Transactions Table." },
    { label: "Landing Page Hero & Features", prompt: "Landing page wireframe with Announcement Banner, Header with navigation, Hero Section with headline & CTA buttons, 3-column Feature Grid, and Testimonials Carousel." },
    { label: "Mobile Checkout Screen", prompt: "Mobile UI wireframe for an e-commerce checkout screen with Shipping Address Card, Payment Method Selection (Cards, Apple Pay, UPI), Order Summary, and Sticky Pay Button." },
  ],
  sequence: [
    { label: "Stripe Webhook Delivery", prompt: "Sequence diagram between Customer Browser, Merchant Server, and Stripe API: Payment intent creation, 3D secure authentication, webhook event trigger, signature verification, and order fulfillment." },
    { label: "OAuth 2.0 Google Login", prompt: "Sequence diagram for OAuth 2.0 Authorization Code grant: Client redirect to Google Auth, user consent, authorization code callback, server-to-server token exchange, and profile fetch." },
    { label: "Distributed Lock Acquisition", prompt: "Sequence diagram showing distributed lock acquisition in Redis with Redlock algorithm across 3 nodes, TTL countdown, and release unlock procedure." },
  ],
  er: [
    { label: "E-Commerce Database Schema", prompt: "Entity Relationship diagram with users, products, categories, orders, order_items, reviews, and payments tables with primary/foreign keys and cardinality relationships." },
    { label: "School Management System", prompt: "Database ERD for School Management: students, teachers, courses, enrollments, classrooms, assignments, and grades tables with relational mappings." },
    { label: "Hospital Patient Records", prompt: "Relational database ER schema: patients, doctors, appointments, medical_records, prescriptions, and departments with foreign key constraints." },
  ],
};

const TRIVIA_TIPS = [
  {
    title: "⚡ Autonomous Excalidraw AI Agent",
    text: "Describe any cloud topology, sequence flow, or UI blueprint in plain English — the AI Agent generates positioned vector shapes, labels, and directed arrows instantly."
  },
  {
    title: "🎨 Cloud Real-Time Auto-Save",
    text: "Every stroke, shape, and text box you draw is debounced and synchronized to your Paperxify cloud workspace. Access your canvases from any device."
  },
  {
    title: "🧠 Excalidraw Hand-Drawn Feel",
    text: "Export high-resolution PNGs, SVGs, or raw .excalidraw JSON files to paste directly into documentation, PRs, Jira tickets, or Notion docs."
  },
  {
    title: "💡 Architecture Tier Spacing",
    text: "When drafting cloud architectures, organize components by horizontal tiers (Client, Gateway, Microservices, Data Store) to maintain clear visual flow."
  }
];

const LOADING_STEPS = [
  { id: 0, label: "Input Validation", desc: "Validating architectural prompt & constraints" },
  { id: 1, label: "Entity Tokenization", desc: "Extracting core system components & relationship graph" },
  { id: 2, label: "Relational Vector Topology", desc: "Computing coordinate grid hierarchy & non-overlapping bounds" },
  { id: 3, label: "Excalidraw Geometry Synthesis", desc: "Compiling shape nodes, bound labels, and directed arrows" },
  { id: 4, label: "Cloud Workspace Allocation", desc: "Allocating project slug & launching interactive canvas..." }
];

const WHITEBOARD_FAQS = [
  {
    question: "What is Paperxify Agentic Whiteboard?",
    answer: "Paperxify Agentic Whiteboard is an autonomous AI visual workspace powered by Excalidraw. It turns natural language descriptions into complete, fully editable system architectures, flowcharts, mind maps, and wireframes with auto-positioned shapes and arrows."
  },
  {
    question: "Can I edit diagrams after the AI generates them?",
    answer: "Yes! Everything generated by the AI is a native Excalidraw element. You can move, resize, recolor, edit text, connect new arrows, draw freehand, and group elements freely on the infinite canvas."
  },
  {
    question: "Are my whiteboards saved automatically to the cloud?",
    answer: "Yes, every edit is debounced and automatically synchronized to your Paperxify cloud account. We also keep a local backup in your browser so you never lose your work."
  },
  {
    question: "What export formats are supported?",
    answer: "You can export your whiteboards as raw .excalidraw JSON files, high-resolution PNGs, SVGs, or share a direct read/write link with teammates and classmates."
  },
  {
    question: "Which diagram types does the AI Agent support?",
    answer: "The AI supports Microservice & Cloud Architectures (AWS/GCP), Logic Flowcharts, Concept Mind Maps, SaaS UI Wireframes, API Sequence Diagrams, and Database Entity Relationship Diagrams (ERDs)."
  }
];

const COMPARISON_ROWS = [
  {
    feature: "Autonomous AI Generation",
    col2: "Full Excalidraw Vector Diagrams",
    col3: "Static Images or Plain Text",
    col4: "Manual Drawing from Scratch"
  },
  {
    feature: "Native Canvas Editing",
    col2: "100% Editable Nodes & Arrows",
    col3: "Locked or Uneditable Pixels",
    col4: "Editable but Slow"
  },
  {
    feature: "Cloud Auto-Save & Sync",
    col2: "Real-Time Cloud Persistence",
    col3: "Session Only / Lost on Refresh",
    col4: "Local Files Only"
  },
  {
    feature: "System Architecture & ERDs",
    col2: "Built-in Tier & Relational Logic",
    col3: "Generic Boxes without Direction",
    col4: "Manual Grid Alignment"
  },
  {
    feature: "Export & Sharing",
    col2: "Excalidraw JSON, PNG, SVG & URL",
    col3: "Watermarked PNG Only",
    col4: "Manual Export Files"
  }
];

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "";
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function WhiteboardHubPage() {
  const router = useRouter();
  const [activeFormat, setActiveFormat] = useState("all");
  const [prompt, setPrompt] = useState("");
  const [whiteboards, setWhiteboards] = useState<WhiteboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [tipIndex, setTipIndex] = useState(0);

  // Fetch Token Balance
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      api.get("/users/tokens", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data.success) setTokenInfo(res.data);
        })
        .catch(() => {});
    }
  }, []);

  // Rotate Tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TRIVIA_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Whiteboards
  const fetchWhiteboards = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (token) {
        const res = await api.get(`/whiteboard/user?search=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setWhiteboards(res.data.data || []);
        }
      } else {
        const local = localStorage.getItem("paperxify_local_whiteboards");
        if (local) {
          const parsed: WhiteboardItem[] = JSON.parse(local);
          let filtered = parsed;
          if (searchQuery) {
            filtered = filtered.filter((w) =>
              w.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          setWhiteboards(filtered);
        } else {
          setWhiteboards([]);
        }
      }
    } catch (err) {
      console.error("Failed to load whiteboards:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchWhiteboards();
  }, [fetchWhiteboards]);

  // Create a new blank whiteboard
  const handleCreateBlank = () => {
    const randomSlug = `board-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    router.push(`/whiteboard/${randomSlug}`);
  };

  // Generate Diagram with AI
  const handleGenerateAI = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim()) {
      toast.error("Please describe what you want to diagram.");
      return;
    }

    try {
      setGenerating(true);
      setActiveStep(0);

      const stepTimer1 = setTimeout(() => setActiveStep(1), 500);
      const stepTimer2 = setTimeout(() => setActiveStep(2), 1200);
      const stepTimer3 = setTimeout(() => setActiveStep(3), 2000);

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.post(
        "/whiteboard/ai-generate",
        {
          prompt: targetPrompt,
          diagramType: activeFormat === "all" ? "architecture" : activeFormat,
          theme: "dark",
        },
        { headers }
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (response.data.success && response.data.elements) {
        setActiveStep(4);
        const title = response.data.title || "AI Generated Diagram";
        const newSlug = `ai-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 22)}-${Math.random().toString(36).slice(2, 6)}`;

        // Preload cache for smooth initial render
        localStorage.setItem(
          `paperxify_wb_${newSlug}`,
          JSON.stringify({
            slug: newSlug,
            title,
            elements: response.data.elements,
            appState: { theme: "dark", viewBackgroundColor: "#0d0d0d" },
            files: {},
          })
        );

        toast.success(`Generated "${title}" whiteboard!`);
        setTimeout(() => {
          router.push(`/whiteboard/${newSlug}`);
        }, 400);
      } else {
        toast.error("Failed to generate diagram layout. Please try again.");
        setGenerating(false);
      }
    } catch (err: any) {
      console.error("Whiteboard AI Generation Error:", err);
      toast.error(err.response?.data?.message || "Failed to generate AI diagram.");
      setGenerating(false);
    }
  };

  // Delete whiteboard
  const handleDelete = async (idOrSlug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this whiteboard?")) return;

    try {
      setDeletingId(idOrSlug);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (token) {
        await api.delete(`/whiteboard/${idOrSlug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const local = localStorage.getItem("paperxify_local_whiteboards");
      if (local) {
        const parsed: WhiteboardItem[] = JSON.parse(local);
        const filtered = parsed.filter((w) => w.slug !== idOrSlug && w._id !== idOrSlug);
        localStorage.setItem("paperxify_local_whiteboards", JSON.stringify(filtered));
      }

      setWhiteboards((prev) => prev.filter((w) => w.slug !== idOrSlug && w._id !== idOrSlug));
      toast.success("Whiteboard deleted");
    } catch (err) {
      toast.error("Failed to delete whiteboard");
    } finally {
      setDeletingId(null);
    }
  };

  // Duplicate whiteboard
  const handleDuplicate = async (idOrSlug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setDuplicatingId(idOrSlug);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (token) {
        const res = await api.post(
          `/whiteboard/duplicate/${idOrSlug}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          toast.success("Whiteboard duplicated");
          fetchWhiteboards();
        }
      } else {
        const original = whiteboards.find((w) => w.slug === idOrSlug || w._id === idOrSlug);
        if (original) {
          const newSlug = `board-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
          const dup: WhiteboardItem = {
            ...original,
            slug: newSlug,
            title: `${original.title} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const updated = [dup, ...whiteboards];
          localStorage.setItem("paperxify_local_whiteboards", JSON.stringify(updated));
          setWhiteboards(updated);
          toast.success("Whiteboard duplicated");
        }
      }
    } catch (err) {
      toast.error("Failed to duplicate whiteboard");
    } finally {
      setDuplicatingId(null);
    }
  };

  const currentSuggestions =
    activeFormat === "all"
      ? STARTER_SUGGESTIONS.architecture
      : STARTER_SUGGESTIONS[activeFormat] || STARTER_SUGGESTIONS.architecture;

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-violet-950/50 relative overflow-hidden">
      {/* ──── BACKGROUND ATMOSPHERE ──── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-950/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-purple-900/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* ──── MAIN CONTENT ──── */}
      <main className="relative z-10 w-full flex flex-col items-center pt-4 sm:pt-8">
        {/* ──── HERO SECTION ──── */}
        <section className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Sparkles size={12} className="text-violet-400 animate-pulse" />
            <span>AI AGENTIC WHITEBOARD STUDIO</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white uppercase px-1">
            AGENTIC WHITEBOARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">AI CANVAS</span> & ARCHITECT
          </h1>

          <p className="text-neutral-400 text-xs sm:text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed px-2">
            Generate system architectures, logic flowcharts, mind maps, and interactive wireframes from plain text directly onto an infinite collaborative Excalidraw canvas.
          </p>
        </section>

        {/* ──── PRIMARY GLASS GENERATOR STUDIO CARD ──── */}
        <section id="search-form" className="w-full max-w-4xl mx-auto px-3 sm:px-6 mb-10 sm:mb-12">
          <div className="bg-gradient-to-b from-[#13111c] via-[#0d0c13] to-[#0a0a0c] border border-violet-500/30 hover:border-violet-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_40px_rgba(139,92,246,0.15)] transition-all relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/15 blur-[90px] rounded-full pointer-events-none" />

            {/* Category Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mb-3.5 border-b border-white/[0.06]">
              {WHITEBOARD_FORMATS.map((fmt) => {
                const Icon = fmt.icon;
                const isActive = activeFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setActiveFormat(fmt.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0",
                      isActive
                        ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-violet-400/40"
                        : "bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-neutral-400 hover:text-white"
                    )}
                  >
                    <Icon size={12} className={isActive ? "text-white" : "text-violet-400"} />
                    <span>{fmt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Box */}
            <div className="relative mb-3.5">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleGenerateAI();
                  }
                }}
                rows={3}
                placeholder={`Describe your diagram or architecture in plain English... (e.g. "Scalable E-Commerce Microservices with API Gateway, Auth Service, Redis Cache, Stripe Payments, Kafka, and PostgreSQL")`}
                className="w-full bg-[#09090b] border border-white/[0.09] focus:border-violet-500/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all resize-none shadow-inner leading-relaxed"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
                <Sparkles size={12} className="text-violet-400 shrink-0" />
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px] text-neutral-300">Ctrl + Enter</kbd> to generate</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCreateBlank}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-bold text-white transition-colors cursor-pointer text-center"
                >
                  <Plus size={14} className="text-neutral-400" />
                  <span>Open Blank</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateAI()}
                  disabled={generating || !prompt.trim()}
                  className={cn(
                    "flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer",
                    generating || !prompt.trim()
                      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.45)] active:scale-95"
                  )}
                >
                  {generating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-white animate-pulse" />
                      <span>Generate Whiteboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Popular Starter Chips */}
            <div className="pt-3 mt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                <Lightbulb size={11} className="text-amber-400" />
                <span>Popular Starters</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {currentSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(item.prompt);
                      handleGenerateAI(item.prompt);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.03] hover:bg-violet-500/10 border border-white/[0.06] hover:border-violet-500/30 text-[10.5px] font-medium text-neutral-300 hover:text-violet-300 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles size={10} className="text-violet-400" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ──── STEP-BY-STEP GENERATING OVERLAY MODAL ──── */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-md bg-[#0f0e17] border border-violet-500/30 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(139,92,246,0.2)] space-y-5"
              >
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 mx-auto shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    <Loader2 size={24} className="animate-spin text-violet-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Architecting Agentic Whiteboard</h3>
                  <p className="text-xs text-neutral-400 truncate max-w-xs mx-auto">
                    "{prompt}"
                  </p>
                </div>

                {/* Progress Stepper */}
                <div className="space-y-2 pt-2">
                  {LOADING_STEPS.map((step, idx) => {
                    const isDone = activeStep > idx;
                    const isCurrent = activeStep === idx;
                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl transition-all border text-xs",
                          isDone
                            ? "bg-violet-950/20 border-violet-500/30 text-neutral-300"
                            : isCurrent
                            ? "bg-violet-600/15 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)] font-semibold"
                            : "bg-transparent border-transparent text-neutral-600"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold",
                            isDone
                              ? "bg-emerald-500 text-black"
                              : isCurrent
                              ? "bg-violet-500 text-white animate-pulse"
                              : "bg-neutral-800 text-neutral-500"
                          )}
                        >
                          {isDone ? <Check size={11} strokeWidth={3} /> : idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="leading-none text-xs">{step.label}</p>
                          {isCurrent && (
                            <p className="text-[10px] text-violet-400 mt-1">{step.desc}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──── RECENT WHITEBOARD PROJECTS WORKSPACE GRID ──── */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 border-t border-white/[0.04]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Recent Whiteboards</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {whiteboards.length} Canvases
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Saved collaborative boards and AI generated system maps
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search canvases..."
                  className="w-full bg-[#111111] border border-white/[0.08] focus:border-violet-500/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={fetchWhiteboards}
                title="Refresh projects"
                className="p-2 rounded-xl bg-[#111111] border border-white/[0.08] hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={cn(loading && "animate-spin text-violet-400")} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-500">
              <Loader2 size={32} className="animate-spin text-violet-500" />
              <p className="text-xs font-medium tracking-wide">Loading workspace whiteboards...</p>
            </div>
          ) : whiteboards.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-[#0e0e0e] border border-white/[0.06] rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                <PenTool size={26} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No whiteboards created yet</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                  Launch a blank canvas or type an architecture prompt above to let the AI Agent design your first whiteboard.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCreateBlank}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create Blank Whiteboard</span>
                </button>
              </div>
            </div>
          ) : (
            /* Projects Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* 1st Item: Create Blank Canvas Card */}
              <button
                type="button"
                onClick={handleCreateBlank}
                className="group relative bg-[#09090b] hover:bg-[#121019] border border-dashed border-white/[0.12] hover:border-violet-500/50 rounded-2xl p-4 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2.5 min-h-[140px] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-md">
                  <Plus size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-200 group-hover:text-white">New Blank Canvas</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Start drawing from scratch</p>
                </div>
              </button>

              {whiteboards.map((item) => (
                <Link
                  key={item.slug}
                  href={`/whiteboard/${item.slug}`}
                  className="group relative bg-[#0e0e0e] hover:bg-[#13111c] border border-white/[0.06] hover:border-violet-500/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-[0_0_25px_rgba(139,92,246,0.12)]"
                >
                  <div>
                    {/* Card Header & Actions (Always visible on mobile touch devices) */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                        <PenTool size={14} />
                      </div>

                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleDuplicate(item.slug, e)}
                          title="Duplicate"
                          disabled={duplicatingId === item.slug}
                          className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Copy size={11} className={cn(duplicatingId === item.slug && "animate-spin")} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.slug, e)}
                          title="Delete"
                          disabled={deletingId === item.slug}
                          className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Stats */}
                    <h3 className="text-sm font-bold text-neutral-200 group-hover:text-white truncate leading-tight">
                      {item.title || "Untitled Whiteboard"}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-500">
                      <span className="flex items-center gap-1 text-violet-400">
                        <Layers size={10} />
                        {item.elementCount || 0} elements
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(item.updatedAt || item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-neutral-400 group-hover:text-violet-400 transition-colors">
                    <span className="text-[11px] font-semibold">Open Canvas</span>
                    <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ──── GLOBAL PREMIUM SHOWCASE & COMPARISON SECTIONS (like /presentation-generator & /youtube-to-notes) ──── */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-8 space-y-32">
          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Instant Excalidraw AI Canvas</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                ARCHITECT COMPLEX SYSTEMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">IN SECONDS</span>
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                Stop manually arranging shapes and dragging arrows. Describe your cloud backend, algorithm branching, or database schema, and let Paperxify's Agentic AI construct the entire Excalidraw coordinate grid automatically.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { title: "Autonomous Layouts", desc: "Non-overlapping node placements and directed connection vectors." },
                  { title: "Cloud Auto-Sync", desc: "Debounced real-time cloud backup across all your devices." },
                  { title: "Full Excalidraw Native", desc: "Complete hand-drawn aesthetic with SVG & JSON export." },
                  { title: "Multi-Model AI", desc: "Powered by OpenRouter multi-model diagram intelligence." },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1 bg-violet-500/15 border border-violet-500/30 text-violet-400 rounded-lg mt-0.5">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{feature.title}</h4>
                      <p className="text-neutral-500 text-xs mt-0.5">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Quote Box */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-purple-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-violet-400 text-violet-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Highly Rated</span>
                </div>
                <blockquote className="text-sm text-neutral-300 italic font-light leading-relaxed">
                  "I generated an entire AWS microservices architecture with Redis cache and Kafka queues in under 10 seconds. We put it straight into our design doc."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-xs">
                    CS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Alex Chen</div>
                    <div className="text-[10px] text-neutral-500">Staff Software Engineer</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Capabilities Comparison Table */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why engineers, students, and architects choose Paperxify Agentic Whiteboard.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-violet-400 bg-violet-950/10">Paperxify Whiteboard</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Standard AI Tools</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Drawing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    {COMPARISON_ROWS.map((row, idx) => (
                      <TableRow key={idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <TableCell className="p-5 font-semibold text-neutral-200">{row.feature}</TableCell>
                        <TableCell className="p-5 font-bold text-violet-400 bg-violet-950/10">
                          <Check size={16} className="text-emerald-400 inline mr-1" /> {row.col2}
                        </TableCell>
                        <TableCell className="p-5 text-neutral-500">{row.col3}</TableCell>
                        <TableCell className="p-5 text-neutral-500">{row.col4}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>

          {/* Section 3: User Testimonials Carousel */}
          <TestimonialsCarousel />

          {/* Section 4: Rich FAQ Accordion */}
          <FAQAccordion faqs={WHITEBOARD_FAQS} />

          {/* Section 5: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-violet-950/5 pointer-events-none" />
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">START ARCHITECTING YOUR NEXT PROJECT</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              Create clean system blueprints, flowcharts, and mind maps in seconds with Paperxify's Agentic Whiteboard AI.
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Generate Canvas Now <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </div>

        {/* ──── FOOTER ──── */}
        <Footer />
      </main>
    </div>
  );
}
