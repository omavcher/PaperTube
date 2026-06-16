"use client";

import React from "react";
import Link from "next/link";
import AIWriterClient from "@/app/ai-writer/AIWriterClient";
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
import { Check, Sparkles, Trophy, Star, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";

interface AIWriterSeoPageProps {
  region: string;
  tool?: string;
}

export default function AIWriterSeoPage({ region, tool }: AIWriterSeoPageProps) {
  const seoConfig = getLocalizedSeo("ai-writer", region, tool);
  const jsonLd = generateJsonLdForPage("ai-writer", region, tool);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-amber-950/50 relative overflow-hidden">
      <SchemaMarkup schema={jsonLd} />

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-yellow-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {/* H1 SEO Target Title */}
        <h1 className="sr-only">{seoConfig.h1}</h1>

        {/* Dynamic Client Form Component */}
        <AIWriterClient initialTool={tool} />

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">
          
          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>{seoConfig.badge || "Academic Essay Generation Engine"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                {seoConfig.h2} <span className="text-amber-400 bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-400">{seoConfig.h2Accent}</span> {seoConfig.h2Rest}
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                {seoConfig.intro}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-500/15 border border-amber-500/30 text-amber-500 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{seoConfig.feature1Title || "AI Content Detection"}</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">{seoConfig.feature1Desc || "Detects GPT-4, Claude, Gemini, Llama, and more."}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{seoConfig.feature2Title || "Meaning Preservation"}</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">{seoConfig.feature2Desc || "Smart paraphrasing humanizes text while preserving core concepts."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-yellow-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Highly Rated</span>
                </div>
                <blockquote className="text-sm text-neutral-300 italic font-light leading-relaxed">
                  {seoConfig.testimonialQuote || "\"The AI essay writer drafted a complete 1,500-word argumentative essay with proper academic citations. Elite tool.\""}
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                    {region.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{seoConfig.testimonialAuthor || "Emily Tremblay"}</div>
                    <div className="text-[10px] text-neutral-500">{seoConfig.testimonialMeta || "Biology Student"}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Comparison Table */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and academic professionals globally choose Paperxify.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-amber-400 bg-amber-950/10">{seoConfig.tableCol2 || "Paperxify AI Writer"}</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">{seoConfig.tableCol3 || "Standard Tools"}</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">{seoConfig.tableCol4 || "Manual Writing"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    {seoConfig.tableRows.map((row, i) => (
                      <TableRow key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <TableCell className="p-5 font-semibold text-neutral-200">{row.feature}</TableCell>
                        <TableCell className="p-5 font-bold text-green-400 bg-amber-950/10">
                          <Check size={16} className="text-green-500 inline mr-1" /> {row.col2}
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

          {/* Section 3: Testimonials */}
          <TestimonialsCarousel />

          {/* Section 4: FAQ */}
          <FAQAccordion faqs={seoConfig.faqs} />

          {/* Section 5: CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-950/5 pointer-events-none" />
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{seoConfig.ctaTitle}</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">{seoConfig.ctaDesc}</p>
            <div className="pt-2">
              <Link
                href="#search-form"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5"
              >
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
