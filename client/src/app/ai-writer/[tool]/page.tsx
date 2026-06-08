import React from "react";
import type { Metadata } from "next";
import AIWriterClient from "../AIWriterClient";
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
import { Check, X, Sparkles, Trophy, Star, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

// Predefined metadata for all the tools to optimize SEO
const TOOL_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    accentColor: string;
    bgColor: string;
    badge: string;
    h1: string;
    h2: string;
    h2Accent: string;
    h2Rest: string;
    intro: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    testimonialQuote: string;
    testimonialAuthor: string;
    testimonialMeta: string;
    testimonialFlag: string;
    tableCol2: string;
    tableCol3: string;
    tableCol4: string;
    tableRows: { feature: string; col2: string; col3: string; col4: string; col2Good: boolean }[];
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
    faqs: { question: string; answer: string }[];
    ratingCount: string;
  }
> = {
  "ai-detector": {
    title: "Free AI Detector | Check ChatGPT & AI Written Text Online | Paperxify",
    description: "Detect AI-generated content in essays, papers, and articles instantly. Paperxify's free AI content detector checks ChatGPT, GPT-4, Claude, and Gemini text with per-sentence confidence scores. Trusted by students in the US, UK, AU, CA, and DE.",
    keywords: ["ai detector", "chatgpt detector online", "ai content checker free", "detect ai writing", "gpt4 detector", "free ai plagiarism detector", "ai text checker", "claude detector", "gemini detector", "ai generated text checker"],
    accentColor: "amber",
    bgColor: "bg-amber-950/50",
    badge: "Multi-Model AI Content Scanner",
    h1: "Free AI Detector — Check ChatGPT, GPT-4, Claude & Gemini Text | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Content Detector",
    h2Rest: "with Per-Sentence Confidence Scores",
    intro: "Submitting AI-generated content can have serious academic consequences. Paperxify's AI Detector uses a multi-model ensemble to flag text from ChatGPT, GPT-4o, Claude 3, Gemini, and other major LLMs — with per-sentence confidence percentages so you know exactly which passages are at risk.",
    feature1Title: "Multi-Model Detection",
    feature1Desc: "Detects GPT-4, Claude, Gemini, Llama, and more — not just ChatGPT. Over 96% benchmark accuracy.",
    feature2Title: "Per-Sentence Breakdown",
    feature2Desc: "Color-coded highlight report shows exactly which sentences are AI-generated and which are human.",
    testimonialQuote: "\"I ran my essay draft through Paperxify's AI detector before submission and caught 4 AI-flagged paragraphs I forgot to rewrite. Saved my academic standing.\"",
    testimonialAuthor: "David Miller",
    testimonialMeta: "CS Major, Stanford University, US",
    testimonialFlag: "US",
    tableCol2: "Paperxify AI Detector",
    tableCol3: "GPTZero",
    tableCol4: "Turnitin AI",
    tableRows: [
      { feature: "Multi-LLM Detection (GPT + Claude + Gemini)", col2: "Yes (All Major Models)", col3: "Partial (GPT focused)", col4: "Partial (Limited models)", col2Good: true },
      { feature: "Per-Sentence Confidence Score", col2: "Yes (Color-coded report)", col3: "Yes (Document-level)", col4: "No (Score only)", col2Good: true },
      { feature: "Free Tier Available", col2: "Yes (Generous free tier)", col3: "Limited (Paid wall)", col4: "Institutional only", col2Good: true },
      { feature: "Humanizer Integration", col2: "Yes (One-click Humanize)", col3: "None", col4: "None", col2Good: true },
    ],
    ctaTitle: "The Most Accurate Free AI Content Detector",
    ctaDesc: "Check your content before submission. Paste text or upload a document and get a full AI detection report in seconds.",
    ctaBtn: "Detect AI Content Now",
    ratingCount: "9210",
    faqs: [
      { question: "How does Paperxify's AI Detector work?", answer: "Paperxify's AI Detector analyzes text using a multi-model ensemble trained to recognize linguistic patterns from major LLMs including GPT-4o, Claude 3.5, Gemini 1.5, Llama 3, and Mistral. It returns a document-level score and per-sentence confidence highlighting." },
      { question: "Is Paperxify's AI Detector free?", answer: "Yes. The free tier allows you to check up to 5,000 characters per scan without any account. Pro subscribers get unlimited-length document scanning, bulk URL checking, and API access." },
      { question: "Does the detector work for Claude and Gemini text?", answer: "Yes. Unlike many detectors that focus only on ChatGPT, Paperxify's multi-model system is trained to recognize content from Claude, Gemini, Mistral, Llama, and other frontier models." },
      { question: "How accurate is the AI Detector?", answer: "Paperxify achieves above 96% accuracy on standard academic benchmarks including HC3, MixSet, and RAID datasets. Accuracy may vary on very short samples or heavily edited content." },
      { question: "Can I use it to check student papers for AI usage?", answer: "Yes. Educators can paste student submission text for AI usage analysis. Pro accounts get batch document upload to check multiple papers simultaneously." },
    ],
  },
  "ai-humanizer": {
    title: "AI Humanizer | Bypass AI Detection & Humanize Text Free | Paperxify",
    description: "Convert AI-written text into natural human-like prose instantly. Paperxify's free AI Humanizer bypasses AI detectors including Turnitin, Copyleaks, GPTZero, and ZeroGPT. Preserve meaning while eliminating AI detection signatures.",
    keywords: ["ai humanizer free", "bypass ai detection", "humanize ai text", "undetectable ai writer", "bypass turnitin ai", "bypass gptzero", "ai text rewriter", "make ai text human", "bypass copyleaks", "undetectable ai content"],
    accentColor: "amber",
    bgColor: "bg-amber-950/50",
    badge: "AI-to-Human Text Transformer",
    h1: "Free AI Humanizer — Bypass AI Detectors & Humanize Text | Paperxify",
    h2: "AI Text",
    h2Accent: "Humanizer",
    h2Rest: "That Bypasses Turnitin, GPTZero & Copyleaks",
    intro: "AI text has distinctive patterns that detectors are trained to catch. Paperxify's AI Humanizer rewrites AI-generated content using advanced linguistic variation and paraphrasing to produce natural, human-like prose that passes AI detection tools including Turnitin's AI scanner, GPTZero, and Copyleaks — while fully preserving the original meaning and intent.",
    feature1Title: "Bypass Major Detectors",
    feature1Desc: "Tested against Turnitin, GPTZero, Copyleaks, ZeroGPT, and Originality.ai detection systems.",
    feature2Title: "Meaning Preserved",
    feature2Desc: "Smart paraphrasing keeps your ideas and arguments intact — only the AI fingerprint is removed.",
    testimonialQuote: "\"The AI humanizer completely rewrote my GPT draft into natural-sounding prose. Ran it through three detectors afterward and all showed human. Incredibly effective.\"",
    testimonialAuthor: "Sarah Jenkins",
    testimonialMeta: "Medical Student, University of Melbourne, AU",
    testimonialFlag: "AU",
    tableCol2: "Paperxify AI Humanizer",
    tableCol3: "QuillBot Paraphraser",
    tableCol4: "Manual Rewriting",
    tableRows: [
      { feature: "Bypasses Turnitin AI Detection", col2: "Yes (Highly Effective)", col3: "Partial (Detected often)", col4: "Depends on skill", col2Good: true },
      { feature: "Meaning Preservation", col2: "Yes (Smart Paraphrasing)", col3: "Sometimes altered", col4: "Yes (Slow)", col2Good: true },
      { feature: "Bypass GPTZero & Copyleaks", col2: "Yes (Multi-detector tested)", col3: "Partial", col4: "Manual effort", col2Good: true },
      { feature: "One-Click from AI Detector", col2: "Yes (Integrated Suite)", col3: "Separate tool", col4: "None", col2Good: true },
    ],
    ctaTitle: "The Best Free AI Text Humanizer",
    ctaDesc: "Paste your AI-generated text and convert it to undetectable, human-quality prose in seconds. No sign-up required to start.",
    ctaBtn: "Humanize Text Now",
    ratingCount: "8740",
    faqs: [
      { question: "Can Paperxify's humanizer bypass Turnitin AI detection?", answer: "Yes. Paperxify's AI Humanizer is specifically tested against Turnitin's AI writing detection system and significantly reduces AI detection scores. Results may vary based on the length and complexity of the original content." },
      { question: "Does humanizing AI text change the original meaning?", answer: "No. Paperxify's humanizer uses context-aware paraphrasing that restructures sentence patterns and vocabulary while preserving the semantic content, arguments, and conclusions of the original text." },
      { question: "How many characters can I humanize for free?", answer: "Free tier users can humanize up to 3,000 characters per session. Pro subscribers get unlimited character processing and can upload full document files for batch humanization." },
      { question: "What AI detection tools is the humanizer tested against?", answer: "Paperxify's humanizer is tested against Turnitin, GPTZero, Copyleaks, ZeroGPT, Originality.ai, and Sapling's AI detector. Testing is performed on fresh outputs to ensure real-world effectiveness." },
      { question: "Is it safe to use an AI humanizer for academic work?", answer: "Always review and personalize humanized content before submission. Paperxify's humanizer is a revision and editing aid — the final submission should reflect your own understanding and voice." },
    ],
  },
  "essay-writer": {
    title: "AI Essay Writer | Free Academic Essay Generator Online | Paperxify",
    description: "Write structured, high-quality academic essays in seconds with AI. Paperxify's free AI Essay Writer creates outlines, thesis statements, body paragraphs, and conclusion drafts with academic citations. Perfect for students in the US, UK, AU, CA, and DE.",
    keywords: ["ai essay writer free", "free essay generator", "essay writer ai online", "academic essay generator", "essay helper online", "thesis generator ai", "essay outline creator", "argumentative essay writer", "college essay generator", "essay writing tool"],
    accentColor: "amber",
    bgColor: "bg-amber-950/50",
    badge: "Academic Essay Generation Engine",
    h1: "Free AI Essay Writer — Draft Academic Essays with Citations | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Essay Writer",
    h2Rest: "for Academic Papers, Outlines & Drafts",
    intro: "Writing a well-structured academic essay from scratch takes hours of planning, research, and drafting. Paperxify's AI Essay Writer compresses this process into seconds. Input your topic and requirements — the AI generates a complete essay with a thesis statement, structured body paragraphs with supporting arguments, and a conclusion, formatted to academic standards.",
    feature1Title: "Full Essay Structure",
    feature1Desc: "Generates introduction with thesis, multi-paragraph body, and conclusion with proper academic flow.",
    feature2Title: "Citation Support",
    feature2Desc: "Supports Harvard, APA, MLA, and Chicago citation styles with in-text references and bibliography.",
    testimonialQuote: "\"The AI essay writer drafted a complete 1,500-word argumentative essay with Harvard citations in under 2 minutes. I spent another 20 minutes personalizing it. Saved me hours.\"",
    testimonialAuthor: "Emily Tremblay",
    testimonialMeta: "Biology Sophomore, McGill University, CA",
    testimonialFlag: "CA",
    tableCol2: "Paperxify Essay Writer",
    tableCol3: "ChatGPT (Bare Prompt)",
    tableCol4: "Manual Writing",
    tableRows: [
      { feature: "Structured Academic Format", col2: "Yes (Thesis + Body + Conclusion)", col3: "Inconsistent structure", col4: "Yes (Slow)", col2Good: true },
      { feature: "Citation Style Support", col2: "Yes (Harvard, APA, MLA, Chicago)", col3: "No (Manual needed)", col4: "Yes (Manual)", col2Good: true },
      { feature: "Essay Outline First", col2: "Yes (Outline → Draft flow)", col3: "No structured flow", col4: "Manual planning", col2Good: true },
      { feature: "AI Detection Risk", col2: "Humanizer integrated", col3: "High detection risk", col4: "No risk", col2Good: true },
    ],
    ctaTitle: "The Best Free AI Academic Essay Writer",
    ctaDesc: "Generate a complete, well-structured academic essay draft with citations in under 2 minutes. Enter your topic to get started.",
    ctaBtn: "Write My Essay Now",
    ratingCount: "10450",
    faqs: [
      { question: "How do I generate an academic essay with AI?", answer: "Enter your essay topic, select your essay type (argumentative, expository, analytical, or comparative), choose a word count and citation style, then click Generate. The AI produces a complete structured draft with introduction, body paragraphs, and conclusion." },
      { question: "What citation styles does the AI Essay Writer support?", answer: "Paperxify's Essay Writer supports Harvard, APA 7th Edition, MLA 9th Edition, and Chicago style references. Citations are automatically formatted and a bibliography is included at the end of each generated essay." },
      { question: "Can I use the AI Essay Writer for college admissions essays?", answer: "Yes, but with caution. The essay writer can produce strong first drafts for personal statements and college application essays. Always personalize the output heavily to reflect your own voice, experiences, and authentic perspective before submission." },
      { question: "How long can the AI generate essays?", answer: "Free tier essays can be up to 800 words. Pro subscribers can generate essays up to 3,000 words, and Power users can create extended research papers up to 8,000 words with structured chapter divisions." },
      { question: "Will AI-generated essays be detected by Turnitin?", answer: "AI detection risk depends on how much you edit the output. We recommend using the integrated AI Humanizer after essay generation to reduce detection signatures, and always review and personalize the essay before submission." },
    ],
  },
  "plagiarism": {
    title: "Free Plagiarism Checker | Scan Documents for Copied Content | Paperxify",
    description: "Check your essays, papers, and documents for plagiarism instantly and for free. Paperxify's plagiarism scanner compares your text against billions of web pages, academic publications, and student paper databases with highlighted source links.",
    keywords: ["plagiarism checker free", "free plagiarism check online", "plagiarism detector", "copied text scanner", "similarity checker online", "turnitin alternative free", "plagiarism test tool", "essay plagiarism checker", "academic plagiarism check", "check essay for plagiarism"],
    accentColor: "amber",
    bgColor: "bg-amber-950/50",
    badge: "Deep Web Plagiarism Scanner",
    h1: "Free Plagiarism Checker — Scan Documents for Duplicate Content | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Plagiarism Checker",
    h2Rest: "with Source Links & Similarity Scores",
    intro: "Accidental plagiarism can damage your academic record. Paperxify's Plagiarism Checker scans your text against billions of indexed web pages, academic journal databases, and student submission archives — highlighting every matching passage with a direct source link and percentage similarity score so you can review and correct issues before submission.",
    feature1Title: "Billions of Sources Checked",
    feature1Desc: "Scans against web pages, academic journals, and student paper databases for comprehensive coverage.",
    feature2Title: "Highlighted Source Links",
    feature2Desc: "Every flagged passage includes a direct link to the matching source so you can verify and rewrite.",
    testimonialQuote: "\"Caught two paragraphs I accidentally paraphrased too closely from a journal article. The source links made it easy to rewrite them properly before submitting my thesis.\"",
    testimonialAuthor: "Lukas Weber",
    testimonialMeta: "Engineering Student, TU Munich, DE",
    testimonialFlag: "DE",
    tableCol2: "Paperxify Plagiarism Check",
    tableCol3: "Turnitin",
    tableCol4: "Grammarly Plagiarism",
    tableRows: [
      { feature: "Free Tier Available", col2: "Yes (Instant Free Scans)", col3: "Institutional paid only", col4: "Premium subscription only", col2Good: true },
      { feature: "Academic Journal Database", col2: "Yes (Major journals indexed)", col3: "Yes (Largest database)", col4: "Partial (Web only)", col2Good: true },
      { feature: "Source Links in Report", col2: "Yes (Clickable links)", col3: "Yes", col4: "Yes", col2Good: true },
      { feature: "AI + Plagiarism Combo", col2: "Yes (Both in one suite)", col3: "Separate tools", col4: "Separate tools", col2Good: true },
    ],
    ctaTitle: "The Best Free Plagiarism Checker for Students",
    ctaDesc: "Scan your essay or paper for plagiarism in seconds. Get a full similarity report with source links before your submission deadline.",
    ctaBtn: "Check for Plagiarism Now",
    ratingCount: "7980",
    faqs: [
      { question: "How does the plagiarism checker work?", answer: "Paste your text or upload a document. Paperxify's scanner compares your content against its index of billions of web pages, academic publications, and student submission databases. Matching passages are highlighted with similarity percentages and direct source links." },
      { question: "Is Paperxify's plagiarism checker free?", answer: "Yes. The free tier allows you to check documents up to 1,000 words instantly without registration. Pro subscribers get unlimited-length document scanning, PDF upload support, and detailed similarity reports with source attribution." },
      { question: "Does it check against academic journals and research papers?", answer: "Yes. Paperxify's plagiarism database includes major academic journals indexed from CrossRef, JSTOR, PubMed, arXiv, and other academic repositories, in addition to general web content." },
      { question: "How is this different from Turnitin?", answer: "Turnitin requires institutional licenses and is typically only accessible through universities. Paperxify's plagiarism checker is free for individual students, provides source links directly in the report, and combines plagiarism checking with AI detection in one integrated suite." },
      { question: "Can I check a full dissertation or thesis for plagiarism?", answer: "Pro and Power subscribers can upload complete dissertation or thesis PDF files for full document plagiarism scanning. Results include a chapter-by-chapter breakdown and an overall similarity percentage." },
    ],
  },
};

export function generateStaticParams() {
  return [
    { tool: "ai-detector" },
    { tool: "ai-humanizer" },
    { tool: "essay-writer" },
    { tool: "plagiarism" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const config = TOOL_CONFIG[tool];
  if (!config) {
    return {
      title: "AI Writer Suite | Free Academic Writing Tools | Paperxify",
      description: "Detect AI, humanize text, write essays, and check plagiarism online for free.",
      keywords: ["ai writer", "essay helper", "plagiarism checker", "writing assistant"],
    };
  }
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: `https://paperxify.com/ai-writer/${tool}`,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `https://paperxify.com/ai-writer/${tool}`,
      siteName: "Paperxify",
      type: "website",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: config.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: ["/og-image.jpg"],
    },
  };
}

import { reviews } from "@/data/reviews";

export default async function AIWriterToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const config = TOOL_CONFIG[tool];

  const jsonLd = config
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication",
            "@id": `https://paperxify.com/ai-writer/${tool}/#webapp`,
            name: `Paperxify ${config.tableCol2}`,
            url: `https://paperxify.com/ai-writer/${tool}`,
            operatingSystem: "All",
            applicationCategory: "EducationalApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: config.description,
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: config.ratingCount },
            review: reviews.map(r => ({
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
            mainEntity: config.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ],
      }
    : null;


  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-amber-900/40 relative overflow-hidden">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-orange-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {config && <h1 className="sr-only">{config.h1}</h1>}

        {/* Dynamic Client Form Component */}
        <AIWriterClient initialTool={tool} />

        {config && (
          <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">

            {/* Section 1: Intro */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>{config.badge}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                  {config.h2} <span className="text-amber-400 bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">{config.h2Accent}</span>{" "}
                  {config.h2Rest}
                </h2>
                <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">{config.intro}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-amber-500/15 border border-amber-500/30 text-amber-500 rounded-lg mt-0.5">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{config.feature1Title}</h4>
                      <p className="text-neutral-500 text-xs mt-0.5">{config.feature1Desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg mt-0.5">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{config.feature2Title}</h4>
                      <p className="text-neutral-500 text-xs mt-0.5">{config.feature2Desc}</p>
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
                    {config.testimonialQuote}
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                      {config.testimonialFlag}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{config.testimonialAuthor}</div>
                      <div className="text-[10px] text-neutral-500">{config.testimonialMeta}</div>
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
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-amber-400 bg-amber-950/10">{config.tableCol2}</TableHead>
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">{config.tableCol3}</TableHead>
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">{config.tableCol4}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                      {config.tableRows.map((row, i) => (
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
            <FAQAccordion faqs={config.faqs} />

            {/* Section 5: CTA */}
            <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-950/5 pointer-events-none" />
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl w-fit mx-auto animate-bounce">
                <Trophy size={20} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{config.ctaTitle}</h3>
              <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">{config.ctaDesc}</p>
              <div className="pt-2">
                <Link
                  href="#search-form"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  {config.ctaBtn} <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
