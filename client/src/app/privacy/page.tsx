import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy | Paperxify",
  description: "We protect your data. Read our commitment to end-to-end encryption, ephemeral processing, and zero data selling.",
  alternates: {
    canonical: "https://paperxify.com/privacy",
  },
  openGraph: {
    title: "Privacy & Data Security",
    description: "Your trust is our currency. See how we protect your notes.",
    url: "https://paperxify.com/privacy",
    siteName: "Paperxify",
    type: "website",
  },
};

export default function PrivacyPage() {
  // JSON-LD for a WebPage (Legal Document)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy",
    "description": "Privacy Policy and Data Security standards for Paperxify.",
    "publisher": {
      "@type": "Organization",
      "name": "Paperxify",
      "url": "https://paperxify.com"
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