export async function generateRegionalSitemapXml(region: string): Promise<string> {
  const baseUrl = 'https://paperxify.com';
  const prefix = region ? `/${region}` : '';

  const paths: string[] = [
    '',
    '/youtube-to-notes',
    '/presentation-generator',
    '/ai-diagram',
    '/ai-diagram/flowchart',
    '/ai-diagram/sequence',
    '/ai-diagram/class',
    '/ai-diagram/state',
    '/ai-diagram/er',
    '/ai-diagram/journey',
    '/ai-diagram/pie',
    '/ai-diagram/quadrant',
    '/ai-diagram/timeline',
    '/ai-diagram/sankey',
    '/ai-diagram/xy',
    '/ai-diagram/block',
    '/ai-writer',
    '/ai-writer/ai-detector',
    '/ai-writer/ai-humanizer',
    '/ai-writer/essay-writer',
    '/ai-writer/plagiarism',
    '/ai-study',
    '/ai-study/homework-helper',
    '/ai-study/math-solver',
    '/ai-study/exam-planner',
    '/ai-study/language-tutor'
  ];

  const urls = paths.map(path => `${baseUrl}${prefix}${path}`);

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
