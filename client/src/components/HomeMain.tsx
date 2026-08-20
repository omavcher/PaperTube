"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '@/config/api';
import { THEMES } from '@/config/themes';
import { 
  IconBrandYoutube, 
  IconRobot, 
  IconSettings,
  IconSparkles,
  IconBrain,
  IconFileText,
  IconCheck
} from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ChevronDown, 
  ArrowRight, 
  Coins, 
  AlertTriangle, 
  X, 
  Zap, 
  Code, 
  Users, 
  Headphones, 
  Search, 
  FileSignature, 
  BrainCircuit, 
  FileType, 
  CheckSquare, 
  Target, 
  Map, 
  Briefcase, 
  GraduationCap, 
  Link as LinkIcon, 
  BookOpen, 
  PenTool, 
  LayoutGrid, 
  FileText, 
  Lock, 
  Check, 
  RefreshCw, 
  Crown,
  Globe,
  BarChart2,
  HelpCircle,
  GitBranch,
  ShieldCheck,
  Clock,
  Lightbulb,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Layers,
  Eye,
  Edit3,
  ChevronRight,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import SubscriptionDialog from "@/components/SubscriptionDialog";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLoginModal, PremiumUpgradeModal } from '@/components/AuthGuard';
import { MiniThemeDocumentPreview, FullThemeDocumentPreview } from '@/components/ThemeDocumentPreview';
import { getThemePlan, isThemePremium } from '@/config/themes';

const getLogoUrl = (platform: string, domain: string) => {
    const p = (platform || '').toLowerCase();
    if (p === 'leetcode') return 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png'; // Distinct orange Leetcode Logo
    if (p === 'codechef') return 'https://upload.wikimedia.org/wikipedia/en/7/7b/Codechef%28new%29_logo.svg';
    if (p === 'hackerrank') return 'https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png';
    if (p === 'geeksforgeeks') return 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_favicon.png';
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};


// --- Constants & Config ---
const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const getYouTubeThumbnail = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
};
const DETAIL_LEVELS = ['Short', 'Standard', 'Comprehensive'];
const LANGUAGES = ["English", "German", "Spanish", "French", "Japanese", "Arabic"];
const POWER_LANGUAGES = new Set(["German", "Spanish", "French", "Japanese", "Arabic"]);

const AI_MODELS = [
  { id: "flash",   name: "Flash",   accessTier: "Free",  endpoint: "free",    desc: "Fast & lightweight for everyday notes",       color: "sky",    hex: "#38bdf8" },
  { id: "canvas",  name: "Canvas",  accessTier: "Pro",   endpoint: "premium", desc: "Rich formatting with deep comprehension",     color: "violet", hex: "#a78bfa" },
  { id: "scholar", name: "Scholar", accessTier: "Pro",   endpoint: "premium", desc: "Academic-grade citations & summaries",        color: "emerald",hex: "#34d399" },
  { id: "atlas",   name: "Atlas",   accessTier: "Power", endpoint: "premium", desc: "Max-context reasoning for complex content",    color: "amber",  hex: "#fbbf24" },
];

const TEST_TYPES = [
  { id: 'MCQ', label: 'MCQ', isPremium: false },
  { id: 'Fill in the Blanks', label: 'Fill Blanks', isPremium: false },
  { id: 'MSQ', label: 'MSQ', isPremium: true },
  { id: 'NAT', label: 'NAT', isPremium: true },
  { id: 'Master All (Mix)', label: 'Master Mix', isPremium: true },
];


const CATEGORY_TOOLS: Record<string, { id: string, label: string, icon: any, comingSoon?: boolean, placeholder?: string }[]> = {
  youtube: [
    { id: 'notes', label: 'YT to Notes', icon: IconFileText },
    { id: 'flashcards', label: 'YT to Flashcards', icon: IconBrain },
    { id: 'test', label: 'Practice Test', icon: CheckSquare, placeholder: 'Paste Video URL to Gen Test...' },
  ],
};

const NOTES_LOADING_STEPS = [
  { id: 0, label: "Input Validation", icon: CheckSquare, desc: "YouTube link validated successfully", duration: "2s" },
  { id: 1, label: "Video Metadata Fetch", icon: LinkIcon, desc: "Fetching video information", duration: "4s" },
  { id: 2, label: "Transcript Extraction", icon: FileText, desc: "Extracting captions and transcript", duration: "12s" },
  { id: 3, label: "Pre-Processing & Chunking", icon: BrainCircuit, desc: "Cleaning and chunking transcript", duration: "8s" },
  { id: 4, label: "AI Note Generation", icon: IconSparkles, desc: "Generating structured notes using AI", duration: "~ 25s" },
  { id: 5, label: "Post-Processing & Styling", icon: IconSettings, desc: "Refining notes and applying styles", duration: "3s" },
  { id: 6, label: "Render & Compile", icon: LayoutGrid, desc: "Compiling final output", duration: "2s" },
  { id: 7, label: "Redirecting to Workspace", icon: ArrowRight, desc: "Preparing your workspace", duration: "1s" }
];

const FLASHCARDS_LOADING_STEPS = [
  { id: 0, label: "Input Validation", icon: CheckSquare, desc: "YouTube link validated successfully", duration: "2s" },
  { id: 1, label: "Video Metadata Fetch", icon: LinkIcon, desc: "Fetching video information", duration: "4s" },
  { id: 2, label: "Transcript Extraction", icon: FileText, desc: "Extracting captions and transcript", duration: "12s" },
  { id: 3, label: "Pre-Processing & Chunking", icon: BrainCircuit, desc: "Cleaning and chunking transcript", duration: "8s" },
  { id: 4, label: "AI Flashcards Generation", icon: IconBrain, desc: "Generating structured Q&A flashcards", duration: "~ 25s" },
  { id: 5, label: "Spaced Repetition Setup", icon: IconSettings, desc: "Optimizing flashcard learning intervals", duration: "3s" },
  { id: 6, label: "Compile Flashcard Deck", icon: LayoutGrid, desc: "Compiling interactive flashcard deck", duration: "2s" },
  { id: 7, label: "Redirecting to Workspace", icon: ArrowRight, desc: "Opening your flashcard workspace", duration: "1s" }
];

const CODE_LOADING_STEPS = [
  { id: 0, label: "Input Validation", icon: CheckSquare, desc: "Validate URL format & parameters", duration: "2s" },
  { id: 1, label: "Code Metadata Fetch", icon: LinkIcon, desc: "Fetching code specification", duration: "4s" },
  { id: 2, label: "Syntax Extraction", icon: FileText, desc: "Retrieving syntax and structure", duration: "12s" },
  { id: 3, label: "Pre-Processing & Check", icon: BrainCircuit, desc: "Parsing parameters and logic", duration: "8s" },
  { id: 4, label: "AI Code Analysis", icon: Code, desc: "Analyzing algorithmic complexity", duration: "~ 25s" },
  { id: 5, label: "Post-Processing & Comments", icon: IconSettings, desc: "Formatting code and docstrings", duration: "3s" },
  { id: 6, label: "Synthesize Code Solutions", icon: LayoutGrid, desc: "Compiling code environment output", duration: "2s" },
  { id: 7, label: "Redirecting to Workspace", icon: ArrowRight, desc: "Initializing code playground", duration: "1s" }
];





const TRIVIA_TIPS = [
  {
    title: "🧠 The Feynman Technique",
    text: "Try explaining a concept to a child. If you struggle, you've found a gap in your own understanding."
  },
  {
    title: "⚡ Brain Power Consumption",
    text: "Your brain represents just 2% of your body weight but consumes 20% of your energy. It's working hard right now!"
  },
  {
    title: "🍅 The Pomodoro Effect",
    text: "Studying in 25-minute blocks with 5-minute breaks maximizes focus and prevents cognitive fatigue."
  },
  {
    title: "😴 Sleep & Long-Term Memory",
    text: "Your brain consolidates memory and clears metabolic waste during sleep. Get good rest after studying!"
  },
  {
    title: "🎯 Active Recall Strategy",
    text: "Testing yourself on the material is 150% more effective for long-term retention than simply re-reading notes."
  },
  {
    title: "⌛ The Zeigarnik Effect",
    text: "Your brain remembers incomplete tasks better than completed ones. Taking structured breaks keeps processing active."
  },
  {
    title: "📅 Spaced Repetition Scheduling",
    text: "Reviewing notes tomorrow, then in 3 days, and then in a week locks information into long-term memory."
  },
  {
    title: "🖼️ Dual Coding Theory",
    text: "Combining verbal info with visual diagrams activates different brain areas, making recall twice as easy."
  },
  {
    title: "✨ Clean Input Parsing",
    text: "Captions are stripped of conversational filler words (like 'umm' and 'like') before note structuring begins."
  },
  {
    title: "🌱 Neuroplasticity Mechanics",
    text: "Every time you learn something new, your brain physically alters its structure by forming new neural pathways."
  }
];

const getSubStatus = (step: number, progress: number): string => {
  const stepMessages: Record<number, string[]> = {
    0: [
      "Verifying YouTube video connection...",
      "Validating input URL parameters...",
      "Analyzing user access tier & tokens..."
    ],
    1: [
      "Contacting YouTube v3 Data API...",
      "Extracting duration, channel, and title...",
      "Downloading high-resolution video thumbnail..."
    ],
    2: [
      "Extracting closed captions & text streams...",
      "Running Whisper fallback checks...",
      "Compiling raw timestamp indices..."
    ],
    3: [
      "Filtering out filler words ('uh', 'um', 'like')...",
      "Analyzing semantic paragraph breaks...",
      "Synthesizing transcript chapter boundaries..."
    ],
    4: [
      "Prompting AI Intelligence Engine...",
      "Formatting JSON output markdown schema...",
      "Parsing deep conceptual definitions..."
    ],
    5: [
      "Injecting interactive YouTube timestamps...",
      "Running semantic image search queries...",
      "Generating aesthetic layout styling..."
    ],
    6: [
      "Compiling HTML layout & CSS tailwind tokens...",
      "Synthesizing customized CSS theme colors...",
      "Writing finalized notes structures to DB..."
    ],
    7: [
      "Preparing interactive workspace...",
      "Initializing Canvas notes canvas...",
      "Redirecting to workspace canvas..."
    ]
  };

  const msgs = stepMessages[step] || ["Processing data..."];
  const idx = Math.floor(progress / 5) % msgs.length;
  return msgs[idx];
};

const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  return createPortal(children, document.body);
};

export default function HomeMain({ mode = 'notes' }: { mode?: 'notes' | 'flashcards' | 'test' }) {
  const router = useRouter();
  
  // App States
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  
  // App Structure States
  const [activeCategory, setActiveCategory] = useState<string>('youtube');
  
  // Configuration States
  const [outputLanguage, setOutputLanguage] = useState('English');
  const [detailLevel, setDetailLevel] = useState('Standard');
  const [outputFormat, setOutputFormat] = useState<string>(mode);
  const [flashcardCount, setFlashcardCount] = useState<number>(5);
  const [testType, setTestType] = useState<string>('MCQ');
  const [codeLanguage, setCodeLanguage] = useState<string>('C++');

  // Logic & UI States
  const [loading, setLoading] = useState(false); 
  const [isGenerating, setIsGenerating] = useState(false); 
  const [currentStep, setCurrentStep] = useState(0);
  const currentStepRef = React.useRef(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [apiNoteResult, setApiNoteResult] = useState<any>(null);
  const [videoInfo, setVideoInfo] = useState<any>(null);

  // Note Config & Theme Selection States
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showThemeExplorer, setShowThemeExplorer] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [tempSelectedTheme, setTempSelectedTheme] = useState<any>(THEMES[0]);
  const [searchTheme, setSearchTheme] = useState('');
  const [activeThemeCategory, setActiveThemeCategory] = useState<'all' | 'dark' | 'light' | 'professional' | 'colorful'>('all');
  const [outlineType, setOutlineType] = useState<'canvas' | 'scholar' | 'atlas' | 'flash'>('canvas');
  const [mobileExplorerView, setMobileExplorerView] = useState<'list' | 'preview'>('list');
  const [includeKeyTakeaways, setIncludeKeyTakeaways] = useState(true);
  const [addDiagrams, setAddDiagrams] = useState(true);
  const [addExamples, setAddExamples] = useState(true);
  const [generateFaqs, setGenerateFaqs] = useState(true);
  
  // User & Access States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [userPlanId, setUserPlanId] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<number | null>(null);
  
  // Modal States
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [tokenErrorData, setTokenErrorData] = useState<any>(null);
  const [planErrorData, setPlanErrorData] = useState<any>(null);
  const [transcriptErrorData, setTranscriptErrorData] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState<string>("");

  // Sync format and config when page mode changes
  useEffect(() => {
    setOutputFormat(mode);
    if (mode === 'flashcards') {
      setFlashcardCount(hasPremiumAccess ? 10 : 5);
    }
  }, [mode, hasPremiumAccess]);

  // --- Fetch Token Data ---
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          // Note: using /api/users/tokens based on your exact requirement
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

  // --- Auto-detect Browser Language ---
  useEffect(() => {
    const browserLang = (typeof navigator !== 'undefined' ? (navigator.language || '') : '').toLowerCase();
    let detectedLang = 'English';
    if (browserLang.startsWith('de')) detectedLang = 'German';
    else if (browserLang.startsWith('es')) detectedLang = 'Spanish';
    else if (browserLang.startsWith('fr')) detectedLang = 'French';
    else if (browserLang.startsWith('ja')) detectedLang = 'Japanese';
    else if (browserLang.startsWith('ar')) detectedLang = 'Arabic';
    setOutputLanguage(detectedLang);
  }, []);

  const isValidUrl = useMemo(() => {
    if (activeCategory === 'youtube') return YOUTUBE_REGEX.test(videoUrl);
    return videoUrl.trim().length > 5;
  }, [videoUrl, activeCategory]);

  // Premium Horizontal Drag/Wheel Scroll
  const handleHorizontalScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const fetchVideoInfo = useCallback(async () => {
    if (isValidUrl) {
      if (activeCategory === 'youtube') {
        setLoading(true);
        try {
          const response = await api.post('/notes/ytinfo', { videoUrl });
          setVideoInfo(response.data);
        } catch (err) { console.error(err); setVideoInfo(null); } 
        finally { setLoading(false); }
      }
    } else {
      setVideoInfo(null);
    }
  }, [videoUrl, isValidUrl, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => { if (videoUrl.trim()) fetchVideoInfo(); }, 800);
    return () => clearTimeout(timer);
  }, [videoUrl, fetchVideoInfo]);

  // Sync currentStep to currentStepRef
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // Stepper Simulation for 8 Stages
  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setApiNoteResult(null);
      return;
    }

    // Sequentially advance through Stages 0 to 4
    const t0 = setTimeout(() => setCurrentStep(1), 1000);  // Stage 1 after 1s
    const t1 = setTimeout(() => setCurrentStep(2), 2500);  // Stage 2 after 2.5s
    const t2 = setTimeout(() => setCurrentStep(3), 4500);  // Stage 3 after 4.5s
    const t3 = setTimeout(() => setCurrentStep(4), 6000);  // Stage 4 after 6s

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isGenerating]);

  // Organic Progress Bar Simulation
  useEffect(() => {
    if (!isGenerating) {
      setProgressPercent(0);
      return;
    }

    let target = 0;
    // Map currentStep to target progress ranges
    switch (currentStep) {
      case 0: target = 12; break;
      case 1: target = 25; break;
      case 2: target = 42; break;
      case 3: target = 58; break;
      case 4: target = 72; break;
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
        const stepAmt = 0.5 + Math.random() * 1.5;
        return Math.min(target, prev + stepAmt);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, currentStep]);

  // Study tips rotation interval (every 4.5 seconds)
  useEffect(() => {
    if (!isGenerating) {
      setActiveTipIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % TRIVIA_TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Once API results are available and we are at least at Stage 4, advance to 5, 6, 7 (Ref-based, no currentStep dependency)
  useEffect(() => {
    if (!isGenerating || !apiNoteResult) return;

    let checkInterval: NodeJS.Timeout;
    let t6: NodeJS.Timeout;
    let t7: NodeJS.Timeout;
    let tRedirect: NodeJS.Timeout;

    const checkAndAdvance = () => {
      if (currentStepRef.current < 4) {
        return;
      }

      clearInterval(checkInterval);

      // Advance to Stage 5
      setCurrentStep(5);

      // Advance to Stage 6 after 1.5s
      t6 = setTimeout(() => {
        setCurrentStep(6);
        
        // Deduct tokens on client state if needed
        if (!hasPremiumAccess && userTokens !== null) {
          const deduct = apiNoteResult.tokensDeducted || apiNoteResult.tokenInfo?.tokensDeducted || 5;
          setUserTokens(prev => Math.max(0, (prev || 0) - deduct));
        }
      }, 1500);

      // Advance to Stage 7 after 2.7s
      t7 = setTimeout(() => {
        setCurrentStep(7);
      }, 2700);

      // Redirect after 3.9s
      tRedirect = setTimeout(() => {
        if (outputFormat === 'flashcards') {
          router.push(`/flashcards/${apiNoteResult.newFlashcardSet.slug}`);
        } else if (outputFormat === 'test') {
          router.push(`/yt-practice-test/${apiNoteResult.newTest.slug}`);
        } else {
          router.push(`/notes/${apiNoteResult.newNote.slug}`);
        }
      }, 3900);
    };

    checkInterval = setInterval(checkAndAdvance, 100);
    checkAndAdvance();

    return () => {
      clearInterval(checkInterval);
      if (t6) clearTimeout(t6);
      if (t7) clearTimeout(t7);
      if (tRedirect) clearTimeout(tRedirect);
    };
  }, [isGenerating, apiNoteResult]);

  const handleGenerateProcess = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginModal(true);
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

    // Power language check
    if (POWER_LANGUAGES.has(outputLanguage) && (!hasPremiumAccess || userPlanId !== "power")) {
      setPremiumFeatureName(`${outputLanguage} Language`);
      setShowPremiumModal(true);
      return;
    }
    
    setIsGenerating(true);
    setTokenErrorData(null);
    setTranscriptErrorData(null);
    try {
      const payload = {
        videoUrl,
        prompt,
        type: 'notes',
        format: outputFormat,
        theme: selectedTheme.id,
        flashcardCount: outputFormat === 'flashcards' ? flashcardCount : undefined,
        model: selectedModel.id,
        settings: {
          language: outputLanguage,
          detailLevel,
        }
      };

      // ── FLASHCARD MODE: dedicated endpoint + dedicated route ──
      if (outputFormat === 'flashcards') {
        const fcPayload = {
          videoUrl,
          prompt,
          theme: selectedTheme.id,
          model: selectedModel.id,
          flashcardCount: flashcardCount,
          settings: { language: outputLanguage, detailLevel }
        };

        const fcResponse = await api.post('/flashcards/generate', fcPayload, { headers: { 'Auth': authToken } });

        if (fcResponse.data?.success && fcResponse.data?.newFlashcardSet?.slug) {
          setApiNoteResult(fcResponse.data);
        }
        return;
      }

      // ── TEST MODE: dedicated endpoint + route ──
      if (outputFormat === 'test') {
        const testPayload = {
          videoUrl,
          prompt,
          theme: selectedTheme.id,
          model: selectedModel.id,
          testType: testType,
          settings: { language: outputLanguage, detailLevel }
        };

        const testResponse = await api.post('/test/generate', testPayload, { headers: { 'Auth': authToken } });

        if (testResponse.data?.success && testResponse.data?.newTest?.slug) {
          setApiNoteResult(testResponse.data);
        }
        return;
      }

      // ── NOTES MODE: existing flow ──
      const endpoint = `/notes/${selectedModel.endpoint}`;
      const response = await api.post(endpoint, payload, { headers: { 'Auth': authToken } });

      if (response.data?.success && response.data?.newNote?.slug) {
        setApiNoteResult(response.data);
      }
    } catch (err: any) {
        setIsGenerating(false);
        const errData = err.response?.data;

        // Correctly handle the new Insufficient Tokens response
        if (errData?.code === "INSUFFICIENT_TOKENS") {
            setTokenErrorData(errData);
        } else if (errData?.code === "MODEL_NOT_AVAILABLE" || errData?.code === "VIDEO_TOO_LONG" || errData?.code === "DAILY_LIMIT_EXCEEDED") {
            // Show specific error for plan restrictions
            setPlanErrorData(errData);
        } else if (errData?.code === "TRANSCRIPT_TOO_LONG") {
            // Show a proper modal instead of a browser alert
            setTranscriptErrorData(errData);
        } else if (err.response?.status === 403) {
            setShowPaywall(true);
        } else {
            alert(errData?.message || "Something went wrong processing the signal. Please try again.");
        }
    }
  };

  const handleGenerateClick = () => {
    const activeToolInfo = CATEGORY_TOOLS[activeCategory]?.find(t => t.id === outputFormat);
    if (activeToolInfo?.comingSoon) {
      alert("This amazing feature is coming very soon!");
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    // Direct logical flow: Generate notes directly without interrupting modal
    handleGenerateProcess();
  };

  return (
    <section className="w-full relative flex flex-col items-center justify-start bg-black text-white px-3 sm:px-4 pt-1 sm:pt-8 pb-4 sm:pb-6 font-sans selection:bg-neutral-800 selection:text-white overflow-x-hidden">
      
      {/* Subtle Background Atmosphere - simplified for desktop perf */}

      {/* Auth Modals */}
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to generate notes"
      />
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={premiumFeatureName || selectedModel.name}
      />

      {/* External Modals */}
      <SubscriptionDialog open={showPaywall} onOpenChange={setShowPaywall} />

      {/* --- INSUFFICIENT TOKENS MODAL --- */}
      <AnimatePresence>
        {tokenErrorData && (
            <motion.div 
                key="token-error-modal"
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setTokenErrorData(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl z-10"
                >
                    <button onClick={() => setTokenErrorData(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                    
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-500" size={24} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Insufficient Tokens</h3>
                    <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                        {tokenErrorData.message}
                    </p>

                    <div className="flex items-center justify-between p-4 bg-black/50 rounded-2xl border border-white/5 mb-6">
                        <div className="text-center w-full">
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Required</p>
                            <p className="text-xl font-mono font-bold text-white">{tokenErrorData.requiredTokens}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10 shrink-0" />
                        <div className="text-center w-full">
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Available</p>
                            <p className="text-xl font-mono font-bold text-red-500">{tokenErrorData.currentTokens}</p>
                        </div>
                    </div>

                    {tokenErrorData.canPurchase && (
                        <Link href="/pricing" onClick={() => setTokenErrorData(null)} className="w-full h-12 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            Acquire Tokens <ArrowRight size={14} />
                        </Link>
                    )}
                </motion.div>
            </motion.div>
        )}
        
        {planErrorData && (
            <motion.div 
                key="plan-error-modal"
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setPlanErrorData(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl z-10 text-center"
                >
                    <button onClick={() => setPlanErrorData(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                    
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-orange-500" size={24} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                        {planErrorData.code === "DAILY_LIMIT_EXCEEDED" ? "Daily Limit Reached" : "Access Restricted"}
                    </h3>
                    <p className="text-sm text-neutral-400 mb-8 leading-relaxed overflow-hidden text-ellipsis line-clamp-4">
                        {planErrorData.message}
                    </p>

                    <Link href="/pricing" onClick={() => setPlanErrorData(null)} className="w-full h-12 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        Upgrade Plan <ArrowRight size={14} />
                    </Link>
                </motion.div>
            </motion.div>
        )}

        {transcriptErrorData && (
            <motion.div 
                key="transcript-error-modal"
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setTranscriptErrorData(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl z-10"
                >
                    <button onClick={() => setTranscriptErrorData(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>

                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="text-yellow-400" size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Video Too Long</h3>
                    <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
                        This video's transcript is too large for the <span className="text-white font-bold">{selectedModel.name}</span> model. 
                        Free models support up to <span className="text-white font-bold">{(transcriptErrorData.maxTokens || 10000).toLocaleString()} tokens</span>.
                    </p>

                    <div className="p-4 bg-black/50 rounded-2xl border border-white/5 mb-6 text-center">
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Estimated Video Size</p>
                        <p className="text-xl font-mono font-bold text-yellow-400">~{(transcriptErrorData.estimatedTokens || 0).toLocaleString()} tokens</p>
                    </div>

                    <p className="text-xs text-neutral-500 mb-5 text-center leading-relaxed">
                        Upgrade to a premium model to process longer videos with up to <span className="text-white">500,000 tokens</span>.
                    </p>

                    <div className="flex flex-col gap-2">
                        <Link href="/pricing" onClick={() => setTranscriptErrorData(null)} className="w-full h-11 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all">
                            Upgrade for Longer Videos <ArrowRight size={14} />
                        </Link>
                        <button 
                            onClick={() => setTranscriptErrorData(null)} 
                            className="w-full h-11 bg-neutral-800 text-neutral-300 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-700 transition-all border border-white/5"
                        >
                            Try Another Video
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <Portal>
        {/* ========================================================================= */}
        {/* ─── 1. CUSTOMIZE YOUR NOTES MODAL ────────────────────────────────────── */}
        {/* ========================================================================= */}
        <AnimatePresence>
        {showConfigModal && (
          <motion.div 
            className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              onClick={() => setShowConfigModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-4xl bg-[#080808] border-t sm:border border-white/[0.10] rounded-t-[1.75rem] sm:rounded-[1.75rem] rounded-b-none sm:rounded-b-[1.75rem] p-6 sm:p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] z-10 overflow-y-auto max-h-[90vh] custom-scrollbar space-y-7"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setShowConfigModal(false)} 
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
              
              {/* Modal Header */}
              <div>
                <h3 className="text-2xl sm:text-[26px] font-black text-white tracking-tight">Customize Your Notes</h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">Configure your outline structure and note design template.</p>
              </div>

              {/* ─── SECTION 1: OUTLINE STRUCTURE ─── */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <span>1. Outline Structure</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'flash', label: 'Flash Outline', desc: 'Fast & concise. Quick summary, key points, pills, and short bullets.', tier: 'Free', icon: Zap, color: '#38bdf8' },
                    { id: 'canvas', label: 'Canvas Outline', desc: 'Visual & rich. Deep comprehension, bullets, tables, key takeaways, and visuals.', tier: 'Pro', icon: LayoutGrid, color: '#a78bfa' },
                    { id: 'scholar', label: 'Scholar Outline', desc: 'Academic study. Overview paragraph, subsections, comparison tables, and detailed chapter summaries.', tier: 'Pro', icon: GraduationCap, color: '#34d399' },
                    { id: 'atlas', label: 'Atlas Outline', desc: 'Comprehensive map. Cross references, contextual timelines, questions, and spaced-repetition Anki cards.', tier: 'Power', icon: Map, color: '#fbbf24' }
                  ].map(opt => {
                    const isSelected = outlineType === opt.id;
                    const isLocked = opt.tier === 'Pro' && !hasPremiumAccess;
                    const isPowerLocked = opt.tier === 'Power' && (!hasPremiumAccess || userPlanId !== 'power');
                    const locked = isLocked || isPowerLocked;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (locked) {
                            setPremiumFeatureName(opt.label);
                            setShowPremiumModal(true);
                            return;
                          }
                          setOutlineType(opt.id as any);
                          const model = AI_MODELS.find(m => m.id === opt.id);
                          if (model) setSelectedModel(model);
                        }}
                        className={cn(
                          "relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[110px] group",
                          locked 
                            ? "opacity-55 hover:opacity-75 border-white/[0.04] bg-white/[0.01]" 
                            : isSelected 
                            ? "bg-white/[0.04] border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                            : "bg-[#0d0d0f] border-white/[0.06] hover:border-white/15 hover:bg-[#121214]"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                              style={{ 
                                backgroundColor: `${opt.color}15`, 
                                borderColor: `${opt.color}30`,
                                color: opt.color 
                              }}
                            >
                              <opt.icon size={14} />
                            </div>
                            <span className={cn("font-bold text-sm", locked ? "text-neutral-400" : "text-white")}>{opt.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {locked ? (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-0.5">
                                <Lock size={7} /> {opt.tier}
                              </span>
                            ) : (
                              <span 
                                className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border" 
                                style={{ 
                                  color: opt.color, 
                                  borderColor: `${opt.color}30`, 
                                  backgroundColor: `${opt.color}10` 
                                }}
                              >
                                {opt.tier}
                              </span>
                            )}
                            {!locked && isSelected && (
                              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                <Check size={10} className="text-white font-black" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </div>
                        <p className={cn("text-xs leading-relaxed mt-2.5", locked ? "text-neutral-500" : "text-neutral-400")}>
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── SECTION 2: NOTE THEME ─── */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">2. NOTE THEME</label>
                    <p className="text-xs text-neutral-500">Choose how your generated notes look.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setTempSelectedTheme(selectedTheme);
                      setShowThemeExplorer(true);
                    }}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Themes</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
                
                {/* 4-6 Featured Theme Cards with Real Miniature Document Previews */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {THEMES.slice(0, 4).map(t => {
                    const isSelected = selectedTheme.id === t.id;
                    const themePlan = getThemePlan(t.id);
                    const isLocked = (themePlan === 'pro' && !hasPremiumAccess) || 
                                     (themePlan === 'power' && (!hasPremiumAccess || userPlanId !== 'power'));
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (isLocked) {
                            setPremiumFeatureName(`${t.name} Theme`);
                            setShowPremiumModal(true);
                            return;
                          }
                          setSelectedTheme(t);
                        }}
                        className={cn(
                          "group rounded-2xl border p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 bg-[#0d0d0f]",
                          isSelected 
                            ? "border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20" 
                            : isLocked 
                            ? "opacity-60 border-white/[0.04] hover:opacity-80" 
                            : "border-white/[0.08] hover:border-white/20 hover:-translate-y-0.5"
                        )}
                      >
                        {/* Miniature Realistic Document Preview */}
                        <div className="w-full h-32 rounded-xl overflow-hidden mb-2 relative border" style={{ borderColor: t.border }}>
                          <MiniThemeDocumentPreview theme={t} />
                          {isLocked && (
                            <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-amber-400">
                              <Lock size={10} />
                            </div>
                          )}
                        </div>

                        {/* Theme Info & Selection state */}
                        <div className="px-1 py-0.5 flex items-center justify-between">
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate leading-tight">{t.name}</h5>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-neutral-400 capitalize">{t.category}</span>
                              <span className={cn(
                                "text-[7.5px] font-black uppercase px-1 py-0.2 rounded border",
                                themePlan === 'free' ? "text-sky-400 bg-sky-500/10 border-sky-500/20" :
                                themePlan === 'pro' ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
                                "text-amber-400 bg-amber-500/10 border-amber-500/20"
                              )}>
                                {themePlan.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-sm">
                              <Check size={10} className="text-white font-black" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── SECTION 3: ADDITIONAL OPTIONS ─── */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">3. ADDITIONAL OPTIONS</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'takeaways', label: 'Include Key Takeaways', icon: CheckSquare, state: includeKeyTakeaways, set: setIncludeKeyTakeaways },
                    { id: 'diagrams', label: 'Add Diagrams & Charts', icon: TrendingUp, state: addDiagrams, set: setAddDiagrams },
                    { id: 'examples', label: 'Add Examples', icon: Lightbulb, state: addExamples, set: setAddExamples },
                    { id: 'faqs', label: 'Generate FAQs', icon: MessageSquare, state: generateFaqs, set: setGenerateFaqs },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => opt.set(!opt.state)}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between text-left transition-all duration-200 cursor-pointer",
                        opt.state 
                          ? "bg-white/[0.04] border-red-500/40 text-white" 
                          : "bg-[#0d0d0f] border-white/[0.05] text-neutral-500 hover:text-neutral-300 hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <opt.icon size={13} className={opt.state ? "text-red-400" : "text-neutral-500"} />
                        <span className="text-xs font-semibold truncate">{opt.label}</span>
                      </div>
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        opt.state ? "bg-red-500 text-white" : "bg-white/[0.06] text-transparent"
                      )}>
                        <Check size={9} strokeWidth={3} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── ACTION FOOTER ─── */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white font-bold uppercase tracking-wider text-xs border border-white/[0.08] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false);
                    handleGenerateProcess();
                  }}
                  className="px-6 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Zap size={13} className="fill-white" />
                  <span>Apply & Continue</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ─── 2. ALL THEMES LIBRARY BROWSER DIALOG ─────────────────────────────── */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showThemeExplorer && (
          <motion.div 
            className="fixed inset-0 z-[300] flex items-stretch sm:items-center justify-center p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              onClick={() => setShowThemeExplorer(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.98, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-6xl h-dvh sm:h-[88vh] bg-[#080808] border-none sm:border border-white/[0.10] rounded-none sm:rounded-[1.75rem] flex flex-col overflow-hidden shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 sm:p-6 border-b border-white/[0.06] shrink-0 bg-[#080808]">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Theme Library</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Choose a visual theme for your study notes, summary sheets, and PDF exports.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowThemeExplorer(false)} 
                  className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Library"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile View Switcher (Only on small screens) */}
              <div className="flex md:hidden border-b border-white/[0.06] bg-[#060607] p-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setMobileExplorerView('list')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                    mobileExplorerView === 'list' ? "bg-white/10 text-white" : "text-neutral-500"
                  )}
                >
                  Themes ({THEMES.length})
                </button>
                <button 
                  type="button"
                  onClick={() => setMobileExplorerView('preview')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                    mobileExplorerView === 'preview' ? "bg-white/10 text-white" : "text-neutral-500"
                  )}
                >
                  Live Document Preview
                </button>
              </div>

              {/* Dual-Pane Body */}
              <div className="flex-1 flex overflow-hidden min-h-0">
                
                {/* ─── LEFT PANE: Search, Categories & Theme Grid ─── */}
                <div className={cn(
                  "w-full md:w-[46%] lg:w-[42%] border-r border-white/[0.06] flex flex-col p-5 sm:p-6 min-w-0 bg-[#060607] shrink-0",
                  mobileExplorerView === 'list' ? "flex h-full" : "hidden md:flex"
                )}>
                  {/* Search Bar + Random Button */}
                  <div className="flex gap-2 mb-3.5 shrink-0">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input 
                        type="text"
                        placeholder="Search themes (e.g. dark, minimal, academic)..."
                        value={searchTheme}
                        onChange={(e) => setSearchTheme(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-neutral-500 outline-none transition-all"
                      />
                      {searchTheme && (
                        <button
                          type="button"
                          onClick={() => setSearchTheme('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
                        setTempSelectedTheme(randomTheme);
                      }}
                      className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                      title="Shuffle Random Theme"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 shrink-0">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'light', label: 'Light' },
                      { id: 'dark', label: 'Dark' },
                      { id: 'professional', label: 'Professional' },
                      { id: 'colorful', label: 'Colorful' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveThemeCategory(cat.id as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all whitespace-nowrap border cursor-pointer",
                          activeThemeCategory === cat.id
                            ? "bg-white text-black border-white shadow-sm"
                            : "bg-transparent border-white/[0.07] text-neutral-400 hover:text-white hover:border-white/15"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable Theme Cards Grid */}
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {(() => {
                      const filteredThemes = THEMES.filter(t => {
                        const query = searchTheme.toLowerCase().trim();
                        const matchesSearch = !query || 
                          t.name.toLowerCase().includes(query) || 
                          t.category.toLowerCase().includes(query) ||
                          t.desc?.toLowerCase().includes(query);
                        const matchesCategory = activeThemeCategory === 'all' || t.category === activeThemeCategory;
                        return matchesSearch && matchesCategory;
                      });

                      if (filteredThemes.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
                            <BookOpen size={24} className="opacity-40" />
                            <p className="text-xs font-semibold text-neutral-400">No themes found</p>
                            <p className="text-[11px] text-neutral-500">Try searching for &quot;dark&quot;, &quot;minimal&quot;, or clear filters.</p>
                            <button
                              type="button"
                              onClick={() => { setSearchTheme(''); setActiveThemeCategory('all'); }}
                              className="px-3 py-1 text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              Clear filters
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-2 gap-3 pb-4">
                          {filteredThemes.map(t => {
                            const isActive = tempSelectedTheme?.id === t.id;
                            const isApplied = selectedTheme.id === t.id;
                            const themePlan = getThemePlan(t.id);
                            const isLocked = (themePlan === 'pro' && !hasPremiumAccess) || 
                                             (themePlan === 'power' && (!hasPremiumAccess || userPlanId !== 'power'));

                            return (
                              <div
                                key={t.id}
                                onClick={() => setTempSelectedTheme(t)}
                                className={cn(
                                  "group rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 bg-[#0c0c0e]",
                                  isActive 
                                    ? "border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30" 
                                    : "border-white/[0.06] hover:border-white/15 hover:-translate-y-0.5"
                                )}
                              >
                                {/* Miniature Document Preview */}
                                <div className="w-full h-28 rounded-lg overflow-hidden mb-2 relative border" style={{ borderColor: t.border }}>
                                  <MiniThemeDocumentPreview theme={t} />
                                  {isLocked && (
                                    <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-amber-400">
                                      <Lock size={9} />
                                    </div>
                                  )}
                                  {isApplied && (
                                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[8px] font-bold text-white flex items-center gap-1">
                                      <Check size={8} className="text-red-400" /> Active
                                    </div>
                                  )}
                                </div>

                                {/* Theme Title & Plan */}
                                <div className="px-1 py-0.5 flex items-center justify-between">
                                  <div className="min-w-0">
                                    <h5 className="text-[11.5px] font-bold text-white truncate leading-tight">{t.name}</h5>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[8.5px] text-neutral-400 capitalize">{t.category}</span>
                                      <span className={cn(
                                        "text-[7px] font-black uppercase px-1 py-0.2 rounded border",
                                        themePlan === 'free' ? "text-sky-400 bg-sky-500/10 border-sky-500/20" :
                                        themePlan === 'pro' ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
                                        "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                      )}>
                                        {themePlan.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  {isActive && (
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                      <Check size={8} className="text-white font-black" strokeWidth={3} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ─── RIGHT PANE: Dynamic Interactive Live Document Preview ─── */}
                <div className={cn(
                  "flex-1 bg-[#040405] px-4 py-6 sm:p-8 flex-col overflow-y-auto custom-scrollbar relative justify-start items-center w-full",
                  mobileExplorerView === 'preview' ? "flex h-full" : "hidden md:flex"
                )}>
                  {tempSelectedTheme && (
                    <div className="w-full max-w-2xl flex flex-col items-center justify-start space-y-4 pb-8">
                      {/* Top Preview Status Bar */}
                      <div className="w-full flex items-center justify-between text-xs px-1 text-neutral-400">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tempSelectedTheme.name}</span>
                          <span className="text-neutral-500">&bull;</span>
                          <span className="capitalize">{tempSelectedTheme.category}</span>
                          <span className="text-neutral-500">&bull;</span>
                          <span className="font-mono text-[11px] opacity-75">{tempSelectedTheme.font}</span>
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                          getThemePlan(tempSelectedTheme.id) === 'free' ? "text-sky-400 bg-sky-500/10 border-sky-500/20" :
                          getThemePlan(tempSelectedTheme.id) === 'pro' ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
                          "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        )}>
                          {getThemePlan(tempSelectedTheme.id).toUpperCase()} THEME
                        </span>
                      </div>

                      {/* Large Realistic Document Canvas */}
                      <FullThemeDocumentPreview theme={tempSelectedTheme} />
                    </div>
                  )}
                </div>

              </div>

              {/* ─── THEME LIBRARY FOOTER ─── */}
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-t border-white/[0.06] shrink-0 bg-[#080808]">
                <button
                  type="button"
                  onClick={() => setShowThemeExplorer(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white font-bold uppercase tracking-wider text-xs border border-white/[0.08] transition-all cursor-pointer"
                >
                  Cancel
                </button>

                {tempSelectedTheme && (() => {
                  const themePlan = getThemePlan(tempSelectedTheme.id);
                  const isLocked = (themePlan === 'pro' && !hasPremiumAccess) || 
                                   (themePlan === 'power' && (!hasPremiumAccess || userPlanId !== 'power'));

                  if (isLocked) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setPremiumFeatureName(`${tempSelectedTheme.name} Theme`);
                          setShowPremiumModal(true);
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock size={12} />
                        <span>Upgrade to {themePlan.toUpperCase()} to Apply</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTheme(tempSelectedTheme);
                        setShowThemeExplorer(false);
                      }}
                      className="px-6 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      <Check size={13} strokeWidth={3} />
                      <span>Apply {tempSelectedTheme.name} Theme</span>
                    </button>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        
        <AnimatePresence mode="wait">
          {!isGenerating ? (
            /* ================= INPUT STATE ================= */
            <motion.div 
              key="input-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.5 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center space-y-3 sm:space-y-6 w-full"
            >

              {/* ─── 1. HEADER & BRANDING ─── */}
              <div className="text-center space-y-1.5 sm:space-y-3 mb-1 sm:mb-4 w-full max-w-2xl flex flex-col items-center justify-center">
                
                {/* Status Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-300 backdrop-blur-md shadow-sm">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
                  <span>PAPERXIFY ENGINE ACTIVE</span>
                </div>
                
                {/* Main Title & Subtitle */}
                <div className="space-y-1 sm:space-y-2 flex flex-col items-center justify-center">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-center">
                    Turn YouTube Videos Into<br className="hidden sm:inline" />{" "}
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-500 to-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.25)] pb-1">
                      Smart Study Notes
                      {/* Signature Hand-drawn Curve Underline */}
                      <svg 
                        className="absolute -bottom-1.5 sm:-bottom-2.5 left-0 w-full h-3 sm:h-4 text-red-500 pointer-events-none overflow-visible" 
                        viewBox="0 0 280 20" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                      >
                        {/* Soft glow under-stroke */}
                        <path 
                          d="M4 14C45 18 115 17 175 11C215 7 252 6 276 10" 
                          stroke="#ef4444" 
                          strokeWidth="6" 
                          strokeLinecap="round" 
                          opacity="0.25"
                          className="blur-[2px]"
                        />
                        {/* Main signature expressive sweep */}
                        <path 
                          d="M3 13.5C48 18 118 17.5 178 11C218 6.5 254 5.5 277 9.5" 
                          stroke="url(#sig-gradient)" 
                          strokeWidth="3" 
                          strokeLinecap="round" 
                        />
                        {/* End signature flourish flick */}
                        <path 
                          d="M245 11C258 8.5 268 5.5 278 3" 
                          stroke="url(#sig-gradient)" 
                          strokeWidth="2.2" 
                          strokeLinecap="round" 
                          opacity="0.85"
                        />
                        <defs>
                          <linearGradient id="sig-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                            <stop offset="30%" stopColor="#ef4444" stopOpacity="1" />
                            <stop offset="85%" stopColor="#f87171" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </h1>
                  
                  <p className="text-[11px] sm:text-sm text-neutral-400 max-w-lg mx-auto leading-tight sm:leading-relaxed text-center px-2">
                    Paste any YouTube link and let AI create notes, summaries, flashcards, quizzes and more <span className="text-red-500 font-semibold">in seconds.</span>
                  </p>
                </div>
              </div>

              {/* ─── 2. MAIN COMMAND CARD ─── */}
              <div className="w-full max-w-4xl relative z-10">
                {/* Outer glow ambient effect */}
                <div className="absolute -inset-px rounded-[1.25rem] sm:rounded-[1.75rem] bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 bg-[#09090c]/95 backdrop-blur-2xl border border-white/[0.08] rounded-[1.25rem] sm:rounded-[1.75rem] p-3 sm:p-5 shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col gap-2.5 sm:gap-3.5">
                  
                  {/* === TOP INPUT ZONE === */}
                  <div className="flex items-center gap-2 sm:gap-3 bg-black/50 border border-white/[0.07] rounded-xl sm:rounded-2xl p-1 sm:p-2.5">
                    {/* YouTube Squircle Icon */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>

                    {/* Input */}
                    <input 
                      placeholder="Paste YouTube link or request..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[12px] sm:text-[15px] font-medium text-white placeholder:text-neutral-500 outline-none min-w-0 px-1"
                    />

                    {/* Right Badges (Smart Tips & Token Pill) */}
                    <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
                      {loading && <Loader2 className="animate-spin text-neutral-500" size={14} />}
                      
                      <button 
                        type="button" 
                        onClick={() => setActiveTipIndex((prev) => (prev + 1) % TRIVIA_TIPS.length)}
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-neutral-300 font-medium transition-colors cursor-pointer"
                      >
                        <Lightbulb size={12} className="text-amber-400" />
                        <span>Smart Tips</span>
                      </button>

                      <Link 
                        href="/pricing" 
                        className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] sm:text-xs font-bold text-amber-400 hover:bg-amber-500/15 transition-colors"
                      >
                        <Coins size={11} />
                        <span>{userTokens !== null ? userTokens : 10}</span>
                      </Link>
                    </div>
                  </div>

                  {/* === LOADED VIDEO PREVIEW CARD (when URL is valid and info is loaded) === */}
                  <AnimatePresence>
                    {videoInfo && !loading && (
                      <motion.div 
                        key="video-card"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-2 sm:p-2.5 bg-black/40 border border-white/[0.08] rounded-xl sm:rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            {/* Thumbnail with duration badge */}
                            <div className="relative w-14 sm:w-20 h-9 sm:h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-900 border border-white/10">
                              <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[8px] sm:text-[8.5px] font-mono text-white font-bold">
                                {videoInfo.formattedDuration || '2:35'}
                              </span>
                            </div>
                            {/* Metadata */}
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                                {videoInfo.title}
                              </p>
                              <p className="text-[9.5px] sm:text-xs text-neutral-400 truncate mt-0.5">
                                {videoInfo.channel} &bull; 3.2M views &bull; 2 years ago
                              </p>
                            </div>
                          </div>

                          {/* Close button */}
                          <button
                            type="button"
                            onClick={() => {
                              setVideoUrl('');
                              setVideoInfo(null);
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                            title="Remove video"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* === SUB-TOOL TABS ROW === */}
                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-fade-x pb-0.5">
                    {[
                      { id: 'notes', label: 'YT to Notes', icon: FileText, href: '/youtube-to-notes' },
                      { id: 'flashcards', label: 'YT to Flashcards', icon: Layers, href: '/youtube-to-flashcards' },
                      { id: 'test', label: 'Practice Test', icon: CheckSquare, href: '/youtube-to-quiz' },
                      { id: 'quiz', label: 'YT to Quiz', icon: HelpCircle, href: '/youtube-to-quiz' },
                      { id: 'diagram', label: 'YT to Mind Map', icon: GitBranch, href: '/ai-diagram' },
                    ].map(tab => {
                      const isSelected = outputFormat === tab.id;
                      return (
                        <Link
                          key={tab.id}
                          href={tab.href}
                          className={cn(
                            "shrink-0 flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border whitespace-nowrap cursor-pointer",
                            isSelected 
                              ? "bg-white text-black border-white shadow-sm" 
                              : "bg-transparent border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"
                          )}
                        >
                          <tab.icon size={12} />
                          <span>{tab.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* === 4 DROPDOWN BOXES + GENERATE BUTTON === */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 pt-1.5 sm:pt-2 border-t border-white/[0.06]">
                    
                    {/* Box 1: AI Model */}
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <span className="text-[9px] sm:text-[11px] font-bold text-neutral-400 tracking-tight px-0.5">AI Model</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full bg-[#121215] hover:bg-[#18181c] border border-white/[0.08] hover:border-white/15 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2.5 flex items-center justify-between text-[11px] sm:text-xs font-bold text-white transition-all cursor-pointer outline-none group h-[34px] sm:h-[38px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Zap size={12} className="text-red-400 fill-red-400 shrink-0" />
                            <span className="truncate">{selectedModel.name}</span>
                            <span className="text-[7.5px] sm:text-[8px] font-black uppercase px-1 py-0.2 rounded bg-sky-500/15 text-sky-400 border border-sky-500/25">
                              {selectedModel.accessTier}
                            </span>
                          </div>
                          <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[270px] p-2.5 rounded-2xl shadow-2xl z-50">
                          <div className="px-3 py-2 mb-1 border-b border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500 flex items-center gap-1.5">
                              <IconBrain size={11} className="text-white/30" /> Intelligence Engine
                            </p>
                          </div>
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
                                  >
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                      style={{ backgroundColor: `${m.hex}12`, borderColor: `${m.hex}25` }}
                                    >
                                      <IconRobot size={16} style={{ color: m.hex }} />
                                    </div>
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className={cn("font-black text-[12px] tracking-tight", isActive ? "text-white" : "text-neutral-300")}>{m.name}</span>
                                        <span
                                          className="text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md border"
                                          style={{ color: tierColor, backgroundColor: `${tierColor}12`, borderColor: `${tierColor}25` }}
                                        >
                                          {m.accessTier}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-neutral-600 leading-tight truncate">{m.desc}</span>
                                    </div>
                                    {locked ? (
                                      <Lock size={10} className="text-neutral-500 shrink-0" />
                                    ) : isActive ? (
                                      <Check size={11} style={{ color: m.hex }} className="shrink-0" />
                                    ) : null}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Box 2: Language */}
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <span className="text-[9px] sm:text-[11px] font-bold text-neutral-400 tracking-tight px-0.5">Language</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full bg-[#121215] hover:bg-[#18181c] border border-white/[0.08] hover:border-white/15 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2.5 flex items-center justify-between text-[11px] sm:text-xs font-bold text-white transition-all cursor-pointer outline-none group h-[34px] sm:h-[38px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Globe size={12} className="text-neutral-400 shrink-0" />
                            <span className="truncate">{outputLanguage}</span>
                          </div>
                          <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[240px] p-3 rounded-2xl shadow-2xl z-50">
                          <div className="px-1 py-1 mb-2 border-b border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-1.5">
                              <Globe size={11} className="text-neutral-400" /> Output Language
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {LANGUAGES.map(l => {
                              const isPowerLang = POWER_LANGUAGES.has(l);
                              const hasPowerAccess = hasPremiumAccess && userPlanId === 'power';
                              const isSelected = outputLanguage === l;
                              return (
                                <button
                                  key={l}
                                  type="button"
                                  onClick={() => {
                                    if (isPowerLang && !hasPowerAccess) {
                                      const tok = localStorage.getItem('authToken');
                                      if (!tok) { setShowLoginModal(true); return; }
                                      setPremiumFeatureName(`${l} Language`);
                                      setShowPremiumModal(true);
                                      return;
                                    }
                                    setOutputLanguage(l);
                                  }}
                                  className={cn(
                                    "px-3 py-2 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer",
                                    isSelected
                                      ? "bg-white text-black border-white"
                                      : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/20"
                                  )}
                                >
                                  <span>{l}</span>
                                  {isPowerLang && (
                                    <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                      Power
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Box 3: Note Style */}
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <span className="text-[9px] sm:text-[11px] font-bold text-neutral-400 tracking-tight px-0.5">Note Style</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full bg-[#121215] hover:bg-[#18181c] border border-white/[0.08] hover:border-white/15 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2.5 flex items-center justify-between text-[11px] sm:text-xs font-bold text-white transition-all cursor-pointer outline-none group h-[34px] sm:h-[38px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Edit3 size={12} className="text-neutral-400 shrink-0" />
                            <span className="truncate">{selectedTheme.name}</span>
                          </div>
                          <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[280px] p-3 rounded-2xl shadow-2xl z-50">
                          <div className="px-1 py-1 mb-2 border-b border-white/[0.05] flex items-center justify-between">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-1.5">
                              <Sparkles size={11} className="text-neutral-400" /> Note Theme
                            </p>
                            <span className="text-[9px] text-neutral-400 capitalize">{selectedTheme.category}</span>
                          </div>

                          {/* Quick top themes */}
                          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                            {THEMES.slice(0, 6).map(t => {
                              const isSelected = selectedTheme.id === t.id;
                              const themePlan = getThemePlan(t.id);
                              const isLocked = (themePlan === 'pro' && !hasPremiumAccess) || 
                                               (themePlan === 'power' && (!hasPremiumAccess || userPlanId !== 'power'));
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    if (isLocked) {
                                      setPremiumFeatureName(`${t.name} Theme`);
                                      setShowPremiumModal(true);
                                      return;
                                    }
                                    setSelectedTheme(t);
                                  }}
                                  className={cn(
                                    "p-2 rounded-xl text-left border flex items-center justify-between cursor-pointer transition-all",
                                    isSelected 
                                      ? "bg-white/[0.06] border-red-500/50 shadow-sm" 
                                      : isLocked 
                                      ? "bg-white/[0.01] border-white/[0.04] opacity-60" 
                                      : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div 
                                      className="w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: t.bg, borderColor: t.border }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.primary }} />
                                    </div>
                                    <span className="text-xs font-bold truncate text-white">{t.name}</span>
                                  </div>
                                  {isLocked ? (
                                    <Lock size={10} className="text-amber-400" />
                                  ) : isSelected ? (
                                    <Check size={11} className="text-red-400 font-black" />
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>

                          {/* Actions */}
                          <div className="pt-2 border-t border-white/[0.06] space-y-1">
                            <button
                              type="button"
                              onClick={() => setShowConfigModal(true)}
                              className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <Sparkles size={12} className="text-red-400" />
                                <span>Customize Notes & Outline...</span>
                              </span>
                              <ArrowRight size={12} className="text-neutral-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTempSelectedTheme(selectedTheme);
                                setShowThemeExplorer(true);
                              }}
                              className="w-full py-2 px-3 rounded-xl hover:bg-white/[0.04] text-xs font-bold text-neutral-400 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span>Browse all {THEMES.length} themes</span>
                              <ArrowRight size={12} className="text-neutral-500" />
                            </button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Box 4: Detail Level */}
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <span className="text-[9px] sm:text-[11px] font-bold text-neutral-400 tracking-tight px-0.5">Detail Level</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full bg-[#121215] hover:bg-[#18181c] border border-white/[0.08] hover:border-white/15 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2.5 flex items-center justify-between text-[11px] sm:text-xs font-bold text-white transition-all cursor-pointer outline-none group h-[34px] sm:h-[38px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <BarChart2 size={12} className="text-neutral-400 shrink-0" />
                            <span className="truncate">{detailLevel === 'Standard' ? 'Balanced' : detailLevel}</span>
                          </div>
                          <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[240px] p-3 rounded-2xl shadow-2xl z-50">
                          <div className="px-1 py-1 mb-2 border-b border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-1.5">
                              <BarChart2 size={11} className="text-neutral-400" /> Detail Depth
                            </p>
                          </div>
                          <div className="space-y-1 mb-3">
                            {DETAIL_LEVELS.map(d => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDetailLevel(d)}
                                className={cn(
                                  "w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer",
                                  detailLevel === d
                                    ? "bg-white text-black border-white"
                                    : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/20"
                                )}
                              >
                                <span>{d === 'Standard' ? 'Balanced' : d}</span>
                                {detailLevel === d && <Check size={12} strokeWidth={3} />}
                              </button>
                            ))}
                          </div>

                          {outputFormat === 'flashcards' && (
                            <div className="pt-2 border-t border-white/[0.06]">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Card Count</p>
                              <div className="flex gap-1.5">
                                {[5, 10, 20, 30].map(c => {
                                  const isLocked = c > 5 && !hasPremiumAccess;
                                  return (
                                    <button
                                      key={c}
                                      type="button"
                                      onClick={() => {
                                        if (isLocked) {
                                          setPremiumFeatureName(`${c} Flashcards`);
                                          setShowPremiumModal(true);
                                          return;
                                        }
                                        setFlashcardCount(c);
                                      }}
                                      className={cn(
                                        "flex-1 py-1.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer",
                                        flashcardCount === c
                                          ? "bg-purple-500 text-white border-purple-400"
                                          : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white"
                                      )}
                                    >
                                      {c}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {outputFormat === 'test' && (
                            <div className="pt-2 border-t border-white/[0.06]">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Test Format</p>
                              <div className="space-y-1">
                                {TEST_TYPES.map(t => {
                                  const isLocked = t.isPremium && !hasPremiumAccess;
                                  return (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() => {
                                        if (isLocked) {
                                          setPremiumFeatureName(t.label);
                                          setShowPremiumModal(true);
                                          return;
                                        }
                                        setTestType(t.id);
                                      }}
                                      className={cn(
                                        "w-full px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-between transition-all cursor-pointer",
                                        testType === t.id
                                          ? "bg-white text-black border-white"
                                          : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white"
                                      )}
                                    >
                                      <span>{t.label}</span>
                                      {isLocked && <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">Pro</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Box 5: Generate Button (Full width on mobile across 2 cols, 5th col on desktop) */}
                    <div className="col-span-2 lg:col-span-1 flex flex-col justify-end mt-1 sm:mt-0">
                      <button 
                        type="button"
                        onClick={handleGenerateClick}
                        disabled={!isValidUrl || loading || isGenerating}
                        className={cn(
                          "w-full h-[36px] sm:h-[38px] rounded-lg sm:rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.98]",
                          isValidUrl 
                            ? "bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.35)]" 
                            : "bg-[#e50914] text-white hover:bg-[#dc2626]"
                        )}
                      >
                        {isGenerating ? <Loader2 className="animate-spin" size={13} /> : <Zap size={13} className="fill-white" />}
                        <span>GENERATE NOTES &rarr;</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>

              {/* ─── 4. SAMPLE NOTES SECTION ─── */}
              {activeCategory === 'youtube' && outputFormat === 'notes' && (
                <div className="w-full max-w-4xl mt-4">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-300">SAMPLE NOTES</span>
                      <span className="text-xs text-neutral-500 hidden sm:inline">&bull; Click any to explore, no sign-in required</span>
                    </div>
                    <Link href="/notes" className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
                      <span>View all</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>

                  {/* 5 Sample Note Cards */}
                  <div 
                    className="flex sm:grid sm:grid-cols-5 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {[
                      { slug: 'notes-supply-and-demand-g9adizjpds', videoId: 'g9aDizJpd_s', title: 'Supply & Demand', sub: 'CrashCourse', time: '5 min', badge: '📈 Economics', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/25', ctaColor: 'text-amber-400' },
                      { slug: 'notes-stanford-cs229-ml-jgwo_ugts7i', videoId: 'jGwO_UgTS7I', title: 'Neural Networks', sub: 'Stanford CS229', time: '8 min', badge: '🤖 AI / ML', badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/25', ctaColor: 'text-purple-400' },
                      { slug: 'notes-biology-cell-structure-urujd5nexc8', videoId: 'URUJD5NEXC8', title: 'Cell Structure', sub: 'Biology', time: '6 min', badge: '🔬 Biology', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', ctaColor: 'text-emerald-400' },
                      { slug: 'notes-something-finally-broke-between-us-and-europe-wydd0rf66de', videoId: 'WYDD0RF66DE', title: 'US-Europe Rift', sub: 'CSIS Analysis', time: '7 min', badge: '🌍 Geography', badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/25', ctaColor: 'text-sky-400' },
                      { slug: 'notes-mit-804-quantum-physics-lz3bpuko5zc', videoId: 'lZ3bPUKo5zc', title: 'Quantum Physics', sub: 'MIT 8.04', time: '9 min', badge: '⚛️ Physics', badgeColor: 'bg-pink-500/15 text-pink-400 border-pink-500/25', ctaColor: 'text-pink-400' },
                    ].map((item) => (
                      <div
                        key={item.slug}
                        onClick={() => router.push(`/notes/${item.slug}`)}
                        className="group shrink-0 w-[150px] sm:w-auto overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0e] hover:border-white/20 cursor-pointer transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Thumbnail Container */}
                        <div className="relative h-20 sm:h-24 w-full overflow-hidden bg-neutral-900">
                          <img
                            src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                            alt={item.title}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <span className={cn("absolute bottom-1.5 left-1.5 text-[8px] font-black px-1.5 py-0.5 rounded border backdrop-blur-sm tracking-wide", item.badgeColor)}>
                            {item.badge}
                          </span>
                          <span className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm rounded-md p-1">
                            <IconBrandYoutube size={10} className="text-red-400" />
                          </span>
                        </div>

                        {/* Card Info */}
                        <div className="p-2.5 flex flex-col gap-1">
                          <h5 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
                            {item.title}
                          </h5>
                          <p className="text-[10px] text-neutral-400 truncate leading-none">
                            {item.sub}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.04]">
                            <span className="text-[9px] text-neutral-500">{item.time}</span>
                            <span className={cn("text-[9px] font-extrabold flex items-center gap-0.5", item.ctaColor)}>
                              Open &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* ================= 2. REDESIGNED AI GENERATION PROCESSING SCREEN ================= */
            <motion.div 
              key="loader"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-5xl mx-auto bg-[#080808] border border-white/[0.08] rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95)] z-10 flex flex-col gap-5 sm:gap-6 my-2"
            >
              {/* ─── A. TOP HEADER & OVERALL PROGRESS ─── */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Brand Engine Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] shrink-0">
                      <Sparkles size={18} className="fill-red-500/20" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight leading-tight">
                        Synthesizing Knowledge Engine
                      </h2>
                      <p className="text-[11px] sm:text-xs text-neutral-400 font-medium hidden sm:block">
                        AI is analyzing and generating your notes
                      </p>
                    </div>
                  </div>

                  {/* Right: Percentage Pill & Cancel Action */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono font-bold text-neutral-200">
                      <Clock size={12} className="text-red-400" />
                      <span>{Math.floor(progressPercent)}% Complete</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsGenerating(false)}
                      className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Cancel Generation"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Thin Red Progress Bar */}
                <div className="h-1.5 sm:h-2 w-full bg-white/[0.06] rounded-full overflow-hidden relative">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full relative"
                    animate={{ width: `${Math.max(4, Math.min(100, progressPercent))}%` }}
                    transition={{ ease: "easeOut", duration: 0.15 }}
                  >
                    {/* Glowing Leading Edge Dot */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                  </motion.div>
                </div>

                {/* Sub-status Activity Ticker */}
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin shrink-0" />
                  <span className="truncate">{getSubStatus(currentStep, progressPercent)}</span>
                </div>
              </div>

              {/* ─── B. MAIN CONTENT GRID (DESKTOP: 2 COLS / MOBILE: STACKED) ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 1. LEFT COLUMN: VIDEO PREVIEW CARD */}
                <div className="lg:col-span-6 xl:col-span-6 w-full bg-[#0c0c0f] border border-white/[0.08] rounded-[20px] overflow-hidden flex flex-col justify-between shadow-xl">
                  {/* Video Thumbnail Box */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                    <img 
                      src={videoInfo?.thumbnail || getYouTubeThumbnail(videoUrl) || "https://img.youtube.com/vi/placeholder/maxresdefault.jpg"} 
                      className="w-full h-full object-cover"
                      alt={videoInfo?.title || "Processing Video"}
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white shadow-sm">
                      <IconBrandYoutube size={13} className="text-red-500" />
                      <span>YouTube</span>
                    </div>

                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-neutral-300 shadow-sm">
                      {videoInfo?.duration || "2:35"}
                    </div>
                  </div>

                  {/* Video Metadata Box */}
                  <div className="p-4 sm:p-5 pt-3 flex flex-col gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-2">
                      {videoInfo?.title || "Phonics Song 2 with TWO Words in 3D - A For Airplane - ABC Alphabet Songs with Sounds for Children"}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium pt-1 border-t border-white/[0.04]">
                      <span className="truncate max-w-[140px] text-neutral-300 font-semibold">
                        {videoInfo?.author || videoInfo?.channelTitle || "Little Baby Bum"}
                      </span>
                      <span>&bull;</span>
                      <span>{videoInfo?.views ? `${videoInfo.views} views` : "3.2M views"}</span>
                      <span>&bull;</span>
                      <span>{videoInfo?.uploadDate || "2 years ago"}</span>
                    </div>
                  </div>
                </div>

                {/* 2. RIGHT COLUMN: PROCESSING TIMELINE */}
                <div className="lg:col-span-6 xl:col-span-6 w-full flex flex-col justify-between gap-3">
                  <div className="flex flex-col space-y-1">
                    {(outputFormat === 'flashcards' 
                      ? FLASHCARDS_LOADING_STEPS 
                      : outputFormat === 'code_solution' 
                      ? CODE_LOADING_STEPS 
                      : NOTES_LOADING_STEPS
                    ).map((step, idx, arr) => {
                      const isCompleted = currentStep > idx;
                      const isActive = currentStep === idx;
                      const isPending = currentStep < idx;

                      return (
                        <div key={step.id} className="relative flex items-start gap-3.5 group">
                          
                          {/* Vertical Connector Line */}
                          {idx !== arr.length - 1 && (
                            <div className={cn(
                              "absolute left-[13px] top-[26px] w-[2px] h-[calc(100%-8px)] transition-colors duration-300",
                              isCompleted ? "bg-red-500/50" : "bg-white/[0.08]"
                            )} />
                          )}

                          {/* Status Icon */}
                          <div className="relative z-10 pt-0.5">
                            {isCompleted ? (
                              <div className="w-[26px] h-[26px] rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            ) : isActive ? (
                              <div className="w-[28px] h-[28px] rounded-full bg-red-500/20 border border-red-500/50 text-red-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                                <Sparkles size={13} className="fill-red-400/30" />
                              </div>
                            ) : (
                              <div className="w-[26px] h-[26px] rounded-full border border-white/10 bg-[#0c0c0e] flex items-center justify-center shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                              </div>
                            )}
                          </div>

                          {/* Step Content Container */}
                          <div className={cn(
                            "flex-1 flex items-center justify-between p-2 rounded-xl transition-all duration-200 min-w-0",
                            isActive && "bg-[#140606] border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                          )}>
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className={cn(
                                "text-xs font-bold transition-colors leading-tight truncate",
                                isCompleted ? "text-white" : isActive ? "text-white font-extrabold" : "text-neutral-500"
                              )}>
                                {step.label}
                              </span>
                              <span className={cn(
                                "text-[10px] leading-tight mt-0.5 truncate",
                                isCompleted ? "text-neutral-400" : isActive ? "text-neutral-300 font-medium" : "text-neutral-600"
                              )}>
                                {step.desc}
                              </span>
                            </div>

                            {/* Duration / Status Pill */}
                            <div className="shrink-0 text-right">
                              {isCompleted ? (
                                <span className="text-[10.5px] font-mono font-bold text-emerald-400">
                                  {step.duration || "2s"}
                                </span>
                              ) : isActive ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-[10px] font-mono font-bold text-red-400 animate-pulse">
                                  {step.duration || "~ 25s"}
                                </span>
                              ) : (
                                <span className="text-[10.5px] font-mono text-neutral-600">
                                  --
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Leave-Page Message Card */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 text-[11px] sm:text-xs text-neutral-400 mt-2">
                    <Lightbulb size={14} className="text-neutral-500 shrink-0" />
                    <span>You can leave this page. We&apos;ll notify you when it&apos;s ready.</span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
