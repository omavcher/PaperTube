"use client";

import { useState, useMemo } from "react";
import { 
  Banknote, Calendar, Percent, PieChart, 
  ArrowRight, Info, CheckCircle2, Download,
  TrendingDown, Landmark, Wallet, ArrowLeft,
  Home, Grid, Settings, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

export default function EmiCalculatorClient() {
  const [amount, setAmount] = useState<number>(1000000); // 10 Lakhs
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(10); // 10 Years
  
  useToolAnalytics("emi-calculator", "EMI CALC", "Engineering Tools");

  const results = useMemo(() => {
    const P = amount;
    const r = rate / 12 / 100;
    const n = tenure * 12;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const monthlyEmi = isFinite(emi) ? emi : 0;
    const totalPayment = monthlyEmi * n;
    const totalInterest = totalPayment - P;

    return {
      monthlyEmi: Math.round(monthlyEmi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      interestPercent: totalPayment > 0 ? ((totalInterest / totalPayment) * 100).toFixed(1) : "0"
    };
  }, [amount, rate, tenure]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 flex flex-col font-sans">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-[40vh] bg-emerald-600/5 blur-[100px] pointer-events-none" />

      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Wallet className="text-emerald-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">EMI CALC</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(5,150,105,0.2)]">
            <Sparkles className="h-3 w-3" /> Finance & Planning
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Universal <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-700">EMI</span> Lab
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Forecast your liabilities. Plan home, car, or personal loans instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardContent className="p-8 space-y-10">
                
                {/* Amount Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-500" /> Loan Amount
                    </label>
                    <span className="text-2xl font-black font-mono text-white tracking-tighter">₹{amount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="100000" max="10000000" step="50000" 
                    value={amount} onChange={(e) => setAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-neutral-600 uppercase tracking-widest">
                    <span>₹1L</span>
                    <span>₹1Cr</span>
                  </div>
                </div>

                {/* Interest Rate Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                      <Percent className="h-4 w-4 text-emerald-500" /> Interest Rate (P.A)
                    </label>
                    <span className="text-2xl font-black font-mono text-white tracking-tighter">{rate}%</span>
                  </div>
                  <input 
                    type="range" min="1" max="25" step="0.1" 
                    value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-neutral-600 uppercase tracking-widest">
                    <span>1%</span>
                    <span>25%</span>
                  </div>
                </div>

                {/* Tenure Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-500" /> Tenure (Years)
                    </label>
                    <span className="text-2xl font-black font-mono text-white tracking-tighter">{tenure} Yrs</span>
                  </div>
                  <input 
                    type="range" min="1" max="30" step="1" 
                    value={tenure} onChange={(e) => setTenure(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-neutral-600 uppercase tracking-widest">
                    <span>1 Yr</span>
                    <span>30 Yrs</span>
                  </div>
                </div>

                <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase italic tracking-wider rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)] active:scale-[0.98] transition-transform">
                  Download Schedule <Download className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 flex gap-4 backdrop-blur-sm">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 h-fit">
                  <Info size={16} />
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed font-bold uppercase tracking-wide pt-1">
                <strong className="text-emerald-500 block mb-1">Standard Algorithm</strong>
                Calculations use the Reducing Balance method, standard for global banking institutions.
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
               <ResultCard 
                label="Monthly EMI" 
                value={`₹${results.monthlyEmi.toLocaleString()}`} 
                icon={<Wallet className="text-emerald-500" />}
               />
               <ResultCard 
                label="Total Interest" 
                value={`₹${results.totalInterest.toLocaleString()}`} 
                icon={<TrendingDown className="text-blue-500" />}
               />
            </div>

            <Card className="bg-emerald-600 border-none text-white p-10 relative overflow-hidden rounded-[2rem] shadow-[0_0_50px_rgba(5,150,105,0.3)]">
               <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Landmark size={200} /></div>
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-80 flex items-center gap-2">
                    Total Repayment <ArrowRight size={12} />
                 </p>
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 font-mono">₹{results.totalPayment.toLocaleString()}</h2>
                 
                 <div className="flex gap-4">
                   <div className="bg-black/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10 flex-1">
                     <span className="text-[9px] font-black uppercase block opacity-60 tracking-widest mb-1">Principal</span>
                     <span className="text-xl font-bold font-mono">{100 - parseFloat(results.interestPercent)}%</span>
                   </div>
                   <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 flex-1">
                     <span className="text-[9px] font-black uppercase block opacity-80 tracking-widest mb-1">Interest</span>
                     <span className="text-xl font-bold font-mono">{results.interestPercent}%</span>
                   </div>
                 </div>
               </div>
            </Card>

            {/* Interest Visualization */}
            <div className="space-y-4 pt-6 px-2">
               <div className="flex justify-between text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                 <span className="flex items-center gap-2"><PieChart size={14} /> Interest Outflow</span>
                 <span className="text-emerald-500">{results.interestPercent}% of Loan</span>
               </div>
               <div className="h-4 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${results.interestPercent}%` }}
                   transition={{ duration: 1, ease: "easeOut" }}
                   className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                 />
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
          <Link href="/tools" className="flex flex-col items-center justify-center w-full h-full text-emerald-500 transition-colors gap-1.5 relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
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
        input[type=range] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          margin-top: -10px; 
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          border: 2px solid #000;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #262626;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}

function ResultCard({ label, value, icon }: any) {
  return (
    <Card className="bg-neutral-900/40 border-white/10 p-6 flex items-center gap-6 shadow-xl backdrop-blur-sm hover:border-emerald-500/30 transition-colors group rounded-[1.5rem]">
      <div className="h-14 w-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl md:text-3xl font-black tracking-tighter text-white font-mono">{value}</p>
      </div>
    </Card>
  );
}