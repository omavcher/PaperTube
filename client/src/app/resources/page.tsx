import React from "react";
import type { Metadata } from "next";
import ResourcesClient from "@/components/tools/ResourcesClient";

export const metadata: Metadata = {
  title: "Free Student Study Resources & Revision Templates | Paperxify",
  description: "Download free scientifically backed study hacks, exam preparation checklists, AI student directories, and custom Notion study planners. Elevate your active recall revision game today.",
  keywords: [
    "free study resources",
    "student revision templates",
    "exam prep checklists",
    "notion study planners free",
    "study hacks guides",
    "active recall printables",
    "download study guides excel"
  ],
  alternates: {
    canonical: "https://paperxify.com/resources",
  },
  openGraph: {
    title: "Free Student Study Resources & Revision Templates | Paperxify",
    description: "Download free scientifically backed study hacks, exam preparation checklists, AI student directories, and custom Notion study planners.",
    type: "website",
    url: "https://paperxify.com/resources",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Student Study Resources & Revision Templates",
    description: "Download free Notion templates, exam checklists, and study bundles.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Paperxify Student Resource Vault",
    "url": "https://paperxify.com/resources",
    "description": "A collection of free, un-gated downloads including PDF guides, Excel checklists, and Notion templates built to optimize revision routines."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ResourcesClient />
    </>
  );
}
