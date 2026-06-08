import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "Paperxify EU | YouTube to Notes AI & YouTube Video Summarizer",
  description: "Convert YouTube videos to study notes instantly in Europe. Paperxify is the best free AI YouTube note taker, video summarizer, and NoteGPT alternative for European students at top universities.",
  keywords: [
    "youtube to notes ai eu",
    "ai youtube note taker europe",
    "youtube video note taker eu",
    "ai notes from youtube",
    "notegpt alternative eu",
    "mindgrasp alternative europe",
    "best ai youtube summarizer eu",
    "youtube transcript to notes",
    "turn youtube into notes"
  ],
  alternates: {
    canonical: "https://paperxify.com/eu",
  },
  openGraph: {
    title: "Paperxify EU | AI YouTube Notes Maker & YT Video Summarizer",
    description: "Paste a YT link to notes instantly. The best free AI notes tool and NoteGPT alternative in Europe.",
    url: "https://paperxify.com/eu",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YT Link to Notes AI EU",
      },
    ],
  },
};

export default function EUPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Paperxify EU YouTube to Notes AI",
        "url": "https://paperxify.com/eu",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR"
        },
        "description": "The best free AI tool to take notes from youtube in Europe. Convert YouTube videos into structured study notes, flashcards, and summaries instantly.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "8420"
        },
        "review": reviews.map(r => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": r.name
          },
          "datePublished": r.datePublished,
          "reviewBody": r.quote,
          "reviewRating": {
            "@type": "Rating",
            "bestRating": "5",
            "ratingValue": r.ratingValue,
            "worstRating": "1"
          }
        }))
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How to convert youtube video to notes using AI in Europe?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To convert a YouTube video to notes, paste the link on Paperxify. The AI transcribes and organizes it into study notes and flashcards."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a free AI tool to take notes from youtube in Europe?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Paperxify is a free AI YouTube note-taking tool available to students and professionals across Europe."
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

