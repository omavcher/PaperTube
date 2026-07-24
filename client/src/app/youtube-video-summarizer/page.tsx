import React from "react";
import type { Metadata } from "next";
import YouTubeVideoSummarizerClient from "@/components/seo/YouTubeVideoSummarizerClient";

export const metadata: Metadata = {
  title: "YouTube Video Summarizer — Get the Full Gist in Seconds",
  description: "Paste any YouTube link and get a real summary — not just three bullet points. Free account, then summary, notes, flashcards & quiz from one video.",
  keywords: [
    "youtube video summarizer",
    "video summarizer ai",
    "youtube summarizer",
    "ai video summary",
    "summarize youtube video",
    "youtube to summary",
    "paperxify"
  ],
  alternates: {
    canonical: "https://paperxify.com/youtube-video-summarizer",
  },
  openGraph: {
    title: "YouTube Video Summarizer — Get the Full Gist in Seconds",
    description: "Paste any YouTube link and get a real summary — not just three bullet points. Free account, then summary, notes, flashcards & quiz from one video.",
    url: "https://paperxify.com/youtube-video-summarizer",
    type: "website",
  }
};

export default function YouTubeVideoSummarizerPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do I need to sign up to summarize a video?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes — it's one free account, no card required. In exchange, your summary, notes, flashcards, and quiz are saved and linked together instead of living only in one browser tab."
        }
      },
      {
        "@type": "Question",
        "name": "How long can the video be?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "There's no hard length cap. Full lectures, multi-hour talks, and long crash courses are exactly what the tool is built to handle."
        }
      },
      {
        "@type": "Question",
        "name": "Is the summary just bullet points, or a real summary?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It's a full paragraph-level summary that follows the structure of the video, not a flattened bullet list."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get flashcards and a quiz from the same video, or do I need a separate tool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Same video, same pass — flashcards and a quiz generate from the same transcript as the summary, no re-uploading anywhere else."
        }
      },
      {
        "@type": "Question",
        "name": "Does it work on videos in languages other than English?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Paperxify supports videos in over 50 languages including Spanish, French, German, Hindi, Japanese, and Mandarin, generating accurate structured summaries in your chosen target language."
        }
      }
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Paperxify YouTube Video Summarizer",
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
      "ratingCount": "1250"
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
      <YouTubeVideoSummarizerClient />
    </>
  );
}
