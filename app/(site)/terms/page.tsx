import type { Metadata } from 'next';
import Terms from '@/views/Terms';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms that apply when using the Moscow Mix website and its product information, content, and services.',
  alternates: { canonical: '/terms' },
  openGraph: { type: 'website', siteName: 'Moscow Mix', images: ['/og-image.jpg'], url: '/terms', title: 'Terms of Service', description: 'Read the terms that apply when using the Moscow Mix website and its product information, content, and services.' },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <Terms />;
}
