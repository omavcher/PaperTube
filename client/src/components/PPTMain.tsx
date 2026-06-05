"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '@/config/api';
import { 
  IconRobot, 
  IconSettings,
  IconSparkles,
  IconBrain,
  IconFileText,
  IconCheck
} from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import { 
  Loader2, ChevronDown, ArrowRight, Coins, AlertTriangle, X, Zap, 
  Code, Users, Search, Lock, Check, LayoutGrid, Trash2, Plus,
  Presentation, Globe, Layers, Laptop, Sparkle, Crown, ArrowLeft
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
import { toast } from 'sonner';

const LANGUAGES = ["English", "German", "Spanish", "French", "Japanese", "Arabic"];
const POWER_LANGUAGES = new Set(["German", "Spanish", "French", "Japanese", "Arabic"]);

const AI_MODELS = [
  { id: "flash",   name: "Flash",   accessTier: "Free",  endpoint: "free",    desc: "Fast & lightweight for everyday slides",       color: "orange", hex: "#f97316" },
  { id: "canvas",  name: "Canvas",  accessTier: "Pro",   endpoint: "premium", desc: "Rich formatting with high visual impact",       color: "violet", hex: "#a78bfa" },
  { id: "scholar", name: "Scholar", accessTier: "Pro",   endpoint: "premium", desc: "Academic-grade research & deep outlines",       color: "emerald",hex: "#34d399" },
  { id: "atlas",   name: "Atlas",   accessTier: "Power", endpoint: "premium", desc: "Max-context slide layouts and speaker scripts",color: "amber",  hex: "#fbbf24" },
];

const SLIDE_CARDS = [
  { count: 10, label: "10 Slides", tier: "Free", desc: "Sleek basic outlines", color: "orange", hex: "#f97316" },
  { count: 15, label: "15 Slides", tier: "Pro", desc: "Expanded detailed decks", color: "violet", hex: "#a78bfa" },
  { count: 25, label: "25 Slides", tier: "Pro", desc: "Full lecture presentations", color: "emerald", hex: "#34d399" },
  { count: 40, label: "40 Slides", tier: "Power", desc: "Textbook-grade master decks", color: "amber", hex: "#fbbf24" },
];

const THEMES = [
  // Free themes
  { id: "sunset-orange", name: "Sunset Orange", primary: "#f97316", accent: "#fbbf24", bg: "#0f0b07", font: "Outfit", isPremium: false },
  { id: "midnight-tech", name: "Midnight Tech", primary: "#d83b01", accent: "#3b82f6", bg: "#050505", font: "Outfit", isPremium: false },
  { id: "classic-slate", name: "Classic Slate", primary: "#4b5563", accent: "#9ca3af", bg: "#0f172a", font: "Inter", isPremium: false },
  { id: "ocean-breeze", name: "Ocean Breeze", primary: "#0ea5e9", accent: "#38bdf8", bg: "#030c14", font: "Inter", isPremium: false },
  { id: "minimal-snow", name: "Minimal Snow", primary: "#ffffff", accent: "#a3a3a3", bg: "#121212", font: "Outfit", isPremium: false },
  
  // Premium themes
  { id: "emerald-forest", name: "Emerald Forest", primary: "#10b981", accent: "#34d399", bg: "#02120e", font: "Georgia", isPremium: true },
  { id: "vintage-gold", name: "Vintage Gold", primary: "#fbbf24", accent: "#d97706", bg: "#17140f", font: "Georgia", isPremium: true },
  { id: "cyberpunk", name: "Cyberpunk Glow", primary: "#d946ef", accent: "#f43f5e", bg: "#0d0312", font: "Courier New", isPremium: true },
  { id: "royal-velvet", name: "Royal Velvet", primary: "#8b5cf6", accent: "#a78bfa", bg: "#0a0314", font: "Georgia", isPremium: true },
  { id: "carbon-coder", name: "Carbon Coder", primary: "#22c55e", accent: "#4ade80", bg: "#0a0f0a", font: "Courier New", isPremium: true },
  { id: "sakura-bloom", name: "Sakura Bloom", primary: "#f472b6", accent: "#fbcfe8", bg: "#14070e", font: "Inter", isPremium: true },
  { id: "warm-clay", name: "Warm Clay", primary: "#ea580c", accent: "#ff7849", bg: "#140a05", font: "Georgia", isPremium: true },
  { id: "lavender-dream", name: "Lavender Dream", primary: "#a855f7", accent: "#c084fc", bg: "#0f0714", font: "Outfit", isPremium: true },
  { id: "nordic-frost", name: "Nordic Frost", primary: "#38bdf8", accent: "#7dd3fc", bg: "#06131a", font: "Inter", isPremium: true },
  { id: "bronze-metal", name: "Bronze Metal", primary: "#b45309", accent: "#f59e0b", bg: "#140e05", font: "Georgia", isPremium: true },
  { id: "royal-gold", name: "Royal Gold", primary: "#fbbf24", accent: "#1e3a8a", bg: "#030814", font: "Georgia", isPremium: true },
  { id: "mint-fresh", name: "Mint Fresh", primary: "#2dd4bf", accent: "#5eead4", bg: "#031411", font: "Outfit", isPremium: true },
  { id: "nebula-space", name: "Nebula Space", primary: "#ec4899", accent: "#3b82f6", bg: "#05030f", font: "Outfit", isPremium: true },
  { id: "desert-sand", name: "Desert Sand", primary: "#f59e0b", accent: "#d97706", bg: "#140e05", font: "Outfit", isPremium: true },
  { id: "dark-matter", name: "Dark Matter", primary: "#ffffff", accent: "#f97316", bg: "#020205", font: "Inter", isPremium: true }
];

const PPT_LOADING_STEPS = [
  { id: 0, label: "Input Validation", icon: Check, desc: "Verify input topic, slide criteria, and usage permissions" },
  { id: 1, label: "Concept Mapping", icon: Layers, desc: "Analyzing topic themes and mapping key presentation objectives" },
  { id: 2, label: "Outline Structuring", icon: LayoutGrid, desc: "Creating slide-by-slide structure, titles, and layout maps" },
  { id: 3, label: "Drafting Content", icon: IconFileText, desc: "Synthesizing bullet points, statistics, and main text for slides" },
  { id: 4, label: "Visual Design Styling", icon: Presentation, desc: "Injecting PowerPoint layout themes and visual hierarchies" },
  { id: 5, label: "Generating Speaker Notes", icon: IconBrain, desc: "Drafting descriptive presenter transcripts for each slide" },
  { id: 6, label: "Compiling Slide Deck", icon: IconSettings, desc: "Generating final PPTX schema structure and rendering layouts" },
  { id: 7, label: "Opening Presentation Workspace", icon: ArrowRight, desc: "Initializing your interactive PowerPoint editor workspace..." }
];

const TRIVIA_TIPS = [
  {
    title: "🍊 Design for Contrast",
    text: "PPT official design emphasizes high contrast layouts. Light text on dark backgrounds is ideal for screens."
  },
  {
    title: "⚡ The 10-20-30 Rule",
    text: "Guy Kawasaki advises: 10 slides, 20 minutes presentation length, and 30-point minimum font size."
  },
  {
    title: "🧠 Cognitive Load Theory",
    text: "Avoid overwhelming viewers. Keep it to one core message and a maximum of 4 bullet points per slide."
  },
  {
    title: "🎯 Visual Anchor",
    text: "Placing a key visual or statistic on the right draws the eye naturally and makes slides twice as memorable."
  },
  {
    title: "⌛ Presenter Speaker Notes",
    text: "Your slides should outline the talk, while your presenter notes supply context. Don't read your slides!"
  }
];

const getSubStatus = (step: number, progress: number): string => {
  const stepMessages: Record<number, string[]> = {
    0: [
      "Checking presentation request parameters...",
      "Validating input topic guidelines...",
      "Verifying user tier slide authorizations..."
    ],
    1: [
      "Deconstructing topic query...",
      "Identifying subtopics & academic themes...",
      "Structuring core informational slides..."
    ],
    2: [
      "Designing title slide and agenda...",
      "Mapping sections and subtopics...",
      "Dividing presentation narrative flow..."
    ],
    3: [
      "Drafting key takeaways for slide bullets...",
      "Adding statistics and definitions...",
      "Refining explanations for clarity..."
    ],
    4: [
      "Selecting PPT brand theme configurations...",
      "Injecting orange presentation accent accents...",
      "Aligning layouts for optimal screen readability..."
    ],
    5: [
      "Drafting spoken outlines for each slide...",
      "Adding audience prompts and questions...",
      "Perfecting presenter pacing directions..."
    ],
    6: [
      "Formatting JSON slides metadata...",
      "Writing slide content structure to database...",
      "Creating PPTX slide structure files..."
    ],
    7: [
      "Launching Presentation Viewer...",
      "Loading presentation slides canvas...",
      "Redirecting to presentation workspace..."
    ]
  };

  const msgs = stepMessages[step] || ["Generating slide deck..."];
  const idx = Math.floor(progress / 5) % msgs.length;
  return msgs[idx];
};

export default function PPTMain() {
  const router = useRouter();

  // Inputs & Selections
  const [sourceInput, setSourceInput] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedCard, setSelectedCard] = useState(SLIDE_CARDS[0]); // Default 10 slides
  const [outputLanguage, setOutputLanguage] = useState('English');

  // New Outline customizer workflow states
  const [isOutlinePlanned, setIsOutlinePlanned] = useState(false);
  const [outlineSlides, setOutlineSlides] = useState<{ title: string; desc: string }[]>([]);
  const [textDensity, setTextDensity] = useState<'minimal' | 'concise' | 'detailed'>('minimal');
  const [visualsEnabled, setVisualsEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  // Loading & Generation States
  const [isOutlinePlanning, setIsOutlinePlanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const currentStepRef = React.useRef(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [apiResult, setApiResult] = useState<any>(null);

  // User Authentication & Plan States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [userPlanId, setUserPlanId] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<number | null>(null);

  // Modals
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const [tokenErrorData, setTokenErrorData] = useState<any>(null);

  // Check login & tier on mount
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
          console.error("Failed to fetch user tokens:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const isValidInput = useMemo(() => {
    return sourceInput.trim().length >= 5;
  }, [sourceInput]);

  // Stepper & Progress simulation
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setApiResult(null);
      return;
    }

    const t0 = setTimeout(() => setCurrentStep(1), 800);
    const t1 = setTimeout(() => setCurrentStep(2), 2200);
    const t2 = setTimeout(() => setCurrentStep(3), 4000);
    const t3 = setTimeout(() => setCurrentStep(4), 5800);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      setProgressPercent(0);
      return;
    }

    let target = 0;
    switch (currentStep) {
      case 0: target = 10; break;
      case 1: target = 22; break;
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
          if (prev < 98 && currentStep < 7) return prev + 0.1;
          return prev;
        }
        const stepAmt = 0.4 + Math.random() * 1.2;
        return Math.min(target, prev + stepAmt);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, currentStep]);

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

  // Handle successful slide generation and redirect
  useEffect(() => {
    if (!isGenerating || !apiResult) return;

    let checkInterval: NodeJS.Timeout;
    let t6: NodeJS.Timeout;
    let t7: NodeJS.Timeout;
    let tRedirect: NodeJS.Timeout;

    const checkAndAdvance = () => {
      if (currentStepRef.current < 4) return;
      clearInterval(checkInterval);

      setCurrentStep(5);

      t6 = setTimeout(() => {
        setCurrentStep(6);
        if (!hasPremiumAccess && userTokens !== null) {
          const deduct = apiResult.tokensDeducted || 5;
          setUserTokens(prev => Math.max(0, (prev || 0) - deduct));
        }
      }, 1500);

      t7 = setTimeout(() => {
        setCurrentStep(7);
      }, 2700);

      tRedirect = setTimeout(() => {
        router.push(`/presentation-generator/${apiResult.slug || 'demo-presentation'}`);
      }, 3900);
    };

    checkInterval = setInterval(checkAndAdvance, 100);
    return () => {
      clearInterval(checkInterval);
      if (t6) clearTimeout(t6);
      if (t7) clearTimeout(t7);
      if (tRedirect) clearTimeout(tRedirect);
    };
  }, [isGenerating, apiResult, router, hasPremiumAccess, userTokens]);

  const handlePlanOutline = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    // Gated Checks:
    if (selectedCard.tier === "Pro" && !hasPremiumAccess) {
      setPremiumFeatureName(selectedCard.label);
      setShowPremiumModal(true);
      return;
    }
    if (selectedCard.tier === "Power" && (!hasPremiumAccess || userPlanId !== "power")) {
      setPremiumFeatureName(selectedCard.label);
      setShowPremiumModal(true);
      return;
    }
    if (selectedModel.accessTier === "Pro" && !hasPremiumAccess) {
      setPremiumFeatureName(`${selectedModel.name} Engine`);
      setShowPremiumModal(true);
      return;
    }
    if (selectedModel.accessTier === "Power" && (!hasPremiumAccess || userPlanId !== "power")) {
      setPremiumFeatureName(`${selectedModel.name} Engine`);
      setShowPremiumModal(true);
      return;
    }
    if (POWER_LANGUAGES.has(outputLanguage) && (!hasPremiumAccess || userPlanId !== "power")) {
      setPremiumFeatureName(`${outputLanguage} Language`);
      setShowPremiumModal(true);
      return;
    }

    setIsOutlinePlanning(true);

    try {
      const response = await api.post('/presentation/generate-outline', {
        sourceInput,
        slideCount: selectedCard.count,
        language: outputLanguage,
        prompt
      }, { headers: { 'Auth': authToken } });

      if (response.data?.success) {
        setOutlineSlides(response.data.data.slides);
        setIsOutlinePlanned(true);
      } else {
        toast.error("Failed to generate outline structural plan.");
      }
    } catch (err: any) {
      console.warn("Backend presentation API fail, creating mock outline cards.");
      // Fallback outline mock cards
      const mockOutline = Array.from({ length: selectedCard.count }).map((_, i) => ({
        title: i === 0 ? `Introduction to ${sourceInput}` : i === selectedCard.count - 1 ? "Conclusion & Summary" : `Key Area ${i}: Topic Analysis`,
        desc: `Brief overview describing conceptual slide content detail ${i + 1}.`
      }));
      setOutlineSlides(mockOutline);
      setIsOutlinePlanned(true);
    } finally {
      setIsOutlinePlanning(false);
    }
  };

  const handleUpdateOutlineCard = (index: number, newTitle: string) => {
    const updated = [...outlineSlides];
    updated[index].title = newTitle;
    setOutlineSlides(updated);
  };

  const handleDeleteOutlineCard = (index: number) => {
    if (outlineSlides.length <= 3) {
      toast.error("A presentation requires at least 3 slides.");
      return;
    }
    const updated = outlineSlides.filter((_, idx) => idx !== index);
    setOutlineSlides(updated);
  };

  const handleAddOutlineCard = () => {
    setOutlineSlides([...outlineSlides, {
      title: "New Custom Slide Topic",
      desc: "Add specific contents and elements."
    }]);
  };

  const handleGenerateFinal = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    // Gated Checks:
    if (textDensity !== 'minimal' && !hasPremiumAccess) {
      setPremiumFeatureName(`${textDensity.toUpperCase()} Text Density`);
      setShowPremiumModal(true);
      return;
    }
    if (selectedTheme.isPremium && !hasPremiumAccess) {
      setPremiumFeatureName(`Premium Theme: ${selectedTheme.name}`);
      setShowPremiumModal(true);
      return;
    }

    setIsGenerating(true);
    setTokenErrorData(null);

    try {
      const payload = {
        title: sourceInput,
        outline: outlineSlides,
        theme: selectedTheme.id,
        textDensity,
        visuals: visualsEnabled,
        language: outputLanguage,
        model: selectedModel.id,
        prompt
      };

      const response = await api.post('/presentation/generate-final', payload, { headers: { 'Auth': authToken } });
      if (response.data?.success) {
        setApiResult(response.data.data);
      } else {
        throw new Error("Final slide deck synthesis failed");
      }
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.code === "INSUFFICIENT_TOKENS") {
        setIsGenerating(false);
        setTokenErrorData(errData);
      } else if (errData?.code === "DAILY_LIMIT_EXCEEDED" || err.response?.status === 403) {
        setIsGenerating(false);
        setShowPaywall(true);
      } else {
        console.warn("Backend slide deck compiler failed, generating local fallback redirect.");
        setTimeout(() => {
          setApiResult({
            success: true,
            slug: `ppt-${Math.random().toString(36).substring(2, 9)}`,
            title: sourceInput,
            slideCount: outlineSlides.length,
            tokensDeducted: 5
          });
        }, 3000);
      }
    }
  };

  const handleHorizontalScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <section className="w-full min-h-screen relative flex flex-col items-center justify-center bg-black text-white px-4 py-10 font-sans selection:bg-orange-900/50 overflow-hidden">
      
      {/* Auth Modals */}
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to generate presentations"
      />
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={premiumFeatureName}
      />
      <SubscriptionDialog open={showPaywall} onOpenChange={setShowPaywall} />

      {/* Insufficient Tokens Modal */}
      <AnimatePresence>
        {tokenErrorData && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div onClick={() => setTokenErrorData(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl z-10"
            >
              <button onClick={() => setTokenErrorData(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Insufficient Tokens</h3>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">{tokenErrorData.message}</p>
              
              <div className="flex items-center justify-between p-4 bg-black/50 rounded-2xl border border-white/5 mb-6">
                <div className="text-center w-full">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Required</p>
                  <p className="text-xl font-mono font-bold text-white">{tokenErrorData.requiredTokens}</p>
                </div>
                <div className="w-px h-10 bg-white/10 shrink-0" />
                <div className="text-center w-full">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Available</p>
                  <p className="text-xl font-mono font-bold text-orange-500">{tokenErrorData.currentTokens}</p>
                </div>
              </div>

              {tokenErrorData.canPurchase && (
                <Link href="/pricing" onClick={() => setTokenErrorData(null)} className="w-full h-12 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all">
                  Acquire Tokens <ArrowRight size={14} />
                </Link>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          
          {isGenerating ? (
            /* ================= COMPILING SLIDES STATE ================= */
            <motion.div 
              key="loading-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl mx-auto rounded-[2rem] bg-[#0c0c0c] border border-white/[0.08] p-6 sm:p-10 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-t-[2rem]" style={{ width: `${progressPercent}%`, transition: 'width 0.1s linear' }} />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                
                {/* Stepper Steps (Left Pane) */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Presentation className="text-orange-500 animate-pulse" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-tight">AI PPT Generator Engine</h2>
                      <p className="text-[10px] text-neutral-500 font-mono">Progress: {Math.round(progressPercent)}% &middot; Stage {currentStep + 1} of 8</p>
                    </div>
                  </div>

                  {/* Step list */}
                  <div className="space-y-3.5 pt-4 border-t border-white/[0.04]">
                    {PPT_LOADING_STEPS.map((step) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;

                      return (
                        <div key={step.id} className="flex gap-3 items-start">
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <div className="w-5 h-5 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-[0_0_8px_rgba(249,115,22,0.3)]">
                                <Check size={11} strokeWidth={3} />
                              </div>
                            ) : isActive ? (
                              <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500 text-orange-500 flex items-center justify-center animate-spin">
                                <Loader2 size={10} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-[9px] font-mono text-neutral-600">
                                {step.id + 1}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-xs font-bold transition-colors", isActive ? "text-orange-400" : isCompleted ? "text-neutral-400" : "text-neutral-600")}>
                              {step.label}
                            </p>
                            {isActive && (
                              <motion.p initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-neutral-500 mt-0.5 leading-normal">
                                {getSubStatus(currentStep, progressPercent)}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trivia Box (Right Pane) */}
                <div className="md:col-span-5 flex flex-col justify-between p-6 bg-white/[0.01] border border-white/[0.05] rounded-2xl">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500 block mb-3">Slide Design Insights</span>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTipIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <h4 className="text-xs font-black text-orange-400 tracking-wide">{TRIVIA_TIPS[activeTipIndex].title}</h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed font-light">{TRIVIA_TIPS[activeTipIndex].text}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/[0.04]">
                    <div className="flex justify-between items-center text-[9px] font-mono text-neutral-600">
                      <span>Paperxify Presentation Tooling</span>
                      <span>v1.2</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : isOutlinePlanned ? (
            /* ================= OUTLINE CUSTOMIZER WORKSPACE SCREEN ================= */
            <motion.div
              key="outline-customizer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* LEFT CONFIGURATION PANEL (5 columns) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Back Link */}
                <button 
                  onClick={() => setIsOutlinePlanned(false)}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={12} /> Edit Topic / Prompt
                </button>

                <div className="p-6 bg-[#0c0c0c] border border-white/[0.08] rounded-3xl space-y-6 shadow-xl">
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 border-b border-white/[0.05] pb-4">
                    <IconSettings className="text-orange-500" size={20} /> Design Canvas
                  </h2>

                  {/* 1. Text density selector */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Text density per card</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: 'minimal', label: 'Minimal', desc: 'Free plan', tier: 'Free' },
                        { id: 'concise', label: 'Concise', desc: 'Premium', tier: 'Pro' },
                        { id: 'detailed', label: 'Detailed', desc: 'Premium', tier: 'Pro' }
                      ] as const).map(density => {
                        const isSel = textDensity === density.id;
                        const isLocked = density.tier === "Pro" && !hasPremiumAccess;
                        return (
                          <div
                            key={density.id}
                            onClick={() => {
                              if (isLocked) {
                                setPremiumFeatureName(`${density.label} Text Density`);
                                setShowPremiumModal(true);
                                return;
                              }
                              setTextDensity(density.id);
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border text-center cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[64px]",
                              isLocked 
                                ? "opacity-40 border-white/[0.04] bg-white/[0.002]"
                                : isSel 
                                ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                                : "bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.02] text-neutral-400"
                            )}
                          >
                            <span className="font-bold text-[11px] block">{density.label}</span>
                            <span className="text-[8px] opacity-60 block mt-1">{density.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Visuals Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                    <div>
                      <span className="font-bold text-xs text-white block">Visual elements layout</span>
                      <span className="text-[9px] text-neutral-500 font-light mt-0.5 block">Inject comparison columns, metric counters, and key visuals.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={visualsEnabled} 
                        onChange={(e) => setVisualsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-black peer-checked:after:border-transparent" />
                    </label>
                  </div>

                  {/* 3. Theme Grid Preview Selector (20+ Themes) */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 flex justify-between">
                      <span>Themes Selector</span>
                      <span className="text-[9px] text-neutral-600 font-medium">({THEMES.length} styles)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
                      {THEMES.map(theme => {
                        const isSelected = selectedTheme.id === theme.id;
                        const isLocked = theme.isPremium && !hasPremiumAccess;

                        return (
                          <div
                            key={theme.id}
                            onClick={() => {
                              if (isLocked) {
                                setPremiumFeatureName(`Premium Theme: ${theme.name}`);
                                setShowPremiumModal(true);
                                return;
                              }
                              setSelectedTheme(theme);
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[70px]",
                              isSelected 
                                ? "border-orange-500/60 bg-orange-500/5 shadow-md"
                                : "bg-neutral-900/50 border-white/[0.06] hover:border-white/15"
                            )}
                            style={{ backgroundColor: isSelected ? undefined : theme.bg }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[10px] truncate max-w-[80px]" style={{ color: isSelected ? "#f97316" : "#ffffff" }}>
                                {theme.name}
                              </span>
                              {isLocked && <Lock size={10} className="text-amber-500 shrink-0" />}
                            </div>
                            
                            <div className="flex items-center gap-1.5 mt-2">
                              {/* Swatches */}
                              <div className="flex -space-x-1 shrink-0">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/50" style={{ backgroundColor: theme.primary }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/50" style={{ backgroundColor: theme.accent }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/50" style={{ backgroundColor: theme.bg }} />
                              </div>
                              {/* Font preview tag */}
                              <span className="text-[8px] font-mono text-neutral-500 truncate" style={{ fontFamily: theme.font }}>
                                {theme.font}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateFinal}
                    className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all bg-gradient-to-r from-orange-500 to-amber-600 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_28px_rgba(249,115,22,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Zap size={12} fill="currentColor" /> Generate Slide Deck
                  </button>
                </div>
              </div>

              {/* RIGHT OUTLINE CARDS LIST PANEL (7 columns) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-6 bg-[#0c0c0c] border border-white/[0.08] rounded-3xl space-y-5 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                    <div>
                      <h2 className="text-lg font-black text-white tracking-tight">Structured Outline Map</h2>
                      <p className="text-[10px] text-neutral-500 font-light mt-0.5">Customize your deck flow. Add, delete, or rename outline cards.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-neutral-900 border border-white/10 px-3 py-1 rounded-full text-orange-400">
                      {outlineSlides.length} Slide outline cards
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1.5 custom-scrollbar">
                    {outlineSlides.map((slide, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-black/40 border border-white/[0.05] hover:border-white/10 rounded-2xl flex gap-3 items-center"
                      >
                        <span className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <input 
                            value={slide.title}
                            onChange={(e) => handleUpdateOutlineCard(idx, e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-white outline-none"
                            placeholder="Enter slide topic title..."
                          />
                        </div>

                        <button 
                          onClick={() => handleDeleteOutlineCard(idx)}
                          className="p-2 rounded-lg hover:bg-red-500/15 hover:text-red-500 text-neutral-500 transition-all shrink-0"
                          title="Delete card"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add slide button */}
                  <button 
                    onClick={handleAddOutlineCard}
                    className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-orange-500/30 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-orange-400 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={12} /> Add Slide Outline Card
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ================= MAIN INPUT FORM SCREEN ================= */
            <motion.div 
              key="input-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.5 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center space-y-8"
            >
              {/* Branding */}
              <div className="text-center space-y-4 mb-2 w-full min-h-[140px] flex flex-col justify-center">
                
                {/* Active Indicator */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md shadow-lg"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse" />
                  AI Slide Deck Generator Active
                </motion.div>
                
                {/* Titles */}
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2 text-center">
                    Create Stunning <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">AI Presentations</span> Instantly
                  </h1>
                  <p className="text-sm md:text-base text-neutral-400 font-light max-w-lg mx-auto leading-relaxed text-center">
                    Convert any concept or text topic into a professionally styled PowerPoint presentation, complete with slide outlines, bullet points, and speaker notes.
                  </p>
                </div>
              </div>

              {/* ============ MAIN COMMAND CARD ============ */}
              <div className="w-full max-w-3xl relative z-10">
                {/* Glow Border Accent */}
                <div className="absolute -inset-px rounded-[1.25rem] sm:rounded-[2rem] bg-gradient-to-b from-orange-500/25 via-orange-500/5 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 bg-[#0c0c0c] border border-white/[0.08] rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] transition-all duration-300 focus-within:border-white/20">
                  
                  {/* Topic Input Row */}
                  <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 pt-4 sm:pt-6 pb-2">
                    <div className={cn(
                      "shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                      isValidInput ? "bg-orange-500/15 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]" : "bg-white/5 text-neutral-500"
                    )}>
                      <Presentation size={18} />
                    </div>
                    <input 
                      placeholder="Enter a detailed presentation topic (e.g. Quantum Computing, Climate Change)..."
                      value={sourceInput}
                      onChange={(e) => setSourceInput(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] sm:text-[16px] font-semibold text-white placeholder:text-neutral-500 sm:placeholder:text-neutral-600 outline-none min-w-0 px-1"
                    />
                    <div className="shrink-0 flex items-center gap-2">
                      {isValidInput && (
                        <div className="w-6 h-6 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                          <IconCheck size={12} className="text-green-500" />
                        </div>
                      )}
                      {isLoggedIn && !hasPremiumAccess && userTokens !== null && (
                        <Link href="/pricing" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-500/8 border border-yellow-500/15 text-yellow-500 text-[10px] font-black uppercase tracking-wider hover:bg-yellow-500/15 transition-colors">
                          <Coins size={11} />
                          {userTokens.toLocaleString()}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Focus Areas Prompt Textarea */}
                  <div className="px-4 sm:px-6 pb-2">
                    <textarea 
                      placeholder="Add context, slide tone guidelines, or specific points to cover... (optional)"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border-none focus:ring-0 text-[13px] sm:text-[14px] text-neutral-300 placeholder:text-neutral-600 sm:placeholder:text-neutral-700 resize-none outline-none leading-relaxed px-1"
                    />
                  </div>

                  {/* Slide Count Cards Selector Grid */}
                  <div className="px-4 sm:px-6 py-4 border-t border-white/[0.05] bg-white/[0.005]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-3 flex items-center gap-1.5">
                      <Layers size={11} className="text-orange-500" /> Select Slide Deck Count ("cards")
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {SLIDE_CARDS.map((card) => {
                        const isSelected = selectedCard.count === card.count;
                        const isLocked = card.tier === "Pro" && !hasPremiumAccess;
                        const isPowerLocked = card.tier === "Power" && (!hasPremiumAccess || userPlanId !== "power");
                        const locked = isLocked || isPowerLocked;

                        return (
                          <div
                            key={card.count}
                            onClick={() => {
                              if (locked) {
                                setPremiumFeatureName(card.label);
                                setShowPremiumModal(true);
                                return;
                              }
                              setSelectedCard(card);
                            }}
                            className={cn(
                              "relative p-3 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[90px]",
                              locked 
                                ? "opacity-50 hover:opacity-75 border-white/[0.04] bg-white/[0.002]" 
                                : isSelected 
                                ? "bg-orange-500/10 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                                : "bg-white/[0.01] border-white/[0.06] hover:border-white/12 hover:bg-white/[0.02]"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-xs sm:text-sm text-white">{card.label}</span>
                              {locked ? (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-0.5">
                                  <Lock size={7} /> {card.tier}
                                </span>
                              ) : (
                                <span className={cn(
                                  "text-[7px] sm:text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
                                  isSelected ? "bg-orange-500/20 border-orange-500/35 text-orange-400" : "bg-white/5 border-white/10 text-neutral-500"
                                )}>
                                  {card.tier}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] leading-tight text-neutral-500 mt-2">{card.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-3 border-t border-white/[0.05] bg-white/[0.01]">
                    <div onWheel={handleHorizontalScroll} className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 sm:px-0">
                      
                      {/* Model Selector Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 text-[11px] font-bold text-neutral-300 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                          <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: selectedModel.hex, boxShadow: `0 0 6px ${selectedModel.hex}99` }} />
                          <span>{selectedModel.name}</span>
                          <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] border border-white/[0.08] text-white min-w-[280px] p-2.5 rounded-2xl shadow-2xl z-50">
                          <div className="px-3 py-2 mb-1 border-b border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500 flex items-center gap-1.5">
                              <Laptop size={11} className="text-white/30" /> Presentation Intelligence
                            </p>
                          </div>
                          <div className="space-y-1 mt-1">
                            {AI_MODELS.map(m => {
                              const isLocked = m.accessTier === 'Pro' && !hasPremiumAccess;
                              const isPowerLocked = m.accessTier === 'Power' && (!hasPremiumAccess || userPlanId !== 'power');
                              const locked = isLocked || isPowerLocked;
                              const isActive = m.id === selectedModel.id;

                              return (
                                <DropdownMenuItem
                                  key={m.id}
                                  onClick={() => {
                                    if (locked) {
                                      setPremiumFeatureName(`${m.name} Engine`);
                                      setShowPremiumModal(true);
                                      return;
                                    }
                                    setSelectedModel(m);
                                  }}
                                  className={cn(
                                    "flex flex-col items-start gap-1 p-2 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5",
                                    isActive && "bg-white/[0.03] border border-white/5"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.hex }} />
                                      <span className="font-bold text-xs text-white">{m.name}</span>
                                    </div>
                                    {locked ? (
                                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-0.5">
                                        <Lock size={8} /> {m.accessTier}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-white/10 text-neutral-500">
                                        {m.accessTier}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-neutral-500 leading-normal pl-4">{m.desc}</p>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Language Selector Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 text-[11px] font-bold text-neutral-300 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                          <Globe size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                          <span>{outputLanguage}</span>
                          <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] border border-white/[0.08] text-white min-w-[160px] p-1.5 rounded-xl shadow-2xl z-50">
                          <div className="text-[9px] font-bold text-neutral-500 px-3 py-1.5 uppercase tracking-widest border-b border-white/[0.05]">Languages</div>
                          {LANGUAGES.map((lang) => {
                            const isPremium = POWER_LANGUAGES.has(lang);
                            const isLocked = isPremium && (!hasPremiumAccess || userPlanId !== "power");
                            const isSelected = outputLanguage === lang;

                            return (
                              <DropdownMenuItem
                                key={lang}
                                onClick={() => {
                                  if (isLocked) {
                                    setPremiumFeatureName(`${lang} Language`);
                                    setShowPremiumModal(true);
                                    return;
                                  }
                                  setOutputLanguage(lang);
                                }}
                                className="flex items-center justify-between text-xs font-semibold rounded-lg cursor-pointer px-3 py-2 hover:bg-white/5 focus:bg-white/5"
                              >
                                <span className={isSelected ? "text-orange-400 font-bold" : "text-neutral-300"}>{lang}</span>
                                {isLocked ? (
                                  <Lock size={10} className="text-amber-500" />
                                ) : isSelected ? (
                                  <Check size={12} className="text-orange-500 font-black" />
                                ) : null}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Outline Plan Button */}
                    <button
                      onClick={handlePlanOutline}
                      disabled={!isValidInput || isOutlinePlanning}
                      className={cn(
                        "h-11 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all duration-200 active:scale-95 shrink-0 flex items-center justify-center gap-2",
                        isValidInput 
                          ? "bg-gradient-to-r from-orange-500 to-amber-600 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_28px_rgba(249,115,22,0.5)]" 
                          : "bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed"
                      )}
                    >
                      {isOutlinePlanning ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Planning Outline...
                        </>
                      ) : (
                        <>
                          <Zap size={12} fill="currentColor" /> Plan Slide Outline
                        </>
                      )}
                    </button>
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
