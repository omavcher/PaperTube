import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
  title: "Terms of Service | PaperTube",
  description: "Read the rules and regulations for using PaperTube's AI tools, games, and note-generation services.",
  alternates: {
    canonical: "https://papertube.in/terms",
  },
  openGraph: {
    title: "Terms of Service",
    description: "Usage policies for PaperTube AI.",
    url: "https://papertube.in/terms",
    siteName: "PaperTube",
    type: "website",
  },
};

export default function TermsPage() {
  // JSON-LD for a WebPage (specifically a "TechArticle" or generic page for legal docs)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service",
    "description": "Legal terms for using PaperTube.",
    "publisher": {
      "@type": "Organization",
      "name": "PaperTube",
      "url": "https://papertube.in"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TermsClient />
    </>
  );
}