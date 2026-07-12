import 'server-only';

import { cache } from 'react';
import type { BlogPost, SiteConfig } from '../types';
import { ASSETS, BLOG_POSTS, DEFAULT_STORY, PRODUCTS } from '../constants';

const FIREBASE_DOCUMENT =
  'https://firestore.googleapis.com/v1/projects/moscowmix-web/databases/(default)/documents/moscow_mix/live_site';
const FIREBASE_POSTS_COLLECTION =
  'https://firestore.googleapis.com/v1/projects/moscowmix-web/databases/(default)/documents/moscow_mix/live_site/posts?pageSize=500';

type FirestoreValue = {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  stringValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

const FALLBACK_CONFIG: SiteConfig = {
  heroHeadline: 'Where Craft Meets <br/> Elemental Power',
  heroSubheadline:
    'Authentic copper drinkware and natural fire starters—crafted with purity and purpose.',
  assets: ASSETS,
  products: PRODUCTS,
  blogPosts: BLOG_POSTS,
  story: DEFAULT_STORY,
};

const CONTENT_LINK_REPLACEMENTS: Array<[string, string]> = [
  [
    '/product/premium-pure-copper-mugs-4-pk-w--brass-handles-(16oz)',
    '/product/copper-mule-16oz',
  ],
  ['/product/pure-copper-water-bottle-34oz', '/product/copper-water-bottle-34oz'],
  ['/journal/how-to-keep-your-copper-shining-for-decades', '/journal/copper-care-complete-guide'],
  ['/journal/copper-care-guide', '/journal/copper-care-complete-guide'],
  ['/journal/art-of-fire', '/journal/natural-fire-starters-work'],
];

function normalizePost(post: BlogPost): BlogPost {
  let content = post.content || '';
  for (const [legacyPath, currentPath] of CONTENT_LINK_REPLACEMENTS) {
    content = content.replaceAll(legacyPath, currentPath);
  }
  return { ...post, content };
}

function decodeValue(value: FirestoreValue): unknown {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('stringValue' in value) return value.stringValue;
  if ('arrayValue' in value) return (value.arrayValue?.values ?? []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue?.fields ?? {});
  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  try {
    const [response, postsResponse] = await Promise.all([
      fetch(FIREBASE_DOCUMENT, {
        next: { revalidate: 300 },
        headers: { Accept: 'application/json' },
      }),
      fetch(FIREBASE_POSTS_COLLECTION, {
        next: { revalidate: 300 },
        headers: { Accept: 'application/json' },
      }),
    ]);

    if (!response.ok) throw new Error(`Firebase returned ${response.status}`);

    const document = (await response.json()) as { fields?: Record<string, FirestoreValue> };
    const live = decodeFields(document.fields ?? {}) as unknown as Partial<SiteConfig>;
    const postsPayload = postsResponse.ok
      ? await postsResponse.json() as { documents?: Array<{ fields?: Record<string, FirestoreValue> }> }
      : { documents: [] };
    const separatePostRecords = (postsPayload.documents || []).map(postDocument =>
      decodeFields(postDocument.fields ?? {}) as unknown as BlogPost & { deleted?: boolean }
    );
    const deletedPostIds = new Set(separatePostRecords.filter(post => post.deleted).map(post => post.id));
    const separatePosts = separatePostRecords.filter(post => !post.deleted).map(normalizePost);
    const separateIds = new Set(separatePosts.map(post => post.id));
    const legacyPosts = (live.blogPosts?.length ? live.blogPosts : FALLBACK_CONFIG.blogPosts)
      .filter(post => !deletedPostIds.has(post.id))
      .map(normalizePost);
    const mergedPosts = [
      ...separatePosts,
      ...legacyPosts.filter(post => !separateIds.has(post.id)),
    ].sort((a, b) => new Date(getPublishedAt(b)).getTime() - new Date(getPublishedAt(a)).getTime());

    return {
      heroHeadline: live.heroHeadline || FALLBACK_CONFIG.heroHeadline,
      heroSubheadline: live.heroSubheadline || FALLBACK_CONFIG.heroSubheadline,
      assets: { ...FALLBACK_CONFIG.assets, ...(live.assets || {}) },
      products: live.products?.length ? live.products : FALLBACK_CONFIG.products,
      blogPosts: mergedPosts,
      story: { ...FALLBACK_CONFIG.story, ...(live.story || {}) },
    };
  } catch (error) {
    console.error('Using fallback site content because Firebase could not be read.', error);
    return FALLBACK_CONFIG;
  }
});

export function isPublished(post: BlogPost, now = new Date()): boolean {
  return (
    !post.status ||
    post.status === 'published' ||
    (post.status === 'scheduled' && Boolean(post.scheduledDate) && new Date(post.scheduledDate!).getTime() <= now.getTime())
  );
}

export function getPostSlug(post: Pick<BlogPost, 'id' | 'slug'>): string {
  return post.slug || post.id;
}

export function getPublishedAt(post: BlogPost): string {
  if (post.publishedAt) return post.publishedAt;
  const parsed = new Date(post.date);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return '2025-01-01T12:00:00.000Z';
}

export function toPublicShellConfig(config: SiteConfig): SiteConfig {
  return {
    heroHeadline: config.heroHeadline,
    heroSubheadline: config.heroSubheadline,
    assets: config.assets,
    products: config.products,
    blogPosts: config.blogPosts.filter((post) => isPublished(post)).map((post) => ({ ...post, content: '' })),
    story: config.story,
  };
}
