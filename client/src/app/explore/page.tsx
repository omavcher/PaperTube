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
  try {
    // Determine the base URL. Fallback to localhost:5000 if not set.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";
    
    // Construct the full URL. 
    // IMPORTANT: Check if your backend needs '/api' prefix. 
    // If your backend is at localhost:5000/api/notes..., keep '/api' below.
    // If it is localhost:5000/notes..., remove '/api'.
    const endpoint = `${baseUrl}/api/notes/explore?page=1&limit=12&sortBy=updatedAt&sortOrder=desc&type=notes`;

    console.log("🌐 SEO FETCHING:", endpoint); // This will show in your VS Code terminal

    const res = await fetch(endpoint, {
      cache: "no-store", // Ensures fresh data on every request
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`❌ API Error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error("Response:", text);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("🚨 SEO Fetch Exception:", error);
    return null;
  }
}

// --- 3. Advanced SEO Metadata ---
export const metadata: Metadata = {
  title: "Explore Engineering Notes & AI Summaries | PaperTube",
  description: "Browse thousands of AI-generated study notes from YouTube videos. Topics include Coding, GATE, Finance, and Tech.",
  keywords: ["AI notes", "engineering study", "tech summaries", "developer community", "learning resources"],
  alternates: {
    canonical: "https://papertube.in/explore",
  },
  openGraph: {
    title: "Explore Community Notes | PaperTube",
    description: "Read high-quality AI notes generated from video content.",
    url: "https://papertube.in/explore",
    siteName: "PaperTube",
    type: "website",
    images: [
      {
        url: "https://papertube.in/og-explore.jpg", // Replace with your actual OG image URL
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
    "url": "https://papertube.in/explore",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": initialItems.map((note, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://papertube.in/note/${note.creator?.username || 'user'}/${note.slug}`,
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