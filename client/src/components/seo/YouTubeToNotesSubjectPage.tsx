"use client";

import React from "react";
import Link from "next/link";
import YouTubeToNotesClient from "@/app/youtube-to-notes/YouTubeToNotesClient";
import { FAQAccordion } from "@/components/FAQAccordion";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { getLocalizedSeo, generateJsonLdForPage } from "@/lib/seo-helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">
          
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
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and academic researchers globally choose Paperxify for AI-generated {slug} study notes.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className={`p-5 font-bold text-xs uppercase tracking-widest ${colors.tableHeader}`}>Paperxify {slug.charAt(0).toUpperCase() + slug.slice(1)} AI</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Standard Summarizers</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Note-Taking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    {seoConfig.tableRows.map((row, idx) => (
                      <TableRow key={idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <TableCell className="p-5 font-semibold text-neutral-200">{row.feature}</TableCell>
                        <TableCell className={`p-5 font-bold text-green-400 ${colors.tableCell} flex items-center gap-2`}>
                          <Check size={16} className="text-green-500" /> {row.col2}
                        </TableCell>
                        <TableCell className="p-5 text-neutral-500">{row.col3}</TableCell>
                        <TableCell className="p-5 text-neutral-500">{row.col4}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
