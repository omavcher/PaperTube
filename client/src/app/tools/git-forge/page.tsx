"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  ArrowLeft, Download, GitBranch, GitCommit, 
  GitMerge, GitPullRequest, Terminal, Cpu, 
  Activity, Share2, ShieldCheck, ArrowRight, 
  RotateCcw, Trash2, Copy, Sparkles, Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";

// --- Configuration: Git Commands ---
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
  const exportRef = useRef<HTMLDivElement>(null);

  const addAction = (action: any) => {
    setHistory([...history, { ...action, timestamp: new Date().toLocaleTimeString() }]);
    toast.success(`${action.label} added to sequence`);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.info("Forge cache cleared");
  };

  const handleDownload = useCallback(async () => {
    if (exportRef.current === null) return;
    const loadingToast = toast.loading("Exporting Tactical Blueprint...");
    try {
      const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#000' });
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
    <div className="min-h-screen bg-[#000000] text-white selection:bg-orange-500/30 font-sans">
      {/* Background Matrix */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <header className="relative z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-orange-600/10 text-neutral-500 hover:text-orange-500 rounded-xl">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <h1 className="text-sm font-black uppercase italic tracking-widest text-white">Git Command <span className="text-orange-500">Forge</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Flow Architect v2.4</span>
              </div>
            </div>
          </div>
          <Button onClick={handleDownload} className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(234,88,12,0.2)]">
            <Download size={18} className="mr-2" /> Export Blueprint
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* --- Sidebar: Action Forge --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Command Modules</span>
              <Button variant="ghost" size="sm" onClick={clearHistory} className="h-6 text-[8px] uppercase font-black text-neutral-700 hover:text-red-500">Reset System</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {GIT_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => addAction(action)}
                  className="group flex items-center justify-between p-5 bg-neutral-950 border border-white/5 rounded-2xl hover:border-orange-500/40 transition-all duration-300 text-left relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 rounded-xl bg-black border border-white/5 text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white">{action.label}</p>
                      <p className="text-[10px] text-neutral-600 font-medium group-hover:text-neutral-400 transition-colors">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-neutral-800 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* --- Main Stage: The Blueprint Render --- */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-800">Tactical Schematic</span>
              <Badge variant="outline" className="border-white/5 text-neutral-600 font-bold uppercase text-[8px]">{history.length} Sequences Processed</Badge>
            </div>

            <div 
              ref={exportRef}
              className="relative rounded-[3rem] bg-[#000000] border border-white/10 p-12 min-h-[600px] flex flex-col shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Technical Grid Background */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] bg-[size:30px_30px]" />
              
              <div className="relative z-10 grid md:grid-cols-2 gap-12 flex-1">
                
                {/* Visual Branch Flow */}
                <div className="space-y-6">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500/50 flex items-center gap-2">
                    <Activity size={12} /> Branch Visualization
                  </h4>
                  <div className="relative pl-8 space-y-8">
                    {/* Vertical Stem */}
                    <div className="absolute left-10 top-0 w-0.5 h-full bg-gradient-to-b from-orange-600 to-transparent opacity-20" />
                    
                    <AnimatePresence mode="popLayout">
                      {history.length > 0 ? history.map((item, i) => (
                        <motion.div 
                          key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-6 group/item"
                        >
                          <div className="w-4 h-4 rounded-full bg-black border-2 border-orange-500 flex-shrink-0 z-10 shadow-[0_0_15px_rgba(234,88,12,0.3)] relative">
                             <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20 group-hover/item:opacity-40" />
                          </div>
                          <div className="p-4 bg-neutral-900 border border-white/5 rounded-2xl flex-1 hover:border-orange-500/20 transition-all">
                             <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-black uppercase text-white tracking-widest">{item.label}</span>
                               <span className="text-[8px] font-mono text-neutral-700">{item.timestamp}</span>
                             </div>
                             <p className="text-[10px] font-mono text-orange-500/80 italic">{item.cmd}</p>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="py-20 text-center">
                          <p className="text-[10px] font-black uppercase italic tracking-widest text-neutral-800 animate-pulse">Awaiting Protocol Initialization...</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Compiled Terminal Output */}
                <div className="space-y-6">
                   <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500/50 flex items-center gap-2">
                    <Terminal size={12} /> Sequential Console
                  </h4>
                  <div className="bg-[#050505] border border-white/5 rounded-[2rem] p-8 h-full font-mono text-xs leading-relaxed shadow-inner">
                    <div className="flex items-center gap-2 mb-6 opacity-40">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-3">
                      {history.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-neutral-800 select-none">{i + 1}</span>
                          <span className="text-orange-500">$</span>
                          <span className="text-neutral-300">{item.cmd}</span>
                        </div>
                      ))}
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-2 bg-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- BRAND WATERMARK --- */}
              <div className="mt-12 flex justify-end items-center gap-2 select-none opacity-40">
                <div className="h-4 w-px bg-white/10 mx-2" />
                <span className="text-[14px] font-black tracking-[0.3em] uppercase italic text-white">
                  Paper<span className="text-orange-500">Tube</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-8 border-t border-white/5 pt-16">
          <Metric icon={<ShieldCheck size={20} className="text-emerald-500" />} title="Safe Mode" desc="All logic generated locally. No access tokens required for blueprinting." />
          <Metric icon={<GitPullRequest size={20} className="text-orange-500" />} title="Logic Mapper" desc="Simulates branch integration and conflict resolution sequences." />
          <Metric icon={<Sparkles size={20} className="text-purple-500" />} title="Visual Synthesis" desc="Transforms abstract CLI commands into high-density documentation assets." />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Metric({ icon, title, desc }: any) {
  return (
    <div className="space-y-3">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">{icon}</div>
      <h4 className="text-sm font-black uppercase italic tracking-widest text-white">{title}</h4>
      <p className="text-xs text-neutral-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}