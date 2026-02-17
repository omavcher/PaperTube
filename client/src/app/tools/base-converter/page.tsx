"use client";

import { useState, useEffect } from "react";
import { 
  Binary, Hash, Box, Cpu, ArrowLeft, 
  Terminal, Copy, Trash2, ShieldCheck, 
  Activity, Info, Layers, RefreshCw, 
  Search, Check, Zap, ListTree
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
export default function BaseConverterPage() {
  const [decimalValue, setDecimalValue] = useState<string>("");
  const [binaryValue, setBinaryValue] = useState<string>("");
  const [octalValue, setOctalValue] = useState<string>("");
  const [hexValue, setHexValue] = useState<string>("");
useToolAnalytics("base-converter", "BASE CONV", "Engineering Tools");
  // --- Real-time Conversion Logic ---
  const updateAllBases = (value: string, fromBase: number) => {
    if (value === "") {
      setDecimalValue("");
      setBinaryValue("");
      setOctalValue("");
      setHexValue("");
      return;
    }

    try {
      const num = parseInt(value, fromBase);
      if (isNaN(num)) return;

      setDecimalValue(num.toString(10));
      setBinaryValue(num.toString(2));
      setOctalValue(num.toString(8));
      setHexValue(num.toString(16).toUpperCase());
    } catch (e) {
      // Fail silently for partial inputs
    }
  };

  const handleCopy = (val: string, label: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied to clipboard`);
  };

  const clearAll = () => {
    setDecimalValue("");
    setBinaryValue("");
    setOctalValue("");
    setHexValue("");
    toast.info("Terminal Reset");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-slate-500/30">
      {/* Header Section */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </Link>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="p-2 bg-slate-500/10 rounded-lg text-slate-400">
                <Binary className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">Base <span className="text-slate-400">Terminal</span></h1>
            </div>
          </div>
          <Badge variant="outline" className="border-slate-500/20 text-slate-400 uppercase tracking-widest text-[10px]">Logic Core v1.0</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Tool Intro */}
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">
              Digital Number <span className="text-slate-400 underline decoration-slate-500/20">Converter</span>
            </h2>
            <p className="text-neutral-500 text-lg">Real-time translation between Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hex (Base 16).</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Input Panels */}
            <div className="lg:col-span-7 space-y-4">
              <BaseInput 
                label="Decimal (Base 10)" 
                value={decimalValue} 
                onChange={(v) => updateAllBases(v, 10)} 
                onCopy={() => handleCopy(decimalValue, "Decimal")}
                placeholder="Enter decimal number..."
                icon={<Hash size={16} />}
              />
              <BaseInput 
                label="Binary (Base 2)" 
                value={binaryValue} 
                onChange={(v) => updateAllBases(v, 2)} 
                onCopy={() => handleCopy(binaryValue, "Binary")}
                placeholder="e.g. 101010"
                icon={<Binary size={16} />}
                mono
              />
              <BaseInput 
                label="Hexadecimal (Base 16)" 
                value={hexValue} 
                onChange={(v) => updateAllBases(v, 16)} 
                onCopy={() => handleCopy(hexValue, "Hex")}
                placeholder="e.g. 2A or FF"
                icon={<Box size={16} />}
                mono
              />
              <BaseInput 
                label="Octal (Base 8)" 
                value={octalValue} 
                onChange={(v) => updateAllBases(v, 8)} 
                onCopy={() => handleCopy(octalValue, "Octal")}
                placeholder="e.g. 52"
                icon={<Layers size={16} />}
                mono
              />

              <Button 
                onClick={clearAll} 
                variant="ghost" 
                className="w-full h-12 border border-dashed border-white/5 hover:border-red-500/20 hover:text-red-400 mt-4 text-xs font-black uppercase tracking-widest"
              >
                <Trash2 size={14} className="mr-2" /> Wipe Memory Cache
              </Button>
            </div>

            {/* Analysis & Visualization Side */}
            <div className="lg:col-span-5 space-y-6">
              {/* Bit Visualization */}
              <Card className="bg-neutral-900 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                <CardHeader className="bg-black/40 border-b border-white/5">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 flex items-center gap-2">
                    <Activity size={14} className="text-slate-400" /> 8-Bit Logic View
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="flex flex-wrap gap-2 justify-center">
                     {Array.from({ length: 8 }).map((_, i) => {
                       const bitIndex = 7 - i;
                       const isHigh = binaryValue.padStart(8, '0')[7 - bitIndex] === '1';
                       return (
                         <div key={i} className="flex flex-col items-center gap-2">
                           <motion.div 
                             animate={{ backgroundColor: isHigh ? "#94a3b8" : "#171717", borderColor: isHigh ? "#cbd5e1" : "#262626" }}
                             className={cn(
                               "w-10 h-14 rounded-xl border-2 flex items-center justify-center font-mono text-xl font-bold transition-all",
                               isHigh ? "text-black shadow-[0_0_15px_rgba(148,163,184,0.3)]" : "text-neutral-700"
                             )}
                           >
                             {isHigh ? "1" : "0"}
                           </motion.div>
                           <span className="text-[9px] font-black text-neutral-600">2^{bitIndex}</span>
                         </div>
                       );
                     })}
                   </div>
                   <p className="text-center text-[10px] text-neutral-500 mt-6 uppercase font-bold tracking-widest">
                     Visualization represents the lowest 8 bits
                   </p>
                </CardContent>
              </Card>

              {/* Technical Constraints */}
              <div className="p-6 rounded-[2rem] border border-white/5 bg-neutral-900/30 space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                   <ShieldCheck size={14} /> Logic Constraints
                 </h4>
                 <div className="space-y-3">
                    <ConstraintItem label="Decimal" desc="Base 10: Range 0-9" />
                    <ConstraintItem label="Binary" desc="Base 2: Logic high/low only" />
                    <ConstraintItem label="Hex" desc="Base 16: Uses Alpha A-F" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Educational Section */}
      <section className="bg-neutral-950/50 py-20 border-t border-white/5 mt-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12">
             <InfoCard 
               icon={<Zap size={20} />} 
               title="Binary Logic" 
               desc="The fundamental language of transistors. Each bit represents an 'On' or 'Off' state (1 or 0)." 
             />
             <InfoCard 
               icon={<Layers size={20} />} 
               title="Hex Efficiency" 
               desc="Programmers use Hex because 1 byte (8 bits) can be represented by exactly 2 hex characters (e.g., FF = 255)." 
             />
             <InfoCard 
               icon={<RefreshCw size={20} />} 
               title="Power of Two" 
               desc="Binary, Octal, and Hexadecimal are all powers of two, making them mathematically compatible with memory addressing." 
             />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function BaseInput({ label, value, onChange, onCopy, placeholder, icon, mono }: { label: string; value: string; onChange: (v: string) => void; onCopy: () => void; placeholder: string; icon: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between px-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 group-focus-within:text-slate-400 transition-colors flex items-center gap-2">
          {icon} {label}
        </label>
        <button onClick={onCopy} className="text-neutral-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
           <Copy size={12} />
        </button>
      </div>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-16 px-6 bg-neutral-900 border-2 border-white/5 rounded-2xl focus:outline-none focus:border-slate-500/40 transition-all text-lg",
          mono ? "font-mono" : "font-sans font-bold"
        )}
      />
    </div>
  );
}

function ConstraintItem({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
      <div>
        <p className="text-xs font-bold text-neutral-300">{label}</p>
        <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">{desc}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="space-y-4">
      <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <h3 className="text-white font-black uppercase tracking-tighter text-xl italic">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}