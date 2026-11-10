import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Paperxify Support",
  description: "Need help with Paperxify? Contact our technical support, business team, or join our community discord. We respond within 24 hours.",
  alternates: {
    canonical: "https://paperxify.com/contact",
  },
  openGraph: {
    title: "Get in Touch with Paperxify",
    description: "Support, Business Inquiries, and Community links.",
    url: "https://paperxify.com/contact",
    siteName: "Paperxify",
    type: "website",
  },
};

export default function ContactPage() {
  // JSON-LD for "ContactPage"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Paperxify",
    "description": "Contact channels for technical support, billing inquiries, and business partnerships.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Paperxify",
      "url": "https://paperxify.com",
      "email": "support@paperxify.com",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "support@paperxify.com",
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