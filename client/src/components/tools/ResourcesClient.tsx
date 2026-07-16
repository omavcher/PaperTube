"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Terminal, FileText, ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import ResourceDownloadCard from "@/components/ResourceDownloadCard";

export default function ResourcesClient() {
  const resourcesList = [
    {
      title: "Ultimate Study Hacks Bundle",
      description: "Unlock high-density study hacks, scheduling layouts, and active recall templates compiled from cognitive science. Supercharge your memory and revision routines.",
      fileType: "PDF" as const,
      fileSize: "4.2 MB",
      downloadUrl: "#",
      themeColor: "red" as const,
    },
    {
      title: "Exam Preparation Checklist",
      description: "Optimize tracking of exam topics, syllabus progress, grade conversions, and weekly countdown lists on a robust Excel sheet template designed for students.",
      fileType: "Excel" as const,
      fileSize: "1.8 MB",
      downloadUrl: "#",
      themeColor: "green" as const,
    },
    {
      title: "AI Tools for Students 2026",
      description: "A comprehensive directory highlighting how students can utilize modern models to automate notes, flashcards, concept maps, and research summaries ethically.",
      fileType: "Guide" as const,
      fileSize: "2.5 MB",
      downloadUrl: "#",
      themeColor: "purple" as const,
    },
    {
      title: "Notion Study Planner Template",
      description: "Configure a high-efficiency virtual study room and dashboard vault with this pre-structured workspace that syncs seamlessly with study notes.",
      fileType: "Template" as const,
      fileSize: "1.1 MB",
      downloadUrl: "#",
      themeColor: "cyan" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900/50 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-20 md:py-28 max-w-6xl">
        {/* Navigation Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={14} /> Back to Hub
        </Link>

        {/* Hero Header */}
        <div className="space-y-6 max-w-3xl mb-16 text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-neutral-400"
          >
            <Sparkles size={11} className="text-red-500" />
            <span>Academic Resource Vault</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white uppercase"
          >
            Free Study Resources <br />
            & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.25)]">Revision Templates</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm md:text-base text-neutral-400 font-light leading-relaxed max-w-2xl"
          >
            Take your learning further. Download our scientifically backed guides, planner checklists, and templates to optimize study routines. Completely free and un-gated.
          </motion.p>
        </div>

        {/* Showcase Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
          {resourcesList.map((res, idx) => (
            <ResourceDownloadCard
              key={idx}
              title={res.title}
              description={res.description}
              fileType={res.fileType}
              fileSize={res.fileSize}
              downloadUrl={res.downloadUrl}
              themeColor={res.themeColor}
            />
          ))}
        </div>

        {/* Integration Call to Action Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-neutral-900/20 border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-950/15 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-left">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                Want to Automate Your Revision?
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm font-light leading-relaxed">
                Unlock active recall summaries and quizzes directly from video lectures using Paperxify's core engine tools. Convert YouTube videos into study notes in minutes.
              </p>
            </div>
            <Link
              href="/youtube-to-notes"
              className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/20 whitespace-nowrap self-stretch md:self-auto justify-center"
            >
              <span>Try YouTube to Notes AI</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
