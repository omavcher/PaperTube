"use client";

import { useState, useMemo } from "react";
import { 
  BarChart, LineChart, Sigma, Trash2, 
  FileSpreadsheet, Info, TrendingUp, 
  Copy, Zap, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as math from "mathjs";
import Footer from "@/components/Footer";
import { motion } from "framer-motion"; // ADDED MISSING IMPORT

export default function DataInsightLab() {
  const [inputX, setInputX] = useState<string>("12, 15, 14, 18, 22");
  const [inputY, setInputY] = useState<string>("5, 8, 7, 11, 14");
  const [mode, setMode] = useState<'single' | 'regression'>('single');

  // --- Logic: Calculation Engine ---
  const results = useMemo(() => {
    try {
      const arrX = inputX.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
      const arrY = inputY.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

      if (arrX.length === 0) return null;

      // Wrapping in Number() to ensure .toFixed() availability
      const stats = {
        mean: Number(math.mean(arrX)),
        median: Number(math.median(arrX)),
        stdDev: Number(math.std(arrX)),
        variance: Number(math.variance(arrX)),
        min: Number(math.min(arrX)),
        max: Number(math.max(arrX)),
        sum: Number(math.sum(arrX)),
        count: arrX.length,
        regression: null as any
      };

      if (mode === 'regression' && arrX.length === arrY.length && arrX.length > 1) {
        const regMatrix = math.multiply(
          math.inv([[arrX.length, math.sum(arrX)], [math.sum(arrX), math.sum(math.map(arrX, (v) => v * v))]]), 
          [math.sum(arrY), math.sum(math.dotMultiply(arrX, arrY))]
        ) as any;

        stats.regression = {
          c: Number(regMatrix[0]),
          m: Number(regMatrix[1]),
          r: Number(math.corr(arrX, arrY))
        };
      }

      return stats;
    } catch (e) {
      return null;
    }
  }, [inputX, inputY, mode]);

  const copyResults = () => {
    if (!results) return;
    const text = `Data Summary\nMean: ${results.mean.toFixed(2)}\nSD: ${results.stdDev.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    toast.success("Summary exported");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-slate-500/30 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <section className="relative z-10 py-16 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 px-4 py-1 uppercase font-black text-[10px] tracking-[0.3em]">
              <Activity size={10} className="mr-2 text-slate-500" /> Data Analytics Core v4.0
            </Badge>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
            DATA <span className="text-slate-500">INSIGHT</span> LAB
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto font-medium">
            High-precision statistical analysis engine for engineering protocols.
          </p>
        </div>
      </section>

      <main className="container relative z-10 mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 flex items-center gap-2">
                     <FileSpreadsheet size={12} className="text-slate-400" /> Buffer Input
                   </p>
                   <div className="flex bg-black p-1 rounded-xl border border-white/5">
                    {(['single', 'regression'] as const).map((m) => (
                      <button key={m} onClick={() => setMode(m)} className={cn("px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all", mode === m ? "bg-white text-black" : "text-neutral-600 hover:text-white")}>
                        {m}
                      </button>
                    ))}
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Dataset Alpha</label>
                    <textarea 
                      value={inputX} onChange={(e) => setInputX(e.target.value)}
                      className="w-full h-32 bg-black border border-white/5 rounded-2xl p-5 font-mono text-xs text-slate-300 focus:border-slate-500 outline-none resize-none transition-colors"
                    />
                  </div>
                  {mode === 'regression' && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Dataset Beta</label>
                      <textarea 
                        value={inputY} onChange={(e) => setInputY(e.target.value)}
                        className="w-full h-32 bg-black border border-white/5 rounded-2xl p-5 font-mono text-xs text-slate-300 focus:border-slate-500 outline-none resize-none transition-colors"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" className="rounded-xl border border-white/5 text-neutral-500 font-black text-[10px]" onClick={() => { setInputX(""); setInputY(""); }}>
                    <Trash2 size={14} className="mr-2" /> WIPE
                  </Button>
                  <Button className="rounded-xl bg-white text-black font-black text-[10px]" onClick={copyResults}>
                    <Copy size={14} className="mr-2" /> EXPORT
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-[10px] font-black tracking-[0.4em] text-neutral-600 uppercase flex items-center gap-2 px-2">
                <BarChart size={14} /> Resulting Matrix
            </h3>

            {results ? (
              <div className="grid gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResultTile label="Mean" value={results.mean.toFixed(2)} />
                  <ResultTile label="Std Dev" value={results.stdDev.toFixed(2)} />
                  <ResultTile label="Median" value={results.median.toFixed(2)} />
                  <ResultTile label="Sum" value={results.sum.toFixed(2)} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-0">
                      <table className="w-full text-[10px]">
                        <tbody className="divide-y divide-white/5">
                          <TableRow label="Variance" value={results.variance.toFixed(4)} />
                          <TableRow label="Minimum" value={results.min} />
                          <TableRow label="Maximum" value={results.max} />
                          <TableRow label="Count" value={results.count} />
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  {mode === 'regression' && results.regression ? (
                    <Card className="bg-white border-none text-black rounded-[2.5rem] p-6 space-y-6">
                      <div>
                        <p className="text-[8px] font-black uppercase mb-1 opacity-50 tracking-widest">Linear Fit</p>
                        <p className="text-2xl font-black italic tracking-tighter">
                          y = {results.regression.m.toFixed(3)}x {results.regression.c >= 0 ? '+' : ''} {results.regression.c.toFixed(3)}
                        </p>
                      </div>
                      <div className="pt-5 border-t border-black/10">
                        <p className="text-[8px] font-black uppercase mb-1 opacity-50 tracking-widest">Correlation (R)</p>
                        <p className="text-5xl font-black tracking-tighter italic">{results.regression.r.toFixed(4)}</p>
                      </div>
                    </Card>
                  ) : (
                    <div className="h-full border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-neutral-700 p-8 text-center">
                       <LineChart className="opacity-10 mb-4" size={48} />
                       <p className="text-[9px] font-black uppercase tracking-[0.2em]">Regression Protocol Offline</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[400px] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-neutral-800">
                <Sigma size={64} className="opacity-5 mb-4" />
                <p className="font-black uppercase tracking-[0.5em] text-[10px]">Awaiting Neural Injection</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ResultTile({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-neutral-950 border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center">
      <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-2">{label}</p>
      <p className="text-2xl font-black text-white tracking-tighter italic">{value}</p>
    </div>
  );
}

function TableRow({ label, value }: { label: string, value: any }) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="p-5 font-black text-neutral-600 uppercase tracking-widest">{label}</td>
      <td className="p-5 text-right font-mono font-bold text-slate-200">{value}</td>
    </tr>
  );
}