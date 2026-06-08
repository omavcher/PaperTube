import React from "react";
import type { Metadata } from "next";
import AIWriterClient from "./AIWriterClient";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
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
  X,
  Sparkles,
  Trophy,
  Star,
  ArrowRight,
  ShieldCheck,
  PenLine,
} from "lucide-react";
import Footer from "@/components/Footer";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "AI Writer Suite | AI Detector, AI Humanizer, Essay Writer & Plagiarism Checker | Paperxify",
  description: "All-in-one AI writing toolkit. Detect AI-generated content, humanize text to bypass detectors, write academic essays, and check plagiarism — all in one free platform. Trusted by students in the US, UK, AU, CA, and DE.",
  keywords: [
    "ai writer tool",
    "free ai detector",
    "chatgpt detector online",
    "ai humanizer bypass detection",
    "humanize ai text free",
    "ai essay writer free",
    "free essay generator ai",
    "plagiarism checker free",
    "ai writing suite",
    "bypass turnitin ai detector",
    "undetectable ai text",
    "academic essay generator",
    "ai content detector tool",
    "free paraphrasing tool ai",
  ],
  alternates: {
    canonical: "https://paperxify.com/ai-writer",
  },
  openGraph: {
    title: "AI Writer Suite | AI Detector, Humanizer, Essay Writer & Plagiarism Checker | Paperxify",
    description: "Detect AI, humanize text, write essays, and check plagiarism — all free on Paperxify. The complete AI academic writing toolkit for students.",
    url: "https://paperxify.com/ai-writer",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Writer Suite — Detector, Humanizer, Essay Writer, Plagiarism Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Writer Suite | AI Detector, Humanizer & Essay Generator | Paperxify",
    description: "Free AI content detector, text humanizer, essay generator, and plagiarism scanner. The complete student writing toolkit.",
    images: ["/og-image.jpg"],
  },
};

const writerFaqs = [
  {
    question: "What tools are included in the Paperxify AI Writer suite?",
    answer: "The AI Writer suite includes four tools: AI Detector (detect ChatGPT and AI-generated content with confidence scores), AI Humanizer (convert AI text to natural human-like copy), AI Essay Writer (draft structured academic essays with citations and outlines), and Plagiarism Checker (scan for copied content against millions of online sources).",
  },
  {
    question: "How accurate is Paperxify's AI Detector?",
    answer: "Paperxify's AI Detector uses a multi-model ensemble to flag AI-generated content from GPT-4, Claude, Gemini, and other LLMs. It provides per-sentence confidence scores so you can see exactly which parts of a document are AI-generated. Accuracy rates are above 96% on standard benchmarks.",
  },
  {
    question: "Can Paperxify humanize AI text to bypass Turnitin or GPTZero?",
    answer: "Yes. The AI Humanizer rewrites AI-generated content using advanced paraphrasing and linguistic variation to produce natural, human-like prose. It significantly reduces AI detection scores on platforms including Turnitin, Copyleaks, GPTZero, and ZeroGPT.",
  },
  {
    question: "Is the AI Essay Writer suitable for academic use?",
    answer: "Yes. The AI Essay Writer generates structured academic essays with proper introductions, body paragraphs, and conclusion sections. It supports academic citation styles and can include references. Always review and edit AI-generated content to match your voice before submission.",
  },
  {
    question: "How does the plagiarism checker work?",
    answer: "Paste your text or upload a document. Paperxify's plagiarism engine scans your content against billions of indexed web pages, academic journals, and student paper databases. Results highlight duplicate passages with source links and similarity percentages.",
  },
];

export default function AIWriterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://paperxify.com/ai-writer/#webapp",
        "name": "Paperxify AI Writer Suite",
        "url": "https://paperxify.com/ai-writer",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "description": "Free all-in-one AI writing toolkit: AI content detector, AI text humanizer, academic essay generator, and plagiarism scanner for students and professionals.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "11230",
        },
        "review": reviews.map(r => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": r.name
          },
          "datePublished": r.datePublished,
          "reviewBody": r.quote,
          "reviewRating": {
            "@type": "Rating",
            "bestRating": "5",
            "ratingValue": r.ratingValue,
            "worstRating": "1"
          }
        }))
      },
      {
        "@type": "FAQPage",
        "mainEntity": writerFaqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      },
    ],
  };


  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-amber-950/50 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-orange-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">

        {/* H1 SEO Target Title */}
        <h1 className="sr-only">Free AI Writer Suite: AI Detector, Humanizer, Essay Generator & Plagiarism Checker | Paperxify</h1>

        {/* Dynamic Client Form Component */}
        <AIWriterClient />

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">

          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Complete AI Academic Writing Suite</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                AI Detector, <span className="text-amber-400 bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Humanizer</span>, Essay Writer & Plagiarism Check
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                The full academic writing toolkit in one place. Detect AI-generated text with confidence scores, rewrite AI content into natural human prose, draft structured essays with proper citations, and scan documents for plagiarism — all for free on Paperxify.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-500/15 border border-amber-500/30 text-amber-500 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">4 Integrated Tools</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">AI Detector, AI Humanizer, Essay Writer, and Plagiarism Checker — all in one tab.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">96%+ Detection Accuracy</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Multi-model AI detection covering GPT-4, Claude, Gemini, and more with per-sentence scores.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
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
                  "The AI humanizer took my GPT-4 draft and made it completely undetectable. The essay writer also handles Harvard citations automatically. Essential for any student."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                    AU
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Sarah Jenkins</div>
                    <div className="text-[10px] text-neutral-500">Medical Student, University of Melbourne, AU</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Capabilities Comparison */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and academic professionals globally choose Paperxify for AI writing assistance.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-amber-400 bg-amber-950/10">Paperxify AI Writer</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">GPTZero / Turnitin</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Writing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">AI Content Detection</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-amber-950/10 flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> Yes (Per-Sentence Scores)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Yes (Separate paid tools)</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">AI Text Humanizer</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-amber-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Undetectable Output)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                      <TableCell className="p-5 text-neutral-500">Manual rewriting</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Academic Essay Generator</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-amber-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (With Citations)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                      <TableCell className="p-5 text-neutral-500">Hours of work</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Plagiarism Scanning</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-amber-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Source Links)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Yes (Turnitin paid)</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>

          {/* Section 3: Country-Targeted User Feedback Carousel */}
          <TestimonialsCarousel />

          {/* Section 4: Rich Q&A / FAQ Section */}
          <FAQAccordion faqs={writerFaqs} />

          {/* Section 5: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-950/5 pointer-events-none" />
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Best AI Academic Writing Suite</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              Detect AI, humanize text, write essays, and check plagiarism — all from one intelligent platform built for modern students.
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Start Writing Now <ArrowRight size={14} />
              </Link>
            </div>
          </section>

        </div>
        <Footer />
      </main>
    </div>
  );
}
