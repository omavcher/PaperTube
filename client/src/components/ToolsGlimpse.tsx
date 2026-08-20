"use client";

import React from "react";
import { 
  ArrowRight, 
  Calculator, 
  FileCode, 
  Grid3x3, 
  Terminal, 
  FileSignature
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const previewTools = [
  { 
    id: "cgpa-calculator", 
    title: "CGPA Calculator", 
    desc: "Cumulative grade point logic & semester analytics.",
    icon: Calculator, 
    tag: "Academic",
    href: "/tools/cgpa-calculator"
  },
  { 
    id: "json-formatter", 
    title: "JSON Lab", 
    desc: "Data structure parser, validator & tree viewer.",
    icon: FileCode, 
    tag: "DevOps",
    href: "/tools/json-formatter"
  },
  { 
    id: "matrix-calculator", 
    title: "Matrix 5x5 Engine", 
    desc: "Linear algebra, determinants & matrix arithmetic.",
    icon: Grid3x3, 
    tag: "Math",
    href: "/tools/matrix-calculator"
  },
  {
    id: "fake-internship-letter-generator",
    title: "Offer Letter Gen",
    desc: "Generate realistic internship & job offer letters.",
    icon: FileSignature,
    tag: "Career",
    href: "/tools/fake-internship-letter-generator"
  }
];

export default function ToolsGlimpse() {
  return (
    <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] font-medium uppercase tracking-wider text-neutral-400">
            <Terminal size={11} className="text-neutral-300" /> 
            <span>Utility Suite</span>
          </div>
          
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Engineering & Academic <span className="text-neutral-400">Toolkit.</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
            Access our suite of high-precision computational engines and academic utilities designed to optimize your workflow.
          </p>
        </div>

        <div className="hidden md:block shrink-0">
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs transition-all active:scale-98 cursor-pointer group"
          >
            <span>View All Tools</span>
            <ArrowRight size={12} className="text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 4 Bento Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {previewTools.map((tool, index) => (
          <Link key={tool.id} href={tool.href} className="block h-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="h-full rounded-2xl bg-[#09090c] border border-white/[0.07] hover:border-white/[0.16] p-4 sm:p-5 flex flex-col justify-between gap-5 transition-all duration-200 group"
            >
              {/* Top Row: Icon + Badge */}
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:bg-white/[0.08] transition-all">
                  <tool.icon size={17} />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[8.5px] font-medium text-neutral-400 uppercase tracking-wider">
                  {tool.tag}
                </span>
              </div>

              {/* Bottom Row: Title + Description + Status */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-red-400 transition-colors leading-tight">
                  {tool.title}
                </h3>
                <p className="text-[11px] text-neutral-400 font-normal leading-snug line-clamp-2">
                  {tool.desc}
                </p>
                
                <div className="pt-2 flex items-center gap-1.5 text-[9px] font-medium text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Ready</span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Mobile Button */}
      <div className="mt-4 md:hidden">
        <Link 
          href="/tools" 
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs transition-all"
        >
          <span>View All Tools</span>
          <ArrowRight size={12} />
        </Link>
      </div>

    </section>
  );
}