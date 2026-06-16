export async function generateRegionalSitemapXml(region: string): Promise<string> {
  const baseUrl = 'https://paperxify.com';
  const prefix = region ? `/${region}` : '';

  // We only target the home page and youtube-to-notes for regional pages
  const urls: string[] = [
    `${baseUrl}${prefix}`,
    `${baseUrl}${prefix}/youtube-to-notes`
  ];

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
