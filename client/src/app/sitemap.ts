import { MetadataRoute } from 'next';

async function getStories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";
    const res = await fetch(`${baseUrl}/api/general/story/all`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (e) { 
    return []; 
  }
}

async function getBlogs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";
    const res = await fetch(`${baseUrl}/api/general/blog/all`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (e) { 
    return []; 
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://paperxify.com';

  const baseRoutes = [
    '',
    '/about',
    '/pricing',
    '/contact',
    '/tools',
    '/terms',
    '/privacy',
    '/report-bug',
    '/share-story',
    '/success-stories',
    '/support',
    '/games',
    '/blog',
    '/explore',
    '/leaderboard'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const tools = [
    'base-converter', 'code-to-image', 'emi-calculator', 'fake-internship-letter-generator',
    'generate-qr', 'git-forge', 'github-wrapped', 'image-converter', 'json-formatter',
    'logic-gate-lab', 'markdown-editor', 'matrix-calculator', 'merge', 'password-generator',
    'resume-checker', 'sentinel', 'split', 'sql-architect', 'syllabus-tracker', 'typing-test'
  ].map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const games = [
    'binary-blitz', 'circuit-breaker', 'complexity-dash', 'flag-mastery', 'keyword-crypt',
    'logic-leap', 'sort-fu', 'sql-sniper', 'symbol-strike'
  ].map((game) => ({
    url: `${baseUrl}/games/${game}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Fetch dynamic content
  const stories = await getStories();
  const storyRoutes = stories.map((story: any) => ({
    url: `${baseUrl}/success-stories/${story.slug}`,
    lastModified: new Date(story.date || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const blogs = await getBlogs();
  const blogRoutes = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.date || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...baseRoutes,
    ...tools,
    ...games,
    ...storyRoutes,
    ...blogRoutes
  ];
}
