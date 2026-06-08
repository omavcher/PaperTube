export async function getStories() {
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

export async function getBlogs() {
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

export async function generateRegionalSitemapXml(region: string): Promise<string> {
  const baseUrl = 'https://paperxify.com';
  const prefix = region ? `/${region}` : '';

  const basePaths = [
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
    '/youtube-to-quiz',
    '/presentation-generator'
  ];

  const tools = [
    'base-converter', 'code-to-image', 'emi-calculator', 'fake-internship-letter-generator',
    'generate-qr', 'git-forge', 'github-wrapped', 'image-converter', 'json-formatter',
    'logic-gate-lab', 'markdown-editor', 'matrix-calculator', 'merge', 'password-generator',
    'resume-checker', 'sentinel', 'split', 'sql-architect', 'syllabus-tracker', 'typing-test'
  ];

  const studyTools = [
    'homework-helper', 'math-solver', 'exam-planner', 'language-tutor'
  ];

  const writerTools = [
    'ai-detector', 'ai-humanizer', 'essay-writer', 'plagiarism'
  ];

  const diagramFormats = [
    'flowchart', 'sequence', 'class', 'state', 'er', 'journey', 'pie', 'quadrant', 'timeline', 'sankey', 'xy', 'block'
  ];

  const stories = await getStories();
  const blogs = await getBlogs();

  const urls: string[] = [];

  basePaths.forEach(p => urls.push(`${baseUrl}${prefix}${p}`));
  tools.forEach(t => urls.push(`${baseUrl}${prefix}/tools/${t}`));
  studyTools.forEach(t => urls.push(`${baseUrl}${prefix}/ai-study/${t}`));
  writerTools.forEach(t => urls.push(`${baseUrl}${prefix}/ai-writer/${t}`));
  diagramFormats.forEach(f => urls.push(`${baseUrl}${prefix}/ai-diagram/${f}`));
  stories.forEach((s: any) => urls.push(`${baseUrl}${prefix}/success-stories/${s.slug}`));
  blogs.forEach((b: any) => urls.push(`${baseUrl}${prefix}/blog/${b.slug}`));

  const urlTags = urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;
}
