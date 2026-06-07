"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { 
  Workflow, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Download, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  Coins, 
  AlertTriangle, 
  Crown, 
  Info,
  Calendar,
  Play,
  LayoutGrid,
  Search,
  ArrowLeft,
  Edit3,
  Eye,
  Database,
  User,
  CheckSquare,
  Code,
  Layers,
  Activity,
  FileText,
  Settings,
  ChevronDown,
  Brain,
  Cpu,
  Lock,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import { AuthLoginModal, PremiumUpgradeModal } from "@/components/AuthGuard";
import Link from "next/link";
import DiagramsWorkspace from "@/components/DiagramsWorkspace";
import Footer from "@/components/Footer";


interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: string;
  details?: string;
  value?: number; // for charts/Sankey
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

const DIAGRAM_FORMATS = [
  { id: "flowchart", label: "Flowchart", icon: Workflow },
  { id: "sequence", label: "Sequence Diagram", icon: Activity },
  { id: "class", label: "Class Diagram", icon: Layers },
  { id: "state", label: "State Diagram", icon: RefreshCw },
  { id: "er", label: "ER Diagram", icon: Database },
  { id: "journey", label: "User Journey", icon: CompassIcon },
  { id: "pie", label: "Pie Chart", icon: CircleIcon },
  { id: "quadrant", label: "Quadrant Chart", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "sankey", label: "Sankey Diagram", icon: MergeIcon },
  { id: "xy", label: "XY Chart", icon: LineChartIcon },
  { id: "block", label: "Block Diagram", icon: ServerIcon },
];

function CompassIcon(props: any) { return <Activity {...props} />; }
function CircleIcon(props: any) { return <Activity {...props} />; }
function MergeIcon(props: any) { return <Activity {...props} />; }
function LineChartIcon(props: any) { return <Activity {...props} />; }
function ServerIcon(props: any) { return <Activity {...props} />; }

const AI_MODELS = [
  { id: "flash",   name: "Flash",   accessTier: "Free",  desc: "Fast & lightweight diagram layout builder",        color: "sky",    hex: "#38bdf8" },
  { id: "canvas",  name: "Canvas",  accessTier: "Pro",   desc: "High-resolution coordinate structuring",            color: "violet", hex: "#a78bfa" },
  { id: "scholar", name: "Scholar", accessTier: "Pro",   desc: "Academic citation mappings & logic checks",         color: "emerald",hex: "#34d399" },
  { id: "atlas",   name: "Atlas",   accessTier: "Power", desc: "Max-context complex system architecture map",       color: "amber",  hex: "#fbbf24" },
];

const LANGUAGES = ["English", "German", "Spanish", "French", "Japanese", "Arabic"];

const TRIVIA_TIPS = [
  {
    title: "🧠 Diagram Rule: Keep text concise",
    text: "Diagrams are most effective when they present clear, brief names. Save deep explanations for side summary notes."
  },
  {
    title: "⚡ Flow Direction",
    text: "Align flowchart steps top-to-bottom or left-to-right to support natural cognitive scanning paths."
  },
  {
    title: "🎨 Contrast rules",
    text: "Limit vibrant neon accent colors to terminal nodes, decision gates, or high-alert parameters to prevent visual fatigue."
  },
  {
    title: "📐 Grid Alignment",
    text: "Centering node coordinate scales helps users map relational connections across complex maps easily."
  },
  {
    title: "💡 Dual Coding Concept",
    text: "Integrating verbal descriptions alongside concept maps improves informational retention indices by 150%."
  }
];

const LOADING_STEPS = [
  { id: 0, label: "Input Validation", desc: "Validating concept prompt coordinates and constraints check" },
  { id: 1, label: "Structural Tokenization", desc: "Parsing key topics and identifying core entities relationships" },
  { id: 2, label: "Relational Mapping", desc: "Extracting dependencies and sequencing node connection tables" },
  { id: 3, label: "Layout Vector Logic", desc: "Calibrating layout hierarchy scaling algorithms" },
  { id: 4, label: "AI Diagram Synthesis", desc: "Executing layout models to compile vector coordinates" },
  { id: 5, label: "Glow & Theme Injector", desc: "Injecting custom HSL themes and responsive class styles" },
  { id: 6, label: "Vector Asset Compiler", desc: "Compiling vector SVG node code layers" },
  { id: 7, label: "Loading Workspace Workspace", desc: "Activating interactive canvas elements..." }
];

// Seed initial dataset structures for the 12 formats
const SEED_DATASETS: Record<string, { nodes: Node[]; edges: Edge[]; desc: string }> = {
  flowchart: {
    desc: "Decision flow showing client API request processing logic.",
    nodes: [
      { id: "1", label: "Start API Request", x: 350, y: 50, type: "start", details: "Ingresses HTTPS request connection payload." },
      { id: "2", label: "Check Auth Credentials", x: 350, y: 150, type: "process", details: "Extracts Bearer token parameters." },
      { id: "3", label: "Is Token Valid?", x: 350, y: 260, type: "decision", details: "Diffs key signatures against cryptographic validations." },
      { id: "4", label: "Access Approved", x: 200, y: 380, type: "success", details: "Authorizes resource pipeline fetches." },
      { id: "5", label: "Access Denied (401)", x: 500, y: 380, type: "fail", details: "Halts routing and returns 401 Unauthorized." }
    ],
    edges: [
      { from: "1", to: "2" },
      { from: "2", to: "3" },
      { from: "3", to: "4", label: "YES" },
      { from: "3", to: "5", label: "NO" }
    ]
  },
  sequence: {
    desc: "Vertical timeline sequence showing request transactions between Client, Gateway, and Database.",
    nodes: [
      { id: "client", label: "User Client", x: 150, y: 80, type: "lifeline", details: "Initiates transaction fetch request." },
      { id: "gateway", label: "API Gateway", x: 380, y: 80, type: "lifeline", details: "Routes ingress payloads and checks sessions." },
      { id: "db", label: "Core Database", x: 610, y: 80, type: "lifeline", details: "Retrieves user relational profile." },
      { id: "msg1", label: "1. GET /profile", x: 265, y: 160, type: "message", details: "HTTP Request payload sent to gateway." },
      { id: "msg2", label: "2. SELECT Query", x: 495, y: 240, type: "message", details: "SQL lookup query checking user table ID." },
      { id: "msg3", label: "3. User Data Row", x: 495, y: 320, type: "message", details: "DB returns relational user dataset." },
      { id: "msg4", label: "4. JSON Response", x: 265, y: 400, type: "message", details: "API returns profile details to client." }
    ],
    edges: [
      { from: "client", to: "gateway" },
      { from: "gateway", to: "db" }
    ]
  },
  class: {
    desc: "Object-oriented class relationships with inheritance.",
    nodes: [
      { id: "1", label: "User Class", x: 350, y: 80, type: "class", details: "Attributes: id, name, email\nMethods: login(), logout()" },
      { id: "2", label: "AdminUser Class", x: 200, y: 260, type: "class", details: "Attributes: permissions: Set\nMethods: deleteUser(), editPlan()" },
      { id: "3", label: "StandardUser Class", x: 500, y: 260, type: "class", details: "Attributes: credits: Number\nMethods: requestDraft(), makeDiagram()" }
    ],
    edges: [
      { from: "2", to: "1", label: "inherits" },
      { from: "3", to: "1", label: "inherits" }
    ]
  },
  state: {
    desc: "State machine transitions for a background worker queue process.",
    nodes: [
      { id: "1", label: "Idle State", x: 150, y: 200, type: "state", details: "Worker waits for incoming target queues." },
      { id: "2", label: "Processing State", x: 350, y: 100, type: "state", details: "Compiles prompt templates and parses coordinates." },
      { id: "3", label: "Error Fault", x: 350, y: 300, type: "state", details: "Catches process exceptions and halts queues." },
      { id: "4", label: "Success Commited", x: 550, y: 200, type: "state", details: "Writes output files to disk storage." }
    ],
    edges: [
      { from: "1", to: "2", label: "Queue In" },
      { from: "2", to: "3", label: "Exception" },
      { from: "2", to: "4", label: "Success" },
      { from: "3", to: "1", label: "Reset" },
      { from: "4", to: "1", label: "Done" }
    ]
  },
  er: {
    desc: "Entity-Relationship model detailing tables, keys, and relational cardinality.",
    nodes: [
      { id: "1", label: "users (Table)", x: 200, y: 180, type: "table", details: "PK: id (INT)\nFields: email (VARCHAR)\ncreated_at (TIMESTAMP)" },
      { id: "2", label: "sessions (Table)", x: 500, y: 180, type: "table", details: "PK: id (INT)\nFK: user_id (INT)\ntoken (VARCHAR)" }
    ],
    edges: [
      { from: "1", to: "2", label: "1 to Many (1..N)" }
    ]
  },
  journey: {
    desc: "Customer onboarding emotional roadmap journey.",
    nodes: [
      { id: "1", label: "Phase 1: Discover", x: 120, y: 150, type: "journey", details: "User reads blog post & lands on site.\nEmotion: Curious 🤨" },
      { id: "2", label: "Phase 2: Try Tool", x: 350, y: 220, type: "journey", details: "Inputs custom prompt to generate diagram.\nEmotion: Excited 🤩" },
      { id: "3", label: "Phase 3: Upgrade", x: 580, y: 130, type: "journey", details: "Unlocks Pro model capabilities & vector export.\nEmotion: Delighted 🥰" }
    ],
    edges: [
      { from: "1", to: "2" },
      { from: "2", to: "3" }
    ]
  },
  pie: {
    desc: "Categorical allocation breakdown. Hover coordinates to review.",
    nodes: [
      { id: "1", label: "API Gateway (40%)", x: 150, y: 120, type: "slice", value: 40 },
      { id: "2", label: "Data Core (30%)", x: 150, y: 190, type: "slice", value: 30 },
      { id: "3", label: "Cache Store (20%)", x: 150, y: 260, type: "slice", value: 20 },
      { id: "4", label: "NPU Classifiers (10%)", x: 150, y: 330, type: "slice", value: 10 }
    ],
    edges: []
  },
  quadrant: {
    desc: "Action items mapped in an Impact vs. Effort metric grid.",
    nodes: [
      { id: "1", label: "Easy Wins", x: 200, y: 150, type: "high-impact-low-effort", details: "High impact, low effort. Do these first!" },
      { id: "2", label: "Big Projects", x: 500, y: 150, type: "high-impact-high-effort", details: "High value, high resource cost. Plan well." },
      { id: "3", label: "Fillers", x: 200, y: 350, type: "low-impact-low-effort", details: "Low value, low effort. Pick up during slack times." },
      { id: "4", label: "Money Pit Tasks", x: 500, y: 350, type: "low-impact-high-effort", details: "Low value, high resource cost. Avoid if possible." }
    ],
    edges: []
  },
  timeline: {
    desc: "Horizontal timeline roadmap showing milestones.",
    nodes: [
      { id: "1", label: "2024: Genesis", x: 120, y: 250, type: "event", details: "MVP platform launch with core transcription features." },
      { id: "2", label: "2025: Scaling", x: 350, y: 250, type: "event", details: "Integrated flashcards and custom workspace features." },
      { id: "3", label: "2026: AI Suite", x: 580, y: 250, type: "event", details: "Redesigned diagram generator, writer, and personal study rooms." }
    ],
    edges: [
      { from: "1", to: "2" },
      { from: "2", to: "3" }
    ]
  },
  sankey: {
    desc: "Inflow parameters distribution and output splits.",
    nodes: [
      { id: "in1", label: "Organic Search", x: 120, y: 150, type: "flow-input", value: 80 },
      { id: "in2", label: "Referral Link", x: 120, y: 300, type: "flow-input", value: 40 },
      { id: "mid", label: "Web Ingress Gateway", x: 350, y: 220, type: "flow-mid", value: 120 },
      { id: "out1", label: "Signups", x: 580, y: 150, type: "flow-out", value: 70 },
      { id: "out2", label: "Bounces", x: 580, y: 300, type: "flow-out", value: 50 }
    ],
    edges: [
      { from: "in1", to: "mid" },
      { from: "in2", to: "mid" },
      { from: "mid", to: "out1" },
      { from: "mid", to: "out2" }
    ]
  },
  xy: {
    desc: "Line graph parameters plotting coordinates indices.",
    nodes: [
      { id: "1", label: "P1: 100", x: 180, y: 380, type: "point", details: "Coord: (10, 20)" },
      { id: "2", label: "P2: 240", x: 280, y: 260, type: "point", details: "Coord: (25, 45)" },
      { id: "3", label: "P3: 310", x: 380, y: 300, type: "point", details: "Coord: (40, 38)" },
      { id: "4", label: "P4: 480", x: 480, y: 140, type: "point", details: "Coord: (60, 82)" },
      { id: "5", label: "P5: 550", x: 580, y: 190, type: "point", details: "Coord: (80, 70)" }
    ],
    edges: [
      { from: "1", to: "2" },
      { from: "2", to: "3" },
      { from: "3", to: "4" },
      { from: "4", to: "5" }
    ]
  },
  block: {
    desc: "Sequential block architecture flow diagram.",
    nodes: [
      { id: "1", label: "Ingress Sensor", x: 120, y: 220, type: "block", details: "Receives raw analog environment signals." },
      { id: "2", label: "A/D Converter", x: 280, y: 220, type: "block", details: "Quantizes electrical frequencies to digital arrays." },
      { id: "3", label: "Core DSP Filter", x: 440, y: 220, type: "block", details: "Runs high-precision algorithmic noise removals." },
      { id: "4", label: "Classify NPU", x: 600, y: 220, type: "block", details: "Executes convolutional classification logic." }
    ],
    edges: [
      { from: "1", to: "2" },
      { from: "2", to: "3" },
      { from: "3", to: "4" }
    ]
  }
};

export default function AIDiagramClient({ initialFormat }: { initialFormat?: string }) {
  const format = initialFormat || "flowchart";
  
  // Config & State settings matching HomeMain.tsx
  const [prompt, setPrompt] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>(format);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [outputLanguage, setOutputLanguage] = useState<string>("English");
  const [selectedTheme, setSelectedTheme] = useState<string>("cyber");
  const [mobileTab, setMobileTab] = useState<"input" | "preview">("input");

  // Logic states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activeTipIndex, setActiveTipIndex] = useState<number>(0);
  const [pendingResult, setPendingResult] = useState<any>(null);

  // User & Access States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [userPlanId, setUserPlanId] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<number | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          const res = await api.get('/users/tokens', { headers: { 'Auth': token } });
          if (res.data.success) {
            setUserTokens(res.data.tokens);
            if (res.data.isSubscribed) {
              setHasPremiumAccess(true);
              setUserPlanId(res.data.planId || null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch neural tokens:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  // Workspace View State
  const [showWorkspace, setShowWorkspace] = useState<boolean>(false);
  const [nodes, setNodes] = useState<Node[]>(() => {
    const targetFormat = SEED_DATASETS[format] ? format : "flowchart";
    return SEED_DATASETS[targetFormat].nodes.map((n) => ({ ...n }));
  });
  const [edges, setEdges] = useState<Edge[]>(() => {
    const targetFormat = SEED_DATASETS[format] ? format : "flowchart";
    return SEED_DATASETS[targetFormat].edges.map((e) => ({ ...e }));
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(() => {
    const targetFormat = SEED_DATASETS[format] ? format : "flowchart";
    const initialNodes = SEED_DATASETS[targetFormat].nodes;
    return initialNodes.length > 0 ? { ...initialNodes[0] } : null;
  });

  // Interactive Viewport Navigation States
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<number>(0);

  // Sync URL parameters helper
  const syncParamsToURL = useCallback((formatId: string, currentPrompt: string, modelId: string, lang: string, theme: string) => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams();
      if (currentPrompt.trim()) {
        searchParams.set("prompt", currentPrompt.trim());
      }
      if (modelId && modelId !== "flash") {
        searchParams.set("model", modelId);
      }
      if (lang && lang !== "English") {
        searchParams.set("language", lang);
      }
      if (theme && theme !== "cyber") {
        searchParams.set("theme", theme);
      }
      const searchStr = searchParams.toString();
      const suffix = searchStr ? `?${searchStr}` : "";
      window.history.pushState(null, "", `/ai-diagram/${formatId}${suffix}`);
    }
  }, []);

  // Load a saved diagram from the library into the active workspace editor
  const handleLoadDiagram = (diagram: any) => {
    setSelectedFormat(diagram.format);
    const foundModel = AI_MODELS.find(m => m.id === diagram.model);
    if (foundModel) setSelectedModel(foundModel);
    setOutputLanguage(diagram.language || "English");
    setSelectedTheme(diagram.theme || "cyber");
    setPrompt(diagram.prompt);
    
    // Cloned nodes and edges
    setNodes(diagram.nodes.map((n: any) => ({ ...n })));
    setEdges(diagram.edges ? diagram.edges.map((e: any) => ({ ...e })) : []);
    setSelectedNode(diagram.nodes[0] || null);

    // Switch viewport to workspace view!
    setShowWorkspace(true);
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
    
    // Sync URL parameters
    syncParamsToURL(diagram.format, diagram.prompt, diagram.model, diagram.language, diagram.theme);
  };

  // Pre-fill parameters from URL query parameters if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlPrompt = searchParams.get("prompt");
      if (urlPrompt) {
        setPrompt(urlPrompt);
      }
      const urlModel = searchParams.get("model");
      if (urlModel) {
        const found = AI_MODELS.find(m => m.id.toLowerCase() === urlModel.toLowerCase());
        if (found) setSelectedModel(found);
      }
      const urlLang = searchParams.get("language") || searchParams.get("lang");
      if (urlLang) {
        const found = LANGUAGES.find(l => l.toLowerCase() === urlLang.toLowerCase());
        if (found) setOutputLanguage(found);
      }
      const urlTheme = searchParams.get("theme");
      if (urlTheme) {
        const allowed = ["cyber", "amber", "emerald", "slate"];
        if (allowed.includes(urlTheme.toLowerCase())) {
          setSelectedTheme(urlTheme.toLowerCase());
        }
      }
    }
  }, []);

  // Automatically sync model, language, theme, format selections to the URL
  useEffect(() => {
    syncParamsToURL(selectedFormat, prompt, selectedModel.id, outputLanguage, selectedTheme);
  }, [selectedModel.id, outputLanguage, selectedTheme, selectedFormat, syncParamsToURL]);

  // Sync format changes with dataset seeds
  const handleFormatChange = (formatId: string) => {
    setSelectedFormat(formatId);
    if (SEED_DATASETS[formatId]) {
      const clonedNodes = SEED_DATASETS[formatId].nodes.map((n) => ({ ...n }));
      const clonedEdges = SEED_DATASETS[formatId].edges.map((e) => ({ ...e }));
      setNodes(clonedNodes);
      setEdges(clonedEdges);
      setSelectedNode(clonedNodes[0] || null);
      // Reset pan to mobile-friendly offset on format switch
      setPan(typeof window !== 'undefined' && window.innerWidth < 768 ? { x: -160, y: 0 } : { x: 0, y: 0 });
      setZoom(1.0);

      // Update URL parameters
      syncParamsToURL(formatId, prompt, selectedModel.id, outputLanguage, selectedTheme);
    }
  };

  // Track the previous initialFormat to prevent resetting state on manual updates
  const prevInitialFormatRef = useRef<string | undefined>(initialFormat);

  // Sync when initialFormat changes via route navigation
  useEffect(() => {
    if (initialFormat && initialFormat !== prevInitialFormatRef.current) {
      prevInitialFormatRef.current = initialFormat;
      if (SEED_DATASETS[initialFormat]) {
        setSelectedFormat(initialFormat);
        const clonedNodes = SEED_DATASETS[initialFormat].nodes.map((n) => ({ ...n }));
        const clonedEdges = SEED_DATASETS[initialFormat].edges.map((e) => ({ ...e }));
        setNodes(clonedNodes);
        setEdges(clonedEdges);
        setSelectedNode(clonedNodes[0] || null);
      }
    }
  }, [initialFormat]);


  // Sync currentStep to currentStepRef
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // Set mobile-friendly initial pan offset after client hydration
  useEffect(() => {
    if (window.innerWidth < 768) {
      setPan({ x: -160, y: 0 });
    }
  }, []);

  // Stepper Stage transitions simulation
  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      return;
    }

    const t0 = setTimeout(() => setCurrentStep(1), 800);
    const t1 = setTimeout(() => setCurrentStep(2), 2000);
    const t2 = setTimeout(() => setCurrentStep(3), 3500);
    const t3 = setTimeout(() => setCurrentStep(4), 5000);
    const t4 = setTimeout(() => setCurrentStep(5), 6200);
    const t5 = setTimeout(() => setCurrentStep(6), 7500);
    const t6 = setTimeout(() => setCurrentStep(7), 8800);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [isGenerating]);

  // Progressive percentage calculation
  useEffect(() => {
    if (!isGenerating) {
      setProgressPercent(0);
      return;
    }

    let target = 0;
    switch (currentStep) {
      case 0: target = 10; break;
      case 1: target = 25; break;
      case 2: target = 40; break;
      case 3: target = 55; break;
      case 4: target = 70; break;
      case 5: target = 85; break;
      case 6: target = 95; break;
      case 7: target = 100; break;
      default: target = 100;
    }

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= target) {
          if (prev < 98 && currentStep < 7) {
            return prev + 0.1;
          }
          return prev;
        }
        return Math.min(target, prev + (0.5 + Math.random() * 1.5));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, currentStep]);

  // Rotate trivia tips
  useEffect(() => {
    if (!isGenerating) {
      setActiveTipIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % TRIVIA_TIPS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Once loading completes (reaches Stage 7) AND we have pendingResult from API, transition to workspace
  useEffect(() => {
    if (isGenerating && currentStep === 7 && progressPercent >= 98 && pendingResult) {
      setProgressPercent(100);
      const redirectTimer = setTimeout(() => {
        if (pendingResult.nodes && pendingResult.nodes.length > 0) {
          setNodes(pendingResult.nodes.map((n: any) => ({ ...n })));
          setEdges(pendingResult.edges ? pendingResult.edges.map((e: any) => ({ ...e })) : []);
          setSelectedNode(pendingResult.nodes[0] || null);
        }
        setIsGenerating(false);
        setShowWorkspace(true);
        setPan({ x: 0, y: 0 });
        setZoom(1.0);
        setPendingResult(null);
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
  }, [isGenerating, currentStep, progressPercent, pendingResult]);

  // Execute Diagram compilation process trigger
  const handleCompile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter your diagram prompt!");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    // Format restriction check for Free users
    const premiumFormats = ["class", "state", "er", "journey", "pie", "quadrant", "timeline", "sankey", "xy", "block"];
    if (premiumFormats.includes(selectedFormat) && !hasPremiumAccess) {
      setPremiumFeatureName(`${selectedFormat.toUpperCase()} Format`);
      setShowPremiumModal(true);
      return;
    }

    // Pro model check
    if (selectedModel.accessTier === "Pro" && !hasPremiumAccess) {
      setPremiumFeatureName(selectedModel.name);
      setShowPremiumModal(true);
      return;
    }

    // Power model check
    if (selectedModel.accessTier === "Power" && (!hasPremiumAccess || userPlanId !== "power")) {
      setPremiumFeatureName(selectedModel.name);
      setShowPremiumModal(true);
      return;
    }

    // Sync input parameter to URL
    syncParamsToURL(selectedFormat, prompt, selectedModel.id, outputLanguage, selectedTheme);

    setIsGenerating(true);
    toast.info("AI Model processing your diagram layout...", { duration: 1500 });

    try {
      const res = await api.post(
        "/diagram/generate",
        {
          prompt: prompt,
          format: selectedFormat,
          model: selectedModel.id,
          language: outputLanguage,
          theme: selectedTheme
        },
        { headers: { 'Auth': authToken } }
      );

      if (res.data.success) {
        setPendingResult(res.data.diagram);
        // Refresh token count if applicable
        if (res.data.tokenInfo && typeof res.data.tokenInfo.tokensRemaining === 'number') {
          setUserTokens(res.data.tokenInfo.tokensRemaining);
        }
      } else {
        toast.error(res.data.message || "Failed to generate diagram.");
        setIsGenerating(false);
      }
    } catch (error: any) {
      console.error("Diagram generation failed:", error);
      const errMsg = error.response?.data?.message || "Internal Server Error occurred during generation.";
      
      if (error.response?.data?.code === "INSUFFICIENT_TOKENS") {
        toast.error("Insufficient tokens! Please upgrade your plan or acquire tokens.");
      } else if (error.response?.data?.code === "DAILY_LIMIT_EXCEEDED") {
        toast.error("Daily free tier limit exceeded. Upgrade to Pro for unlimited generation.");
      } else {
        toast.error(errMsg);
      }
      setIsGenerating(false);
    }
  };

  // Zoom controls handlers
  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const next = direction === "in" ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(next, 0.5), 2.0);
    });
  };

  // Drag handlers for individual nodes
  const handleNodeStartDrag = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDraggedNodeId(nodeId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left - pan.x;
      const mouseY = e.clientY - rect.top - pan.y;
      setDragOffset({
        x: mouseX / zoom - node.x,
        y: mouseY / zoom - node.y
      });
    }
    
    setSelectedNode(node);
  };

  // Drag handler for background panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsPanning(true);
    setPanStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  // Mouse move and up global listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedNodeId) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left - pan.x;
          const mouseY = e.clientY - rect.top - pan.y;
          
          setNodes((prevNodes) =>
            prevNodes.map((n) =>
              n.id === draggedNodeId
                ? { 
                    ...n, 
                    x: Math.round(mouseX / zoom - dragOffset.x), 
                    y: Math.round(mouseY / zoom - dragOffset.y) 
                  }
                : n
            )
          );
        }
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setDraggedNodeId(null);
      setIsPanning(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [draggedNodeId, dragOffset, isPanning, panStart, pan, zoom]);

  // Export SVG file download
  const handleExportSVG = () => {
    toast.success("Downloading vector assets...");

    const escapeXML = (str: string) => {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };
    
    let lines = "";
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (fromNode && toNode) {
        lines += `<line x1="${fromNode.x + 80}" y1="${fromNode.y + 25}" x2="${toNode.x + 80}" y2="${toNode.y + 25}" stroke="#22d3ee" stroke-width="2" />`;
      }
    });

    let rects = "";
    nodes.forEach((node) => {
      rects += `
        <g transform="translate(${node.x}, ${node.y})">
          <rect width="160" height="50" rx="8" fill="#171717" stroke="#ffffff20" stroke-width="1"/>
          <text x="80" y="28" font-size="12" fill="white" font-family="sans-serif" text-anchor="middle">${escapeXML(node.label)}</text>
        </g>
      `;
    });

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="100%" height="100%" fill="#050505"/>
        ${lines}
        ${rects}
      </svg>
    `;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paperxify-diagram-${selectedFormat}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Color mapping logic depending on theme selections
  const getThemeStroke = () => {
    switch (selectedTheme) {
      case "cyber": return "#06b6d4";
      case "amber": return "#f59e0b";
      case "emerald": return "#10b981";
      default: return "#525252";
    }
  };

  const getNodeColor = (type: string) => {
    if (selectedTheme === "cyber") {
      switch (type) {
        case "start": return "border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]";
        case "decision": return "border-purple-500 bg-purple-950/30 text-purple-200";
        case "success": return "border-emerald-500 bg-emerald-950/30 text-emerald-200";
        case "fail": return "border-rose-500 bg-rose-950/30 text-rose-200";
        default: return "border-blue-500 bg-blue-950/30 text-blue-200";
      }
    } else if (selectedTheme === "amber") {
      switch (type) {
        case "start": return "border-amber-500 bg-amber-950/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
        default: return "border-orange-500 bg-orange-950/30 text-orange-200";
      }
    } else if (selectedTheme === "emerald") {
      switch (type) {
        case "start": return "border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
        default: return "border-teal-500 bg-teal-950/30 text-teal-200";
      }
    } else {
      switch (type) {
        case "start": return "border-neutral-400 bg-neutral-900 text-white shadow-xl";
        default: return "border-neutral-600 bg-neutral-900/60 text-neutral-300";
      }
    }
  };

  const renderCanvas = (isPreview: boolean) => {
    return (
      <div className="rounded-[2rem] border border-white/[0.06] bg-neutral-900/25 backdrop-blur-xl relative overflow-hidden flex flex-col h-[320px] sm:h-[420px] lg:h-[520px] w-full select-none">
        
        {/* Control bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] bg-neutral-950/20 relative z-20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]"></div>
            <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
              {isPreview ? "Preview" : "Canvas"}: {DIAGRAM_FORMATS.find(f => f.id === selectedFormat)?.label || selectedFormat}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => handleZoom("out")} 
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-mono text-neutral-500 font-bold px-1.5">{Math.round(zoom * 100)}%</span>
            <button 
              type="button"
              onClick={() => handleZoom("in")} 
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomIn size={13} />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1"></div>
            <button 
              type="button"
              onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1.0); }} 
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Floating sandbox badge */}
        {isPreview && (
          <div className="absolute top-16 right-5 z-20 pointer-events-none">
            <Badge className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 text-[9px] font-mono px-2.5 py-0.5 uppercase font-bold tracking-wider">
              Preview Sandbox
            </Badge>
          </div>
        )}

        {/* THE VIEWPORT WRAPPER */}
        <div 
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden bg-black/40"
          style={{
            backgroundImage: "radial-gradient(#ffffff03 1px, transparent 1px)",
            backgroundSize: "25px 25px"
          }}
        >
          
          {/* Viewport scaling logic container */}
          <div 
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: "1200px",
              height: "1000px"
            }}
          >
            
            {/* SVG Connections & Formats renderings */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="16"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={getThemeStroke()} />
                </marker>
              </defs>

              {/* RENDER SEQUENCE SYSTEM */}
              {selectedFormat === "sequence" && (
                <g opacity={0.25}>
                  {/* Lifeline vertical channels */}
                  <line x1={150 + 80} y1={80} x2={150 + 80} y2={500} stroke="#ffffff" strokeWidth={1} strokeDasharray="4,4" />
                  <line x1={380 + 80} y1={80} x2={380 + 80} y2={500} stroke="#ffffff" strokeWidth={1} strokeDasharray="4,4" />
                  <line x1={610 + 80} y1={80} x2={610 + 80} y2={500} stroke="#ffffff" strokeWidth={1} strokeDasharray="4,4" />
                </g>
              )}

              {/* RENDER RELATIONSHIP LINKS (standard flow paths) */}
              {selectedFormat !== "pie" && selectedFormat !== "quadrant" && selectedFormat !== "sankey" && selectedFormat !== "xy" && edges.map((edge, i) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const midX = (fromNode.x + toNode.x) / 2 + 80;
                const midY = (fromNode.y + toNode.y) / 2 + 25;

                return (
                  <g key={i}>
                    <line
                      x1={fromNode.x + 80}
                      y1={fromNode.y + 25}
                      x2={toNode.x + 80}
                      y2={toNode.y + 25}
                      stroke={getThemeStroke()}
                      strokeWidth={2}
                      opacity={0.3}
                      markerEnd="url(#arrow)"
                    />
                    {edge.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect x="-40" y="-8" width="80" height="16" rx="4" fill="#0c0c0c" stroke="#ffffff10" strokeWidth="0.5" />
                        <text textAnchor="middle" alignmentBaseline="middle" fill="#888888" fontSize="8" fontWeight="bold" y="1.5">
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* SPECIAL FORMAT RENDER: Sankey ribbons flow */}
              {selectedFormat === "sankey" && edges.map((edge, i) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                // Bezier ribbon flow calculation
                const x1 = fromNode.x + 160;
                const y1 = fromNode.y + 25;
                const x2 = toNode.x;
                const y2 = toNode.y + 25;
                const midX = (x1 + x2) / 2;

                const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                return (
                  <path
                    key={i}
                    d={path}
                    fill="none"
                    stroke={getThemeStroke()}
                    strokeWidth={fromNode.value ? fromNode.value / 2 : 12}
                    opacity={0.15}
                  />
                );
              })}

              {/* SPECIAL FORMAT RENDER: XY Chart Grid and Lines */}
              {selectedFormat === "xy" && (
                <g>
                  {/* Grid Axes lines */}
                  <line x1={120} y1={400} x2={650} y2={400} stroke="#ffffff20" strokeWidth={1} />
                  <line x1={120} y1={80} x2={120} y2={400} stroke="#ffffff20" strokeWidth={1} />
                  <text x={120} y={415} fill="#666666" fontSize={8} textAnchor="middle">0</text>
                  <text x={650} y={415} fill="#666666" fontSize={8} textAnchor="middle">100</text>
                  <text x={105} y={80} fill="#666666" fontSize={8} alignmentBaseline="middle">100</text>
                </g>
              )}

              {/* SPECIAL FORMAT RENDER: Timeline horizontal line */}
              {selectedFormat === "timeline" && (
                <line x1={80} y1={250 + 25} x2={700} y2={250 + 25} stroke={getThemeStroke()} strokeWidth={2} opacity={0.3} />
              )}

              {/* SPECIAL FORMAT RENDER: Quadrant Grid */}
              {selectedFormat === "quadrant" && (
                <g opacity={0.15}>
                  <line x1={400} y1={50} x2={400} y2={450} stroke="#ffffff" strokeWidth={1} strokeDasharray="3,3" />
                  <line x1={100} y1={250} x2={700} y2={250} stroke="#ffffff" strokeWidth={1} strokeDasharray="3,3" />
                  <text x={400} y={40} fill="#ffffff" fontSize={9} textAnchor="middle" fontWeight="bold">HIGH IMPACT</text>
                  <text x={400} y={470} fill="#ffffff" fontSize={9} textAnchor="middle" fontWeight="bold">LOW IMPACT</text>
                  <text x={70} y={253} fill="#ffffff" fontSize={9} textAnchor="start" fontWeight="bold">LOW EFFORT</text>
                  <text x={710} y={253} fill="#ffffff" fontSize={9} textAnchor="start" fontWeight="bold">HIGH EFFORT</text>
                </g>
              )}
            </svg>

            {/* RENDER DRAGGABLE NODES */}
            {selectedFormat !== "pie" && nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              
              // Format specific layout shape classes
              let shapeClass = "w-40 p-3 rounded-2xl border text-center cursor-pointer select-none transition-all duration-75 text-xs font-bold leading-tight";
              
              if (selectedFormat === "flowchart") {
                if (node.type === "decision") {
                  shapeClass = "w-32 h-32 rotate-45 border flex items-center justify-center text-center cursor-pointer select-none text-xs font-bold bg-purple-950/20";
                } else if (node.type === "start") {
                  shapeClass = "w-40 p-3 rounded-full border text-center cursor-pointer select-none text-xs font-bold bg-cyan-950/30";
                }
              } else if (selectedFormat === "class" || selectedFormat === "er") {
                shapeClass = "w-44 p-4 rounded-xl border text-left cursor-pointer select-none text-xs bg-neutral-900";
              } else if (selectedFormat === "state") {
                shapeClass = "w-28 h-28 rounded-full border flex flex-col justify-center items-center text-center cursor-pointer select-none text-xs font-bold";
              } else if (selectedFormat === "xy") {
                shapeClass = "w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer select-none text-[9px] font-mono font-bold bg-neutral-950";
              }

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeStartDrag(e, node.id)}
                  className={`${shapeClass} absolute ${getNodeColor(node.type)} ${
                    isSelected 
                      ? "ring-2 ring-cyan-500/50 scale-[1.03]" 
                      : "hover:scale-[1.02]"
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    boxShadow: "0 6px 20px -8px rgba(0,0,0,0.8)"
                  }}
                >
                  {/* Inner nodes properties structure */}
                  {selectedFormat === "class" ? (
                    <div className={node.type === "decision" ? "-rotate-45" : ""}>
                      <div className="font-black border-b border-white/10 pb-1 mb-1 text-center">{node.label}</div>
                      <div className="text-[8.5px] text-neutral-400 font-mono space-y-0.5 leading-snug">
                        {node.details?.split("\n").map((line, i) => <div key={i}>{line}</div>)}
                      </div>
                    </div>
                  ) : selectedFormat === "er" ? (
                    <div>
                      <div className="font-black border-b border-cyan-500/20 pb-1 mb-1 text-cyan-400 font-mono">{node.label}</div>
                      <div className="text-[8.5px] text-neutral-300 font-mono space-y-0.5 leading-snug">
                        {node.details?.split("\n").map((line, i) => <div key={i}>{line}</div>)}
                      </div>
                    </div>
                  ) : (
                    <div className={node.type === "decision" ? "-rotate-45 p-2" : ""}>
                      <span className="block truncate">{node.label}</span>
                      {node.type !== "point" && (
                        <span className="block text-[8px] opacity-40 uppercase tracking-widest font-mono mt-1">{node.type}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* PIE CHART INTERACTIVE RENDER */}
            {selectedFormat === "pie" && (
              <g transform="translate(300, 200)" className="absolute left-[280px] top-[140px] pointer-events-auto">
                <svg width="400" height="300" className="overflow-visible">
                  {/* Render visual Pie Slices using calculated Bezier sectors */}
                  <circle cx="150" cy="150" r="100" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.1" />
                  
                  {/* Dynamic visual segment slices paths */}
                  <path d="M150,150 L150,50 A100,100 0 0,1 245,118 Z" fill="rgba(6, 182, 212, 0.4)" stroke="#06b6d4" strokeWidth="1.5" className="cursor-pointer hover:opacity-85 transition-opacity" onClick={() => setSelectedNode(nodes[0])} />
                  <path d="M150,150 L245,118 A100,100 0 0,1 180,245 Z" fill="rgba(147, 51, 234, 0.4)" stroke="#9333ea" strokeWidth="1.5" className="cursor-pointer hover:opacity-85 transition-opacity" onClick={() => setSelectedNode(nodes[1])} />
                  <path d="M150,150 L180,245 A100,100 0 0,1 68,190 Z" fill="rgba(16, 185, 129, 0.4)" stroke="#10b981" strokeWidth="1.5" className="cursor-pointer hover:opacity-85 transition-opacity" onClick={() => setSelectedNode(nodes[2])} />
                  <path d="M150,150 L68,190 A100,100 0 0,1 150,50 Z" fill="rgba(244, 63, 94, 0.4)" stroke="#f43f5e" strokeWidth="1.5" className="cursor-pointer hover:opacity-85 transition-opacity" onClick={() => setSelectedNode(nodes[3])} />

                  {/* Legend markers */}
                  <g transform="translate(280, 50)" className="text-[10px] fill-neutral-400 space-y-1.5 font-bold font-sans">
                    <rect x="0" y="0" width="10" height="10" fill="#06b6d4" />
                    <text x="18" y="9">API Gateway (40%)</text>
                    
                    <rect x="0" y="20" width="10" height="10" fill="#9333ea" />
                    <text x="18" y="29">Data Core (30%)</text>

                    <rect x="0" y="40" width="10" height="10" fill="#10b981" />
                    <text x="18" y="49">Cache Store (20%)</text>

                    <rect x="0" y="60" width="10" height="10" fill="#f43f5e" />
                    <text x="18" y="69">NPUs (10%)</text>
                  </g>
                </svg>
              </g>
            )}

          </div>

        </div>

        {/* Footer instructions */}
        <div className="px-5 py-3 border-t border-white/[0.04] bg-neutral-950/10 text-[10px] text-neutral-500 hidden sm:flex justify-between items-center z-20">
          <span className="flex items-center gap-1.5">
            <Move size={11} /> Pan to translate layout · Drag nodes to reposition
          </span>
          <span className="font-mono text-[9px] text-neutral-600">SVG Engine v1.2</span>
        </div>

      </div>
    );
  };

  return (
    <>
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to generate diagrams"
      />
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={premiumFeatureName || selectedModel.name}
      />
      <section className="w-full min-h-screen relative flex flex-col items-center justify-start bg-black text-white px-4 py-10 font-sans selection:bg-neutral-800 selection:text-white overflow-hidden">
      
      {!showWorkspace ? (
        /* ================= INPUT STATE OR LOADING STATE ================= */
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
          
          {!isGenerating ? (
            /* BRANDING AND COMMAND CARD FORM WITH SPLIT VIEW */
            <>
              <div className="flex flex-col items-center space-y-10 w-full">
              
              {/* Status Badge */}
              <div className="mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md shadow-lg relative overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
                Paperxify Diagram Engine Active
              </div>

              {/* Main Typographic Title */}
              <div className="space-y-4 md:space-y-5 flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2 text-center">
                  AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-indigo-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">Diagram & Flowchart</span> Maker
                </h1>
              </div>

              {/* MOBILE TAB SWITCHER */}
              <div className="flex lg:hidden w-full bg-neutral-900/60 border border-white/[0.06] rounded-2xl p-1 backdrop-blur-md shadow-inner">
                <button
                  type="button"
                  onClick={() => setMobileTab("input")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                    mobileTab === "input"
                      ? "bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.12)]"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <Edit3 size={12} /> Input
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab("preview")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                    mobileTab === "preview"
                      ? "bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.12)]"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <Eye size={12} /> Preview
                </button>
              </div>

              {/* TWO COLUMN GRID FOR FORM AND PREVIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
                
                {/* LEFT COLUMN: Input Card Form (width 5/12) */}
                <div className={`lg:col-span-5 w-full relative z-10 space-y-6 ${mobileTab === "preview" ? "hidden lg:block" : ""}`}>
                  <div className="absolute -inset-px rounded-[2.2rem] bg-gradient-to-b from-cyan-500/20 via-cyan-500/5 to-transparent pointer-events-none z-0" />
                  
                  <div className="relative z-10 bg-[#0c0c0c] border border-white/[0.08] rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] transition-all duration-500 focus-within:border-white/20 focus-within:shadow-[0_0_40px_-15px_rgba(6,182,212,0.15)]">
                    
                    {/* INPUT ROW */}
                    <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 pt-4 sm:pt-6 pb-2.5 sm:pb-3">
                      <div className={cn(
                        "shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                        prompt.trim()
                          ? "bg-cyan-500/15 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          : "bg-white/5 text-neutral-500"
                      )}>
                        <Workflow size={18} className={cn(prompt.trim() && "animate-pulse")} />
                      </div>
                      <input
                        placeholder="e.g., Build a microservice system authentication flow..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onBlur={() => syncParamsToURL(selectedFormat, prompt, selectedModel.id, outputLanguage, selectedTheme)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] sm:text-[18px] font-semibold text-white placeholder:text-neutral-500 sm:placeholder:text-neutral-600 outline-none min-w-0 px-1"
                      />
                    </div>

                    {/* SUB-TEXTAREA */}
                    <div className="px-4 sm:px-6 pb-2 sm:pb-4">
                      <textarea 
                        placeholder="Add specific focus areas, node shapes, or data parameters to include... (optional)"
                        rows={2}
                        className="w-full bg-transparent border-none focus:ring-0 text-[14px] sm:text-[15px] text-neutral-300 placeholder:text-neutral-700 resize-none outline-none leading-relaxed px-1"
                      />
                    </div>

                    {/* FORMAT SELECT CHIPS - WRAPPABLE GRID */}
                    <div className="px-4 sm:px-5 pb-4">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mb-2">Diagram Type</p>
                      <div className="flex flex-wrap gap-1.5">
                        {DIAGRAM_FORMATS.map((format) => {
                          const isSelected = selectedFormat === format.id;
                          
                          // Build direct link URL containing current prompt, model, lang, theme
                          const params = new URLSearchParams();
                          if (prompt.trim()) params.set("prompt", prompt.trim());
                          if (selectedModel.id !== "flash") params.set("model", selectedModel.id);
                          if (outputLanguage !== "English") params.set("language", outputLanguage);
                          if (selectedTheme !== "cyber") params.set("theme", selectedTheme);
                          const queryStr = params.toString();
                          const href = `/ai-diagram/${format.id}${queryStr ? `?${queryStr}` : ""}`;

                          return (
                            <Link
                              key={format.id}
                              href={href}
                              onClick={(e) => {
                                // Prevent full router transition, switch state instantly
                                e.preventDefault();
                                handleFormatChange(format.id);
                              }}
                              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap ${
                                isSelected
                                  ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                                  : "bg-transparent border-white/[0.08] text-neutral-500 hover:text-neutral-300 hover:border-white/20"
                              }`}
                            >
                              <format.icon size={12} />
                              {format.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* BOTTOM ACTION BAR */}
                    <div className="px-4 sm:px-5 py-3 sm:py-4 bg-[#070707] border-t border-white/[0.04] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        
                        {/* Model Dropdown Selector */}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 text-[11px] font-bold text-neutral-300 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedModel.hex, boxShadow: `0 0 6px ${selectedModel.hex}99` }} />
                            <span>{selectedModel.name}</span>
                            <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[280px] p-2.5 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] z-[300]" style={{ background: 'radial-gradient(ellipse at top left, #ffffff06 0%, #0a0a0a 60%)' }}>
                            {/* Header */}
                            <div className="px-3 py-2 mb-1 border-b border-white/[0.05]">
                              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500 flex items-center gap-1.5">
                                <Brain size={11} className="text-white/30" /> Intelligence Engine
                              </p>
                            </div>
                            {/* Model Cards */}
                            <div className="space-y-1 mt-1">
                              {AI_MODELS.map(m => {
                                const isLocked = m.accessTier === 'Pro' && !hasPremiumAccess;
                                const isPowerLocked = m.accessTier === 'Power' && (!hasPremiumAccess || userPlanId !== 'power');
                                const isActive = m.id === selectedModel.id;
                                const locked = isLocked || isPowerLocked;
                                const tierColor = m.accessTier === 'Free' ? '#38bdf8' : m.accessTier === 'Pro' ? '#a78bfa' : '#fbbf24';
                                return (
                                  <DropdownMenuItem
                                    key={m.id}
                                    onClick={() => {
                                      if (locked) {
                                        setPremiumFeatureName(`${m.name} Model`);
                                        setShowPremiumModal(true);
                                        return;
                                      }
                                      setSelectedModel(m);
                                    }}
                                    className={cn(
                                      "cursor-pointer rounded-xl p-0 mb-0.5 transition-all duration-200 outline-none focus:bg-transparent",
                                      locked ? "opacity-60" : ""
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200",
                                        isActive
                                          ? "border-white/10 bg-white/[0.06]"
                                          : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.03]"
                                      )}
                                      style={isActive ? { boxShadow: `inset 0 0 20px ${m.hex}10` } : {}}
                                    >
                                      {/* Color dot */}
                                      <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                        style={{
                                          backgroundColor: `${m.hex}12`,
                                          borderColor: `${m.hex}25`,
                                          boxShadow: isActive ? `0 0 12px ${m.hex}30` : 'none',
                                        }}
                                      >
                                        <Cpu size={16} style={{ color: m.hex }} />
                                      </div>
                                      {/* Info */}
                                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className={cn("font-black text-[12px] tracking-tight", isActive ? "text-white" : "text-neutral-300")}>{m.name}</span>
                                          {/* Tier badge */}
                                          <span
                                            className="text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md border"
                                            style={{ color: tierColor, backgroundColor: `${tierColor}12`, borderColor: `${tierColor}25` }}
                                          >
                                            {m.accessTier}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-neutral-600 leading-tight truncate">{m.desc}</span>
                                      </div>
                                      {/* State icon */}
                                      {locked && (
                                        <div className="shrink-0 w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                          <Lock size={10} className="text-neutral-500" />
                                        </div>
                                      )}
                                      {!locked && isActive && (
                                        <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${m.hex}20`, boxShadow: `0 0 8px ${m.hex}40` }}>
                                          <Check size={11} style={{ color: m.hex }} />
                                        </div>
                                      )}
                                    </div>
                                  </DropdownMenuItem>
                                );
                              })}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Language Dropdown Selector */}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 text-[11px] font-bold text-neutral-300 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                            <span>Lang: {outputLanguage}</span>
                            <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[150px] p-2 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] z-[300]" style={{ background: 'radial-gradient(ellipse at top left, #ffffff06 0%, #0a0a0a 60%)' }}>
                            {LANGUAGES.map((lang) => (
                              <DropdownMenuItem
                                key={lang}
                                onClick={() => setOutputLanguage(lang)}
                                className="cursor-pointer rounded-xl p-2.5 mb-0.5 text-xs text-neutral-300 hover:text-white focus:bg-white/[0.04] focus:text-white transition-all"
                              >
                                {lang}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Style Theme Dropdown Selector */}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 text-[11px] font-bold text-neutral-300 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                            <span>Theme: {selectedTheme.toUpperCase()}</span>
                            <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[180px] p-2 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] z-[300]" style={{ background: 'radial-gradient(ellipse at top left, #ffffff06 0%, #0a0a0a 60%)' }}>
                            <DropdownMenuItem onClick={() => setSelectedTheme("cyber")} className="cursor-pointer rounded-xl p-2.5 mb-0.5 text-xs text-neutral-300 hover:text-white focus:bg-white/[0.04] focus:text-white transition-all">CYBER GLOW</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedTheme("amber")} className="cursor-pointer rounded-xl p-2.5 mb-0.5 text-xs text-neutral-300 hover:text-white focus:bg-white/[0.04] focus:text-white transition-all">WARM AMBER</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedTheme("emerald")} className="cursor-pointer rounded-xl p-2.5 mb-0.5 text-xs text-neutral-300 hover:text-white focus:bg-white/[0.04] focus:text-white transition-all">EMERALD FOREST</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedTheme("slate")} className="cursor-pointer rounded-xl p-2.5 mb-0.5 text-xs text-neutral-300 hover:text-white focus:bg-white/[0.04] focus:text-white transition-all">SLATE MINIMAL</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </div>

                      <Button
                        onClick={handleCompile}
                        className="w-full sm:w-auto bg-white text-black hover:bg-neutral-100 rounded-xl h-11 sm:h-10 px-6 font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.25)]"
                      >
                        <Sparkles size={13} className="text-cyan-500" /> Generate Diagram <ArrowRight size={12} />
                      </Button>
                    </div>

                  </div>
                </div>

                {/* RIGHT COLUMN: Interactive Layout Preview (width 7/12) */}
                <div className={`lg:col-span-7 w-full space-y-6 ${mobileTab === "input" ? "hidden lg:block" : ""}`}>
                  {renderCanvas(true)}
                  
                  {/* Selected Node Inspector Details Box */}
                  {selectedNode && (
                    <div className="rounded-[2rem] border border-white/[0.06] bg-neutral-900/40 backdrop-blur-xl p-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div>
                          <h4 className="text-white font-bold text-sm truncate max-w-[280px]">{selectedNode.label}</h4>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Format Shape: {selectedNode.type}</span>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-mono border-white/10 uppercase bg-white/5">
                          ID: #{selectedNode.id}
                        </Badge>
                      </div>
                      
                      <p className="text-neutral-400 text-xs font-normal leading-relaxed whitespace-pre-line">
                        {selectedNode.details || "Template details mapping details parameter."}
                      </p>
                      
                      {selectedNode.value && (
                        <div className="mt-2 text-xs text-neutral-400">
                          Percentage Weight: <strong className="text-cyan-400">{selectedNode.value}%</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Diagrams Workspace Library */}
              <div className="w-full mt-4 border-t border-white/[0.04] pt-8">
                <DiagramsWorkspace onLoadDiagram={handleLoadDiagram} />
              </div>

              
            </>
          ) : (
            /* ================= STEPPER LOADING STATE ================= */
            <div className="w-full max-w-lg bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center space-y-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)]">
              
              {/* Circular Progress Loop */}
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full border border-white/5 bg-black/40">
                <span className="text-2xl font-black text-white tracking-tighter">{Math.round(progressPercent)}%</span>
              </div>

              {/* Current Step Title & Sub-status */}
              <div className="text-center space-y-1.5 w-full">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Stage {currentStep}: {LOADING_STEPS[currentStep]?.label || "Processing"}
                </h3>
                <p className="text-xs text-neutral-500 font-light truncate px-2">
                  {LOADING_STEPS[currentStep]?.desc || "Constructing vector graph coordinates..."}
                </p>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* ROTATING TRIVIA TIPS SECTION */}
              <div className="w-full p-4 rounded-2xl border border-white/[0.04] bg-neutral-950/60 min-h-[90px] flex flex-col justify-center">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-neutral-500 block mb-1">
                  {TRIVIA_TIPS[activeTipIndex].title}
                </span>
                <p className="text-neutral-400 text-[11px] leading-relaxed font-light">
                  {TRIVIA_TIPS[activeTipIndex].text}
                </p>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* ================= REDESIGNED ACTIVE WORKSPACE CONTAINER ================= */
        <div className="relative z-10 w-full flex flex-col space-y-6">
          
          {/* Workspace Back Button Bar */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4">
            <button
              onClick={() => setShowWorkspace(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} /> Back to Editor
            </button>
            <Badge className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 text-[10px] font-mono px-3 py-1 uppercase font-bold tracking-wider">
              {selectedFormat.toUpperCase()} VIEWPORT
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-7xl mx-auto px-4">
            
            {/* WORKSPACE LEFT: Details & Options Side Panel */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Controls and Metadata Info */}
              <div className="rounded-3xl border border-white/[0.06] bg-neutral-900/40 backdrop-blur-xl p-6 space-y-5">
                <div>
                  <h4 className="text-white font-black text-lg tracking-tight uppercase font-mono">Diagram Options</h4>
                  <p className="text-neutral-500 text-[11px] mt-1 font-light leading-relaxed">
                    {SEED_DATASETS[selectedFormat]?.desc || "Interactive layout representation metrics."}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleExportSVG}
                    className="w-full rounded-2xl bg-white text-black hover:bg-neutral-200 h-11 text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    <Download size={14} className="mr-2" /> Download SVG
                  </Button>
                </div>
              </div>

              {/* Node Details Inspection Board */}
              {selectedNode && (
                <div className="rounded-3xl border border-white/[0.06] bg-neutral-900/40 backdrop-blur-xl p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <h4 className="text-white font-bold text-sm truncate max-w-[170px]">{selectedNode.label}</h4>
                      <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Type: {selectedNode.type}</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-mono border-white/10 uppercase bg-white/5">
                      #{selectedNode.id}
                    </Badge>
                  </div>
                  
                  {/* Render node properties */}
                  <p className="text-neutral-400 text-xs font-normal leading-relaxed whitespace-pre-line">
                    {selectedNode.details || "No supplementary coordinates documentation recorded."}
                  </p>
                  
                  {selectedNode.value && (
                    <div className="mt-2 text-xs text-neutral-400">
                      Value: <strong className="text-white">{selectedNode.value}%</strong>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* WORKSPACE RIGHT: Interactive Viewport Canvas */}
            <div className="lg:col-span-8 space-y-6">
              {renderCanvas(false)}
            </div>

          </div>

        </div>
      )}

    </section>
    </>
  );
}
