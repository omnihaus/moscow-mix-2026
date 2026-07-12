import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostPage from '@/views/BlogPost';
import { getModifiedAt, getPostSlug, getPublishedAt, getSiteConfig, isPublished } from '@/lib/site-data';

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

async function findPost(slug: string) {
  const config = await getSiteConfig();
  return config.blogPosts.find(
    (post) => isPublished(post) && (getPostSlug(post) === slug || post.id === slug),
  );
}

export async function generateStaticParams() {
  const config = await getSiteConfig();
  return config.blogPosts.filter((post) => isPublished(post)).map((post) => ({ slug: getPostSlug(post) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return {};

  const canonical = `/journal/${getPostSlug(post)}`;
  const description = post.metaDescription || post.excerpt;

  return {
    title: post.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: canonical,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
      publishedTime: getPublishedAt(post),
      modifiedTime: getModifiedAt(post),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();

  const config = await getSiteConfig();
  const postTerms = new Set([...(post.tags || []), ...post.title.toLowerCase().split(/\W+/)].map((term) => term.toLowerCase()));
  const relatedPosts = config.blogPosts
    .filter((candidate) => isPublished(candidate) && candidate.id !== post.id)
    .map((candidate) => ({
      post: candidate,
      score: [...(candidate.tags || []), ...candidate.title.toLowerCase().split(/\W+/)]
        .filter((term) => postTerms.has(term.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || new Date(getPublishedAt(b.post)).getTime() - new Date(getPublishedAt(a.post)).getTime())
    .slice(0, 3)
    .map(({ post: candidate }) => candidate);

  return <BlogPostPage post={post} publishedAt={getPublishedAt(post)} modifiedAt={getModifiedAt(post)} relatedPosts={relatedPosts} />;
}
