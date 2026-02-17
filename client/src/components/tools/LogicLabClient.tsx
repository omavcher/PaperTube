"use client";

import { useState, useEffect } from "react";
import { 
  Binary, Cpu, Calculator, Trash2, 
  CheckCircle2, Info, ArrowLeft,
  AlertCircle, Variable, Table as TableIcon,
  Home, Grid, Settings, Sparkles, Play
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
import CorePromo from "@/components/CorePromo"; // Assuming you have this from previous steps

export default function LogicLabClient() {
  const [expression, setExpression] = useState<string>("A AND (B OR C)");
  const [variables, setVariables] = useState<string[]>([]);
  const [truthTable, setTruthTable] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useToolAnalytics("logic-gate-lab", "LOGIC GATE", "Engineering Tools");

  // --- Logic Parser Engine ---
  const generateTable = () => {
    try {
      setError(null);
      // 1. Clean expression and extract variables (A-Z)
      const cleanExpr = expression.toUpperCase();
      const foundVars = Array.from(new Set(cleanExpr.match(/[A-Z]/g))).sort();
      
      if (foundVars.length === 0) throw new Error("DATA MISSING: No variables found (e.g., A, B)");
      if (foundVars.length > 6) throw new Error("SYSTEM OVERLOAD: Max 6 variables.");

      setVariables(foundVars);

      // 2. Generate all binary combinations (2^n)
      const rows = Math.pow(2, foundVars.length);
      const table = [];

      for (let i = 0; i < rows; i++) {
        const combination: Record<string, number> = {};
        // Fill variable values for this row
        foundVars.forEach((v, index) => {
          combination[v] = (i >> (foundVars.length - 1 - index)) & 1;
        });

        // 3. Evaluate expression
        let evalStr = cleanExpr
          .replace(/AND|&|\./g, "&&")
          .replace(/OR|\||\+/g, "||")
          .replace(/NOT|!|~/g, "!")
          .replace(/XOR|\^/g, "!=")
          .replace(/NAND/g, "!&&")
          .replace(/[A-Z]/g, (match) => combination[match].toString());

        // Safe evaluation
        const result = !!(new Function(`return ${evalStr}`)()) ? 1 : 0;
        table.push({ ...combination, result });
      }

      setTruthTable(table);
      toast.success("SIMULATION COMPLETE");
    } catch (err: any) {
      setError(err.message);
      setTruthTable([]);
    }
  };

  useEffect(() => {
    generateTable();
  }, [expression]);

  const insertSymbol = (sym: string) => {
    setExpression(prev => prev + " " + sym + " ");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-slate-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-slate-600/5 blur-[100px] pointer-events-none" />

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Binary className="text-slate-400 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">LOGIC LAB</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-slate-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-300 border border-slate-500/20 shadow-[0_0_10px_rgba(148,163,184,0.2)]">
            <Sparkles className="h-3 w-3" /> Boolean Circuit Engine
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Logic <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-600">Gate</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Model complex boolean states and verify logic fidelity.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Input & Controls --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-900 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-4 pt-6 px-6 border-b border-white/5">
                <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-slate-400" /> Circuit Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-3">
                  <div className="relative">
                    <input 
                      value={expression}
                      onChange={(e) => setExpression(e.target.value)}
                      className={cn(
                        "w-full bg-black border rounded-xl p-4 text-sm md:text-lg font-mono font-bold outline-none transition-all placeholder:text-neutral-800",
                        error ? "border-red-500/50 text-red-400" : "border-white/10 focus:border-slate-400 text-white"
                      )}
                      placeholder="e.g. A AND (B OR C)"
                    />
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-6 left-0 text-[9px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" /> Syntax Error
                      </motion.div>
                    )}
                  </div>

                  {/* Quick Symbols */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {['AND', 'OR', 'NOT', 'XOR', '(', ')', 'A', 'B'].map((s) => (
                      <button 
                        key={s}
                        onClick={() => insertSymbol(s)}
                        className="bg-neutral-800 hover:bg-slate-200 hover:text-black text-neutral-400 text-[10px] font-black py-3 rounded-xl transition-all uppercase border border-white/5 active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-4 gap-3">
                  <Button className="col-span-3 bg-white text-black hover:bg-slate-200 font-black uppercase italic tracking-wider rounded-xl h-14 shadow-lg active:scale-[0.98] transition-transform" onClick={generateTable}>
                    <Play className="mr-2 h-4 w-4 fill-black" /> Run Logic
                  </Button>
                  <Button variant="outline" className="h-14 rounded-xl border-white/10 bg-neutral-900 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-colors" onClick={() => setExpression("")}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10 flex gap-3 items-start">
               <div className="p-1.5 bg-slate-500/10 rounded-lg text-slate-400 mt-0.5">
                   <Info size={14} />
               </div>
               <div className="text-[10px] text-neutral-400 leading-relaxed font-medium uppercase tracking-wide">
                 <strong className="text-slate-400">Supported Syntax:</strong><br/>
                 Words: AND, OR, NOT, XOR<br/>
                 Symbols: &, |, !, ^
               </div>
            </div>
          </div>

          {/* --- RIGHT: Truth Table Output --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-slate-600 flex items-center justify-center font-serif font-black text-xs text-white shadow-[0_0_10px_rgba(71,85,105,0.4)]">T</div>
                Truth Table
              </h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[9px] border-slate-500/20 text-slate-400 bg-slate-500/5 uppercase tracking-widest">
                  {variables.length} Vars
                </Badge>
                <Badge variant="outline" className="text-[9px] border-slate-500/20 text-slate-400 bg-slate-500/5 uppercase tracking-widest">
                  {truthTable.length} States
                </Badge>
              </div>
            </div>

            <Card className="bg-neutral-900/40 border-white/10 overflow-hidden shadow-2xl rounded-[2rem] backdrop-blur-md">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/40 text-white border-b border-white/5">
                      {variables.map(v => (
                        <th key={v} className="p-5 text-center font-black text-[10px] tracking-[0.2em] border-r border-white/5 text-slate-400 uppercase">{v}</th>
                      ))}
                      <th className="p-5 text-center font-black italic text-[10px] tracking-[0.2em] bg-white/5 text-white uppercase">OUTPUT (Q)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {truthTable.map((row, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className={cn(
                            "border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-sm",
                            row.result === 1 ? "bg-slate-500/5" : ""
                          )}
                        >
                          {variables.map(v => (
                            <td key={v} className="p-4 text-center border-r border-white/5 text-neutral-400 font-bold">
                              {row[v]}
                            </td>
                          ))}
                          <td className="p-4 text-center">
                            <span className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest inline-block min-w-[80px] uppercase",
                              row.result === 1 ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-neutral-800 text-neutral-600"
                            )}>
                              {row.result === 1 ? "HIGH (1)" : "LOW (0)"}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {truthTable.length === 0 && !error && (
                <div className="p-20 text-center text-neutral-600 flex flex-col items-center gap-4">
                  <div className="h-16 w-16 bg-neutral-800/50 rounded-full flex items-center justify-center border border-white/5">
                      <Variable size={32} className="opacity-20" />
                  </div>
                  <p className="font-bold uppercase tracking-widest text-[10px]">Awaiting Logic Input</p>
                </div>
              )}
            </Card>

            {/* Quick Summary / Boolean Laws */}
            <div className="grid md:grid-cols-3 gap-4">
              <LawCard title="Identity" detail="A AND 1 = A" />
              <LawCard title="Null" detail="A OR 1 = 1" />
              <LawCard title="Idempotent" detail="A AND A = A" />
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

function LawCard({ title, detail }: { title: string, detail: string }) {
  return (
    <div className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-colors">
      <p className="text-[9px] font-black text-neutral-500 uppercase mb-2 tracking-widest">{title} Law</p>
      <p className="text-xs font-mono font-bold text-slate-300 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">{detail}</p>
    </div>
  );
}