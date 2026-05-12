// app/tools/split/page.tsx
import SplitPDFTool from "@/components/tools/SplitPDFTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Files Online | Paperxify",
  description: "Split PDF documents into multiple files instantly. Extract specific pages, split by range, or separate every page. 100% free, secure client-side processing.",
  keywords: ["split pdf", "extract pdf pages", "pdf separator", "free pdf tool", "secure pdf splitter", "split pdf free", "paperxify split pdf"],
  alternates: {
    canonical: "https://paperxify.com/tools/split",
  },
  openGraph: {
    title: "Split PDF Files Online | Paperxify",
    description: "Split PDF documents into multiple files instantly. Extract specific pages, split by range, or separate every page. 100% free, secure client-side processing.",
    type: "website",
    url: "https://paperxify.com/tools/split",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Files Online",
    description: "Split PDF documents into multiple files instantly. Extract specific pages, split by range, or separate every page. 100% free, secure client-side processing.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Split PDF Files Online - Paperxify",
    "url": "https://paperxify.com/tools/split",
    "description": "Split PDF documents into multiple files instantly. Extract specific pages, split by range, or separate every page. 100% free, secure client-side processing.",
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
        "name": "How do I split a PDF file?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Upload your PDF file, select the pages you want to extract, or define custom ranges. Click 'Split PDF' to instantly download your separated files."
        }
      },
      {
        "@type": "Question",
        "name": "Is it safe to split PDFs here?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, 100% safe. The splitting process happens directly in your browser. Your files are never uploaded to our servers, ensuring total privacy."
        }
      },
      {
        "@type": "Question",
        "name": "Are there any file size limits?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, since processing is done locally, there are no file size limits or paywalls."
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
      <SplitPDFTool />
    </>
  );
}
