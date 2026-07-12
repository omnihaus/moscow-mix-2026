import type { Metadata } from 'next';
import About from '@/views/About';

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Discover Moscow Mix and our focus on pure copper drinkware, natural materials, practical craft, and products designed to last.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <About />;
}
