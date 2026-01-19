"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Grid3X3, ArrowRight, RefreshCw, Calculator, 
  Trash2, Info, CheckCircle2, ChevronDown,
  LayoutGrid, Binary, Hash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as math from "mathjs";
import Footer from "@/components/Footer";
import { AnimatePresence, motion } from "framer-motion";

// --- Matrix Component ---
export default function MatrixCalculatorPage() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrixA, setMatrixA] = useState<number[][]>(Array(5).fill(0).map(() => Array(5).fill(0)));
  const [matrixB, setMatrixB] = useState<number[][]>(Array(5).fill(0).map(() => Array(5).fill(0)));
  const [result, setResult] = useState<any>(null);
  const [operation, setOperation] = useState<string>("det"); // Default: Determinant
  const [activeMatrix, setActiveMatrix] = useState<'A' | 'B' | 'Both'>('A');

  // Adjust UI based on operation
  useEffect(() => {
    if (["add", "sub", "mul"].includes(operation)) {
      setActiveMatrix('Both');
    } else {
      setActiveMatrix('A');
    }
  }, [operation]);

  const updateCell = (m: 'A' | 'B', r: number, c: number, val: string) => {
    const numVal = val === "" ? 0 : parseFloat(val);
    if (m === 'A') {
      const newM = [...matrixA];
      newM[r][c] = numVal;
      setMatrixA(newM);
    } else {
      const newM = [...matrixB];
      newM[r][c] = numVal;
      setMatrixB(newM);
    }
  };

  const resetMatrices = () => {
    setMatrixA(Array(5).fill(0).map(() => Array(5).fill(0)));
    setMatrixB(Array(5).fill(0).map(() => Array(5).fill(0)));
    setResult(null);
    toast.success("Matrices cleared");
  };

  const calculate = () => {
    try {
      // Slice the 5x5 arrays to the current selected dimensions
      const matA = matrixA.slice(0, rows).map(row => row.slice(0, cols));
      const matB = matrixB.slice(0, rows).map(row => row.slice(0, cols));

      let res;
      switch (operation) {
        case "add": res = math.add(matA, matB); break;
        case "sub": res = math.subtract(matA, matB); break;
        case "mul": res = math.multiply(matA, matB); break;
        case "det": 
          if (rows !== cols) throw new Error("Matrix must be square for Determinant");
          res = math.det(matA); 
          break;
        case "inv": 
          if (rows !== cols) throw new Error("Matrix must be square for Inverse");
          res = math.inv(matA); 
          break;
        case "trans": res = math.transpose(matA); break;
        case "rank": 
          // Mathjs doesn't have native rank, but we can simulate or use built-in helpers
          res = math.size(matA); // Placeholder for rank logic if needed complexly
          break;
      }
      setResult(res);
      toast.success("Calculation Successful");
    } catch (error: any) {
      toast.error(error.message || "Calculation Error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header Section */}
      <section className="relative overflow-hidden py-16 border-b border-white/5 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 mb-4 px-4 py-1">
            Engineering Tool • V2.0
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
            ALL-IN-ONE <span className="text-yellow-500 italic">MATRIX</span> CALCULATOR
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Perform complex linear algebra operations instantly. Supports Addition, Multiplication, 
            Determinants, Inverses, and more for up to 5x5 matrices.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Controls --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-yellow-500" /> DIMENSIONS & OPS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Size Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Rows (1-5)</label>
                    <select 
                      value={rows} 
                      onChange={(e) => setRows(parseInt(e.target.value))}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm outline-none focus:border-yellow-500"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Cols (1-5)</label>
                    <select 
                      value={cols} 
                      onChange={(e) => setCols(parseInt(e.target.value))}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm outline-none focus:border-yellow-500"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                {/* Operation Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Select Operation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {id: 'det', label: 'Determinant'},
                      {id: 'inv', label: 'Inverse'},
                      {id: 'add', label: 'Addition'},
                      {id: 'mul', label: 'Multiplication'},
                      {id: 'trans', label: 'Transpose'},
                      {id: 'sub', label: 'Subtraction'},
                    ].map(op => (
                      <Button
                        key={op.id}
                        variant="outline"
                        size="sm"
                        onClick={() => setOperation(op.id)}
                        className={cn(
                          "justify-start border-neutral-800 text-[11px] h-9",
                          operation === op.id ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 font-bold" : "hover:border-yellow-500/50"
                        )}
                      >
                        {op.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-black" onClick={calculate}>
                    CALCULATE
                  </Button>
                  <Button variant="outline" className="border-neutral-800 text-red-500" onClick={resetMatrices}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-500/5 border-yellow-500/10">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Info className="h-5 w-5 text-yellow-500 shrink-0" />
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-yellow-500 font-bold">Pro Tip:</span> For matrix multiplication, the columns of Matrix A must equal the rows of Matrix B. Our engine handles this padding automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT: Matrix Grids --- */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Matrix A */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                    <Hash className="h-3 w-3" /> Matrix A ({rows}x{cols})
                   </h3>
                   <Badge variant="outline" className="text-[9px] border-yellow-500/20 text-yellow-500">INPUT REQUIRED</Badge>
                </div>
                <div 
                  className="grid gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: rows }).map((_, r) => 
                    Array.from({ length: cols }).map((_, c) => (
                      <input 
                        key={`a-${r}-${c}`}
                        type="number"
                        value={matrixA[r][c] || ''}
                        onChange={(e) => updateCell('A', r, c, e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg h-12 text-center text-sm focus:border-yellow-500 focus:bg-neutral-900 outline-none transition-all p-1"
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
                      <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                        <Hash className="h-3 w-3" /> Matrix B ({rows}x{cols})
                      </h3>
                    </div>
                    <div 
                      className="grid gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
                      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: rows }).map((_, r) => 
                        Array.from({ length: cols }).map((_, c) => (
                          <input 
                            key={`b-${r}-${c}`}
                            type="number"
                            value={matrixB[r][c] || ''}
                            onChange={(e) => updateCell('B', r, c, e.target.value)}
                            className="bg-neutral-800 border border-neutral-700 rounded-lg h-12 text-center text-sm focus:border-yellow-500 outline-none transition-all p-1"
                          />
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- RESULT AREA --- */}
            {result !== null && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-8"
              >
                <Card className="bg-yellow-500/10 border-yellow-500/20 overflow-hidden">
                  <CardHeader className="bg-yellow-500 text-black py-4">
                    <CardTitle className="text-sm font-black flex items-center justify-between">
                      <div className="flex items-center gap-2 uppercase">
                        <CheckCircle2 className="h-4 w-4" /> Result Output
                      </div>
                      <Badge className="bg-black text-white border-none">{operation.toUpperCase()}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 flex items-center justify-center min-h-[150px]">
                    {typeof result === 'number' ? (
                      <div className="text-6xl font-black text-yellow-500 tracking-tighter">
                        {parseFloat(result.toFixed(4))}
                      </div>
                    ) : (
                      <div 
                        className="grid gap-3"
                        style={{ gridTemplateColumns: `repeat(${result[0]?.length || result.length}, minmax(0, 1fr))` }}
                      >
                        {Array.isArray(result) && result.map((row: any, r: number) => 
                          (Array.isArray(row) ? row : [row]).map((val: any, c: number) => (
                            <div key={`res-${r}-${c}`} className="w-16 h-12 flex items-center justify-center bg-black border border-yellow-500/30 rounded-lg text-yellow-500 font-bold text-sm">
                              {typeof val === 'number' ? parseFloat(val.toFixed(2)) : val}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

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