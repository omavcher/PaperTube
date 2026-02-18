import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import SuccessStoryClient from "./SuccessStoryClient";

// --- Types ---
interface JourneyStep {
  _id: string;
  title: string;
  content: string;
}

interface StoryDetail {
  _id: string;
  name: string;
  handle: string;
  avatar: string;
  exam: string;
  rank: string;
  heroTitle: string;
  summary: string;
  fullJourney: JourneyStep[];
  date: string;
  slug: string;
}

interface ApiResponse {
  success: boolean;
  data: StoryDetail;
}

// Define Page Props for Next.js 15
type Props = {
  params: Promise<{ slug: string }>;
};

// --- 1. Robust Fetch Function ---
async function getStory(slug: string): Promise<StoryDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";
  
  // Smart path construction
  const urlPath = baseUrl.endsWith("/api") 
    ? `/general/story-slug/${slug}` 
    : `/api/general/story-slug/${slug}`;

  const endpoint = `${baseUrl}${urlPath}`;

  console.log(`🌐 [SEO FETCH] Fetching: ${endpoint}`);

  try {
    const res = await fetch(endpoint, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      console.error(`❌ [FETCH FAILED] ${res.status}`);
      return null;
    }

    const json: ApiResponse = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("🚨 [FETCH ERROR]", error);
    return null;
  }
}

// --- 2. Dynamic Metadata (Next.js 15 Fixed) ---
export async function generateMetadata(
  { params }: Props, // Params is now a Promise
  parent: ResolvingMetadata
): Promise<Metadata> {
  // ✅ FIX: Await params before accessing slug
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story) {
    return { title: "Story Not Found | PaperTube" };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${story.name}'s Success Story: ${story.exam} Rank ${story.rank}`,
    description: story.summary.slice(0, 160) + "...",
    openGraph: {
      title: `How ${story.name} Cracked ${story.exam} (AIR ${story.rank})`,
      description: story.heroTitle,
      url: `https://papertube.in/success-stories/${story.slug}`,
      siteName: "PaperTube",
      images: [
        {
          url: story.avatar,
          width: 1200,
          height: 630,
          alt: story.name,
        },
        ...previousImages,
      ],
      type: "article",
      publishedTime: story.date,
      authors: [story.name],
    },
  };
}

// --- 3. Main Page Component (Next.js 15 Fixed) ---
export default async function SuccessStoryPage({ params }: Props) {
  // ✅ FIX: Await params before accessing slug
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story) {
    notFound(); 
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": story.heroTitle,
    "image": [story.avatar],
    "author": {
      "@type": "Person",
      "name": story.name,
      "url": story.handle ? `https://twitter.com/${story.handle.replace('@', '')}` : undefined
    },
    "publisher": {
      "@type": "Organization",
      "name": "PaperTube",
      "logo": {
        "@type": "ImageObject",
        "url": "https://papertube.in/logo.png"
      }
    },
    "datePublished": story.date,
    "description": story.summary,
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://papertube.in/success-stories/${story.slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SuccessStoryClient story={story} />
    </>
  );
}