import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { reviews } from "@/data/reviews";

// Specific, high-impact SEO for the core feature: YouTube Video Link to Notes Converter.
export const metadata: Metadata = {
  title: "Paperxify — #1 AI Notes Maker | YouTube to AI Notes & AI PDF Generator",
  description: "The best free AI notes maker for YouTube. Convert any YT video to AI notes, generate AI PDFs, and create study flashcards in seconds. Trusted by 500,000+ students as the top YouTube AI notes generator & NoteGPT alternative.",
  keywords: [
    "ai notes maker",
    "yt to ai notes",
    "ai notes making",
    "ai pdf generator",
    "youtube ai notes generator",
    "ai note maker from youtube",
    "ai pdf notes generator",
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
    title: "Paperxify — #1 AI Notes Maker | YouTube to AI Notes & AI PDF Generator",
    description: "Paste any YT link to instantly make AI notes & export AI PDFs. The best free AI notes maker and YouTube AI notes generator — trusted by 500,000+ students.",
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
        "name": "Paperxify — #1 AI Notes Maker & YouTube AI Notes Generator",
        "url": "https://paperxify.com",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "The best free AI notes maker for YouTube. Convert any YT link to AI notes, generate AI PDFs, and create flashcards in under 15 seconds. Trusted by 500,000+ students.",
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
            "name": "What is the best AI notes maker for YouTube videos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Paperxify is the #1 free AI notes maker for YouTube. It automatically converts any YT video link into structured AI notes, flashcards, and mind maps in under 15 seconds. Unlike ChatGPT or general AI tools, Paperxify's AI notes making pipeline is purpose-built for student study workflows with academic formatting, LaTeX math support, and AI PDF export."
            }
          },
          {
            "@type": "Question",
            "name": "Can I generate an AI PDF from a YouTube video for free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Paperxify includes a built-in AI PDF generator that converts your YouTube video into a print-ready, publication-quality PDF with headers, bullet points, LaTeX math formulas, and code blocks — completely free. Download it or push it to Notion in one click."
            }
          },
          {
            "@type": "Question",
            "name": "How to convert youtube video to notes using AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To convert a YouTube video to AI notes, simply paste the YouTube link into Paperxify's AI notes maker. The AI will instantly transcribe, summarize, and format the lecture into structured study notes and bullet points in under 15 seconds."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a free AI tool to take notes from youtube?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Paperxify offers a free AI notes maker that summarizes YouTube videos into structured notes. You can generate AI notes from YouTube lectures with no signup required for basic access."
            }
          },
          {
            "@type": "Question",
            "name": "What is the best AI to summarize youtube videos for students?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Paperxify is ranked as the best YouTube AI notes generator for students. It generates AI YouTube notes with timestamps, flashcards, AI PDFs, and structured study guides ideal for exam prep."
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

