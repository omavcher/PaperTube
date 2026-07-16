"use client";

import React from "react";
import Link from "next/link";
import YouTubeToNotesClient from "@/app/youtube-to-notes/YouTubeToNotesClient";
import { FAQAccordion } from "@/components/FAQAccordion";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { getLocalizedSeo, generateJsonLdForPage } from "@/lib/seo-helpers";

import {
  Check,
  Sparkles,
  Trophy,
  Star,
  ArrowRight,
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  Brain,
  Laptop
} from "lucide-react";
import Footer from "@/components/Footer";

interface YouTubeToNotesSeoPageProps {
  region: string;
}

export default function YouTubeToNotesSeoPage({ region }: YouTubeToNotesSeoPageProps) {
  const seoConfig = getLocalizedSeo("youtube-to-notes", region);
  const jsonLd = generateJsonLdForPage("youtube-to-notes", region);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-900/50 relative overflow-hidden">
      <SchemaMarkup schema={jsonLd} />

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-red-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-red-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {/* H1 SEO Target Title */}
        <h1 className="sr-only">{seoConfig.h1}</h1>

        {/* Dynamic Client Form Component */}
        <YouTubeToNotesClient />

        {/* ─── Above-Fold Value Prop Strip ─── */}
        {/* Answers "why Paperxify" without scrolling — surfaces key differentiators */}
        <div className="w-full border-t border-white/[0.04] bg-neutral-950/60 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2.5 text-center">
              <span className="text-red-500 text-lg font-black">⚡</span>
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">15-Second AI Notes</p>
                <p className="text-neutral-500 text-[10px]">Fastest YT to AI notes generator</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2.5 text-center">
              <span className="text-red-500 text-lg font-black">📄</span>
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">AI PDF Generator</p>
                <p className="text-neutral-500 text-[10px]">LaTeX-ready, print-quality exports</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2.5 text-center">
              <span className="text-red-500 text-lg font-black">🏆</span>
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">#1 AI Notes Maker</p>
                <p className="text-neutral-500 text-[10px]">500,000+ students trust Paperxify</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2.5 text-center">
              <span className="text-red-500 text-lg font-black">🧠</span>
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">Active Recall</p>
                <p className="text-neutral-500 text-[10px]">Auto flashcards &amp; practice tests</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-12 md:py-24 border-t border-white/[0.04] mt-8 md:mt-16 space-y-16 md:space-y-32">
          
          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Badge — surfaces AI Notes Maker keyword prominently above fold */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>AI Notes Maker &amp; PDF Generator</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                {seoConfig.h2} <span className="text-red-500 bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">{seoConfig.h2Accent}</span> {seoConfig.h2Rest}
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                {seoConfig.intro}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {seoConfig.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1 bg-red-500/15 border border-red-500/30 text-red-500 rounded-lg mt-0.5">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{feature.title}</h4>
                      <p className="text-neutral-500 text-xs mt-0.5">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof Section (Replacing faked testimonials) */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-red-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-red-400 text-red-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Global Trusted</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Exam Prep Optimizer</h3>
                      <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                        Used by students globally preparing for **SAT, AP, GCSE, A-Level, HSC, ATAR**, and university exams.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Academic Quality</h3>
                      <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                        Extracts formulas, structures code blocks, formats tables, and exports ready-to-study PDFs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Learning</h3>
                      <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                        Converts passive lecture watching into active recall revision sheets and custom flashcard decks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Capabilities Comparison */}
          <section className="space-y-6 md:space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2 md:space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Trophy size={12} />
                <span>Head-to-Head Comparison</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Paperxify vs AI Tools</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">See why Paperxify is the purpose-built AI note-taker — not a general chatbot workaround.</p>
            </div>

            <div className="border border-white/10 rounded-2xl md:rounded-3xl bg-neutral-950/60 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(220,38,38,0.05)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      {/* Feature column */}
                      <th className="text-left px-4 md:px-6 py-5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500 w-[30%]">
                        Feature
                      </th>
                      {/* Paperxify - highlighted column */}
                      <th className="px-3 md:px-4 py-5 bg-gradient-to-b from-red-950/30 to-red-950/10 border-x border-red-500/15 text-center w-[14%]">
                        <div className="flex flex-col items-center gap-1.5">
                          <img src="/paperxify.jpeg" alt="Paperxify logo" className="w-7 h-7 md:w-9 md:h-9 rounded-xl object-cover shadow-lg shadow-red-900/30" />
                          <span className="text-red-400 font-bold text-[9px] md:text-[10px] uppercase tracking-wider leading-tight text-center">Paperxify</span>
                        </div>
                      </th>
                      {/* ChatGPT */}
                      <th className="px-3 md:px-4 py-5 text-center w-[14%]">
                        <div className="flex flex-col items-center gap-1.5">
                          <img src="/chatgpt.png" alt="ChatGPT logo" className="w-7 h-7 md:w-8 md:h-8 rounded-xl object-contain bg-[#10a37f]/10 p-1" />
                          <span className="text-neutral-500 font-semibold text-[9px] md:text-[10px] uppercase tracking-wider">ChatGPT</span>
                        </div>
                      </th>
                      {/* Claude */}
                      <th className="px-3 md:px-4 py-5 text-center w-[14%]">
                        <div className="flex flex-col items-center gap-1.5">
                          <img src="/claude-color.png" alt="Claude AI logo" className="w-7 h-7 md:w-8 md:h-8 rounded-xl object-contain bg-[#d97706]/10 p-1" />
                          <span className="text-neutral-500 font-semibold text-[9px] md:text-[10px] uppercase tracking-wider">Claude</span>
                        </div>
                      </th>
                      {/* DeepSeek */}
                      <th className="px-3 md:px-4 py-5 text-center w-[14%]">
                        <div className="flex flex-col items-center gap-1.5">
                          <img src="/deepseek.png" alt="DeepSeek AI logo" className="w-7 h-7 md:w-8 md:h-8 rounded-xl object-contain bg-blue-900/20 p-1" />
                          <span className="text-neutral-500 font-semibold text-[9px] md:text-[10px] uppercase tracking-wider">DeepSeek</span>
                        </div>
                      </th>
                      {/* Gemini */}
                      <th className="px-3 md:px-4 py-5 text-center w-[14%]">
                        <div className="flex flex-col items-center gap-1.5">
                          <img src="/gemini.png" alt="Google Gemini logo" className="w-7 h-7 md:w-8 md:h-8 rounded-xl object-contain bg-indigo-900/20 p-1" />
                          <span className="text-neutral-500 font-semibold text-[9px] md:text-[10px] uppercase tracking-wider">Gemini</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      { feature: "YouTube Link → Instant Notes", paperxify: true, chatgpt: "Manual copy", claude: "Manual copy", deepseek: "Manual copy", gemini: "Partial" },
                      { feature: "Structured Academic Formatting", paperxify: true, chatgpt: "Basic", claude: "Basic", deepseek: "Basic", gemini: "Basic" },
                      { feature: "LaTeX & Code Block Detection", paperxify: true, chatgpt: "Partial", claude: "Partial", deepseek: "Partial", gemini: "Partial" },
                      { feature: "Flashcards & Active Recall", paperxify: true, chatgpt: false, claude: false, deepseek: false, gemini: false },
                      { feature: "Visual Mind Maps & Diagrams", paperxify: true, chatgpt: false, claude: false, deepseek: false, gemini: false },
                      { feature: "Notion & PDF Export", paperxify: true, chatgpt: false, claude: false, deepseek: false, gemini: false },
                      { feature: "Built for Students", paperxify: true, chatgpt: "General AI", claude: "General AI", deepseek: "General AI", gemini: "General AI" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="px-4 md:px-6 py-4 text-neutral-300 text-[11px] md:text-xs font-semibold tracking-wide">{row.feature}</td>
                        {/* Paperxify cell - always highlighted */}
                        <td className="px-3 md:px-4 py-4 bg-gradient-to-b from-red-950/20 to-red-950/10 border-x border-red-500/10 text-center">
                          {row.paperxify === true ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                                <Check size={10} className="text-green-400" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-green-400 text-[10px] font-semibold">{String(row.paperxify)}</span>
                          )}
                        </td>
                        {/* ChatGPT */}
                        <td className="px-3 md:px-4 py-4 text-center">
                          {row.chatgpt === false ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-800/50 border border-white/5 flex items-center justify-center">
                                <span className="text-neutral-600 text-[8px] font-bold">✕</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-[10px] font-medium">{String(row.chatgpt)}</span>
                          )}
                        </td>
                        {/* Claude */}
                        <td className="px-3 md:px-4 py-4 text-center">
                          {row.claude === false ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-800/50 border border-white/5 flex items-center justify-center">
                                <span className="text-neutral-600 text-[8px] font-bold">✕</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-[10px] font-medium">{String(row.claude)}</span>
                          )}
                        </td>
                        {/* DeepSeek */}
                        <td className="px-3 md:px-4 py-4 text-center">
                          {row.deepseek === false ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-800/50 border border-white/5 flex items-center justify-center">
                                <span className="text-neutral-600 text-[8px] font-bold">✕</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-[10px] font-medium">{String(row.deepseek)}</span>
                          )}
                        </td>
                        {/* Gemini */}
                        <td className="px-3 md:px-4 py-4 text-center">
                          {row.gemini === false ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-800/50 border border-white/5 flex items-center justify-center">
                                <span className="text-neutral-600 text-[8px] font-bold">✕</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-[10px] font-medium">{String(row.gemini)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Bottom note */}
              <div className="px-4 md:px-6 py-3 border-t border-white/[0.04] flex items-center gap-2">
                <Check size={11} className="text-green-500 shrink-0" />
                <span className="text-[10px] text-neutral-600">Paperxify is purpose-built for YouTube-to-notes — not a general-purpose chatbot.</span>
              </div>
            </div>
          </section>

          {/* Section 2b: What is an AI Notes Maker? — Keyword-rich explainer targeting all 5 missing terms */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Brain size={12} />
                <span>Understanding AI Notes Making</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                What is an <span className="text-red-500">AI Notes Maker</span>?
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
                An AI notes maker is a tool that automatically converts video content — like YouTube lectures — into structured, revision-ready study notes using artificial intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-white/5 rounded-2xl bg-neutral-950/40 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-red-500">①</span> YT to AI Notes — How It Works
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Paperxify's YT to AI notes pipeline works in 3 steps: (1) paste your YouTube URL, (2) the AI extracts and transcribes the full video transcript, (3) it synthesizes the transcript into structured AI notes with headers, bullet points, key definitions, and LaTeX formulas — all in under 15 seconds.
                </p>
              </div>

              <div className="p-6 border border-white/5 rounded-2xl bg-neutral-950/40 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-red-500">②</span> AI Notes Making vs Manual Note-Taking
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Traditional note-taking requires pausing, rewinding, and writing by hand — taking 3-4× longer than the video itself. AI notes making compresses a 2-hour lecture into structured, exam-ready notes in seconds, covering every key concept the AI detects in the transcript.
                </p>
              </div>

              <div className="p-6 border border-white/5 rounded-2xl bg-neutral-950/40 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-red-500">③</span> AI PDF Generator — Export & Print
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  After AI notes making, Paperxify's built-in AI PDF generator converts your notes into a print-ready document. Every AI PDF export includes properly rendered LaTeX math, code syntax highlighting, structured section headers, and page numbers — ready for printing or digital annotation.
                </p>
              </div>

              <div className="p-6 border border-white/5 rounded-2xl bg-neutral-950/40 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-red-500">④</span> YouTube AI Notes Generator for Every Subject
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Paperxify's YouTube AI notes generator works across all subjects: mathematics, computer science, history, biology, physics, law, economics, and more. The AI adapts its formatting — using code blocks for programming, LaTeX for formulas, and structured timelines for history.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Why Students Use Paperxify */}
          <section className="space-y-8 md:space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-2 md:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <Sparkles size={10} className="md:size-[12px]" />
                <span>Engineered for Academic Success</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
                Why Students Use Paperxify
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm font-light max-w-xl mx-auto leading-relaxed">
                Transform passive lecture watching into active learning. Discover why students worldwide trust Paperxify to save time and study smarter.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {/* Card 1: Save Hours */}
              <div className="p-4 md:p-8 border border-white/5 rounded-[1.25rem] md:rounded-[2rem] bg-neutral-950/40 hover:bg-neutral-900/20 hover:border-red-500/25 transition-all duration-300 group flex flex-col justify-between">
                <div className="space-y-2 md:space-y-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white uppercase tracking-wider">Save Hours</h3>
                  <p className="text-neutral-400 text-[10px] sm:text-xs md:text-sm font-light leading-relaxed">
                    Stop manually scrubbing through 2-hour lecture videos and hitting pause every 10 seconds. Paperxify instantly converts long YouTube tutorial links and course videos into concise summaries in under 15 seconds.
                  </p>
                </div>
              </div>

              {/* Card 2: Better Retention */}
              <div className="p-4 md:p-8 border border-white/5 rounded-[1.25rem] md:rounded-[2rem] bg-neutral-950/40 hover:bg-neutral-900/20 hover:border-red-500/25 transition-all duration-300 group flex flex-col justify-between">
                <div className="space-y-2 md:space-y-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white uppercase tracking-wider">Better Retention</h3>
                  <p className="text-neutral-400 text-[10px] sm:text-xs md:text-sm font-light leading-relaxed">
                    Our AI notes generator synthesizes knowledge. By using bullet points, bold vocabulary highlights, and structured subheadings, our notes align with cognitive load theory to help you understand complex concepts easily.
                  </p>
                </div>
              </div>

              {/* Card 3: Exam Preparation */}
              <div className="p-4 md:p-8 border border-white/5 rounded-[1.25rem] md:rounded-[2rem] bg-neutral-950/40 hover:bg-neutral-900/20 hover:border-red-500/25 transition-all duration-300 group flex flex-col justify-between">
                <div className="space-y-2 md:space-y-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white uppercase tracking-wider">Exam Prep</h3>
                  <p className="text-neutral-400 text-[10px] sm:text-xs md:text-sm font-light leading-relaxed">
                    Whether you are preparing for AP Exams, SAT, GCSE, A-Levels, IB, ATAR, or university midterms, Paperxify shapes summaries to match curriculum requirements across the US, UK, Canada, Australia, and Europe.
                  </p>
                </div>
              </div>

              {/* Card 4: Active Recall */}
              <div className="p-4 md:p-8 border border-white/5 rounded-[1.25rem] md:rounded-[2rem] bg-neutral-950/40 hover:bg-neutral-900/20 hover:border-red-500/25 transition-all duration-300 group flex flex-col justify-between">
                <div className="space-y-2 md:space-y-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white uppercase tracking-wider">Active Recall</h3>
                  <p className="text-neutral-400 text-[10px] sm:text-xs md:text-sm font-light leading-relaxed">
                    Reading notes passively is ineffective. Turn video links into active study workspaces with integrated flashcards, custom practice quiz formats, and editable canvas flowcharts to close knowledge gaps.
                  </p>
                </div>
              </div>

              {/* Card 5: Smart Sync */}
              <div className="p-4 md:p-8 border border-white/5 rounded-[1.25rem] md:rounded-[2rem] bg-neutral-950/40 hover:bg-neutral-900/20 hover:border-red-500/25 transition-all duration-300 group flex flex-col justify-between">
                <div className="space-y-2 md:space-y-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Laptop className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white uppercase tracking-wider">Notion Sync</h3>
                  <p className="text-neutral-400 text-[10px] sm:text-xs md:text-sm font-light leading-relaxed">
                    Organize your generated summaries inside a dedicated digital dashboard. Export your lecture notes directly into Notion with a single click, or download beautiful print-ready PDFs for physical binders.
                  </p>
                </div>
              </div>

              {/* Card 6: Visual Canvas */}
              <div className="p-4 md:p-8 border border-white/5 rounded-[1.25rem] md:rounded-[2rem] bg-neutral-950/40 hover:bg-neutral-900/20 hover:border-red-500/25 transition-all duration-300 group flex flex-col justify-between">
                <div className="space-y-2 md:space-y-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white uppercase tracking-wider">Visual Canvas</h3>
                  <p className="text-neutral-400 text-[10px] sm:text-xs md:text-sm font-light leading-relaxed">
                    Paperxify AI maps complex systems, timelines, processes, and concepts into interactive Mermaid-based flowcharts and visual mind maps. Connect the dots across video tutorials visually.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Rich Q&A / FAQ Section */}
          <FAQAccordion faqs={seoConfig.faqs} />

          {/* Section 5: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-red-950/5 pointer-events-none" />
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{seoConfig.ctaTitle}</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              {seoConfig.ctaDesc}
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                {seoConfig.ctaBtn} <ArrowRight size={14} />
              </Link>
            </div>
          </section>

        </div>
        <Footer />
      </main>
    </div>
  );
}
