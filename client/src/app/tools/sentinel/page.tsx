// app/tools/sentinel/page.tsx
import AIDetectorClient from "@/components/tools/AIDetectorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Image Detector & Sentinel | Paperxify",
  description: "Forensic image scanning to detect AI-generated content. Analyze pixels and metadata to identify deepfakes.",
  keywords: ["ai image detector", "deepfake detector", "is this image ai", "ai content scanner", "forensic image analysis"],
  alternates: {
    canonical: "https://paperxify.com/tools/sentinel",
  },
  openGraph: {
    title: "AI Image Detector & Sentinel | Paperxify",
    description: "Forensic image scanning to detect AI-generated content. Analyze pixels and metadata to identify deepfakes.",
    type: "website",
    url: "https://paperxify.com/tools/sentinel",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Detector & Sentinel",
    description: "Forensic image scanning to detect AI-generated content. Analyze pixels and metadata to identify deepfakes.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Image Detector & Sentinel - Paperxify",
    "url": "https://paperxify.com/tools/sentinel",
    "description": "Forensic image scanning to detect AI-generated content. Analyze pixels and metadata to identify deepfakes.",
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
        "name": "How does it detect AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It analyzes pixel anomalies, noise patterns, and metadata inconsistencies commonly found in Midjourney, DALL-E, and Stable Diffusion outputs."
        }
      },
      {
        "@type": "Question",
        "name": "Is it 100% accurate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No AI detector is perfect, but it provides a strong probability score based on forensic heuristics."
        }
      },
      {
        "@type": "Question",
        "name": "Are my scanned images saved?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, all forensic analysis is performed locally in your browser."
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
      <AIDetectorClient />
    </>
  );
}
