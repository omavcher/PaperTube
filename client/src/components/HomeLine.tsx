"use client";
import React from "react";
import { Timeline } from "@/components/ui/timeline"; // Assuming this component exists or is adapted
import { motion } from "framer-motion";
import { 
  ScanSearch, 
  Terminal, 
  Cpu, 
  Download, 
  Zap, 
  Layers, 
  Search,
  ArrowRight,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Configuration ---
const timelineData = [
  {
    title: "Phase 01 — Target Acquisition",
    content: (
      <div className="space-y-6">
        <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed max-w-xl">
          Identify your intelligence source. Locate any YouTube lecture, technical deep-dive, or podcast.
          <span className="text-white block mt-2 font-medium">Action: Copy the source URL. Zero friction.</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900/50">
             {/* Gradient Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
             <img
              src="/pro/step/11.avif"
              alt="Target Acquisition"
              className="h-40 lg:h-52 w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
          </div>
          <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900/50">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
             <img
              src="/pro/step/12.avif"
              alt="Source Link"
              className="h-40 lg:h-52 w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Phase 02 — Data Injection",
    content: (
      <div className="space-y-6">
        <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed max-w-xl">
          Inject the signal into the core console. Paste the URL.
          <span className="text-white block mt-2 font-medium">The Neural Engine immediately initializes parsing of timestamps and visual metadata.</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/50">
            <img
              src="/pro/step/21.avif"
              className="h-40 lg:h-52 w-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
          </div>
          <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/50">
            <img
              src="/pro/step/22.avif"
              className="h-40 lg:h-52 w-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Phase 03 — Neural Synthesis",
    content: (
      <div className="space-y-6">
        <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed max-w-xl">
          Transformation sequence active. Your raw video data is synthesized into structured knowledge blocks.
          <span className="text-white block mt-2 font-medium">Definitions, formulas, and key insights mapped to exact timestamps.</span>
        </p>
        <div className="relative group max-w-2xl rounded-[2rem] overflow-hidden border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] bg-neutral-900/50">
             <div className="absolute top-4 right-4 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                Processing
             </div>
             <img
              src="/pro/step/3.avif"
              className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
        </div>
      </div>
    ),
  },
  {
    title: "Phase 04 — Artifact Extraction",
    content: (
      <div className="space-y-6">
        <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed max-w-xl">
          Export high-fidelity documentation. Generate a clean, vector-based PDF optimized for deep-focus study.
          <span className="text-white block mt-2 font-medium flex items-center gap-2">
            <Download size={14} className="text-green-500" /> Extraction Complete. File Ready.
          </span>
        </p>
        <div className="relative group w-full md:w-[60%] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900/50">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
             <img
              src="/pro/step/4.avif"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
        </div>
      </div>
    ),
  },
];

export default function HomeLine() {
  return (
    <section className="relative w-full overflow-hidden bg-black py-24 font-sans">
      
      {/* --- Background Atmosphere --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/20 via-black to-black opacity-80" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <div className="mb-24 text-center space-y-6">
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400"
           >
             <Layers size={12} className="text-white" /> 
             <span>System Architecture</span>
           </motion.div>

           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500"
           >
             Operational <span className="text-white">Flow.</span>
           </motion.h2>

           <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="text-lg text-neutral-400 font-light max-w-md mx-auto"
           >
             Four steps to transition from raw noise to high-density intelligence.
           </motion.p>
        </div>

        {/* --- Timeline Component --- */}
        <div className="relative">
          <Timeline data={timelineData} />
        </div>

        {/* --- Footer Status Overlay --- */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-20 pt-10 border-t border-white/5 flex justify-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity"
        >
             <StatusBadge label="Signal" value="Locked" icon={ScanSearch} />
             <StatusBadge label="Engine" value="Active" icon={Cpu} />
             <StatusBadge label="Security" value="Verified" icon={Database} />
        </motion.div>

      </div>
    </section>
  );
}

const StatusBadge = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
  <div className="flex flex-col items-center gap-1 group cursor-default">
     <div className="flex items-center gap-2 text-neutral-600 group-hover:text-white transition-colors">
        <Icon size={12} />
        <p className="text-[9px] font-bold uppercase tracking-[0.2em]">{label}</p>
     </div>
     <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">{value}</p>
  </div>
);