import React, { Suspense } from "react";
import type { Metadata } from "next";
import AIStudyClient from "./AIStudyClient";
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
  Brain,
  Calculator,
} from "lucide-react";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI Study Suite | AI Homework Helper, Math Solver, Exam Planner & Language Tutor | Paperxify",
  description: "Your all-in-one AI study companion. Get step-by-step homework help, solve complex math equations, build personalized exam prep schedules, and practice language skills with AI. Free for students in the US, UK, AU, CA, and DE.",
  keywords: [
    "ai homework helper",
    "ai math solver",
    "step by step math calculator",
    "exam prep planner ai",
    "ai study planner",
    "ai language tutor",
    "free homework solver online",
    "ai study room",
    "personalized study schedule ai",
    "revision planner generator",
    "ai tutor online free",
    "algebra solver step by step",
    "calculus ai solver",
    "language practice ai",
    "ai exam scheduler",
  ],
  alternates: {
    canonical: "https://paperxify.com/ai-study",
  },
  openGraph: {
    title: "AI Study Suite | Homework Helper, Math Solver, Exam Planner & Language Tutor | Paperxify",
    description: "Get instant AI homework help, solve math problems step-by-step, plan your exam schedule, and tutor languages — all free on Paperxify.",
    url: "https://paperxify.com/ai-study",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Study Suite — Homework Helper, Math Solver, Exam Planner, Language Tutor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Study Suite | Homework Helper, Math Solver & Exam Planner | Paperxify",
    description: "Solve homework, ace math, plan exams, and practice languages with your free AI study companion from Paperxify.",
    images: ["/og-image.jpg"],
  },
};

const studyFaqs = [
  {
    question: "What study tools are included in the Paperxify AI Study Suite?",
    answer: "The AI Study Suite includes four specialized tools: AI Homework Helper (instant step-by-step guidance on any subject), AI Math Solver (algebra, calculus, and equations with LaTeX formatting), Exam Prep Planner (personalized week-by-week revision calendars), and AI Language Tutor (conversational grammar practice and vocabulary coaching).",
  },
  {
    question: "How does the AI Homework Helper work?",
    answer: "Paste your homework question or problem into the AI Homework Helper. The AI provides a detailed, step-by-step explanation covering the concept, working method, and final answer. It can handle subjects including mathematics, physics, chemistry, biology, history, economics, and computer science.",
  },
  {
    question: "Can the AI Math Solver handle calculus and advanced equations?",
    answer: "Yes. Paperxify's AI Math Solver handles algebra, pre-calculus, calculus (derivatives and integrals), linear algebra, discrete mathematics, and statistics. All solutions are presented in LaTeX-formatted steps so you can follow the exact working process and learn from it.",
  },
  {
    question: "How does the Exam Prep Planner generate my study schedule?",
    answer: "Input your exam date, the subjects you need to cover, your daily available study hours, and any specific weak areas. The AI generates a day-by-day revision calendar with topic assignments, practice test slots, and spaced repetition review cycles to maximize your retention before the exam.",
  },
  {
    question: "Which languages does the AI Language Tutor support?",
    answer: "The AI Language Tutor supports 20+ languages including Spanish, French, German, Mandarin, Japanese, Korean, Arabic, Portuguese, Italian, and more. It can generate vocabulary exercises, grammar explanations, conversational role-plays, and CEFR-aligned practice at A1 to C2 levels.",
  },
];

export default function AIStudyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://paperxify.com/ai-study/#webapp",
        "name": "Paperxify AI Study Suite",
        "url": "https://paperxify.com/ai-study",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "description": "Free all-in-one AI study toolkit: step-by-step homework helper, advanced math solver, personalized exam prep planner, and interactive language tutor for students globally.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "14320",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": studyFaqs.map((faq) => ({
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
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-pink-950/50 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-pink-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-purple-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">

        {/* H1 SEO Target Title */}
        <h1 className="sr-only">Free AI Study Suite: Homework Helper, Math Solver, Exam Planner & Language Tutor | Paperxify</h1>

        {/* Dynamic Client Form Component */}
        <Suspense fallback={<div className="min-h-[600px] flex items-center justify-center text-neutral-400">Loading study tool...</div>}>
          <AIStudyClient initialTool="homework-helper" />
        </Suspense>

        {/* --- Global Premium SEO Section --- */}
        <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">

          {/* Section 1: Detailed Introduction */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Personalized AI Study Companion</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                AI Homework, <span className="text-pink-400 bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400">Math Solver</span>, Exam Planner & Language Tutor
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
                Studying is hard. Paperxify's AI Study Suite makes it smarter. Get instant step-by-step homework guidance across every subject, solve complex math equations with full LaTeX working, generate a personalized exam revision calendar, and master new languages through interactive AI tutoring — all in one place.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-pink-500/15 border border-pink-500/30 text-pink-500 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">4 Study Tools in 1</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Homework Helper, Math Solver, Exam Planner, and Language Tutor — all integrated.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-pink-500/15 border border-pink-500/30 text-pink-400 rounded-lg mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step-by-Step Solutions</h4>
                    <p className="text-neutral-500 text-xs mt-0.5">Every answer includes full working — not just results. Learn the method, not just the answer.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
              <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-pink-400 text-pink-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Highly Rated</span>
                </div>
                <blockquote className="text-sm text-neutral-300 italic font-light leading-relaxed">
                  "The Exam Prep Planner built my entire 6-week revision schedule for finals in under 30 seconds. It even accounted for my weakest subjects and spaced them properly. Genuinely useful."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-pink-400 text-xs">
                    CA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Emily Tremblay</div>
                    <div className="text-[10px] text-neutral-500">Biology Sophomore, McGill University, CA</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Capabilities Comparison */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and academic professionals globally choose Paperxify as their AI study companion.</p>
            </div>

            <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-pink-400 bg-pink-950/10">Paperxify AI Study</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Khan Academy / Wolfram</TableHead>
                      <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Standard Tutoring Apps</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Multi-Subject Homework Help</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-pink-950/10 flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> Yes (All Subjects)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Math & Science only</TableCell>
                      <TableCell className="p-5 text-neutral-500">Per-subject apps</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">Personalized Exam Schedule</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-pink-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (AI-Tailored)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                      <TableCell className="p-5 text-neutral-500">Generic templates</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">LaTeX Math Solutions</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-pink-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (Full Working)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500">Wolfram only (limited)</TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-white/5 hover:bg-white/[0.01]">
                      <TableCell className="p-5 font-semibold text-neutral-200">AI Language Tutoring (20+ Languages)</TableCell>
                      <TableCell className="p-5 font-bold text-green-400 bg-pink-950/10">
                        <Check size={16} className="text-green-500 inline mr-1" /> Yes (CEFR-Aligned)
                      </TableCell>
                      <TableCell className="p-5 text-neutral-500"><X size={16} className="inline mr-1 text-red-500/60" /> None</TableCell>
                      <TableCell className="p-5 text-neutral-500">Duolingo (gamified only)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>

          {/* Section 3: Country-Targeted User Feedback Carousel */}
          <TestimonialsCarousel />

          {/* Section 4: Rich Q&A / FAQ Section */}
          <FAQAccordion faqs={studyFaqs} />

          {/* Section 5: Action Callout CTA */}
          <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-pink-950/5 pointer-events-none" />
            <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-2xl w-fit mx-auto animate-bounce">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Your Complete AI Study Companion</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
              Solve homework, master math, build your exam schedule, and practice languages — all powered by AI and completely free to start.
            </p>
            <div className="pt-2">
              <Link href="#search-form" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Start Studying Now <ArrowRight size={14} />
              </Link>
            </div>
          </section>

        </div>
        <Footer />
      </main>
    </div>
  );
}
