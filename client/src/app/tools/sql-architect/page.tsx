// app/tools/sql-architect/page.tsx
import SQLArchitectClient from "@/components/tools/SQLArchitectClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL Architect & Visualizer | Paperxify",
  description: "Visualize database schemas, build SQL queries, and design entity-relationship (ER) diagrams online.",
  keywords: ["sql visualizer", "sql query builder", "database schema designer", "er diagram generator", "online sql tool"],
  alternates: {
    canonical: "https://paperxify.com/tools/sql-architect",
  },
  openGraph: {
    title: "SQL Architect & Visualizer | Paperxify",
    description: "Visualize database schemas, build SQL queries, and design entity-relationship (ER) diagrams online.",
    type: "website",
    url: "https://paperxify.com/tools/sql-architect",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL Architect & Visualizer",
    description: "Visualize database schemas, build SQL queries, and design entity-relationship (ER) diagrams online.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SQL Architect & Visualizer - Paperxify",
    "url": "https://paperxify.com/tools/sql-architect",
    "description": "Visualize database schemas, build SQL queries, and design entity-relationship (ER) diagrams online.",
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
        "name": "What databases does it support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The architect is agnostic and can be used to visualize standard relational SQL structures like MySQL, PostgreSQL, and SQLite."
        }
      },
      {
        "@type": "Question",
        "name": "Can I export my schemas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can export your query blueprints and ER diagram definitions."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to connect my actual database?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, this is a secure sandbox for designing and visualizing queries without needing live database credentials."
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
      <SQLArchitectClient />
    </>
  );
}
