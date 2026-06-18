import { MetadataRoute } from 'next';
import { products } from '@/data/products';
import { categories } from '@/data/categories';

const BASE = 'https://asiangroceryng.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${BASE}/shop`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${BASE}/deals`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${BASE}/about`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${BASE}/contact`, priority: 0.6, changeFrequency: 'monthly' as const },
  ].map((p) => ({ ...p, lastModified: new Date() }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/shop/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/shop?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
