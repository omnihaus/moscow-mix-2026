import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://www.moscowmix.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Moscow Mix | Pure Copper Mugs and Natural Fire Starters',
    template: '%s | Moscow Mix',
  },
  description:
    'Moscow Mix creates solid 100% pure copper mugs and natural fire starters with authenticity and purity at their core.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Moscow Mix',
    url: SITE_URL,
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
