// app/models/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  IconFileText, 
  IconSparkles, 
  IconBrain,
  IconCoins,
} from "@tabler/icons-react";
import { ArrowLeft, Cpu, Terminal, Zap, CheckCircle2, ShieldCheck, Database } from "lucide-react";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const MODELS = [
  {
    id: "sankshipta",
    name: "Sankshipta",
    tier: "Free",
    description: "Clean, minimalist notes - perfect for quick summaries",
    longDescription: "Sankshipta creates distraction-free, academic-style notes with clear headings and bullet points. Ideal for students who want concise, well-structured summaries without visual clutter.",
    features: [
      "Clean, academic layout",
      "Dark slate headers with soft blue accents",
      "Boxed summary sections",
      "No images - pure text focus",
      "Perfect for quick review"
    ],
    icon: IconFileText,
    color: "blue",
    tokenCost: 5
  },
  {
    id: "bhashasetu",
    name: "Bhasha-Setu",
    tier: "Free",
    description: "Visual study guide with images and rich formatting",
    longDescription: "Bhasha-Setu creates magazine-quality study guides with contextual images, card-based layouts, and rich formatting. Perfect for visual learners who benefit from image associations.",
    features: [
      "Modern textbook layout with cards",
      "Contextual images from Google Search",
      "Royal blue and emerald green accents",
      "Timestamps with watch links",
      "Rich media integration"
    ],
    icon: IconSparkles,
    color: "purple",
    tokenCost: 5
  },
  {
    id: "parikshasarthi",
    name: "Pariksha-Sarthi",
    tier: "Premium",
    description: "Exam-focused Q&A format with flashcards",
    longDescription: "Pariksha-Sarthi transforms content into active-recall study materials with question-answer pairs, flashcards, and exam tips. Perfect for test preparation and self-assessment.",
    features: [
      "Question-Answer flashcard grid",
      "High-yield summary boxes",
      "Exam tips and common mistakes",
      "Electric purple and orange accents",
      "Critical concept callouts"
    ],
    icon: IconBrain,
    color: "yellow"
  },
  {
    id: "vyavastha",
    name: "Vyavastha",
    tier: "Premium",
    description: "Comprehensive academic structure with table of contents",
    longDescription: "Vyavastha creates comprehensive, textbook-style notes with table of contents, timelines, and detailed explanations. Perfect for in-depth learning and reference.",
    features: [
      "Table of contents with anchors",
      "Timeline/process flow diagrams",
      "Oxford blue and crimson red accents",
      "Data tables for comparisons",
      "Research paper style formatting"
    ],
    icon: IconBrain,
    color: "red"
  },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-500",
    hover: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    gradient: "from-blue-500/5 to-transparent",
    btn: "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-500",
    hover: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    gradient: "from-purple-500/5 to-transparent",
    btn: "bg-purple-500 text-white hover:bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
  },
  yellow: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-500",
    hover: "group-hover:border-yellow-500/50 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]",
    gradient: "from-yellow-500/5 to-transparent",
    btn: "bg-yellow-500 text-black hover:bg-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
  },
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-500",
    hover: "group-hover:border-red-500/50 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    gradient: "from-red-500/5 to-transparent",
    btn: "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
  },
};

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neutral-800 overflow-x-hidden">
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black opacity-80" />
      <div className="fixed inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-20 pb-24 md:pb-20">
        
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/50 border border-white/10 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors mb-6 md:mb-8"
          >
            <ArrowLeft size={14} /> Main Console
          </Link>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
               <Cpu size={12} className="text-white" />
               System Architecture
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none">
              Neural <br className="md:hidden" /> <span className="text-white">Models.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-light max-w-2xl leading-relaxed">
              Select the optimal cognitive engine for your workflow. Each architecture is specialized for distinct synthesis and formatting protocols.
            </p>
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          {MODELS.map((model, index) => {
            const theme = colorClasses[model.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "group relative rounded-[1.5rem] sm:rounded-[2rem] border overflow-hidden transition-all duration-500 flex flex-col bg-[#0a0a0a]",
                  theme.border,
                  theme.hover
                )}
              >
                {/* Subtle Top Gradient */}
                <div className={cn("absolute inset-0 bg-gradient-to-b opacity-40 pointer-events-none", theme.gradient)} />

                <div className="p-5 sm:p-6 md:p-8 relative z-10 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-5 md:mb-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={cn("p-2.5 md:p-3.5 rounded-xl border backdrop-blur-xl shadow-lg shrink-0", theme.bg, theme.border, theme.text)}>
                        <model.icon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-none mb-1.5 md:mb-2">{model.name}</h2>
                        <div className="flex items-center gap-2">
                          {model.tier === "Premium" ? (
                            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg">
                              Premium Node
                            </Badge>
                          ) : (
                            <Badge className="bg-white/10 text-white border-white/10 text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                              Free Access
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6 md:mb-8">
                    {model.longDescription}
                  </p>

                  {/* Features */}
                  <div className="mb-6 md:mb-8 flex-1">
                    <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3 md:mb-4 flex items-center gap-2">
                      <Terminal size={12} /> Technical Capabilities
                    </h3>
                    <ul className="space-y-2 md:space-y-3">
                      {model.features.map((feature, i) => (
                        <li key={i} className="text-[11px] sm:text-xs font-medium text-neutral-300 flex items-start gap-2.5">
                          <CheckCircle2 size={14} className={cn("shrink-0 mt-[2px]", theme.text)} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-auto pt-5 md:pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 md:gap-3">
                       <Link href="/" className="flex-1">
                         <button className={cn("w-full h-10 md:h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2", theme.btn)}>
                           <Zap size={14} fill="currentColor" /> Initialize
                         </button>
                       </Link>
                       {model.tokenCost && (
                         <div className="h-10 md:h-12 px-3 md:px-4 rounded-xl border border-white/10 bg-neutral-900/50 flex items-center justify-center gap-1.5 md:gap-2 shrink-0 cursor-help" title="Cost per generation">
                           <IconCoins size={14} className="text-yellow-500 md:w-4 md:h-4" />
                           <span className="text-[10px] md:text-xs font-mono font-bold text-white">-{model.tokenCost}</span>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Token Info Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 md:mt-16 p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-neutral-900/30 border border-white/5 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-yellow-500/10 blur-[60px] md:blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
            <div className="flex items-start md:items-center gap-4 md:gap-5">
              <div className="p-3 md:p-3.5 rounded-xl md:rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)] shrink-0">
                <Database className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-1.5 md:mb-2">Neural Cache Protocols</h3>
                <p className="text-xs md:text-sm text-neutral-400 leading-relaxed max-w-xl">
                  Free models consume <span className="text-yellow-500 font-mono">5 tokens</span> per generation. New personnel receive an initial payload of 3 tokens. Premium operators are granted <strong>unlimited access</strong> to all models.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2.5 md:gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
              <Link href="/pricing" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 md:px-6 h-10 md:h-12 bg-white text-black text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2">
                  <ShieldCheck size={14} className="md:w-4 md:h-4" /> View Pro Plans
                </button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 md:px-6 h-10 md:h-12 bg-neutral-900 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                  <IconCoins size={14} className="text-yellow-500 md:w-4 md:h-4" /> Refill Tokens
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}