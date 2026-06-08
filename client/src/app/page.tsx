import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { reviews } from "@/data/reviews";

// Specific, high-impact SEO for the core feature: YouTube Video Link to Notes Converter.
export const metadata: Metadata = {
  title: "Paperxify | YouTube to Notes AI & AI YouTube Note Taker",
  description: "Convert YouTube videos to study notes instantly. Paperxify is the best free AI YouTube note taker, video summarizer, and NoteGPT alternative for students.",
  keywords: [
    "youtube to notes ai",
    "ai youtube note taker",
    "youtube video note taker",
    "ai notes from youtube",
    "youtube notes generator",
    "ai youtube notes",
    "youtube transcript to notes",
    "turn youtube into notes",
    "youtube summarizer ai",
    "ai video note taker",
    "youtube ai notes generator",
    "free ai youtube note taker",
    "youtube lecture notes ai",
    "paste youtube link get notes",
    "ai notes for youtube lectures",
    "youtube study notes ai",
    "notegpt alternative",
    "mindgrasp alternative",
    "best ai youtube summarizer",
    "youtube to notes ai for students"
  ],
  alternates: {
    canonical: "https://paperxify.com",
  },
  openGraph: {
    title: "Paperxify | AI Notes Maker & YouTube Notes Generator",
    description: "Paste a YT link to notes instantly. The best AI notes tool and NoteGPT alternative for generating structured YouTube notes and PDFs.",
    url: "https://paperxify.com",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YT Link to Notes AI Converter",
      },
    ],
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Paperxify YouTube to Notes AI",
        "url": "https://paperxify.com",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "The best free AI tool to take notes from youtube. Convert YouTube videos into structured study notes, flashcards, and summaries instantly.",
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
            "name": "How to convert youtube video to notes using AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To convert a YouTube video to notes, simply paste the YouTube link into Paperxify's AI generator. The AI will instantly transcribe, summarize, and format the lecture into structured study notes and bullet points."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a free AI tool to take notes from youtube?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Paperxify offers a free AI tool to summarize YouTube videos into notes. You can generate notes from YouTube lectures with no signup required for basic access."
            }
          },
          {
            "@type": "Question",
            "name": "What is the best AI to summarize youtube videos for students?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Paperxify is ranked as the best AI to summarize YouTube videos for students. It generates AI YouTube notes with timestamps, flashcards, and structured PDFs ideal for exam prep."
            }
          },
          {
            "@type": "Question",
            "name": "How does Paperxify compare in Notegpt vs Mindgrasp vs Paperxify?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Paperxify serves as the ultimate free NoteGPT alternative and Mindgrasp alternative. It provides accurate video-to-text AI extraction, YouTube transcript generation, and complex study guides specifically tailored for technical and engineering students, making it a better value."
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

