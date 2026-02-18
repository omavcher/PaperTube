import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import BlogClient from "./BlogClient";

// --- Types ---
interface ContentBlock {
  id: string;
  type: "paragraph" | "heading" | "quote" | "image" | "youtube" | "code" | "list" | "table";
  text?: string;
  level?: number;
  author?: string;
  src?: string;
  caption?: string;
  code?: string;
  language?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

interface BlogPost {
  _id: string;
  title: string;
  subtitle: string;
  slug: string;
  author: { name: string; role: string; avatar: string };
  meta: { date: string; readTime: string; views: number };
  coverImage: string;
  toc: { id: string; label: string }[];
  content: ContentBlock[];
}

interface ApiResponse {
  success: boolean;
  data: BlogPost;
}

// --- 1. Robust Server-Side Fetch ---
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";
  
  // Handle /api prefix logic based on your previous issues
  const urlPath = baseUrl.endsWith("/api") 
    ? `/general/blog/${slug}` 
    : `/api/general/blog/${slug}`;

  const endpoint = `${baseUrl}${urlPath}`;

  try {
    // 'no-store' for fresh data, 'force-cache' for speed
    const res = await fetch(endpoint, {
      cache: "no-store", 
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) return null;

    const json: ApiResponse = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("🚨 [BLOG FETCH ERROR]", error);
    return null;
  }
}

// --- 2. Dynamic Metadata ---
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Article Not Found | PaperTube" };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${post.title} | PaperTube Blog`,
    description: post.subtitle || "Engineering insights and resources.",
    openGraph: {
      title: post.title,
      description: post.subtitle,
      url: `https://papertube.in/blog/${post.slug}`,
      siteName: "PaperTube",
      type: "article",
      publishedTime: post.meta.date, // Ensure API sends ISO format if possible
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.subtitle,
      images: [post.coverImage],
    },
  };
}

// --- 3. Main Page Component ---
export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // JSON-LD Structured Data (BlogPosting)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "alternativeHeadline": post.subtitle,
    "image": [post.coverImage],
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "PaperTube",
      "logo": {
        "@type": "ImageObject",
        "url": "https://papertube.in/logo.png"
      }
    },
    "datePublished": post.meta.date,
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://papertube.in/blog/${post.slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogClient post={post} />
    </>
  );
}