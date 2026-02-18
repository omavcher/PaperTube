import type { Metadata } from "next";
import BlogResourcesClient from "./BlogResourcesClient";

// --- Types ---
interface BlogPost {
  _id: string;
  title: string;
  subtitle: string;
  slug: string;
  coverImage: string;
  meta: {
    readTime: string;
    views: number;
  };
  tags: string[];
  date: string;
}

interface ApiResponse {
  success: boolean;
  data: BlogPost[];
}

// --- 1. Server-Side Fetch ---
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";
    
    // Check if your backend needs /api or not
    const endpoint = `${baseUrl}/api/general/blog/all`; // Assuming /api prefix

    console.log(`🌐 [SEO FETCH] Blogs: ${endpoint}`);

    // 'no-store' ensures fresh content on every request. 
    // Use 'force-cache' or 'revalidate' if your blogs don't change often.
    const res = await fetch(endpoint, { cache: "no-store" });

    if (!res.ok) {
      console.error(`❌ [SEO FETCH FAILED] ${res.status}`);
      return [];
    }

    const json: ApiResponse = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("🚨 [SEO ERROR]", error);
    return [];
  }
}

// --- 2. Metadata ---
export const metadata: Metadata = {
  title: "Engineering Blog & Study Resources | PaperTube",
  description: "Read the latest tech news, exam preparation tips, success stories, and engineering guides. Curated for students and developers.",
  openGraph: {
    title: "PaperTube Engineering Blog",
    description: "Intelligence for Engineers: Study Tips, Tech News & More.",
    url: "https://papertube.in/blog",
    siteName: "PaperTube",
    type: "website",
    images: [
      {
        url: "https://papertube.in/og-blog.jpg", // Add a real OG image
        width: 1200,
        height: 630,
        alt: "PaperTube Blog",
      },
    ],
  },
};

// --- 3. Page Component ---
export default async function BlogPage() {
  const posts = await getBlogPosts();

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "PaperTube Engineering Blog",
    "description": "Resources for engineering students.",
    "blogPost": posts.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.subtitle,
      "image": post.coverImage,
      "datePublished": post.date, // Ensure date format is ISO 8601 if possible
      "url": `https://papertube.in/blog/${post.slug}`,
      "author": {
        "@type": "Organization",
        "name": "PaperTube Team"
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Pass initial data to client */}
      <BlogResourcesClient initialPosts={posts} />
    </>
  );
}