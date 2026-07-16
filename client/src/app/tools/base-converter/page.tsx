import React from "react";
import type { Metadata } from "next";
import BaseConverterClient from "@/components/tools/BaseConverterClient";

export const metadata: Metadata = {
  title: "AI Base Converter | Binary, Hex, Octal & Decimal Translator | Paperxify",
  description: "Free online number base converter. Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16) formats instantly client-side with step-by-step logic.",
  keywords: [
    "base converter",
    "binary to hex converter",
    "decimal to octal calculator",
    "binary converter online",
    "hexadecimal translator",
    "number base calculator",
    "engineering base converter",
    "programmer calculator online",
    "convert decimal to binary",
    "base 10 to base 2 converter"
  ],
  alternates: {
    canonical: "https://paperxify.com/tools/base-converter",
  },
  openGraph: {
    title: "AI Base Converter | Binary, Hex, Octal & Decimal Translator | Paperxify",
    description: "Free online number base converter. Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16) formats instantly client-side with step-by-step logic.",
    type: "website",
    url: "https://paperxify.com/tools/base-converter",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Base Converter Tool",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal bases client-side instantly.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Base Converter - Paperxify",
    "url": "https://paperxify.com/tools/base-converter",
    "description": "Convert numbers between binary, octal, decimal, and hexadecimal bases client-side with real-time 8-bit visual debugging logic.",
    "applicationCategory": "EducationalApplication",
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
        "name": "How does the base converter work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply type a number into any of the input fields (Decimal, Binary, Hex, or Octal) and all other bases will update instantly in real-time. The processing runs entirely client-side in Javascript."
        }
      },
      {
        "@type": "Question",
        "name": "What is the 8-Bit logic view?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The 8-Bit logic view provides a visual state of the lowest 8 bits (1 byte) of your input. This is extremely helpful for computer engineering students visualizing bitwise representations of integers."
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
      <BaseConverterClient />
    </>
  );
}