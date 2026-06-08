import React from "react";
import type { Metadata } from "next";
import YouTubeToNotesClient from "./YouTubeToNotesClient";
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
  FileText,
  BookOpen,
} from "lucide-react";
import Footer from "@/components/Footer";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "YouTube to Notes AI | Convert YouTube Video to Study Notes | Paperxify",
  description: "Turn any YouTube video into structured, beautifully formatted study notes instantly. Paperxify is the best free AI YouTube notes generator — create revision guides, study summaries, and PDF exports from lecture links.",
  keywords: [
    "youtube to notes ai",
    "convert youtube video to notes",
    "ai youtube notes generator",
    "youtube lecture notes maker",
    "video to study notes ai",
    "free ai note taker from youtube",
    "youtube study guide generator",
    "notegpt alternative notes",
    "ai notes from youtube link",
    "youtube transcript to notes",
    "lecture video summarizer",
    "ai revision notes generator",
  ],
  alternates: {
    canonical: "https://paperxify.com/youtube-to-notes",
  },
  openGraph: {
    title: "YouTube to Notes AI | Convert YouTube Video to Study Notes | Paperxify",
    description: "Convert YouTube lectures into structured study notes and revision guides instantly. The best free AI video-to-notes tool for students globally.",
    url: "https://paperxify.com/youtube-to-notes",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YouTube to Notes AI Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to Notes AI | Convert YouTube Video to Study Notes | Paperxify",
    description: "Transform any YouTube lecture into polished, structured study notes in seconds. Export to PDF or Notion.",
    images: ["/og-image.jpg"],
  },
};

const notesFaqs = [
  {
    question: "How do I convert a YouTube video to study notes using AI?",
    answer: "Paste the YouTube video URL into Paperxify's YouTube to Notes AI tool. Select your preferred note style — Flash for quick revision points, Scholar for detailed structured notes, or Canvas for visual diagrams. Click 'Generate' and your study notes are ready in seconds.",
  },
  {
    question: "What note formats does Paperxify support?",
    answer: "Paperxify generates multiple note formats: structured bullet summaries, full-paragraph study guides, visual canvas notes with diagrams, and print-ready Scholar PDFs with proper academic formatting including code blocks, equations, and image blocks.",
  },
  {
    question: "Can I export my notes to Notion or PDF?",
    answer: "Yes! Pro and Power subscribers can export notes directly to their Notion workspace with one click, or download beautifully formatted PDF files with academic themes including Lora, EB Garamond, or modern typographic layouts.",
  },
  {
    question: "Does the YouTube notes generator support non-English videos?",
    answer: "Absolutely. Paperxify extracts and processes transcripts in English, German, Spanish, French, Portuguese, Japanese, Korean, and Arabic — making it ideal for international students and multilingual lecture content.",
  },
  {
    question: "How long can the YouTube video be for note generation?",
    answer: "Free users can generate notes from videos up to 30 minutes long. Pro subscribers can handle videos up to 4 hours, and Power users can process extended crash courses and full-semester lecture series up to 12 hours in length.",
  },
];

export default function YouTubeToNotesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://paperxify.com/youtube-to-notes/#webapp",
        "name": "Paperxify YouTube to Notes AI",
        "url": "https://paperxify.com/youtube-to-notes",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "description": "Best free AI YouTube notes generator. Convert any YouTube video link to structured study notes, revision guides, and print-ready PDF summaries instantly.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "12480",
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
        "mainEntity": notesFaqs.map((faq) => ({
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
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-900/50 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-red-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-red-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">

        {/* H1 SEO Target Title */}
        <h1 className="sr-only">Free AI YouTube Video to Study Notes Generator | Paperxify</h1>

        {/* Dynamic Client Form Component */}
        <YouTubeToNotesClient />

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">

          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>AI-Powered Lecture Note Synthesizer</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                AI-Generated <span className="text-red-500 bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">YouTube Study Notes</span> in Seconds
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                Watching a lecture is passive. Paperxify converts any YouTube video into structured, revision-ready study notes automatically. Choose from Flash summaries, Scholar-grade academic notes, or Canvas visual diagrams. Perfect for university students, medical learners, and self-paced coders worldwide.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-500/15 border border-red-500/30 text-red-500 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Multiple Note Styles</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Flash, Scholar, Canvas, and Atlas output architectures for every use case.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">PDF & Notion Export</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Download print-ready PDFs or sync directly to your Notion workspace.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-red-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-red-400 text-red-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Highly Rated</span>
                </div>
                <blockquote className="text-sm text-neutral-300 italic font-light leading-relaxed">
                  "Paperxify is the best AI notes from YouTube link tool on the market. I use it daily for my high-level algorithms classes. The formatting handles markdown code blocks and quotes beautifully."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold text-red-400 text-xs">
                    US
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">David Miller</div>
                    <div className="text-[10px] text-neutral-500">CS Major, Stanford University, US</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Capabilities Comparison */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and researchers globally choose Paperxify for AI-generated YouTube study notes.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-red-500 bg-red-950/10">Paperxify Notes AI</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Standard Summarizers</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Note-Taking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Structured Academic Formatting</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10 flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> Yes (Headers, Code, LaTeX)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Plain bullet points</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Time-consuming</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Multiple Output Architectures</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Flash, Scholar, Canvas)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Single format only</TableCell>
                      <TableCell className="p-5 text-neutral-500">Depends on student</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Notion & PDF Export</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (One-Click Sync)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                      <TableCell className="p-5 text-neutral-500">Manual copying</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Multilingual Transcript Support</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> 8+ Languages
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">English only</TableCell>
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
          <FAQAccordion faqs={notesFaqs} />

          {/* Section 5: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-red-950/5 pointer-events-none" />
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Best AI YouTube Notes Generator</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              Stop pausing and rewinding. Let AI build your complete study notes automatically from any lecture video. Paste a link to get started.
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Generate Notes Now <ArrowRight size={14} />
              </Link>
            </div>
          </section>

        </div>
        <Footer />
      </main>
    </div>
  );
}
