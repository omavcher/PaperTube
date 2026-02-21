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
import { Loader2, ChevronDown, ArrowRight, Coins, AlertTriangle, X, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import SubscriptionDialog from "@/components/SubscriptionDialog";
import AdDialog from './AdDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

const LOADING_STEPS = [
  { id: 1, label: "Analyzing Video Structure", icon: IconBrandYoutube },
  { id: 2, label: "Extracting Key Concepts", icon: IconFileText },
  { id: 3, label: "Synthesizing Knowledge", icon: IconBrain },
  { id: 4, label: "Finalizing Notes", icon: IconSparkles },
];

export default function HomeMain() {
  const router = useRouter();
  
  // App States
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  
  // Configuration States
  const [outputLanguage, setOutputLanguage] = useState('English');
  const [detailLevel, setDetailLevel] = useState('Standard');

  // Logic & UI States
  const [loading, setLoading] = useState(false); 
  const [isGenerating, setIsGenerating] = useState(false); 
  const [currentStep, setCurrentStep] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  
  // User & Access States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [userTokens, setUserTokens] = useState<number | null>(null);
  
  // Modal States
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [tokenErrorData, setTokenErrorData] = useState<any>(null);

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
            }
          }
        } catch (error) {
          console.error("Failed to fetch neural tokens:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const isValidUrl = useMemo(() => YOUTUBE_REGEX.test(videoUrl), [videoUrl]);

  const fetchVideoInfo = useCallback(async () => {
    if (isValidUrl) {
      setLoading(true);
      try {
        const response = await api.post('/notes/ytinfo', { videoUrl });
        setVideoInfo(response.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
  }, [videoUrl, isValidUrl]);

  useEffect(() => {
    const timer = setTimeout(() => { if (videoUrl.trim()) fetchVideoInfo(); }, 800);
    return () => clearTimeout(timer);
  }, [videoUrl, fetchVideoInfo]);

  // Smooth Loading Simulation
  useEffect(() => {
    if (isGenerating) {
      const intervals = [800, 2800, 4800, 6500];
      intervals.forEach((time, index) => {
        setTimeout(() => {
          setCurrentStep(prev => (prev < index + 1 ? index + 1 : prev));
        }, time);
      });
    } else {
      setCurrentStep(0);
    }
  }, [isGenerating]);

  const handleGenerateProcess = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) { alert("Please login first"); return; }
    
    setIsGenerating(true);
    setTokenErrorData(null); 
    
    try {
      const payload = {
        videoUrl,
        prompt,
        type: 'notes',
        model: selectedModel.id,
        settings: {
          language: outputLanguage,
          detailLevel,
        }
      };

      const endpoint = `/notes/${selectedModel.endpoint}`;
      const response = await api.post(endpoint, payload, { headers: { 'Auth': authToken } });

      if (response.data?.success && response.data?.newNote?.slug) {
        setCurrentStep(4);
        
        // Deduct token locally for UI responsiveness if free user
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
        } else if (err.response?.status === 403) {
            setShowPaywall(true);
        } else {
            alert(errData?.message || "Something went wrong processing the signal. Please try again.");
        }
    }
  };

  const handleGenerateClick = () => {
    if (!hasPremiumAccess && selectedModel.endpoint === "free") {
      setShowAdDialog(true);
    } else {
      handleGenerateProcess();
    }
  };

  return (
    <section className="w-full min-h-screen relative flex flex-col items-center justify-center bg-black text-white px-4 py-10 font-sans selection:bg-neutral-800 selection:text-white overflow-hidden">
      
      {/* Subtle Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black opacity-80" />
      <div className="fixed inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

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
              <div className="text-center space-y-5 md:space-y-6 mb-6 md:mb-10">
                
                {/* Status Badge (Brand name moved here) */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md shadow-lg"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                  PaperTube Engine Active
                </motion.div>
                
                {/* Main Title & Subtitle */}
                <div className="space-y-4 md:space-y-5">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2">
                    Turn YouTube into <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                      Beautiful Notes.
                    </span>
                  </h1>
                </div>
              </div>

              {/* Main Interaction Card */}
              <div className="w-full max-w-3xl bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-2 relative">
                
                {/* --- Token Status Bar (Only for non-premium logged-in users) --- */}
                {isLoggedIn && !hasPremiumAccess && userTokens !== null && (
                   <div className="px-5 py-3 mb-2 flex items-center justify-between border-b border-white/5 bg-black/20 rounded-2xl mx-1 mt-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                         <Coins size={14} className="text-yellow-500" />
                         <span className="uppercase tracking-widest text-[9px] mt-0.5">Tokens Left: <span className="text-white font-mono text-xs">{userTokens.toLocaleString()}</span></span>
                      </div>
                      <Link href="/pricing" className="text-[9px] font-bold uppercase tracking-widest text-blue-400 hover:text-white transition-colors bg-blue-500/10 px-2 py-1 rounded-md">
                         Refill Node
                      </Link>
                   </div>
                )}

                {/* Input Area */}
                <div className="relative flex items-center bg-black/40 rounded-2xl border border-white/5 px-4 py-3 transition-colors focus-within:border-white/20 mt-2 mx-1">
                  <div className={cn("p-2 rounded-lg bg-neutral-800/50 text-neutral-400 transition-colors", isValidUrl && "text-red-500 bg-red-500/10")}>
                    <IconBrandYoutube size={20} />
                  </div>
                  <input 
                    placeholder="Paste Video Signal URL..." 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium text-white placeholder:text-neutral-600 px-4 outline-none w-full"
                  />
                  {loading && <Loader2 className="animate-spin text-neutral-500" size={18} />}
                </div>

                {/* Video Info Preview */}
                <AnimatePresence>
                  {videoInfo && !loading && (
                    <motion.div 
                      key="video-preview-card"
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden"
                    >
                       <div className="mt-2 mx-1 p-3 bg-neutral-800/20 rounded-xl border border-white/5 flex items-center gap-4">
                          <img src={videoInfo.thumbnail} className="w-20 h-12 rounded-lg object-cover bg-neutral-800" alt="thumb" />
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{videoInfo.title}</h3>
                            <p className="text-xs text-neutral-500 font-mono">{videoInfo.formattedDuration} • {videoInfo.channel}</p>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Text Area */}
                <div className="p-1 mt-2">
                  <textarea 
                    placeholder="Inject specific focal parameters... (Optional)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-24 bg-transparent border-none focus:ring-0 text-sm text-neutral-300 placeholder:text-neutral-700 resize-none outline-none p-4 font-medium"
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 p-2 pt-4 border-t border-white/5">
                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                     
                     {/* --- MODEL SELECTOR --- */}
                     <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 transition-colors">
                          <IconRobot size={16} className="text-neutral-400" /> {selectedModel.name} <ChevronDown size={12} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] border-white/10 text-white min-w-[220px] p-2 rounded-2xl shadow-2xl">
                          <div className="px-3 pb-2 mb-2 pt-1 border-b border-white/5">
                             <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Select Engine</p>
                          </div>
                          {AI_MODELS.map(m => (
                            <DropdownMenuItem key={m.id} onClick={() => setSelectedModel(m)} className="focus:bg-white/10 focus:text-white cursor-pointer rounded-xl p-3">
                              <span className="font-bold text-sm">{m.name}</span> 
                              {m.accessTier === 'Premium' && <span className="ml-auto text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded uppercase">PRO</span>}
                            </DropdownMenuItem>
                          ))}
                          
                          {/* Model Info Redirection */}
                          <div className="mt-2 pt-2 border-t border-white/5">
                              <Link href="/models" className="block outline-none">
                                  <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer rounded-xl p-3 flex items-center justify-center gap-2 text-red-500 font-bold uppercase tracking-widest text-[10px]">
                                      View Architecture <ArrowRight size={12} />
                                  </DropdownMenuItem>
                              </Link>
                          </div>
                        </DropdownMenuContent>
                     </DropdownMenu>

                     <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 transition-colors">
                          <IconSettings size={16} className="text-neutral-400" /> Options <ChevronDown size={12} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] border-white/10 text-white w-64 p-4 rounded-2xl shadow-2xl">
                            <div className="mb-5">
                              <span className="text-[9px] uppercase text-neutral-500 font-bold tracking-widest ml-1 mb-2 block">Language Matrix</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                {LANGUAGES.slice(0, 6).map(l => (
                                  <div key={l} onClick={() => setOutputLanguage(l)} className={cn("text-[10px] text-center py-2 rounded-xl cursor-pointer font-bold transition-all", outputLanguage === l ? "bg-white text-black shadow-md" : "bg-white/5 hover:bg-white/10 text-neutral-400")}>{l}</div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-neutral-500 font-bold tracking-widest ml-1 mb-2 block">Detail Depth</span>
                              <div className="flex gap-1.5">
                                {DETAIL_LEVELS.map(l => (
                                  <div key={l} onClick={() => setDetailLevel(l)} className={cn("flex-1 text-[10px] text-center py-2 rounded-xl cursor-pointer font-bold transition-all", detailLevel === l ? "bg-white text-black shadow-md" : "bg-white/5 hover:bg-white/10 text-neutral-400")}>{l}</div>
                                ))}
                              </div>
                            </div>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>

                  <button 
                    onClick={handleGenerateClick}
                    disabled={!isValidUrl || loading || isGenerating}
                    className={cn(
                      "group w-full md:w-auto h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all",
                      isValidUrl 
                        ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95" 
                        : "bg-neutral-900 text-neutral-500 cursor-not-allowed border border-white/5"
                    )}
                  >
                     {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                     <span>Initialize</span>
                  </button>
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
                 <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full opacity-50 animate-pulse"></div>
                 
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
                 {LOADING_STEPS.map((step, idx) => {
                    const isCompleted = currentStep > idx;
                    const isActive = currentStep === idx;

                    return (
                      <div key={step.id} className="relative flex items-center gap-5 group">
                        
                        {/* Connecting Line */}
                        {idx !== LOADING_STEPS.length - 1 && (
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