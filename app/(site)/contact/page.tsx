import type { Metadata } from 'next';
import Contact from '@/views/Contact';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Moscow Mix for product, care, order, or partnership questions.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return <Contact />;
}
