"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/config/api';
import { MultiStepLoader as Loader } from "./ui/multi-step-loader";
import { 
  IconBrandYoutube, 
  IconRobot, 
  IconSettings,
  IconCards,      
  IconPuzzle,     
  IconFileText,
  IconTerminal
} from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import { Activity, Loader2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import AdDialog from './AdDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants ---

const QUIZ_TYPES = [
  { id: 'mcq', label: 'MCQ' }, 
  { id: 'multi', label: 'Multi' }, 
  { id: 'truefalse', label: 'T/F' }, 
  { id: 'fill', label: 'Fill' }
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DETAIL_LEVELS = ['Short', 'Standard', 'Comprehensive'];
const LANGUAGES = ["English", "Hindi", "Marathi", "Bengali", "Telugu", "Tamil", "Kannada"];

// REMOVED REPORT FROM FEATURES
const FEATURES = [
  { id: 'notes', label: 'Notes', icon: IconFileText, placeholder: "Add specific instructions (e.g., 'Focus on math formulas')..." },
  { id: 'flashcards', label: 'Flash Cards', icon: IconCards, placeholder: "E.g., 'Focus on definitions, use mnemonic devices'..." },
  { id: 'quiz', label: 'Quiz', icon: IconPuzzle, placeholder: "E.g., 'Focus on dates and names, make it challenging'..." },
];

const AI_MODELS = [
  { id: "sankshipta", name: "Sankshipta", accessTier: "Free", endpoint: "free" },
  { id: "bhashasetu", name: "Bhasha-Setu", accessTier: "Free", endpoint: "free" },
  { id: "parikshasarthi", name: "Pariksha-Sarthi", accessTier: "Premium", endpoint: "premium" },
  { id: "vyavastha", name: "Vyavastha", accessTier: "Premium", endpoint: "premium" },
];

export default function HomeMain() {
  const router = useRouter();
  
  // App States
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  
  // Configuration States
  const [outputLanguage, setOutputLanguage] = useState('English');
  const [detailLevel, setDetailLevel] = useState('Standard');
  const [count, setCount] = useState(5); // Shared for Quiz/Flashcards
  const [difficulty, setDifficulty] = useState('medium');
  const [includeExplanation, setIncludeExplanation] = useState(true);
  const [quizType, setQuizType] = useState('multi');

  // Logic & UI States
  const [loading, setLoading] = useState(false);
  const [loaderLoading, setLoaderLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
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

  const handleGenerateProcess = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) { alert("Please login first"); return; }
    
    setLoaderLoading(true);
    try {
      const payload = {
        videoUrl,
        prompt,
        type: activeTab,
        model: activeTab === 'notes' ? selectedModel.id : 'default-model',
        settings: {
          language: outputLanguage,
          detailLevel,
          count,
          difficulty,
          includeExplanation,
          quizType
        }
      };

      const endpoint = activeTab === 'notes' ? `/notes/${selectedModel.endpoint}` : `/${activeTab}/generate`;
      const response = await api.post(endpoint, payload, { headers: { 'Auth': authToken } });

      if (response.data?.slug) {
        router.push(`/${activeTab}/${response.data.slug}`);
      }
    } catch (err: any) {
        if (err.response?.status === 403) setShowPaywall(true);
    } finally {
        setLoaderLoading(false);
    }
  };

  const handleGenerateClick = () => {
    if (!hasPremiumAccess && activeTab === 'notes' && selectedModel.endpoint === "free") {
      setShowAdDialog(true);
    } else {
      handleGenerateProcess();
    }
  };

  return (
    <section className="w-full min-h-screen relative flex flex-col items-center justify-start overflow-x-hidden bg-[#000000] px-4 py-10 md:py-20">
      
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <SubscriptionDialog open={showPaywall} onOpenChange={setShowPaywall} />
      <AdDialog open={showAdDialog} onOpenChange={setShowAdDialog} onAdComplete={handleGenerateProcess} />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center space-y-8 md:space-y-12">
        
        <div className="text-center space-y-4 px-2">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-red-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-500">
             <Activity size={10} className="animate-pulse" /> System Operational
           </motion.div>
           <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
             NEURAL <span className="text-red-600">STUDY</span> ENGINE
           </h1>
        </div>

        {/* Feature Tabs */}
        <div className="w-full overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2 min-w-max md:w-full p-1 bg-neutral-900/50 border border-white/5 rounded-2xl justify-evenly">
            {FEATURES.map((f) => (
              <button 
                key={f.id} 
                onClick={() => setActiveTab(f.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === f.id ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
                )}
              >
                <f.icon size={14} className={activeTab === f.id ? "text-red-600" : ""} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interface */}
        <div className="w-full space-y-4">
          <div className="rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-neutral-950/50 backdrop-blur-xl overflow-hidden shadow-2xl">
            
            <div className="flex flex-col md:flex-row items-center p-4 md:p-6 border-b border-white/5 gap-4">
              <div className={cn("p-3 rounded-xl bg-black border border-white/10 transition-colors", isValidUrl ? "text-red-500 border-red-500/30" : "text-neutral-700")}>
                <IconBrandYoutube size={24} />
              </div>
              <input 
                placeholder="Paste YouTube Link..." 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-base md:text-xl font-bold text-white placeholder:text-neutral-800 outline-none w-full"
              />
              {loading && <Loader2 className="animate-spin text-red-500" />}
            </div>

            <AnimatePresence>
              {videoInfo && !loading && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-6 py-3 bg-red-600/5 border-b border-white/5 flex items-center gap-4">
                  <img src={videoInfo.thumbnail} className="w-16 h-10 rounded-md object-cover border border-white/10" alt="thumb" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase text-white truncate">{videoInfo.title}</p>
                    <p className="text-[8px] font-bold text-neutral-500">{videoInfo.formattedDuration}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6 md:p-8">
              <textarea 
                placeholder={FEATURES.find(f => f.id === activeTab)?.placeholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 md:h-32 bg-transparent border-none focus:ring-0 text-white placeholder:text-neutral-800 font-medium resize-none outline-none text-sm leading-relaxed"
              />
            </div>

            {/* Footer Config Bar */}
            <div className="p-4 bg-neutral-900/50 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center">
              
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                {activeTab === 'notes' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="shrink-0 flex items-center gap-2 px-4 h-11 rounded-xl bg-black border border-white/10 text-[9px] font-black uppercase text-white">
                      <IconRobot size={14} className="text-red-500" /> {selectedModel.name} <ChevronDown size={10} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-neutral-950 border-white/10 text-white w-48 rounded-xl">
                      {AI_MODELS.map(m => (
                        <DropdownMenuItem key={m.id} onClick={() => setSelectedModel(m)} className="p-3 focus:bg-red-600/20 cursor-pointer">
                          <span className={cn(m.accessTier === 'Premium' && "text-yellow-500")}>{m.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger className="shrink-0 flex items-center gap-2 px-4 h-11 rounded-xl bg-black border border-white/10 text-[9px] font-black uppercase text-white">
                    <IconSettings size={14} className="text-red-500" /> Settings <ChevronDown size={10} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-neutral-950 border-white/10 text-white w-72 rounded-2xl p-4 space-y-5">
                    
                    {/* Language Selection */}
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500">Language</p>
                      <div className="grid grid-cols-3 gap-1">
                        {LANGUAGES.slice(0, 6).map(lang => (
                          <button key={lang} onClick={() => setOutputLanguage(lang)} className={cn("py-2 rounded-lg text-[8px] font-bold uppercase border transition-all", outputLanguage === lang ? "bg-red-600 border-red-500 text-white" : "bg-white/5 border-white/5 text-neutral-500")}>
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shared: Flashcard & Quiz Config */}
                    {(activeTab === 'quiz' || activeTab === 'flashcards') && (
                      <>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <div className="space-y-3">
                          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500">
                            {activeTab === 'quiz' ? 'Quiz' : 'Flashcard'} Parameters
                          </p>
                          
                          {/* Specific to Quiz */}
                          {activeTab === 'quiz' && (
                            <div className="grid grid-cols-2 gap-1">
                              {QUIZ_TYPES.map(type => (
                                <button key={type.id} onClick={() => setQuizType(type.id)} className={cn("py-2 rounded-lg text-[8px] font-bold border", quizType === type.id ? "border-red-500 bg-red-500/10" : "border-white/5")}>
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Shared: Difficulty */}
                          <div className="flex items-center justify-between gap-1">
                            {DIFFICULTIES.map(diff => (
                              <button key={diff} onClick={() => setDifficulty(diff)} className={cn("flex-1 py-1.5 rounded-md text-[8px] font-bold uppercase", difficulty === diff ? "bg-white text-black" : "text-neutral-500")}>
                                {diff}
                              </button>
                            ))}
                          </div>

                          {/* Shared: Item Count Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-black">
                              <span>{activeTab === 'quiz' ? 'QUESTIONS' : 'CARDS'}: {count}</span>
                              <span className={count > 5 ? "text-yellow-500" : "text-green-500"}>{count > 5 ? 'PRO' : 'FREE'}</span>
                            </div>
                            <input 
                              type="range" min="1" max={hasPremiumAccess ? 30 : 5} step="1" 
                              value={count} onChange={(e) => setCount(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                            />
                          </div>

                          {/* Toggle Explanation (Quiz Only) */}
                          {activeTab === 'quiz' && (
                            <button onClick={() => setIncludeExplanation(!includeExplanation)} className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 text-[9px] font-bold">
                               <span>DETAILED EXPLANATIONS</span>
                               <div className={cn("w-3 h-3 rounded-full border border-white/20", includeExplanation && "bg-red-500 border-red-500")} />
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {/* Common: Detail Level */}
                    <div className="space-y-2">
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500">Detail Level</p>
                       <div className="flex gap-1">
                         {DETAIL_LEVELS.map(lvl => (
                           <button key={lvl} onClick={() => setDetailLevel(lvl)} className={cn("flex-1 py-1.5 rounded-md text-[8px] font-bold", detailLevel === lvl ? "bg-red-600" : "bg-white/5")}>
                             {lvl}
                           </button>
                         ))}
                       </div>
                    </div>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button 
                onClick={handleGenerateClick}
                disabled={!isValidUrl || loading || loaderLoading}
                className={cn(
                  "w-full md:w-auto md:ml-auto h-12 px-8 rounded-xl font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95",
                  isValidUrl ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:bg-red-500" : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                )}
              >
                <IconTerminal size={16} /> 
                {activeTab === 'quiz' ? 'Start Assessment' : `Generate ${activeTab}`}
              </button>
            </div>
          </div>
        </div>

        {/* Global Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {["Security: Encrypted", "AI Cluster: V4-Neural", "Latency: 0.23ms"].map((stat, i) => (
             <div key={i} className="text-center">
               <p className="text-[7px] font-black uppercase tracking-[0.3em] text-neutral-500">{stat.split(':')[0]}</p>
               <p className="text-[10px] font-black text-white italic">{stat.split(':')[1]}</p>
             </div>
           ))}
        </div>

      </div>

      <Loader loading={loaderLoading} duration={2000} loadingStates={[
        { text: "Hooking YouTube API..." },
        { text: "Injecting Neural Prompts..." },
        { text: "Synthesizing Content..." },
        { text: "Finalizing Protocol..." }
      ]} />
    </section>
  );
}