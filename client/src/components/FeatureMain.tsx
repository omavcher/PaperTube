"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export default function FeatureMain() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-200 font-sans">
        Explore What Makes <span className="text-[#da3023]">PaperTube</span> Special
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

/* -------------------- FEATURE CONTENT -------------------- */
const FeatureOne = () => (
  <div className="bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
    <p className="text-neutral-300 text-base md:text-2xl font-sans max-w-3xl mx-auto">
      <span className="font-bold text-neutral-100">
        Turn YouTube Lectures into Smart Notes.
      </span>{" "}
      Paste any YouTube video link and let PaperTube extract key moments, timestamps, and summaries — 
      all beautifully organized into a clickable, colorful PDF. Perfect for students, creators, or anyone learning online.
    </p>
    <img
      src="https://assets.aceternity.com/macbook.png"
      alt="YouTube lecture to notes feature preview"
      height="500"
      width="500"
      className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
    />
  </div>
);

const FeatureTwo = () => (
  <div className="bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
    <p className="text-neutral-300 text-base md:text-2xl font-sans max-w-3xl mx-auto">
      <span className="font-bold text-neutral-100">
        AI Highlights & Key Topics.
      </span>{" "}
      Our AI scans every video and auto-detects the most important points, questions, and topic shifts. 
      No more rewatching! Just glance through the structured summary to revise faster.
    </p>
    <img
      src="https://assets.aceternity.com/macbook.png"
      alt="AI-generated highlights feature preview"
      height="500"
      width="500"
      className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
    />
  </div>
);

const FeatureThree = () => (
  <div className="bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
    <p className="text-neutral-300 text-base md:text-2xl font-sans max-w-3xl mx-auto">
      <span className="font-bold text-neutral-100">
        Beautiful PDF Exports.
      </span>{" "}
      Notes are not just functional — they're aesthetic. PaperTube designs your notes in vibrant themes and clean layouts, 
      ready to print or share instantly. Perfect for those who love organized, eye-catching study material.
    </p>
    <img
      src="https://assets.aceternity.com/macbook.png"
      alt="Beautiful PDF design feature preview"
      height="500"
      width="500"
      className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
    />
  </div>
);

const FeatureFour = () => (
  <div className="bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
    <p className="text-neutral-300 text-base md:text-2xl font-sans max-w-3xl mx-auto">
      <span className="font-bold text-neutral-100">
        Time-Stamped Learning Flow.
      </span>{" "}
      Each section in your PDF is synced with the original YouTube timestamp — click and jump straight to that part of the video. 
      Study smarter, not harder.
    </p>
    <img
      src="https://assets.aceternity.com/macbook.png"
      alt="Clickable timestamp feature preview"
      height="500"
      width="500"
      className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
    />
  </div>
);

const FeatureFive = () => (
  <div className="bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
    <p className="text-neutral-300 text-base md:text-2xl font-sans max-w-3xl mx-auto">
      <span className="font-bold text-neutral-100">
        Multi-Language Support.
      </span>{" "}
      PaperTube understands lectures in Hindi, English, Marathi, and more. Learn in your comfort language, 
      and still get clean notes — perfectly translated and formatted.
    </p>
    <img
      src="https://assets.aceternity.com/macbook.png"
      alt="Multi-language note feature preview"
      height="500"
      width="500"
      className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
    />
  </div>
);

/* -------------------- DATA FOR CARDS -------------------- */
const data = [
  {
    category: "Video to Notes",
    title: "Turn YouTube Lectures into Notes Instantly",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop",
    content: <FeatureOne />,
  },
  {
    category: "AI Summaries",
    title: "Smartly Summarized with AI",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop",
    content: <FeatureTwo />,
  },
  {
    category: "PDF Export",
    title: "Generate Beautiful PDFs",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop",
    content: <FeatureThree />,
  },
  {
    category: "Clickable Learning",
    title: "Jump to Topics with Timestamps",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop",
    content: <FeatureFour />,
  },
  {
    category: "Localization",
    title: "Learn in Your Own Language",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop",
    content: <FeatureFive />,
  },
];