"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  ArrowLeft, Download, Terminal, Palette, Sparkles, 
  ShieldCheck, Zap, Trophy, Code2, Monitor,
  Home, Grid, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { LoginDialog } from "@/components/LoginDialog";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo"; // Assuming exists

export default function CodeToImageClient() {
  const [code, setCode] = useState(`// Protocol: PaperTube Neural Foundry
const initializeArtifact = () => {
  return "System Hardened";
};`);
  const [title, setTitle] = useState("neural_module.ts");
  const [theme, setTheme] = useState("crimson");
  const [padding, setPadding] = useState("40");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  
  useToolAnalytics("code-to-image", "CODE SNAP", "Engineering Tools");
  
  const themes: Record<string, string> = {
    crimson: "from-red-950 via-black to-red-900/40",
    void: "from-zinc-950 via-black to-zinc-900",
    cyber: "from-blue-950 via-black to-emerald-950/40",
    titanium: "from-neutral-900 via-black to-neutral-800",
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleDownload = useCallback(async () => {
    if (!exportRef.current) return;
    const loadingToast = toast.loading("Synthesizing High-Res Artifact...");
    try {
      const dataUrl = await toPng(exportRef.current, { 
        pixelRatio: 3, 
        backgroundColor: '#000',
        cacheBust: true 
      });
      const link = document.createElement("a");
      link.download = `PaperTube-${title.replace(/\.[^/.]+$/, "")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("ARTIFACT EXPORTED", { id: loadingToast });
    } catch (err) {
      toast.error("RENDER FAILED", { id: loadingToast });
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans pb-10 flex flex-col">
      
      {/* 🔴 PSYCHOLOGY TRIGGER: Social Proof Banner */}
      <div className="bg-red-600 py-1.5 px-4 text-center overflow-hidden">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white flex justify-center items-center gap-3 animate-pulse">
          <Trophy size={10} /> Live: 842 Artifacts Generated Today
        </div>
      </div>

      {/* --- Desktop Navbar --- */}
      <header className="hidden md:flex sticky top-0 z-[100] border-b border-white/5 bg-black/80 backdrop-blur-2xl px-10 py-6 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/tools">
            <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-black uppercase italic tracking-tighter text-white">Foundry Engine</h1>
            <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">v5.0 Stable</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{user.username}</span>
            </div>
          ) : (
            <Button 
              onClick={() => setIsLoginOpen(true)}
              className="bg-transparent hover:bg-white/5 text-white border border-white/10 text-[9px] font-black uppercase italic rounded-xl px-4 h-10 transition-all tracking-wider"
            >
              Sync Neural ID
            </Button>
          )}
          <Button 
            onClick={handleDownload} 
            className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-95 transition-all text-xs tracking-wider"
          >
            <Download size={16} className="mr-2" /> Export Artifact
          </Button>
        </div>
      </header>

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Code2 className="text-red-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">CODE SNAP</span>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="icon" onClick={handleDownload} className="h-8 w-8 text-red-500"><Download className="h-5 w-5" /></Button>
           <Link href="/tools">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
           </Link>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 lg:py-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* --- LEFT: CONFIGURATION --- */}
          <aside className="lg:col-span-4 space-y-4 order-2 lg:order-1">
            <Card className="bg-[#080808] border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl lg:sticky lg:top-28">
              <div className="space-y-8">
                
                {/* Title Input */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 flex items-center gap-2">
                    <Terminal size={12} className="text-red-500" /> Source Label
                  </label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black border-white/5 h-12 rounded-xl focus:border-red-600/50 text-xs font-bold font-mono text-white placeholder:text-neutral-800"
                    placeholder="filename.tsx"
                  />
                </div>

                {/* Theme Selector */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 flex items-center gap-2">
                    <Palette size={12} className="text-red-500" /> Environment Glow
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(themes).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "h-10 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 hover:border-white/20",
                          theme === t ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20" : "bg-black border-white/5 text-neutral-500"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Padding Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Padding Flux</label>
                    <span className="text-[10px] font-mono text-red-500 font-bold">{padding}px</span>
                  </div>
                  <input 
                    type="range" min="20" max="100" step="4" value={padding}
                    onChange={(e) => setPadding(e.target.value)}
                    className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                {/* 🔴 LOSS AVERSION TRIGGER */}
                {!user && (
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Zap size={14} fill="currentColor" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Unsynced Session</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-bold">
                      Preferences will be <span className="text-white underline decoration-red-500 decoration-2">purged</span> on exit. Sync Neural ID to persist.
                    </p>
                    <button 
                      onClick={() => setIsLoginOpen(true)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all hover:border-white/20"
                    >
                      Connect ID
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </aside>

          {/* --- RIGHT: PREVIEW STAGE --- */}
          <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
            
            {/* Input Area */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-red-600/10 blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700 rounded-[2rem]" />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="relative w-full h-48 lg:h-64 bg-[#050505] border border-white/10 rounded-[2rem] p-6 lg:p-8 font-mono text-xs lg:text-sm text-neutral-300 focus:outline-none focus:border-red-600/30 transition-all resize-none shadow-2xl custom-scrollbar"
                placeholder="// Initialize code clusters..."
              />
              <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-30 pointer-events-none">
                <Code2 size={14} className="text-neutral-500" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold">Raw Input</span>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-500 italic flex items-center gap-2">
                  <Monitor size={12} /> Neural Viewport
                </span>
                <Badge className="bg-white/5 text-neutral-500 border-white/5 text-[8px] font-black uppercase tracking-widest hover:bg-white/10">PNG / 300 DPI</Badge>
              </div>

              {/* THE IMAGE GENERATOR BOX */}
              <div className="overflow-x-auto custom-scrollbar pb-4 rounded-[2.5rem]">
                <div 
                  ref={exportRef}
                  className={cn(
                    "min-w-[500px] relative flex items-center justify-center bg-gradient-to-br transition-all duration-700 shadow-2xl",
                    themes[theme]
                  )}
                  style={{ padding: `${padding}px`, borderRadius: '2.5rem' }}
                >
                  <div className="w-full max-w-2xl bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative z-10">
                    <div className="px-5 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 font-bold tracking-widest uppercase opacity-60">{title}</span>
                    </div>
                    
                    <div className="p-8 font-mono text-xs lg:text-sm leading-relaxed text-neutral-200">
                      {code.split('\n').map((line, i) => (
                        <div key={i} className="flex gap-6 group/line hover:bg-white/[0.02]">
                          <span className="w-6 text-neutral-700 text-right select-none font-bold group-hover/line:text-neutral-500 transition-colors">{i + 1}</span>
                          <span className="whitespace-pre tracking-tight">{line || " "}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WATERMARK */}
                  <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-40 select-none mix-blend-overlay">
                    <div className="h-3 w-px bg-white/50" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase italic text-white/80">
                      Paper<span className="text-red-500">Tube</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CORE PROMO --- */}
        <div className="mt-20 mb-10">
           <CorePromo />
        </div>

      </main>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-red-500 transition-colors gap-1.5">
            <Grid size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Tools</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

      <Footer />

      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={(t, info) => {
          const u = { username: info.name.split(' ')[0], picture: info.picture };
          localStorage.setItem("user", JSON.stringify(u));
          setUser(u);
          setIsLoginOpen(false);
          toast.success("IDENTITY VERIFIED", { icon: <ShieldCheck className="text-emerald-500" /> });
        }} 
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}