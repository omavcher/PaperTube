// app/tools/emi-calculator/page.tsx
import EmiCalculatorClient from "@/components/tools/EmiCalculatorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EMI Calculator Online | Paperxify",
  description: "Calculate Equated Monthly Installments (EMI) for home loans, car loans, and personal loans instantly. View amortization schedules.",
  keywords: ["emi calculator", "loan calculator", "home loan emi calculator", "car loan calculator", "amortization schedule"],
  alternates: {
    canonical: "https://paperxify.com/tools/emi-calculator",
  },
  openGraph: {
    title: "EMI Calculator Online | Paperxify",
    description: "Calculate Equated Monthly Installments (EMI) for home loans, car loans, and personal loans instantly. View amortization schedules.",
    type: "website",
    url: "https://paperxify.com/tools/emi-calculator",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "EMI Calculator Online",
    description: "Calculate Equated Monthly Installments (EMI) for home loans, car loans, and personal loans instantly. View amortization schedules.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EMI Calculator Online - Paperxify",
    "url": "https://paperxify.com/tools/emi-calculator",
    "description": "Calculate Equated Monthly Installments (EMI) for home loans, car loans, and personal loans instantly. View amortization schedules.",
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
        "name": "How is EMI calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "EMI is calculated based on the principal loan amount, interest rate, and loan tenure using standard banking formulas."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use it for home and car loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can calculate EMI for any type of loan by adjusting the interest rate and tenure."
        }
      },
      {
        "@type": "Question",
        "name": "Does it show an amortization schedule?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, it breaks down your monthly payments into principal and interest components over time."
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
      <EmiCalculatorClient />
    </>
  );
}
