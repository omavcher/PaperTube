import type { Metadata } from "next";
import HomeClient from "../HomeClient";

export const metadata: Metadata = {
  title: "Paperxify US | YouTube to Notes AI & YouTube Video Summarizer",
  description: "Convert YouTube videos to study notes instantly in the United States. Paperxify is the best free AI YouTube note taker, video summarizer, and NoteGPT alternative for American college students at Stanford, MIT, Harvard, and beyond.",
  keywords: [
    "youtube to notes ai us",
    "ai youtube note taker united states",
    "youtube video note taker us",
    "ai notes from youtube",
    "notegpt alternative us",
    "mindgrasp alternative america",
    "best ai youtube summarizer us",
    "youtube transcript to notes",
    "turn youtube into notes"
  ],
  alternates: {
    canonical: "https://paperxify.com/us",
  },
  openGraph: {
    title: "Paperxify US | AI YouTube Notes Maker & YT Video Summarizer",
    description: "Paste a YT link to notes instantly. The best free AI notes tool and NoteGPT alternative in the United States.",
    url: "https://paperxify.com/us",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YT Link to Notes AI US",
      },
    ],
  },
};

export default function USPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Paperxify US YouTube to Notes AI",
        "url": "https://paperxify.com/us",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "The best free AI tool to take notes from youtube in the US. Convert YouTube videos into structured study notes, flashcards, and summaries instantly.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "8420"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How to convert youtube video to notes using AI in the US?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To convert a YouTube video to notes, paste the link on Paperxify. The AI transcribes and organizes it into study notes and flashcards."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a free AI tool to take notes from youtube in America?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Paperxify is a free AI YouTube note-taking tool available to students and professionals across the United States."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
