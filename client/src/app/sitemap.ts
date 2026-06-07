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
    '/blog',
    '/leaderboard',
    '/notegpt-alternative',
    '/youtube-to-notes',
    '/ai-study-notes',
    '/us',
    '/uk',
    '/au',
    '/ca',
    '/de',
    '/eu'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || ['/us', '/uk', '/au', '/ca', '/de', '/eu'].includes(route) ? 1 : 0.8,
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

  const studyTools = [
    'homework-helper', 'math-solver', 'exam-planner', 'language-tutor'
  ].map((tool) => ({
    url: `${baseUrl}/ai-study/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const writerTools = [
    'ai-detector', 'ai-humanizer', 'essay-writer', 'plagiarism'
  ].map((tool) => ({
    url: `${baseUrl}/ai-writer/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const diagramFormats = [
    'flowchart', 'sequence', 'class', 'state', 'er', 'journey', 'pie', 'quadrant', 'timeline', 'sankey', 'xy', 'block'
  ].map((format) => ({
    url: `${baseUrl}/ai-diagram/${format}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const extraAppRoutes = [
    '/youtube-to-quiz',
    '/youtube-to-notes',
    '/presentation-generator'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
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
    ...storyRoutes,
    ...blogRoutes,
    ...studyTools,
    ...writerTools,
    ...diagramFormats,
    ...extraAppRoutes
  ];
}
