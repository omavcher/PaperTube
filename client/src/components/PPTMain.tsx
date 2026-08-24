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
  Presentation, Globe, Layers, Laptop, Sparkle, Crown, ArrowLeft,
  FilePlus, Palette, Sliders, Wand2, RefreshCw, ArrowUp, ArrowDown, Image as ImageIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import SubscriptionDialog from "@/components/SubscriptionDialog";
import QuotaPaywallModal from "@/components/QuotaPaywallModal";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLoginModal, PremiumUpgradeModal } from '@/components/AuthGuard';
import { toast } from 'sonner';

const LANGUAGES = ["English", "German", "Spanish", "French", "Japanese", "Arabic", "Hindi"];
const POWER_LANGUAGES = new Set(["German", "Spanish", "French", "Japanese", "Arabic", "Hindi"]);

const PRESENTATION_STYLES = [
  { id: "professional", label: "Professional", desc: "Boardroom, C-Suite & Executive" },
  { id: "casual", label: "Casual", desc: "Conversational & Engaging" },
  { id: "academic", label: "Academic", desc: "Research, Citations & Theory" },
  { id: "creative", label: "Creative", desc: "Dynamic Narrative & Storytelling" },
  { id: "startup_pitch", label: "Startup Pitch", desc: "VC Deck, Problem & Solution" },
  { id: "technical", label: "Technical", desc: "Architecture, Systems & Code" },
];

const IMAGE_SOURCES = [
  { id: "unsplash", label: "Unsplash Stock", desc: "Real high-res photography" },
  { id: "ai", label: "AI Imagery", desc: "Custom conceptual visual prompts" },
  { id: "minimalist", label: "Minimalist", desc: "Diagrams & visual cards" },
  { id: "none", label: "No Images", desc: "Clean typography-only decks" },
];

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

const INITIAL_THEMES = [
  // Free themes
  { id: "sunset-orange", name: "Sunset Orange", primary: "#f97316", accent: "#fbbf24", bg: "#0f0b07", cardBg: "rgba(255,255,255,0.03)", font: "Outfit", isPremium: false },
  { id: "midnight-tech", name: "Midnight Tech", primary: "#d83b01", accent: "#3b82f6", bg: "#050505", cardBg: "rgba(255,255,255,0.03)", font: "Outfit", isPremium: false },
  { id: "classic-slate", name: "Classic Slate", primary: "#4b5563", accent: "#9ca3af", bg: "#0f172a", cardBg: "rgba(255,255,255,0.03)", font: "Inter", isPremium: false },
  { id: "ocean-breeze", name: "Ocean Breeze", primary: "#0ea5e9", accent: "#38bdf8", bg: "#030c14", cardBg: "rgba(255,255,255,0.03)", font: "Inter", isPremium: false },
  { id: "minimal-snow", name: "Minimal Snow", primary: "#ffffff", accent: "#a3a3a3", bg: "#121212", cardBg: "rgba(255,255,255,0.03)", font: "Outfit", isPremium: false },
  
  // Premium themes
  { id: "emerald-forest", name: "Emerald Forest", primary: "#10b981", accent: "#34d399", bg: "#02120e", cardBg: "rgba(255,255,255,0.03)", font: "Georgia", isPremium: true },
  { id: "vintage-gold", name: "Vintage Gold", primary: "#fbbf24", accent: "#d97706", bg: "#17140f", cardBg: "rgba(255,255,255,0.03)", font: "Georgia", isPremium: true },
  { id: "cyberpunk", name: "Cyberpunk Glow", primary: "#d946ef", accent: "#f43f5e", bg: "#0d0312", cardBg: "rgba(255,255,255,0.03)", font: "Courier New", isPremium: true },
  { id: "royal-velvet", name: "Royal Velvet", primary: "#8b5cf6", accent: "#a78bfa", bg: "#0a0314", cardBg: "rgba(255,255,255,0.03)", font: "Georgia", isPremium: true },
  { id: "carbon-coder", name: "Carbon Coder", primary: "#22c55e", accent: "#4ade80", bg: "#0a0f0a", cardBg: "rgba(255,255,255,0.03)", font: "Courier New", isPremium: true },
  { id: "sakura-bloom", name: "Sakura Bloom", primary: "#f472b6", accent: "#fbcfe8", bg: "#14070e", cardBg: "rgba(255,255,255,0.03)", font: "Inter", isPremium: true },
  { id: "warm-clay", name: "Warm Clay", primary: "#ea580c", accent: "#ff7849", bg: "#140a05", cardBg: "rgba(255,255,255,0.03)", font: "Georgia", isPremium: true },
  { id: "lavender-dream", name: "Lavender Dream", primary: "#a855f7", accent: "#c084fc", bg: "#0f0714", cardBg: "rgba(255,255,255,0.03)", font: "Outfit", isPremium: true },
  { id: "nordic-frost", name: "Nordic Frost", primary: "#38bdf8", accent: "#7dd3fc", bg: "#06131a", cardBg: "rgba(255,255,255,0.03)", font: "Inter", isPremium: true },
  { id: "bronze-metal", name: "Bronze Metal", primary: "#b45309", accent: "#f59e0b", bg: "#140e05", cardBg: "rgba(255,255,255,0.03)", font: "Georgia", isPremium: true },
  { id: "royal-gold", name: "Royal Gold", primary: "#fbbf24", accent: "#1e3a8a", bg: "#030814", cardBg: "rgba(255,255,255,0.03)", font: "Georgia", isPremium: true },
  { id: "mint-fresh", name: "Mint Fresh", primary: "#2dd4bf", accent: "#5eead4", bg: "#031411", cardBg: "rgba(255,255,255,0.03)", font: "Outfit", isPremium: true },
  { id: "nebula-space", name: "Nebula Space", primary: "#ec4899", accent: "#3b82f6", bg: "#05030f", cardBg: "rgba(255,255,255,0.03)", font: "Outfit", isPremium: true },
  { id: "desert-sand", name: "Desert Sand", primary: "#f59e0b", accent: "#d97706", bg: "#140e05", cardBg: "rgba(255,255,255,0.03)", font: "Outfit", isPremium: true },
  { id: "dark-matter", name: "Dark Matter", primary: "#ffffff", accent: "#f97316", bg: "#020205", cardBg: "rgba(255,255,255,0.03)", font: "Inter", isPremium: true }
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
  const [selectedStyle, setSelectedStyle] = useState(PRESENTATION_STYLES[0]);
  const [imageSource, setImageSource] = useState(IMAGE_SOURCES[0].id);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  // Themes list & Custom Theme Studio
  const [themesList, setThemesList] = useState(INITIAL_THEMES);
  const [selectedTheme, setSelectedTheme] = useState(INITIAL_THEMES[0]);
  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const [customThemeForm, setCustomThemeForm] = useState({
    name: "My Custom Theme",
    primary: "#f97316",
    accent: "#fbbf24",
    bg: "#0b0907",
    cardBg: "rgba(255,255,255,0.04)",
    font: "Outfit"
  });

  // Outline customizer workflow states
  const [isOutlinePlanned, setIsOutlinePlanned] = useState(false);
  const [outlineSlides, setOutlineSlides] = useState<Array<{
    title: string;
    desc: string;
    layout?: string;
    imageCandidates?: any[];
    selectedImage?: string;
    selectedImageIndex?: number;
    sources?: string[];
  }>>([]);
  const [textDensity, setTextDensity] = useState<'minimal' | 'concise' | 'detailed'>('minimal');
  const [visualsEnabled, setVisualsEnabled] = useState(true);
  const [isRegeneratingCard, setIsRegeneratingCard] = useState<number | null>(null);

  // Loading & Generation States
  const [isOutlinePlanning, setIsOutlinePlanning] = useState(false);
  const [isStartingBlank, setIsStartingBlank] = useState(false);
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
  const [planErrorData, setPlanErrorData] = useState<any>(null);

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
        prompt,
        style: selectedStyle.id,
        webSearch: webSearchEnabled
      }, { headers: { 'Auth': authToken } });

      if (response.data?.success) {
        setOutlineSlides(response.data.data.slides);
        setIsOutlinePlanned(true);
      } else {
        toast.error("Failed to generate outline structural plan.");
      }
    } catch (err: any) {
      console.warn("Backend presentation API fail, creating mock outline cards.");
      // Fallback outline mock cards with real verified visual candidates
      const curatedStockPhotos = [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
      ];
      const mockOutline = Array.from({ length: selectedCard.count }).map((_, i) => {
        const title = i === 0 ? `Introduction to ${sourceInput}` : i === selectedCard.count - 1 ? "Strategic Conclusion & Key Milestones" : `Core Insight ${i}: ${sourceInput}`;
        const desc = "Comprehensive strategic overview, quantitative impact metrics, and deployment architecture.";
        const candidates = [
          { id: `c-${i}-1`, style: "Photorealistic", score: 95, url: curatedStockPhotos[i % curatedStockPhotos.length] },
          { id: `c-${i}-2`, style: "Cinematic", score: 91, url: curatedStockPhotos[(i + 1) % curatedStockPhotos.length] },
          { id: `c-${i}-3`, style: "3D Render", score: 87, url: curatedStockPhotos[(i + 2) % curatedStockPhotos.length] },
          { id: `c-${i}-4`, style: "Minimalist", score: 83, url: curatedStockPhotos[(i + 3) % curatedStockPhotos.length] }
        ];
        return {
          title,
          desc,
          layout: i === 0 ? "title" : i % 3 === 1 ? "image_left" : "bullets",
          imageCandidates: candidates,
          selectedImageIndex: 0,
          selectedImage: candidates[0].url
        };
      });
      setOutlineSlides(mockOutline);
      setIsOutlinePlanned(true);
    } finally {
      setIsOutlinePlanning(false);
    }
  };

  const handleStartBlankDeck = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    setIsStartingBlank(true);
    try {
      const response = await api.post('/presentation/create-blank', {
        title: sourceInput.trim() || "Untitled Presentation",
        theme: selectedTheme.id
      }, { headers: { 'Auth': authToken } });

      if (response.data?.success && response.data?.data?.slug) {
        toast.success("Blank presentation workspace initialized!");
        router.push(`/presentation-generator/${response.data.data.slug}`);
      } else {
        throw new Error("Failed to create blank deck");
      }
    } catch (err: any) {
      toast.error("Could not create blank deck. Please try again.");
    } finally {
      setIsStartingBlank(false);
    }
  };

  const handleUpdateOutlineCard = (index: number, newTitle: string, newDesc?: string) => {
    const updated = [...outlineSlides];
    updated[index] = {
      ...updated[index],
      title: newTitle,
      desc: newDesc !== undefined ? newDesc : updated[index].desc
    };
    setOutlineSlides(updated);
  };

  const handleMoveOutlineCard = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= outlineSlides.length) return;
    const updated = [...outlineSlides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setOutlineSlides(updated);
  };

  const handleRegenerateSingleOutlineCard = async (index: number) => {
    setIsRegeneratingCard(index);
    try {
      const authToken = localStorage.getItem('authToken');
      const res = await api.post('/presentation/agent-action', {
        action: "regenerate_slide",
        slide: {
          id: index + 1,
          title: outlineSlides[index].title,
          desc: outlineSlides[index].desc
        },
        instruction: `Create a sharper, more engaging slide topic for slide ${index + 1} on topic: ${sourceInput}`,
        presentationTitle: sourceInput
      }, { headers: { 'Auth': authToken } });

      if (res.data?.success && res.data?.slide) {
        handleUpdateOutlineCard(index, res.data.slide.title || "Refined Topic", res.data.slide.subtitle || res.data.slide.desc);
        toast.success(`Outline card ${index + 1} refined!`);
      } else {
        throw new Error("Regeneration failed");
      }
    } catch (e) {
      handleUpdateOutlineCard(index, `Optimized ${outlineSlides[index].title}`);
      toast.success(`Outline card ${index + 1} updated!`);
    } finally {
      setIsRegeneratingCard(null);
    }
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
      desc: "Add specific contents, data metrics, and key takeaways."
    }]);
  };

  const handleSaveCustomTheme = () => {
    if (!customThemeForm.name.trim()) {
      toast.error("Theme name is required");
      return;
    }
    const newThemeId = `custom-${Date.now()}`;
    const newTheme = {
      id: newThemeId,
      name: customThemeForm.name,
      primary: customThemeForm.primary,
      accent: customThemeForm.accent,
      bg: customThemeForm.bg,
      cardBg: customThemeForm.cardBg || "rgba(255,255,255,0.04)",
      font: customThemeForm.font,
      isPremium: false
    };

    setThemesList(prev => [newTheme, ...prev]);
    setSelectedTheme(newTheme);
    setShowCustomThemeModal(false);
    toast.success(`Custom theme "${newTheme.name}" created and applied!`);
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
        style: selectedStyle.id,
        imageSource,
        webSearch: webSearchEnabled,
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
      if (
        errData?.code === "QUOTA_EXCEEDED" || 
        errData?.code === "DAILY_LIMIT_EXCEEDED" || 
        errData?.code === "MODEL_NOT_AVAILABLE" ||
        errData?.code === "POWER_FEATURE_REQUIRED" ||
        err.response?.status === 403
      ) {
        setIsGenerating(false);
        setPlanErrorData(errData || {
          code: "QUOTA_EXCEEDED",
          feature: "presentations",
          featureLabel: "AI Slide Decks",
          message: "You've reached your AI Slide Decks daily limit on the Free plan. Upgrade to Pro Scholar for 10 monthly decks with 20 slides."
        });
        setShowPaywall(true);
      } else if (errData?.code === "INSUFFICIENT_TOKENS") {
        setIsGenerating(false);
        setTokenErrorData(errData);
        setPlanErrorData({
          code: "QUOTA_EXCEEDED",
          feature: "presentations",
          featureLabel: "AI Slide Decks",
          message: "You've reached your free daily slide deck allowance. Upgrade to Pro Scholar for high-capacity allowances."
        });
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
              className="w-full max-w-2xl mx-auto rounded-3xl bg-[#0c0c12]/95 backdrop-blur-2xl border border-white/[0.12] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6"
              style={{ boxShadow: "0 30px 100px -20px rgba(0,0,0,0.95), 0 0 50px rgba(249,115,22,0.15)" }}
            >
              {/* Top ambient glow */}
              <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow-lg">
                    <Presentation className="animate-pulse" size={22} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                      Compiling Presentation Deck
                    </h2>
                    <p className="text-xs text-neutral-400 font-light truncate max-w-md">
                      {sourceInput ? `Topic: "${sourceInput}"` : "Generating slide architecture..."}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-black text-orange-400 block">
                    {Math.round(progressPercent)}%
                  </span>
                  <span className="text-[9.5px] font-mono uppercase text-neutral-500 tracking-wider">
                    Stage {currentStep + 1} of 8
                  </span>
                </div>
              </div>

              {/* Embedded Linear Energy Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400"
                    style={{ width: `${progressPercent}%`, transition: "width 0.2s ease-out", boxShadow: "0 0 14px rgba(249,115,22,0.7)" }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10.5px] font-mono text-neutral-400 px-0.5">
                  <span className="text-orange-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping inline-block" />
                    {getSubStatus(currentStep, progressPercent)}
                  </span>
                  <span>{selectedCard.count} Widescreen Slides</span>
                </div>
              </div>

              {/* 4-Phase Generation Pipeline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { phase: "1. Outline Map", label: "Semantic Architecture", activeAt: 0, doneAt: 2 },
                  { phase: "2. Content Copy", label: "Substantive Bullets", activeAt: 2, doneAt: 4 },
                  { phase: "3. Photography", label: "Real HD Visuals", activeAt: 4, doneAt: 6 },
                  { phase: "4. Final Build", label: "16:9 Bento Deck", activeAt: 6, doneAt: 8 },
                ].map((p, idx) => {
                  const isDone = currentStep >= p.doneAt;
                  const isCur = currentStep >= p.activeAt && currentStep < p.doneAt;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-2xl border flex flex-col justify-between transition-all space-y-2",
                        isDone 
                          ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                          : isCur 
                          ? "bg-white/[0.06] border-orange-500/50 text-white shadow-lg ring-1 ring-orange-500/30"
                          : "bg-white/[0.02] border-white/[0.06] text-neutral-600"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase font-bold">{p.phase}</span>
                        {isDone ? (
                          <span className="w-4 h-4 rounded-full bg-orange-500 text-black flex items-center justify-center text-[10px] font-bold">✓</span>
                        ) : isCur ? (
                          <Loader2 size={12} className="animate-spin text-orange-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                        )}
                      </div>
                      <p className="text-[11px] font-bold leading-tight">{p.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Active Live Tip Banner */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <Wand2 size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-200">
                    {TRIVIA_TIPS[activeTipIndex].title}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-light leading-relaxed truncate">
                    {TRIVIA_TIPS[activeTipIndex].text}
                  </p>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30 shrink-0">
                  Gamma Engine
                </span>
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
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
                        { id: 'minimal', label: 'Minimal', desc: 'Bullet takeaways', tier: 'Free' },
                        { id: 'concise', label: 'Concise', desc: 'Balanced depth', tier: 'Pro' },
                        { id: 'detailed', label: 'Detailed', desc: 'Comprehensive', tier: 'Pro' }
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

                  {/* 2. Visuals & Web Grounding Settings */}
                  <div className="space-y-2">
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

                    <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                      <div>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Globe size={13} className="text-orange-400" /> Web Search Grounding
                        </span>
                        <span className="text-[9px] text-neutral-500 font-light mt-0.5 block">Include real-time industry statistics and verified facts.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={webSearchEnabled} 
                          onChange={(e) => setWebSearchEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-black peer-checked:after:border-transparent" />
                      </label>
                    </div>
                  </div>

                  {/* 3. Theme Grid Preview Selector */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                        Themes Palette ({themesList.length})
                      </p>
                      <button
                        onClick={() => setShowCustomThemeModal(true)}
                        className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 transition-colors cursor-pointer"
                      >
                        <Palette size={11} /> + Custom Theme
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
                      {themesList.map(theme => {
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
                    className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all bg-gradient-to-r from-orange-500 to-amber-600 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_28px_rgba(249,115,22,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
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
                      <p className="text-[10px] text-neutral-500 font-light mt-0.5">Customize your deck flow. Add, delete, reorder, or refine outline cards.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-neutral-900 border border-white/10 px-3 py-1 rounded-full text-orange-400">
                      {outlineSlides.length} Slide Cards
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1.5 custom-scrollbar">
                    {outlineSlides.map((slide, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 bg-black/40 border border-white/[0.06] hover:border-white/15 rounded-2xl flex flex-col gap-2 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                            {idx + 1}
                          </span>

                          <input 
                            value={slide.title}
                            onChange={(e) => handleUpdateOutlineCard(idx, e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-bold text-white outline-none"
                            placeholder="Slide topic title..."
                          />

                          {/* Reorder and Action buttons */}
                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleMoveOutlineCard(idx, "up")}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => handleMoveOutlineCard(idx, "down")}
                              disabled={idx === outlineSlides.length - 1}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              onClick={() => handleRegenerateSingleOutlineCard(idx)}
                              disabled={isRegeneratingCard === idx}
                              className="p-1.5 rounded-lg text-orange-400 hover:bg-orange-500/15 transition-colors cursor-pointer"
                              title="Regenerate with AI"
                            >
                              {isRegeneratingCard === idx ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            </button>
                            <button 
                              onClick={() => handleDeleteOutlineCard(idx)}
                              className="p-1.5 rounded-lg hover:bg-red-500/15 text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
                              title="Delete card"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Description field */}
                        <textarea
                          value={slide.desc || ""}
                          onChange={(e) => handleUpdateOutlineCard(idx, slide.title, e.target.value)}
                          rows={1}
                          className="w-full bg-transparent border-none focus:ring-0 text-[11px] text-neutral-400 placeholder:text-neutral-600 outline-none resize-none pl-8 leading-relaxed"
                          placeholder="Brief description of key takeaways & content..."
                        />

                        {/* Visual Candidates Selector Strip */}
                        {slide.imageCandidates && slide.imageCandidates.length > 0 && (
                          <div className="pl-8 pt-1.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                                <ImageIcon size={10} className="text-orange-400" />
                                Visual Choices ({slide.imageCandidates.length} Layout-Optimized Candidates)
                              </span>
                              <button
                                onClick={async () => {
                                  try {
                                    const authToken = localStorage.getItem('authToken');
                                    const res = await api.post('/presentation/image-candidates', {
                                      slideTitle: slide.title,
                                      slideDesc: slide.desc,
                                      layout: slide.layout || "image_left",
                                      topic: sourceInput,
                                      slideIndex: idx
                                    }, { headers: { 'Auth': authToken } });
                                    if (res.data?.success && res.data?.candidates) {
                                      const updated = [...outlineSlides];
                                      updated[idx].imageCandidates = res.data.candidates;
                                      updated[idx].selectedImage = res.data.candidates[0].url;
                                      updated[idx].selectedImageIndex = 0;
                                      setOutlineSlides(updated);
                                      toast.success("4 fresh visual candidates generated!");
                                    }
                                  } catch (e) {
                                    toast.error("Could not refresh visuals");
                                  }
                                }}
                                className="text-[9px] font-bold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                              >
                                + Generate More
                              </button>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              {slide.imageCandidates.map((cand: any, cIdx: number) => {
                                const isSelected = (slide.selectedImageIndex ?? 0) === cIdx;
                                return (
                                  <div
                                    key={cand.id || cIdx}
                                    onClick={() => {
                                      const updated = [...outlineSlides];
                                      updated[idx].selectedImageIndex = cIdx;
                                      updated[idx].selectedImage = cand.url;
                                      setOutlineSlides(updated);
                                    }}
                                    className={cn(
                                      "relative rounded-xl overflow-hidden border cursor-pointer transition-all group/cand aspect-[16/10] flex flex-col justify-between p-1",
                                      isSelected 
                                        ? "border-orange-500 ring-2 ring-orange-500/30 shadow-md" 
                                        : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                                    )}
                                  >
                                    <img 
                                      src={cand.url} 
                                      alt="" 
                                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"; }}
                                      className="absolute inset-0 w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                    
                                    {/* Top Score Badge */}
                                    <div className="relative z-10 flex justify-between items-center">
                                      <span className="text-[7.5px] font-mono font-black px-1 py-0.2 rounded bg-black/80 text-orange-400 border border-orange-500/30">
                                        {cand.score || 90}/100
                                      </span>
                                      {isSelected && (
                                        <span className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center text-black">
                                          <IconCheck size={8} className="font-bold" />
                                        </span>
                                      )}
                                    </div>

                                    {/* Bottom Style Tag */}
                                    <span className="relative z-10 text-[7.5px] font-bold text-white truncate drop-shadow">
                                      {cand.style || "Photorealistic"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Verified Grounding Sources Badge */}
                        {slide.sources && slide.sources.length > 0 && (
                          <div className="pl-8 flex items-center gap-1 text-[9px] font-mono text-neutral-500">
                            <Globe size={9} className="text-orange-400 shrink-0" />
                            <span className="truncate">Grounded with: {slide.sources.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add slide button */}
                  <button 
                    onClick={handleAddOutlineCard}
                    className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-orange-500/30 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-orange-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                  AI Presentation Engine &bull; Gamma Grade
                </motion.div>
                
                {/* Titles */}
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2 text-center">
                    Create Stunning <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">AI Presentations</span> Instantly
                  </h1>
                  <p className="text-sm md:text-base text-neutral-400 font-light max-w-lg mx-auto leading-relaxed text-center">
                    Outline-first presentation creator with intelligent layouts, live presenter tools, webcam recording, and instant PowerPoint export.
                  </p>
                </div>
              </div>

              {/* ============ PRODUCTION-GRADE MAIN COMMAND CARD ============ */}
              <div className="w-full max-w-3xl relative z-10 space-y-4">
                {/* Glow Border Accent */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-500/30 via-amber-500/15 to-orange-500/30 blur-xl opacity-60 pointer-events-none -z-10" />

                <div className="relative bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/[0.12] rounded-3xl overflow-hidden shadow-[0_25px_90px_-20px_rgba(0,0,0,0.95)] transition-all duration-300 focus-within:border-orange-500/40">
                  
                  {/* Topic Input Row */}
                  <div className="flex items-center gap-3 px-5 pt-6 pb-2.5">
                    <div className={cn(
                      "shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md",
                      isValidInput ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-white/[0.04] border border-white/10 text-neutral-400"
                    )}>
                      <Presentation size={20} />
                    </div>
                    <input 
                      placeholder="What would you like to present? (e.g. 7 Wonders of the World, AI Agents in 2026)..."
                      value={sourceInput}
                      onChange={(e) => setSourceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValidInput && !isOutlinePlanning) {
                          e.preventDefault();
                          handlePlanOutline();
                        }
                      }}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-base sm:text-lg font-bold text-white placeholder:text-neutral-500 outline-none min-w-0 px-1 tracking-tight"
                    />
                    <div className="shrink-0 flex items-center gap-2">
                      {isValidInput && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Check size={13} />
                        </div>
                      )}
                      <Link 
                        href="/pricing" 
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                          hasPremiumAccess 
                            ? "bg-amber-500/10 border border-amber-500/25 text-amber-400" 
                            : "bg-white/[0.05] border border-white/[0.08] text-neutral-300 hover:bg-white/[0.1] hover:text-white"
                        )}
                      >
                        {hasPremiumAccess ? <Crown size={11} className="text-amber-400" /> : <Zap size={11} className="text-orange-400" />}
                        <span>{hasPremiumAccess ? (userPlanId === 'power' ? 'Power' : 'Pro') : 'Upgrade'}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Focus Areas Prompt Textarea */}
                  <div className="px-5 pb-3">
                    <textarea 
                      placeholder="Add specific focus areas, audience profile, key statistics, or outline guidelines... (optional)"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border-none focus:ring-0 text-xs sm:text-sm text-neutral-300 placeholder:text-neutral-600 resize-none outline-none leading-relaxed px-1"
                    />
                  </div>

                  {/* Generation Style & Visuals Configuration Row */}
                  <div className="px-5 py-3 border-t border-white/[0.06] bg-black/40 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Tone / Style Selector */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-neutral-300 hover:text-white outline-none cursor-pointer transition-all">
                          <span className="text-[10px] uppercase font-mono text-orange-400">Tone:</span>
                          <span className="font-bold">{selectedStyle.label}</span>
                          <ChevronDown size={11} className="text-neutral-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0e0e12] border border-white/[0.12] text-white p-1.5 rounded-2xl shadow-2xl z-50 w-52">
                          {PRESENTATION_STYLES.map(st => (
                            <DropdownMenuItem
                              key={st.id}
                              onClick={() => setSelectedStyle(st)}
                              className="flex flex-col items-start p-2 rounded-xl cursor-pointer hover:bg-white/5"
                            >
                              <span className={cn("text-xs font-bold", selectedStyle.id === st.id ? "text-orange-400" : "text-neutral-200")}>{st.label}</span>
                              <span className="text-[9.5px] text-neutral-500">{st.desc}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Image Source Selector */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-neutral-300 hover:text-white outline-none cursor-pointer transition-all">
                          <ImageIcon size={12} className="text-orange-400" />
                          <span className="font-bold">{IMAGE_SOURCES.find(s => s.id === imageSource)?.label || "Unsplash"}</span>
                          <ChevronDown size={11} className="text-neutral-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0e0e12] border border-white/[0.12] text-white p-1.5 rounded-2xl shadow-2xl z-50 w-52">
                          {IMAGE_SOURCES.map(isrc => (
                            <DropdownMenuItem
                              key={isrc.id}
                              onClick={() => setImageSource(isrc.id)}
                              className="flex flex-col items-start p-2 rounded-xl cursor-pointer hover:bg-white/5"
                            >
                              <span className={cn("text-xs font-bold", imageSource === isrc.id ? "text-orange-400" : "text-neutral-200")}>{isrc.label}</span>
                              <span className="text-[9.5px] text-neutral-500">{isrc.desc}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Language Selector Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-neutral-300 hover:text-white outline-none cursor-pointer transition-all">
                          <Globe size={12} className="text-neutral-400" />
                          <span className="font-bold">{outputLanguage}</span>
                          <ChevronDown size={11} className="text-neutral-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0e0e12] border border-white/[0.12] text-white min-w-[160px] p-1.5 rounded-2xl shadow-2xl z-50">
                          <div className="text-[9px] font-bold text-neutral-500 px-3 py-1.5 uppercase tracking-widest border-b border-white/[0.06]">Languages</div>
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
                                className="flex items-center justify-between text-xs font-semibold rounded-xl cursor-pointer px-3 py-2 hover:bg-white/5"
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

                    {/* Web Grounding Toggle */}
                    <button 
                      type="button"
                      onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all",
                        webSearchEnabled 
                          ? "bg-orange-500/15 border-orange-500/40 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.2)]" 
                          : "bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white"
                      )}
                    >
                      <Globe size={12} />
                      <span>Live Facts</span>
                      <span className={cn("w-2 h-2 rounded-full", webSearchEnabled ? "bg-orange-500 animate-pulse" : "bg-neutral-600")} />
                    </button>
                  </div>

                  {/* Slide Count Cards Selector Grid */}
                  <div className="px-5 py-4 border-t border-white/[0.06] bg-black/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3 flex items-center gap-1.5">
                      <Layers size={12} className="text-orange-500" /> Presentation Length
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
                              "relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[85px]",
                              locked 
                                ? "opacity-40 hover:opacity-70 border-white/[0.04] bg-white/[0.002]" 
                                : isSelected 
                                ? "bg-orange-500/15 border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.2)] scale-[1.02]" 
                                : "bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-extrabold text-sm text-white">{card.label}</span>
                              {locked ? (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-0.5">
                                  <Lock size={7} /> {card.tier}
                                </span>
                              ) : (
                                <span className={cn(
                                  "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
                                  isSelected ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-neutral-500"
                                )}>
                                  {card.tier}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] leading-tight text-neutral-400 mt-2 font-light">{card.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BOTTOM COMMAND ACTION */}
                  <div className="p-4 border-t border-white/[0.06] bg-black/60 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomThemeModal(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Palette size={13} className="text-orange-400" />
                        <span>Theme: {selectedTheme.name}</span>
                      </button>
                    </div>

                    <button
                      onClick={handlePlanOutline}
                      disabled={!isValidInput || isOutlinePlanning}
                      className={cn(
                        "h-12 px-8 rounded-2xl text-xs font-black uppercase tracking-widest text-black transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-xl",
                        isValidInput 
                          ? "bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_45px_rgba(249,115,22,0.6)] hover:brightness-110" 
                          : "bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed"
                      )}
                    >
                      {isOutlinePlanning ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-black" /> Planning AI Outline...
                        </>
                      ) : (
                        <>
                          <Zap size={14} fill="currentColor" /> Plan Slide Outline
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* Suggested Topics Inspiration Pills */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 mr-1">Try Topics:</span>
                  {[
                    "🏛️ The Seven Wonders of the World",
                    "🤖 Autonomous AI Agents in 2026",
                    "🚀 YC SaaS Startup Pitch",
                    "🔋 Solid-State Battery Revolution",
                    "🌿 Sustainable Urban Cities"
                  ].map((sampleTopic) => (
                    <button
                      key={sampleTopic}
                      type="button"
                      onClick={() => {
                        const clean = sampleTopic.replace(/^[^\w\s]+\s*/, "");
                        setSourceInput(clean);
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-orange-500/30 transition-all cursor-pointer shadow-sm hover:scale-105"
                    >
                      {sampleTopic}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= CUSTOM THEME STUDIO MODAL ================= */}
        <AnimatePresence>
          {showCustomThemeModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div onClick={() => setShowCustomThemeModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0e0e12] border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl z-10 space-y-6"
              >
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                      <Palette size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Custom Theme Studio</h3>
                      <p className="text-[11px] text-neutral-400">Design and save your custom presentation color palette & fonts.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCustomThemeModal(false)} className="text-neutral-500 hover:text-white transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5">Theme Name</label>
                      <input
                        value={customThemeForm.name}
                        onChange={(e) => setCustomThemeForm({ ...customThemeForm, name: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-white/10 text-xs font-bold text-white outline-none focus:border-orange-500/50"
                        placeholder="E.g. Neon Horizon"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5">Primary Accent</label>
                        <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 p-1.5 rounded-xl">
                          <input
                            type="color"
                            value={customThemeForm.primary}
                            onChange={(e) => setCustomThemeForm({ ...customThemeForm, primary: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-xs text-neutral-300">{customThemeForm.primary}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5">Secondary Accent</label>
                        <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 p-1.5 rounded-xl">
                          <input
                            type="color"
                            value={customThemeForm.accent}
                            onChange={(e) => setCustomThemeForm({ ...customThemeForm, accent: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-xs text-neutral-300">{customThemeForm.accent}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5">Background</label>
                        <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 p-1.5 rounded-xl">
                          <input
                            type="color"
                            value={customThemeForm.bg}
                            onChange={(e) => setCustomThemeForm({ ...customThemeForm, bg: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-xs text-neutral-300">{customThemeForm.bg}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5">Font Pairing</label>
                        <select
                          value={customThemeForm.font}
                          onChange={(e) => setCustomThemeForm({ ...customThemeForm, font: e.target.value })}
                          className="w-full h-10 px-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs font-bold text-white outline-none focus:border-orange-500/50"
                        >
                          <option value="Outfit">Outfit (Modern)</option>
                          <option value="Inter">Inter (Clean)</option>
                          <option value="Georgia">Georgia (Editorial)</option>
                          <option value="Courier New">Courier New (Technical)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Preview Card */}
                  <div className="flex flex-col justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1.5">Live Slide Preview</label>
                    <div 
                      className="aspect-[16/9] rounded-2xl border border-white/15 p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all"
                      style={{ 
                        backgroundColor: customThemeForm.bg,
                        fontFamily: customThemeForm.font
                      }}
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[8px] font-mono opacity-60">
                          <span>Chapter 01</span>
                          <span style={{ color: customThemeForm.primary }}>Slide Deck</span>
                        </div>
                        <h4 className="text-sm font-black tracking-tight" style={{ color: customThemeForm.primary }}>
                          Sample Strategy Slide
                        </h4>
                        <p className="text-[9.5px] opacity-75 leading-tight text-white">
                          High-yield architectural breakdown with sub-millisecond retrieval.
                        </p>
                      </div>

                      <div 
                        className="p-2 rounded-xl border flex items-center justify-between text-[9px] font-bold"
                        style={{ 
                          backgroundColor: customThemeForm.cardBg,
                          borderColor: `${customThemeForm.primary}40`,
                          color: customThemeForm.accent
                        }}
                      >
                        <span>Key Performance KPI</span>
                        <span className="font-mono text-[10px]" style={{ color: customThemeForm.primary }}>99.8%</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveCustomTheme}
                      className="w-full mt-4 h-11 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all cursor-pointer"
                    >
                      Apply & Save Theme
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Modals */}
        <QuotaPaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          errorInfo={planErrorData}
        />

        <AuthLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          featureName={premiumFeatureName}
        />
      </div>

    </section>
  );
}

