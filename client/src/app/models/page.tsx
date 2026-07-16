import React from "react";
import type { Metadata } from "next";
import ModelsClient from "@/components/tools/ModelsClient";

export const metadata: Metadata = {
  title: "AI Synthesis Models & Engines Comparison | Paperxify",
  description: "Explore the different AI models powering Paperxify. Compare Flash (bullet notes), Scholar (textbook PDFs), Canvas (visual study cards), and Atlas (chapter playlist mapping) features and token specs.",
  keywords: [
    "ai study models",
    "paperxify model specs",
    "flash vs scholar notes ai",
    "canvas visual notes generator",
    "atlas course summarizer ai",
    "best ai models for note taking"
  ],
  alternates: {
    canonical: "https://paperxify.com/models",
  },
  openGraph: {
    title: "AI Synthesis Models & Engines Comparison | Paperxify",
    description: "Explore the different AI models powering Paperxify. Compare Flash, Scholar, Canvas, and Atlas features and token specs.",
    type: "website",
    url: "https://paperxify.com/models",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Synthesis Models Comparison",
    description: "Compare free vs premium note-taking AI engines.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Paperxify Neural Models Spec Matrix",
    "url": "https://paperxify.com/models",
    "description": "System architecture and capabilities matrix comparing different AI note-taking engines like Flash, Scholar, Canvas, and Atlas.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ModelsClient />
    </>
  );
}