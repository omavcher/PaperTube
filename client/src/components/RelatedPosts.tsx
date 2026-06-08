import React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Eye } from "lucide-react";
import { BlogPost } from "@/lib/internal-linking";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="space-y-6 bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-zinc-800">
      <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
        <BookOpen size={18} className="text-red-500" />
        Related Resources
      </h3>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 p-2 rounded-xl hover:bg-zinc-800/40 transition-all duration-300"
          >
            {post.coverImage && (
              <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 border border-zinc-700">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex flex-col justify-center min-w-0">
              <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                {post.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {post.meta.views} views
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
