import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Cpu, Sparkles, BookOpen, Brain, Download, Play, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI Study Notes: AI-Powered Study Guides & Flashcards | Paperxify",
  description: "Make beautiful AI study notes automatically. Turn video lectures and code problems into Revision Guides, interactive quizzes, and structured PDF files.",
  keywords: ["ai study notes", "ai note taker", "study notes generator", "ai study guide maker", "convert lecture to notes ai"],
  alternates: {
    canonical: "https://paperxify.com/ai-study-notes",
  }
};

export default function AIStudyNotesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-900/50 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-10 w-[400px] h-[400px] bg-purple-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Navigation */}
      <div className="relative z-50">
        <Navbar hideMobile={true} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        
        {/* --- Hero --- */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <Sparkles size={12} className="text-white" />
            <span>Smart Education</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight text-white">
            Make High-Quality <span className="text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]">AI Study Notes</span> <br className="hidden sm:block" /> From Any Video Lecture
          </h1>
          
          <p className="text-base sm:text-lg text-neutral-400 font-light leading-relaxed">
            Paperxify is the ultimate companion for modern students. Combine the speed of AI with textbook-quality definitions, formulas, and structured layouts to ace your exams.
          </p>
          
          <div className="pt-4 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
              Generate AI Study Notes <Zap size={14} className="fill-black" />
            </Link>
          </div>
        </div>

        {/* --- Highlight Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-28">
          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-900/30 backdrop-blur-sm space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl w-fit">
              <Cpu size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">4 Specialized AI Architectures</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Choose the perfect output for your needs: **Flash** for speed revisions, **Canvas** for visual diagrams and images, **Scholar** for printing textbook PDFs, or **Atlas** for researching 12-hour crash courses.
            </p>
          </div>

          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-900/30 backdrop-blur-sm space-y-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-2xl w-fit">
              <Brain size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Integrated Spaced Repetition</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Don't just read. Generate flashcard decks and practice tests directly alongside your notes. Track your daily study streak to maximize your long-term memory retention.
            </p>
          </div>

          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-900/30 backdrop-blur-sm space-y-4 col-span-1 md:col-span-2">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Beautiful Layouts & Print-Ready PDF Files</h3>
                <p className="text-neutral-400 text-xs leading-relaxed max-w-xl">
                  Get white-labeled structured PDF exports with mathematical notation, code block syntax highlighting, and visual image blocks. Print them or export them to your favorite note-taking apps like Notion or GoodNotes.
                </p>
              </div>
              <Link href="/" className="px-6 py-3 bg-neutral-900 border border-white/10 hover:bg-neutral-800 transition-colors text-white font-bold uppercase tracking-wider text-xs rounded-xl shrink-0">
                Try it Free
              </Link>
            </div>
          </div>
        </div>

        {/* --- FAQ / CTA Banner --- */}
        <div className="text-center space-y-6 max-w-2xl mx-auto p-10 border border-white/10 rounded-[2.5rem] bg-gradient-to-b from-neutral-950 to-neutral-900/40 shadow-2xl">
          <h3 className="text-2xl font-bold text-white">Ready to Make Your First Study Guide?</h3>
          <p className="text-sm text-neutral-400">
            Join thousands of university and high school students who save up to 10 hours a week on study prep. Paste a link to start.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all">
            Start Generating <Zap size={14} className="fill-black" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
