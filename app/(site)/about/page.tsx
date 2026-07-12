import type { Metadata } from 'next';
import About from '@/views/About';

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Discover Moscow Mix and our focus on pure copper drinkware, natural materials, practical craft, and products designed to last.',
  alternates: { canonical: '/about' },
  openGraph: { type: 'website', siteName: 'Moscow Mix', images: ['/og-image.jpg'], url: '/about', title: 'Our Story', description: 'Discover Moscow Mix and our focus on pure copper drinkware, natural materials, practical craft, and products designed to last.' },
};

export default function AboutPage() {
  return <About />;
}
