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
  BookOpen
} from "lucide-react";
import Footer from "@/components/Footer";

interface YouTubeToNotesSubjectPageProps {
  slug: string;
}

function getSubjectColors(slug: string) {
  switch (slug) {
    case "biology":
    case "ap-biology":
      return {
        accentText: "text-emerald-400",
        accentBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        btn: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/10",
        glow: "bg-emerald-950/5",
        tableHeader: "text-emerald-500 bg-emerald-950/10",
        tableCell: "bg-emerald-950/10"
      };
    case "chemistry":
    case "atar-chemistry":
      return {
        accentText: "text-orange-400",
        accentBg: "bg-orange-500/10 border-orange-500/20 text-orange-400",
        btn: "bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/10",
        glow: "bg-orange-950/5",
        tableHeader: "text-orange-500 bg-orange-950/10",
        tableCell: "bg-orange-950/10"
      };
    case "physics":
    case "a-level-physics":
      return {
        accentText: "text-cyan-400",
        accentBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
        btn: "bg-cyan-500 hover:bg-cyan-600 text-white shadow-xl shadow-cyan-500/10",
        glow: "bg-cyan-950/5",
        tableHeader: "text-cyan-500 bg-cyan-950/10",
        tableCell: "bg-cyan-950/10"
      };
    case "python":
    case "machine-learning":
      return {
        accentText: "text-purple-400",
        accentBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
        btn: "bg-purple-500 hover:bg-purple-600 text-white shadow-xl shadow-purple-500/10",
        glow: "bg-purple-950/5",
        tableHeader: "text-purple-500 bg-purple-950/10",
        tableCell: "bg-purple-950/10"
      };
    default:
      return {
        accentText: "text-red-400",
        accentBg: "bg-red-500/10 border-red-500/20 text-red-400",
        btn: "bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/10",
        glow: "bg-red-950/5",
        tableHeader: "text-red-500 bg-red-950/10",
        tableCell: "bg-red-950/10"
      };
  }
}

export default function YouTubeToNotesSubjectPage({ slug }: YouTubeToNotesSubjectPageProps) {
  const seoConfig = getLocalizedSeo(slug, "global");
  const jsonLd = generateJsonLdForPage(slug, "global");
  const colors = getSubjectColors(slug);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-neutral-800 relative overflow-hidden">
      <SchemaMarkup schema={jsonLd} />

      {/* Background Atmosphere */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] ${colors.glow} blur-[140px] rounded-full pointer-events-none z-0`} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {/* H1 SEO Target Title */}
        <h1 className="sr-only">{seoConfig.h1}</h1>

        {/* Dynamic Client Form Component */}
        <YouTubeToNotesClient />

        {/* --- Subject-Specific SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-12 md:py-24 border-t border-white/[0.04] mt-8 md:mt-16 space-y-16 md:space-y-32">
          
          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.accentBg} text-xs font-bold uppercase tracking-wider`}>
                <Sparkles size={12} />
                <span>Subject Study Guide Optimizer</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                {seoConfig.h2} <span className={`${colors.accentText} bg-clip-text bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-400`}>{seoConfig.h2Accent}</span> {seoConfig.h2Rest}
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                {seoConfig.intro}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {seoConfig.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`p-1 ${colors.accentBg} rounded-lg mt-0.5`}>
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

            {/* Structured Social Proof Card */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/0 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Trusted Globally</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${colors.accentBg}`}>
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Exam Prep Optimized</h3>
                      <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                        Used by students globally preparing for **SAT, AP, GCSE, A-Level, HSC, ATAR**, and university exams.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${colors.accentBg}`}>
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">LaTeX Formatted</h3>
                      <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                        Renders formulas, chemical equations, vectors, matrix notation, and complex variables in clear LaTeX syntax.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${colors.accentBg}`}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Programming Code Blocks</h3>
                      <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                        Detects code, algorithms, syntax variables, and formats in copy-pasteable Markdown blocks.
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
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.accentBg} text-xs font-bold uppercase tracking-wider mb-2`}>
                <Trophy size={12} />
                <span>Head-to-Head Comparison</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Paperxify vs AI Tools</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">See why Paperxify is the purpose-built AI note-taker for {slug} — not a general chatbot workaround.</p>
            </div>

            <div className="border border-white/10 rounded-2xl md:rounded-3xl bg-neutral-950/60 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 md:px-6 py-5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500 w-[30%]">
                        Feature
                      </th>
                      {/* Paperxify - subject-colored highlight */}
                      <th className={`px-3 md:px-4 py-5 ${colors.tableCell} border-x border-white/5 text-center w-[14%]`}>
                        <div className="flex flex-col items-center gap-1.5">
                          <img src="/paperxify.jpeg" alt="Paperxify logo" className="w-7 h-7 md:w-9 md:h-9 rounded-xl object-cover shadow-lg" />
                          <span className={`${colors.accentText} font-bold text-[9px] md:text-[10px] uppercase tracking-wider leading-tight text-center`}>Paperxify</span>
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
                      { feature: "Subject-Specific Formatting", paperxify: true, chatgpt: "Basic", claude: "Basic", deepseek: "Basic", gemini: "Basic" },
                      { feature: "LaTeX & Code Block Detection", paperxify: true, chatgpt: "Partial", claude: "Partial", deepseek: "Partial", gemini: "Partial" },
                      { feature: "Flashcards & Active Recall", paperxify: true, chatgpt: false, claude: false, deepseek: false, gemini: false },
                      { feature: "Visual Mind Maps & Diagrams", paperxify: true, chatgpt: false, claude: false, deepseek: false, gemini: false },
                      { feature: "Notion & PDF Export", paperxify: true, chatgpt: false, claude: false, deepseek: false, gemini: false },
                      { feature: "Built for Students", paperxify: true, chatgpt: "General AI", claude: "General AI", deepseek: "General AI", gemini: "General AI" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.015] transition-colors">
                        <td className="px-4 md:px-6 py-4 text-neutral-300 text-[11px] md:text-xs font-semibold tracking-wide">{row.feature}</td>
                        {/* Paperxify cell */}
                        <td className={`px-3 md:px-4 py-4 ${colors.tableCell} border-x border-white/5 text-center`}>
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
              <div className="px-4 md:px-6 py-3 border-t border-white/[0.04] flex items-center gap-2">
                <Check size={11} className="text-green-500 shrink-0" />
                <span className="text-[10px] text-neutral-600">Paperxify is purpose-built for YouTube-to-notes — not a general-purpose chatbot.</span>
              </div>
            </div>
          </section>

          {/* Section 4: Rich Q&A / FAQ Section */}
          <FAQAccordion faqs={seoConfig.faqs} />

          {/* Section 5: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-neutral-950/5 pointer-events-none" />
            <div className={`p-3 ${colors.accentBg} rounded-2xl w-fit mx-auto animate-bounce`}>
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{seoConfig.ctaTitle}</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              {seoConfig.ctaDesc}
            </p>
            <div className="pt-2">
              <Link href="#search-form" className={`inline-flex items-center gap-2 px-8 py-3.5 ${colors.btn} font-bold uppercase tracking-wider text-xs rounded-xl transition-all active:scale-95`}>
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
