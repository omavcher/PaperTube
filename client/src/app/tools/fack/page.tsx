import React from "react";
import type { Metadata } from "next";
import FackClient from "@/components/tools/FackClient";

export const metadata: Metadata = {
  title: "UPI Transaction Screen Simulator | PhonePe, GPay & Paytm UI Mockup | Paperxify",
  description: "Free online UPI transaction receipt simulator. Generate realistic design mockups for PhonePe, Google Pay, and Paytm screens for UI testing, development, and mockups.",
  keywords: [
    "upi screenshot generator",
    "fake transaction screenshot maker",
    "phonepe transaction mockup",
    "gpay payment screen builder",
    "paytm receipt simulator",
    "upi pay mockup generator",
    "transaction screen tester",
    "fake payment screenshot generator"
  ],
  alternates: {
    canonical: "https://paperxify.com/tools/fack",
  },
  openGraph: {
    title: "UPI Transaction Screen Simulator | PhonePe, GPay & Paytm UI Mockup | Paperxify",
    description: "Free online UPI transaction receipt simulator. Generate realistic design mockups for PhonePe, Google Pay, and Paytm screens for UI testing, development, and mockups.",
    type: "website",
    url: "https://paperxify.com/tools/fack",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "UPI Transaction Screen Simulator",
    description: "Generate realistic payment transaction screens for PhonePe, GPay, and Paytm UI testing.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "UPI Transaction Screen Simulator - Paperxify",
    "url": "https://paperxify.com/tools/fack",
    "description": "Simulate PhonePe, GPay, and Paytm UPI payment status screens for development, testing, and UI/UX reviews.",
    "applicationCategory": "DesignApplication",
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
        "name": "What is the purpose of the UPI Transaction Screen Simulator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This tool is designed purely for software developers, app designers, and UI/UX testers who want to reference standard payment screens or mock up interface ideas quickly. Using this tool for fraudulent purposes is strictly prohibited."
        }
      },
      {
        "@type": "Question",
        "name": "Can I customize the bank details and transaction reference ID?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can input custom names, mobile numbers, transaction reference numbers, UTR IDs, bank names, and payment amounts. The live preview updates in real-time."
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
      <FackClient />
    </>
  );
}