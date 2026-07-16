import React from "react";
import type { Metadata } from "next";
import ShareStoryClient from "@/components/tools/ShareStoryClient";

export const metadata: Metadata = {
  title: "Share Your Success Story & Preparation Journey | Paperxify",
  description: "Did you use Paperxify to ace your SAT, AP, GATE, or college exams? Share your prep journey, struggles, and solutions with other students to inspire them.",
  keywords: [
    "share success story",
    "student preparation journey",
    "how to study with ai",
    "exam success tips",
    "share your study hack"
  ],
  alternates: {
    canonical: "https://paperxify.com/share-story",
  },
  openGraph: {
    title: "Share Your Success Story & Preparation Journey | Paperxify",
    description: "Did you use Paperxify to ace your SAT, AP, GATE, or college exams? Share your prep journey, struggles, and solutions.",
    type: "website",
    url: "https://paperxify.com/share-story",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Your Success Story",
    description: "Tell the student community how you optimized your exam prep using AI.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Share Your Success Story - Paperxify",
    "url": "https://paperxify.com/share-story",
    "description": "Form for students to upload and share their personal exam preparation success stories and academic achievements."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ShareStoryClient />
    </>
  );
}