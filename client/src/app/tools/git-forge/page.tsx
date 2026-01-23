"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  ArrowLeft, Download, GitBranch, GitCommit, 
  GitMerge, GitPullRequest, Terminal, Cpu, 
  Activity, Share2, ShieldCheck, ArrowRight, 
  RotateCcw, Trash2, Code, Sparkles, Zap, Trophy,
  Info, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { LoginDialog } from "@/components/LoginDialog"; // Assumed path

const GIT_ACTIONS = [
  { id: "init", label: "Initialize", cmd: "git init", icon: <RotateCcw size={14} />, desc: "Create a new local repository" },
  { id: "add", label: "Stage Changes", cmd: "git add .", icon: <Code size={14} />, desc: "Track all modified files" },
  { id: "commit", label: "Commit", cmd: 'git commit -m "Initialize Node"', icon: <GitCommit size={14} />, desc: "Save snapshot to history" },
  { id: "branch", label: "New Branch", cmd: "git checkout -b feature-alpha", icon: <GitBranch size={14} />, desc: "Create isolated workflow" },
  { id: "merge", label: "Merge", cmd: "git merge feature-alpha", icon: <GitMerge size={14} />, desc: "Integrate branch into main" },
  { id: "undo", label: "Hard Reset", cmd: "git reset --hard HEAD~1", icon: <Trash2 size={14} />, desc: "Wipe last commit forever" },
];

export default function GitForgePage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const addAction = (action: any) => {
    // PSYCHOLOGY: Loss Aversion - Limit guest actions to 5 to prompt login
    if (!user && history.length >= 5) {
      setIsLoginOpen(true);
      toast.info("Forge Buffer Full", { description: "Link your Neural ID to process unlimited sequences." });
      return;
    }

    setHistory([...history, { ...action, timestamp: new Date().toLocaleTimeString(), uid: Math.random() }]);
    toast.success(`${action.label} forged into sequence`);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.info("Forge cache cleared");
  };

  const handleDownload = useCallback(async () => {
    if (!exportRef.current) return;
    const loadingToast = toast.loading("Synthesizing Tactical Blueprint...");
    try {
      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        backgroundColor: '#000' 
      });
      const link = document.createElement("a");
      link.download = `PaperTube-Git-Flow.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Blueprint Generated", { id: loadingToast });
    } catch (err) {
      toast.error("Export Interrupted", { id: loadingToast });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-orange-500/30 font-sans pb-12">
      
      {/* 🔴 PSYCHOLOGY TRIGGER: Social Proof Banner */}
      <div className="bg-orange-600 py-1.5 px-4 text-center overflow-hidden">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white flex justify-center items-center gap-3">
          <Trophy size={10} /> Live: 1,842 Tactical flows synthesized in the last 24h
        </div>
      </div>

      <header className="sticky top-0 z-[100] border-b border-white/5 bg-black/80 backdrop-blur-xl px-4 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-orange-600/10 text-neutral-500 hover:text-orange-500 rounded-xl transition-all">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="hidden xs:flex flex-col">
              <h1 className="text-xs lg:text-sm font-black uppercase italic tracking-tighter">Command Forge</h1>
              <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Protocol v2.4</span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {!user && (
              <Button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-transparent hover:bg-white/5 text-white border border-white/10 text-[9px] font-black uppercase italic rounded-xl px-4 h-10 transition-all hidden sm:flex"
              >
                Sync Neural ID
              </Button>
            )}
            <Button 
              onClick={handleDownload} 
              className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic rounded-xl px-6 lg:px-8 h-10 lg:h-12 shadow-[0_0_30px_rgba(234,88,12,0.3)] active:scale-90 transition-all text-[10px] lg:text-xs"
            >
              <Download size={16} className="mr-2" /> Export <span className="hidden sm:inline">Schematic</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* --- SIDEBAR: ACTION MODULES --- */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Action Modules</span>
              <button onClick={clearHistory} className="text-[8px] uppercase font-black text-neutral-700 hover:text-red-500 transition-colors">Purge Buffer</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {GIT_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => addAction(action)}
                  className="group flex items-center justify-between p-4 bg-neutral-950 border border-white/5 rounded-2xl hover:border-orange-500/40 transition-all duration-300 active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-black border border-white/5 text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">{action.label}</p>
                      <p className="text-[9px] text-neutral-600 font-medium group-hover:text-neutral-400">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-neutral-800 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            {/* 🔴 LOSS AVERSION BLOCK */}
            {!user && (
               <div className="bg-orange-950/20 border border-orange-500/20 p-6 rounded-[2rem] flex gap-4 backdrop-blur-sm">
                  <ShieldAlert className="text-orange-500 shrink-0" size={20} />
                  <p className="text-[10px] font-medium text-neutral-400 leading-relaxed uppercase">
                    <span className="text-orange-500 font-black italic">Unverified Hub:</span> Sequences will be <span className="text-white underline font-bold">purged</span> on exit. Link Google ID to save tactical history.
                  </p>
               </div>
            )}
          </div>

          {/* --- MAIN STAGE: VISUALIZATION --- */}
          <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-800">Visual Synthesis</span>
              <Badge variant="outline" className="border-white/5 text-neutral-600 font-bold uppercase text-[8px]">{history.length} Sequences Active</Badge>
            </div>

            <div 
              ref={exportRef}
              className="relative rounded-[3rem] bg-[#000000] border border-white/10 p-6 lg:p-12 min-h-[550px] flex flex-col shadow-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] bg-[size:30px_30px]" />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {/* Branch visualization  */}
                <div className="space-y-6">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500/50 flex items-center gap-2">
                    <Activity size={12} /> Neural Flow Mapper
                  </h4>
                  <div className="relative pl-4 lg:pl-8 space-y-6 lg:space-y-8">
                    <div className="absolute left-6 lg:left-10 top-0 w-0.5 h-full bg-gradient-to-b from-orange-600 to-transparent opacity-20" />
                    
                    <AnimatePresence mode="popLayout">
                      {history.length > 0 ? history.map((item, i) => (
                        <motion.div 
                          key={item.uid} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 lg:gap-6 group/item"
                        >
                          <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-black border-2 border-orange-500 z-10 shadow-[0_0_15px_rgba(234,88,12,0.3)] relative shrink-0">
                             <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-10" />
                          </div>
                          <div className="p-3 lg:p-4 bg-neutral-900/50 border border-white/5 rounded-2xl flex-1 hover:border-orange-500/20 transition-all">
                             <div className="flex justify-between items-center mb-1">
                               <span className="text-[9px] lg:text-[10px] font-black uppercase text-white tracking-widest">{item.label}</span>
                               <span className="text-[7px] font-mono text-neutral-700">{item.timestamp}</span>
                             </div>
                             <p className="text-[9px] font-mono text-orange-500/80 italic">{item.cmd}</p>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                          <Cpu size={32} className="text-neutral-900" />
                          <p className="text-[10px] font-black uppercase italic tracking-widest text-neutral-800">Awaiting Signal...</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Console output  */}
                <div className="space-y-6">
                   <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500/50 flex items-center gap-2">
                    <Terminal size={12} /> Console Output
                  </h4>
                  <Card className="bg-[#050505] border-white/5 rounded-[2rem] p-6 h-full font-mono text-[10px] lg:text-xs leading-relaxed overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-4 opacity-30">
                      <div className="w-2 h-2 rounded-full bg-red-500/50" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                      <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    </div>
                    <div className="space-y-2">
                      {history.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-neutral-800 select-none">{i + 1}</span>
                          <span className="text-orange-500">$</span>
                          <span className="text-neutral-400">{item.cmd}</span>
                        </div>
                      ))}
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-1.5 bg-orange-600" />
                    </div>
                  </Card>
                </div>
              </div>

              <div className="absolute bottom-8 right-10 flex items-center gap-2 select-none grayscale opacity-30">
                <div className="h-4 w-px bg-white/20" />
                <span className="text-[12px] font-black tracking-[0.3em] uppercase italic text-white">
                  Paper<span className="text-orange-500">Tube</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Metrics */}
      <section className="container mx-auto px-4 pb-12 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-16">
          <Metric icon={<ShieldCheck size={20} className="text-emerald-500" />} title="Verified Protocol" desc="Local state management ensures your directory structures remain private." />
          <Metric icon={<GitPullRequest size={20} className="text-orange-500" />} title="Tactical Mapping" desc="Convert linear logic into multi-branch visual documentation." />
          <Metric icon={<Sparkles size={20} className="text-purple-500" />} title="DPI Synthesis" desc="High-density PNG exports ready for technical documentation and slides." />
        </div>
      </section>

      <Footer />
      
      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={(t, info) => {
          const u = { username: info.name.split(' ')[0], picture: info.picture };
          localStorage.setItem("user", JSON.stringify(u));
          setUser(u);
          setIsLoginOpen(false);
          toast.success("Neural Link Established");
        }} 
      />
    </div>
  );
}

function Metric({ icon, title, desc }: any) {
  return (
    <div className="space-y-3 group cursor-default">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">{icon}</div>
      <h4 className="text-xs font-black uppercase italic tracking-widest text-white">{title}</h4>
      <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}