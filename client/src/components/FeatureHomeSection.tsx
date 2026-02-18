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
    icon: <Cpu className="h-6 w-6" />,
    tag: "Processing",
    accent: "blue"
  },
  {
    id: "FEAT-002",
    title: "Global Lexicon",
    description: "Real-time cross-lingual synthesis supporting 7+ languages with high-fidelity semantic translation.",
    icon: <Languages className="h-6 w-6" />,
    tag: "Linguistic",
    accent: "purple"
  },
  {
    id: "FEAT-003",
    title: "Vector PDF Export",
    description: "Generate beautifully formatted, print-optimized documents with integrated visual assets.",
    icon: <FileDown className="h-6 w-6" />,
    tag: "Output",
    accent: "green"
  },
  {
    id: "FEAT-004",
    title: "Hardened Security",
    description: "End-to-end encrypted processing pipelines ensuring your data remains isolated and secure.",
    icon: <ShieldCheck className="h-6 w-6" />,
    tag: "Protection",
    accent: "yellow"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 bg-black overflow-hidden font-sans">
      
      {/* --- Background Atmosphere --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/30 via-black to-black opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-20 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400"
          >
            <Sparkles size={12} className="text-white" /> 
            <span>System Capabilities</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500"
          >
            Advanced AI <span className="text-white">Protocols.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-400 font-light max-w-xl mx-auto leading-relaxed"
          >
            Everything you need to transform raw video data into structured, high-fidelity knowledge nodes.
          </motion.p>
        </div>

        {/* --- Features Grid --- */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 transition-all duration-300 hover:bg-neutral-900/60 hover:border-white/10 hover:shadow-2xl overflow-hidden"
            >
              
              {/* Scanline Effect (Subtle) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,#ffffff_50%)] bg-[size:100%_4px]" />

              <div className="relative z-10 space-y-8 flex flex-col h-full">
                
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "p-3.5 rounded-2xl bg-black border border-white/10 text-neutral-400 transition-all duration-300 group-hover:text-white group-hover:scale-110 shadow-lg",
                  )}>
                    {feature.icon}
                  </div>
                  <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                      {feature.id}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3 flex-1">
                  <Badge variant="outline" className="border-white/5 bg-white/5 text-neutral-500 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                    {feature.tag}
                  </Badge>
                  
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-neutral-500 font-medium leading-relaxed group-hover:text-neutral-400 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Footer Status */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-widest">Active</span>
                  </div>
                  <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Global Performance HUD --- */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-20 p-8 rounded-[3rem] bg-neutral-900/20 border border-white/5 flex flex-wrap justify-around items-center gap-12 backdrop-blur-sm"
        >
           <StatusItem label="Avg Sync Speed" value="0.8s" icon={Zap} />
           <div className="hidden md:block w-px h-10 bg-white/5" />
           <StatusItem label="Neural Accuracy" value="99.4%" icon={Activity} />
           <div className="hidden md:block w-px h-10 bg-white/5" />
           <StatusItem label="Encrypted Nodes" value="1.2M+" icon={Database} />
           <div className="hidden md:block w-px h-10 bg-white/5" />
           <StatusItem label="Global Uptime" value="99.9%" icon={Network} />
        </motion.div>

      </div>
    </section>
  );
}

function StatusItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div className="flex items-center gap-2 text-neutral-600 group-hover:text-neutral-400 transition-colors">
          <Icon size={12} />
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="text-3xl font-bold text-white tracking-tighter">{value}</p>
    </div>
  );
}