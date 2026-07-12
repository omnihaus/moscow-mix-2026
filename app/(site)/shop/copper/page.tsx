import type { Metadata } from 'next';
import ShopCategory from '@/views/ShopCategory';

export const metadata: Metadata = {
  title: 'Premium Pure Copper Mugs & Drinkware',
  description: 'Shop 100% pure copper mugs, water bottles, and jugs crafted for cold drinks, considered hydration, and lasting use.',
  alternates: { canonical: '/shop/copper' },
};

export default function CopperShopPage() {
  return <ShopCategory category="copper" />;
}
