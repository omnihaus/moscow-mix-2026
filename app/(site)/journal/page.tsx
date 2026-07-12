import type { Metadata } from 'next';
import BlogList from '@/views/BlogList';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Stories, guides, recipes, and practical advice about pure copper drinkware, Moscow Mules, natural fire starters, and considered living.',
  alternates: { canonical: '/journal' },
  openGraph: { type: 'website', siteName: 'Moscow Mix', images: ['/og-image.jpg'], url: '/journal', title: 'Journal', description: 'Stories, guides, recipes, and practical advice about pure copper drinkware, Moscow Mules, natural fire starters, and considered living.' },
};

export default function JournalPage() {
  return <BlogList currentPage={1} />;
}
