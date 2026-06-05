import React from "react";
import type { Metadata } from "next";
import AIPPTClient from "./AIPPTClient";

export const metadata: Metadata = {
  title: "AI PPT Presentation Generator: Free AI Slide Maker | Paperxify",
  description: "Create stunning presentations instantly using AI. Best free AI PPT presentation generator. Generate styled slide structures, layout templates, speaker notes, and export to clean PPTX or PDF.",
  keywords: ["ai ppt generator", "ai presentation maker", "free ai slides", "convert text to ppt", "ai ppt maker", "ai powerpoint maker", "ai slide deck maker"],
  alternates: {
    canonical: "https://paperxify.com/presentation-generator",
  }
};

export default function AIPPTHomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-orange-950/50 relative overflow-hidden">
      {/* Background Atmosphere - Premium Orange Glow Theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-10 w-[400px] h-[400px] bg-amber-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full">
        <AIPPTClient />
      </main>
    </div>
  );
}
