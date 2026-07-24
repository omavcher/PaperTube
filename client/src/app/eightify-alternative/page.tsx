import React from "react";
import type { Metadata } from "next";
import EightifyAlternativeClient from "@/components/seo/EightifyAlternativeClient";

export const metadata: Metadata = {
  title: "Eightify Alternative: Best Free AI YouTube Summarizer | Paperxify",
  description: "Looking for a free Eightify alternative? Compare Paperxify vs Eightify on pricing, long video support, study notes, flashcards, and PDF export features.",
  keywords: [
    "eightify alternative",
    "free eightify alternative",
    "eightify chrome extension alternative",
    "eightify vs paperxify",
    "youtube video summarizer ai",
    "convert youtube to notes",
    "best youtube summarizer",
    "paperxify"
  ],
  alternates: {
    canonical: "https://paperxify.com/eightify-alternative",
  },
  openGraph: {
    title: "Eightify Alternative: Best Free AI YouTube Summarizer | Paperxify",
    description: "Looking for a free Eightify alternative? Compare Paperxify vs Eightify on pricing, video duration limits, and active recall study tools.",
    url: "https://paperxify.com/eightify-alternative",
    type: "website",
  }
};

export default function EightifyAlternativePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is Paperxify the best free alternative to Eightify?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eightify gives you short, 8-bullet summaries and restricts video lengths unless you pay. Paperxify gives you full paragraph-level summaries, structured study notes, active recall flashcards, practice quizzes, and clean PDF exports — all from a single video."
        }
      },
      {
        "@type": "Question",
        "name": "Does Paperxify work on long YouTube videos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! While Eightify struggles or cuts off on long content, Paperxify handles multi-hour lectures, crash courses, and long workshops across all plans."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need a credit card to start using Paperxify?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No credit card required! You get a free account to test out summaries, notes, flashcards, and quizzes on your videos."
        }
      },
      {
        "@type": "Question",
        "name": "Can I export my generated summaries to PDF or Notion?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Paperxify allows 1-click vector PDF downloads with LaTeX formatting, as well as Notion-compatible markdown exports."
        }
      }
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Paperxify - Eightify Alternative",
    "operatingSystem": "Web",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1480"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <EightifyAlternativeClient />
    </>
  );
}
