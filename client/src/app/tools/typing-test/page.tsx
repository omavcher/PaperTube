// app/tools/typing-test/page.tsx
import TypingTestClient from "@/components/tools/TypingTestClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Speed Test (WPM) | Paperxify",
  description: "Test your typing speed and accuracy. Precision WPM test for programmers and professionals.",
  keywords: ["typing test", "wpm test", "typing speed test", "words per minute", "developer typing test"],
  alternates: {
    canonical: "https://paperxify.com/tools/typing-test",
  },
  openGraph: {
    title: "Typing Speed Test (WPM) | Paperxify",
    description: "Test your typing speed and accuracy. Precision WPM test for programmers and professionals.",
    type: "website",
    url: "https://paperxify.com/tools/typing-test",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Typing Speed Test (WPM)",
    description: "Test your typing speed and accuracy. Precision WPM test for programmers and professionals.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Typing Speed Test (WPM) - Paperxify",
    "url": "https://paperxify.com/tools/typing-test",
    "description": "Test your typing speed and accuracy. Precision WPM test for programmers and professionals.",
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
        "name": "How is WPM calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Words Per Minute is calculated based on the standard 5 characters per word formula, factoring in accuracy."
        }
      },
      {
        "@type": "Question",
        "name": "Is it meant for programmers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we include code-specific typing tests to help developers improve their punctuation speed."
        }
      },
      {
        "@type": "Question",
        "name": "Can I track my progress?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can see your real-time stats including raw WPM, accuracy percentage, and error count."
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
      <TypingTestClient />
    </>
  );
}
