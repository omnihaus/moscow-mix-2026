import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogList from '@/views/BlogList';
import { getJournalPageCount } from '@/lib/journal-pagination';
import { getSiteConfig, isPublished } from '@/lib/site-data';

type PageProps = { params: Promise<{ page: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const config = await getSiteConfig();
  const pageCount = getJournalPageCount(config.blogPosts.filter((post) => isPublished(post)).length);
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = Number((await params).page);
  const canonical = `/journal/page/${page}`;
  const title = `Journal – Page ${page}`;
  const description = `Browse page ${page} of the Moscow Mix journal for copper drinkware guides, Moscow Mule ideas, recipes, fire-starting advice, and considered living.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: 'Moscow Mix', images: ['/og-image.jpg'], title, description, url: canonical },
  };
}

export default async function JournalPaginationPage({ params }: PageProps) {
  const page = Number((await params).page);
  const config = await getSiteConfig();
  const pageCount = getJournalPageCount(config.blogPosts.filter((post) => isPublished(post)).length);
  if (!Number.isInteger(page) || page < 2 || page > pageCount) notFound();
  return <BlogList currentPage={page} />;
}
