"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Youtube, ArrowRight, CheckCircle2, Zap, BookOpen, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────
// 🎬  CHANGE THIS to update the YouTube video anywhere on the site
const YOUTUBE_VIDEO_ID = "V8lBIDdHdcs";
// ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: "01",
    icon: Youtube,
    title: "Paste a YouTube Link",
    desc: "Copy any YouTube lecture, tutorial, or documentary URL and paste it into PaperXify.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    step: "02",
    icon: Zap,
    title: "AI Processes It",
    desc: "Our models transcribe, summarize, and extract key insights — in seconds.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    step: "03",
    icon: FileText,
    title: "Get a Smart PDF",
    desc: "Download a structured, titled, chapter-split PDF ready for study or reference.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

export default function HowToUse() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative w-full bg-black text-white overflow-hidden font-sans py-24 px-4">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 z-0 opacity-10 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-16 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400"
          >
            <BookOpen size={11} className="text-neutral-500" />
            How It Works
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none"
          >
            YouTube to PDF<br />
            <span className="text-white">in 3 steps.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-neutral-400 text-base max-w-lg mx-auto leading-relaxed"
          >
            Watch the demo below — see exactly how PaperXify converts any YouTube video into a clean, exam-ready PDF.
          </motion.p>
        </div>

        {/* ── Steps Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 rounded-2xl border ${s.border} ${s.bg} backdrop-blur-xl flex flex-col gap-4`}
            >
              {/* Step number watermark */}
              <span className="absolute top-4 right-5 text-5xl font-black text-white/[0.04] select-none leading-none">
                {s.step}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.border} bg-black/30`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-1">{s.title}</p>
                <p className="text-neutral-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                  <ArrowRight size={14} className="text-neutral-700" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── YouTube Embed ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Glow ring */}
          <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
          <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-br from-neutral-800/40 to-transparent blur-sm pointer-events-none" />

          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_0_80px_rgba(255,255,255,0.04)]">

            {/* ── Fake browser chrome top bar ── */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-neutral-900/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-3 py-1 max-w-xs mx-auto">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
                  <span className="text-[10px] text-neutral-500 font-mono truncate">paperxify.com — Watch Demo</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <div className="w-8 h-1.5 bg-white/10 rounded-full" />
              </div>
            </div>

            {/* ── Video or thumbnail ── */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {videoLoaded ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&color=white`}
                  title="PaperXify — How to Use"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                /* Click-to-play thumbnail */
                <button
                  onClick={() => setVideoLoaded(true)}
                  className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer bg-black"
                  aria-label="Play demo video"
                >
                  {/* YouTube thumbnail (maxresdefault) */}
                  <img
                    src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300"
                  />

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/20" />

                  {/* Play button */}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                      <Play size={32} className="text-white ml-1.5" fill="white" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-sm">Watch the Full Demo</p>
                      <p className="text-neutral-400 text-xs mt-0.5">See how PaperXify works in 2 minutes</p>
                    </div>
                  </div>

                  {/* YouTube badge */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                    <Youtube size={12} className="text-red-500" />
                    <span className="text-[10px] text-neutral-400 font-medium">YouTube</span>
                  </div>
                </button>
              )}
            </div>

            {/* ── Bottom bar — CTA ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-neutral-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <Sparkles size={14} className="text-neutral-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">Liked what you saw?</p>
                  <p className="text-neutral-500 text-[10px]">Start converting for free — no credit card needed.</p>
                </div>
              </div>
              <Link href="/pricing">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-neutral-200 transition-all active:scale-95 whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  Get Started <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Trust chips below video ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          {[
            "Works with any YouTube video",
            "PDF ready in < 30 seconds",
            "Supports Hindi & English",
            "No sign-up to watch",
          ].map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle2 size={11} className="text-neutral-700" />
              {t}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
