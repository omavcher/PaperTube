import type { Metadata } from "next";
import HomeMain from "@/components/HomeMain";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "YouTube Tutorial to Code Notes AI for Developers | Paperxify",
  description: "Summarize detailed coding tutorials into quick reference guides. Paperxify extracts code snippets and architecture explanations from YouTube videos.",
  keywords: [
    "youtube coding tutorial to notes",
    "developer ai tools",
    "youtube transcript to code snippets",
    "ai for software engineers"
  ]
};

export default function DevelopersPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-2 bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        
        <section className="w-full max-w-5xl mx-auto pt-16 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/50 text-[10px] font-bold uppercase tracking-widest text-green-400 backdrop-blur-md mb-6 shadow-lg">
             💻 Focus on Building, Not Pausing
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6">Code Faster with AI Notes.</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
            Summarize detailed coding tutorials into quick reference guides. Extract commands, code blocks, and system designs directly from tech talks and tutorials.
          </p>
        </section>

        <HomeMain />

      </main>
      <Footer />
    </div>
  );
}
