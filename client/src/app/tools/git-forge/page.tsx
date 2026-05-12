// app/tools/git-forge/page.tsx
import GitForgeClient from "@/components/tools/GitForgeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Git Flow Blueprint | Paperxify",
  description: "Blueprint and visualize Git branching strategies. Simulate commits, merges, and rebases visually.",
  keywords: ["git visualizer", "git branching strategy", "git flow simulator", "learn git online", "simulate git commit"],
  alternates: {
    canonical: "https://paperxify.com/tools/git-forge",
  },
  openGraph: {
    title: "Git Flow Blueprint | Paperxify",
    description: "Blueprint and visualize Git branching strategies. Simulate commits, merges, and rebases visually.",
    type: "website",
    url: "https://paperxify.com/tools/git-forge",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Git Flow Blueprint",
    description: "Blueprint and visualize Git branching strategies. Simulate commits, merges, and rebases visually.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Git Flow Blueprint - Paperxify",
    "url": "https://paperxify.com/tools/git-forge",
    "description": "Blueprint and visualize Git branching strategies. Simulate commits, merges, and rebases visually.",
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
        "name": "Can I simulate a rebase?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can visually simulate complex git operations like merge, rebase, and cherry-pick to understand how they affect the commit tree."
        }
      },
      {
        "@type": "Question",
        "name": "Is it good for learning Git?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Visualizing the DAG (Directed Acyclic Graph) of commits is the best way for beginners to master Git."
        }
      },
      {
        "@type": "Question",
        "name": "Does it modify my local repos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, it is purely an online simulation environment."
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
      <GitForgeClient />
    </>
  );
}
