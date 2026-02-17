"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Shield, Copy, RefreshCw, Lock, Terminal, 
  CheckCircle2, AlertTriangle, History, 
  Settings, KeyRound, ShieldCheck, Home, Grid, 
  ArrowLeft, SlidersHorizontal, Zap
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

// Configuration Types
interface PasswordConfig {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export default function PasswordGeneratorClient() {
  const [config, setConfig] = useState<PasswordConfig>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [strength, setStrength] = useState({ score: 0, label: "Weak", color: "bg-red-500" });

  useToolAnalytics("password-generator", "KEY GEN", "Engineering Tools");

  // --- Logic ---
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 8) score++;
    if (pwd.length > 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: "WEAK", color: "bg-red-500 text-red-500" };
    if (score <= 4) return { score, label: "STRONG", color: "bg-yellow-500 text-yellow-500" };
    return { score, label: "FORTIFIED", color: "bg-emerald-500 text-emerald-500" };
  };

  const generate = useCallback(() => {
    const charset = [
      config.lowercase ? "abcdefghijklmnopqrstuvwxyz" : "",
      config.uppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
      config.numbers ? "0123456789" : "",
      config.symbols ? "!@#$%^&*()_+~`|}{[]:;?><,./-=" : ""
    ].join("");

    if (charset.length === 0) {
      toast.error("ERROR: Empty Character Set");
      return;
    }

    let retVal = "";
    // Ensure at least one character from each selected set exists
    const mandatoryChars = [];
    if (config.lowercase) mandatoryChars.push("abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]);
    if (config.uppercase) mandatoryChars.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]);
    if (config.numbers) mandatoryChars.push("0123456789"[Math.floor(Math.random() * 10)]);
    if (config.symbols) mandatoryChars.push("!@#$%^&*()_+~`|}{[]:;?><,./-="[Math.floor(Math.random() * 30)]);

    for (let i = 0; i < config.length - mandatoryChars.length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const finalPass = (mandatoryChars.join("") + retVal).split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(finalPass);
    setStrength(calculateStrength(finalPass));
    setHistory(prev => [finalPass, ...prev].slice(0, 5));
    
  }, [config]);

  useEffect(() => {
    generate();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("KEY COPIED TO CLIPBOARD");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-slate-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-slate-600/5 blur-[100px] pointer-events-none" />


      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <KeyRound className="text-slate-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">KEY GEN</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-slate-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-500/20 shadow-[0_0_10px_rgba(100,116,139,0.2)]">
            <ShieldCheck className="h-3 w-3" /> High Entropy Engine
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Password <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-700">Gen</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Create cryptographically robust credentials instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Generator Core --- */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-2 px-6 pt-6">
                  <div className="flex justify-between items-center">
                     <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Terminal className="h-4 w-4" /> Output Terminal
                     </CardTitle>
                     <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        <span className={cn("h-2 w-2 rounded-full animate-pulse", strength.color.split(" ")[0])} />
                        <span className={cn("text-[10px] font-black uppercase tracking-wider", strength.color.split(" ")[1])}>
                          {strength.label}
                        </span>
                     </div>
                  </div>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                
                {/* Display Area */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                  <div className="relative bg-[#050505] border border-white/10 rounded-2xl p-6 md:p-8 flex items-center justify-between gap-4">
                    <span className="font-mono text-xl md:text-3xl text-white break-all tracking-tight font-bold selection:bg-slate-500/30">
                      {password}
                    </span>
                    <div className="flex gap-2 shrink-0">
                       <Button size="icon" variant="ghost" onClick={generate} className="text-neutral-500 hover:text-white hover:bg-white/10 rounded-xl h-10 w-10">
                          <RefreshCw className="h-5 w-5" />
                       </Button>
                       <Button size="icon" onClick={() => copyToClipboard(password)} className="bg-white text-black hover:bg-slate-200 rounded-xl h-10 w-10 shadow-lg transition-transform active:scale-95">
                          <Copy className="h-5 w-5" />
                       </Button>
                    </div>
                  </div>
                </div>

                {/* Configuration Deck */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-8">
                    
                    {/* Length Slider */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                             <SlidersHorizontal size={12} /> Key Length
                          </label>
                          <span className="text-xl font-mono font-bold text-white">{config.length}</span>
                       </div>
                       <div className="relative">
                          <input 
                            type="range" 
                            min="8" max="64" 
                            value={config.length} 
                            onChange={(e) => setConfig({...config, length: parseInt(e.target.value)})}
                            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                          />
                          <div className="flex justify-between mt-2 text-[8px] text-neutral-600 font-bold uppercase tracking-widest">
                             <span>Standard (8)</span>
                             <span>Ultra (64)</span>
                          </div>
                       </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-3">
                       {[
                         { id: 'uppercase', label: 'ABC Uppercase' },
                         { id: 'lowercase', label: 'abc Lowercase' },
                         { id: 'numbers', label: '123 Numbers' },
                         { id: 'symbols', label: '#@! Symbols' }
                       ].map((opt) => (
                          <div 
                            key={opt.id} 
                            onClick={() => setConfig({ ...config, [opt.id]: !config[opt.id as keyof PasswordConfig] })}
                            className={cn(
                               "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all active:scale-95 select-none h-14",
                               config[opt.id as keyof PasswordConfig] 
                                  ? "bg-slate-500/10 border-slate-500/50 text-white shadow-[0_0_15px_rgba(100,116,139,0.1)]" 
                                  : "bg-black border-white/5 text-neutral-600 hover:border-white/10"
                            )}
                          >
                             <span className="text-[10px] font-black uppercase tracking-wide">{opt.label}</span>
                             <div className={cn("w-2 h-2 rounded-full", config[opt.id as keyof PasswordConfig] ? "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.8)]" : "bg-neutral-800")} />
                          </div>
                       ))}
                    </div>
                </div>

                <Button className="w-full h-14 bg-white text-black hover:bg-slate-200 font-black uppercase italic tracking-wider rounded-xl text-sm shadow-xl active:scale-[0.98] transition-transform" onClick={generate}>
                   <Zap className="mr-2 h-4 w-4 fill-black" /> Generate Sequence
                </Button>

              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT: History & Info --- */}
          <div className="lg:col-span-5 space-y-6">
             {/* History */}
             <Card className="bg-neutral-900/40 border-white/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="pb-2 px-6 pt-6 border-b border-white/5">
                   <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <History className="h-3 w-3" /> Recent Keys
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-white/5">
                      {history.map((pwd, i) => (
                         <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group px-6">
                            <span className="font-mono text-xs text-neutral-400 truncate max-w-[200px] font-bold">{pwd}</span>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(pwd)} className="h-7 text-[9px] uppercase font-black tracking-wider text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 hover:bg-white/10 rounded-lg">
                               Copy
                            </Button>
                         </div>
                      ))}
                      {history.length === 0 && (
                         <div className="p-8 text-center text-neutral-700 text-[10px] uppercase font-black tracking-widest">No history recorded</div>
                      )}
                   </div>
                </CardContent>
             </Card>

             {/* Education */}
             <div className="grid gap-4">
                <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm">
                   <div className="flex items-center gap-3 mb-2">
                      <Shield className="text-emerald-500 h-4 w-4" />
                      <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Entropy Logic</h4>
                   </div>
                   <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                      Password strength is measured in bits of entropy. A 16-character sequence with mixed symbols has ~100 bits of entropy, rendering brute-force attacks mathematically infeasible.
                   </p>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm">
                   <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="text-yellow-500 h-4 w-4" />
                      <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Security Protocol</h4>
                   </div>
                   <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                      Avoid dictionary words. True randomness is the only defense against rainbow table attacks.
                   </p>
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
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-slate-400 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-slate-500/10 blur-xl rounded-full" />
            <Grid size={20} className="relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Matrix</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-white transition-colors gap-1.5">
            <Settings size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}