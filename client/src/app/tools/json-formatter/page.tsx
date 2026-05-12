// app/tools/json-formatter/page.tsx
import JsonFormatterClient from "@/components/tools/JsonFormatterClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free JSON Formatter & Validator | Paperxify",
  description: "Beautify, validate, and format JSON data online. Free client-side JSON parsing, syntax highlighting, and error detection.",
  keywords: ["json formatter", "json validator", "beautify json", "json parser", "format json online", "json to string"],
  alternates: {
    canonical: "https://paperxify.com/tools/json-formatter",
  },
  openGraph: {
    title: "Free JSON Formatter & Validator | Paperxify",
    description: "Beautify, validate, and format JSON data online. Free client-side JSON parsing, syntax highlighting, and error detection.",
    type: "website",
    url: "https://paperxify.com/tools/json-formatter",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free JSON Formatter & Validator",
    description: "Beautify, validate, and format JSON data online. Free client-side JSON parsing, syntax highlighting, and error detection.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free JSON Formatter & Validator - Paperxify",
    "url": "https://paperxify.com/tools/json-formatter",
    "description": "Beautify, validate, and format JSON data online. Free client-side JSON parsing, syntax highlighting, and error detection.",
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
        "name": "How do I format JSON data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply paste your raw JSON string into the input area. The tool will automatically validate, beautify, and highlight the syntax."
        }
      },
      {
        "@type": "Question",
        "name": "Can I validate broken JSON?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our tool highlights syntax errors and helps you pinpoint exactly where your JSON structure is invalid."
        }
      },
      {
        "@type": "Question",
        "name": "Is my JSON data kept private?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. We do not store or track the data you format. Everything runs inside your browser locally."
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
      <JsonFormatterClient />
    </>
  );
}
