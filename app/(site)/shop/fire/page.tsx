import type { Metadata } from 'next';
import ShopCategory from '@/views/ShopCategory';

export const metadata: Metadata = {
  title: 'Natural Wood Wool Fire Starters',
  description: 'Shop natural wood wool fire starters for fireplaces, camping, grilling, pizza ovens, and outdoor fires.',
  alternates: { canonical: '/shop/fire' },
};

export default function FireShopPage() {
  return <ShopCategory category="fire" />;
}
