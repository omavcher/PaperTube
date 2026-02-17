"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  ArrowLeft, Download, Keyboard, Timer, 
  Zap, Target, AlertCircle, RefreshCw, 
  Activity, Cpu, ShieldCheck, 
  ArrowRight, Share2, Terminal, Trophy,
  Sparkles, MousePointer2, Home, Grid, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { LoginDialog } from "@/components/LoginDialog";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "../CorePromo";

// --- Technical Engineering Samples ---
const SAMPLES = [
  "Distributed systems achieve high availability through data replication and consensus algorithms like Paxos or Raft. Low-latency edge computing minimizes the propagation delay for global users.",
  "Modern frontend frameworks utilize a virtual DOM to optimize rendering cycles. Reconciler algorithms identify minimal state changes to provide 60fps fluid interactions on mobile hardware.",
  "Cryptographic signatures ensure data integrity across insecure channels. Asymmetric encryption protocols use prime factorization complexity to harden systems against unauthorized packet interception.",
  "Microservices architecture enables independent scaling of modular services. Container orchestration via Kubernetes automates deployment, monitoring, and self-healing of cloud-native clusters.",
  "Neural link synthesis requires a high-fidelity feedback loop between the hardware interface and software processing nodes to maintain a stable synaptic connection in real-time."
];

export default function TypingTestClient() {
  const router = useRouter();
  useToolAnalytics("typing-speed-test", "VELOCITY", "Engineering Tools");
  
  // --- States ---
  const [sampleText, setSampleText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [metrics, setMetrics] = useState({ wpm: 0, accuracy: 0, mistakes: 0, time: 0 });
  const [charResults, setCharResults] = useState<{char: string, status: 'correct' | 'wrong' | 'pending'}[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    initTest();
  }, []);

  const initTest = () => {
    const random = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setSampleText(random);
    setCharResults(random.split('').map(c => ({ char: c, status: 'pending' })));
    setUserInput("");
    setStartTime(null);
    setIsFinished(false);
    // Focus input on init
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // --- Logic: Real-time Stats ---
  const liveWpm = useMemo(() => {
    if (!startTime || userInput.length === 0) return 0;
    const timeInMinutes = (Date.now() - startTime) / 60000;
    return Math.round((userInput.length / 5) / timeInMinutes);
  }, [userInput, startTime]);

  const liveAccuracy = useMemo(() => {
    if (userInput.length === 0) return 100;
    const wrong = charResults.filter(r => r.status === 'wrong').length;
    return Math.round(((userInput.length - wrong) / userInput.length) * 100);
  }, [userInput, charResults]);

  // --- Input Mechanism ---
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;

    const value = e.target.value;
    if (value.length > sampleText.length) return;
    
    if (!startTime) setStartTime(Date.now());

    const updated = sampleText.split('').map((char, i) => {
      if (i >= value.length) return { char, status: 'pending' as const };
      return { char, status: value[i] === char ? 'correct' as const : 'wrong' as const };
    });
    
    setCharResults(updated);
    setUserInput(value);

    if (value.length === sampleText.length) {
      finishTest(value);
    }
  };

  const finishTest = (finalInput: string) => {
    const endTime = Date.now();
    const duration = (endTime - (startTime || endTime)) / 1000;
    
    // PSYCHOLOGY: Loss Aversion - Limit guests to 3 tests before login prompt
    const testCount = Number(localStorage.getItem("test_count") || 0) + 1;
    localStorage.setItem("test_count", testCount.toString());

    if (!user && testCount >= 3) {
      setIsLoginOpen(true);
      toast.info("Secure Your Ranking", { description: "Sign in to save your velocity history." });
    }

    setMetrics({
      wpm: liveWpm,
      accuracy: liveAccuracy,
      mistakes: charResults.filter(r => r.status === 'wrong').length,
      time: Math.round(duration)
    });
    setIsFinished(true);
    toast.success("Sync Complete. Analyzing Waveform.");
  };

  const exportReport = useCallback(async () => {
    if (!reportRef.current) return;
    const loadingToast = toast.loading("Synthesizing Neural Report...");
    try {
      const dataUrl = await toPng(reportRef.current, { pixelRatio: 3, backgroundColor: '#000' });
      const link = document.createElement("a");
      link.download = `PaperTube-Velocity-${metrics.wpm}WPM.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Artifact Exported", { id: loadingToast });
    } catch {
      toast.error("Export Failed", { id: loadingToast });
    }
  }, [metrics]);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans pb-20 flex flex-col">
      
      {/* 🔴 PSYCHOLOGY: Social Proof Banner */}
      <div className="bg-red-600/10 border-b border-red-600/20 py-2 px-4 text-center overflow-hidden">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 animate-pulse flex justify-center items-center gap-2">
          <Trophy size={12} /> Live: Top 1% are reaching 120+ WPM today
        </div>
      </div>

      {/* --- Desktop Navbar --- */}
      <header className="hidden md:flex relative z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-10 py-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/tools">
            <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl transition-all">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col">
            <h1 className="text-xs lg:text-sm font-black uppercase italic tracking-widest">Neural Velocity</h1>
            <span className="text-[7px] lg:text-[8px] font-black text-neutral-600 uppercase tracking-widest">Capture Engine v2.2</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-zinc-400">{user.username}</span>
            </div>
          ) : (
            <Button onClick={() => setIsLoginOpen(true)} className="bg-transparent hover:bg-white/5 text-white border border-white/10 text-[9px] font-black uppercase italic rounded-xl px-4 h-9">Sync ID</Button>
          )}
          {isFinished && (
            <Button onClick={exportReport} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-6 h-9 transition-all active:scale-95 shadow-lg shadow-red-900/20 text-[10px]">
              <Download size={14} className="mr-2" /> Export
            </Button>
          )}
        </div>
      </header>

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Timer className="text-red-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">VELOCITY</span>
        </div>
        <div className="flex gap-2">
           {isFinished && <Button variant="ghost" size="icon" onClick={exportReport} className="h-8 w-8 text-red-500"><Download className="h-5 w-5" /></Button>}
           <Link href="/tools">
             <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-5 w-5" /></Button>
           </Link>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 lg:py-16 relative z-10 w-full">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div key="typing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 lg:space-y-12">
              
              {/* --- Live HUD (Responsive Grid) --- */}
              <div className="grid grid-cols-3 gap-3 lg:gap-6">
                <StatBox label="Velocity" value={`${liveWpm} WPM`} color="text-red-500" />
                <StatBox label="Integrity" value={`${liveAccuracy}%`} color="text-blue-400" />
                <StatBox label="Sync Time" value={`${startTime ? Math.round((Date.now() - startTime) / 1000) : 0}s`} color="text-neutral-500" />
              </div>

              {/* --- Typing Stage (Mobile Optimized) --- */}
              <div 
                onClick={() => inputRef.current?.focus()}
                className="relative p-6 lg:p-12 bg-neutral-950 border border-white/5 rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden min-h-[250px] lg:min-h-[350px] cursor-text group"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.03)_0,transparent_100%)]" />
                
                {/* 🔴 Visual Feedback: Focus Nudge */}
                {!startTime && (
                  <div className="absolute top-4 right-6 flex items-center gap-2 text-neutral-800 animate-bounce">
                    <MousePointer2 size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Click to focus</span>
                  </div>
                )}

                <div className="relative z-10 text-lg lg:text-2xl font-mono leading-relaxed tracking-tight flex flex-wrap gap-x-1 lg:gap-x-1.5 gap-y-2 lg:gap-y-4">
                  {charResults.map((res, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "transition-all duration-100",
                        res.status === 'correct' ? "text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" : 
                        res.status === 'wrong' ? "text-white bg-red-600 rounded px-0.5" : 
                        "text-neutral-800"
                      )}
                    >
                      {res.char === " " ? "\u00A0" : res.char}
                      {i === userInput.length && (
                        <motion.span 
                          layoutId="cursor"
                          animate={{ opacity: [0, 1, 0] }} 
                          transition={{ repeat: Infinity, duration: 0.8 }} 
                          className="absolute w-0.5 h-6 lg:h-8 bg-red-600" 
                        />
                      )}
                    </span>
                  ))}
                </div>

                {/* Hidden Native Input for All-Device Compatibility */}
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInput}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                />
              </div>

              <div className="text-center space-y-4">
                  <p className="text-[9px] font-black uppercase text-neutral-800 tracking-[0.4em] animate-pulse italic">Scanning Input Pattern...</p>
                  <div className="flex justify-center gap-4">
                    <Badge variant="outline" className="text-[8px] border-white/5 text-neutral-600">UTF-8 ENCODING</Badge>
                    <Badge variant="outline" className="text-[8px] border-white/5 text-neutral-600">NEURAL LINK v2.2</Badge>
                  </div>
              </div>

            </motion.div>
          ) : (
            /* --- Post-Test Report --- */
            <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 lg:space-y-12">
              
              <div ref={reportRef} className="bg-[#000000] border border-red-600/20 rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.04)_0,transparent_50%)]" />
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20">
                  <div className="space-y-4">
                    <h2 className="text-5xl lg:text-8xl font-black uppercase italic tracking-tighter text-white leading-none">
                      NEURAL <br /><span className="text-red-600">REPORT</span>
                    </h2>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-red-600 text-white font-black text-[9px] px-3 py-1 italic">V3.1 SECURE</Badge>
                        <span className="text-neutral-700 font-mono text-[9px] uppercase tracking-[0.2em]">Node_{Math.random().toString(36).substring(7)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-10 w-full lg:w-auto">
                    <ResultStat label="Velocity" value={metrics.wpm} sub="WORDS / MIN" color="text-red-500" />
                    <ResultStat label="Integrity" value={`${metrics.accuracy}%`} sub="PRECISION" color="text-blue-500" />
                    <ResultStat label="Packet Loss" value={metrics.mistakes} sub="MISTAKES" color="text-orange-500" />
                    <ResultStat label="Sync" value={`${metrics.time}s`} sub="DURATION" color="text-neutral-500" />
                  </div>
                </div>

                {/* Efficiency Graph Simulation  */}
                <div className="mt-20 pt-10 border-t border-white/5 flex items-end gap-1.5 lg:gap-3 h-32 lg:h-48">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const height = Math.random() * (metrics.accuracy > 90 ? 100 : 70) + 10;
                    return (
                      <motion.div 
                        key={i} initial={{ height: 0 }} animate={{ height: `${height}%` }}
                        className={cn("flex-1 rounded-t-sm transition-colors", metrics.accuracy > 85 ? "bg-red-600/30" : "bg-neutral-800")} 
                      />
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-between px-2 text-neutral-800 text-[8px] font-black uppercase tracking-widest">
                   <span>Input Frequency</span>
                   <span>Signal Terminated</span>
                </div>

                {/* BRANDING */}
                <div className="absolute bottom-8 right-10 flex items-center gap-2 select-none opacity-30 group">
                  <div className="h-4 w-px bg-white/20 mx-2" />
                  <span className="text-xl font-black tracking-[0.2em] uppercase italic text-white">
                    Paper<span className="text-red-600">Tube</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                  <Button onClick={initTest} size="lg" className="h-16 px-10 bg-white text-black hover:bg-red-600 hover:text-white rounded-[1.5rem] font-black uppercase italic transition-all group active:scale-95">
                    <RefreshCw className="mr-3 group-hover:rotate-180 transition-transform duration-500" size={20} /> Re-Initialize
                  </Button>
                  <Button onClick={() => router.push('/tools')} variant="outline" className="h-16 px-10 border-white/10 hover:bg-white/5 rounded-[1.5rem] font-black uppercase italic tracking-widest text-neutral-500 active:scale-95">
                    Foundry Hub
                  </Button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
        <CorePromo/>
      </main>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50">
        <div className="flex justify-around items-center h-16 px-2">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1">
            <Home size={20} />
            <span className="text-[9px] font-bold uppercase tracking-wide">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-red-500 transition-colors gap-1">
            <Grid size={20} />
            <span className="text-[9px] font-bold uppercase tracking-wide">Tools</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1">
            <Settings size={20} />
            <span className="text-[9px] font-bold uppercase tracking-wide">Settings</span>
          </Link>
        </div>
      </div>

      <Footer />
      
      {/* --- Auth Bridge --- */}
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={(t, info) => {
        const u = { username: info.name.split(' ')[0], picture: info.picture };
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
        setIsLoginOpen(false);
        toast.success("Identity Linked");
      }} />

      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}

// --- Sub-Components ---
function StatBox({ label, value, color }: any) {
  return (
    <div className="bg-neutral-900/30 border border-white/5 p-3 lg:p-6 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all hover:bg-neutral-900/50">
      <span className="text-[7px] lg:text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">{label}</span>
      <span className={cn("text-lg lg:text-3xl font-black italic tracking-tighter", color)}>{value}</span>
    </div>
  );
}

function ResultStat({ label, value, sub, color }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] lg:text-[10px] font-black text-neutral-600 uppercase tracking-widest">{label}</p>
      <p className={cn("text-3xl lg:text-6xl font-black italic tracking-tighter leading-none", color)}>{value}</p>
      <p className="text-[7px] lg:text-[9px] font-bold text-neutral-800 uppercase tracking-[0.3em]">{sub}</p>
    </div>
  );
}