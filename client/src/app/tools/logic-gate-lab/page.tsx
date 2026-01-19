"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Binary, Cpu, Calculator, Trash2, 
  CheckCircle2, Info, ChevronRight,
  Download, Copy, Code2, AlertCircle,
  Hash, Variable, Table as TableIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function LogicLabPage() {
  const [expression, setExpression] = useState<string>("A AND (B OR C)");
  const [variables, setVariables] = useState<string[]>([]);
  const [truthTable, setTruthTable] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Logic Parser Engine ---
  const generateTable = () => {
    try {
      setError(null);
      // 1. Clean expression and extract variables (A-Z)
      const cleanExpr = expression.toUpperCase();
      const foundVars = Array.from(new Set(cleanExpr.match(/[A-Z]/g))).sort();
      
      if (foundVars.length === 0) throw new Error("No variables found (e.g., A, B)");
      if (foundVars.length > 6) throw new Error("Maximum 6 variables allowed for performance.");

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
        // Replace logical words with JS operators
        let evalStr = cleanExpr
          .replace(/AND|&|\./g, "&&")
          .replace(/OR|\||\+/g, "||")
          .replace(/NOT|!|~/g, "!")
          .replace(/XOR|\^/g, "!=")
          .replace(/NAND/g, "!&&") // Simplified for logic
          .replace(/[A-Z]/g, (match) => combination[match].toString());

        // Use Function instead of eval for slight safety boost
        const result = !!(new Function(`return ${evalStr}`)()) ? 1 : 0;
        table.push({ ...combination, result });
      }

      setTruthTable(table);
      toast.success("Truth Table Generated");
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-slate-500/30">
      {/* Header Section */}
      <section className="relative overflow-hidden py-16 border-b border-white/5 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/20 mb-4 px-4 py-1 uppercase tracking-[0.2em]">
            Digital Logic Lab • V1.0
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase">
            LOGIC <span className="text-slate-400 italic font-serif">GATE</span> GENERATOR
          </h1>
          <p className="text-neutral-500 max-w-2xl mx-auto mb-8 font-medium">
            Analyze boolean algebraic expressions instantly. Input your logic and generate high-fidelity 
            truth tables for academic assignments and circuit design.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Input & Controls --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-300 uppercase tracking-widest">
                  <Cpu className="h-4 w-4" /> Boolean Expression
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="relative">
                    <input 
                      value={expression}
                      onChange={(e) => setExpression(e.target.value)}
                      className={cn(
                        "w-full bg-black border rounded-xl p-4 text-lg font-mono outline-none transition-all",
                        error ? "border-red-500/50" : "border-neutral-800 focus:border-slate-400"
                      )}
                      placeholder="e.g. A AND (B OR C)"
                    />
                    {error && (
                      <div className="absolute -bottom-6 left-0 text-[10px] text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {error}
                      </div>
                    )}
                  </div>

                  {/* Quick Symbols */}
                  <div className="grid grid-cols-4 gap-2">
                    {['AND', 'OR', 'NOT', 'XOR', '(', ')', 'A', 'B'].map((s) => (
                      <button 
                        key={s}
                        onClick={() => insertSymbol(s)}
                        className="bg-neutral-800 hover:bg-slate-400 hover:text-black text-[10px] font-bold py-2 rounded-md transition-all uppercase"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Button className="bg-slate-200 hover:bg-white text-black font-black" onClick={generateTable}>
                    GENERATE
                  </Button>
                  <Button variant="outline" className="border-neutral-800 text-neutral-500" onClick={() => setExpression("")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-500/5 border-slate-500/10">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4">
                  <Info className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="text-xs text-neutral-500 leading-relaxed">
                    <p className="font-bold text-slate-300 mb-1">Supported Notation:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Words: <code className="text-slate-400">AND, OR, NOT, XOR</code></li>
                      <li>Symbols: <code className="text-slate-400">&, |, ~, ^</code></li>
                      <li>Math: <code className="text-slate-400">. (AND), + (OR)</code></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT: Truth Table Output --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                <TableIcon className="h-4 w-4" /> Truth Table Output
              </h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px] border-slate-500/20 text-slate-400">
                  {variables.length} Variables
                </Badge>
                <Badge variant="outline" className="text-[10px] border-slate-500/20 text-slate-400">
                  {truthTable.length} States
                </Badge>
              </div>
            </div>

            <Card className="bg-neutral-900 border-neutral-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-400 text-black">
                      {variables.map(v => (
                        <th key={v} className="p-4 text-center font-black border-r border-black/10">{v}</th>
                      ))}
                      <th className="p-4 text-center font-black italic">OUTPUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {truthTable.map((row, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={idx} 
                          className={cn(
                            "border-b border-white/5 hover:bg-white/5 transition-colors",
                            row.result === 1 ? "bg-slate-500/5" : ""
                          )}
                        >
                          {variables.map(v => (
                            <td key={v} className="p-4 text-center font-mono text-sm border-r border-white/5 opacity-60">
                              {row[v]}
                            </td>
                          ))}
                          <td className="p-4 text-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black tracking-widest",
                              row.result === 1 ? "bg-slate-200 text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "bg-neutral-800 text-neutral-500"
                            )}>
                              {row.result === 1 ? "TRUE (1)" : "FALSE (0)"}
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
                  <Variable size={48} className="opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">Enter logic to generate table</p>
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
      </main>

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
    <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl flex flex-col items-center text-center">
      <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1 tracking-widest">{title} Law</p>
      <p className="text-sm font-mono text-slate-300">{detail}</p>
    </div>
  );
}