import React from 'react';

export default function BrandStrategy() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-stone-950 text-white">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-5xl mb-4 text-copper-400">Brand Blueprint</h1>
        <p className="text-stone-400 mb-12 border-b border-stone-800 pb-8">
          The strategic foundation for the Moscow Mix redesign. This document guides all visual and verbal communication.
        </p>

        <div className="space-y-16">
          
          <section>
            <h2 className="text-2xl font-serif mb-6 text-white">1. Positioning Statement</h2>
            <div className="bg-stone-900 p-8 border-l-4 border-copper-500">
              <p className="text-lg leading-relaxed italic text-stone-200">
                "For the modern gatherer who values authenticity over convenience, Moscow Mix is the purveyor of elemental tools—copper and fire—that elevate the ritual of hosting. Unlike mass-market dropshippers, we offer heritage craftsmanship and natural purity."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-6 text-white">2. Brand Voice Pillars</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-stone-800">
                <h3 className="text-copper-400 font-bold uppercase tracking-widest text-xs mb-3">Confident & Minimal</h3>
                <p className="text-sm text-stone-400">We don't shout. We state facts with elegance. We avoid exclamation points and hype words like "Amazing!" or "Cheap!".</p>
              </div>
              <div className="p-6 border border-stone-800">
                <h3 className="text-copper-400 font-bold uppercase tracking-widest text-xs mb-3">Elemental & Sensory</h3>
                <p className="text-sm text-stone-400">We use words that evoke touch, temperature, and smell. "Conductivity," "Cold-forged," "Ignite," "Aromatic."</p>
              </div>
              <div className="p-6 border border-stone-800">
                <h3 className="text-copper-400 font-bold uppercase tracking-widest text-xs mb-3">Heritage Driven</h3>
                <p className="text-sm text-stone-400">We emphasize the "why" behind the tradition. Why copper? Why wood wool? Explain the history to build value.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-6 text-white">3. Visual Direction</h2>
            <ul className="space-y-4 text-stone-300">
              <li className="flex gap-4">
                <span className="font-bold text-white min-w-[120px]">Color Palette:</span>
                <span>Deep Charcoal (Stone-950), Raw Copper (Copper-500), Warm Amber (Fire), Slate Grey. High contrast is key.</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-white min-w-[120px]">Typography:</span>
                <span><b>Cormorant Garamond</b> for headings (Evokes history, elegance). <b>Inter</b> for body (Clean, modern readability).</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-white min-w-[120px]">Photography:</span>
                <span>Macro shots of textures (wood grain, hammered metal). Dark moody lighting (chiaroscuro) for products. Lifestyle shots should feel candid and cozy, not staged.</span>
              </li>
            </ul>
          </section>

          <section>
             <h2 className="text-2xl font-serif mb-6 text-white">4. Competitor Analysis</h2>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-stone-400">
                 <thead className="text-stone-100 uppercase text-xs border-b border-stone-800">
                   <tr>
                     <th className="pb-3">Competitor Type</th>
                     <th className="pb-3">Their Weakness</th>
                     <th className="pb-3">Our Advantage</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-stone-800">
                   <tr>
                     <td className="py-4">Generic Amazon Sellers</td>
                     <td className="py-4">Cheap branding, thin copper, chemical fire starters.</td>
                     <td className="py-4 text-copper-400">Heavier gauge copper, 100% natural materials, beautiful packaging.</td>
                   </tr>
                   <tr>
                     <td className="py-4">Luxury Home Goods</td>
                     <td className="py-4">Extremely high price points, disconnected form function.</td>
                     <td className="py-4 text-copper-400">Accessible luxury ($65 vs $150), focused specifically on the "Gathering" niche.</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
}