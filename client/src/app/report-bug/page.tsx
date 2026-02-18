import type { Metadata } from "next";
import BugReportClient from "./BugReportClient";

export const metadata: Metadata = {
  title: "Report a Bug & Security Vulnerability | PaperTube",
  description: "Found an issue? Report bugs or security vulnerabilities directly to our engineering team. Help us improve the AI learning ecosystem.",
  alternates: {
    canonical: "https://papertube.in/report-bug",
  },
  openGraph: {
    title: "PaperTube Bug Bounty & Reporting",
    description: "Submit diagnostic reports and help us squash bugs.",
    url: "https://papertube.in/report-bug",
    siteName: "PaperTube",
    type: "website",
  },
};

export default function BugReportPage() {
  // JSON-LD for a "ContactPage" specific to technical support
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Report a Bug",
    "description": "Technical support and bug reporting page for PaperTube.",
    "mainEntity": {
      "@type": "ContactPoint",
      "contactType": "technical support",
      "url": "https://papertube.in/report-bug",
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