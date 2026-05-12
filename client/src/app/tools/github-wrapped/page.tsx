// app/tools/github-wrapped/page.tsx
import GithubWrappedClient from "@/components/tools/GithubWrappedClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Wrapped Visualizer | Paperxify",
  description: "Generate a beautiful visual summary of your GitHub activity. Share your open-source impact as an image.",
  keywords: ["github wrapped", "github stats visualizer", "github profile stats", "developer portfolio generator", "github recap"],
  alternates: {
    canonical: "https://paperxify.com/tools/github-wrapped",
  },
  openGraph: {
    title: "GitHub Wrapped Visualizer | Paperxify",
    description: "Generate a beautiful visual summary of your GitHub activity. Share your open-source impact as an image.",
    type: "website",
    url: "https://paperxify.com/tools/github-wrapped",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Wrapped Visualizer",
    description: "Generate a beautiful visual summary of your GitHub activity. Share your open-source impact as an image.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "GitHub Wrapped Visualizer - Paperxify",
    "url": "https://paperxify.com/tools/github-wrapped",
    "description": "Generate a beautiful visual summary of your GitHub activity. Share your open-source impact as an image.",
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
        "name": "What stats are included?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It pulls your total commits, PRs, top languages, and most active repositories over the past year."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to authenticate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, you only need to enter your public GitHub username. We fetch public API data."
        }
      },
      {
        "@type": "Question",
        "name": "Can I share the result?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can download the generated dashboard as an image to share on LinkedIn or Twitter."
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
      <GithubWrappedClient />
    </>
  );
}
