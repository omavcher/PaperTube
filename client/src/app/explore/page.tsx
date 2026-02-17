import type { Metadata } from "next";
import ExploreClient from "./ExploreClient"

// --- Advanced SEO Metadata ---
export const metadata: Metadata = {
  title: "Explore Community Notes | AI Knowledge Base",
  description: "Discover trending AI-generated notes, engineering tutorials, and tech summaries from the community. Master complex topics with formatted insights.",
  keywords: ["AI notes", "engineering study", "tech summaries", "developer community", "learning resources"],
  openGraph: {
    title: "Feed Your Instinct | Explore Knowledge",
    description: "Join thousands of developers and students mastering new skills.",
    url: "https://your-domain.com/explore",
    siteName: "YourAppName",
    images: [
      {
        url: "https://your-domain.com/og-explore.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "Explore Community Notes",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Trending Notes",
    description: "Curated tech and engineering insights.",
    images: ["https://your-domain.com/og-explore.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://your-domain.com/explore",
  },
};

export default function ExplorePage() {
  // --- JSON-LD Structured Data for SEO ---
  // This helps search engines understand this is a collection of creative works.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Explore Community Notes",
    "description": "A collection of AI-generated educational notes and tutorials.",
    "provider": {
      "@type": "Organization",
      "name": "YourAppName",
      "url": "https://your-domain.com"
    }
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExploreClient />
    </>
  );
}