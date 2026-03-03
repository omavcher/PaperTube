import type { Metadata } from "next";
import HomeMain from "@/components/HomeMain";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Best AI YouTube to Notes for Engineering Students | Paperxify",
  description: "Convert 3-hour YouTube lectures to PDF notes seamlessly. Paperxify helps students save time, extract intelligence, and generate structured study guides directly from videos.",
  keywords: [
    "youtube to notes for students",
    "ai study notes from youtube",
    "convert youtube lectures",
    "best ai for engineering students"
  ]
};

export default function StudentsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-2 bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        
        <section className="w-full max-w-5xl mx-auto pt-16 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/50 text-[10px] font-bold uppercase tracking-widest text-blue-400 backdrop-blur-md mb-6 shadow-lg">
             🎓 Optimize Your Study Time
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6">Best AI YouTube to Notes for Students.</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
            Convert 3-hour YouTube lectures to PDF notes seamlessly. No more pausing, rewinding, and typing. Let AI generate your study materials instantly.
          </p>
        </section>

        <HomeMain />

      </main>
      <Footer />
    </div>
  );
}
