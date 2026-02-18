import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy | PaperTube",
  description: "We protect your data. Read our commitment to end-to-end encryption, ephemeral processing, and zero data selling.",
  alternates: {
    canonical: "https://papertube.in/privacy",
  },
  openGraph: {
    title: "Privacy & Data Security",
    description: "Your trust is our currency. See how we protect your notes.",
    url: "https://papertube.in/privacy",
    siteName: "PaperTube",
    type: "website",
  },
};

export default function PrivacyPage() {
  // JSON-LD for a WebPage (Legal Document)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy",
    "description": "Privacy Policy and Data Security standards for PaperTube.",
    "publisher": {
      "@type": "Organization",
      "name": "PaperTube",
      "url": "https://papertube.in"
    },
    "dateModified": "2024-02-01" // Keep this updated
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrivacyClient />
    </>
  );
}