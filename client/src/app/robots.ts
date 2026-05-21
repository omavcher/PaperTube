import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/profile/', '/note/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/profile/', '/note/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/profile/', '/note/'],
      },
    ],
    sitemap: 'https://paperxify.com/sitemap.xml',
  };
}
