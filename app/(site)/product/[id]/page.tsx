import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/views/ProductDetail';
import { getPublishedAt, getSiteConfig, isPublished } from '@/lib/site-data';

type PageProps = { params: Promise<{ id: string }> };

export const revalidate = 300;

async function findProduct(id: string) {
  const config = await getSiteConfig();
  return config.products.find((product) => product.id === id);
}

export async function generateStaticParams() {
  const config = await getSiteConfig();
  return config.products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await findProduct(id);
  if (!product) return {};

  const canonical = `/product/${product.id}`;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      url: canonical,
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await findProduct(id);
  if (!product) notFound();
  const config = await getSiteConfig();
  const productTerms = new Set(`${product.name} ${product.category}`.toLowerCase().split(/\W+/).filter((term) => term.length > 2));
  const relatedPosts = config.blogPosts
    .filter((post) => isPublished(post))
    .map((post) => ({
      post,
      score: `${post.title} ${post.excerpt} ${(post.tags || []).join(' ')}`.toLowerCase().split(/\W+/)
        .filter((term) => productTerms.has(term)).length,
    }))
    .sort((a, b) => b.score - a.score || new Date(getPublishedAt(b.post)).getTime() - new Date(getPublishedAt(a.post)).getTime())
    .slice(0, 3)
    .map(({ post }) => post);
  return <ProductDetail product={product} relatedPosts={relatedPosts} />;
}
