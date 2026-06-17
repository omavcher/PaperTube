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
import { Loader2, ChevronDown, ArrowRight, Coins, AlertTriangle, X, Zap, Code, Users, Headphones, Search, FileSignature, BrainCircuit, FileType, CheckSquare, Target, Map, Briefcase, GraduationCap, Link as LinkIcon, BookOpen, PenTool, LayoutGrid, FileText, Lock, Check, RefreshCw, Crown } from "lucide-react";
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
  { id: 0, label: "Input Validation", icon: CheckSquare, desc: "Validate URL format, user plan limits, and daily usage restrictions" },
  { id: 1, label: "Video Metadata Fetch", icon: LinkIcon, desc: "Fetch video details via YouTube API" },
  { id: 2, label: "Transcript Extraction", icon: FileText, desc: "Retrieve raw captions with timestamps" },
  { id: 3, label: "Pre-Processing & Chunking", icon: BrainCircuit, desc: "Clean caption formatting and filter filler words" },
  { id: 4, label: "AI Note Generation", icon: IconSparkles, desc: "Send structured payload, parse JSON response schemas" },
  { id: 5, label: "Post-Processing & Styling", icon: IconSettings, desc: "Inject timestamps, fetch context-curated illustrations" },
  { id: 6, label: "Render & Compile", icon: LayoutGrid, desc: "Generate HTML with selected CSS theme colors" },
  { id: 7, label: "Redirecting to Workspace", icon: ArrowRight, desc: "Initializing your customized notes canvas..." }
];

const FLASHCARDS_LOADING_STEPS = [
  { id: 0, label: "Input Validation", icon: CheckSquare, desc: "Validate URL format, user plan limits, and daily usage restrictions" },
  { id: 1, label: "Video Metadata Fetch", icon: LinkIcon, desc: "Fetch video details via YouTube API" },
  { id: 2, label: "Transcript Extraction", icon: FileText, desc: "Retrieve raw captions with timestamps" },
  { id: 3, label: "Pre-Processing & Chunking", icon: BrainCircuit, desc: "Clean caption formatting and filter filler words" },
  { id: 4, label: "AI Flashcards Generation", icon: IconBrain, desc: "Send structured payload, generate Q&A flashcards" },
  { id: 5, label: "Spaced Repetition Setup", icon: IconSettings, desc: "Optimize flashcard learning schedules and spacing" },
  { id: 6, label: "Compile Flashcard Deck", icon: LayoutGrid, desc: "Generate flashcard layouts and commit to database" },
  { id: 7, label: "Redirecting to Workspace", icon: ArrowRight, desc: "Opening your new flashcard deck..." }
];

const CODE_LOADING_STEPS = [
  { id: 0, label: "Input Validation", icon: CheckSquare, desc: "Validate URL format, user plan limits, and daily usage restrictions" },
  { id: 1, label: "Code Metadata Fetch", icon: LinkIcon, desc: "Fetch problem description and code specifications" },
  { id: 2, label: "Syntax Extraction", icon: FileText, desc: "Retrieve raw code statements and logic blocks" },
  { id: 3, label: "Pre-Processing & Check", icon: BrainCircuit, desc: "Parse code parameters and abstract structures" },
  { id: 4, label: "AI Code Analysis", icon: Code, desc: "Analyze algorithmic complexity and optimize solution logic" },
  { id: 5, label: "Post-Processing & Comments", icon: IconSettings, desc: "Format code blocks, add explanatory docstrings" },
  { id: 6, label: "Synthesize Code Solutions", icon: LayoutGrid, desc: "Generate HTML output with code theme styling" },
  { id: 7, label: "Redirecting to Workspace", icon: ArrowRight, desc: "Initializing your code playground workspace..." }
];



const isThemePremium = (themeId: string) => {
  const freeThemes = ['blueberry', 'midnight', 'atmosphere', 'snow', 'minimalist', 'kraft', 'mystique', 'ocean'];
  return !freeThemes.includes(themeId);
};

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

    if (outputFormat === 'notes') {
      setShowConfigModal(true);
    } else {
      handleGenerateProcess();
    }
  };

  return (
    <section className="w-full min-h-screen relative flex flex-col items-center justify-center bg-black text-white px-4 py-10 font-sans selection:bg-neutral-800 selection:text-white overflow-hidden">
      
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
        {/* --- NOTE CONFIGURATION DIALOG --- */}
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
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 50 }}
              className="relative w-full max-w-2xl bg-[#0c0c0c] border-t sm:border border-white/[0.08] rounded-t-[2rem] sm:rounded-[2rem] rounded-b-none sm:rounded-b-[2rem] p-6 sm:p-8 shadow-2xl z-10 overflow-y-auto max-h-[85vh] sm:max-h-[90vh] no-scrollbar"
            >
              <button 
                onClick={() => setShowConfigModal(false)} 
                className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Customize Your Notes</h3>
                  <p className="text-sm text-neutral-400 mt-1">Configure your outline structure and note design template.</p>
                </div>

                {/* Step 1: Outline Type */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-500">1. Outline Structure</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'flash', label: 'Flash Outline', desc: 'Fast & concise. Quick summary, pills, key terms & short bullet points.', tier: 'Free', color: '#38bdf8' },
                      { id: 'canvas', label: 'Canvas Outline', desc: 'Visual & rich. Deep comprehension, bullets, tables, key takeaways, and visual illustrations.', tier: 'Pro', color: '#a78bfa' },
                      { id: 'scholar', label: 'Scholar Outline', desc: 'Academic study. Overview paragraph, subsections, comparison tables, and detailed chapter summaries.', tier: 'Pro', color: '#34d399' },
                      { id: 'atlas', label: 'Atlas Outline', desc: 'Comprehensive map. Cross references, contextual timelines, questions, and spaced-repetition Anki cards.', tier: 'Power', color: '#fbbf24' }
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
                            "relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[110px]",
                            locked 
                              ? "opacity-45 hover:opacity-60 border-white/[0.04] bg-white/[0.005]" 
                              : isSelected 
                              ? "bg-white/[0.05] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                              : "bg-white/[0.01] border-white/[0.05] hover:border-white/10 hover:bg-white/[0.02]"
                          )}
                          style={(!locked && isSelected) ? { boxShadow: `inset 0 0 15px ${opt.color}10, 0 4px 20px rgba(0,0,0,0.4)` } : {}}
                        >
                          <div className="flex justify-between items-start">
                            <span className={cn("font-bold text-sm", locked ? "text-neutral-500" : "text-white")}>{opt.label}</span>
                            <div className="flex items-center gap-1.5">
                              {locked ? (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-0.5">
                                  <Lock size={7} /> {opt.tier}
                                </span>
                              ) : (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border" style={{ color: opt.color, borderColor: `${opt.color}30`, backgroundColor: `${opt.color}10` }}>
                                  {opt.tier}
                                </span>
                              )}
                              {!locked && isSelected && (
                                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: opt.color }}>
                                  <Check size={9} className="text-black font-black" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          </div>
                          <p className={cn("text-xs leading-relaxed mt-2", locked ? "text-neutral-600" : "text-neutral-500")}>{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Theme Quick Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-500">2. Note Style Theme</label>
                    <button 
                      onClick={() => {
                        setTempSelectedTheme(selectedTheme);
                        setShowThemeExplorer(true);
                      }}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      View More Themes <ArrowRight size={12} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {THEMES.slice(0, 4).map(t => {
                      const isSelected = selectedTheme.id === t.id;
                      const isPrem = isThemePremium(t.id);
                      const isThemeLocked = isPrem && !hasPremiumAccess;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            if (isThemeLocked) {
                              setPremiumFeatureName(`${t.name} Theme`);
                              setShowPremiumModal(true);
                              return;
                            }
                            setSelectedTheme(t);
                          }}
                          className="flex flex-col gap-2 cursor-pointer group"
                        >
                          {/* Styled Preview Box */}
                          <div 
                            className={cn(
                              "w-full aspect-[4/3] rounded-2xl p-3 sm:p-3.5 border flex flex-col justify-between transition-all duration-200 relative",
                              isThemeLocked 
                                ? "opacity-60 border-white/[0.04] bg-white/[0.005]" 
                                : isSelected 
                                ? "border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)] scale-[1.02]" 
                                : "border-white/10 hover:border-white/20 hover:scale-[1.01]"
                            )}
                            style={{ 
                              backgroundColor: t.bg,
                              fontFamily: t.font || 'inherit'
                            }}
                          >
                            <span className="text-xs sm:text-sm font-black tracking-tight" style={{ color: t.primary }}>Title</span>
                            
                            <div className="flex justify-between items-end w-full">
                              <span className="text-[8px] sm:text-[9px] font-semibold" style={{ color: t.text }}>
                                Body & <span className="underline font-bold" style={{ color: t.link }}>link</span>
                              </span>
                              
                              {isThemeLocked && (
                                <Crown size={11} className="text-yellow-500 fill-yellow-500/20 mb-0.5" />
                              )}
                            </div>
                          </div>

                          {/* Theme name & check icon underneath */}
                          <div className="flex items-center gap-1.5 px-1 justify-between">
                            <span className={cn("text-[11px] font-bold transition-colors", isSelected ? "text-white" : "text-neutral-400 group-hover:text-neutral-200")}>
                              {t.name}
                            </span>
                            {isSelected && !isThemeLocked && (
                              <Check size={11} className="text-blue-500 font-black" strokeWidth={3} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/[0.05]">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1 h-12 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl font-bold uppercase tracking-widest text-xs border border-white/[0.05] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfigModal(false);
                      handleGenerateProcess();
                    }}
                    className="flex-1 h-12 bg-white text-black hover:bg-neutral-100 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                  >
                    <Zap size={13} fill="currentColor" /> Generate Notes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- THEME EXPLORER DIALOG --- */}
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
              className="relative w-full max-w-5xl h-dvh sm:h-[85vh] bg-[#0c0c0c] border-none sm:border border-white/[0.08] rounded-none sm:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 sm:p-6 border-b border-white/[0.05] shrink-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">All themes</h3>
                  <p className="text-xs text-neutral-500">View and select from all themes</p>
                </div>
                <button 
                  onClick={() => setShowThemeExplorer(false)} 
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Views Switcher Tabs */}
              <div className="flex md:hidden border-b border-white/[0.05] bg-[#070707] p-2 shrink-0">
                <button 
                  onClick={() => setMobileExplorerView('list')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                    mobileExplorerView === 'list' ? "bg-white/10 text-white" : "text-neutral-500"
                  )}
                >
                  Themes List
                </button>
                <button 
                  onClick={() => setMobileExplorerView('preview')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                    mobileExplorerView === 'preview' ? "bg-white/10 text-white" : "text-neutral-500"
                  )}
                >
                  Live Preview
                </button>
              </div>

              {/* Modal Content - Dual Pane */}
              <div className="flex-1 flex overflow-hidden min-h-0">
                
                {/* LEFT PANE: Search, Categories & Scrollable Cards */}
                <div className={cn(
                  "w-full md:w-[40%] border-r border-white/[0.05] flex flex-col p-5 sm:p-6 min-w-0 bg-[#070707] shrink-0",
                  mobileExplorerView === 'list' ? "flex h-full" : "hidden md:flex"
                )}>
                  {/* Search Input */}
                  <div className="flex gap-2 mb-4 shrink-0">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input 
                        type="text"
                        placeholder="Search for a theme"
                        value={searchTheme}
                        onChange={(e) => setSearchTheme(e.target.value)}
                        className="w-full bg-white/5 border border-white/[0.06] focus:border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
                        setTempSelectedTheme(randomTheme);
                      }}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0"
                      title="Shuffle/Random Theme"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {/* Categories chips */}
                  <div className="flex gap-1 overflow-x-auto no-scrollbar pb-3 shrink-0">
                    {(['all', 'dark', 'light', 'professional', 'colorful'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveThemeCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                          activeThemeCategory === cat
                            ? "bg-white text-black border-white"
                            : "bg-transparent border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-white/10"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable grid of theme cards */}
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3 pb-4">
                      {THEMES.filter(t => {
                        const matchesSearch = t.name.toLowerCase().includes(searchTheme.toLowerCase()) || 
                                              t.desc?.toLowerCase().includes(searchTheme.toLowerCase());
                        const matchesCategory = activeThemeCategory === 'all' || t.category === activeThemeCategory;
                        return matchesSearch && matchesCategory;
                      }).map(t => {
                        const isActive = tempSelectedTheme?.id === t.id;
                        const isPrem = isThemePremium(t.id);
                        const isThemeLocked = isPrem && !hasPremiumAccess;

                        return (
                          <div
                            key={t.id}
                            onClick={() => setTempSelectedTheme(t)}
                            className="flex flex-col gap-1.5 cursor-pointer group"
                          >
                            {/* Styled Preview Box */}
                            <div 
                              className={cn(
                                "w-full aspect-[4/3] rounded-xl p-3 border flex flex-col justify-between transition-all duration-200 relative bg-neutral-950",
                                isActive 
                                  ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] scale-[1.01]" 
                                  : "border-white/[0.06] hover:border-white/20 hover:scale-[1.005]"
                              )}
                              style={{ 
                                backgroundColor: t.bg,
                                fontFamily: t.font || 'inherit'
                              }}
                            >
                              <span className="text-[10px] font-black tracking-tight leading-none" style={{ color: t.primary }}>Title</span>
                              
                              <div className="flex justify-between items-end w-full">
                                <span className="text-[7.5px] font-semibold leading-none" style={{ color: t.text }}>
                                  Body & <span className="underline font-bold" style={{ color: t.link }}>link</span>
                                </span>
                                
                                {isThemeLocked && (
                                  <Crown size={9} className="text-yellow-500 fill-yellow-500/20 mb-0.5 shrink-0" />
                                )}
                              </div>
                            </div>

                            {/* Theme name & check icon underneath */}
                            <div className="flex items-center gap-1 px-0.5 justify-between">
                              <span className={cn("text-[10px] font-bold truncate max-w-[80%]", isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200")}>
                                {t.name}
                              </span>
                              {isActive && (
                                <Check size={10} className="text-blue-500 font-black shrink-0" strokeWidth={3} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT PANE: Dynamic Interactive Canvas Notes Preview */}
                <div className={cn(
                  "flex-1 bg-[#050505] p-5 sm:p-6 flex-col overflow-y-auto custom-scrollbar relative justify-center items-center w-full",
                  mobileExplorerView === 'preview' ? "flex h-full" : "hidden md:flex"
                )}>
                  {tempSelectedTheme && (
                    <div 
                      className="w-full max-w-xl rounded-2xl border p-5 sm:p-6 shadow-2xl flex flex-col transition-all duration-300 relative overflow-hidden"
                      style={{ 
                        backgroundColor: tempSelectedTheme.bg,
                        color: tempSelectedTheme.text,
                        borderColor: tempSelectedTheme.border,
                        fontFamily: tempSelectedTheme.font || 'inherit'
                      }}
                    >
                      {/* Embedded styles for canvas container components */}
                      <style dangerouslySetInnerHTML={{ __html: `
                        .theme-preview-card h1, .theme-preview-card h2, .theme-preview-card h3 {
                          color: ${tempSelectedTheme.primary} !important;
                        }
                        .theme-preview-card a {
                          color: ${tempSelectedTheme.link} !important;
                        }
                        .theme-preview-card .smart-box {
                          background-color: ${tempSelectedTheme.cardBg} !important;
                          border: 1px solid ${tempSelectedTheme.border} !important;
                          color: ${tempSelectedTheme.text} !important;
                        }
                        .theme-preview-card .takeaway-box {
                          background-color: ${tempSelectedTheme.cardBg} !important;
                          border: 1px solid ${tempSelectedTheme.border} !important;
                          color: ${tempSelectedTheme.text} !important;
                        }
                      `}} />

                      <div className="theme-preview-card grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* Left content block (70% width) */}
                        <div className="lg:col-span-8 space-y-4">
                          <div>
                            <h1 className="text-2xl font-black tracking-tight leading-none">This is a heading</h1>
                            <p className="text-xs opacity-60 font-semibold mt-1">Hello 👋</p>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-md font-bold">This is a theme preview</h3>
                            <p className="text-xs leading-relaxed opacity-85">
                              This is body text. You can change your fonts, colors and images later in the theme editor. You can also create your own custom branded theme.
                            </p>
                            <a href="#" onClick={(e) => e.preventDefault()} className="text-xs font-semibold underline block mt-1 hover:opacity-80 transition-opacity">This is a link.</a>
                          </div>

                          {/* Smart layouts */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="smart-box p-2.5 rounded-xl text-[10px] leading-snug">
                              This is a smart layout: it acts as a text box.
                            </div>
                            <div className="smart-box p-2.5 rounded-xl text-[10px] leading-snug">
                              You can get these by typing /smart
                            </div>
                          </div>

                          {/* Bullet List */}
                          <ul className="text-xs space-y-1 opacity-80 list-disc pl-4">
                            <li>Connected layers of artificial nodes</li>
                            <li>Learn weights and bias parameters</li>
                          </ul>

                          {/* Table Preview */}
                          <div className="smart-box overflow-hidden rounded-xl">
                            <table className="w-full text-[10px] border-collapse">
                              <thead>
                                <tr className="border-b" style={{ borderColor: tempSelectedTheme.border }}>
                                  <th className="p-1.5 text-left font-bold" style={{ color: tempSelectedTheme.primary }}>Layer</th>
                                  <th className="p-1.5 text-left font-bold" style={{ color: tempSelectedTheme.primary }}>Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b" style={{ borderColor: tempSelectedTheme.border }}>
                                  <td className="p-1.5">Input</td>
                                  <td className="p-1.5 opacity-80">Receives features</td>
                                </tr>
                                <tr>
                                  <td className="p-1.5">Hidden</td>
                                  <td className="p-1.5 opacity-80">Extracts patterns</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Key Takeaway Card */}
                          <div className="takeaway-box p-3 rounded-xl text-[10px] flex items-start gap-2">
                            <span className="text-sm shrink-0">💡</span>
                            <p className="leading-snug">
                              <strong>Key takeaway:</strong> Neural networks progressively transform raw inputs into useful predictions.
                            </p>
                          </div>

                          {/* Primary/Secondary Buttons */}
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={(e) => e.preventDefault()}
                              className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-90 shadow-md"
                              style={{
                                backgroundColor: tempSelectedTheme.primary,
                                color: tempSelectedTheme.btnText || '#fff'
                              }}
                            >
                              Primary button
                            </button>
                            <button 
                              onClick={(e) => e.preventDefault()}
                              className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors bg-transparent"
                              style={{
                                borderColor: tempSelectedTheme.accent || tempSelectedTheme.border,
                                color: tempSelectedTheme.accent || tempSelectedTheme.text
                              }}
                            >
                              Secondary button
                            </button>
                          </div>
                        </div>

                        {/* Right visual block placeholder (30% width) */}
                        <div className="lg:col-span-4 h-full min-h-[160px] lg:min-h-full rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center shrink-0"
                          style={{
                            borderColor: tempSelectedTheme.border,
                            backgroundColor: `${tempSelectedTheme.cardBg}50`
                          }}
                        >
                          <PenTool size={20} style={{ color: tempSelectedTheme.accent }} className="opacity-60 mb-2" />
                          <span className="text-[9px] uppercase tracking-wider opacity-60">Canvas Media</span>
                          <span className="text-[8px] opacity-40 mt-1 max-w-[80px] leading-tight">Unsplash image injection slot</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-5 sm:p-6 border-t border-white/[0.05] shrink-0 bg-[#080808]">
                <button
                  onClick={() => setShowThemeExplorer(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold uppercase tracking-widest text-xs border border-white/[0.05] transition-all"
                >
                  Cancel
                </button>
                {tempSelectedTheme && isThemePremium(tempSelectedTheme.id) && !hasPremiumAccess ? (
                  <button
                    onClick={() => {
                      setPremiumFeatureName(tempSelectedTheme ? `${tempSelectedTheme.name} Theme` : "Premium Themes");
                      setShowPremiumModal(true);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
                  >
                    <Crown size={12} className="fill-white/10" /> Upgrade to select theme
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (tempSelectedTheme) {
                        setSelectedTheme(tempSelectedTheme);
                      }
                      setShowThemeExplorer(false);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  >
                    Select theme
                  </button>
                )}
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
              className="flex flex-col items-center space-y-10"
            >

              {/* Branding */}
              <div className="text-center space-y-5 md:space-y-6 mb-6 md:mb-10 w-full min-h-[140px] md:min-h-[160px] flex flex-col justify-center">
                
                {/* Status Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md shadow-lg relative overflow-hidden"
                >
                  <motion.div 
                    key={`dot-${activeCategory}`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      activeCategory === 'youtube' ? "bg-red-500 shadow-[0_0_8px_#ef4444]" :
                      activeCategory === 'coding' ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" :
                      activeCategory === 'document' ? "bg-purple-500 shadow-[0_0_8px_#a855f7]" :
                      "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                    )}
                  ></motion.div>
                  Paperxify Engine Active
                </motion.div>
                
                {/* Main Title & Subtitle */}
                <div className="space-y-4 md:space-y-5 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.h1 
                      key={`${activeCategory}-${outputFormat}`}
                      initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2 text-center"
                    >
                      {activeCategory === 'youtube' && (
                        <>
                          {outputFormat === 'notes' && (
                            <>Turn YouTube Videos Into <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">Smart Study Notes</span></>
                          )}
                          {outputFormat === 'flashcards' && (
                            <>AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">YouTube Flashcards</span> Generator</>
                          )}
                          {outputFormat === 'test' && (
                            <>AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">YouTube Practice Test</span> Maker</>
                          )}
                        </>
                      )}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              </div>

            

              {/* ============ MAIN COMMAND CARD ============ */}
              <div className="w-full max-w-3xl relative z-10">
                {/* Outer glow ambient effect */}
                <motion.div 
                  key={`glow-${activeCategory}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className={cn(
                    "absolute -inset-px rounded-[2.2rem] bg-gradient-to-b to-transparent pointer-events-none z-0",
                    activeCategory === 'youtube' ? "from-red-500/20 via-red-500/5" :
                    activeCategory === 'coding' ? "from-blue-500/20 via-blue-500/5" :
                    activeCategory === 'document' ? "from-purple-500/20 via-purple-500/5" :
                    "from-emerald-500/20 via-emerald-500/5"
                  )} 
                />

                <div className="relative z-10 bg-[#0c0c0c] border border-white/[0.08] rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] transition-all duration-500 focus-within:border-white/20 focus-within:shadow-[0_0_40px_-15px_rgba(255,255,255,0.06)]">
                  
                  {/* === OVERHAULED INPUT ZONE === */}
                  <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 pt-4 sm:pt-6 pb-2.5 sm:pb-3">
                    <motion.div 
                      key={`iconbox-${activeCategory}-${isValidUrl}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className={cn(
                        "shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                        isValidUrl 
                          ? (activeCategory === 'youtube' ? "bg-red-500/15 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                            : activeCategory === 'coding' ? "bg-blue-500/15 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            : activeCategory === 'document' ? "bg-purple-500/15 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                            : "bg-emerald-500/15 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]")
                          : "bg-white/5 text-neutral-500"
                      )}
                    >
                      {activeCategory === 'youtube' 
                        ? <IconBrandYoutube size={18} className={cn(isValidUrl && activeCategory === 'youtube' && "animate-pulse")} />
                        : activeCategory === 'coding' ? <Code size={16} />
                        : activeCategory === 'document' ? <FileType size={16} />
                        : <BookOpen size={16} />}
                    </motion.div>
                    <input 
                      placeholder={CATEGORY_TOOLS[activeCategory].find(t => t.id === outputFormat)?.placeholder || "Paste link or enter your request..."}
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] sm:text-[18px] font-semibold text-white placeholder:text-neutral-500 sm:placeholder:text-neutral-600 outline-none min-w-0 px-1"
                    />
                    <div className="shrink-0 flex items-center gap-2">
                      {loading && <Loader2 className="animate-spin text-neutral-600" size={16} />}
                      {isValidUrl && !loading && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                          <IconCheck size={12} className="text-green-500" />
                        </motion.div>
                      )}
                      {isLoggedIn && !hasPremiumAccess && userTokens !== null && (
                        <Link href="/pricing" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-500/8 border border-yellow-500/15 text-yellow-500 text-[10px] font-black uppercase tracking-wider hover:bg-yellow-500/15 transition-colors">
                          <Coins size={11} />
                          {userTokens.toLocaleString()}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* === Video Preview === */}
                  <AnimatePresence>
                    {videoInfo && !loading && activeCategory === 'youtube' && !videoInfo.isCode && (
                      <motion.div key="vinfo" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="mx-4 mt-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center gap-3">
                          <img src={videoInfo.thumbnail} className="w-16 h-10 rounded-lg object-cover shrink-0 bg-neutral-800" alt="thumb" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">{videoInfo.title}</p>
                            <p className="text-[10px] text-neutral-600 font-mono mt-0.5">{videoInfo.formattedDuration} &middot; {videoInfo.channel}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* === MAIN TEXTAREA === */}
                  <div className="px-4 sm:px-6 pb-2 sm:pb-4">
                    <textarea 
                      placeholder={activeCategory === 'youtube' 
                        ? "Add specific focus areas, topics to emphasize... (optional)"
                        : "Describe what you need — be specific for best results..."}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border-none focus:ring-0 text-[14px] sm:text-[15px] text-neutral-300 placeholder:text-neutral-600 sm:placeholder:text-neutral-700 resize-none outline-none leading-relaxed px-1"
                    />
                  </div>

                  {/* === Sub-tool Chips === */}
                  <div className="px-4 sm:px-5 pb-3 sm:pb-4">
                    <div onWheel={handleHorizontalScroll} className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-fade-x pb-1 sm:pb-0.5 min-h-[32px]">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {CATEGORY_TOOLS[activeCategory].map(tool => {
                          const isSelected = outputFormat === tool.id;
                          const href = tool.id === 'notes' ? '/youtube-to-notes'
                                     : tool.id === 'flashcards' ? '/youtube-to-flashcards'
                                     : '/youtube-to-quiz';
                          return (
                            <Link 
                              key={tool.id}
                              href={href}
                              className={cn(
                                "relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap",
                                isSelected 
                                  ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]" 
                                  : "bg-transparent border-white/[0.08] text-neutral-500 hover:text-neutral-300 hover:border-white/20"
                              )}
                            >
                              <tool.icon size={12} />
                              {tool.label}
                              {tool.comingSoon && <span className="ml-0.5 text-[8px] bg-red-500/80 text-white px-1 py-0.5 rounded font-black uppercase tracking-wider">Soon</span>}
                            </Link>
                          );
                        })}
                      </AnimatePresence>

                    </div>
                  </div>

                  {/* === BOTTOM ACTION BAR === */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-3 border-t border-white/[0.05] bg-white/[0.01]">
                    <div onWheel={handleHorizontalScroll} className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 sm:px-0">
                      
                      {/* Model Selector */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 text-[11px] font-bold text-neutral-300 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedModel.hex, boxShadow: `0 0 6px ${selectedModel.hex}99` }} />
                          <span>{selectedModel.name}</span>
                          <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[280px] p-2.5 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] z-50" style={{ background: 'radial-gradient(ellipse at top left, #ffffff06 0%, #0a0a0a 60%)' }}>
                          {/* Header */}
                          <div className="px-3 py-2 mb-1 border-b border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500 flex items-center gap-1.5">
                              <IconBrain size={11} className="text-white/30" /> Intelligence Engine
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
                                      <IconRobot size={16} style={{ color: m.hex }} />
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
                                        <Zap size={10} className="text-neutral-500" />
                                      </div>
                                    )}
                                    {!locked && isActive && (
                                      <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${m.hex}20`, boxShadow: `0 0 8px ${m.hex}40` }}>
                                        <IconCheck size={11} style={{ color: m.hex }} />
                                      </div>
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                          {/* Footer */}
                          <div className="mt-2 pt-2 border-t border-white/[0.05]">
                            <Link href="/models" className="block outline-none">
                              <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-neutral-500 hover:text-white hover:bg-white/[0.04] font-bold text-[10px] uppercase tracking-wider outline-none focus:bg-white/[0.04] focus:text-white group transition-all">
                                <span>Browse all models</span>
                                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                              </DropdownMenuItem>
                            </Link>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Options Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/15 text-[11px] font-bold text-neutral-400 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                          <IconSettings size={14} className="text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                          <span className="hidden sm:inline">{outputLanguage} &middot; {detailLevel}{outputFormat === 'flashcards' && ` · ${flashcardCount} cards`}{outputFormat === 'test' && ` · ${testType}`}{outputFormat === 'code_solution' && ` · ${codeLanguage}`}</span>
                          <span className="sm:hidden">Options</span>
                          <ChevronDown size={11} className="text-neutral-600" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/95 backdrop-blur-2xl border-white/10 text-white w-[270px] p-4 rounded-[1.25rem] shadow-[0_10px_50px_-10px_rgba(0,0,0,1)] z-50">
                          <div className="mb-4">
                            <div className="flex items-center gap-1.5 mb-2.5"><IconRobot size={12} className="text-purple-500" /><span className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Language</span></div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {LANGUAGES.map(l => {
                                const isPowerLang = POWER_LANGUAGES.has(l);
                                const hasPowerAccess = hasPremiumAccess && userPlanId === 'power';
                                const isSelected = outputLanguage === l;
                                return (
                                  <div
                                    key={l}
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
                                      "relative text-[10px] text-center py-2 rounded-lg cursor-pointer font-bold transition-all border flex items-center justify-center gap-0.5",
                                      isSelected
                                        ? "bg-white text-black border-white"
                                        : isPowerLang
                                        ? "bg-purple-950/40 border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-white"
                                        : "bg-neutral-900/80 border-white/5 hover:border-white/20 text-neutral-500 hover:text-white"
                                    )}
                                  >
                                    {l}
                                    {isPowerLang && (
                                      <Zap size={8} className={cn("shrink-0", isSelected ? "text-black fill-black" : "text-purple-400 fill-purple-400")} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className={(outputFormat === 'flashcards' || outputFormat === 'test') ? "mb-4" : ""}>
                            <div className="flex items-center gap-1.5 mb-2.5"><IconSparkles size={12} className="text-yellow-500" /><span className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Detail Depth</span></div>
                            <div className="flex gap-1.5">
                              {DETAIL_LEVELS.map(l => (
                                <div key={l} onClick={() => setDetailLevel(l)} className={cn("flex-1 text-[10px] text-center py-2 rounded-lg cursor-pointer font-bold transition-all border", detailLevel === l ? "bg-white text-black border-white" : "bg-neutral-900/80 border-white/5 hover:border-white/20 text-neutral-500 hover:text-white")}>{l}</div>
                              ))}
                            </div>
                          </div>

                          {outputFormat === 'flashcards' && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-2.5"><IconBrain size={12} className="text-purple-500" /><span className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Card Count</span></div>
                              <div className="flex items-center gap-1.5">
                                <input type="number" min="1" max={hasPremiumAccess ? 30 : 5} value={flashcardCount}
                                  onChange={(e) => { let val = parseInt(e.target.value); if(isNaN(val)) val = 1; if (!hasPremiumAccess && val>5) val=5; if (hasPremiumAccess && val>30) val=30; setFlashcardCount(val); }}
                                  className="w-16 bg-neutral-900/80 border border-white/5 focus:border-purple-500/50 rounded-lg text-center text-white py-1.5 text-[11px] font-bold outline-none transition-all shrink-0"
                                />
                                <div className="flex flex-1 gap-1.5">
                                  {hasPremiumAccess ? (
                                    <>
                                      {[10, 20, 30].map(n => (
                                        <div key={n} onClick={() => setFlashcardCount(n)} className={cn("flex-1 text-[10px] text-center py-1.5 rounded-lg cursor-pointer font-bold transition-all border", flashcardCount === n ? "bg-purple-500 border-purple-400 text-white" : "bg-neutral-900/80 border-white/5 hover:border-white/20 text-neutral-500 hover:text-white")}>{n}</div>
                                      ))}
                                    </>
                                  ) : (
                                    <div className="flex-1 text-[10px] flex items-center justify-center py-1.5 rounded-lg font-bold border bg-neutral-900/40 border-white/5 text-neutral-600">Max 5 (Free)</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {outputFormat === 'test' && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-2.5"><CheckSquare size={12} className="text-blue-500" /><span className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Test Format</span></div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {TEST_TYPES.map(t => {
                                  const isLocked = t.isPremium && !hasPremiumAccess;
                                  return (
                                    <div 
                                      key={t.id} 
                                      onClick={() => {
                                        if (isLocked) { 
                                          const token = localStorage.getItem('authToken'); 
                                          if (!token) { setShowLoginModal(true); return; } 
                                          setPremiumFeatureName(t.label);
                                          setShowPremiumModal(true); 
                                          return; 
                                        }
                                        setTestType(t.id);
                                      }} 
                                      className={cn("relative flex items-center justify-center text-[10px] text-center py-2 px-1 rounded-lg cursor-pointer font-bold transition-all border", testType === t.id ? "bg-white text-black border-white" : "bg-neutral-900/80 border-white/5 hover:border-white/20 text-neutral-500 hover:text-white", isLocked && "opacity-75")}
                                    >
                                      {t.label}
                                      {isLocked && <span className="absolute top-1 right-1 text-[7px] text-yellow-500 font-bold bg-yellow-500/10 px-1 rounded uppercase tracking-wider">Pro</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {outputFormat === 'code_solution' && (
                            <div className="mt-1 pt-4 border-t border-white/5">
                              <div className="flex items-center gap-1.5 mb-2.5"><Code size={12} className="text-blue-400" /><span className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Code Language</span></div>
                              <div className="grid grid-cols-3 gap-1.5">
                                {['C++', 'Python', 'Java', 'JavaScript', 'Go', 'Rust'].map(l => {
                                  const isLocked = !hasPremiumAccess && l !== 'C++';
                                  return (
                                    <div
                                      key={l}
                                      onClick={() => {
                                        if (isLocked) {
                                          setPremiumFeatureName(`${l} Code Support`);
                                          setShowPremiumModal(true);
                                          return;
                                        }
                                        setCodeLanguage(l);
                                      }}
                                      className={cn(
                                        "relative text-[10px] text-center py-2 rounded-lg cursor-pointer font-bold transition-all border font-mono",
                                        codeLanguage === l && !isLocked ? "bg-blue-500 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]" :
                                        isLocked ? "bg-neutral-900/50 border-white/5 text-neutral-700 cursor-not-allowed" :
                                        "bg-neutral-900/80 border-white/5 hover:border-white/20 text-neutral-500 hover:text-white"
                                      )}
                                    >
                                      {l}
                                      {isLocked && <span className="absolute -top-1 -right-1 text-[7px] text-yellow-500 font-black bg-yellow-500/10 border border-yellow-500/20 px-1 rounded uppercase tracking-wider">Pro</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Generate Button */}
                    <button 
                      onClick={handleGenerateClick}
                      disabled={!isValidUrl || loading || isGenerating}
                      className={cn(
                        "w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 h-11 sm:h-10 px-5 rounded-xl font-bold text-[13px] sm:text-xs uppercase tracking-widest transition-all duration-300",
                        isValidUrl 
                          ? "bg-white text-black hover:bg-neutral-100 shadow-[0_0_25px_rgba(255,255,255,0.15)] active:scale-95 active:shadow-none" 
                          : "bg-white/5 text-neutral-600 cursor-not-allowed border border-white/5"
                      )}
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
                      <span>Generate</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* === SAMPLE NOTES SECTION === */}
              {activeCategory === 'youtube' && outputFormat === 'notes' && (
                <div className="w-full max-w-3xl mt-4">
                  <div className="flex items-center gap-2 mb-3 px-0.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">Sample Notes</span>
                    <span className="text-neutral-700 text-[10px] select-none">·</span>
                    <span className="text-[9px] text-neutral-600 truncate">click to explore, no sign-in</span>
                    <span className="ml-auto text-[8px] text-neutral-700 hidden sm:block shrink-0">swipe →</span>
                  </div>
                  <div
                    className="flex gap-2 overflow-x-auto snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '2px' }}
                  >
                    {[
                      { slug: 'notes-supply-and-demand-g9adizjpds', videoId: 'g9aDizJpd_s', title: 'Supply & Demand', sub: 'CrashCourse', category: '📈 Econ', border: 'hover:border-amber-500/30', glow: 'hover:shadow-[0_0_16px_rgba(251,191,36,0.08)]', pill: 'bg-amber-500/10 text-amber-400 border-amber-500/25', cta: 'text-amber-400' },
                      { slug: 'notes-stanford-cs229-ml-jgwo_ugts7i', videoId: 'jGwO_UgTS7I', title: 'Neural Networks', sub: 'Stanford CS229', category: '🤖 AI/ML', border: 'hover:border-violet-500/30', glow: 'hover:shadow-[0_0_16px_rgba(167,139,250,0.08)]', pill: 'bg-violet-500/10 text-violet-400 border-violet-500/25', cta: 'text-violet-400' },
                      { slug: 'notes-biology-cell-structure-urujd5nexc8', videoId: 'URUJD5NEXC8', title: 'Cell Structure', sub: 'Biology', category: '🔬 Bio', border: 'hover:border-emerald-500/30', glow: 'hover:shadow-[0_0_16px_rgba(52,211,153,0.08)]', pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', cta: 'text-emerald-400' },
                      { slug: 'notes-something-finally-broke-between-us-and-europe-wydd0rf66de', videoId: 'WYDD0RF66DE', title: 'US-Europe Rift', sub: 'CSIS Analysis', category: '🌍 Geo', border: 'hover:border-sky-500/30', glow: 'hover:shadow-[0_0_16px_rgba(56,189,248,0.08)]', pill: 'bg-sky-500/10 text-sky-400 border-sky-500/25', cta: 'text-sky-400' },
                      { slug: 'notes-mit-804-quantum-physics-lz3bpuko5zc', videoId: 'lZ3bPUKo5zc', title: 'Quantum Physics', sub: 'MIT 8.04', category: '⚛️ Physics', border: 'hover:border-pink-500/30', glow: 'hover:shadow-[0_0_16px_rgba(236,72,153,0.08)]', pill: 'bg-pink-500/10 text-pink-400 border-pink-500/25', cta: 'text-pink-400' },
                    ].map((item) => (
                      <div
                        key={item.slug}
                        onClick={() => router.push(`/notes/${item.slug}`)}
                        className={cn(
                          "group relative flex-shrink-0 snap-start overflow-hidden rounded-xl border border-white/[0.07] bg-neutral-900/50 cursor-pointer transition-all duration-300",
                          item.border, item.glow
                        )}
                        style={{ width: '148px' }}
                      >
                        <div className="relative overflow-hidden" style={{ height: '78px' }}>
                          <img
                            src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                            alt={item.title}
                            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900/85" />
                          <span className={cn("absolute bottom-1.5 left-1.5 text-[7px] font-black px-1.5 py-[2px] rounded border backdrop-blur-sm tracking-wide", item.pill)}>
                            {item.category}
                          </span>
                          <span className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm rounded p-[3px]">
                            <IconBrandYoutube size={7} className="text-red-400" />
                          </span>
                        </div>
                        <div className="px-2.5 py-2 flex flex-col gap-0.5">
                          <p className="text-[11px] font-bold text-neutral-100 leading-snug group-hover:text-white transition-colors truncate">
                            {item.title}
                          </p>
                          <p className="text-[8px] text-neutral-600 truncate">{item.sub}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[7px] text-neutral-700">5 min</span>
                            <span className={cn("text-[7px] font-extrabold flex items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity", item.cta)}>
                              Open <ArrowRight size={7} className="group-hover:translate-x-0.5 transition-transform" />
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
            /* ================= LOADING STATE ================= */
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full max-w-4xl mx-auto flex flex-col justify-center min-h-[70vh] py-6 z-10"
            >
              {/* Sleek Top Progress & Header */}
              <div className="w-full max-w-3xl mx-auto mb-8 text-center space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
                  <span className="flex items-center gap-1.5 tracking-widest font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    SYNTHESIZING KNOWLEDGE ENGINE
                  </span>
                  <span className="font-bold text-white tracking-widest">{Math.floor(progressPercent)}% COMPLETE</span>
                </div>
                
                {/* Glowing Progress bar */}
                <div className="h-2.5 w-full bg-white/[0.03] border border-white/[0.07] rounded-full overflow-hidden p-[2px] backdrop-blur-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ ease: "easeOut", duration: 0.1 }}
                  />
                </div>
                
                {/* Sub-status action ticker */}
                <div className="min-h-[16px] flex items-center justify-center text-[10px] font-mono text-neutral-500 tracking-wider">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={Math.floor(progressPercent / 5)} 
                      initial={{ opacity: 0, y: 3 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                      <span>{getSubStatus(currentStep, progressPercent)}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Main Panel Content: Left Thumbnail & Right Stepper */}
              <div className="w-full flex flex-col md:flex-row items-center md:items-stretch justify-center gap-8 md:gap-12">
                
                {/* Left: Card — Paperxify logo for code, thumbnail for videos */}
                <div className="relative w-full md:w-[480px] aspect-video">
                  <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-full opacity-50 transform-gpu"></div>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl z-10 bg-neutral-950 flex flex-col items-center justify-center"
                  >
                    {/* Grid line background overlay for high-tech aesthetic */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10 opacity-70" />

                    {/* Holographic scanner effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                      <motion.div 
                        className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] opacity-80"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ position: 'absolute' }}
                      />
                    </div>

                    {/* Active audio visualizer animation */}
                    <div className="absolute top-4 right-4 flex items-end gap-0.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 z-20">
                      <span className="text-[8px] font-mono text-neutral-400 mr-1.5 tracking-widest">PARSING SIGNAL</span>
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <motion.div 
                          key={bar} 
                          className="w-[2px] bg-blue-400 rounded-full"
                          animate={{ height: [4, 14, 4] }}
                          transition={{ duration: 0.5 + bar * 0.12, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ))}
                    </div>

                    {outputFormat === 'code_solution' ? (
                      /* ── Animated Paperxify Code Logo Panel ── */
                      <>
                        {/* Ambient glow layers */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-500/5 to-purple-600/10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                        
                        {/* Logo + name */}
                        <div className="relative z-10 flex flex-col items-center gap-5">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity:[0.85,1,0.85] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                          >
                            {/* Outer ring */}
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              className="absolute -inset-4 rounded-full border border-dashed border-blue-500/30"
                            />
                            {/* Inner ring */}
                            <motion.div
                              animate={{ rotate: -360 }}
                              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                              className="absolute -inset-2 rounded-full border border-blue-400/20"
                            />
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.25)] border border-white/10">
                              <img src="/paperxify.jpeg" alt="Paperxify" className="w-full h-full object-cover" />
                            </div>
                          </motion.div>

                          <div className="text-center">
                            <p className="text-white font-black text-lg tracking-tight">Paperxify</p>
                            <p className="text-neutral-500 text-[11px] font-mono uppercase tracking-widest mt-0.5">Neural Code Engine</p>
                          </div>
                        </div>

                        {/* Bottom info */}
                        <div className="absolute bottom-0 left-0 right-0 p-7 z-20">
                          <h2 className="text-white font-bold text-base leading-snug line-clamp-2">
                            {videoInfo?.title || "Generating Code Solution…"}
                          </h2>
                        </div>
                      </>
                    ) : (
                      /* ── YouTube Thumbnail ── */
                      <>
                        <img 
                          src={videoInfo?.thumbnail || "https://img.youtube.com/vi/placeholder/maxresdefault.jpg"} 
                          className="w-full h-full object-cover opacity-40 scale-105 absolute inset-0"
                          alt="Processing Video"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                          <h2 className="text-lg font-bold text-white line-clamp-2 leading-snug tracking-tight">
                            {videoInfo?.title || "Parsing Video Data..."}
                          </h2>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>


                {/* Right: Minimal Vertical Stepper */}
                <div className="w-full md:w-80 flex flex-col justify-center space-y-4 md:space-y-5 z-10 px-2 sm:px-0">
                   {(outputFormat === 'flashcards' ? FLASHCARDS_LOADING_STEPS : outputFormat === 'code_solution' ? CODE_LOADING_STEPS : NOTES_LOADING_STEPS).map((step, idx, arr) => {
                      const isCompleted = currentStep > idx;
                      const isActive = currentStep === idx;

                      return (
                        <div key={step.id} className="relative flex items-start gap-4 group">
                          
                          {/* Connecting Line */}
                          {idx !== arr.length - 1 && (
                            <div className={cn(
                              "absolute left-[15px] top-8 w-[2px] h-7 sm:h-8 transition-colors duration-500",
                              isCompleted ? "bg-gradient-to-b from-white to-white/20" : "bg-white/5"
                            )}></div>
                          )}

                          {/* Icon/Status Bubble */}
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0",
                            isCompleted ? "bg-white text-black border-white" : 
                            isActive ? "bg-black text-white border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : 
                            "bg-black text-neutral-700 border-neutral-800"
                          )}>
                             {isCompleted ? <IconCheck size={14} strokeWidth={3} /> : <step.icon size={13} />}
                          </div>

                          {/* Text */}
                          <div className="flex flex-col min-w-0 pt-0.5">
                             <span className={cn(
                               "text-xs font-bold transition-colors duration-500 truncate",
                               isCompleted || isActive ? "text-white" : "text-neutral-600"
                             )}>
                               {step.label}
                             </span>
                             
                             {/* Slide-open step details for psychological engagement */}
                             <AnimatePresence initial={false}>
                               {isActive && (
                                 <motion.p
                                   initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                   animate={{ height: "auto", opacity: 0.6, marginTop: 2 }}
                                   exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                   transition={{ duration: 0.3 }}
                                   className="text-[9px] text-neutral-400 leading-relaxed font-mono tracking-tight"
                                 >
                                   {step.desc}
                                 </motion.p>
                               )}
                             </AnimatePresence>
                          </div>
                        </div>
                      );
                   })}
                </div>
              </div>

              {/* Bottom: Study science trivia / tips card */}
              <div className="w-full max-w-3xl mx-auto mt-10 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Brain/Lightbulb Icon Column */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <motion.div 
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <IconBrain className="w-6 h-6 text-indigo-400" />
                  </motion.div>
                </div>
                
                {/* Content Column with Slide/Fade Transition */}
                <div className="flex-1 min-w-0 text-center sm:text-left z-10">
                  <div className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-[0.25em] text-indigo-400 mb-1">
                    Study Science & Trivia
                  </div>
                  <div className="min-h-[40px] flex items-center justify-center sm:justify-start">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeTipIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-0.5"
                      >
                        <h4 className="text-xs font-bold text-white tracking-wide">
                          {TRIVIA_TIPS[activeTipIndex].title}
                        </h4>
                        <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                          {TRIVIA_TIPS[activeTipIndex].text}
                        </p>
                      </motion.div>
                    </AnimatePresence>
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
