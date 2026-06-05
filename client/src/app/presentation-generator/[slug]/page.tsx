import React from "react";
import type { Metadata } from "next";
import AIPPTViewer from "./AIPPTViewer";

export const metadata: Metadata = {
  title: "AI PPT Presentation Workspace | Paperxify",
  description: "View, present, and export your AI-generated slide presentation deck.",
  keywords: ["ai ppt generator", "ai presentation maker", "presentation workspace"],
};

export default function AIPPTViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-orange-950/50 relative overflow-hidden">
      {/* Background atmosphere orange glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <main className="relative z-10 w-full min-h-screen">
        <AIPPTViewer params={params} />
      </main>
    </div>
  );
}
