"use client";

import { useState, useEffect } from "react";
import { 
  LayoutGrid, ArrowRight, RefreshCw, Calculator, 
  Trash2, Info, CheckCircle2, Hash,
  ArrowLeft, Home, Grid, Settings, Sparkles, Plus, Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as math from "mathjs";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo"; // Assuming this exists from previous steps

export default function MatrixCalculatorClient() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrixA, setMatrixA] = useState<number[][]>(Array(5).fill(0).map(() => Array(5).fill(0)));
  const [matrixB, setMatrixB] = useState<number[][]>(Array(5).fill(0).map(() => Array(5).fill(0)));
  const [result, setResult] = useState<any>(null);
  const [operation, setOperation] = useState<string>("det"); 
  const [activeMatrix, setActiveMatrix] = useState<'A' | 'B' | 'Both'>('A');

  useToolAnalytics("matrix-calculator", "MATRIX LAB", "Engineering Tools");

  // Adjust UI based on operation
  useEffect(() => {
    if (["add", "sub", "mul"].includes(operation)) {
      setActiveMatrix('Both');
    } else {
      setActiveMatrix('A');
    }
    setResult(null); // Reset result on op change
  }, [operation]);

  const updateCell = (m: 'A' | 'B', r: number, c: number, val: string) => {
    const numVal = val === "" ? 0 : parseFloat(val);
    if (m === 'A') {
      const newM = [...matrixA];
      newM[r] = [...newM[r]]; // Deep copy row
      newM[r][c] = numVal;
      setMatrixA(newM);
    } else {
      const newM = [...matrixB];
      newM[r] = [...newM[r]];
      newM[r][c] = numVal;
      setMatrixB(newM);
    }
  };

  const resetMatrices = () => {
    setMatrixA(Array(5).fill(0).map(() => Array(5).fill(0)));
    setMatrixB(Array(5).fill(0).map(() => Array(5).fill(0)));
    setResult(null);
    toast.success("MATRICES CLEARED");
  };

  const calculate = () => {
    try {
      // Slice the 5x5 arrays to the current selected dimensions
      const matA = matrixA.slice(0, rows).map(row => row.slice(0, cols));
      const matB = matrixB.slice(0, rows).map(row => row.slice(0, cols));

      let res;
      switch (operation) {
        case "add": 
          res = math.add(matA, matB); 
          break;
        case "sub": res = math.subtract(matA, matB); break;
        case "mul": 
          if (cols !== rows && activeMatrix === 'Both') { 
             // Note: MathJS handles rectangular multiplication if dimensions align (A cols = B rows)
             // But our UI forces same Rows/Cols for both inputs for simplicity.
             // We allow it to proceed if user sets square or matching dims manually
          }
          res = math.multiply(matA, matB); 
          break;
        case "det": 
          if (rows !== cols) throw new Error("Matrix must be square for Determinant");
          res = math.det(matA); 
          break;
        case "inv": 
          if (rows !== cols) throw new Error("Matrix must be square for Inverse");
          res = math.inv(matA); 
          break;
        case "trans": 
          res = math.transpose(matA); 
          break;
        case "rank": 
            // Using Trace as replacement per previous logic, or if rank is needed, standard MathJS doesn't expose it easily in browser bundle
            // Defaulting to Trace for stability in this demo
            if (rows !== cols) throw new Error("Matrix must be square for Trace");
            res = math.trace(matA);
            break;
      }
      setResult(res);
      toast.success("CALCULATION COMPLETE");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "DIMENSION ERROR");
    }
  };

  const operationsList = [
    { id: 'det', label: 'DETERMINANT' },
    { id: 'inv', label: 'INVERSE' },
    { id: 'trans', label: 'TRANSPOSE' },
    { id: 'rank', label: 'TRACE' }, 
    { id: 'add', label: 'ADD (A+B)' },
    { id: 'sub', label: 'SUBTRACT (A-B)' },
    { id: 'mul', label: 'MULTIPLY (AxB)' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-yellow-600/5 blur-[100px] pointer-events-none" />

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-yellow-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">MATRIX LAB</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            <Sparkles className="h-3 w-3" /> Linear Algebra Engine
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Matrix <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-700">Calc</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Solve systems up to 5x5 dimensions. Real-time computation.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-4 pt-6 px-6 border-b border-white/5">
                <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings className="h-3 w-3 text-yellow-500" /> System Config
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Dimensions */}
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black text-white uppercase tracking-widest bg-black/40 p-3 rounded-xl border border-white/5">
                      <span>Grid Size</span>
                      <span className="text-yellow-500 font-mono text-sm">{rows} x {cols}</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      {/* Row Control */}
                      <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Rows</span>
                          <div className="flex items-center bg-black border border-white/10 rounded-xl p-1">
                             <Button size="icon" className="h-8 w-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400" onClick={() => setRows(Math.max(1, rows - 1))} disabled={rows <= 1}><Minus size={14}/></Button>
                             <span className="flex-1 text-center font-mono text-sm font-bold">{rows}</span>
                             <Button size="icon" className="h-8 w-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white" onClick={() => setRows(Math.min(5, rows + 1))} disabled={rows >= 5}><Plus size={14}/></Button>
                          </div>
                      </div>
                      {/* Col Control */}
                      <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Cols</span>
                          <div className="flex items-center bg-black border border-white/10 rounded-xl p-1">
                             <Button size="icon" className="h-8 w-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400" onClick={() => setCols(Math.max(1, cols - 1))} disabled={cols <= 1}><Minus size={14}/></Button>
                             <span className="flex-1 text-center font-mono text-sm font-bold">{cols}</span>
                             <Button size="icon" className="h-8 w-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white" onClick={() => setCols(Math.min(5, cols + 1))} disabled={cols >= 5}><Plus size={14}/></Button>
                          </div>
                      </div>
                   </div>
                </div>

                {/* Operations */}
                <div className="space-y-3">
                   <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Select Logic</span>
                   <div className="grid grid-cols-2 gap-2">
                      {operationsList.map(op => (
                        <button
                          key={op.id}
                          onClick={() => setOperation(op.id)}
                          className={cn(
                             "px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider border text-left transition-all active:scale-95",
                             operation === op.id 
                                ? "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]" 
                                : "bg-neutral-900 text-neutral-500 border-white/5 hover:border-white/20 hover:text-white"
                          )}
                        >
                          {op.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button className="flex-1 bg-white text-black hover:bg-neutral-200 font-black uppercase italic text-sm tracking-wider h-14 rounded-xl shadow-lg active:scale-[0.98] transition-transform" onClick={calculate}>
                    <Calculator className="mr-2 h-4 w-4" /> Calculate
                  </Button>
                  <Button variant="outline" className="h-14 w-14 rounded-xl border-white/10 bg-neutral-900 text-red-500 hover:bg-red-500/10 hover:text-red-400 p-0 hover:border-red-500/30 transition-colors" onClick={resetMatrices}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

              </CardContent>
            </Card>

            <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex gap-3 items-start">
               <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500 mt-0.5">
                   <Info size={14} />
               </div>
               <p className="text-[10px] text-neutral-400 leading-relaxed font-medium uppercase tracking-wide">
                 <strong className="text-yellow-500">Constraint:</strong> Determinant, Inverse, and Trace functions require Square Matrices (e.g. 3x3).
               </p>
            </div>
          </div>

          {/* RIGHT: Matrix Grids */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Matrix A */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
                       <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center font-serif font-black text-xs text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]">A</div>
                       Input Matrix A
                    </h3>
                 </div>
                 <div 
                   className="grid gap-2 p-4 bg-neutral-900/40 border border-white/10 rounded-[1.5rem] backdrop-blur-sm"
                   style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                 >
                   {Array.from({ length: rows }).map((_, r) => 
                     Array.from({ length: cols }).map((_, c) => (
                       <input 
                         key={`a-${r}-${c}`}
                         type="number"
                         value={matrixA[r][c] || ''}
                         onChange={(e) => updateCell('A', r, c, e.target.value)}
                         className="bg-black border border-white/10 rounded-xl h-12 md:h-14 text-center text-sm md:text-base font-mono text-white focus:border-yellow-500 focus:bg-yellow-500/10 outline-none transition-all p-0 placeholder:text-neutral-800 font-bold"
                         placeholder="0"
                       />
                     ))
                   )}
                 </div>
              </div>

              {/* Matrix B (Conditional) */}
              <AnimatePresence>
                {activeMatrix === 'Both' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
                           <div className="h-6 w-6 rounded-lg bg-pink-600 flex items-center justify-center font-serif font-black text-xs text-white shadow-[0_0_10px_rgba(219,39,119,0.4)]">B</div>
                           Input Matrix B
                        </h3>
                      </div>
                      <div 
                        className="grid gap-2 p-4 bg-neutral-900/40 border border-white/10 rounded-[1.5rem] backdrop-blur-sm"
                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                      >
                        {Array.from({ length: rows }).map((_, r) => 
                          Array.from({ length: cols }).map((_, c) => (
                            <input 
                              key={`b-${r}-${c}`}
                              type="number"
                              value={matrixB[r][c] || ''}
                              onChange={(e) => updateCell('B', r, c, e.target.value)}
                              className="bg-black border border-white/10 rounded-xl h-12 md:h-14 text-center text-sm md:text-base font-mono text-white focus:border-pink-500 focus:bg-pink-500/10 outline-none transition-all p-0 placeholder:text-neutral-800 font-bold"
                              placeholder="0"
                            />
                          ))
                        )}
                      </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- RESULT AREA --- */}
            <AnimatePresence>
              {result !== null && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                >
                   <Card className="bg-yellow-500 border-none overflow-hidden relative rounded-[2rem] shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                      <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                         <Hash size={200} className="text-black" />
                      </div>
                      <CardHeader className="pb-0 pt-8 px-8 relative z-10">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
                               <CheckCircle2 size={18} /> Calculation Output
                            </CardTitle>
                            <Badge className="bg-black/20 text-black border-none hover:bg-black/30 font-black uppercase text-[10px] tracking-widest px-3 py-1">
                                {operation}
                            </Badge>
                         </div>
                      </CardHeader>
                      <CardContent className="p-8 relative z-10">
                         <div className="flex items-center justify-center min-h-[120px]">
                            {typeof result === 'number' ? (
                               <div className="text-7xl md:text-8xl font-black text-black tracking-tighter">
                                  {parseFloat(result.toFixed(4))}
                               </div>
                            ) : (
                               <div 
                                  className="grid gap-3 p-6 bg-black/10 rounded-2xl backdrop-blur-sm border border-black/5"
                                  style={{ gridTemplateColumns: `repeat(${result[0]?.length || result.length}, minmax(0, 1fr))` }}
                               >
                                  {Array.isArray(result) && result.map((row: any, r: number) => 
                                     (Array.isArray(row) ? row : [row]).map((val: any, c: number) => (
                                        <div key={`res-${r}-${c}`} className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center bg-black text-yellow-500 rounded-xl font-bold font-mono text-lg md:text-2xl shadow-xl">
                                           {typeof val === 'number' ? parseFloat(val.toFixed(2)) : val}
                                        </div>
                                     ))
                                  )}
                               </div>
                            )}
                         </div>
                      </CardContent>
                   </Card>
                </motion.div>
              )}
            </AnimatePresence>

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
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-yellow-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full" />
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
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}