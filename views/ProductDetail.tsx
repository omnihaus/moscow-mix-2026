
'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import type { BlogPost, Product } from '../types';
import SEO, { generateBreadcrumbSchema, generateProductSchema } from '../components/SEO';
import Breadcrumbs, { getProductBreadcrumbs } from '../components/Breadcrumbs';
import FAQSection, { getProductFAQs } from '../components/FAQSection';

export default function ProductDetail({ product, relatedPosts = [] }: { product: Product; relatedPosts?: BlogPost[] }) {
  const { config } = useSiteConfig();

  // Generate product schema
  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description,
    image: product.images[0] || '',
    price: product.price,
    url: `https://www.moscowmix.com/product/${product.id}`,
    rating: product.rating,
    reviewCount: product.reviews,
    amazonUrl: product.amazonUrl,
    availability: product.availability || 'InStock'
  });

  // Determine which video to show based on product ID/Name keywords
  let videoSrc = null;
  let videoLabel = "";

  if (product.id.includes('mule') || product.id.includes('mug') || product.name.toLowerCase().includes('mug')) {
    videoSrc = config.assets.videoCopperMug;
    videoLabel = "The Mule Experience";
  } else if (product.id.includes('bottle') || product.name.toLowerCase().includes('bottle')) {
    videoSrc = config.assets.videoCopperBottle;
    videoLabel = "Pure Hydration";
  } else if (product.id.includes('jug') || product.name.toLowerCase().includes('jug')) {
    videoSrc = config.assets.videoCopperJug;
    videoLabel = "Table Service";
  }

  // Get product-specific FAQs based on product ID
  const productFaqData = getProductFAQs(product.id);
  const breadcrumbItems = getProductBreadcrumbs(product.name, product.category, product.id);
  const combinedSchema = [productSchema, generateBreadcrumbSchema(breadcrumbItems)];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-stone-950 text-white">
      <SEO
        title={product.name}
        description={product.description}
        image={product.images[0]}
        url={`https://www.moscowmix.com/product/${product.id}`}
        type="product"
        schemaData={combinedSchema}
      />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

        {/* Main Image Only - using object-contain for full visibility */}
        <div className="aspect-[4/5] bg-stone-900 overflow-hidden w-full border border-stone-800">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="eager"
              decoding="async"
              className="w-full h-full object-contain p-8"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-600">No Image</div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-copper-500 text-xs font-bold uppercase tracking-widest">{product.category}</span>
            {product.isBestSeller && <span className="text-stone-500 text-xs font-bold uppercase tracking-widest px-2 border-l border-stone-700">Best Seller</span>}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl mb-6 text-stone-100">{product.name}</h1>

          <div className="h-[1px] bg-stone-800 w-full mb-8"></div>

          <p className="text-stone-300 leading-relaxed mb-8 font-light text-lg">
            {product.description}
          </p>

          {typeof product.price === 'number' && product.price > 0 && (
            <p className="text-2xl text-white mb-8" aria-label={`Price ${product.price.toFixed(2)} US dollars`}>
              ${product.price.toFixed(2)} <span className="text-sm text-stone-500">USD</span>
            </p>
          )}
          <p className={`text-sm uppercase tracking-widest mb-8 ${product.availability === 'OutOfStock' ? 'text-red-400' : 'text-stone-500'}`}>
            {product.availability === 'OutOfStock' ? 'Currently unavailable' : 'Available on Amazon'}
          </p>

          {/* Features */}
          <ul className="mb-8 space-y-3">
            {product.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-stone-400 text-sm">
                <div className="min-w-1.5 h-1.5 rounded-full bg-copper-500 mt-2"></div>
                {feature}
              </li>
            ))}
          </ul>

          {/* Amazon Button */}
          <div className="flex gap-4 mb-8">
            <a
              href={product.amazonUrl || '#'}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex-1 bg-gradient-to-r from-[#FF9900] to-[#FFB84D] hover:from-[#e88b00] hover:to-[#e8a644] text-stone-900 font-bold uppercase tracking-widest text-sm transition-all h-14 flex items-center justify-center gap-2 rounded-sm shadow-lg shadow-orange-900/20"
            >
              Buy on Amazon <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Product Specific Video Section */}
      {videoSrc && (
        <div className="max-w-7xl mx-auto px-6 mt-32">
          <div className="border-t border-stone-900 pt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-copper-500 text-xs uppercase tracking-widest font-bold mb-4 block">Artistry In Motion</span>
                <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">See it in Action</h2>
                <p className="text-stone-400 text-lg leading-relaxed mb-8">
                  Experience the shimmer, weight, and craftsmanship of our copper collection.
                  Every piece interacts with light and touch in a way that static images simply cannot capture.
                </p>
              </div>
              <div className="relative aspect-video bg-stone-900 border border-stone-800 group overflow-hidden shadow-2xl">
                <video
                  src={videoSrc}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  loop
                />
                <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur px-3 py-1 text-xs text-white uppercase tracking-widest font-bold">
                  {videoLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product FAQ Section */}
      <FAQSection
        faqs={productFaqData.faqs}
        title={productFaqData.title}
        subtitle={productFaqData.subtitle}
      />

      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24" aria-labelledby="product-guides-heading">
          <div className="border-t border-stone-900 pt-16">
            <h2 id="product-guides-heading" className="font-serif text-3xl md:text-4xl text-white mb-10">Guides for This Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/journal/${post.slug || post.id}`} className="group block">
                  <div className="aspect-[3/2] bg-stone-900 overflow-hidden mb-4">
                    <img src={post.coverImage} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-serif text-2xl text-white group-hover:text-copper-400 transition-colors">{post.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
