"use client";

import React from "react";
import { 
  Cpu, 
  Languages, 
  FileDown, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Zap, 
  Terminal, 
  ArrowUpRight,
  Database,
  Network
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// --- Configuration ---
const features = [
  {
    id: "FEAT-001",
    title: "Neural AI Models",
    description: "Access 5 specialized LLMs architected for distinct academic and technical note-taking styles.",
    icon: <Cpu className="h-4 w-4 md:h-6 md:w-6" />,
    tag: "Processing",
    accent: "blue"
  },
  {
    id: "FEAT-002",
    title: "Global Lexicon",
    description: "Real-time cross-lingual synthesis supporting 7+ languages with high-fidelity semantic translation.",
    icon: <Languages className="h-4 w-4 md:h-6 md:w-6" />,
    tag: "Linguistic",
    accent: "purple"
  },
  {
    id: "FEAT-003",
    title: "Vector PDF Export",
    description: "Generate beautifully formatted, print-optimized documents with integrated visual assets.",
    icon: <FileDown className="h-4 w-4 md:h-6 md:w-6" />,
    tag: "Output",
    accent: "green"
  },
  {
    id: "FEAT-004",
    title: "Hardened Security",
    description: "End-to-end encrypted processing pipelines ensuring your data remains isolated and secure.",
    icon: <ShieldCheck className="h-4 w-4 md:h-6 md:w-6" />,
    tag: "Protection",
    accent: "yellow"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative bg-black overflow-hidden font-sans">
      
      {/* --- Background Atmosphere --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[800px] h-[300px] md:h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/30 via-black to-black opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-12 md:mb-20 space-y-4 md:space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" /> 
            <span>System Capabilities</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none"
          >
            Advanced AI <br className="md:hidden" /> <span className="text-white">Protocols.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-lg text-neutral-400 font-medium md:font-light max-w-xl mx-auto leading-relaxed px-4 md:px-0"
          >
            Everything you need to transform raw video data into structured, high-fidelity knowledge nodes.
          </motion.p>
        </div>

        {/* --- Features Grid --- */}
        {/* Enforced grid-cols-2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[1.25rem] md:rounded-[2.5rem] p-4 md:p-8 transition-all duration-300 hover:bg-neutral-900/60 hover:border-white/10 hover:shadow-2xl overflow-hidden"
            >
              
              {/* Scanline Effect (Subtle) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,#ffffff_50%)] bg-[size:100%_4px]" />

              <div className="relative z-10 flex flex-col h-full gap-6 md:gap-8">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                  <div className={cn(
                    "p-2.5 md:p-3.5 rounded-xl md:rounded-2xl bg-black border border-white/10 text-neutral-400 transition-all duration-300 group-hover:text-white group-hover:scale-110 shadow-lg shrink-0",
                  )}>
                    {feature.icon}
                  </div>
                  {/* Hidden on smallest screens to save space, visible from sm upwards */}
                  <span className="hidden sm:block text-[8px] md:text-[9px] font-mono font-bold text-neutral-600 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                      {feature.id}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2 md:space-y-3 flex-1">
                  <Badge variant="outline" className="border-white/5 bg-white/5 text-neutral-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1">
                    {feature.tag}
                  </Badge>
                  
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-[10px] sm:text-xs md:text-sm text-neutral-500 font-medium leading-relaxed group-hover:text-neutral-400 transition-colors line-clamp-3 md:line-clamp-none">
                    {feature.description}
                  </p>
                </div>

                {/* Footer Status */}
                <div className="pt-3 md:pt-6 border-t border-white/5 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[8px] md:text-[9px] font-bold uppercase text-neutral-400 tracking-widest">Active</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

       

      </div>
    </section>
  );
}

function StatusItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="flex flex-col items-center gap-1.5 md:gap-2 group cursor-default">
      <div className="flex items-center gap-1.5 md:gap-2 text-neutral-600 group-hover:text-neutral-400 transition-colors">
          <Icon className="w-3 h-3 md:w-4 md:h-4" />
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">{label}</p>
      </div>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tighter">{value}</p>
    </div>
  );
}