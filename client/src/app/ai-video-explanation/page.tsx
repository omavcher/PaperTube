import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AIVideoExplanationStudio } from "@/components/narration/AIVideoExplanationStudio";

export const metadata: Metadata = {
  title: "AI Video Explanation Studio | Sarvam AI Bulbul V3 Voiceover | Paperxify",
  description:
    "Generate production-ready educational video explanations from diagrams and images with synchronized Sarvam Bulbul V3 neural voiceover narration.",
  keywords: [
    "AI video explanation",
    "Sarvam AI Bulbul V3",
    "Text to speech narration",
    "synchronized animation voiceover",
    "visual explanation generator",
    "Paperxify"
  ]
};

export default function AIVideoExplanationPage() {
  return (
    <main className="min-h-screen bg-[#07070a] text-white flex flex-col justify-between selection:bg-violet-500 selection:text-white">
      <Navbar />
      <div className="flex-1 pt-20 sm:pt-24 pb-16">
        <AIVideoExplanationStudio />
      </div>
      <Footer />
    </main>
  );
}
