import type { Metadata } from 'next';
import Privacy from '@/views/Privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Moscow Mix privacy policy, including how website, contact, and order-related information is handled.',
  alternates: { canonical: '/privacy' },
  openGraph: { type: 'website', siteName: 'Moscow Mix', images: ['/og-image.jpg'], url: '/privacy', title: 'Privacy Policy', description: 'Read the Moscow Mix privacy policy, including how website, contact, and order-related information is handled.' },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <Privacy />;
}
