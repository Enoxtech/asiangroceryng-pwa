import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/account/', '/checkout/', '/order-success/', '/track-order/'],
      },
    ],
    sitemap: 'https://asiangroceryng.com/sitemap.xml',
  };
}
