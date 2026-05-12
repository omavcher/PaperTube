// app/tools/markdown-editor/page.tsx
import MarkdownEditorClient from "@/components/tools/MarkdownEditorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Editor & Preview | Paperxify",
  description: "Write and edit Markdown with real-time preview. Export to HTML or PDF. Free online syntax editor.",
  keywords: ["markdown editor", "online markdown preview", "md to html", "md viewer online", "real-time markdown"],
  alternates: {
    canonical: "https://paperxify.com/tools/markdown-editor",
  },
  openGraph: {
    title: "Markdown Editor & Preview | Paperxify",
    description: "Write and edit Markdown with real-time preview. Export to HTML or PDF. Free online syntax editor.",
    type: "website",
    url: "https://paperxify.com/tools/markdown-editor",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Editor & Preview",
    description: "Write and edit Markdown with real-time preview. Export to HTML or PDF. Free online syntax editor.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Markdown Editor & Preview - Paperxify",
    "url": "https://paperxify.com/tools/markdown-editor",
    "description": "Write and edit Markdown with real-time preview. Export to HTML or PDF. Free online syntax editor.",
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
        "name": "Does it support GitHub Flavored Markdown?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, it fully supports tables, code blocks, checklists, and all standard GFM features."
        }
      },
      {
        "@type": "Question",
        "name": "Can I export my document?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can copy the raw markdown, copy the rendered HTML, or download the markdown file directly."
        }
      },
      {
        "@type": "Question",
        "name": "Is there an auto-save feature?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, your content is saved to your local browser storage so you don't lose work."
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
      <MarkdownEditorClient />
    </>
  );
}
