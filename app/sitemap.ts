import type { MetadataRoute } from 'next';
import { getModifiedAt, getPostSlug, getSiteConfig, isPublished } from '@/lib/site-data';

const SITE_URL = 'https://www.moscowmix.com';

// Next's sitemap serializer currently writes image URLs verbatim. Firebase
// download URLs contain query-string ampersands, which must be XML entities or
// browsers and crawlers reject the entire sitemap as malformed XML.
const xmlSafeImageUrl = (url: string) => url.replace(/&/g, '&amp;');

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
    images: product.images.filter(Boolean).map(xmlSafeImageUrl),
  }));

  const publishedPosts = config.blogPosts.filter((post) => isPublished(post));
  const pageCount = 1 + Math.ceil(Math.max(0, Math.max(0, publishedPosts.length - 1) - 6) / 9);
  const paginationPages: MetadataRoute.Sitemap = Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => ({
    url: `${SITE_URL}/journal/page/${index + 2}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const articlePages: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${SITE_URL}/journal/${encodeURIComponent(getPostSlug(post))}`,
    lastModified: new Date(getModifiedAt(post)),
    changeFrequency: 'monthly',
    priority: 0.7,
    images: post.coverImage ? [xmlSafeImageUrl(post.coverImage)] : [],
  }));

  return [...staticPages, ...paginationPages, ...productPages, ...articlePages];
}
