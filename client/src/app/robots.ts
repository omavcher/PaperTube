import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const commonDisallows = ['/admin/', '/profile/', '/note/', '/code-solution/', '/flashcards/', '/yt-practice-test/'];
  const userAgents = [
    // Search Engines
    'Googlebot',
    'Bingbot',
    'YandexBot',
    'Baiduspider',
    'DuckDuckBot',
    'Slurp',
    'Sogou web spider',
    'ia_archiver',
    // AI / LLM Crawlers
    'GPTBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'Applebot-Extended',
    'Google-Extended',
    'PerplexityBot',
    'cohere-ai',
    'Meta-ExternalAgent',
    'Bytespider',
    'Diffbot',
    'Amazonbot'
  ];

  return {
    rules: [
      ...userAgents.map(agent => ({
        userAgent: agent,
        allow: '/',
        disallow: commonDisallows,
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: commonDisallows,
      }
    ],
    sitemap: [
      'https://paperxify.com/sitemap.xml',
      'https://paperxify.com/sitemap-us.xml',
      'https://paperxify.com/sitemap-uk.xml',
      'https://paperxify.com/sitemap-au.xml',
      'https://paperxify.com/sitemap-ca.xml',
    ],
  };
}
