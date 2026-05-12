import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fake Payment Screenshot Generator | Fake UPI Maker | Paperxify",
  description: "Create fake payment screenshots for PhonePe, Google Pay (GPay), and Paytm. Realistic UPI payment receipts for pranks and testing.",
  keywords: ["fake payment screenshot", "fake upi generator", "phonepe fake payment", "paytm fake payment maker", "gpay fake receipt", "prank payment generator"],
  alternates: {
    canonical: "https://paperxify.com/tools/fack",
  },
  openGraph: {
    title: "Fake Payment Screenshot Generator | Fake UPI Maker | Paperxify",
    description: "Create fake payment screenshots for PhonePe, Google Pay (GPay), and Paytm. Realistic UPI payment receipts for pranks and testing.",
    type: "website",
    url: "https://paperxify.com/tools/fack",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fake Payment Screenshot Generator",
    description: "Create fake payment screenshots for PhonePe, GPay, and Paytm.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Fake UPI Generator - Paperxify",
    "url": "https://paperxify.com/tools/fack",
    "description": "Create fake payment screenshots for PhonePe, Google Pay (GPay), and Paytm. Realistic UPI payment receipts for pranks and testing.",
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
        "name": "Which apps are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can generate realistic fake payment receipts for PhonePe, Paytm, and Google Pay (GPay)."
        }
      },
      {
        "@type": "Question",
        "name": "Is this tool legal to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This tool is meant strictly for pranks among friends, UI testing, or educational purposes. Any misuse of this tool for fraud or deception is illegal and strictly prohibited."
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
