// app/tools/image-converter/page.tsx
import ImageConverterClient from "@/components/tools/ImageConverterClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter Online | Paperxify",
  description: "Convert images between PNG, JPG, WEBP, and GIF formats instantly. Free browser-based batch image processing.",
  keywords: ["image converter", "png to jpg", "webp to png", "convert images online", "batch image converter", "free image formatting"],
  alternates: {
    canonical: "https://paperxify.com/tools/image-converter",
  },
  openGraph: {
    title: "Image Converter Online | Paperxify",
    description: "Convert images between PNG, JPG, WEBP, and GIF formats instantly. Free browser-based batch image processing.",
    type: "website",
    url: "https://paperxify.com/tools/image-converter",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Converter Online",
    description: "Convert images between PNG, JPG, WEBP, and GIF formats instantly. Free browser-based batch image processing.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Image Converter Online - Paperxify",
    "url": "https://paperxify.com/tools/image-converter",
    "description": "Convert images between PNG, JPG, WEBP, and GIF formats instantly. Free browser-based batch image processing.",
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
        "name": "Does it support WEBP conversion?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can easily convert modern WEBP images into PNG or JPG, or vice-versa."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a file upload limit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No limits! All processing is done locally in your browser, so you can convert large files without limits."
        }
      },
      {
        "@type": "Question",
        "name": "Are my images uploaded to a server?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, your images never leave your device, ensuring total privacy."
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
      <ImageConverterClient />
    </>
  );
}
