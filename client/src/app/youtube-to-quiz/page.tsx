import React from "react";
import type { Metadata } from "next";
import YouTubeToQuizClient from "./YouTubeToQuizClient";
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
  Zap, 
  Sparkles, 
  BookOpen, 
  Brain, 
  Download, 
  HelpCircle, 
  Trophy, 
  Star, 
  Globe, 
  MessageSquare,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Footer from "@/components/Footer";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "YouTube to Quiz AI | Convert YouTube Video to Practice Test | Paperxify",
  description: "Turn YouTube links into interactive practice tests and quizzes instantly. Paperxify is the ultimate free AI YouTube quiz maker, generating MCQs, Fill-in-the-blanks, and step-by-step explanation keys.",
  keywords: [
    "youtube to quiz ai",
    "youtube practice test maker",
    "convert youtube to practice test",
    "ai quiz generator from youtube link",
    "youtube video to quiz",
    "youtube question maker",
    "mcq generator from video",
    "notegpt alternative quiz",
    "mock exam builder youtube",
    "free ai practice tests maker"
  ],
  alternates: {
    canonical: "https://paperxify.com/youtube-to-quiz",
  },
  openGraph: {
    title: "YouTube to Quiz AI | Convert YouTube Video to Practice Test | Paperxify",
    description: "Convert YouTube videos to custom practice tests instantly. The best free AI quiz builder and exam generator for students.",
    url: "https://paperxify.com/youtube-to-quiz",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YouTube Link to Quiz AI Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to Quiz AI | Convert YouTube Video to Practice Test | Paperxify",
    description: "Transform any YouTube lecture into a custom interactive quiz. Test your understanding instantly with AI explanation keys.",
    images: ["/og-image.jpg"],
  }
};

const quizFaqs = [
  {
    question: "How to convert a YouTube video to a practice test using AI?",
    answer: "Simply paste your video link into the Paperxify quiz maker. Select your test format (MCQ, Fill in the blanks, MSQ, NAT, or a mixed master set) and click 'Generate'. The AI analyzes the transcript and constructs a full practice test with detailed keys in seconds."
  },
  {
    question: "What types of test questions are supported?",
    answer: "We support multiple formats: Single Choice (MCQ), Fill in the Blanks, Multiple Select (MSQ), Numerical Value (NAT), and a Master Mix that combines all formats for comprehensive exam prep."
  },
  {
    question: "Are explanation keys and step-by-step solutions included?",
    answer: "Yes! Every practice test generated includes a toggleable explanation key so you can see exactly why an answer is correct, helping you learn actively and prepare for exams."
  },
  {
    question: "Is there a limit to video length for quiz generation?",
    answer: "Free tier users can generate quizzes from lectures up to 30 minutes long. Pro and Power subscribers can process technical, complex lectures up to 12 hours long."
  },
  {
    question: "Can I save, share, or print the generated mock exams?",
    answer: "Absolutely. All generated quizzes are saved to your personal library. You can print them, share link access, or export them in print-ready PDF formats."
  }
];

export default function YouTubeToQuizPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://paperxify.com/youtube-to-quiz/#webapp",
        "name": "Paperxify YouTube to Quiz AI",
        "url": "https://paperxify.com/youtube-to-quiz",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Best free AI YouTube quiz maker. Convert any YouTube video link to practice tests, MCQs, and custom exams with explanation keys.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "8930"
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
        "mainEntity": quizFaqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
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

      {/* Main Content Dashboard */}
      <main className="relative z-10 w-full flex flex-col items-center">
        
        {/* H1 SEO Target Title */}
        <h1 className="sr-only">Free AI YouTube Video to Practice Test & Quiz Generator | Paperxify</h1>
        
        {/* Dynamic Client Form Component */}
        <YouTubeToQuizClient />

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">
          
          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Active Recall Exam Builder</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                AI-Powered <span className="text-red-500 bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">YouTube Practice Test</span> Maker
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                Re-reading notes is passive. Test your understanding actively. Paperxify scans transcripts and builds interactive practice exams in seconds. Choose from multiple choice (MCQs), fill in the blanks, multiple select (MSQs), or numerical answer tests (NAT) with comprehensive solutions.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-500/15 border border-red-500/30 text-red-500 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Multiple Question Types</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Select MCQ, MSQ, NAT, Fill-in-the-blanks, or a custom combination.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explanation Keys</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Every question includes a complete description of why the answer is correct.</p>
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
                  "The NAT (Numerical Answer Type) questions this generated from my physics lectures matched the style of my actual college exams. Highly recommend the Mix format!"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold text-red-400 text-xs">
                    CA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Lucas Reynolds</div>
                    <div className="text-[10px] text-neutral-500">Physics Undergraduate, Toronto, CA</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Feature Matrix */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and researchers globally choose Paperxify for generating custom quizzes.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-red-500 bg-red-950/10">Paperxify Quiz Maker</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Standard Q&A Generators</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Mock Tests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Advanced Question Types (NAT/MSQ)</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10 flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> Yes (Supported)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Simple MCQ Only</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Detailed Explanatory Keys</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Step-by-Step solutions)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Only correct/incorrect states</TableCell>
                      <TableCell className="p-5 text-neutral-500">Manual search required</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Interactive Quiz Interface</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Reveal Answers UI)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Plain Text</TableCell>
                      <TableCell className="p-5 text-neutral-500">Paper-based only</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Printable PDF Export</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Formatted layouts)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Raw Markdown Only</TableCell>
                      <TableCell className="p-5 text-neutral-500">Manual compilation</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>

          {/* Section 4: Country-Targeted User Feedback Carousel */}
          <TestimonialsCarousel />

          {/* Section 5: Rich Q&A / FAQ Section */}
          <FAQAccordion faqs={quizFaqs} />

          {/* Section 6: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-red-950/5 pointer-events-none" />
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Best AI YouTube Quiz Generator</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              Synthesize custom practice exams directly from your courses. Paste your link below and test your recall.
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Generate Quiz Now <ArrowRight size={14} />
              </Link>
            </div>
          </section>
          
        </div>
        <Footer/>
      </main>
    </div>
  );
}
