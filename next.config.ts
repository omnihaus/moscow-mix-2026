import type { NextConfig } from 'next';

const legacyRedirects = [
  {
    source: '/home',
    destination: '/',
    permanent: true,
  },
  {
    source: '/best-copper-mugs-for-moscow-mules-what-to-look-for',
    destination: '/journal/real-copper-mugs-guide',
    permanent: true,
  },
  {
    source: '/moscow-mule-101-how-to-make-the-classic-cocktail-and-what-mug-you-actually-need',
    destination: '/journal/why-moscow-mules-are-served-in-copper-mugs',
    permanent: true,
  },
  {
    source: '/moscow-mule-twists-from-around-the-world',
    destination: '/journal/moscow-mule-variations-recipes',
    permanent: true,
  },
  {
    source: '/journal/art-of-fire',
    destination: '/journal/natural-fire-starters-work',
    permanent: true,
  },
  {
    source: '/journal/how-to-keep-your-copper-shining-for-decades',
    destination: '/journal/copper-care-complete-guide',
    permanent: true,
  },
  {
    source: '/journal/copper-care-guide',
    destination: '/journal/copper-care-complete-guide',
    permanent: true,
  },
  {
    source: '/product/premium-pure-copper-mugs-4-pk-w--brass-handles-\\(16oz\\)',
    destination: '/product/copper-mule-16oz',
    permanent: true,
  },
  {
    source: '/product/pure-copper-water-bottle-34oz',
    destination: '/product/copper-water-bottle-34oz',
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
