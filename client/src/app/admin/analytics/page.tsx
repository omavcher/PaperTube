"use client";

import React, { useState } from "react";
import { 
  Cpu, Zap, BarChart3, Activity, 
  Clock, Database, PieChart, TrendingUp, 
  Layers, HardDrive, RefreshCcw, 
  LayoutGrid, Share2, MousePointer2,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SimpleChart, BarChart } from "@/components/ui/simple-chart";

// --- Mock Analytics Data ---
const MODEL_USAGE = [
  { name: "Sankshipta (Free)", usage: 65, color: "bg-red-500" },
  { name: "Bhasha-Setu (Free)", usage: 15, color: "bg-blue-500" },
  { name: "Vyavastha (Pro)", usage: 12, color: "bg-emerald-500" },
  { name: "Sarlakruti (Pro)", usage: 8, color: "bg-orange-500" },
];

const HOURLY_FLUX = [
  { time: "00:00", val: 400 }, { time: "04:00", val: 200 },
  { time: "08:00", val: 800 }, { time: "12:00", val: 1200 },
  { time: "16:00", val: 1500 }, { time: "20:00", val: 900 },
];

export default function NeuralFlux() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      
      {/* --- Module Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Neural <span className="text-red-600">Flux</span>
          </h1>
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.4em] flex items-center gap-2">
            <Activity size={12} className="text-red-500" /> Global Intelligence Distribution Log
          </p>
        </div>
        <Button 
          onClick={handleManualSync}
          variant="outline" 
          className="border-white/5 bg-neutral-950 text-neutral-400 hover:text-white rounded-xl text-[10px] font-black uppercase italic tracking-widest px-8"
        >
           <RefreshCcw size={14} className={cn("mr-2", isSyncing && "animate-spin")} /> 
           {isSyncing ? "Syncing Nodes..." : "Manual Handshake"}
        </Button>
      </div>

      {/* --- High-Density Stats HUD --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricBox label="Inference Load" val="24.5k" sub="Generations" icon={Zap} color="text-red-500" />
         <MetricBox label="Temporal Savings" val="12.2k" sub="Hours Reclaimed" icon={Clock} color="text-emerald-500" />
         <MetricBox label="Model Efficacy" val="98.4%" sub="Success Rate" icon={Activity} color="text-blue-500" />
         <MetricBox label="Token Burn" val="840k" sub="Inference Units" icon={Database} color="text-orange-500" />
      </div>

      {/* --- Main Analytics Matrix --- */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Large Chart: Temporal Usage */}
        <Card className="lg:col-span-8 bg-neutral-950 border-white/5 rounded-[3rem] p-10 overflow-hidden relative shadow-2xl">
           <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                 <h3 className="text-sm font-black uppercase italic text-white tracking-widest">Temporal Usage Flux</h3>
                 <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Generation density over 24-hour cycle</p>
              </div>
              <Badge className="bg-red-600/10 text-red-500 border-none text-[8px] font-black italic px-3 py-1">LIVE DATA</Badge>
           </div>
           
           <div className="h-[300px] w-full">
              <SimpleChart 
                data={HOURLY_FLUX.map(d => ({ label: d.time, value: d.val }))} 
                color="#dc2626" 
              />
           </div>
        </Card>

        {/* Side Panel: Model Distribution */}
        <Card className="lg:col-span-4 bg-neutral-900/30 border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl">
           <h3 className="text-sm font-black uppercase italic tracking-widest mb-10 border-b border-white/5 pb-4">Logic Distribution</h3>
           <div className="space-y-8">
              {MODEL_USAGE.map((m, i) => (
                <div key={i} className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-neutral-400">{m.name}</span>
                      <span className="text-white">{m.usage}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${m.usage}%` }} 
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={cn("h-full shadow-[0_0_10px_rgba(220,38,38,0.2)]", m.color)} 
                      />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-bold text-neutral-500 leading-relaxed italic uppercase tracking-tighter">
                "Sankshipta" remains the dominant node. Suggest unlocking "Vyavastha" promotional cycle to increase premium conversions.
              </p>
           </div>
        </Card>

      </div>

      {/* --- Feature Saturation Grid --- */}
      <div className="grid md:grid-cols-3 gap-6">
         <FeatureStat label="Notes Generated" val="18.2k" progress={85} icon={FileText} />
         <FeatureStat label="Quizzes Created" val="4.1k" progress={45} icon={LayoutGrid} />
         <FeatureStat label="Flashcards Synced" val="2.2k" progress={30} icon={Layers} />
      </div>

    </div>
  );
}

// --- Visual Helpers ---

function MetricBox({ label, val, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-neutral-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-red-600/40 transition-all duration-500">
       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Icon size={80}/></div>
       <div className={cn("p-3 rounded-2xl bg-black border border-white/5 w-fit mb-6", color)}><Icon size={20}/></div>
       <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-1">{label}</p>
       <h4 className="text-4xl font-black italic tracking-tighter text-white leading-none mb-3">{val}</h4>
       <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">{sub}</span>
       </div>
    </div>
  );
}

function FeatureStat({ label, val, progress, icon: Icon }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-neutral-900/50 border border-white/5 flex items-center justify-between group hover:bg-neutral-950 transition-all duration-500">
       <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-red-600/10 text-red-500"><Icon size={16}/></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</span>
          </div>
          <p className="text-3xl font-black italic text-white leading-none">{val}</p>
       </div>
       <div className="relative h-16 w-16 flex items-center justify-center">
          <svg className="h-full w-full -rotate-90">
             <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
             <motion.circle 
               cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
               strokeDasharray={175.9} 
               initial={{ strokeDashoffset: 175.9 }}
               animate={{ strokeDashoffset: 175.9 - (175.9 * progress) / 100 }}
               className="text-red-600" 
             />
          </svg>
          <span className="absolute text-[8px] font-black text-white">{progress}%</span>
       </div>
    </div>
  );
}