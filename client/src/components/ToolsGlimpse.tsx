"use client";

import React from "react";
import { 
  ArrowRight, Cpu, FileSearch, 
  PercentCircle, BinaryIcon, InspectionPanel, 
  Terminal, Sparkles, LayoutGrid, Command
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
    <section className=" bg-[#000000] relative overflow-hidden border-t border-white/5">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="space-y-4 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/5 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <Terminal size={12} /> Utility Inventory
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
              ENGINEERING <span className="text-red-600">TOOLKIT</span>
            </h2>
            <p className="text-neutral-500 max-w-lg font-medium">
              A glimpse into our high-precision logic engines. Access 15+ specialized modules designed for the modern engineer.
            </p>
          </div>

          <Link href="/tools">
            <Button className="group bg-white text-black hover:bg-red-600 hover:text-white rounded-2xl px-8 h-14 font-black uppercase italic transition-all shadow-xl active:scale-95">
              Open Main Console <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* --- The Glimpse Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {previewTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-neutral-900/30 border border-white/5 rounded-[2rem] p-6 transition-all duration-500 hover:border-red-600/40 overflow-hidden"
            >
              {/* Internal Accent */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
{React.cloneElement(tool.icon as React.ReactElement<{ size?: number }>, { 
  size: 100 
})}              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn("p-3 rounded-xl bg-black border border-white/5 transition-all duration-500 group-hover:bg-red-600 group-hover:text-white", tool.color)}>
                    {tool.icon}
                  </div>
                  <Badge variant="outline" className="text-[8px] border-white/5 text-neutral-600 group-hover:text-red-500/50 uppercase font-black tracking-widest">
                    {tool.tag}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-red-500 transition-colors">
                    {tool.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Operational</span>
                  </div>
                </div>
              </div>

              {/* Decorative Scanline */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[size:100%_4px]" />
            </motion.div>
          ))}
        </div>

        {/* Bottom Psychological Anchor */}
        <div className="mt-12 flex items-center justify-center gap-8 text-[9px] font-black text-neutral-800 uppercase tracking-[0.4em]">
          <span className="flex items-center gap-2"><Cpu size={12} /> 15+ Active Modules</span>
          <span className="hidden sm:flex items-center gap-2"><Command size={12} /> 100% Browser Based</span>
          <span className="flex items-center gap-2"><Sparkles size={12} /> Zero Latency</span>
        </div>
      </div>
    </section>
  );
}