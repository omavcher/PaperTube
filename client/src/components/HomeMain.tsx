"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/config/api';
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
import { Loader2, ChevronDown, ArrowRight, Coins, AlertTriangle, X, Zap, Code, Users, Headphones, Search, FileSignature, BrainCircuit, FileType, CheckSquare, Target, Map, Briefcase, GraduationCap, Link as LinkIcon, BookOpen, PenTool, LayoutGrid, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import SubscriptionDialog from "@/components/SubscriptionDialog";
import AdDialog, { preloadAdScript } from './AdDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLoginModal, PremiumUpgradeModal } from '@/components/AuthGuard';


// --- Constants & Config ---
const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const DETAIL_LEVELS = ['Short', 'Standard', 'Comprehensive'];
const LANGUAGES = ["English", "Hindi", "Marathi", "Bengali", "Telugu", "Tamil", "Kannada"];

const AI_MODELS = [
  { id: "sankshipta", name: "Sankshipta", accessTier: "Free", endpoint: "free" },
  { id: "bhashasetu", name: "Bhasha-Setu", accessTier: "Free", endpoint: "free" },
  { id: "parikshasarthi", name: "Pariksha-Sarthi", accessTier: "Premium", endpoint: "premium" },
  { id: "vyavastha", name: "Vyavastha", accessTier: "Premium", endpoint: "premium" },
];

const HOME_CATEGORIES = [
  { id: 'youtube', label: 'YouTube AI', icon: IconBrandYoutube },
  { id: 'coding', label: 'Code & Job Prep', icon: Code },
  { id: 'document', label: 'Document Lab', icon: FileType },
  { id: 'writing', label: 'AI Writing', icon: BookOpen },
];

const CATEGORY_TOOLS: Record<string, { id: string, label: string, icon: any, comingSoon?: boolean, placeholder?: string }[]> = {
  youtube: [
    { id: 'notes', label: 'YT to Notes', icon: IconFileText },
    { id: 'flashcards', label: 'YT to Flashcards', icon: IconBrain },
    { id: 'test', label: 'Practice Test', icon: CheckSquare, comingSoon: true, placeholder: 'Paste Video URL to Gen Test...' },
  ],
  coding: [
    { id: 'code_solution', label: 'Code Solution', icon: Code, comingSoon: true, placeholder: 'Paste Leetcode/Hackerrank URL...' },
    { id: 'code_flowchart', label: 'Flow Chart', icon: Map, comingSoon: true, placeholder: 'Paste Code or Repository URL...' },
    { id: 'interview', label: 'Interview Prep', icon: Users, comingSoon: true, placeholder: 'Paste Job Description...' },
    { id: 'resume', label: 'Resume Builder', icon: FileSignature, comingSoon: true, placeholder: 'Paste LinkedIn URL or Resume...' },
  ],
  document: [
    { id: 'pdf_audio', label: 'PDF to Audio', icon: Headphones, comingSoon: true, placeholder: 'Upload or Paste PDF Link...' },
    { id: 'pdf_summary', label: 'PDF Summarizer', icon: Search, comingSoon: true, placeholder: 'Upload or Paste PDF Link...' },
    { id: 'word_summary', label: 'Word Summarizer', icon: FileText, comingSoon: true, placeholder: 'Upload Word Document...' },
    { id: 'mind_map', label: 'Mind Map Gen', icon: BrainCircuit, comingSoon: true, placeholder: 'Upload Document or Paste Notes...' },
  ],
  writing: [
    { id: 'detector', label: 'AI Detector', icon: Search, comingSoon: true, placeholder: 'Paste text to analyze...' },
    { id: 'humanizer', label: 'AI Humanizer', icon: Users, comingSoon: true, placeholder: 'Paste AI generated text...' },
    { id: 'paper', label: 'Paper Writer', icon: FileSignature, comingSoon: true, placeholder: 'Enter research topic...' },
    { id: 'essay', label: 'Essay Writer', icon: PenTool, comingSoon: true, placeholder: 'Enter essay prompt...' },
    { id: 'grader', label: 'Essay Grader', icon: GraduationCap, comingSoon: true, placeholder: 'Paste essay to grade...' },
    { id: 'citation', label: 'Citation Gen', icon: LinkIcon, comingSoon: true, placeholder: 'Enter URL or DOI...' },
  ]
};

const NOTES_LOADING_STEPS = [
  { id: 1, label: "Fetching Signal Data", icon: IconBrandYoutube },
  { id: 2, label: "Extracting Transcripts", icon: IconFileText },
  { id: 3, label: "Synthesizing Concept Map", icon: IconBrain },
  { id: 4, label: "Finalizing Smart Notes", icon: IconSparkles },
];

const FLASHCARDS_LOADING_STEPS = [
  { id: 1, label: "Fetching Signal Data", icon: IconBrandYoutube },
  { id: 2, label: "Extracting Transcripts", icon: IconFileText },
  { id: 3, label: "Formulating Q&A Pairs", icon: IconBrain },
  { id: 4, label: "Building Spaced Deck", icon: IconSparkles },
];

export default function HomeMain() {
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
  const [outputFormat, setOutputFormat] = useState<string>('notes');
  const [flashcardCount, setFlashcardCount] = useState<number>(5);

  // Logic & UI States
  const [loading, setLoading] = useState(false); 
  const [isGenerating, setIsGenerating] = useState(false); 
  const [currentStep, setCurrentStep] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  
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
            } else {
              preloadAdScript(); // Preload for free users
            }
          } else {
            preloadAdScript();
          }
        } catch (error) {
          console.error("Failed to fetch neural tokens:", error);
          preloadAdScript(); // Preload on fail
        }
      } else {
        preloadAdScript(); // Preload for guests
      }
    };
    fetchUserData();
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
    if (isValidUrl && activeCategory === 'youtube') {
      setLoading(true);
      try {
        const response = await api.post('/notes/ytinfo', { videoUrl });
        setVideoInfo(response.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
  }, [videoUrl, isValidUrl, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => { if (videoUrl.trim()) fetchVideoInfo(); }, 800);
    return () => clearTimeout(timer);
  }, [videoUrl, fetchVideoInfo]);

  // Smooth Realistic Loading Simulation
  useEffect(() => {
    if (isGenerating) {
      const intervals = [1200, 4500, 9500, 15000];
      const timeouts = intervals.map((time, index) => {
        return setTimeout(() => {
          setCurrentStep(prev => (prev < index + 1 ? index + 1 : prev));
        }, time);
      });
      return () => timeouts.forEach(clearTimeout);
    } else {
      setCurrentStep(0);
    }
  }, [isGenerating]);

  const handleGenerateProcess = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }
    
    // Premium model check
    if (selectedModel.accessTier === 'Premium' && !hasPremiumAccess) {
      setShowPremiumModal(true);
      return;
    }

    // Scholar plan cannot use Vyavastha
    if (selectedModel.id === 'vyavastha' && userPlanId === 'scholar') {
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
          model: selectedModel.id,
          flashcardCount: flashcardCount,
          settings: { language: outputLanguage, detailLevel }
        };

        const fcResponse = await api.post('/flashcards/generate', fcPayload, { headers: { 'Auth': authToken } });

        if (fcResponse.data?.success && fcResponse.data?.newFlashcardSet?.slug) {
          setCurrentStep(4);
          if (!hasPremiumAccess && userTokens !== null) {
            setUserTokens(prev => Math.max(0, (prev || 0) - (fcResponse.data.tokenInfo?.tokensDeducted || 5)));
          }
          setTimeout(() => {
            router.push(`/flashcards/${fcResponse.data.newFlashcardSet.slug}`);
          }, 600);
        }
        return;
      }

      // ── NOTES MODE: existing flow ──
      const endpoint = `/notes/${selectedModel.endpoint}`;
      const response = await api.post(endpoint, payload, { headers: { 'Auth': authToken } });

      if (response.data?.success && response.data?.newNote?.slug) {
        setCurrentStep(4);
        
        if (!hasPremiumAccess && userTokens !== null) {
            setUserTokens(prev => Math.max(0, (prev || 0) - (response.data.tokensDeducted || 5)));
        }

        setTimeout(() => {
           router.push(`/notes/${response.data.newNote.slug}`);
        }, 600);
      }

    } catch (err: any) {
        setIsGenerating(false);
        const errData = err.response?.data;

        // Correctly handle the new Insufficient Tokens response
        if (errData?.code === "INSUFFICIENT_TOKENS") {
            setTokenErrorData(errData);
        } else if (errData?.code === "MODEL_NOT_AVAILABLE" || errData?.code === "VIDEO_TOO_LONG") {
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

    if (!hasPremiumAccess && selectedModel.endpoint === "free") {
      setShowAdDialog(true);
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
        featureName={selectedModel.name}
      />

      {/* External Modals */}
      <SubscriptionDialog open={showPaywall} onOpenChange={setShowPaywall} />
      <AdDialog open={showAdDialog} onOpenChange={setShowAdDialog} onAdComplete={handleGenerateProcess} />

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
                    
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Access Restricted</h3>
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
                <div className="space-y-4 md:space-y-5 flex justify-center">
                  <AnimatePresence mode="wait">
                    <motion.h1 
                      key={activeCategory}
                      initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2"
                    >
                      {activeCategory === 'youtube' && <><span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">Turn YouTube</span> <br className="hidden sm:block"/> Into Knowledge.</>}
                      {activeCategory === 'coding' && <><span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-blue-700 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">Master Coding</span> <br className="hidden sm:block"/> & Job Prep.</>}
                      {activeCategory === 'document' && <><span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-500 to-purple-700 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">Analyze PDFs</span> <br className="hidden sm:block"/> In Seconds.</>}
                      {activeCategory === 'writing' && <><span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-500 to-emerald-700 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">AI Writing</span> <br className="hidden sm:block"/> Perfected.</>}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              </div>

              {/* Top Level App Categories - Mobile Optimized Scroll container */}
              <div onWheel={handleHorizontalScroll} className="flex relative w-full max-w-3xl overflow-x-auto p-1.5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-[1.2rem] sm:rounded-[1.8rem] mb-6 md:mb-8 no-scrollbar scroll-fade-x flex-nowrap shrink-0 shadow-xl z-20">
                 {HOME_CATEGORIES.map(c => {
                    const isActive = activeCategory === c.id;
                    return (
                        <button 
                          key={c.id} 
                          onClick={() => {
                            setActiveCategory(c.id);
                            setOutputFormat(CATEGORY_TOOLS[c.id][0].id);
                            setVideoUrl(''); // Reset input between major sections
                          }} 
                          className={cn("flex-1 relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-[1.4rem] font-bold text-[12px] sm:text-[13px] flex items-center justify-center gap-2 transition-colors duration-200 whitespace-nowrap shrink-0", isActive ? "text-black" : "text-neutral-400 hover:text-white hover:bg-white/[0.06]")}
                        >
                           {isActive && (
                             <motion.div 
                               layoutId="activeTabIndicator"
                               className="absolute inset-0 bg-white rounded-xl sm:rounded-[1.4rem] shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                               transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                             />
                           )}
                           <c.icon size={16} className={cn("relative z-10 sm:w-[18px] sm:h-[18px]", isActive ? "text-black" : "text-neutral-500")} />
                           <span className="relative z-10">{c.label}</span>
                        </button>
                    )
                 })}
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
                    {videoInfo && !loading && activeCategory === 'youtube' && (
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
                          return (
                            <motion.button 
                              layout
                              initial={{ opacity: 0, scale: 0.8, x: -20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.8, x: 20 }}
                              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              key={tool.id}
                              onClick={() => { setOutputFormat(tool.id); if (tool.id === 'flashcards') setFlashcardCount(hasPremiumAccess ? 10 : 5); }}
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
                            </motion.button>
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
                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/15 text-[11px] font-bold text-neutral-400 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                          <IconRobot size={14} className="text-neutral-600 group-hover:text-blue-400 transition-colors" />
                          <span>{selectedModel.name}</span>
                          <ChevronDown size={11} className="text-neutral-600" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/95 backdrop-blur-2xl border-white/10 text-white min-w-[240px] p-2 rounded-[1.25rem] shadow-[0_10px_50px_-10px_rgba(0,0,0,1)] z-50">
                          <div className="px-3 pb-2 pt-1 border-b border-white/5 mb-1.5">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-1.5"><IconBrain size={11} className="text-blue-500" /> Intelligence Array</p>
                          </div>
                          {AI_MODELS.map(m => {
                            const isLocked = m.accessTier === 'Premium' && !hasPremiumAccess;
                            const isVyavasthaPlanLocked = m.id === 'vyavastha' && hasPremiumAccess && userPlanId === 'scholar';
                            return (
                              <DropdownMenuItem key={m.id} onClick={() => {
                                if (isLocked) { const t = localStorage.getItem('authToken'); if (!t) { setShowLoginModal(true); return; } setShowPremiumModal(true); return; }
                                if (isVyavasthaPlanLocked) { setShowPremiumModal(true); return; }
                                setSelectedModel(m);
                              }} className={cn("cursor-pointer rounded-xl p-2.5 mb-0.5 transition-all duration-200 outline-none flex items-center gap-2.5 focus:bg-neutral-800/80 focus:text-white", m.id === selectedModel.id ? "bg-white/8 text-white" : "text-neutral-400 hover:bg-neutral-900/50")}>
                                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0">
                                  <IconRobot size={14} className={m.id === selectedModel.id ? "text-blue-400" : "text-neutral-600"} />
                                </div>
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                  <span className="font-bold text-[12px]">{m.name}</span>
                                  <span className="text-[9px] text-neutral-600">{m.accessTier} Tier</span>
                                </div>
                                {isLocked && <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-widest">PRO</span>}
                                {isVyavasthaPlanLocked && <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md uppercase">SCHOLAR+</span>}
                                {!isLocked && !isVyavasthaPlanLocked && m.id === selectedModel.id && <IconCheck size={13} className="text-blue-400 ml-auto shrink-0" />}
                              </DropdownMenuItem>
                            );
                          })}
                          <div className="mt-1 pt-1.5 border-t border-white/5">
                            <Link href="/models" className="block outline-none">
                              <DropdownMenuItem className="cursor-pointer rounded-xl p-2.5 flex items-center justify-center gap-2 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/5 font-bold text-[10px] uppercase tracking-wider outline-none focus:bg-blue-500/10 focus:text-blue-400 group transition-all">
                                View all models <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                              </DropdownMenuItem>
                            </Link>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Options Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/15 text-[11px] font-bold text-neutral-400 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                          <IconSettings size={14} className="text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                          <span className="hidden sm:inline">{outputLanguage} &middot; {detailLevel}{outputFormat === 'flashcards' && ` · ${flashcardCount} cards`}</span>
                          <span className="sm:hidden">Options</span>
                          <ChevronDown size={11} className="text-neutral-600" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/95 backdrop-blur-2xl border-white/10 text-white w-[270px] p-4 rounded-[1.25rem] shadow-[0_10px_50px_-10px_rgba(0,0,0,1)] z-50">
                          <div className="mb-4">
                            <div className="flex items-center gap-1.5 mb-2.5"><IconRobot size={12} className="text-purple-500" /><span className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Language</span></div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {LANGUAGES.slice(0,6).map(l => (
                                <div key={l} onClick={() => setOutputLanguage(l)} className={cn("text-[10px] text-center py-2 rounded-lg cursor-pointer font-bold transition-all border", outputLanguage === l ? "bg-white text-black border-white" : "bg-neutral-900/80 border-white/5 hover:border-white/20 text-neutral-500 hover:text-white")}>{l}</div>
                              ))}
                            </div>
                          </div>
                          <div className={outputFormat === 'flashcards' ? "mb-4" : ""}>
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

            </motion.div>
          ) : (
            /* ================= LOADING STATE ================= */
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 min-h-[60vh]"
            >
              
              {/* Left: Elegant Thumbnail Card */}
              <div className="relative w-full md:w-[480px] aspect-video">
                 <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-full opacity-50 transform-gpu"></div>
                 
                 <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl z-10 bg-neutral-900"
                 >
                    <img 
                      src={videoInfo?.thumbnail || "https://img.youtube.com/vi/placeholder/maxresdefault.jpg"} 
                      className="w-full h-full object-cover opacity-50 scale-105" 
                      alt="Processing Video"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                       <div className="inline-flex items-center gap-3 mb-3">
                         <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Processing Signal</span>
                       </div>
                       <h2 className="text-xl font-bold text-white line-clamp-2 leading-snug">
                         {videoInfo?.title || "Parsing Video Data..."}
                       </h2>
                    </div>
                 </motion.div>
              </div>

              {/* Right: Minimal Vertical Stepper */}
              <div className="w-full md:w-80 flex flex-col justify-center space-y-8 z-10">
                 {(outputFormat === 'flashcards' ? FLASHCARDS_LOADING_STEPS : NOTES_LOADING_STEPS).map((step, idx, arr) => {
                    const isCompleted = currentStep > idx;
                    const isActive = currentStep === idx;

                    return (
                      <div key={step.id} className="relative flex items-center gap-5 group">
                        
                        {/* Connecting Line */}
                        {idx !== arr.length - 1 && (
                          <div className={cn(
                            "absolute left-[17px] top-10 w-[2px] h-6 transition-colors duration-500",
                            isCompleted ? "bg-white" : "bg-white/5"
                          )}></div>
                        )}

                        {/* Icon/Status Bubble */}
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                          isCompleted ? "bg-white text-black border-white" : 
                          isActive ? "bg-black text-white border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]" : 
                          "bg-black text-neutral-700 border-neutral-800"
                        )}>
                           {isCompleted ? <IconCheck size={16} strokeWidth={3} /> : <step.icon size={16} />}
                        </div>

                        {/* Text */}
                        <div className="flex flex-col">
                           <span className={cn(
                             "text-sm font-bold transition-colors duration-500",
                             isCompleted || isActive ? "text-white" : "text-neutral-600"
                           )}>
                             {step.label}
                           </span>
                           <span className={cn(
                             "text-[9px] font-mono uppercase tracking-widest transition-all duration-300 h-3 mt-0.5",
                             isActive ? "text-blue-400 opacity-100" : "opacity-0"
                           )}>
                             {isActive ? "Executing..." : ""}
                           </span>
                        </div>
                      </div>
                    );
                 })}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}