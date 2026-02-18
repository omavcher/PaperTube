import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | PaperTube Support",
  description: "Need help with PaperTube? Contact our technical support, business team, or join our community discord. We respond within 24 hours.",
  alternates: {
    canonical: "https://papertube.in/contact",
  },
  openGraph: {
    title: "Get in Touch with PaperTube",
    description: "Support, Business Inquiries, and Community links.",
    url: "https://papertube.in/contact",
    siteName: "PaperTube",
    type: "website",
  },
};

export default function ContactPage() {
  // JSON-LD for "ContactPage"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact PaperTube",
    "description": "Contact channels for technical support and business inquiries.",
    "mainEntity": {
      "@type": "Organization",
      "name": "PaperTube",
      "url": "https://papertube.in",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+91-0000000000", // Replace if you have one
          "contactType": "customer service",
          "email": "support@papertube.ai",
          "areaServed": "Global",
          "availableLanguage": "English"
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}