import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/note/'], 
    },
    sitemap: 'https://paperxify.com/sitemap.xml',
  };
}
