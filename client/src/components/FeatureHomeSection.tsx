"use client";

import React from "react";
import { 
  Cpu, 
  Languages, 
  FileDown, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight,
  Database,
  Network,
  Zap,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    id: "SYS-001",
    title: "YouTube Summarizer AI",
    description: "Access specialized academic LLMs fine-tuned to extract core syllabus concepts and math logic from video timelines.",
    icon: <Cpu className="h-5 w-5 md:h-6 md:w-6" />,
    tag: "Synthesizer",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/30",
    iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    metric: "99.4% Synthesized Accuracy"
  },
  {
    id: "SYS-002",
    title: "Global Translation Suite",
    description: "Real-time cross-lingual synthesis supporting over 7 target languages with precise technical translation.",
    icon: <Languages className="h-5 w-5 md:h-6 md:w-6" />,
    tag: "Localization",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-500/30",
    iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    metric: "7+ Languages Operational"
  },
  {
    id: "SYS-003",
    title: "Vector PDF & Anki Exports",
    description: "Render print-optimized PDF study books complete with headings, timelines, tables, and direct Anki card formats.",
    icon: <FileDown className="h-5 w-5 md:h-6 md:w-6" />,
    tag: "Integrations",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/30",
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    metric: "Vector Layout Outputs"
  },
  {
    id: "SYS-004",
    title: "Isolated Processing Pipeline",
    description: "End-to-end encrypted transcript ingestion and isolated data spaces keeping your materials fully secure.",
    icon: <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />,
    tag: "Hardened Security",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/30",
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    metric: "AES-256 Data Masking"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative bg-black overflow-hidden font-sans py-20 md:py-28">
      {/* Background atmosphere glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.02)_0%,transparent_75%)] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-16 md:mb-24 space-y-5">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/10" /> 
            <span>Advanced Architecture</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white"
          >
            Platform Capabilities.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-sm md:text-base text-neutral-400 font-light max-w-xl mx-auto leading-relaxed"
          >
            Everything you need to transform raw video data into structured, high-fidelity study notes, slides, and smart memory cards.
          </motion.p>
        </div>

        {/* --- Features Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={cn(
                "group relative bg-neutral-900/[0.15] border border-white/5 rounded-3xl p-6 md:p-8 transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between h-full transform-gpu",
                feature.glow
              )}
            >
              {/* Scanline background detail */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.015] pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,#ffffff_50%)] bg-[size:100%_4px] transition-opacity duration-300" />
              
              <div className="space-y-6 flex-1 flex flex-col">
                {/* Icon row */}
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-3 rounded-2xl border transition-all duration-300 shadow-md flex items-center justify-center shrink-0",
                    feature.iconColor
                  )}>
                    {feature.icon}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-neutral-600 uppercase tracking-widest select-none">
                    {feature.id}
                  </span>
                </div>

                {/* Info and Tags */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md select-none">
                        {feature.tag}
                      </span>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-tight group-hover:text-white transition-colors leading-tight">
                      {feature.title}
                    </h3>
                    
                    <p className="text-xs md:text-sm text-neutral-500 font-light leading-relaxed group-hover:text-neutral-400 transition-colors">
                      {feature.description}
                    </p>
                  </div>

                  {/* Micro metric display */}
                  <div className="pt-4 mt-auto">
                    <span className="text-[10px] font-semibold font-mono text-neutral-500 bg-black/40 border border-white/5 px-2.5 py-1 rounded-lg">
                      {feature.metric}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Action indicator footer */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-6 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
                  <span className="text-[9px] font-extrabold uppercase text-neutral-500 tracking-wider">Operational</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}