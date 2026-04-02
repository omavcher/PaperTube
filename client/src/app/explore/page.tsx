import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

// --- 1. Define Types to Match Your API ---
interface Creator {
  _id: string;
  name: string;
  avatarUrl?: string;
  username?: string;
}

interface Note {
  _id: string;
  slug: string;
  title: string;
  videoUrl?: string;
  thumbnail?: string;
  updatedAt: string;
  createdAt: string;
  views?: number;
  likes?: number;
  category?: string;
  creator?: Creator;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data: {
    items: Note[];
    pagination: Pagination;
  };
}

// --- 2. Server-Side Fetch Function ---
async function getExploreNotes(): Promise<ApiResponse | null> {
  // In development, skip SSR fetch entirely — the client component 
  // fetches its own data. Only do SSR in production where a real 
  // API URL is set, to avoid ECONNREFUSED noise and 790ms delays.
  const isProd = process.env.NODE_ENV === "production";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!isProd || !apiUrl) {
    return null;
  }

  try {
    const baseUrl = apiUrl.replace(/\/$/, "");
    const endpoint = `${baseUrl}/api/notes/explore?page=1&limit=12&sortBy=updatedAt&sortOrder=desc&type=notes`;

    const res = await fetch(endpoint, {
      // Use revalidate in prod instead of no-store for better perf
      next: { revalidate: 60 }, // Re-fetch every 60 seconds
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error(`❌ Explore SSR: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("🚨 Explore SSR fetch failed:", error);
    return null;
  }
}

// --- 3. Advanced SEO Metadata ---
export const metadata: Metadata = {
  title: "Explore Engineering Notes & AI Summaries | Paperxify",
  description: "Browse thousands of AI-generated study notes from YouTube videos. Topics include Coding, GATE, Finance, and Tech.",
  keywords: ["AI notes", "engineering study", "tech summaries", "developer community", "learning resources"],
  alternates: {
    canonical: "https://paperxify.com/explore",
  },
  openGraph: {
    title: "Explore Community Notes | Paperxify",
    description: "Read high-quality AI notes generated from video content.",
    url: "https://paperxify.com/explore",
    siteName: "Paperxify",
    type: "website",
    images: [
      {
        url: "https://paperxify.com/og-explore.jpg", // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: "Explore Community Notes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Trending Notes",
    description: "Curated tech and engineering insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// --- 4. Main Page Component ---
export default async function ExplorePage() {
  // Fetch data on the server
  const response = await getExploreNotes();
  
  // Fallback if fetch fails
  const initialItems = response?.data?.items || [];
  const initialPagination = response?.data?.pagination || { 
    currentPage: 1, 
    totalPages: 1, 
    hasNext: false 
  };

  // Generate JSON-LD Structured Data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Explore Notes",
    "description": "Curated list of video-to-text notes.",
    "url": "https://paperxify.com/explore",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": initialItems.map((note, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://paperxify.com/note/${note.creator?.username || 'user'}/${note.slug}`,
        "name": note.title,
        "author": {
          "@type": "Person",
          "name": note.creator?.name || "Anonymous"
        }
      }))
    }
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Pass server-fetched data to the client component */}
      <ExploreClient 
        initialItems={initialItems} 
        initialPagination={initialPagination} 
      />
    </>
  );
}