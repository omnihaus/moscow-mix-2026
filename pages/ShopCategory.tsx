
import React from 'react';
import { ProductCategory } from '../types';
import ProductCard from '../components/ProductCard';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ArrowDown } from 'lucide-react';
import CopperCare from '../components/CopperCare';
import FireExperience from '../components/FireExperience';
import TrustBar from '../components/TrustBar';
import FAQSection, { COPPER_PRODUCT_FAQS, FIRE_PRODUCT_FAQS } from '../components/FAQSection';
import SEO from '../components/SEO';

interface ShopCategoryProps {
  category: 'copper' | 'fire';
}

export default function ShopCategory({ category }: ShopCategoryProps) {
  const { config } = useSiteConfig();
  const targetCategory = category === 'copper' ? ProductCategory.COPPER : ProductCategory.FIRE;
  const products = config.products.filter(p => p.category === targetCategory);

  const heroImage = category === 'copper'
    ? config.assets.copperHero
    : config.assets.fireStarterHero;

  const title = category === 'copper' ? "The Copper Collection" : "Fire & Flame";
  const desc = category === 'copper'
    ? "Timeless vessels forged from elemental earth. Designed to conduct cold, elevate taste, and endure for generations."
    : "Ignite your adventure. Sustainable, odorless, and powerful fire starters for the hearth or the wild.";

  // SEO meta content
  const seoTitle = category === 'copper'
    ? "Premium Pure Copper Mugs & Drinkware"
    : "Natural Wood Wool Fire Starters";
  const seoDescription = category === 'copper'
    ? "Shop our collection of 100% pure copper mugs, water bottles, and jugs. Hand-crafted, naturally antimicrobial, and built to last generations. Free shipping on orders over $50."
    : "Eco-friendly wood wool fire starters made from natural materials. Odorless, non-toxic, and perfect for fireplaces, camping, and grilling. Burns up to 10 minutes.";

  const scrollToProducts = () => {
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pt-24 min-h-screen bg-stone-950">
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={`https://www.moscowmix.com/shop/${category}`}
      />

      {/* Hero Section with CTA */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/60 to-stone-950"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-4">{title}</h1>
          <p className="text-stone-300 max-w-xl text-lg mb-8">{desc}</p>
          <button
            onClick={scrollToProducts}
            className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm transition-all duration-300"
          >
            Shop the Collection
            <ArrowDown size={16} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Trust Bar */}
      <TrustBar />

      {/* Product Grid */}
      <div id="products-grid" className="max-w-7xl mx-auto px-6 py-24">
        {/* Filters (Visual only for demo) */}
        <div className="flex justify-between items-center mb-8 border-b border-stone-800 pb-4">
          <span className="text-stone-400 text-sm">{products.length} Products</span>
          <div className="flex gap-4">
            <span className="text-stone-400 text-sm cursor-pointer hover:text-white">Sort by: Featured</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Cinematic Video Showcase (Copper Only) */}
      {category === 'copper' && (config.assets.videoCopperMug || config.assets.videoCopperBottle || config.assets.videoCopperJug) && (
        <div className="max-w-7xl mx-auto px-6 mb-24 pt-16 border-t border-stone-900">
          <div className="text-center mb-12">
            <span className="text-copper-500 text-xs uppercase tracking-widest font-bold">Artistry In Motion</span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-2">The Ritual Experience</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.assets.videoCopperMug && (
              <div className="relative aspect-video bg-stone-900 border border-stone-800 group overflow-hidden">
                <video
                  src={config.assets.videoCopperMug}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  loop
                />
                <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur px-3 py-1 text-xs text-white uppercase tracking-widest font-bold">
                  The Mule Mug
                </div>
              </div>
            )}
            {config.assets.videoCopperBottle && (
              <div className="relative aspect-video bg-stone-900 border border-stone-800 group overflow-hidden">
                <video
                  src={config.assets.videoCopperBottle}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  loop
                />
                <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur px-3 py-1 text-xs text-white uppercase tracking-widest font-bold">
                  Pure Hydration
                </div>
              </div>
            )}
            {config.assets.videoCopperJug && (
              <div className="relative aspect-video bg-stone-900 border border-stone-800 group overflow-hidden">
                <video
                  src={config.assets.videoCopperJug}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  loop
                />
                <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur px-3 py-1 text-xs text-white uppercase tracking-widest font-bold">
                  The Table Jug
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational/Experience Section */}
      {category === 'copper' && <CopperCare />}
      {category === 'fire' && <FireExperience />}

      {/* FAQ Section */}
      <FAQSection
        faqs={category === 'copper' ? COPPER_PRODUCT_FAQS : FIRE_PRODUCT_FAQS}
        title={category === 'copper' ? "Copper Drinkware FAQ" : "Fire Starters FAQ"}
        subtitle={category === 'copper'
          ? "Common questions about our pure copper mugs and drinkware."
          : "Common questions about our natural wood wool fire starters."
        }
      />
    </div>
  );
}