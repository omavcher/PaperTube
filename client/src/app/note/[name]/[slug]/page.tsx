import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import NoteClient from "./NoteClient";

// --- Types ---
interface Creator {
  _id: string;
  name: string;
  avatarUrl: string;
  username: string;
  isVerified: boolean;
  isFollowing: boolean;
}

interface PublicNoteData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  videoUrl?: string;
  createdAt: string;
  views: number;
  likes: number;
  isLiked: boolean;
  commentsCount: number;
  creator: Creator;
  pdf_data?: {
    fileName: string;
    viewLink: string;
    thumbnailLink?: string;
  } | null;
}

interface ApiResponse {
  success: boolean;
  data: PublicNoteData;
}

// --- 1. Robust Server-Side Fetch ---
async function getNote(slug: string): Promise<PublicNoteData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";
  
  // Smart URL construction to handle /api prefix
  const urlPath = baseUrl.endsWith("/api") 
    ? `/notes/allw/${slug}` 
    : `/api/notes/allw/${slug}`;

  const endpoint = `${baseUrl}${urlPath}`;

  try {
    // 'no-store' ensures real-time views/likes are fetched, 
    // change to 'force-cache' if you want extreme speed but stale data
    const res = await fetch(endpoint, {
      cache: "no-store", 
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) return null;

    const json: ApiResponse = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("🚨 [SEO FETCH ERROR]", error);
    return null;
  }
}

// --- 2. Dynamic SEO Metadata ---
export async function generateMetadata(
  { params }: { params: Promise<{ name: string; slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug);

  if (!note) {
    return { title: "Note Not Found | PaperTube" };
  }

  // Strip HTML tags for description (simple regex)
  const plainTextDescription = note.content.replace(/<[^>]+>/g, '').slice(0, 160);
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${note.title} by @${note.creator.username} | PaperTube Notes`,
    description: plainTextDescription,
    openGraph: {
      title: note.title,
      description: plainTextDescription,
      url: `https://papertube.in/note/${note.creator.username}/${note.slug}`,
      siteName: "PaperTube",
      type: "article",
      publishedTime: note.createdAt,
      authors: [note.creator.name],
      images: [
        {
          url: note.pdf_data?.thumbnailLink || note.creator.avatarUrl,
          width: 1200,
          height: 630,
          alt: note.title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: plainTextDescription,
      images: [note.pdf_data?.thumbnailLink || note.creator.avatarUrl],
    },
  };
}

// --- 3. Main Page Component ---
export default async function NotePage({ params }: { params: Promise<{ name: string; slug: string }> }) {
  const { name, slug } = await params;
  const note = await getNote(slug);

  if (!note) {
    notFound();
  }

  // JSON-LD Structured Data (TechArticle)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": note.title,
    "image": [note.pdf_data?.thumbnailLink || note.creator.avatarUrl],
    "author": {
      "@type": "Person",
      "name": note.creator.name,
      "url": `https://papertube.in/${note.creator.username}/profile`
    },
    "datePublished": note.createdAt,
    "description": note.content.replace(/<[^>]+>/g, '').slice(0, 200),
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": note.likes
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": note.views
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Pass the server-fetched data to the client */}
      <NoteClient initialData={note} username={name} slug={slug} />
    </>
  );
}