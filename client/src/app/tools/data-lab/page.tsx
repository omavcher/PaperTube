"use client";

import { useState, useMemo } from "react";
import { 
  BarChart, LineChart, Sigma, Trash2, 
  Download, FileSpreadsheet, Calculator,
  Info, TrendingUp, Hash, Table as TableIcon,
  CheckCircle2, Copy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as math from "mathjs";
import Footer from "@/components/Footer";

export default function DataInsightLab() {
  const [inputX, setInputX] = useState<string>("12, 15, 14, 18, 22");
  const [inputY, setInputY] = useState<string>("5, 8, 7, 11, 14");
  const [mode, setMode] = useState<'single' | 'regression'>('single');

  // Logic: Parse and Calculate
  const results = useMemo(() => {
    try {
      const arrX = inputX.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
      const arrY = inputY.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

      if (arrX.length === 0) return null;

      const stats = {
        mean: math.mean(arrX),
        median: math.median(arrX),
        stdDev: math.std(arrX),
        variance: math.variance(arrX),
        min: math.min(arrX),
        max: math.max(arrX),
        sum: math.sum(arrX),
        count: arrX.length,
        regression: null as any
      };

      if (mode === 'regression' && arrX.length === arrY.length && arrX.length > 1) {
        // Calculate Linear Regression y = mx + c
        const regression = math.multiply(math.inv([[arrX.length, math.sum(arrX)], [math.sum(arrX), math.sum(math.map(arrX, (v) => v * v))]]), [math.sum(arrY), math.sum(math.dotMultiply(arrX, arrY))]);
        stats.regression = {
          c: regression[0],
          m: regression[1],
          r: math.corr(arrX, arrY)
        };
      }

      return stats;
    } catch (e) {
      return null;
    }
  }, [inputX, inputY, mode]);

  const copyResults = () => {
    if (!results) return;
    const text = `Data Analysis Summary\nMean: ${results.mean}\nSD: ${results.stdDev}\nVariance: ${results.variance}`;
    navigator.clipboard.writeText(text);
    toast.success("Summary copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-slate-500/30">
      {/* Header */}
      <section className="py-16 border-b border-white/5 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/20 mb-4 px-4 py-1 uppercase tracking-[0.2em]">
            Data Analytics Lab • V1.0
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase">
            DATA <span className="text-slate-400 italic font-serif">INSIGHT</span> LAB
          </h1>
          <p className="text-neutral-500 max-w-2xl mx-auto">
            Analyze laboratory data sets instantly. Calculate descriptive statistics and linear 
            regression models for your engineering reports.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Input Side */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 shadow-2xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-300">
                    <FileSpreadsheet className="h-4 w-4" /> DATA INPUT
                  </CardTitle>
                  <div className="flex bg-black p-1 rounded-lg border border-white/10">
                    <button 
                      onClick={() => setMode('single')}
                      className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", mode === 'single' ? "bg-slate-200 text-black" : "text-neutral-500")}
                    >Single</button>
                    <button 
                      onClick={() => setMode('regression')}
                      className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", mode === 'regression' ? "bg-slate-200 text-black" : "text-neutral-500")}
                    >Regression</button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Dataset {mode === 'regression' ? 'X (Independent)' : ''}
                  </label>
                  <textarea 
                    value={inputX} onChange={(e) => setInputX(e.target.value)}
                    className="w-full h-32 bg-black border border-neutral-800 rounded-xl p-4 font-mono text-sm focus:border-slate-400 outline-none resize-none"
                    placeholder="e.g. 10, 20, 30..."
                  />
                </div>

                {mode === 'regression' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Dataset Y (Dependent)</label>
                    <textarea 
                      value={inputY} onChange={(e) => setInputY(e.target.value)}
                      className="w-full h-32 bg-black border border-neutral-800 rounded-xl p-4 font-mono text-sm focus:border-slate-400 outline-none resize-none"
                      placeholder="e.g. 5, 10, 15..."
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" className="border-neutral-800 text-neutral-500" onClick={() => { setInputX(""); setInputY(""); }}>
                    <Trash2 className="h-4 w-4 mr-2" /> CLEAR
                  </Button>
                  <Button className="bg-slate-200 hover:bg-white text-black font-black" onClick={copyResults}>
                    <Copy className="h-4 w-4 mr-2" /> COPY
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-slate-500/5 border border-slate-500/10">
              <div className="flex gap-4">
                <Info className="h-5 w-5 text-slate-400 shrink-0" />
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Enter comma-separated numbers. For regression, ensure both datasets have the same number of items.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Stats Dashboard */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase flex items-center gap-2 px-2">
              <BarChart className="h-4 w-4" /> Statistical Analysis
            </h3>

            {results ? (
              <div className="grid gap-6">
                {/* Major Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResultTile label="Mean (Avg)" value={results.mean.toFixed(2)} />
                  <ResultTile label="Std. Deviation" value={results.stdDev.toFixed(2)} />
                  <ResultTile label="Median" value={results.median.toFixed(2)} />
                  <ResultTile label="Sum" value={results.sum.toFixed(2)} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Detailed Table */}
                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-white/5">
                          <TableRow label="Variance" value={results.variance.toFixed(4)} />
                          <TableRow label="Minimum" value={results.min} />
                          <TableRow label="Maximum" value={results.max} />
                          <TableRow label="Range" value={results.max - results.min} />
                          <TableRow label="Total Samples" value={results.count} />
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  {/* Regression Result */}
                  {mode === 'regression' && results.regression ? (
                    <Card className="bg-slate-200 border-none text-black relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><LineChart size={120} /></div>
                      <CardHeader>
                        <CardTitle className="text-xs font-black tracking-widest uppercase opacity-60">Regression Model</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 relative z-10">
                        <div>
                          <p className="text-[10px] font-bold uppercase mb-1">Linear Equation (y = mx + c)</p>
                          <p className="text-2xl font-black italic">
                            y = {results.regression.m.toFixed(3)}x {results.regression.c >= 0 ? '+' : ''} {results.regression.c.toFixed(3)}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-black/10">
                          <p className="text-[10px] font-bold uppercase mb-1">Correlation Coefficient (R)</p>
                          <p className="text-3xl font-black">{results.regression.r.toFixed(4)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="h-full border-2 border-dashed border-neutral-800 rounded-3xl flex flex-col items-center justify-center text-neutral-600 p-8 text-center">
                       <TrendingUp className="opacity-20 mb-4" size={48} />
                       <p className="text-xs font-bold uppercase tracking-widest">Select Regression mode to see predictive analysis</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[400px] border-2 border-dashed border-neutral-800 rounded-3xl flex flex-col items-center justify-center text-neutral-700">
                <Sigma size={64} className="opacity-10 mb-4" />
                <p className="font-bold uppercase tracking-[0.3em] text-xs">Awaiting Data Entry</p>
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
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center text-center shadow-xl">
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black text-slate-200 tracking-tighter">{value}</p>
    </div>
  );
}

function TableRow({ label, value }: { label: string, value: any }) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="p-4 font-bold text-neutral-500 uppercase text-[10px] tracking-widest">{label}</td>
      <td className="p-4 text-right font-mono font-bold text-slate-300">{value}</td>
    </tr>
  );
}