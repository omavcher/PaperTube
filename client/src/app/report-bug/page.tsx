import type { Metadata } from "next";
import BugReportClient from "./BugReportClient";

export const metadata: Metadata = {
  title: "Report a Bug & Security Vulnerability | Paperxify",
  description: "Found an issue? Report bugs or security vulnerabilities directly to our engineering team. Help us improve the AI learning ecosystem.",
  alternates: {
    canonical: "https://paperxify.com/report-bug",
  },
  openGraph: {
    title: "Paperxify Bug Bounty & Reporting",
    description: "Submit diagnostic reports and help us squash bugs.",
    url: "https://paperxify.com/report-bug",
    siteName: "Paperxify",
    type: "website",
  },
};

export default function BugReportPage() {
  // JSON-LD for a "ContactPage" specific to technical support
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Report a Bug",
    "description": "Technical support and bug reporting page for Paperxify.",
    "mainEntity": {
      "@type": "ContactPoint",
      "contactType": "technical support",
      "url": "https://paperxify.com/report-bug",
      "availableLanguage": "English"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BugReportClient />
    </>
  );
}