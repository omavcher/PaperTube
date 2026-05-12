// app/tools/syllabus-tracker/page.tsx
import SyllabusTrackerClient from "@/components/tools/SyllabusTrackerClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syllabus Milestone Tracker | Paperxify",
  description: "Organize and track your exam syllabus visually. Calculate completion percentages and study progress.",
  keywords: ["syllabus tracker", "study progress tracker", "exam planner online", "student tracker tool"],
  alternates: {
    canonical: "https://paperxify.com/tools/syllabus-tracker",
  },
  openGraph: {
    title: "Syllabus Milestone Tracker | Paperxify",
    description: "Organize and track your exam syllabus visually. Calculate completion percentages and study progress.",
    type: "website",
    url: "https://paperxify.com/tools/syllabus-tracker",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syllabus Milestone Tracker",
    description: "Organize and track your exam syllabus visually. Calculate completion percentages and study progress.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Syllabus Milestone Tracker - Paperxify",
    "url": "https://paperxify.com/tools/syllabus-tracker",
    "description": "Organize and track your exam syllabus visually. Calculate completion percentages and study progress.",
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
        "name": "How does the tracker work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You enter your chapters or topics, assign them weights, and check them off as you study. We calculate your overall completion."
        }
      },
      {
        "@type": "Question",
        "name": "Does it save my progress?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we use local storage to keep track of your syllabus across browser sessions."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use it for multiple subjects?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can create separate tracks for different subjects and exams."
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
      <SyllabusTrackerClient />
    </>
  );
}
