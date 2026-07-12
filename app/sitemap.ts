import type { MetadataRoute } from 'next';
import { getPostSlug, getPublishedAt, getSiteConfig, isPublished } from '@/lib/site-data';

const SITE_URL = 'https://www.moscowmix.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getSiteConfig();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/shop/copper`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/shop/fire`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/journal`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const productPages: MetadataRoute.Sitemap = config.products.map((product) => ({
    url: `${SITE_URL}/product/${encodeURIComponent(product.id)}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = config.blogPosts.filter((post) => isPublished(post)).map((post) => ({
    url: `${SITE_URL}/journal/${encodeURIComponent(getPostSlug(post))}`,
    lastModified: new Date(getPublishedAt(post)),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...articlePages];
}
