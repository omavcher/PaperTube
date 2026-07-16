import React from "react";
import type { Metadata } from "next";
import ToolsPageContent from "@/components/tools/ToolsPageContent";

export const metadata: Metadata = {
  title: "Free Engineering & PDF Online Tools | Paperxify",
  description: "Explore Paperxify's suite of free client-side tools for engineering and developer workflows. Merge & split PDFs, format JSON, calculate EMIs, remove AI metadata, and convert binary/hex bases online.",
  keywords: [
    "engineering tools online",
    "free developer utilities",
    "pdf tools online free",
    "json formatter and validator",
    "linkedin c tag remover",
    "base converter binary hex decimal",
    "matrix calculator online",
    "logic gate simulator",
    "carbon code to image alternative",
    "syllabus tracker",
    "typing speed test wpm"
  ],
  alternates: {
    canonical: "https://paperxify.com/tools",
  },
  openGraph: {
    title: "Free Engineering & PDF Online Tools | Paperxify",
    description: "Explore Paperxify's suite of free client-side tools for engineering and developer workflows. Merge & split PDFs, format JSON, calculate EMIs, remove AI metadata, and convert binary/hex bases online.",
    type: "website",
    url: "https://paperxify.com/tools",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Engineering & PDF Online Tools Suite",
    description: "Compare free developer and student tools: PDF organizers, formatting tools, math calculators, and metadata scrubbers.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Engineering & Developer Tools Suite - Paperxify",
    "url": "https://paperxify.com/tools",
    "description": "A comprehensive suite of client-side developer and engineering tools including PDF merges, JSON formatters, EMI calculators, and base converters.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are the Paperxify engineering tools free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all utility and engineering tools on Paperxify are 100% free. There are no registration forms, no file limits, and no download watermarks."
        }
      },
      {
        "@type": "Question",
        "name": "Are my files secure when using these tools?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Most of our tools process files and inputs entirely client-side inside your browser. Your source code, images, and data are never sent to our servers, ensuring total privacy."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ToolsPageContent />
    </>
  );
}