"use client";

import { useState, useMemo } from "react";
import { 
  Banknote, Calendar, Percent, PieChart, 
  ArrowRight, Info, CheckCircle2, Download,
  TrendingDown, Landmark, Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Footer from "@/components/Footer";

export default function EmiCalculator() {
  const [amount, setAmount] = useState<number>(1000000); // 10 Lakhs
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(10); // 10 Years

  const results = useMemo(() => {
    const P = amount;
    const r = rate / 12 / 100;
    const n = tenure * 12;

    const emi = (P * r * Math.pow(1, n)) / (Math.pow(1 + r, n) - 1); // Simplified for calculation
    const monthlyEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyEmi * n;
    const totalInterest = totalPayment - P;

    return {
      monthlyEmi: Math.round(monthlyEmi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      interestPercent: ((totalInterest / totalPayment) * 100).toFixed(1)
    };
  }, [amount, rate, tenure]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="py-16 border-b border-white/5 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4 px-4 py-1 uppercase tracking-widest">
            Finance & Planning
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase">
            Universal <span className="text-emerald-500 italic">EMI</span> Lab
          </h1>
          <p className="text-neutral-500 max-w-2xl mx-auto">
            Plan your home, car, or personal loans. Get instant monthly breakdowns and 
            understand your interest obligations clearly.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="bg-neutral-900 border-neutral-800 shadow-2xl">
              <CardContent className="p-8 space-y-10">
                
                {/* Amount Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Loan Amount</label>
                    <span className="text-2xl font-black text-emerald-500">₹{amount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="100000" max="10000000" step="100000" 
                    value={amount} onChange={(e) => setAmount(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                {/* Interest Rate Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Interest Rate (P.A)</label>
                    <span className="text-2xl font-black text-emerald-500">{rate}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="20" step="0.1" 
                    value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                {/* Tenure Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Tenure (Years)</label>
                    <span className="text-2xl font-black text-emerald-500">{tenure} Yrs</span>
                  </div>
                  <input 
                    type="range" min="1" max="30" step="1" 
                    value={tenure} onChange={(e) => setTenure(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg rounded-xl shadow-lg shadow-emerald-500/20">
                  DOWNLOAD SCHEDULE
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4">
              <Info className="h-6 w-6 text-emerald-500 shrink-0" />
              <p className="text-xs text-neutral-500 leading-relaxed italic">
                Our calculation uses the standard <span className="text-emerald-500 font-bold">Reducing Balance</span> method used by major banks globally.
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

            <Card className="bg-emerald-500 border-none text-black p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Landmark size={200} /></div>
               <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-70">Total Repayment Amount</p>
                  <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-6">₹{results.totalPayment.toLocaleString()}</h2>
                  <div className="flex gap-4">
                    <div className="bg-black/10 px-4 py-2 rounded-lg font-bold">Principal: {100 - parseFloat(results.interestPercent)}%</div>
                    <div className="bg-black/10 px-4 py-2 rounded-lg font-bold">Interest: {results.interestPercent}%</div>
                  </div>
               </div>
            </Card>

            {/* Interest Visualization */}
            <div className="space-y-3 pt-6">
               <div className="flex justify-between text-xs font-black uppercase text-neutral-500 px-2">
                 <span>Interest Outflow</span>
                 <span className="text-emerald-500">{results.interestPercent}% of Loan</span>
               </div>
               <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500" style={{ width: `${results.interestPercent}%` }} />
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ResultCard({ label, value, icon }: any) {
  return (
    <Card className="bg-neutral-900 border-neutral-800 p-6 flex items-center gap-6 shadow-xl">
      <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tighter">{value}</p>
      </div>
    </Card>
  );
}