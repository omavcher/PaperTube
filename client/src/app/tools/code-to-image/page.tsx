// app/tools/code-to-image/page.tsx
import CodeToImageClient from "@/components/tools/CodeToImageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code to Image Converter | Paperxify",
  description: "Convert your source code into beautiful, shareable images. Customize syntax highlighting, backgrounds, and themes.",
  keywords: ["code to image", "code snippet image", "beautify code screenshot", "share code as image", "carbon alternative"],
  alternates: {
    canonical: "https://paperxify.com/tools/code-to-image",
  },
  openGraph: {
    title: "Code to Image Converter | Paperxify",
    description: "Convert your source code into beautiful, shareable images. Customize syntax highlighting, backgrounds, and themes.",
    type: "website",
    url: "https://paperxify.com/tools/code-to-image",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code to Image Converter",
    description: "Convert your source code into beautiful, shareable images. Customize syntax highlighting, backgrounds, and themes.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Code to Image Converter - Paperxify",
    "url": "https://paperxify.com/tools/code-to-image",
    "description": "Convert your source code into beautiful, shareable images. Customize syntax highlighting, backgrounds, and themes.",
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
        "name": "How do I convert code to an image?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Paste your code, select your programming language, customize the background and theme, and click download."
        }
      },
      {
        "@type": "Question",
        "name": "What programming languages are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support syntax highlighting for almost all popular languages including JavaScript, Python, C++, HTML, CSS, and more."
        }
      },
      {
        "@type": "Question",
        "name": "Is it a good Carbon alternative?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, it's designed to be a faster, modern alternative to Carbon with premium glassmorphic styling."
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
      <CodeToImageClient />
    </>
  );
}
