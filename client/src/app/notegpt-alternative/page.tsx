import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Zap, Cpu, Sparkles, BookOpen, Brain, Download, HelpCircle, Trophy } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "NoteGPT Alternative: Best AI YouTube Note Taker | Paperxify",
  description: "Looking for a free NoteGPT alternative? Compare Paperxify vs NoteGPT on pricing, PDF export quality, video duration limits, and visual study tools.",
  keywords: ["notegpt alternative", "youtube to notes ai", "ai study notes", "youtube summarizer", "notegpt vs paperxify"],
  alternates: {
    canonical: "https://paperxify.com/notegpt-alternative",
  }
};

export default function NoteGPTAlternativePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-900/50 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] right-10 w-[400px] h-[400px] bg-purple-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Embedded Simple Nav */}
      <div className="relative z-50">
        <Navbar hideMobile={true} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        
        {/* --- Hero --- */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <Sparkles size={12} className="text-white" />
            <span>Competitive Analysis</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">
            The Ultimate <span className="text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]">NoteGPT</span> Alternative
          </h1>
          
          <p className="text-base sm:text-lg text-neutral-400 font-light leading-relaxed">
            NoteGPT limits you with simple bullet-point summaries. Discover why students are switching to Paperxify for textbook-quality structured notes, flashcard generation, and rich visual layouts.
          </p>
          
          <div className="pt-4 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5">
              Get Started for Free <Zap size={14} className="fill-black" />
            </Link>
          </div>
        </div>

        {/* --- Comparison Table --- */}
        <div className="mb-28">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-8 text-center">
            Feature Comparison Matrix
          </h2>

          <div className="border border-white/10 rounded-3xl bg-neutral-950/50 backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-neutral-900/30">
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Features</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-red-500 bg-red-950/10">Paperxify</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">NoteGPT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  <tr>
                    <td className="p-5 font-medium text-neutral-300">Monthly Pricing</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10">$9 / month (Pro)</td>
                    <td className="p-5 text-neutral-400">$9.99 / month (Standard)</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-300">Max Video Duration</td>
                    <td className="p-5 font-bold text-green-400 bg-red-950/10">Up to 12 Hours (Power)</td>
                    <td className="p-5 text-neutral-400">Strictly Limited</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-300">Structured Textbook PDF</td>
                    <td className="p-5 bg-red-950/10"><Check size={18} className="text-green-500 inline mr-2" /> Fully Formatted</td>
                    <td className="p-5 text-neutral-400"><X size={18} className="text-red-500 inline mr-2" /> Basic Summary Markdown</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-300">Visual Layout with Images</td>
                    <td className="p-5 bg-red-950/10"><Check size={18} className="text-green-500 inline mr-2" /> Canvas (Curated Images)</td>
                    <td className="p-5 text-neutral-400"><X size={18} className="text-red-500 inline mr-2" /> Text Only</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-300">Deep Chapters Analysis</td>
                    <td className="p-5 bg-red-950/10"><Check size={18} className="text-green-500 inline mr-2" /> Atlas (Long Video Spec)</td>
                    <td className="p-5 text-neutral-400"><X size={18} className="text-red-500 inline mr-2" /> Out of Memory on Long Videos</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-300">Interactive Quiz Engine</td>
                    <td className="p-5 bg-red-950/10"><Check size={18} className="text-green-500 inline mr-2" /> Yes (Reveal Answers)</td>
                    <td className="p-5 text-neutral-400"><X size={18} className="text-red-500 inline mr-2" /> Not Integrated</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-300">Coding Problem Solver</td>
                    <td className="p-5 bg-red-950/10"><Check size={18} className="text-green-500 inline mr-2" /> Yes</td>
                    <td className="p-5 text-neutral-400"><X size={18} className="text-red-500 inline mr-2" /> No</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-neutral-300">No Signup Trial</td>
                    <td className="p-5 bg-red-950/10"><Check size={18} className="text-green-500 inline mr-2" /> Yes (Flash Free model)</td>
                    <td className="p-5 text-neutral-400"><X size={18} className="text-red-500 inline mr-2" /> Required Immediately</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- Value Proposition --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-28">
          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-900/30 backdrop-blur-sm space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl w-fit">
              <BookOpen size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Curated Visual Notes</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Paperxify's Canvas model dynamically fetches and embeds context-aware diagrams, illustrations, and photos so you can visualize concepts while reading transcripts.
            </p>
          </div>

          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-900/30 backdrop-blur-sm space-y-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-2xl w-fit">
              <Brain size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Full Syllabus Coverage</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              With support for up to 12 hours of video input in our Power plan, you can turn complete crash courses, playlists, and study workshops into integrated checklists.
            </p>
          </div>

          <div className="p-8 border border-white/10 rounded-3xl bg-neutral-900/30 backdrop-blur-sm space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl w-fit">
              <Download size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Clean PDF Exports</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Generate academic textbook-quality, styled PDFs. Free tier contains subtle watermarks while premium tiers enjoy completely clean, white-labeled, vector-ready documents.
            </p>
          </div>
        </div>

        {/* --- FAQ / Micro Callout --- */}
        <div className="text-center space-y-6 max-w-2xl mx-auto p-10 border border-white/10 rounded-[2.5rem] bg-gradient-to-b from-neutral-950 to-neutral-900/40 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-red-950/5 pointer-events-none" />
          <h3 className="text-2xl font-bold text-white">Ready to Study Smarter?</h3>
          <p className="text-sm text-neutral-400">
            Paste a link and try it right now. No signup required for your first summary. Experience the modern interface.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all">
            Summarize Video Now <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
