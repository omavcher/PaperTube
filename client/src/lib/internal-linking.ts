import pageRelationships from "@/config/page-relationships.json";

export interface Tool {
  id: string;
  title: string;
  url: string;
  cta: string;
  tags: string[];
  anchors: string[];
}

export interface BlogPost {
  _id: string;
  title: string;
  subtitle: string;
  slug: string;
  coverImage: string;
  meta: {
    readTime: string;
    views: number;
    shares?: number;
    conversions?: number;
  };
  tags: string[];
  date: string;
}

/**
 * Retrieves 3-5 dynamically related blog posts based on tag overlap score.
 * Fallbacks to highest viewed posts.
 */
export function getRelatedPosts(currentPostId: string, allPosts: BlogPost[], limit = 4): BlogPost[] {
  const currentPost = allPosts.find(p => p._id === currentPostId || p.slug === currentPostId);
  if (!currentPost) {
    return allPosts.filter(p => p._id !== currentPostId && p.slug !== currentPostId).slice(0, limit);
  }

  const currentTags = currentPost.tags || [];

  const postsWithScores = allPosts
    .filter(p => p._id !== currentPost._id && p.slug !== currentPost.slug)
    .map(p => {
      const otherTags = p.tags || [];
      const score = otherTags.filter(t => currentTags.includes(t)).length;
      return { post: p, score };
    });

  postsWithScores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.post.meta.views - a.post.meta.views;
  });

  return postsWithScores.map(x => x.post).slice(0, limit);
}

/**
 * Retrieves related tools dynamically matching a set of tags or string slug.
 */
export function getRelatedTools(tagsOrSlug: string[] | string, limit = 3): Tool[] {
  const tools = pageRelationships.tools as Tool[];
  
  let queryTags: string[] = [];
  if (Array.isArray(tagsOrSlug)) {
    queryTags = tagsOrSlug.map(t => t.toLowerCase());
  } else if (typeof tagsOrSlug === 'string') {
    queryTags = tagsOrSlug.toLowerCase().split(/[/-_\s]+/);
  }

  const scoredTools = tools.map(tool => {
    const score = tool.tags.filter(t => queryTags.includes(t.toLowerCase())).length;
    return { tool, score };
  });

  scoredTools.sort((a, b) => b.score - a.score);

  return scoredTools.map(x => x.tool).slice(0, limit);
}

/**
 * Selects a random natural SEO anchor keyword mapping to distribute link juice.
 */
export function getRandomAnchor(pageId: string): string {
  const tools = pageRelationships.tools as Tool[];
  const sitePages = pageRelationships.sitePages as any[];
  
  const page = tools.find(t => t.id === pageId) || sitePages.find(p => p.id === pageId);
  if (!page || !page.anchors || page.anchors.length === 0) {
    return page?.title || "Learn more";
  }
  
  const index = Math.floor(Math.random() * page.anchors.length);
  return page.anchors[index];
}
