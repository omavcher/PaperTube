"use client";
import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { motion } from "framer-motion";
import { Activity, Terminal, Cpu, Download, Zap, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomeLine() {
  const data = [
    {
      title: "Protocol 01 — Target Acquisition",
      content: (
        <div className="space-y-6">
          <p className="text-sm md:text-base text-neutral-500 font-medium leading-relaxed max-w-xl uppercase tracking-tight">
            Identify your intelligence source. Locate any YouTube lecture, technical deep-dive, or podcast. 
            <span className="text-red-500 block mt-2 font-black italic">Action: Copy the source URL. Zero friction, zero latency.</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
               <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
               <img
                src="/pro/step/11.avif"
                alt="Target Acquisition"
                className="h-44 lg:h-60 w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="relative group rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
               <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
               <img
                src="/pro/step/12.avif"
                alt="Source Link"
                className="h-44 lg:h-60 w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Protocol 02 — Data Injection",
      content: (
        <div className="space-y-6">
          <p className="text-sm md:text-base text-neutral-500 font-medium leading-relaxed max-w-xl uppercase tracking-tight">
            Inject the signal into the PaperTube core. Paste the URL into the command console. 
            <span className="text-red-500 block mt-2 font-black italic">The Neural Engine immediately initializes parsing of timestamps and visual metadata.</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group rounded-2xl overflow-hidden border border-white/10">
               <img
                src="/pro/step/21.avif"
                className="h-44 lg:h-60 w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="relative group rounded-2xl overflow-hidden border border-white/10">
               <img
                src="/pro/step/22.avif"
                className="h-44 lg:h-60 w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Protocol 03 — Neural Synthesis",
      content: (
        <div className="space-y-6">
          <p className="text-sm md:text-base text-neutral-500 font-medium leading-relaxed max-w-xl uppercase tracking-tight">
            Transformation sequence active. Your raw video data is synthesized into structured knowledge blocks. 
            <span className="text-red-500 block mt-2 font-black italic">Every definition, formula, and key insight is mapped to exact timestamps.</span>
          </p>
          <div className="relative group max-w-2xl rounded-[2rem] overflow-hidden border border-red-600/20 shadow-[0_0_50px_rgba(220,38,38,0.1)]">
             <div className="absolute top-4 right-4 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded z-20 animate-pulse">Live Synthesis</div>
             <img
              src="/pro/step/3.avif"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Protocol 04 — Artifact Extraction",
      content: (
        <div className="space-y-6">
          <p className="text-sm md:text-base text-neutral-500 font-medium leading-relaxed max-w-xl uppercase tracking-tight">
            Export high-fidelity documentation. Generate a stunning, tactile PDF optimized for deep-focus study.
            <span className="text-red-600 block mt-2 font-black italic uppercase tracking-widest flex items-center gap-2">
              <Download size={14} /> Extraction Complete. File Ready.
            </span>
          </p>
          <div className="relative group w-full md:w-[40%] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
             <img
              src="/pro/step/4.avif"
              className="w-full h-auto object-cover transform group-hover:translate-y-[-10px] transition-transform duration-1000"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#050505] py-24">
      {/* Background Matrix HUD */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-20 space-y-4">
           <div className="inline-flex items-center gap-2 rounded-full bg-red-600/10 border border-red-600/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
             <Layers size={12} /> System Architecture
           </div>
           <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
             OPERATIONAL <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">FLOW</span>
           </h2>
           <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm max-w-md">
             Four steps to transition from raw noise to high-density intelligence.
           </p>
        </div>

        <div className="ml-[-20px] md:ml-0">
          <Timeline data={data} />
        </div>

        {/* Tactical Footer Overlay */}
        <div className="mt-20 flex justify-center opacity-20">
           <div className="flex gap-10 grayscale">
              <StatusBadge label="Signal" value="Locked" />
              <StatusBadge label="Engine" value="Active" />
              <StatusBadge label="Security" value="Verified" />
           </div>
        </div>
      </div>
    </section>
  );
}

const StatusBadge = ({ label, value }: { label: string, value: string }) => (
  <div className="text-center">
     <p className="text-[8px] font-black uppercase tracking-widest text-neutral-600">{label}</p>
     <p className="text-xs font-black uppercase italic text-white">{value}</p>
  </div>
);