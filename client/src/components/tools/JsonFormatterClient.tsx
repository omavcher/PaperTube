"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileCode, Copy, Trash2, Check, 
  Download, Upload, Braces, AlignLeft, 
  FileJson, AlertCircle, CheckCircle2,
  Terminal, Home, Grid, Settings, Sparkles, Code2,
  Maximize2, Minimize2, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

export default function JsonFormatterClient() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useToolAnalytics("json-formatter", "JSON FIX", "Engineering Tools");

  // --- Logic ---
  const handleFormat = () => {
    if (!jsonInput.trim()) return toast.error("DATA MISSING: Input required");
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
      setError(null);
      setIsValid(true);
      toast.success("JSON BEAUTIFIED");
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
      toast.error("SYNTAX ERROR: Invalid JSON");
    }
  };

  const handleMinify = () => {
    if (!jsonInput.trim()) return toast.error("DATA MISSING: Input required");
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj));
      setError(null);
      setIsValid(true);
      toast.success("JSON COMPRESSED");
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
      toast.error("SYNTAX ERROR: Invalid JSON");
    }
  };

  const handleCopy = () => {
    if (!jsonInput) return;
    navigator.clipboard.writeText(jsonInput);
    toast.success("COPIED TO CLIPBOARD");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setJsonInput(content);
      validateJson(content);
      toast.success("FILE LOADED");
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setError(null);
      setIsValid(null);
      return;
    }
    try {
      JSON.parse(value);
      setError(null);
      setIsValid(true);
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-blue-600/5 blur-[100px] pointer-events-none" />

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Code2 className="text-blue-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">JSON Lab</span>
        </div>
        <Link href="/tools">
           <Badge variant="outline" className="border-white/10 text-neutral-500 text-[9px] uppercase font-bold tracking-widest">Exit</Badge>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 border border-blue-600/20 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
            <Sparkles className="h-3 w-3" /> Secure • Private • Local
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            JSON <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-blue-800">Formatter</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Parse, validate, and restructure data streams with zero server latency.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* --- Controls Panel (Left on Desktop, Top on Mobile) --- */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-4 pt-6 px-6 border-b border-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                    <Terminal size={12} /> Execution Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button onClick={handleFormat} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase text-xs tracking-wider h-14 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]">
                  <Braces className="mr-2 h-4 w-4" /> Beautify
                </Button>
                <Button onClick={handleMinify} variant="outline" className="w-full bg-black border-white/10 hover:border-white/20 text-neutral-400 hover:text-white text-xs h-14 rounded-xl uppercase font-black italic tracking-wider">
                  <AlignLeft className="mr-2 h-4 w-4" /> Minify
                </Button>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button onClick={handleCopy} variant="ghost" className="bg-white/5 hover:bg-white/10 text-[10px] uppercase font-black h-12 rounded-xl border border-white/5">
                    <Copy className="mr-2 h-3 w-3" /> Copy
                  </Button>
                  <Button onClick={() => { setJsonInput(""); setIsValid(null); setError(null); }} variant="ghost" className="bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 text-[10px] uppercase font-black h-12 rounded-xl border border-red-500/10 hover:border-red-500/30">
                    <Trash2 className="mr-2 h-3 w-3" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Validation Status Card */}
            <AnimatePresence>
              {isValid !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Card className={cn(
                    "rounded-[1.5rem] border backdrop-blur-md",
                    isValid 
                        ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                        : "bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                  )}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", isValid ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20")}>
                        {isValid ? <CheckCircle2 className="text-emerald-500 h-5 w-5" /> : <AlertCircle className="text-red-500 h-5 w-5" />}
                      </div>
                      <div>
                          <p className={cn("text-xs font-black uppercase italic tracking-wider", isValid ? "text-emerald-500" : "text-red-500")}>
                            {isValid ? "Protocol Valid" : "Syntax Failure"}
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                             {isValid ? "Structure OK" : "Parsing Error"}
                          </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- Main Editor (Right on Desktop) --- */}
          <div className="lg:col-span-9 order-1 lg:order-2 space-y-4">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500" />
              
              <div className="relative bg-[#050505] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
                {/* Editor Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <input type="file" ref={fileInputRef} id="json-up" className="hidden" accept=".json" onChange={handleFileUpload} />
                    <label htmlFor="json-up" className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-blue-400 cursor-pointer transition-colors flex items-center gap-2 group/upload">
                      <div className="p-1 rounded bg-white/5 group-hover/upload:bg-blue-500/20 transition-colors"><Upload size={10} /></div>
                      Inject File
                    </label>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{jsonInput.length} CHARS</span>
                  </div>
                </div>

                {/* Text Area */}
                <div className="flex-1 relative">
                    <textarea
                    value={jsonInput}
                    onChange={(e) => { setJsonInput(e.target.value); validateJson(e.target.value); }}
                    placeholder="// Paste raw JSON data stream..."
                    className="w-full h-full p-6 lg:p-8 bg-transparent font-mono text-xs md:text-sm leading-relaxed text-blue-100/90 focus:outline-none resize-none placeholder:text-neutral-700 selection:bg-blue-500/30 custom-scrollbar"
                    spellCheck={false}
                    />
                    
                    {/* Error Overlay (Floating) */}
                    <AnimatePresence>
                        {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, x: "-50%" }} 
                            animate={{ opacity: 1, y: 0, x: "-50%" }} 
                            exit={{ opacity: 0, y: 10, x: "-50%" }}
                            className="absolute bottom-6 left-1/2 w-[90%] md:w-auto md:min-w-[400px] p-4 rounded-xl bg-red-950/90 border border-red-500/30 backdrop-blur-xl shadow-2xl z-20"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle size={16} className="text-red-500" />
                                <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Syntax Exception</span>
                            </div>
                            <p className="font-mono text-[11px] text-red-200/80 break-all">{error}</p>
                        </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CORE PROMO --- */}
        <div className="mt-24 mb-10">
           <CorePromo />
        </div>

      </main>

      <Footer />

      {/* --- Mobile Bottom Menu --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Home size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-blue-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}