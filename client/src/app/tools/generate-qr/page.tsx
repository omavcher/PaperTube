// app/tools/generate-qr/page.tsx
import QRCodeGeneratorClient from "@/components/tools/QRCodeGeneratorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free QR Code Generator | Paperxify",
  description: "Create custom QR codes for URLs, text, WiFi, and contacts instantly. Download high-res PNG or SVG.",
  keywords: ["qr code generator", "create qr code", "free qr maker", "wifi qr code", "url to qr code"],
  alternates: {
    canonical: "https://paperxify.com/tools/generate-qr",
  },
  openGraph: {
    title: "Free QR Code Generator | Paperxify",
    description: "Create custom QR codes for URLs, text, WiFi, and contacts instantly. Download high-res PNG or SVG.",
    type: "website",
    url: "https://paperxify.com/tools/generate-qr",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free QR Code Generator",
    description: "Create custom QR codes for URLs, text, WiFi, and contacts instantly. Download high-res PNG or SVG.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free QR Code Generator - Paperxify",
    "url": "https://paperxify.com/tools/generate-qr",
    "description": "Create custom QR codes for URLs, text, WiFi, and contacts instantly. Download high-res PNG or SVG.",
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
        "name": "Do the QR codes expire?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, these are static QR codes that last forever and do not expire."
        }
      },
      {
        "@type": "Question",
        "name": "Can I customize the colors?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can change the foreground and background colors to match your brand."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download as SVG?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we support exporting to vector SVG or high-res PNG."
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
      <QRCodeGeneratorClient />
    </>
  );
}
