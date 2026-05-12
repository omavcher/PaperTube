import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base Converter | Binary to Hex & Decimal | Paperxify",
  description: "Real-time base converter for developers. Convert between Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16) instantly.",
  keywords: ["base converter", "binary to hex", "decimal to binary", "hex converter", "base 16 converter", "online number base translation"],
  alternates: {
    canonical: "https://paperxify.com/tools/base-converter",
  },
  openGraph: {
    title: "Base Converter | Binary to Hex & Decimal | Paperxify",
    description: "Real-time base converter for developers. Convert between Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16) instantly.",
    type: "website",
    url: "https://paperxify.com/tools/base-converter",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Converter | Binary to Hex & Decimal",
    description: "Real-time base converter for developers.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Base Converter - Paperxify",
    "url": "https://paperxify.com/tools/base-converter",
    "description": "Real-time base converter for developers. Convert between Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16) instantly.",
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
        "name": "How do I convert binary to hex?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply enter your binary number into the Binary input field. The tool will automatically translate it to Hexadecimal, Decimal, and Octal in real-time."
        }
      },
      {
        "@type": "Question",
        "name": "Does the base converter run offline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our base converter runs entirely in your browser using local client-side logic, meaning it is instantly fast and requires no server calls."
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
      {children}
    </>
  );
}
