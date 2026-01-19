"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowLeft, Download, Keyboard, Timer, 
  Zap, Target, AlertCircle, RefreshCw, 
  BarChart3, Activity, Cpu, ShieldCheck, 
  ArrowRight, Share2, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";

// --- Configuration: Technical Quotes ---
const SAMPLES = [
  "The quick brown fox jumps over the lazy dog of engineering. System architecture requires absolute precision and low-latency feedback loops to maintain 99.9% uptime.",
  "Neural networks function by propagating signals through layers of interconnected nodes. Optimization of these weight matrices is essential for high-fidelity data synthesis.",
  "Concurrency in distributed systems introduces complex race conditions. Engineers must implement atomic operations and robust locking protocols to ensure global consistency.",
];

export default function TypingTestPage() {
  // --- States ---
  const [sampleText, setSampleText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [metrics, setMetrics] = useState({ wpm: 0, accuracy: 0, mistakes: 0, time: 0 });
  const [charResults, setCharResults] = useState<{char: string, status: 'correct' | 'wrong' | 'pending'}[]>([]);

  const reportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // --- Logic: Initialization ---
  useEffect(() => {
    const random = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setSampleText(random);
    setCharResults(random.split('').map(c => ({ char: c, status: 'pending' })));
  }, []);

  // --- Logic: Typing Mechanism ---
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;

    const value = e.target.value;
    if (!startTime) setStartTime(Date.now());

    // Update character statuses
    const updated = sampleText.split('').map((char, i) => {
      if (i >= value.length) return { char, status: 'pending' as const };
      return { char, status: value[i] === char ? 'correct' as const : 'wrong' as const };
    });
    setCharResults(updated);
    setUserInput(value);

    // Check Completion
    if (value.length === sampleText.length) {
      finishTest(value);
    }
  };

  const finishTest = (finalInput: string) => {
    const endTime = Date.now();
    const timeInMinutes = (endTime - (startTime || endTime)) / 60000;
    const wordCount = sampleText.length / 5;
    const finalWpm = Math.round(wordCount / timeInMinutes);

    let errors = 0;
    finalInput.split('').forEach((char, i) => {
      if (char !== sampleText[i]) errors++;
    });

    const finalAccuracy = Math.round(((sampleText.length - errors) / sampleText.length) * 100);

    setMetrics({
      wpm: finalWpm,
      accuracy: finalAccuracy,
      mistakes: errors,
      time: Math.round((endTime - (startTime || endTime)) / 1000)
    });
    setIsFinished(true);
    toast.success("Mission Accomplished. Generating Report.");
  };

  const resetTest = () => {
    const random = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setSampleText(random);
    setUserInput("");
    setStartTime(null);
    setIsFinished(false);
    setCharResults(random.split('').map(c => ({ char: c, status: 'pending' })));
    inputRef.current?.focus();
  };

  const exportReport = useCallback(async () => {
    if (!reportRef.current) return;
    const loadingToast = toast.loading("Capturing Neural Report...");
    try {
      const dataUrl = await toPng(reportRef.current, { pixelRatio: 3, backgroundColor: '#000' });
      const link = document.createElement("a");
      link.download = `PaperTube-Typing-Report.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Report Saved", { id: loadingToast });
    } catch {
      toast.error("Export Error", { id: loadingToast });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <header className="relative z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <h1 className="text-sm font-black uppercase italic tracking-widest">Neural Velocity Test</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Typing Terminal v2.1</span>
              </div>
            </div>
          </div>
          {isFinished && (
            <Button onClick={exportReport} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-6 h-10 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <Download size={14} className="mr-2" /> Export Report
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div key="typing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              
              {/* --- Live HUD --- */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-950 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                  <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em]">Velocity</span>
                  <span className="text-2xl font-black italic text-red-500">{userInput.length > 0 ? Math.round((userInput.length / 5) / ((Date.now() - (startTime || Date.now())) / 60000)) || 0 : 0} WPM</span>
                </div>
                <div className="bg-neutral-950 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                  <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em]">Integrity</span>
                  <span className="text-2xl font-black italic text-blue-400">
                    {userInput.length > 0 ? Math.round(((userInput.length - charResults.filter(r => r.status === 'wrong').length) / userInput.length) * 100) : 100}%
                  </span>
                </div>
                <div className="bg-neutral-950 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                  <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em]">Protocol Time</span>
                  <span className="text-2xl font-black italic text-neutral-400">{startTime ? Math.round((Date.now() - startTime) / 1000) : 0}s</span>
                </div>
              </div>

              {/* --- Typing Area --- */}
              <div className="relative p-10 bg-neutral-950 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden min-h-[300px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.03)_0,transparent_100%)]" />
                
                <div className="relative z-10 text-2xl font-mono leading-relaxed tracking-tight flex flex-wrap gap-x-1 gap-y-2">
                  {charResults.map((res, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "transition-all duration-150",
                        res.status === 'correct' ? "text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" : 
                        res.status === 'wrong' ? "text-white bg-red-600 rounded px-0.5" : 
                        "text-neutral-700"
                      )}
                    >
                      {res.char === " " ? "\u00A0" : res.char}
                      {i === userInput.length && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute w-0.5 h-8 bg-red-600" />}
                    </span>
                  ))}
                </div>

                <textarea
                  ref={inputRef}
                  autoFocus
                  value={userInput}
                  onChange={handleInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                />
              </div>

              <div className="text-center">
                 <p className="text-[10px] font-black uppercase text-neutral-800 tracking-[0.5em] animate-pulse">Scanning Input Device...</p>
              </div>

            </motion.div>
          ) : (
            /* --- Post-Mission Report (Graphical Result) --- */
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              
              <div ref={reportRef} className="bg-[#000000] border border-red-600/30 rounded-[3rem] p-16 shadow-[0_40px_80px_-20px_rgba(220,38,38,0.2)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.05)_0,transparent_50%)]" />
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
                  <div className="space-y-2">
                    <h2 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none">NEURAL <br /><span className="text-red-600">REPORT</span></h2>
                    <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-[0.4em]">Node Hash: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
                    <ResultStat label="Words Per Minute" value={metrics.wpm} color="text-red-500" sub="Velocity" />
                    <ResultStat label="Accuracy Level" value={`${metrics.accuracy}%`} color="text-blue-500" sub="Integrity" />
                    <ResultStat label="System Mistakes" value={metrics.mistakes} color="text-orange-500" sub="Packet Loss" />
                    <ResultStat label="Task Duration" value={`${metrics.time}s`} color="text-neutral-500" sub="Sync Time" />
                  </div>
                </div>

                {/* Graphical Analysis Simulation */}
                <div className="mt-16 pt-12 border-t border-white/5 flex items-end gap-2 h-40">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const height = Math.random() * (metrics.accuracy > 80 ? 100 : 60);
                    return (
                      <motion.div 
                        key={i} initial={{ height: 0 }} animate={{ height: `${height}%` }}
                        className={cn("flex-1 rounded-t-sm", metrics.accuracy > 80 ? "bg-red-600/20" : "bg-neutral-800")} 
                      />
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between px-2">
                   <span className="text-[8px] font-black text-neutral-800 uppercase tracking-widest">Efficiency Waveform</span>
                   <span className="text-[8px] font-black text-neutral-800 uppercase tracking-widest">End of Stream</span>
                </div>

                {/* --- BRAND WATERMARK --- */}
                <div className="absolute bottom-10 right-12 flex items-center gap-2 select-none opacity-40">
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <span className="text-[16px] font-black tracking-[0.3em] uppercase italic text-white">
                    Paper<span className="text-red-600">Tube</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button onClick={resetTest} size="lg" className="h-16 px-10 bg-white text-black hover:bg-red-600 hover:text-white rounded-2xl font-black uppercase italic transition-all group">
                   <RefreshCw className="mr-3 group-hover:rotate-180 transition-transform duration-500" /> New Session
                 </Button>
                 <Button onClick={() => router.push('/tools')} variant="outline" className="h-16 px-10 border-white/10 hover:bg-white/5 rounded-2xl font-black uppercase italic tracking-widest text-neutral-500">
                   Return to Hub
                 </Button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function ResultStat({ label, value, color, sub }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.2em]">{label}</p>
      <p className={cn("text-4xl font-black italic tracking-tighter leading-none", color)}>{value}</p>
      <p className="text-[8px] font-bold text-neutral-800 uppercase tracking-widest">{sub}</p>
    </div>
  );
}