// app/tools/fake-internship-letter-generator/page.tsx
import InternshipGeneratorClient from "@/components/tools/InternshipGeneratorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internship Offer Letter Generator | Paperxify",
  description: "Generate professional internship offer letters. Create custom PDF templates for HR or educational purposes.",
  keywords: ["internship letter generator", "offer letter maker", "hr document generator", "custom offer letter pdf"],
  alternates: {
    canonical: "https://paperxify.com/tools/fake-internship-letter-generator",
  },
  openGraph: {
    title: "Internship Offer Letter Generator | Paperxify",
    description: "Generate professional internship offer letters. Create custom PDF templates for HR or educational purposes.",
    type: "website",
    url: "https://paperxify.com/tools/fake-internship-letter-generator",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Internship Offer Letter Generator",
    description: "Generate professional internship offer letters. Create custom PDF templates for HR or educational purposes.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Internship Offer Letter Generator - Paperxify",
    "url": "https://paperxify.com/tools/fake-internship-letter-generator",
    "description": "Generate professional internship offer letters. Create custom PDF templates for HR or educational purposes.",
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
        "name": "Is this legal to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This tool is meant for educational purposes, HR templates, or mock interviews. Do not use it to commit fraud."
        }
      },
      {
        "@type": "Question",
        "name": "Can I export to PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the letter is generated as a high-quality, printable PDF document."
        }
      },
      {
        "@type": "Question",
        "name": "Can I add a company logo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can upload a logo which will be embedded into the letterhead."
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
      <InternshipGeneratorClient />
    </>
  );
}
