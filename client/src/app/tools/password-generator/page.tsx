// app/tools/password-generator/page.tsx
import PasswordGeneratorClient from "@/components/tools/PasswordGeneratorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Password Generator | Paperxify",
  description: "Create strong, random, and secure passwords. Customize length, symbols, and rules for maximum security.",
  keywords: ["password generator", "strong password creator", "random password maker", "secure key generator"],
  alternates: {
    canonical: "https://paperxify.com/tools/password-generator",
  },
  openGraph: {
    title: "Secure Password Generator | Paperxify",
    description: "Create strong, random, and secure passwords. Customize length, symbols, and rules for maximum security.",
    type: "website",
    url: "https://paperxify.com/tools/password-generator",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Secure Password Generator",
    description: "Create strong, random, and secure passwords. Customize length, symbols, and rules for maximum security.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Secure Password Generator - Paperxify",
    "url": "https://paperxify.com/tools/password-generator",
    "description": "Create strong, random, and secure passwords. Customize length, symbols, and rules for maximum security.",
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
        "name": "Are these passwords secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, they are generated using cryptographically secure random number generators in your browser."
        }
      },
      {
        "@type": "Question",
        "name": "Do you store the passwords?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No! The passwords never leave your device. We have no backend server collecting them."
        }
      },
      {
        "@type": "Question",
        "name": "Can I include special characters?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can toggle uppercase, lowercase, numbers, and symbols to meet strict security requirements."
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
      <PasswordGeneratorClient />
    </>
  );
}
