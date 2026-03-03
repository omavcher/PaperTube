import type { Metadata } from "next";
import HomeMain from "@/components/HomeMain";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Engineering YouTube Notes | AI PDF Converter - Paperxify",
  description: "Convert 3-hour engineering YouTube lectures and complex tutorials into structured PDF notes instantly. Perfect for engineering students and developers.",
  keywords: [
    "engineering youtube notes",
    "youtube to notes for engineering",
    "convert engineering lecture to pdf",
    "best ai for engineering students"
  ]
};

export default function EngineeringPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-2 bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        
        {/* Simplified SEO Hero specific to this landing page */}
        <section className="w-full max-w-5xl mx-auto pt-16 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md mb-6 shadow-lg">
             ⚡ Specifically optimized for Engineering & Tech Contexts
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6">Complex Engineering YouTube Notes, Simplified.</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
            Don't waste time pausing and typing out equations or code snippets. Let our AI extract and format your engineering lectures directly from YouTube.
          </p>
        </section>

        {/* Bring in the core component so they can use it immediately */}
        <HomeMain />
        
        {/* Additional value section for engineers */}
        <section className="w-full max-w-5xl mx-auto py-16 px-4 border-t border-white/10 mt-10">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Engineering Students use Paperxify</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-6 bg-neutral-900 border border-white/10 rounded-2xl">
                <h3 className="text-lg font-bold mb-2">Equation Recognition</h3>
                <p className="text-sm text-neutral-400">Our advanced Bhasha-Setu model captures complex mathematical contexts from transcripts for accurate notes.</p>
             </div>
             <div className="p-6 bg-neutral-900 border border-white/10 rounded-2xl">
                <h3 className="text-lg font-bold mb-2">Code Snippet Extraction</h3>
                <p className="text-sm text-neutral-400">Programming tutorials are summarized with formatted code blocks, saving you hours of manual copying.</p>
             </div>
             <div className="p-6 bg-neutral-900 border border-white/10 rounded-2xl">
                <h3 className="text-lg font-bold mb-2">Structure & Hierarchy</h3>
                <p className="text-sm text-neutral-400">Lengthy 3-hour MIT or NPTEL lectures are automatically broken down into digestible sections.</p>
             </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
