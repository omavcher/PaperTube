import React from "react";
import type { Metadata } from "next";
import YouTubeToFlashcardsClient from "./YouTubeToFlashcardsClient";
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
  title: "YouTube to Flashcards AI | Convert YouTube Video to Flashcards | Paperxify",
  description: "Turn YouTube links into interactive study flashcards instantly. Paperxify is the ultimate free AI YouTube flashcard generator, creating active recall question decks with spaced repetition review cycles.",
  keywords: [
    "youtube to flashcards ai",
    "convert youtube to study cards",
    "ai flashcards from youtube video",
    "youtube video to flashcards",
    "youtube flashcard generator",
    "ai flashcard maker",
    "spaced repetition flashcards youtube",
    "active recall generator from video link",
    "notegpt alternative flashcards",
    "convert video lectures to flashcards",
    "free ai flashcards maker youtube"
  ],
  alternates: {
    canonical: "https://paperxify.com/youtube-to-flashcards",
  },
  openGraph: {
    title: "YouTube to Flashcards AI | Convert YouTube Video to Flashcards | Paperxify",
    description: "Convert YouTube videos to interactive study card decks instantly. The best free AI active recall flashcards generator for students.",
    url: "https://paperxify.com/youtube-to-flashcards",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YouTube Link to Flashcards AI Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to Flashcards AI | Convert YouTube Video to Flashcards | Paperxify",
    description: "Transform any YouTube lecture into interactive digital flashcards instantly. Boost active recall and retention.",
    images: ["/og-image.jpg"],
  }
};

const flashcardFaqs = [
  {
    question: "How to convert a YouTube video to flashcards using AI?",
    answer: "Simply paste the video link into Paperxify's YouTube to Flashcards AI. Select the number of cards you want to generate and click 'Generate'. The AI will analyze the transcript and synthesize active recall Q&A flashcard decks in seconds."
  },
  {
    question: "How many flashcards can I generate per video?",
    answer: "Free tier users can generate up to 5 flashcards per video. Pro and Power subscribers can customize their decks and generate up to 30 highly detailed study cards per video."
  },
  {
    question: "Does the generator support multiple languages?",
    answer: "Yes, Paperxify's AI supports transcript extraction and card formatting for English, German, Spanish, French, Japanese, and Arabic."
  },
  {
    question: "Can I edit the generated flashcard questions and answers?",
    answer: "Yes! Once generated, you can view your deck, edit specific cards, add custom questions, delete unnecessary items, and organize them into folders in your personal library."
  },
  {
    question: "Can I export these flashcards to Notion or Anki?",
    answer: "Yes, Pro and Power users can sync their flashcard decks directly to their Notion workspace or download print-ready formats to keep their study workflows integrated."
  }
];

export default function YouTubeToFlashcardsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://paperxify.com/youtube-to-flashcards/#webapp",
        "name": "Paperxify YouTube to Flashcards AI",
        "url": "https://paperxify.com/youtube-to-flashcards",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Best free AI YouTube flashcard maker. Convert any YouTube video link to digital flashcards and printable study card decks instantly. Supports active recall study modes.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "9850"
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
        "mainEntity": flashcardFaqs.map(faq => ({
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
        <h1 className="sr-only">Free AI YouTube Video to Flashcard Deck Generator | Paperxify</h1>
        
        {/* Dynamic Client Form Component */}
        <YouTubeToFlashcardsClient />

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">
          
          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Spaced Repetition Card Deck Builder</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                AI-Powered <span className="text-red-500 bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">YouTube Flashcards</span> Generator
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                Manually writing flashcards is a chore. Let AI synthesize active recall question and answer card decks for you in seconds. Perfect for technical subjects, medical terms, code syntax, or language vocabulary. Study with our built-in spaced repetition scheduler or export directly to Notion.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-500/15 border border-red-500/30 text-red-500 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Custom Decks</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Generate customized deck sizes and edit any question-answer pair.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Spaced Repetition</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Built-in study flows ensure you review cards at optimal intervals.</p>
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
                  "Converting long programming tutorials into flashcard decks saved me so much preparation time. I can test myself on syntax and concepts directly on the platform."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold text-red-400 text-xs">
                    US
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Sophia Martinez</div>
                    <div className="text-[10px] text-neutral-500">Computer Science Student, Austin, US</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Feature Matrix */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and researchers globally choose Paperxify for generating active recall flashcards.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-red-500 bg-red-950/10">Paperxify Flashcards</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Standard Generators</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Anki Entry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Instant AI Q&A Extraction</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10 flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> Yes (Under 10 Seconds)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Slow Parser</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Manual Writing</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Spaced Repetition Scheduler</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Automated Cycles)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Static Lists Only</TableCell>
                      <TableCell className="p-5 text-neutral-500">Yes (Hard configuration)</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Interactive Flipping UI</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Premium Glassmorphic UI)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> Basic Text Q&A</TableCell>
                      <TableCell className="p-5 text-neutral-500">Simple Gray Cards</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Direct Notion Sync</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-red-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Notion Sync Integration
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>

          {/* Section 4: Country-Targeted User Feedback Carousel */}
          <TestimonialsCarousel />

          {/* Section 5: Rich Q&A / FAQ Section */}
          <FAQAccordion faqs={flashcardFaqs} />

          {/* Section 6: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-red-950/5 pointer-events-none" />
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Best AI YouTube Flashcard Maker</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              Study smarter with digital memory cards automatically compiled from your lecture videos. Paste a link to get started now.
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Generate Flashcards Now <ArrowRight size={14} />
              </Link>
            </div>
          </section>
          
        </div>
        <Footer/>
      </main>
    </div>
  );
}
