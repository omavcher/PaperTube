import React, { Suspense } from "react";
import type { Metadata } from "next";
import AIStudyClient from "../AIStudyClient";
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
import { Check, Sparkles, Trophy, Star, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

// Per-tool SEO and content configuration
const TOOL_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
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
    tableRows: { feature: string; col2: string; col3: string; col4: string }[];
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
    ratingCount: string;
    faqs: { question: string; answer: string }[];
  }
> = {
  "homework-helper": {
    title: "AI Homework Helper | Get Step-by-Step Guidance on Any Subject | Paperxify",
    description: "Stuck on homework? Paperxify's free AI Homework Helper provides instant, detailed step-by-step explanations for any subject — math, science, history, economics, and more. Trusted by students in the US, UK, AU, CA, and DE.",
    keywords: ["ai homework helper", "homework solver online free", "step by step homework help", "ai tutor online", "free homework answers", "homework ai solver", "instant homework help", "ai study helper", "homework explainer ai", "online tutor free"],
    badge: "Instant AI Subject Tutor",
    h1: "Free AI Homework Helper — Step-by-Step Guidance on Any Subject | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Homework Helper",
    h2Rest: "with Step-by-Step Explanations",
    intro: "Every subject has that one concept that just won't click. Paperxify's AI Homework Helper gives you instant, detailed step-by-step explanations for any problem across mathematics, physics, chemistry, biology, computer science, economics, history, and more — not just the answer, but the full method so you can understand and replicate it.",
    feature1Title: "All Subjects Covered",
    feature1Desc: "Math, physics, chemistry, biology, CS, economics, history, English lit — every school subject supported.",
    feature2Title: "Step-by-Step Methods",
    feature2Desc: "Every answer shows the full working method so you learn the concept, not just the result.",
    testimonialQuote: "\"The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context.\"",
    testimonialAuthor: "James Sterling",
    testimonialMeta: "Economics Student, LSE, UK",
    testimonialFlag: "UK",
    tableCol2: "Paperxify Homework Helper",
    tableCol3: "Google Search",
    tableCol4: "Human Tutoring",
    tableRows: [
      { feature: "Instant Step-by-Step Explanation", col2: "Yes (Under 10 Seconds)", col3: "Manual search needed", col4: "Yes (Scheduled sessions)" },
      { feature: "All School Subjects", col2: "Yes (Universal coverage)", col3: "Varies by source", col4: "Per-subject tutors" },
      { feature: "Available 24/7", col2: "Yes (Always on)", col3: "Yes", col4: "No (Scheduled only)" },
      { feature: "Free to Use", col2: "Yes (Generous free tier)", col3: "Yes", col4: "Expensive hourly rates" },
    ],
    ctaTitle: "Your Free AI Homework Helper",
    ctaDesc: "Get instant step-by-step guidance on any homework problem across every subject. No scheduling, no waiting — just answers.",
    ctaBtn: "Get Homework Help Now",
    ratingCount: "13500",
    faqs: [
      { question: "What subjects can the AI Homework Helper solve?", answer: "Paperxify's AI Homework Helper covers all major school and university subjects: mathematics (algebra to calculus), physics, chemistry, biology, computer science, economics, history, geography, English literature and language, and foreign languages." },
      { question: "Does it just give answers or does it explain the working?", answer: "It always explains the full working method step by step. The goal is to help you understand the concept so you can solve similar problems independently, not just copy an answer." },
      { question: "Is the AI Homework Helper free?", answer: "Yes. The free tier gives you access to the homework helper without registration for general questions. Pro subscribers get priority processing, longer problem solving, and access to all study tools in the suite." },
      { question: "Can it help with university-level coursework?", answer: "Yes. The AI Homework Helper handles undergraduate-level content including calculus, organic chemistry, data structures, microeconomics, statistics, and more. It is particularly strong on technical STEM subjects." },
      { question: "Can I upload a photo of my homework problem?", answer: "Yes. Pro subscribers can upload images of handwritten or printed homework problems. The AI reads the problem from the image and provides a full step-by-step solution with explanation." },
    ],
  },
  "math-solver": {
    title: "AI Math Solver | Solve Algebra, Calculus & Advanced Math with Steps | Paperxify",
    description: "Solve complex math problems instantly with Paperxify's free AI Math Solver. Get full step-by-step solutions in LaTeX format for algebra, calculus, linear algebra, statistics, and discrete mathematics. Trusted by students in the US, UK, AU, CA, and DE.",
    keywords: ["ai math solver", "step by step math calculator", "algebra solver ai", "calculus solver online", "free math problem solver", "math ai helper", "latex math solver", "integral solver ai", "derivative calculator ai", "equation solver step by step"],
    badge: "Advanced LaTeX Math Engine",
    h1: "Free AI Math Solver — Algebra, Calculus & Advanced Math with Full Steps | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Math Solver",
    h2Rest: "with LaTeX Step-by-Step Solutions",
    intro: "Mathematics is the language of the universe — and Paperxify's AI Math Solver speaks it fluently. From high school algebra to university-level calculus, linear algebra, and discrete mathematics, the solver generates complete, step-by-step solutions formatted in clean LaTeX notation. Every step is explained, every formula justified, so you follow the full reasoning process.",
    feature1Title: "Full LaTeX Formatting",
    feature1Desc: "All solutions are rendered in proper LaTeX notation — perfect for academic reports and understanding working.",
    feature2Title: "Every Math Domain",
    feature2Desc: "Algebra, trigonometry, calculus, linear algebra, statistics, number theory, and discrete mathematics.",
    testimonialQuote: "\"The AI Math Solver solved a triple integral that my textbook glossed over in 3 seconds with full step-by-step LaTeX formatting. I finally understood integration by parts properly.\"",
    testimonialAuthor: "David Miller",
    testimonialMeta: "CS Major, Stanford University, US",
    testimonialFlag: "US",
    tableCol2: "Paperxify Math Solver",
    tableCol3: "Wolfram Alpha",
    tableCol4: "Manual Calculation",
    tableRows: [
      { feature: "Step-by-Step Working Shown", col2: "Yes (Full method explained)", col3: "Paid Pro only", col4: "Yes (Time-consuming)" },
      { feature: "LaTeX Output Formatting", col2: "Yes (Clean academic format)", col3: "Yes", col4: "Manual typesetting" },
      { feature: "Natural Language Input", col2: "Yes (Type or paste problems)", col3: "Partial (Syntax required)", col4: "Not applicable" },
      { feature: "Calculus & Advanced Math", col2: "Yes (All university levels)", col3: "Yes (Wolfram engine)", col4: "Depends on skill" },
    ],
    ctaTitle: "The Best Free AI Math Problem Solver",
    ctaDesc: "Paste your math problem and get a complete, step-by-step LaTeX solution in seconds. From basic algebra to multivariable calculus.",
    ctaBtn: "Solve Math Problem Now",
    ratingCount: "11200",
    faqs: [
      { question: "What types of math can the AI Math Solver handle?", answer: "Paperxify's Math Solver handles all major mathematics domains: arithmetic, algebra, quadratic equations, trigonometry, precalculus, calculus (derivatives, integrals, differential equations), linear algebra (matrices, eigenvalues), statistics, probability, and discrete mathematics." },
      { question: "Does it show the full working or just the final answer?", answer: "The solver always shows the complete step-by-step working process. Each step is presented in LaTeX notation with a brief explanation of which rule or theorem was applied. This helps you understand the method, not just memorize the answer." },
      { question: "Can I type math problems in plain English?", answer: "Yes. You can type natural language descriptions like 'find the derivative of x cubed plus 2x squared' and the AI understands and solves it. You can also paste LaTeX notation or handwrite problems (Pro tier image upload)." },
      { question: "Is the AI Math Solver accurate?", answer: "Paperxify's math solver achieves high accuracy on standard mathematical benchmarks. For complex multi-step problems, always verify key intermediate steps. The solver is particularly strong on algebraic manipulation, calculus, and linear algebra." },
      { question: "Can I use it for university exams preparation?", answer: "Yes. The math solver is an excellent exam prep tool. Use it to work through past paper problems, understand solution methods, and identify gaps in your understanding. Always solve problems yourself first, then compare your approach to the AI's solution." },
    ],
  },
  "exam-planner": {
    title: "AI Exam Prep Planner | Build Custom Study Schedules & Revision Calendars | Paperxify",
    description: "Create a personalized, week-by-week exam preparation schedule with AI. Paperxify's Exam Prep Planner generates custom study calendars based on your exam date, subjects, daily hours, and weak areas. Free for students globally.",
    keywords: ["exam prep planner ai", "ai study schedule creator", "revision calendar generator", "exam timetable maker ai", "personalized study plan", "study planner online free", "ai revision planner", "exam preparation tool", "week by week study plan", "revision schedule maker"],
    badge: "Personalized Exam Preparation Engine",
    h1: "Free AI Exam Prep Planner — Build Personalized Revision Schedules | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Exam Prep Planner",
    h2Rest: "for Personalized Week-by-Week Revision Calendars",
    intro: "Winging exam prep is a recipe for stress. Paperxify's AI Exam Prep Planner generates a structured, day-by-day revision schedule customized to your exam date, subjects, available daily study hours, and specific weak areas. The plan includes spaced repetition review cycles, practice test slots, and break scheduling to maximize your retention and reduce pre-exam anxiety.",
    feature1Title: "Fully Personalized Plans",
    feature1Desc: "Input your exam date, subjects, daily hours, and weak spots — get a precision revision calendar built for you.",
    feature2Title: "Spaced Repetition Built-In",
    feature2Desc: "Review cycles are automatically spaced using the Ebbinghaus forgetting curve for maximum long-term retention.",
    testimonialQuote: "\"The Exam Prep Planner built my entire 8-week schedule for finals in under a minute. It knew to front-load my weakest subjects and included revision slots two days before each exam. Elite tool.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager & Continuous Learner, Global",
    testimonialFlag: "GL",
    tableCol2: "Paperxify Exam Planner",
    tableCol3: "Google Calendar (Manual)",
    tableCol4: "Notion Templates",
    tableRows: [
      { feature: "AI-Personalized Schedule", col2: "Yes (Fully Tailored)", col3: "Manual entry required", col4: "Generic templates" },
      { feature: "Spaced Repetition Cycles", col2: "Yes (Automated)", col3: "No (Manual setup)", col4: "No (Manual)" },
      { feature: "Weak Subject Weighting", col2: "Yes (Priority allocation)", col3: "No", col4: "No" },
      { feature: "Multi-Subject Exam Support", col2: "Yes (Unlimited subjects)", col3: "Yes (Manual)", col4: "Yes (Manual)" },
    ],
    ctaTitle: "Build Your Perfect Exam Prep Schedule",
    ctaDesc: "Enter your exam date, subjects, and study hours. Get a complete, personalized day-by-day revision calendar in seconds.",
    ctaBtn: "Plan My Exam Prep Now",
    ratingCount: "8760",
    faqs: [
      { question: "How does the AI Exam Prep Planner generate my schedule?", answer: "Input your exam date(s), the subjects you need to cover, your available daily study hours, and any specific weak areas. The AI creates a day-by-day revision calendar that front-loads your weakest subjects, includes spaced review sessions, and builds in practice test blocks before the exam date." },
      { question: "Can I plan for multiple exams at different dates?", answer: "Yes. The planner supports multiple exam dates simultaneously. It creates an integrated schedule that balances study time across all subjects, prioritizing more urgent exams while maintaining progress on longer-timeline ones." },
      { question: "Does the planner include spaced repetition?", answer: "Yes. Paperxify's exam planner incorporates spaced repetition principles based on the Ebbinghaus forgetting curve. Topics you've studied are scheduled for review at scientifically optimal intervals — typically 1 day, 3 days, 7 days, and 14 days after initial study — to maximize long-term retention." },
      { question: "Can I export the study plan to Google Calendar or Notion?", answer: "Pro subscribers can export their exam prep plan as a structured Notion database or as an iCal file (.ics) for direct import into Google Calendar, Apple Calendar, or any calendar application." },
      { question: "Is the Exam Prep Planner free to use?", answer: "Yes. The free tier generates a complete exam prep plan instantly without registration. Pro subscribers get additional features including multi-exam integrated scheduling, calendar export, and integration with their Paperxify flashcard and practice test libraries." },
    ],
  },
  "language-tutor": {
    title: "AI Language Tutor | Practice Conversations, Grammar & Vocabulary | Paperxify",
    description: "Accelerate language learning with Paperxify's free AI Language Tutor. Practice conversational grammar, vocabulary building, and pronunciation exercises in 20+ languages from Spanish to Japanese, aligned to CEFR A1–C2 levels.",
    keywords: ["ai language tutor", "learn language online free", "ai spanish tutor", "conversational ai language practice", "grammar coach ai", "ai japanese tutor", "language learning ai", "cefr language practice", "vocabulary builder ai", "ai french tutor"],
    badge: "CEFR-Aligned AI Language Coach",
    h1: "Free AI Language Tutor — Practice Grammar, Vocabulary & Conversations | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Language Tutor",
    h2Rest: "for Grammar, Vocabulary & Conversational Practice",
    intro: "Language fluency comes from practice, not passive study. Paperxify's AI Language Tutor provides interactive grammar explanations, vocabulary coaching, and conversational role-plays tailored to your proficiency level across 20+ languages. Whether you're an A1 beginner or a C1 advanced learner, the AI adapts exercises to your CEFR level and learning goals.",
    feature1Title: "20+ Languages Supported",
    feature1Desc: "Spanish, French, German, Japanese, Mandarin, Korean, Arabic, Portuguese, Italian, and 15+ more.",
    feature2Title: "CEFR-Aligned Practice",
    feature2Desc: "Exercises adapt to your A1–C2 level with grammar drills, vocabulary sets, and conversation simulations.",
    testimonialQuote: "\"I use Paperxify's language tutor daily to practice German grammar ahead of my TELC exam. The conversational roleplays feel genuinely interactive and the corrections are accurate.\"",
    testimonialAuthor: "Lukas Weber",
    testimonialMeta: "Engineering Student, TU Munich, DE",
    testimonialFlag: "DE",
    tableCol2: "Paperxify Language Tutor",
    tableCol3: "Duolingo",
    tableCol4: "Human Tutor",
    tableRows: [
      { feature: "20+ Language Support", col2: "Yes (All major languages)", col3: "40+ (Gamified only)", col4: "Per-language only" },
      { feature: "CEFR-Aligned Exercises", col2: "Yes (A1 to C2)", col3: "Partial (No CEFR labels)", col4: "Yes (Expert-designed)" },
      { feature: "Grammar Explanations", col2: "Yes (Detailed rules + examples)", col3: "Minimal (Hints only)", col4: "Yes (Personalized)" },
      { feature: "Conversational Roleplay", col2: "Yes (Interactive AI dialogue)", col3: "Limited scripted dialogues", col4: "Yes (Human interaction)" },
    ],
    ctaTitle: "Start Learning with Your Free AI Language Tutor",
    ctaDesc: "Practice grammar, expand vocabulary, and simulate conversations in 20+ languages — adapted to your CEFR level. No subscription needed to start.",
    ctaBtn: "Start Language Practice Now",
    ratingCount: "9340",
    faqs: [
      { question: "Which languages does the AI Language Tutor support?", answer: "Paperxify's Language Tutor supports 20+ languages including Spanish, French, German, Mandarin Chinese, Japanese, Korean, Arabic, Portuguese (Brazilian and European), Italian, Russian, Dutch, Polish, Turkish, Hindi, Swedish, and more." },
      { question: "How does the tutor adapt to my language level?", answer: "At the start, you select your CEFR level (A1 Beginner to C2 Mastery) or take a short placement assessment. The AI then generates grammar exercises, vocabulary sets, and conversation scenarios calibrated to your level, progressively introducing harder content as you improve." },
      { question: "What types of language exercises are available?", answer: "The AI Language Tutor provides: vocabulary quizzes with contextual examples, grammar rule explanations with practice sentences, fill-in-the-blank conjugation drills, translation exercises, conversational role-play scenarios, and error correction on your written responses." },
      { question: "Can it help me prepare for language exams like IELTS, DELF, or JLPT?", answer: "Yes. The language tutor can be configured to focus on exam-specific content. For IELTS it generates academic writing tasks and listening comprehension exercises. For DELF/DALF it provides French-specific grammar and expression drills. For JLPT it covers kanji, grammar, and vocabulary by N-level." },
      { question: "Is the AI Language Tutor free?", answer: "Yes. The free tier provides access to basic vocabulary and grammar exercises in all supported languages. Pro subscribers get unlimited conversation roleplay sessions, exam prep modes, progress tracking across sessions, and personalized weak-area focus scheduling." },
    ],
  },
};

export function generateStaticParams() {
  return [
    { tool: "homework-helper" },
    { tool: "math-solver" },
    { tool: "exam-planner" },
    { tool: "language-tutor" },
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
      title: "AI Personal Study Suite: Learn Smarter | Paperxify",
      description: "Study smarter with AI. Solve math equations, plan exams, and tutor languages on a personalized study canvas.",
      keywords: ["ai study planner", "homework solver", "language practice ai", "personal study buddy"],
    };
  }
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: `https://paperxify.com/ai-study/${tool}`,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `https://paperxify.com/ai-study/${tool}`,
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

export default async function AIStudyToolPage({
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
            "@id": `https://paperxify.com/ai-study/${tool}/#webapp`,
            name: `Paperxify ${config.tableCol2}`,
            url: `https://paperxify.com/ai-study/${tool}`,
            operatingSystem: "All",
            applicationCategory: "EducationalApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: config.description,
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: config.ratingCount },
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
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-pink-950/50 relative overflow-hidden">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-pink-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-purple-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {config && <h1 className="sr-only">{config.h1}</h1>}

        {/* Dynamic Client Form Component */}
        <Suspense fallback={<div className="min-h-[600px] flex items-center justify-center text-neutral-400">Loading study tool...</div>}>
          <AIStudyClient initialTool={tool} />
        </Suspense>

        {config && (
          <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">

            {/* Section 1: Intro */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>{config.badge}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                  {config.h2} <span className="text-pink-400 bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400">{config.h2Accent}</span>{" "}
                  {config.h2Rest}
                </h2>
                <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">{config.intro}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-pink-500/15 border border-pink-500/30 text-pink-500 rounded-lg mt-0.5">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{config.feature1Title}</h4>
                      <p className="text-neutral-500 text-xs mt-0.5">{config.feature1Desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-pink-500/15 border border-pink-500/30 text-pink-400 rounded-lg mt-0.5">
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
                    {config.testimonialQuote}
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-pink-400 text-xs">
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
                <p className="text-neutral-400 text-xs sm:text-sm font-light">Why students and academic professionals globally choose Paperxify as their AI study companion.</p>
              </div>
              <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-pink-400 bg-pink-950/10">{config.tableCol2}</TableHead>
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">{config.tableCol3}</TableHead>
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">{config.tableCol4}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                      {config.tableRows.map((row, i) => (
                        <TableRow key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                          <TableCell className="p-5 font-semibold text-neutral-200">{row.feature}</TableCell>
                          <TableCell className="p-5 font-bold text-green-400 bg-pink-950/10">
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
              <div className="absolute inset-0 bg-pink-950/5 pointer-events-none" />
              <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-2xl w-fit mx-auto animate-bounce">
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
        <Footer />
      </main>
    </div>
  );
}
