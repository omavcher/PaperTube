"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Youtube, Sparkles, Zap, Check, X, ChevronDown, 
  ArrowRight, BookOpen, FileText, Brain, GraduationCap, 
  HelpCircle, ShieldCheck, Play, Layers, CheckCircle2,
  Lock, ExternalLink
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function YouTubeVideoSummarizerClient() {
  const [videoUrl, setVideoUrl] = useState("");
  const [activeDemoTab, setActiveDemoTab] = useState<"summary" | "notes" | "flashcards" | "quiz">("summary");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const router = useRouter();

  const handleSummarize = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      router.push(`/youtube-to-notes?url=${encodeURIComponent(videoUrl.trim())}`);
    } else {
      router.push("/youtube-to-notes");
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Do I need to sign up to summarize a video?",
      a: "Yes — it's one free account, no card required. In exchange, your summary, notes, flashcards, and quiz are saved and linked together instead of living only in one browser tab."
    },
    {
      q: "How long can the video be?",
      a: "There's no hard length cap. Full lectures, multi-hour talks, and long crash courses are exactly what the tool is built to handle."
    },
    {
      q: "Is the summary just bullet points, or a real summary?",
      a: "It's a full paragraph-level summary that follows the structure of the video, not a flattened bullet list."
    },
    {
      q: "Can I get flashcards and a quiz from the same video, or do I need a separate tool?",
      a: "Same video, same pass — flashcards and a quiz generate from the same transcript as the summary, no re-uploading anywhere else."
    },
    {
      q: "Does it work on videos in languages other than English?",
      a: "Yes! Paperxify supports videos in over 50 languages including Spanish, French, German, Hindi, Japanese, and Mandarin, generating accurate structured summaries in your chosen target language."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-900/50 relative overflow-hidden">
      {/* Background Glows & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-red-950/15 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[45%] right-10 w-[500px] h-[500px] bg-red-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Navigation */}
      <div className="relative z-50">
        <Navbar hideMobile={false} />
      </div>

      <main className="relative z-10 w-full flex flex-col items-center pt-28 sm:pt-36 pb-20">
        
        {/* ============================================================ */}
        {/* HERO SECTION (2-Column)                                      */}
        {/* ============================================================ */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headline + Subhead + Input Box */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest shadow-inner">
                <Sparkles size={14} className="animate-pulse text-red-500" />
                <span>AI-Powered Video Summarizer</span>
              </div>

              {/* H1 */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white">
                YouTube Video Summarizer That Doesn't Stop at{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.4)]">
                  "Here Are 3 Key Points"
                </span>
              </h1>

              {/* Subhead */}
              <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed max-w-2xl">
                Paste a link. Get a summary that actually explains what the video covered — plus notes, flashcards, and a quiz built from the same transcript. Free to start.
              </p>

              {/* HERO INPUT BOX */}
              <div className="pt-2 max-w-xl">
                <form onSubmit={handleSummarize} className="space-y-3">
                  <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-neutral-900/90 border border-white/15 rounded-2xl sm:rounded-full shadow-2xl backdrop-blur-xl focus-within:border-red-500/60 transition-all">
                    <div className="flex items-center pl-3 sm:pl-4 pr-1 text-neutral-400 shrink-0">
                      <Youtube className="w-5 h-5 text-red-500" />
                    </div>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Paste a YouTube link here..."
                      className="w-full bg-transparent text-white text-sm placeholder:text-neutral-500 focus:outline-none px-2 py-2 sm:py-3"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-black font-black uppercase text-xs tracking-wider rounded-xl sm:rounded-full hover:bg-neutral-200 transition-all active:scale-95 shadow-lg shrink-0 whitespace-nowrap"
                    >
                      <span>Summarize It</span>
                      <Zap size={14} className="fill-black" />
                    </button>
                  </div>
                </form>

                {/* Microcopy under input */}
                <p className="text-xs text-neutral-400 mt-3 flex items-center gap-1.5 pl-2 font-medium">
                  <Lock size={12} className="text-red-400 shrink-0" />
                  <span>Takes one free account, 30 seconds — then it's yours for every video after.</span>
                </p>
              </div>
            </div>

            {/* Right Column: Live Product Preview / Interactive GIF-style Demo */}
            <div className="lg:col-span-5">
              <div className="relative border border-white/10 rounded-3xl bg-neutral-950/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header bar of mock UI */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="text-[11px] font-mono text-neutral-500 ml-2">Paperxify Video Engine</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                    Live Demo
                  </span>
                </div>

                {/* Mock Video Info */}
                <div className="flex items-center gap-3 p-3 bg-neutral-900/70 rounded-2xl border border-white/5 mb-4">
                  <div className="w-16 h-10 bg-neutral-800 rounded-xl relative overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 to-neutral-900" />
                    <Play size={14} className="text-white fill-white relative z-10" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">Neural Networks &amp; Deep Learning Explained</p>
                    <p className="text-[10px] text-neutral-400">Duration: 42m 15s • Stanford CS231n</p>
                  </div>
                </div>

                {/* Tabs for demo */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-900 rounded-xl mb-4 border border-white/5 text-[10px] font-bold">
                  <button
                    onClick={() => setActiveDemoTab("summary")}
                    className={`py-1.5 rounded-lg transition-all ${activeDemoTab === "summary" ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"}`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveDemoTab("notes")}
                    className={`py-1.5 rounded-lg transition-all ${activeDemoTab === "notes" ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"}`}
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => setActiveDemoTab("flashcards")}
                    className={`py-1.5 rounded-lg transition-all ${activeDemoTab === "flashcards" ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"}`}
                  >
                    Flashcards
                  </button>
                  <button
                    onClick={() => setActiveDemoTab("quiz")}
                    className={`py-1.5 rounded-lg transition-all ${activeDemoTab === "quiz" ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"}`}
                  >
                    Quiz
                  </button>
                </div>

                {/* Tab Content Display */}
                <div className="p-4 bg-neutral-900/50 rounded-2xl border border-white/5 min-h-[190px] text-xs text-neutral-300 leading-relaxed font-sans">
                  {activeDemoTab === "summary" && (
                    <div className="space-y-2">
                      <p className="font-bold text-white text-xs flex items-center gap-1.5">
                        <FileText size={12} className="text-red-400" /> Full Paragraph Summary:
                      </p>
                      <p className="text-[11px] text-neutral-300">
                        Input vectors pass through weighted nodes to compute activation values. A cost function evaluates output error against target labels, which backpropagation then optimizes layer-by-layer using chain rule calculus.
                      </p>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Structure Preserved: 100%</span>
                        <span className="text-green-400 font-bold">Generated in 12s</span>
                      </div>
                    </div>
                  )}

                  {activeDemoTab === "notes" && (
                    <div className="space-y-2">
                      <p className="font-bold text-white text-xs flex items-center gap-1.5">
                        <BookOpen size={12} className="text-red-400" /> Structured Notes Deck:
                      </p>
                      <ul className="space-y-1 text-[11px] text-neutral-300">
                        <li className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">•</span>
                          <span><strong>1. Forward Pass:</strong> Matrix multiplications apply weights &amp; bias terms.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">•</span>
                          <span><strong>2. Loss Function:</strong> Mean Squared Error measures loss score.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">•</span>
                          <span><strong>3. Backprop:</strong> Partial derivatives adjust weights systematically.</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {activeDemoTab === "flashcards" && (
                    <div className="space-y-2">
                      <p className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Brain size={12} className="text-red-400" /> Flashcard 1 of 8:
                      </p>
                      <div className="p-3 bg-neutral-950 rounded-xl border border-white/10 text-[11px]">
                        <p className="text-red-400 font-bold mb-1">Q: What role does backpropagation play?</p>
                        <p className="text-neutral-300">A: It calculates error gradients layer by layer to adjust weights and minimize overall cost.</p>
                      </div>
                    </div>
                  )}

                  {activeDemoTab === "quiz" && (
                    <div className="space-y-2">
                      <p className="font-bold text-white text-xs flex items-center gap-1.5">
                        <GraduationCap size={12} className="text-red-400" /> Practice Quiz (1 of 5):
                      </p>
                      <p className="text-[11px] font-medium text-white">How are weights updated during training?</p>
                      <div className="space-y-1 text-[10px]">
                        <div className="p-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 font-bold flex items-center justify-between">
                          <span>✓ Using partial derivatives via gradient descent</span>
                          <span>Correct</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-neutral-950 border border-white/5 text-neutral-400">
                          <span>✕ By setting random noise values</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-neutral-400">All 4 study assets generated automatically</span>
                  <Link href="/youtube-to-notes" className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
                    Try Now <ArrowRight size={10} />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* TRUST BAR (thin strip right under hero)                       */}
        {/* ============================================================ */}
        <div className="w-full border-y border-white/10 bg-neutral-950/80 backdrop-blur-md py-4 mb-20">
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <p className="text-xs sm:text-sm font-bold text-neutral-200">
                Trusted by <span className="text-white font-black">500,000+ students</span> turning long videos into study material they actually use
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-xs text-neutral-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> 10M+ Summaries Generated
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> 4.9/5 Rating
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2 — "What You Actually Get"                          */}
        {/* ============================================================ */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-24 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              A Summary Is the Starting Point, Not the Whole Product
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed">
              Most "video summarizer" tools give you one thing: three to five bullet points and a "thanks, bye." That's fine if you just want to know whether a video's worth watching. It's not fine if you're actually trying to learn the material.
            </p>
            <p className="text-xs sm:text-sm font-bold text-red-400 uppercase tracking-wider">
              Here's what comes out of the same video, in the same pass:
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Card 1 */}
            <div className="p-7 border border-white/10 rounded-3xl bg-neutral-950/60 backdrop-blur-md hover:border-red-500/40 transition-all duration-300 group space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Full Summary</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                A real paragraph-level summary that keeps the structure of the video intact — not just the loudest three moments, the actual order the ideas were explained in.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 border border-white/10 rounded-3xl bg-neutral-950/60 backdrop-blur-md hover:border-red-500/40 transition-all duration-300 group space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Structured Notes</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                The summary expands into organized notes with headers and sub-points, so you're not stuck turning three bullets into a real study guide yourself.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 border border-white/10 rounded-3xl bg-neutral-950/60 backdrop-blur-md hover:border-red-500/40 transition-all duration-300 group space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Flashcards</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                The same content, turned into a flashcard deck automatically — no retyping anything into a separate app.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-7 border border-white/10 rounded-3xl bg-neutral-950/60 backdrop-blur-md hover:border-red-500/40 transition-all duration-300 group space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Quiz</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                A short quiz pulled from the video, so you can check in thirty seconds whether the summary actually stuck.
              </p>
            </div>

          </div>

        </section>

        {/* ============================================================ */}
        {/* SECTION 3 — "How It Works"                                   */}
        {/* ============================================================ */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              From Link to Summary in Three Steps
            </h2>
            <p className="text-sm text-neutral-400 font-light">
              Designed for speed, built for actual learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="p-7 border border-white/10 rounded-3xl bg-neutral-950/50 relative overflow-hidden space-y-4">
              <div className="text-3xl font-black text-red-500 opacity-80">01</div>
              <h3 className="text-lg font-bold text-white">Paste the link</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                Any public YouTube video — a lecture, a crash course, a three-hour conference talk. Length isn't the limiting factor here.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 border border-white/10 rounded-3xl bg-neutral-950/50 relative overflow-hidden space-y-4">
              <div className="text-3xl font-black text-red-500 opacity-80">02</div>
              <h3 className="text-lg font-bold text-white">Create a free account</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                This is the one extra step compared to a no-signup tool, and it's what makes the rest of this possible — your summary, notes, flashcards, and quiz all live in one place afterward, instead of disappearing the moment you close the tab.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 border border-white/10 rounded-3xl bg-neutral-950/50 relative overflow-hidden space-y-4">
              <div className="text-3xl font-black text-red-500 opacity-80">03</div>
              <h3 className="text-lg font-bold text-white">Get everything, not just the summary</h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                Your summary generates first. Notes, flashcards, and a quiz follow from the same transcript — ready to actually study from, not just skim once and forget.
              </p>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4 — Live Example (before/after)                      */}
        {/* ============================================================ */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              What the Difference Actually Looks Like
            </h2>
            <p className="text-sm text-neutral-400 font-light">
              Comparing standard 3-bullet output vs. Paperxify's rich study synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left: Typical summarizer output */}
            <div className="p-7 border border-red-500/20 rounded-3xl bg-neutral-950/80 space-y-4 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider mb-4 border border-red-500/20">
                  <X size={14} /> Typical Summarizer Output
                </div>
                <blockquote className="text-xs sm:text-sm text-neutral-300 italic font-mono leading-relaxed bg-neutral-900/80 p-5 rounded-2xl border border-white/5">
                  "This video covers neural networks. Key points: 1) Inputs feed into nodes. 2) Cost functions measure error. 3) Backpropagation adjusts weights."
                </blockquote>
              </div>
              <p className="text-xs text-neutral-400 pt-4 border-t border-white/5">
                ❌ Shallow 3-bullet summary with no context, missing mathematical steps, and zero study tools.
              </p>
            </div>

            {/* Right: What Paperxify gives you */}
            <div className="p-7 border border-emerald-500/30 rounded-3xl bg-neutral-950/90 shadow-2xl relative space-y-4 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
                  <Check size={14} /> What Paperxify Gives You From the Same Video
                </div>
                <blockquote className="text-xs sm:text-sm text-neutral-100 font-sans leading-relaxed bg-neutral-900/90 p-5 rounded-2xl border border-emerald-500/20">
                  A full walkthrough of how input data moves through nodes to produce a cost function, how that error signal gets measured, and how backpropagation uses chained derivatives to adjust weights layer by layer — plus 8 flashcards on the key terms and a 5-question quiz to check you actually followed the chain from input to weight update.
                </blockquote>
              </div>
              <p className="text-xs text-emerald-400 font-medium pt-4 border-t border-white/10 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Deep paragraph summary, structured textbook notes, interactive flashcards, &amp; practice quiz.
              </p>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 5 — Comparison Table vs. "no-signup" summarizer tools */}
        {/* ============================================================ */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-24 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Quick Summary vs. Full Summarizer — Which Do You Actually Need?
            </h2>
          </div>

          {/* Comparison Table */}
          <div className="border border-white/10 rounded-3xl bg-neutral-950/70 backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-neutral-900/50">
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Feature</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">No-signup summarizer tools</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-red-500 bg-red-950/20">Paperxify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Get a quick summary</td>
                    <td className="p-5 text-neutral-300">Yes, instantly</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10">Yes, after free signup</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Works on long lectures (1hr+)</td>
                    <td className="p-5 text-neutral-400">Often struggles or cuts off</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10">Built to hold structure across the full video</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Notes generated from the summary</td>
                    <td className="p-5 text-neutral-400"><X size={16} className="text-red-500 inline mr-1" /> No</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1" /> Yes, automatically</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Flashcards from the same video</td>
                    <td className="p-5 text-neutral-400"><X size={16} className="text-red-500 inline mr-1" /> No</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1" /> Yes, automatically</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Quiz to test recall</td>
                    <td className="p-5 text-neutral-400"><X size={16} className="text-red-500 inline mr-1" /> No</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10"><Check size={16} className="text-green-500 inline mr-1" /> Yes, automatically</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-200">Where it's saved</td>
                    <td className="p-5 text-neutral-400">Nowhere — copy it before you close the tab</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10">Saved to your account</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Honest line under table */}
          <div className="p-5 border border-white/10 rounded-2xl bg-neutral-900/60 text-center max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
              If all you need is a 10-second gist of a 5-minute video, a no-signup tool is genuinely fine for that. If you're actually going to study from the video, the free account pays for itself on the first lecture.
            </p>
          </div>

        </section>

        {/* ============================================================ */}
        {/* SECTION 6 — FAQ (Accordion)                                  */}
        {/* ============================================================ */}
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-24 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle size={14} /> FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-white/10 rounded-2xl bg-neutral-950/60 backdrop-blur-md overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform ${openFaqIndex === idx ? "rotate-180 text-red-500" : "text-neutral-500"}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-400 font-light leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 7 — Final CTA Band                                   */}
        {/* ============================================================ */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="p-10 sm:p-14 border border-white/15 rounded-[2.5rem] bg-gradient-to-b from-neutral-950 via-neutral-900/90 to-neutral-950 text-center space-y-6 relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
              Stop Rewatching Videos to Remember What They Said
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto font-light leading-relaxed">
              Paste any YouTube video link to generate structured paragraph summaries, study notes, flashcard decks, and practice quizzes in seconds.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/youtube-to-notes" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-2xl"
              >
                <span>Summarize Your First Video Free</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* INTERNAL LINKS FOOTER STRIP                                  */}
        {/* ============================================================ */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-8 border-t border-white/5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 text-center">
            Explore Related YouTube &amp; Study Tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400">
            <Link href="/youtube-to-notes" className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
              turn the same video into full study notes
            </Link>
            <span>•</span>
            <Link href="/notegpt-alternative" className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
              see how this compares to NoteGPT
            </Link>
            <span>•</span>
            <Link href="/pricing" className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
              Paperxify Plans &amp; Pricing
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
