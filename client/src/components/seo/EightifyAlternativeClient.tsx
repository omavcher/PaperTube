"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Check, X, Zap, Sparkles, BookOpen, Brain, Download, 
  HelpCircle, ChevronDown, ArrowRight, ShieldCheck, FileText, 
  GraduationCap, Play, Lock, ExternalLink
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EightifyAlternativeClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Why is Paperxify the best free alternative to Eightify?",
      a: "Eightify gives you short, 8-bullet summaries and restricts video lengths unless you pay. Paperxify gives you full paragraph-level summaries, structured study notes, active recall flashcards, practice quizzes, and clean PDF exports — all from a single video."
    },
    {
      q: "Does Paperxify work on long YouTube videos?",
      a: "Yes! While Eightify struggles or cuts off on long content, Paperxify handles multi-hour lectures, crash courses, and long workshops across all plans."
    },
    {
      q: "Do I need a credit card to start using Paperxify?",
      a: "No credit card required! You get a free account to test out summaries, notes, flashcards, and quizzes on your videos."
    },
    {
      q: "Can I export my generated summaries to PDF or Notion?",
      a: "Yes! Paperxify allows 1-click vector PDF downloads with LaTeX formatting, as well as Notion-compatible markdown exports."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-900/50 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-red-950/15 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] right-10 w-[500px] h-[500px] bg-purple-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Navigation */}
      <div className="relative z-50">
        <Navbar hideMobile={false} />
      </div>

      <main className="relative z-10 w-full flex flex-col items-center pt-28 sm:pt-36 pb-20">
        
        {/* --- Hero Section --- */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} className="text-red-500 animate-pulse" />
            <span>Competitive Analysis</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            The Ultimate Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.4)]">Eightify</span> Alternative
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed max-w-3xl mx-auto">
            Eightify limits you with strict video duration caps and basic 8-bullet summaries. Discover why thousands of students and researchers switch to Paperxify for full paragraph summaries, textbook-quality notes, flashcards, practice quizzes, and PDF exports.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/youtube-video-summarizer" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl"
            >
              <span>Try Paperxify Free</span>
              <Zap size={14} className="fill-black" />
            </Link>
            <a 
              href="#comparison-matrix"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 border border-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-800 transition-all"
            >
              View Feature Matrix
            </a>
          </div>
        </section>

        {/* --- Trust Bar --- */}
        <div className="w-full border-y border-white/10 bg-neutral-950/80 backdrop-blur-md py-4 mb-20">
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-center text-xs sm:text-sm font-bold text-neutral-300">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" /> Trusted by 500,000+ students &amp; researchers
            </span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span>Up to 12-Hour Video Support</span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span>Notes + Flashcards + Quiz in 1 Pass</span>
          </div>
        </div>

        {/* --- Feature Comparison Matrix --- */}
        <section id="comparison-matrix" className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-24 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Feature Comparison: Paperxify vs Eightify
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-light">
              See why learners choose Paperxify over basic browser extension summarizers.
            </p>
          </div>

          <div className="border border-white/10 rounded-3xl bg-neutral-950/80 backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-neutral-900/50">
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Features</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-red-500 bg-red-950/20">Paperxify</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Eightify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Free Starter Plan</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1.5" /> Yes (Free Account)</td>
                    <td className="p-5 text-neutral-400">Strictly Capped (3-5 videos max)</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Max Video Duration</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10">Up to 12 Hours (Power)</td>
                    <td className="p-5 text-neutral-400">Limited on long videos</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Paragraph-Level Summary</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1.5" /> Full Structural Paragraphs</td>
                    <td className="p-5 text-neutral-400"><X size={16} className="text-red-500 inline mr-1.5" /> 8 Bullet Points Only</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Structured Study Notes</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1.5" /> Headers, Sub-points &amp; Vocab</td>
                    <td className="p-5 text-neutral-400"><X size={16} className="text-red-500 inline mr-1.5" /> Not Supported</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Active Recall Flashcards</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1.5" /> Auto-Generated Flashcard Deck</td>
                    <td className="p-5 text-neutral-400"><X size={16} className="text-red-500 inline mr-1.5" /> Not Supported</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Interactive Practice Quiz</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1.5" /> Built-In Assessment Engine</td>
                    <td className="p-5 text-neutral-400"><X size={16} className="text-red-500 inline mr-1.5" /> Not Supported</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">PDF &amp; LaTeX Export</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1.5" /> Vector PDF Downloads</td>
                    <td className="p-5 text-neutral-400"><X size={16} className="text-red-500 inline mr-1.5" /> Plain Text Copy-Paste Only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- Value Proposition Grid --- */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-950/50 backdrop-blur-sm space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl w-fit">
              <FileText size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Full Video Context</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
              Don't settle for 8 surface-level bullet points. Paperxify captures the full logical flow of long lectures, preserving exact formulas, sub-points, and technical terminology.
            </p>
          </div>

          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-950/50 backdrop-blur-sm space-y-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl w-fit">
              <Brain size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Active Recall Ecosystem</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
              Summaries are just the start. Paperxify generates flashcards and multiple-choice practice quizzes from the same video so you retain the material long-term.
            </p>
          </div>

          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-950/50 backdrop-blur-sm space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl w-fit">
              <Download size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Textbook-Quality PDF Exports</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
              Export your study guides into beautifully formatted PDFs with LaTeX math rendering, styled headers, and clean layouts ready for printing or offline study.
            </p>
          </div>

        </section>

        {/* --- FAQ Accordion --- */}
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-24 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle size={14} /> FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-white/10 rounded-2xl bg-neutral-950/60 backdrop-blur-md overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform ${openFaqIndex === idx ? "rotate-180 text-red-500" : "text-neutral-500"}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-400 font-light leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- Final CTA Band --- */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="p-10 sm:p-14 border border-white/15 rounded-[2.5rem] bg-gradient-to-b from-neutral-950 via-neutral-900/90 to-neutral-950 text-center space-y-6 relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
              Upgrade From Basic Bullet Points to Full Study Materials
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto font-light leading-relaxed">
              Try the best free Eightify alternative today. Generate comprehensive summaries, notes, flashcards, and quizzes from any YouTube link.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/youtube-video-summarizer" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-2xl"
              >
                <span>Start Summarizing Free</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
