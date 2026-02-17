"use client";

import React from "react";
import { 
  ArrowRight, Cpu, FileSearch, 
  PercentCircle, BinaryIcon, InspectionPanel, 
  Terminal, Sparkles, Command
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const previewTools = [
  { id: "cgpa-calculator", title: "CGPA Calc", icon: <PercentCircle size={20} />, color: "text-emerald-400", tag: "Academic" },
  { id: "json-formatter", title: "JSON Lab", icon: <BinaryIcon size={20} />, color: "text-blue-400", tag: "DevOps" },
  { id: "resume-ats-checker", title: "ATS Scan", icon: <FileSearch size={20} />, color: "text-pink-400", tag: "Career" },
  { id: "matrix-calculator", title: "Matrix 5x5", icon: <InspectionPanel size={20} />, color: "text-orange-400", tag: "Math" },
];

export default function ToolsGlimpse() {
  return (
    <section className="py-16 md:py-24 bg-[#000000] relative overflow-hidden border-t border-white/5">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-red-600/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 md:mb-12 gap-6 md:gap-8">
          <div className="space-y-4 text-left max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/5 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Terminal size={12} /> Utility Inventory
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
              ENGINEERING <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">TOOLKIT</span>
            </h2>
            <p className="text-neutral-500 font-medium text-sm md:text-lg leading-relaxed">
              A glimpse into our high-precision logic engines. Access 15+ specialized modules designed for the modern engineer.
            </p>
          </div>

          <Link href="/tools" className="hidden md:block">
            <Button className="group bg-white text-black hover:bg-red-600 hover:text-white rounded-xl px-8 h-14 font-black uppercase italic transition-all shadow-xl active:scale-95">
              Open Main Console <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* --- The Glimpse Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {previewTools.map((tool, index) => (
            <Link key={tool.id} href={`/tools/${tool.id}`} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group h-full relative bg-neutral-900/30 border border-white/5 rounded-[2rem] p-6 transition-all duration-500 hover:border-red-600/40 overflow-hidden hover:bg-neutral-900/50"
              >
                {/* Internal Accent (Large Icon Watermark) */}
                <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12 scale-150">
                   {React.cloneElement(tool.icon as React.ReactElement<{ size?: number }>, { size: 120 })}
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-3.5 rounded-2xl bg-black border border-white/5 transition-all duration-500 group-hover:bg-red-600 group-hover:text-white shadow-lg", 
                      tool.color
                    )}>
                      {tool.icon}
                    </div>
                    <Badge variant="outline" className="text-[9px] border-white/5 bg-white/5 text-neutral-500 group-hover:text-red-200 group-hover:bg-red-600/20 uppercase font-black tracking-widest px-2 py-1">
                      {tool.tag}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-red-500 transition-colors">
                      {tool.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                      <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest group-hover:text-neutral-500 transition-colors">Operational</span>
                    </div>
                  </div>
                </div>

                {/* Decorative Scanline */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[size:100%_4px]" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-6 md:hidden">
            <Link href="/tools" className="block w-full">
                <Button className="w-full h-12 bg-white text-black hover:bg-neutral-200 rounded-xl font-black uppercase italic">
                   Open Console
                </Button>
            </Link>
        </div>

        {/* Bottom Psychological Anchor */}
        <div className="mt-12 md:mt-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[9px] font-black text-neutral-800 uppercase tracking-[0.2em] md:tracking-[0.4em]">
          <span className="flex items-center gap-2 text-neutral-700/60"><Cpu size={12} /> 15+ Modules</span>
          <span className="flex items-center gap-2 text-neutral-700/60"><Command size={12} /> 100% Web</span>
          <span className="flex items-center gap-2 text-neutral-700/60"><Sparkles size={12} /> 0ms Latency</span>
        </div>
      </div>
    </section>
  );
}