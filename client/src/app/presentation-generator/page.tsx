import React from "react";
import type { Metadata } from "next";
import AIPPTClient from "./AIPPTClient";
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
  Layout,
  Download,
} from "lucide-react";
import Footer from "@/components/Footer";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "AI Presentation Generator | Free AI PPT Slide Maker | Paperxify",
  description: "Create stunning, professional presentations in seconds with AI. Paperxify's free AI presentation generator produces structured slide decks, speaker notes, and PPTX exports for any topic — no design skills needed.",
  keywords: [
    "ai presentation generator",
    "free ai ppt maker",
    "ai slide deck creator",
    "ai powerpoint generator",
    "convert text to slides ai",
    "ai presentation maker online",
    "free ai ppt generator",
    "auto slide creator",
    "ai ppt from topic",
    "presentation ai tool",
    "ai slide builder free",
    "notegpt alternative presentation",
    "ai lecture slides maker",
  ],
  alternates: {
    canonical: "https://paperxify.com/presentation-generator",
  },
  openGraph: {
    title: "AI Presentation Generator | Free AI PPT Slide Maker | Paperxify",
    description: "Generate polished slide decks and presentations from any topic or text in seconds. The best free AI PowerPoint maker for students and professionals.",
    url: "https://paperxify.com/presentation-generator",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Presentation & Slide Deck Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Presentation Generator | Free AI PPT Slide Maker | Paperxify",
    description: "Turn any topic into a full slide deck with speaker notes and beautiful layouts. Free AI presentation maker.",
    images: ["/og-image.jpg"],
  },
};

const pptFaqs = [
  {
    question: "How do I generate an AI presentation from scratch?",
    answer: "Simply type your topic or paste your source content into Paperxify's AI Presentation Generator, choose a theme and slide count, then click 'Generate'. The AI structures a full slide deck with titles, content bullets, and speaker notes in under 15 seconds.",
  },
  {
    question: "What presentation themes and layouts are available?",
    answer: "Paperxify offers dozens of premium presentation themes including Professional Dark, Academic Scholar, Minimal White, Cyberpunk Neon, Lavender Dream, and more. Each theme includes multiple layout templates optimized for title slides, content slides, comparison slides, and conclusion slides.",
  },
  {
    question: "Can I export my AI presentation to PowerPoint or PDF?",
    answer: "Yes. Pro and Power subscribers can export fully formatted presentations as PPTX files (compatible with Microsoft PowerPoint and Google Slides) or as high-resolution PDF decks with embedded speaker notes.",
  },
  {
    question: "Can the AI build presentations from YouTube videos?",
    answer: "Yes! Paperxify can convert YouTube lecture transcripts directly into structured slide decks. Paste the video link, choose 'Presentation' as your output, and receive a fully organized presentation distilled from the video's key insights.",
  },
  {
    question: "Is Paperxify's presentation generator free to use?",
    answer: "Yes. The free tier lets you generate up to 3 complete presentations per day. Pro subscribers get unlimited generation, advanced themes, PPTX export, and the ability to create decks from YouTube links and uploaded documents.",
  },
];

export default function AIPPTHomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://paperxify.com/presentation-generator/#webapp",
        "name": "Paperxify AI Presentation Generator",
        "url": "https://paperxify.com/presentation-generator",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "description": "Best free AI presentation and slide deck generator. Create professional PPT presentations from any topic, text, or YouTube video instantly with premium design themes.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "7650",
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
        "mainEntity": pptFaqs.map((faq) => ({
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
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-orange-950/50 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-amber-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">

        {/* H1 SEO Target Title */}
        <h1 className="sr-only">Free AI Presentation & Slide Deck Generator | Paperxify</h1>

        {/* Dynamic Client Form Component */}
        <AIPPTClient />

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">

          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Instant Slide Deck Builder</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                AI-Powered <span className="text-orange-500 bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Presentation Generator</span> for Any Topic
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                Building a slide deck from scratch takes hours. Paperxify compresses that into seconds. Input your topic, select a premium design theme, and receive a fully structured presentation with titles, content bullets, speaker notes, and export-ready layouts — no PowerPoint skills required.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-orange-500/15 border border-orange-500/30 text-orange-500 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Premium Design Themes</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Dozens of curated slide themes — from academic to cyberpunk — for every presentation style.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">PPTX & PDF Export</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Download fully formatted PowerPoint or PDF files with embedded speaker notes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-amber-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Highly Rated</span>
                </div>
                <blockquote className="text-sm text-neutral-300 italic font-light leading-relaxed">
                  "I generated a 20-slide research presentation from my YouTube lecture notes in under a minute. The themes look genuinely professional — my professor asked what tool I used."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-xs">
                    UK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">James Sterling</div>
                    <div className="text-[10px] text-neutral-500">Economics Student, LSE, UK</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Capabilities Comparison */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and professionals globally choose Paperxify for AI-generated presentations.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-orange-500 bg-orange-950/10">Paperxify AI PPT</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Standard AI Generators</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual PowerPoint</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Premium Design Themes</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-orange-950/10 flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> Yes (Dozens of Themes)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">1–2 Basic Templates</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Manual Design Only</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Speaker Notes Generation</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-orange-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Automated)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Slide content only</TableCell>
                      <TableCell className="p-5 text-neutral-500">Manual writing</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">PPTX & PDF Export</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-orange-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Both Formats)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> PDF Only</TableCell>
                      <TableCell className="p-5 text-neutral-500">Native PPTX only</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">YouTube Video to Slides</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-orange-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Link Input)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
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
          <FAQAccordion faqs={pptFaqs} />

          {/* Section 5: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-950/5 pointer-events-none" />
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Best AI Presentation Slide Maker</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              Generate a complete, polished slide deck in seconds. Input your topic, pick a theme, and present with confidence. No design experience needed.
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Generate Presentation Now <ArrowRight size={14} />
              </Link>
            </div>
          </section>

        </div>
        <Footer />
      </main>
    </div>
  );
}
