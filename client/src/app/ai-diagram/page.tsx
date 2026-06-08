import React from "react";
import type { Metadata } from "next";
import AIDiagramClient from "./AIDiagramClient";
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
  GitBranch,
  Network,
} from "lucide-react";
import Footer from "@/components/Footer";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "AI Diagram & Flowchart Generator | Free Visual Diagram Maker | Paperxify",
  description: "Generate flowcharts, sequence diagrams, ER diagrams, class maps, timelines, and more instantly using AI. Paperxify's free AI diagram generator turns any concept or text into beautiful structured visual diagrams.",
  keywords: [
    "ai diagram generator",
    "free ai flowchart maker",
    "ai flowchart generator online",
    "sequence diagram generator ai",
    "er diagram maker ai",
    "class diagram generator",
    "ai mind map creator",
    "mermaid diagram generator",
    "ai timeline maker",
    "ai sankey diagram",
    "state diagram generator",
    "ai visual diagram tool",
    "free online diagram maker ai",
    "concept map generator ai",
  ],
  alternates: {
    canonical: "https://paperxify.com/ai-diagram",
  },
  openGraph: {
    title: "AI Diagram & Flowchart Generator | Free Visual Diagram Maker | Paperxify",
    description: "Create flowcharts, sequence diagrams, ER schemas, timelines, and 12+ visual diagram types instantly with AI. Free online diagram maker.",
    url: "https://paperxify.com/ai-diagram",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Diagram and Flowchart Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Diagram & Flowchart Generator | Free Visual Diagram Maker | Paperxify",
    description: "Turn any concept into a professional diagram — flowchart, ER schema, sequence, timeline, and more — in seconds with AI.",
    images: ["/og-image.jpg"],
  },
};

const diagramFaqs = [
  {
    question: "What types of diagrams can Paperxify AI generate?",
    answer: "Paperxify supports 12 diagram types: Flowchart, Sequence Diagram, Class Diagram, State Diagram, ER Diagram, User Journey Map, Pie Chart, Quadrant Chart, Timeline, Sankey Diagram, XY Line Chart, and Block Diagram. All are generated using structured Mermaid syntax for crisp, export-ready visuals.",
  },
  {
    question: "How do I create a flowchart with AI?",
    answer: "Select 'Flowchart' from the diagram type menu, describe your process or workflow in the input field, and click Generate. The AI maps out nodes, decision branches, and connection arrows automatically. You can then edit, export, or share the diagram.",
  },
  {
    question: "Can I generate ER diagrams for database design?",
    answer: "Yes. The AI ER Diagram Generator creates complete entity-relationship schemas with primary keys, foreign keys, table relationships, and cardinality annotations. Ideal for database architects, software engineers, and CS students.",
  },
  {
    question: "Are the generated diagrams editable?",
    answer: "Yes! All diagrams are rendered from editable Mermaid markup. You can modify the generated code to refine nodes, edges, labels, and styling. Pro users also get a live diagram editor with real-time preview.",
  },
  {
    question: "Can I export AI-generated diagrams as SVG or PNG?",
    answer: "Yes. Generated diagrams can be exported as high-resolution SVG or PNG files. Pro subscribers can also copy the raw Mermaid syntax to embed diagrams in Notion, GitHub READMEs, or other markdown environments.",
  },
];

export default function AIDiagramPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://paperxify.com/ai-diagram/#webapp",
        "name": "Paperxify AI Diagram Generator",
        "url": "https://paperxify.com/ai-diagram",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "description": "Best free AI diagram and flowchart generator. Create flowcharts, ER diagrams, sequence diagrams, timelines, and 12+ visual diagram types instantly from text descriptions.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "6840",
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
        "mainEntity": diagramFaqs.map((faq) => ({
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
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-cyan-950/50 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-emerald-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">

        {/* H1 SEO Target Title */}
        <h1 className="sr-only">Free AI Diagram, Flowchart & Visual Concept Map Generator | Paperxify</h1>

        {/* Dynamic Client Form Component */}
        <AIDiagramClient />

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">

          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>12-Type Visual Diagram Studio</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                AI-Powered <span className="text-cyan-400 bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-400">Flowcharts & Diagrams</span> from Any Text
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                Diagramming systems and processes manually is tedious. Paperxify's AI reads your description and instantly generates structured, professional-quality visual diagrams. From software architecture and database ER schemas to project timelines and user journeys — every diagram type is a single prompt away.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">12 Diagram Types</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Flowchart, Sequence, Class, ER, State, Journey, Timeline, Sankey, and more.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Editable Mermaid Code</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Edit the underlying diagram markup and export as SVG, PNG, or embed in Notion.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-emerald-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-cyan-400 text-cyan-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Highly Rated</span>
                </div>
                <blockquote className="text-sm text-neutral-300 italic font-light leading-relaxed">
                  "Generated a complete database ER schema from a plain English description in 8 seconds. Clean, accurate, and export-ready. Saved me an hour of draw.io work."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-xs">
                    DE
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Lukas Weber</div>
                    <div className="text-[10px] text-neutral-500">Engineering Student, TU Munich, DE</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Diagram Types Grid */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why engineers, students, and researchers globally choose Paperxify for AI diagram generation.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-cyan-400 bg-cyan-950/10">Paperxify AI Diagrams</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Draw.io / Lucidchart</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Diagramming</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">AI from Text Description</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-cyan-950/10 flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> Yes (Instant Generation)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Manual Only</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Manual Only</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">12 Supported Diagram Types</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-cyan-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (All Types)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Many types, manual setup</TableCell>
                      <TableCell className="p-5 text-neutral-500">Depends on skill</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Export as SVG / PNG</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-cyan-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Both Formats)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Yes (Paid plans)</TableCell>
                      <TableCell className="p-5 text-neutral-500">Screenshot only</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Notion / GitHub Embed</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-cyan-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Mermaid Syntax)
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
          <FAQAccordion faqs={diagramFaqs} />

          {/* Section 5: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-950/5 pointer-events-none" />
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Best Free AI Diagram Generator</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              Visualize any system, process, or concept as a professional diagram in seconds. Type your description and generate now.
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Generate Diagram Now <ArrowRight size={14} />
              </Link>
            </div>
          </section>

        </div>
        <Footer />
      </main>
    </div>
  );
}
