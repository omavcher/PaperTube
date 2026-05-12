// app/tools/matrix-calculator/page.tsx
import MatrixCalculatorClient from "@/components/tools/MatrixCalculatorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matrix Calculator Online | Paperxify",
  description: "Perform advanced matrix operations online. Calculate determinants, inverse matrices, multiplication, and addition up to 5x5 dimensions.",
  keywords: ["matrix calculator", "matrix multiplication", "inverse matrix calculator", "determinant calculator", "matrix operations"],
  alternates: {
    canonical: "https://paperxify.com/tools/matrix-calculator",
  },
  openGraph: {
    title: "Matrix Calculator Online | Paperxify",
    description: "Perform advanced matrix operations online. Calculate determinants, inverse matrices, multiplication, and addition up to 5x5 dimensions.",
    type: "website",
    url: "https://paperxify.com/tools/matrix-calculator",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matrix Calculator Online",
    description: "Perform advanced matrix operations online. Calculate determinants, inverse matrices, multiplication, and addition up to 5x5 dimensions.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Matrix Calculator Online - Paperxify",
    "url": "https://paperxify.com/tools/matrix-calculator",
    "description": "Perform advanced matrix operations online. Calculate determinants, inverse matrices, multiplication, and addition up to 5x5 dimensions.",
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
        "name": "What matrix operations are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can perform addition, subtraction, multiplication, find the determinant, and calculate the inverse of matrices."
        }
      },
      {
        "@type": "Question",
        "name": "What is the maximum matrix size?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our tool supports square and rectangular matrices up to 5x5 dimensions."
        }
      },
      {
        "@type": "Question",
        "name": "Is this matrix calculator free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, it is 100% free to use for students, engineers, and mathematicians."
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
      <MatrixCalculatorClient />
    </>
  );
}
