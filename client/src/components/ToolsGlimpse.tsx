"use client";

import React from "react";
import { 
  ArrowRight, 
  Calculator, 
  FileCode, 
  ScanLine, 
  Grid3x3, 
  Terminal, 
  Cpu, 
  Zap, 
  Command,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Configuration ---
const previewTools = [
  { 
    id: "cgpa-calculator", 
    title: "CGPA Calc", 
    desc: "Cumulative Grade Logic",
    icon: Calculator, 
    tag: "Academic" 
  },
  { 
    id: "json-formatter", 
    title: "JSON Lab", 
    desc: "Data Structure Parser",
    icon: FileCode, 
    tag: "DevOps" 
  },
  { 
    id: "resume-ats-checker", 
    title: "ATS Scan", 
    desc: "Resume Optimization",
    icon: ScanLine, 
    tag: "Career" 
  },
  { 
    id: "matrix-calculator", 
    title: "Matrix 5x5", 
    desc: "Linear Algebra Engine",
    icon: Grid3x3, 
    tag: "Math" 
  },
];

export default function ToolsGlimpse() {
  return (
    <section className=" bg-black relative overflow-hidden border-t border-white/5">
      
      {/* --- Background Atmosphere --- */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-black to-black blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="space-y-6 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400"
            >
              <Terminal size={12} className="text-white" /> 
              <span>Utility Inventory</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none"
            >
              Engineering <br />
              <span className="text-white">Toolkit.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 font-light leading-relaxed max-w-lg"
            >
              Access our suite of high-precision logic engines. 
              <span className="text-white font-medium"> 15+ specialized modules</span> designed to optimize your academic and technical workflow.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <Link href="/tools">
              <Button className="group bg-white text-black hover:bg-neutral-200 rounded-2xl h-14 px-8 font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Open Console <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* --- The Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewTools.map((tool, index) => (
            <Link key={tool.id} href={`/tools/${tool.id}`} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group h-full relative bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 transition-all duration-300 hover:bg-neutral-900/60 hover:border-white/10 overflow-hidden"
              >
                {/* Giant Watermark Icon */}
                <div className="absolute -bottom-6 -right-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12 scale-150 pointer-events-none text-white">
                   <tool.icon size={140} strokeWidth={1} />
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                  
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div className="p-3.5 rounded-2xl bg-black border border-white/10 text-neutral-400 group-hover:text-white group-hover:border-white/20 transition-all shadow-lg">
                      <tool.icon size={20} />
                    </div>
                    <Badge variant="outline" className="border-white/5 bg-white/5 text-neutral-500 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                      {tool.tag}
                    </Badge>
                  </div>

                  {/* Bottom Row */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider group-hover:text-neutral-400 transition-colors">
                      {tool.desc}
                    </p>
                    
                    <div className="pt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-green-500">System Ready</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-8 md:hidden">
            <Link href="/tools" className="block w-full">
                <Button className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-2xl font-bold uppercase tracking-widest text-xs">
                   Open Console
                </Button>
            </Link>
        </div>

      </div>
    </section>
  );
}

// Helper for Footer Stats
const StatItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-3 text-neutral-500 group cursor-default hover:text-white transition-colors">
    <Icon size={14} className="text-neutral-600 group-hover:text-white transition-colors" />
    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
  </div>
);