import type { Metadata } from "next";
import SuccessStoriesClient from "./SuccessStoriesClient";

// --- 1. Define Types ---
interface Story {
  _id: string;
  name: string;
  avatar: string;
  exam: string;
  rank: string;
  heroTitle: string;
  slug: string;
  summary?: string;
}

interface ApiResponse {
  success: boolean;
  data: Story[];
}

// --- 2. Server-Side Fetch ---
async function getSuccessStories(): Promise<Story[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";
    
    // Using 'no-store' ensures we get fresh stories every time. 
    // Use 'force-cache' if these stories rarely change.
    const res = await fetch(`${baseUrl}/api/general/story/all`, {
      cache: "no-store", 
    });

    if (!res.ok) {
      console.error(`Error fetching stories: ${res.status}`);
      return [];
    }

    const json: ApiResponse = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return [];
  }
}

// --- 3. Dynamic Metadata ---
export const metadata: Metadata = {
  title: "Success Stories: GATE, UPSC & Engineering Toppers | PaperTube",
  description: "Read inspiring journeys of students who cracked GATE, UPSC, and Coding interviews using PaperTube notes. Real stories, real results.",
  alternates: {
    canonical: "https://papertube.in/success-stories",
  },
  openGraph: {
    title: "Student Success Stories",
    description: "See how thousands of engineers are acing their exams.",
    url: "https://papertube.in/success-stories",
    siteName: "PaperTube",
    type: "website",
    images: [
      {
        url: "https://papertube.in/og-success.jpg", // Add a real image URL
        width: 1200,
        height: 630,
        alt: "PaperTube Success Stories",
      },
    ],
  },
};

// --- 4. Page Component ---
export default async function SuccessStoriesPage() {
  const stories = await getSuccessStories();

  // JSON-LD for "ItemList" (Great for SEO lists)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Student Success Stories",
    "description": "A collection of success stories from top rankers.",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": stories.map((story, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://papertube.in/success-stories/${story.slug}`,
        "name": `${story.name} - ${story.exam} Rank ${story.rank}`,
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
      {/* Pass data to Client Component */}
      <SuccessStoriesClient initialStories={stories} />
    </>
  );
}