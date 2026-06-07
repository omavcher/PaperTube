"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, X, Star, ArrowRight, Brain, Clock, Cpu, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function FlashcardShowcase() {
  const comparisonData = [
    {
      feature: "Instant AI Q&A Extraction",
      paperxify: "Yes (Under 10 Seconds)",
      standard: "Slow Parser (60s+)",
      anki: "No (Manual Copy-Paste)",
      isKey: true
    },
    {
      feature: "Spaced Repetition Scheduler",
      paperxify: "Yes (Automated Cycles)",
      standard: "Static Lists Only",
      anki: "Yes (Manual Config)",
      isKey: false
    },
    {
      feature: "Interactive Flipping UI",
      paperxify: "Yes (Premium Glassmorphic)",
      standard: "Basic Text Q&A",
      anki: "Simple Desktop App Layout",
      isKey: false
    },
    {
      feature: "Direct Notion & PDF Sync",
      paperxify: "Yes (One-Click Sync)",
      standard: "None",
      anki: "None",
      isKey: true
    }
  ];

  return (
    <section className="relative w-full bg-black text-white overflow-hidden font-sans py-20 md:py-28">
      {/* Red/Rose glowing ambient light */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.04)_0%,transparent_75%)] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.03)_0%,transparent_70%)] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* --- Top Segment: Two-Column Split (Info & Testimonial) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24 md:mb-32">
          
          {/* Info Side (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest"
            >
              <Sparkles size={11} className="text-red-500 animate-pulse" />
              <span>Spaced Repetition Card Deck Builder</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white uppercase"
            >
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.2)]">YouTube Flashcards</span> Generator
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-neutral-400 text-sm md:text-base font-light leading-relaxed max-w-2xl"
            >
              Manually writing flashcards is a chore. Let AI synthesize active recall question and answer card decks for you in seconds. Perfect for technical subjects, medical terms, code syntax, or language vocabulary. Study with our built-in spaced repetition scheduler or export directly to Notion.
            </motion.p>

            {/* Subfeatures grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3.5 group">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mt-0.5 group-hover:scale-105 transition-transform">
                  <Brain size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Custom Decks</h4>
                  <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                    Generate customized deck sizes and edit any question-answer pair.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 group">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mt-0.5 group-hover:scale-105 transition-transform">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Spaced Repetition</h4>
                  <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                    Built-in study flows ensure you review cards at optimal intervals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Side (5 columns) */}
          <div className="lg:col-span-5 relative">
            {/* Soft pink glow behind testimonial */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent blur-[50px] rounded-3xl opacity-20 pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/[0.15] backdrop-blur-md shadow-2xl space-y-6 relative overflow-hidden group/testi"
            >
              {/* Top light reflections */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-red-500 text-red-500 group-hover/testi:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                  ))}
                </div>
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest select-none">
                  Highly Rated
                </span>
              </div>

              <blockquote className="text-sm sm:text-base text-neutral-300 italic font-light leading-relaxed">
                "Converting long programming tutorials into flashcard decks saved me so much preparation time. I can test myself on syntax and concepts directly on the platform."
              </blockquote>

              <div className="flex items-center gap-3.5 pt-2 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-red-400 text-xs select-none">
                  US
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sophia Martinez</div>
                  <div className="text-[10px] text-neutral-500 font-medium">Computer Science Student, Austin, US</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- Bottom Segment: Capabilities Comparison --- */}
        <div className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-neutral-400"
            >
              <FileSpreadsheet size={11} className="text-neutral-500" />
              Comparative Matrix
            </motion.div>
            
            <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Capabilities Comparison
            </h3>
            
            <p className="text-neutral-500 text-xs sm:text-sm font-light leading-relaxed">
              Why students and researchers globally choose Paperxify for generating active recall flashcards.
            </p>
          </div>

          {/* Premium Glassmorphic Table Container */}
          <div className="border border-white/10 rounded-[2rem] bg-neutral-900/[0.1] backdrop-blur-md overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 bg-neutral-950/40 select-none">
                    <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</th>
                    <th className="p-6 font-bold text-xs uppercase tracking-widest text-red-500 bg-red-500/[0.02] border-x border-white/5">
                      Paperxify Flashcards
                    </th>
                    <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Standard Generators</th>
                    <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Anki Entry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  {comparisonData.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-white/[0.01] transition-colors group/row"
                    >
                      <td className="p-6 font-bold text-neutral-200 group-hover/row:text-white transition-colors">
                        {row.feature}
                      </td>
                      
                      <td className="p-6 font-bold text-red-400 bg-red-500/[0.02] border-x border-white/5">
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-emerald-500 stroke-[3]" />
                          <span>{row.paperxify}</span>
                        </div>
                      </td>
                      
                      <td className="p-6 text-neutral-400">
                        {row.standard.includes("None") ? (
                          <div className="flex items-center gap-2 text-neutral-600">
                            <X size={15} /> <span>{row.standard}</span>
                          </div>
                        ) : (
                          <span>{row.standard}</span>
                        )}
                      </td>
                      
                      <td className="p-6 text-neutral-400">
                        {row.anki.includes("No") || row.anki.includes("None") ? (
                          <div className="flex items-center gap-2 text-neutral-600">
                            <X size={15} /> <span>{row.anki}</span>
                          </div>
                        ) : (
                          <span>{row.anki}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action button beneath comparison */}
          <div className="text-center pt-6">
            <Link 
              href="/youtube-to-flashcards"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_4px_20px_rgba(220,38,38,0.25)]"
            >
              Convert YouTube to Flashcards <ArrowRight size={13} />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
