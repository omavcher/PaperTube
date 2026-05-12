// app/tools/merge/page.tsx (Server Component)
import MergePDFPage from "@/components/tools/MergePDFTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Files Free | Combine PDFs Online | Paperxify",
  description: "Merge multiple PDF files into one document instantly. 100% free, secure client-side processing, no file limits, and no watermarks. Best iLovePDF alternative.",
  keywords: ["merge pdf", "combine pdf", "pdf joiner", "free pdf tool", "secure pdf merge", "merge pdf paperxify", "combine pdf online", "pdf merger", "merge pdf free"],
  alternates: {
    canonical: "https://paperxify.com/tools/merge",
  },
  openGraph: {
    title: "Merge PDF Files Free | Combine PDFs Online | Paperxify",
    description: "Merge multiple PDF files into one document instantly. 100% free, secure client-side processing, no file limits, and no watermarks.",
    type: "website",
    url: "https://paperxify.com/tools/merge",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Files Free | Combine PDFs Online",
    description: "Merge multiple PDF files into one document instantly. 100% free, secure client-side processing.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Merge PDF Files Free - Paperxify",
    "url": "https://paperxify.com/tools/merge",
    "description": "Merge multiple PDF files into one document instantly. 100% free, secure client-side processing, no file limits, and no watermarks.",
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
        "name": "How do I merge PDF files for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply drag and drop your PDF files into the upload box on Paperxify, arrange them in your desired order, and click the 'Execute Merge' button to combine them."
        }
      },
      {
        "@type": "Question",
        "name": "Is it safe to merge PDFs online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, merging PDFs on Paperxify is completely safe. We use secure client-side processing, meaning your files are merged directly in your browser and are never uploaded to any external servers."
        }
      },
      {
        "@type": "Question",
        "name": "Are there any file limits or watermarks?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, Paperxify offers unlimited PDF merging with no file size limits and absolutely no watermarks added to your documents."
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
      <MergePDFPage />
    </>
  );
}