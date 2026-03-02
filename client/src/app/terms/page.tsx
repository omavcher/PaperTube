import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
  title: "Terms of Service | Paperxify",
  description: "Read the rules and regulations for using Paperxify's AI tools, games, and note-generation services.",
  alternates: {
    canonical: "https://paperxify.com/terms",
  },
  openGraph: {
    title: "Terms of Service",
    description: "Usage policies for Paperxify AI.",
    url: "https://paperxify.com/terms",
    siteName: "Paperxify",
    type: "website",
  },
};

export default function TermsPage() {
  // JSON-LD for a WebPage (specifically a "TechArticle" or generic page for legal docs)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service",
    "description": "Legal terms for using Paperxify.",
    "publisher": {
      "@type": "Organization",
      "name": "Paperxify",
      "url": "https://paperxify.com"
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