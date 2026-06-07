import type { Metadata } from "next";
import HomeClient from "../HomeClient";

export const metadata: Metadata = {
  title: "Paperxify DE | YouTube zu Notizen AI & YouTube Video Summarizer",
  description: "Konvertiere YouTube-Videos sofort in Studiennotizen in Deutschland. Paperxify ist der beste kostenlose KI-Notiznehmer, Video-Summarizer und die beste Alternative zu NoteGPT für Studenten an der TU München, in Heidelberg, Aachen und ganz Deutschland.",
  keywords: [
    "youtube to notes ai de",
    "youtube zu notizen ki",
    "youtube video note taker de",
    "ai notes from youtube",
    "notegpt alternative de",
    "mindgrasp alternative deutschland",
    "best ai youtube summarizer de",
    "youtube transcript to notes",
    "turn youtube into notes"
  ],
  alternates: {
    canonical: "https://paperxify.com/de",
  },
  openGraph: {
    title: "Paperxify DE | AI YouTube Notes Maker & YT Video Summarizer",
    description: "Füge einen YouTube-Link ein, um sofort Notizen zu erstellen. Das beste kostenlose KI-Notizwerkzeug in Deutschland.",
    url: "https://paperxify.com/de",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YT Link to Notes AI DE",
      },
    ],
  },
};

export default function DEPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Paperxify DE YouTube to Notes AI",
        "url": "https://paperxify.com/de",
        "operatingSystem": "All",
        "applicationCategory": "EducationalApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR"
        },
        "description": "The best free AI tool to take notes from youtube in Germany. Convert YouTube videos into structured study notes, flashcards, and summaries instantly.",
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
            "name": "How to convert youtube video to notes using AI in Germany?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To convert a YouTube video to notes, paste the link on Paperxify. The AI transcribes and organizes it into study notes and flashcards."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a free AI tool to take notes from youtube in Germany?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Paperxify is a free AI YouTube note-taking tool available to students and professionals across Germany."
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
