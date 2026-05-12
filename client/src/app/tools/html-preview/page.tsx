// app/tools/html-preview/page.tsx
import HtmlPreviewClient from "@/components/tools/HtmlPreviewClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live HTML/CSS/JS Editor | Paperxify",
  description: "Write HTML, CSS, and JS with a live preview. Browser-based frontend playground without any setup.",
  keywords: ["html editor online", "live css preview", "js playground", "online web dev editor", "frontend compiler"],
  alternates: {
    canonical: "https://paperxify.com/tools/html-preview",
  },
  openGraph: {
    title: "Live HTML/CSS/JS Editor | Paperxify",
    description: "Write HTML, CSS, and JS with a live preview. Browser-based frontend playground without any setup.",
    type: "website",
    url: "https://paperxify.com/tools/html-preview",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live HTML/CSS/JS Editor",
    description: "Write HTML, CSS, and JS with a live preview. Browser-based frontend playground without any setup.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Live HTML/CSS/JS Editor - Paperxify",
    "url": "https://paperxify.com/tools/html-preview",
    "description": "Write HTML, CSS, and JS with a live preview. Browser-based frontend playground without any setup.",
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
        "name": "Does it support modern JavaScript?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the JavaScript runs directly in your browser, supporting whatever modern APIs your browser supports."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use external libraries like React or Tailwind?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently it's meant for vanilla HTML/CSS/JS, but you can include CDN links in the HTML head."
        }
      },
      {
        "@type": "Question",
        "name": "Is my code saved?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Code is executed locally. Be sure to copy your work before closing the tab."
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
      <HtmlPreviewClient />
    </>
  );
}
