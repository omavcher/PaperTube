import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { generateJsonLdForPage } from "@/lib/seo-helpers";

// Specific, high-impact SEO for the core feature: YouTube Video Link to Notes Converter.
export const metadata: Metadata = {
  title: "Free AI Study Tools: YouTube Notes, PPTs & Mind Maps",
  description: "Convert YouTube lectures to structured notes, generate slide decks, and create diagrams in seconds. Free for students and educators. No signup needed.",
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
    title: "Free AI Study Tools: YouTube Notes, PPTs & Mind Maps",
    description: "Convert YouTube lectures to structured notes, generate slide decks, and create diagrams in seconds. Free for students and educators. No signup needed.",
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
  const jsonLd = generateJsonLdForPage("home", "global");

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

