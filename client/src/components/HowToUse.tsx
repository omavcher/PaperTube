"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Youtube, ArrowRight, CheckCircle2, Zap, BookOpen, FileText, Sparkles, Monitor, Laptop } from "lucide-react";
import Link from "next/link";

const YOUTUBE_VIDEO_ID = "lVtP0tkcjPM";

const STEPS = [
  {
    step: "01",
    icon: Youtube,
    title: "Paste YouTube URL",
    desc: "Copy any YouTube video link (lectures, tutorials, or crash courses) and paste it into Paperxify.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.1)]",
  },
  {
    step: "02",
    icon: Zap,
    title: "AI Analysis Engine",
    desc: "Our customized semantic models transcribe, parse, and synthesize key concepts in under 30 seconds.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  },
  {
    step: "03",
    icon: FileText,
    title: "Export Smart Assets",
    desc: "Download fully formatted PDF study guides, interactive flashcards, or markdown notes instantly.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  },
];

export default function HowToUse() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative w-full bg-black text-white overflow-hidden font-sans py-20 md:py-28">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.03)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="text-center mb-16 md:mb-24 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 select-none"
          >
            <BookOpen size={11} className="text-neutral-500" />
            Interactive Protocol
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white"
          >
            YouTube to Notes AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 via-neutral-100 to-neutral-400">In Three Steps.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light"
          >
            See exactly how our free AI YouTube note taker processes, translates, and designs structured study files directly from video links.
          </motion.p>
        </div>

        {/* ── Step Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 md:mb-24">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 md:p-8 rounded-2xl border ${s.border} bg-neutral-900/[0.15] backdrop-blur-md flex flex-col gap-5 group hover:bg-neutral-900/[0.25] hover:border-white/10 transition-all duration-300 transform-gpu ${s.glow}`}
            >
              {/* Step indicator */}
              <span className="absolute top-4 right-5 text-4xl font-black text-white/[0.03] select-none leading-none group-hover:text-white/[0.06] transition-colors">
                {s.step}
              </span>
              
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${s.border} ${s.bg} bg-black/35 group-hover:scale-105 transition-transform duration-300`}>
                <s.icon size={18} className={s.color} />
              </div>
              
              <div className="space-y-2">
                <p className="text-white font-bold text-base tracking-tight">{s.title}</p>
                <p className="text-neutral-500 text-xs md:text-sm leading-relaxed font-light group-hover:text-neutral-400 transition-colors">
                  {s.desc}
                </p>
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20">
                  <ArrowRight size={15} className="text-neutral-800" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Simulated Browser Mockup Video Embed ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Radial ambient glow below player */}
          <div className="absolute -inset-10 bg-red-600/5 blur-[80px] rounded-[3rem] pointer-events-none z-0" />
          
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] z-10">
            
            {/* Browser top chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-neutral-900/60 select-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              
              <div className="flex-1 mx-4 max-w-xs sm:max-w-md">
                <div className="flex items-center justify-center gap-1.5 bg-black/40 border border-white/5 rounded-md py-1 text-[9px] sm:text-[10px] text-neutral-500 font-mono truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>https://paperxify.com/how-it-works</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-neutral-600 shrink-0">
                <Laptop size={12} />
              </div>
            </div>

            {/* Video or Thumbnail view */}
            <div className="relative w-full aspect-video bg-black">
              {videoLoaded ? (
                <iframe
                  className="absolute inset-0 w-full h-full border-0"
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&color=white`}
                  title="Paperxify AI Note Taker Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                /* Click-to-play thumbnail with custom red filter/overlay */
                <button
                  onClick={() => setVideoLoaded(true)}
                  className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer bg-black overflow-hidden focus:outline-none"
                  aria-label="Play demo video"
                >
                  <img
                    src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
                    alt="Paperxify AI Demo Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-102 transition-all duration-500"
                  />

                  {/* Play Button Indicator */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.25)] group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <Play size={20} className="ml-1 fill-current stroke-[3]" />
                  </div>

                  {/* Top-Right Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md">
                    <Youtube size={12} className="text-red-500 animate-pulse" />
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Watch 1-Min Demo</span>
                  </div>
                </button>
              )}
            </div>

            {/* Bottom Bar Call To Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-neutral-900/30">
              <div className="flex items-center gap-3.5 text-left">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 hidden sm:block">
                  <Sparkles size={14} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">Start Converting YouTube Links</p>
                  <p className="text-neutral-500 text-[10px] font-light mt-0.5">Synthesize active recall flashcards, PDFs, and notes instantly.</p>
                </div>
              </div>
              <Link 
                href="/pricing"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap"
              >
                Get Started Free <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Trust Indicators ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-12 md:mt-16"
        >
          {[
            "Compatible with any YouTube lecture link",
            "Structured PDF output under 30 seconds",
            "Synthesizes Hindi & English notes",
            "No credit card required to try",
          ].map((text) => (
            <div key={text} className="flex items-center gap-1.5 text-neutral-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest select-none">
              <CheckCircle2 size={11} className="text-neutral-700" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
