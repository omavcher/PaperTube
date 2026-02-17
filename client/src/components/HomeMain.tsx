"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/config/api';
import { 
  IconBrandYoutube, 
  IconRobot, 
  IconSettings,
  IconTerminal,
  IconSparkles,
  IconBrain,
  IconFileText,
  IconCheck
} from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import AdDialog from './AdDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants ---
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
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.membership?.isActive) setHasPremiumAccess(true);
      } catch (e) { console.error("User data parse error", e); }
    }
  }, []);

  const youtubeRegex = useMemo(() => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/, []);
  const isValidUrl = youtubeRegex.test(videoUrl);

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
        // Complete the visual steps before redirecting
        setCurrentStep(4);
        setTimeout(() => {
           router.push(`/notes/${response.data.newNote.slug}`);
        }, 600);
      }
    } catch (err: any) {
        setIsGenerating(false);
        if (err.response?.status === 403) setShowPaywall(true);
        else alert("Something went wrong. Please try again.");
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
    <section className="w-full min-h-screen relative flex flex-col items-center justify-center bg-black text-white px-4 py-10 selection:bg-neutral-800 selection:text-white">
      
      {/* Subtle Background Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>

      <SubscriptionDialog open={showPaywall} onOpenChange={setShowPaywall} />
      <AdDialog open={showAdDialog} onOpenChange={setShowAdDialog} onAdComplete={handleGenerateProcess} />

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
               <div className="text-center space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   AI Research Assistant
                 </div>
                 <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
                   Neural Study
                 </h1>
               </div>

              {/* Main Card */}
              <div className="w-full max-w-3xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-2">
                
                {/* Input Area */}
                <div className="relative flex items-center bg-black/40 rounded-2xl border border-white/5 px-4 py-3 transition-colors focus-within:border-white/20">
                  <div className={cn("p-2 rounded-lg bg-neutral-800/50 text-neutral-400 transition-colors", isValidUrl && "text-red-500 bg-red-500/10")}>
                    <IconBrandYoutube size={20} />
                  </div>
                  <input 
                    placeholder="Paste YouTube Link..." 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium text-white placeholder:text-neutral-600 px-4 outline-none w-full"
                  />
                  {loading && <Loader2 className="animate-spin text-neutral-500" size={18} />}
                </div>

                {/* Video Info Preview */}
                <AnimatePresence>
                  {videoInfo && !loading && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                       <div className="mt-2 mx-1 p-3 bg-neutral-800/20 rounded-xl border border-white/5 flex items-center gap-4">
                          <img src={videoInfo.thumbnail} className="w-20 h-12 rounded-lg object-cover bg-neutral-800" alt="thumb" />
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-white truncate">{videoInfo.title}</h3>
                            <p className="text-xs text-neutral-500">{videoInfo.formattedDuration} • {videoInfo.channel}</p>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Text Area */}
                <div className="p-1 mt-2">
                  <textarea 
                    placeholder="Any specific focus areas? (Optional)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-24 bg-transparent border-none focus:ring-0 text-sm text-neutral-300 placeholder:text-neutral-700 resize-none outline-none p-3"
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 p-2 pt-4 border-t border-white/5">
                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                     <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-300 transition-colors">
                          <IconRobot size={14} className="text-neutral-400" /> {selectedModel.name} <ChevronDown size={10} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-neutral-300">
                          {AI_MODELS.map(m => (
                            <DropdownMenuItem key={m.id} onClick={() => setSelectedModel(m)} className="focus:bg-neutral-800 focus:text-white cursor-pointer">
                              {m.name} {m.accessTier === 'Premium' && <span className="ml-2 text-[10px] text-yellow-500 bg-yellow-500/10 px-1 rounded">PRO</span>}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                     </DropdownMenu>

                     <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-300 transition-colors">
                          <IconSettings size={14} className="text-neutral-400" /> Options <ChevronDown size={10} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-neutral-300 w-56 p-2">
                            <div className="mb-2">
                              <span className="text-[10px] uppercase text-neutral-500 font-bold ml-2">Language</span>
                              <div className="grid grid-cols-3 gap-1 mt-1">
                                {LANGUAGES.slice(0, 3).map(l => (
                                  <div key={l} onClick={() => setOutputLanguage(l)} className={cn("text-[10px] text-center py-1 rounded cursor-pointer", outputLanguage === l ? "bg-white text-black" : "hover:bg-neutral-800")}>{l}</div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-neutral-500 font-bold ml-2">Detail</span>
                              <div className="flex gap-1 mt-1">
                                {DETAIL_LEVELS.map(l => (
                                  <div key={l} onClick={() => setDetailLevel(l)} className={cn("flex-1 text-[10px] text-center py-1 rounded cursor-pointer", detailLevel === l ? "bg-white text-black" : "hover:bg-neutral-800")}>{l}</div>
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
                      "group w-full md:w-auto h-10 px-6 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all",
                      isValidUrl 
                        ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                        : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    )}
                  >
                     <span>Generate</span>
                     <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Minimal Footer */}
              <div className="flex gap-6 text-[10px] text-neutral-600 uppercase tracking-widest font-medium">
                <span>V4.0 Stable</span>
                <span>•</span>
                <span>Encrypted</span>
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
                 {/* Glow Effect */}
                 <div className="absolute -inset-4 bg-white/5 blur-2xl rounded-full opacity-50 animate-pulse"></div>
                 
                 <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 bg-neutral-900"
                 >
                    <img 
                      src={videoInfo?.thumbnail || "https://img.youtube.com/vi/placeholder/maxresdefault.jpg"} 
                      className="w-full h-full object-cover opacity-60 scale-105" 
                      alt="Processing Video"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                       <div className="inline-flex items-center gap-2 mb-2">
                         <Loader2 className="w-3 h-3 text-white animate-spin" />
                         <span className="text-[10px] font-medium uppercase tracking-widest text-white/80">Processing</span>
                       </div>
                       <h2 className="text-xl font-medium text-white line-clamp-2 leading-snug">
                         {videoInfo?.title || "Analyzing Video..."}
                       </h2>
                    </div>
                 </motion.div>
              </div>

              {/* Right: Minimal Vertical Stepper */}
              <div className="w-full md:w-80 flex flex-col justify-center space-y-8 z-10">
                 {LOADING_STEPS.map((step, idx) => {
                    const isCompleted = currentStep > idx;
                    const isActive = currentStep === idx;
                    const isPending = currentStep < idx;

                    return (
                      <div key={step.id} className="relative flex items-center gap-4 group">
                        
                        {/* Connecting Line */}
                        {idx !== LOADING_STEPS.length - 1 && (
                          <div className={cn(
                            "absolute left-[15px] top-8 w-[1px] h-6 transition-colors duration-500",
                            isCompleted ? "bg-white/20" : "bg-white/5"
                          )}></div>
                        )}

                        {/* Icon/Status Bubble */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500",
                          isCompleted ? "bg-white text-black border-white" : 
                          isActive ? "bg-transparent text-white border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : 
                          "bg-transparent text-neutral-700 border-neutral-800"
                        )}>
                           {isCompleted ? <IconCheck size={14} /> : <step.icon size={14} />}
                        </div>

                        {/* Text */}
                        <div className="flex flex-col">
                           <span className={cn(
                             "text-sm font-medium transition-colors duration-500",
                             isCompleted || isActive ? "text-white" : "text-neutral-600"
                           )}>
                             {step.label}
                           </span>
                           <span className={cn(
                             "text-[10px] transition-all duration-300 h-3",
                             isActive ? "text-neutral-400 opacity-100" : "opacity-0"
                           )}>
                             {isActive ? "Processing..." : ""}
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