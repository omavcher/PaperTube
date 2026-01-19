"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  ArrowLeft, Download, Copy, Share2, 
  Terminal, Monitor, Palette, Sparkles, 
  Settings, Type, FileCode, Check, 
  Maximize2, Github, Cpu, Activity,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function CodeToImagePage() {
  const [code, setCode] = useState(`// Initialize Neural Link
function startSynthesis() {
  const brand = "PaperTube";
  console.log(\`Protocol: \${brand} Active\`);
  
  return {
    status: "Hardened",
    encryption: "AES-256"
  };
}`);
  const [title, setTitle] = useState("script.ts");
  const [theme, setTheme] = useState("crimson");
  const [padding, setPadding] = useState("56");
  const exportRef = useRef<HTMLDivElement>(null);

  const themes: Record<string, string> = {
    crimson: "from-red-950 via-black to-red-900/40",
    void: "from-zinc-950 via-black to-zinc-900",
    cyber: "from-blue-950 via-black to-emerald-950/40",
    titanium: "from-neutral-900 via-black to-neutral-800",
  };

  const handleDownload = useCallback(async () => {
    if (exportRef.current === null) return;
    
    const loadingToast = toast.loading("Synthesizing Artifact...");
    try {
      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, // Higher quality for social media
        backgroundColor: '#000' 
      });
      const link = document.createElement("a");
      link.download = `PaperTube-${title || "artifact"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Artifact Saved to Local Storage", { id: loadingToast });
    } catch (err) {
      toast.error("Handshake Failed", { id: loadingToast });
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans">
      {/* Background Matrix */}
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
            <div className="hidden sm:block">
              <h1 className="text-sm font-black uppercase italic tracking-widest">Artifact Foundry</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Capture Engine v4.2</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             <Button onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(220,38,38,0.2)] active:scale-95 transition-all">
               <Download size={18} className="mr-2" /> Generate Artifact
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* --- Configuration Panel --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2">
                    <Terminal size={12} className="text-red-500" /> Module Identity
                  </label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black border-white/5 h-14 rounded-xl focus:border-red-600/40 text-sm font-bold font-mono"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2">
                    <Palette size={12} className="text-red-500" /> Environment Glow
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(themes).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "h-12 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                          theme === t ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20" : "bg-black border-white/5 text-neutral-600 hover:text-white"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Padding Flux</label>
                    <span className="text-[10px] font-mono text-red-500">{padding}px</span>
                  </div>
                  <input 
                    type="range" min="32" max="128" step="8" value={padding}
                    onChange={(e) => setPadding(e.target.value)}
                    className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
                
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-emerald-500/50 mb-2">
                    <ShieldCheck size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Verified Secure</span>
                  </div>
                  <p className="text-[10px] text-neutral-600 leading-relaxed font-medium italic">
                    Artifacts are rendered locally via HTML5 Canvas. Identity and data remain isolated from the cloud.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* --- Render Stage --- */}
          <div className="lg:col-span-8 space-y-10">
            {/* Source Input */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-red-600/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-700 rounded-[2.5rem]" />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="relative w-full h-80 bg-[#080808] border border-white/5 rounded-[2.5rem] p-10 font-mono text-sm text-neutral-300 focus:outline-none focus:border-red-600/40 transition-all resize-none shadow-inner custom-scrollbar"
                placeholder="Paste code clusters here..."
              />
            </div>

            {/* Output Viewport */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800">Final Snapshot</span>
                <Badge variant="outline" className="text-[8px] border-white/5 text-neutral-700">PNG / 300DPI</Badge>
              </div>
              
              <div 
                ref={exportRef}
                className={cn(
                  "relative rounded-[2.5rem] flex items-center justify-center transition-all duration-1000 bg-gradient-to-br shadow-2xl",
                  themes[theme]
                )}
                style={{ padding: `${padding}px` }}
              >
                <div className="w-full bg-[#000000] rounded-2xl border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden relative z-10">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 font-bold uppercase tracking-widest">{title}</span>
                    <div className="w-12" />
                  </div>
                  
                  {/* Code Body */}
                  <div className="p-10 font-mono text-sm leading-[1.6] whitespace-pre tabular-nums">
                     <div className="text-neutral-400">
                       {code.split('\n').map((line, i) => (
                         <div key={i} className="flex gap-8 group/line">
                           <span className="w-4 text-neutral-800 text-right select-none font-bold group-hover/line:text-red-900 transition-colors">{i + 1}</span>
                           <span className="text-red-50/90 tracking-tight">{line || " "}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>

                {/* --- BRAND WATERMARK --- */}
                <div className="absolute bottom-6 right-8 flex items-center gap-2 select-none z-20">
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <span className="text-[12px] font-black tracking-[0.3em] uppercase italic text-white/40">
                    Paper<span className="text-red-600/60">Tube</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}