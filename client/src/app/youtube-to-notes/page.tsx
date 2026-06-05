import React from "react";
import type { Metadata } from "next";
import YouTubeToNotesClient from "./YouTubeToNotesClient";

export const metadata: Metadata = {
  title: "YouTube to Notes AI: Convert YouTube Video to Notes | Paperxify",
  description: "Turn YouTube videos into notes instantly. Best free AI YouTube video to notes note taker. Generate styled PDF summaries, study guides, and flashcards.",
  keywords: ["youtube to notes", "youtube video to notes", "youtube notes generator", "ai youtube notes", "video to notes ai"],
  alternates: {
    canonical: "https://paperxify.com/youtube-to-notes",
  }
};

export default function YouTubeToNotesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-red-900/50 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-10 w-[400px] h-[400px] bg-purple-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content Dashboard */}
      <main className="relative z-10 w-full">
        <YouTubeToNotesClient />
      </main>
    </div>
  );
}
