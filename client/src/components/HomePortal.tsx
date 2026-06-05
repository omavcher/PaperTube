"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Layout, 
  CheckSquare, 
  Layers, 
  ArrowRight, 
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePortal() {
  const router = useRouter();

  const tools = [
    {
      id: "youtube-notes",
      title: "YouTube to Notes AI",
      description: "Convert any YouTube lecture, crash course, or tutorial into clean structured notes, flashcard decks, and practice tests instantly.",
      icon: BrainCircuit,
      badge: "Popular & Active",
      badgeColor: "rgba(220, 38, 38, 0.15)",
      badgeTextColor: "#f87171",
      borderColor: "hover:border-red-500/30",
      glowColor: "rgba(220, 38, 38, 0.15)",
      cta: "Launch Tool",
      action: () => router.push("/youtube-to-notes"),
      disabled: false
    },
    {
      id: "ai-ppt",
      title: "AI Slide Deck & PPT Maker",
      description: "Transform topics, transcripts, or notes into beautifully structured slide decks and study presentation PPT files automatically.",
      icon: Layout,
      badge: "Coming Soon",
      badgeColor: "rgba(147, 51, 234, 0.15)",
      badgeTextColor: "#c084fc",
      borderColor: "hover:border-purple-500/25",
      glowColor: "rgba(147, 51, 234, 0.1)",
      cta: "Unlock in Pro",
      action: () => {},
      disabled: true
    },
    {
      id: "ai-quiz",
      title: "Smart Exam & Quiz Builder",
      description: "Generate customized practice tests, MSQ/NAT queries, and explanation keys from YouTube video links in seconds.",
      icon: CheckSquare,
      badge: "Popular & Active",
      badgeColor: "rgba(6, 182, 212, 0.15)",
      badgeTextColor: "#22d3ee",
      borderColor: "hover:border-cyan-500/25",
      glowColor: "rgba(6, 182, 212, 0.1)",
      cta: "Launch Tool",
      action: () => router.push("/youtube-to-quiz"),
      disabled: false
    },
    {
      id: "ai-flashcards",
      title: "Spaced Repetition Cards",
      description: "Convert YouTube video lectures and courses into interactive memory flashcard decks backed by automated daily review cycles.",
      icon: Layers,
      badge: "Popular & Active",
      badgeColor: "rgba(245, 158, 11, 0.15)",
      badgeTextColor: "#fbbf24",
      borderColor: "hover:border-amber-500/25",
      glowColor: "rgba(245, 158, 11, 0.1)",
      cta: "Launch Tool",
      action: () => router.push("/youtube-to-flashcards"),
      disabled: false
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-12 text-center relative z-10 selection:bg-red-900/50">
      
      {/* Hero Header */}
      <div className="space-y-6 max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400"
        >
          <Sparkles size={11} className="text-red-500" />
          <span>Paperxify AI Study Suite</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight text-white"
        >
          Power Up Your Study <br />
          Workflows with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.25)]">Next-Gen AI</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-neutral-400 font-light leading-relaxed"
        >
          A premium suite of integrated academic tools designed specifically for modern students and developers. Stop taking notes manually and let AI synthesize your study materials.
        </motion.p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {tools.map((tool, idx) => {
          const IconComponent = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
              onClick={() => !tool.disabled && tool.action()}
              className={cn(
                "group flex flex-col justify-between p-6 rounded-[2rem] border border-white/[0.06] bg-neutral-900/35 backdrop-blur-xl transition-all duration-300 relative overflow-hidden",
                tool.disabled ? "cursor-not-allowed" : "cursor-pointer hover:-translate-y-1 " + tool.borderColor
              )}
              style={{
                boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
              }}
            >
              {/* Radial glow background on hover */}
              {!tool.disabled && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                  style={{
                    background: `radial-gradient(circle at 10% 10%, ${tool.glowColor} 0%, transparent 60%)`
                  }}
                />
              )}

              <div className="space-y-4 relative z-10">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/[0.08]"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)"
                    }}
                  >
                    <IconComponent size={18} className={tool.disabled ? "text-neutral-500" : "text-red-500 group-hover:scale-110 transition-transform duration-300"} />
                  </div>
                  <span 
                    className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/[0.03]"
                    style={{
                      background: tool.badgeColor,
                      color: tool.badgeTextColor
                    }}
                  >
                    {tool.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-red-400 transition-colors duration-200">
                    {tool.title}
                  </h3>
                  <p className="text-neutral-400 text-xs mt-2 font-normal leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* CTA Footer Row */}
              <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center justify-between relative z-10">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-all",
                  tool.disabled ? "text-neutral-600" : "text-neutral-400 group-hover:text-white"
                )}>
                  {tool.cta}
                </span>
                {!tool.disabled && (
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
