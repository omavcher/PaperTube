import type { Metadata } from "next";
import HomeClient from "./HomeClient";

// Specific, high-impact SEO for the core feature: YouTube Video Link to Notes Converter.
export const metadata: Metadata = {
  title: "Best YouTube Video to Notes Converter & PDF Extractor | Paperxify",
  description: "Convert any YouTube video link to PDF notes INSTANTLY. The #1 AI YouTube to Notes Converter. Extract summaries, flashcards, and transcripts seamlessly.",
  keywords: [
    "YouTube to PDF",
    "youtube video link to notes converter",
    "convert youtube video to notes",
    "YouTube to notes",
    "AI note taker",
    "video summarizer ai",
    "AI study guide maker",
    "video to text",
    "Paperxify app",
    "youtube transcript to notes",
    "auto generate notes from youtube"
  ],
  alternates: {
    canonical: "https://paperxify.com",
  },
  openGraph: {
    title: "Best YouTube Video to Notes Converter | Paperxify",
    description: "Paste a YouTube video link and convert it to structured PDF notes using Paperxify AI. Free, fast, and highly accurate.",
    url: "https://paperxify.com",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YouTube Video Link to Notes Converter AI",
      },
    ],
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Paperxify YouTube to Notes Converter",
    "operatingSystem": "All",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "description": "Convert YouTube videos to comprehensive study notes, flashcards, and PDFs using advanced AI. Paste the video link and get notes instantly.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "8420"
    }
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
