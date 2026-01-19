"use client";

import React from "react";
import { 
  Cpu, Languages, FileDown, ShieldCheck, 
  Sparkles, Activity, Zap, Terminal, 
  ArrowUpRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    id: "FEAT-001",
    title: "Neural AI Models",
    description: "Access 5 specialized LLMs architected for distinct academic and technical note-taking styles.",
    icon: <Cpu className="h-6 w-6" />,
    tag: "Processing"
  },
  {
    id: "FEAT-002",
    title: "Global Lexicon",
    description: "Real-time cross-lingual synthesis supporting 7+ languages with high-fidelity semantic translation.",
    icon: <Languages className="h-6 w-6" />,
    tag: "Linguistic"
  },
  {
    id: "FEAT-003",
    title: "Vector PDF Export",
    description: "Generate beautifully formatted, print-optimized documents with integrated visual assets.",
    icon: <FileDown className="h-6 w-6" />,
    tag: "Output"
  },
  {
    id: "FEAT-004",
    title: "Hardened Security",
    description: "End-to-end encrypted processing pipelines ensuring your data remains isolated and secure.",
    icon: <ShieldCheck className="h-6 w-6" />,
    tag: "Protection"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 bg-[#000000] overflow-hidden">
      {/* --- Ambient Red Pulse Background --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-20 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/5 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Sparkles size={12} className="animate-pulse" /> System Capabilities
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            ADVANCED AI <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">PROTOCOLS</span>
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto text-base font-medium">
            Everything you need to transform raw video data into structured, high-fidelity knowledge nodes.
          </p>
        </div>

        {/* --- Features Matrix --- */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-neutral-950 border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-red-600/40 hover:shadow-[0_20px_50px_rgba(0,0,0,1)] overflow-hidden"
            >
              {/* Vertical Status Strip */}
              <div className="absolute left-0 top-0 w-1 h-full bg-neutral-900 group-hover:bg-red-600 transition-colors duration-500" />
              
              {/* Scanline Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,#dc2626_50%)] bg-[size:100%_4px]" />

              <div className="relative z-10 space-y-6">
                {/* Icon HUD */}
                <div className="flex justify-between items-start">
                  <div className="p-4 rounded-2xl bg-black border border-white/5 text-red-500 transition-all duration-500 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    {feature.icon}
                  </div>
                  <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">{feature.id}</span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Badge variant="outline" className="border-red-600/20 text-red-500/60 text-[8px] uppercase font-black px-2 py-0">
                    {feature.tag}
                  </Badge>
                  <h3 className="text-xl font-black text-white group-hover:text-red-500 transition-colors uppercase italic tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed font-medium group-hover:text-neutral-400 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Technical Footer */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-red-600" />
                    <span className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">Active</span>
                  </div>
                  <ArrowUpRight size={14} className="text-neutral-700 group-hover:text-red-500 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Global Performance HUD (Authority Bias) --- */}
        <div className="mt-20 p-8 rounded-[3rem] bg-neutral-900/20 border border-white/5 flex flex-wrap justify-around items-center gap-8 backdrop-blur-sm">
           <StatusItem label="Avg Sync Speed" value="0.8s" />
           <div className="hidden md:block w-px h-10 bg-white/5" />
           <StatusItem label="Neural Accuracy" value="99.4%" />
           <div className="hidden md:block w-px h-10 bg-white/5" />
           <StatusItem label="Encrypted Nodes" value="1.2M+" />
           <div className="hidden md:block w-px h-10 bg-white/5" />
           <StatusItem label="Global Uptime" value="99.9%" />
        </div>
      </div>
    </section>
  );
}

function StatusItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center space-y-1">
      <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">{label}</p>
      <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{value}</p>
    </div>
  );
}