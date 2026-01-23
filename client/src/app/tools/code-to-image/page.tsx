"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  ArrowLeft, Download, Terminal, Palette, Sparkles, 
  ShieldCheck, Zap, Info, Trophy, Code2, Monitor,
  Layers, Cpu, Share2, MousePointer2
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
import { LoginDialog } from "@/components/LoginDialog";

export default function CodeToImagePage() {
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
      toast.success("Artifact Saved to Local Storage", { id: loadingToast });
    } catch (err) {
      toast.error("Handshake Failed", { id: loadingToast });
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans pb-10">
      
      {/* 🔴 PSYCHOLOGY TRIGGER: Social Proof Banner */}
      <div className="bg-red-600 py-1.5 px-4 text-center overflow-hidden">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white flex justify-center items-center gap-3">
          <Trophy size={10} /> Live: 842 Artifacts generated in the last 24 hours
        </div>
      </div>

      <header className="sticky top-0 z-[100] border-b border-white/5 bg-black/80 backdrop-blur-2xl px-4 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="hidden xs:flex flex-col">
              <h1 className="text-xs lg:text-sm font-black uppercase italic tracking-tighter">Foundry Engine</h1>
              <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">v5.0 Stable</span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {user ? (
              <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{user.username}</span>
              </div>
            ) : (
              <Button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-transparent hover:bg-white/5 text-white border border-white/10 text-[9px] font-black uppercase italic rounded-xl px-4 h-10 transition-all"
              >
                Sync Neural ID
              </Button>
            )}
            <Button 
              onClick={handleDownload} 
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-4 lg:px-8 h-10 lg:h-12 shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-90 transition-all text-[10px] lg:text-xs"
            >
              <Download size={16} className="mr-2" /> <span className="hidden sm:inline">Export</span> Artifact
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* --- LEFT: CONFIGURATION --- */}
          <aside className="lg:col-span-4 space-y-4">
            <Card className="bg-[#080808] border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl lg:sticky lg:top-28">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2">
                    <Terminal size={12} className="text-red-500" /> Source Label
                  </label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black border-white/5 h-12 rounded-xl focus:ring-1 focus:ring-red-600/50 text-xs font-bold font-mono"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2">
                    <Palette size={12} className="text-red-500" /> Environment Glow
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(themes).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "h-10 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all active:scale-95",
                          theme === t ? "bg-red-600 border-red-500 text-white" : "bg-black border-white/5 text-neutral-600"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Padding Flux</label>
                    <span className="text-[10px] font-mono text-red-500">{padding}px</span>
                  </div>
                  <input 
                    type="range" min="20" max="100" step="4" value={padding}
                    onChange={(e) => setPadding(e.target.value)}
                    className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                {/* 🔴 LOSS AVERSION TRIGGER */}
                {!user && (
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Zap size={14} fill="currentColor" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Unsynced Session</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                      Your theme and label preferences will be <span className="text-white underline">purged</span> once you close this tab. Sync your Neural ID to persist settings.
                    </p>
                    <button 
                      onClick={() => setIsLoginOpen(true)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all"
                    >
                      Connect ID
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </aside>

          {/* --- RIGHT: PREVIEW STAGE --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Input Area */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-red-600/20 blur opacity-0 group-focus-within:opacity-100 transition duration-1000 rounded-[2rem]" />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="relative w-full h-64 lg:h-80 bg-[#050505] border border-white/5 rounded-[2rem] p-6 lg:p-10 font-mono text-xs lg:text-sm text-neutral-400 focus:outline-none focus:border-red-600/40 transition-all resize-none shadow-2xl"
                placeholder="Initialize code clusters..."
              />
              <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-50">
                <Code2 size={14} className="text-neutral-600" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-600">Raw Input</span>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-700 italic flex items-center gap-2">
                  <Monitor size={10} /> Neural Viewport
                </span>
                <Badge className="bg-white/5 text-neutral-500 border-white/5 text-[8px] font-black uppercase">PNG / 300 DPI</Badge>
              </div>

              {/* THE IMAGE GENERATOR BOX */}
              <div className="overflow-x-auto custom-scrollbar pb-4 rounded-[2rem]">
                <div 
                  ref={exportRef}
                  className={cn(
                    "min-w-[400px] relative rounded-[2rem] flex items-center justify-center bg-gradient-to-br transition-all duration-700 shadow-2xl",
                    themes[theme]
                  )}
                  style={{ padding: `${padding}px` }}
                >
                  <div className="w-full max-w-2xl bg-black rounded-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative z-10">
                    <div className="px-5 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase font-black tracking-widest">{title}</span>
                    </div>
                    
                    <div className="p-8 font-mono text-xs lg:text-sm leading-relaxed text-red-50/80">
                      {code.split('\n').map((line, i) => (
                        <div key={i} className="flex gap-6 group/line">
                          <span className="w-4 text-neutral-800 text-right select-none font-bold group-hover/line:text-red-900 transition-colors">{i + 1}</span>
                          <span className="whitespace-pre tracking-tight">{line || " "}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WATERMARK */}
                  <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-30 select-none grayscale">
                    <div className="h-3 w-px bg-white/20" />
                    <span className="text-[11px] font-black tracking-[0.2em] uppercase italic text-white">
                      Paper<span className="text-red-600">Tube</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={(t, info) => {
          const u = { username: info.name.split(' ')[0], picture: info.picture };
          localStorage.setItem("user", JSON.stringify(u));
          setUser(u);
          setIsLoginOpen(false);
          toast.success("Identity Verified", { icon: <ShieldCheck className="text-emerald-500" /> });
        }} 
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}