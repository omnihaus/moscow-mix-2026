
import React from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { Flame, Droplets, ShieldCheck, Leaf, Wind, Snowflake, CheckCircle } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import SEO from '../components/SEO';

export default function Home() {
   const { config } = useSiteConfig();
   const copperProducts = config.products.filter(p => p.category === 'Copper Drinkware').slice(0, 2);
   const fireProducts = config.products.filter(p => p.category === 'Fire Starters').slice(0, 2);

   return (
      <div className="bg-stone-950 min-h-screen">
         <SEO
            title="Pure Copper Mugs and Natural Fire Starters"
            description="Moscow Mix creates solid 100% pure copper mugs and natural fire starters with authenticity and purity at their core. No plated copper, no fillers, no synthetic shortcuts."
            url="https://www.moscowmix.com"
         />
         <Hero />

         {/* Section 1: Brand Value Proposition */}
         <section className="py-24 px-6 bg-stone-950 relative overflow-hidden text-center">
            <div className="max-w-3xl mx-auto relative z-10">
               <span className="text-copper-500 uppercase tracking-widest text-xs font-bold mb-4 block">Est. 2018</span>
               <h2 className="font-serif text-3xl md:text-5xl text-white mb-8 leading-tight">
                  Premium Goods Rooted <br /> in Earth’s Elements.
               </h2>
               <div className="w-24 h-[1px] bg-copper-500 mx-auto mb-8"></div>
               <p className="text-stone-400 text-lg leading-relaxed font-light">
                  Moscow Mix creates products with authenticity and purity at their core.
                  No plated copper, no fillers, no synthetic shortcuts.
                  Just real craftsmanship using materials that have stood the test of time.
               </p>
            </div>
         </section>

         {/* Section 2: Signature Collections */}
         <section className="py-24 px-6 bg-stone-900">
            <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                  {/* Copper Collection */}
                  <div>
                     <div className="mb-8 flex justify-between items-end">
                        <div>
                           <h3 className="text-3xl font-serif text-white mb-2">Copper Drinkware</h3>
                           <p className="text-stone-400 text-sm max-w-sm">Handcrafted. Lead-free. Solid copper. Designed for purer taste and timeless style.</p>
                        </div>
                        <Link to="/shop/copper" className="text-copper-400 text-xs uppercase tracking-widest hover:text-white transition-colors">View All</Link>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        {copperProducts.map(p => (
                           <ProductCard key={p.id} product={p} />
                        ))}
                     </div>
                  </div>

                  {/* Fire Collection */}
                  <div>
                     <div className="mb-8 flex justify-between items-end">
                        <div>
                           <h3 className="text-3xl font-serif text-white mb-2">Firecraft Collection</h3>
                           <p className="text-stone-400 text-sm max-w-sm">Natural wood-wool fire starters. Ignite your fire instantly—indoors or outdoors.</p>
                        </div>
                        <Link to="/shop/fire" className="text-copper-400 text-xs uppercase tracking-widest hover:text-white transition-colors">View All</Link>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        {fireProducts.map(p => (
                           <ProductCard key={p.id} product={p} />
                        ))}
                     </div>
                  </div>

               </div>
            </div>
         </section>

         {/* Section 3: Lifestyle Storytelling */}
         <section className="relative bg-stone-950 overflow-hidden">
            {/* Background Texture (Optional) */}
            <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${config.assets.textureWood})` }}></div>

            <div className="relative z-10 max-w-7xl mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Text Content */}
                  <div className="py-24 px-6 md:px-12 lg:py-32 flex flex-col justify-center">
                     <h2 className="font-serif text-4xl md:text-6xl text-white mb-8 leading-tight">
                        Crafted for Rituals <br /> Worth Keeping.
                     </h2>
                     <p className="text-stone-300 text-lg leading-relaxed mb-12 max-w-md font-light">
                        Whether you’re sipping from a cold Moscow Mule or lighting a fire on a crisp night, these moments deserve better than mass-produced, corner-cut products.
                        <br /><br />
                        We designed Moscow Mix for people who respect craft, purity, and the emotional warmth of real materials.
                     </p>
                     <Link to="/about" className="inline-block border-b border-copper-500 pb-1 text-copper-400 hover:text-white transition-colors uppercase tracking-widest text-xs self-start font-bold">
                        Read Our Story
                     </Link>
                  </div>

                  {/* Right: Image Asset */}
                  <div className="h-96 lg:h-auto w-full bg-stone-900 relative">
                     <img
                        src={config.assets.lifestyleRitual || config.assets.lifestyleCabin}
                        alt="Lifestyle Ritual"
                        className="w-full h-full object-cover opacity-90"
                     />
                     {/* Subtle Gradient Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-l from-transparent to-stone-950/50"></div>
                  </div>
               </div>
            </div>
         </section>

         {/* Section 4 & 5: Benefits Breakdown */}
         <section className="bg-stone-950 border-t border-stone-900">
            <div className="grid grid-cols-1 md:grid-cols-2">

               {/* Copper Benefits */}
               <div className="p-12 md:p-24 border-b md:border-b-0 md:border-r border-stone-900 hover:bg-stone-900/40 transition-colors">
                  <div className="mb-8 text-copper-500"><Droplets size={48} strokeWidth={1} /></div>
                  <h3 className="font-serif text-3xl text-white mb-8">The Copper Advantage</h3>
                  <ul className="space-y-6">
                     <li className="flex gap-4 items-start">
                        <ShieldCheck className="text-stone-600 mt-1 shrink-0" size={20} />
                        <div>
                           <h4 className="text-white font-medium mb-1">Naturally Antimicrobial</h4>
                           <p className="text-stone-500 text-sm">Copper naturally sterilizes bacteria on contact.</p>
                        </div>
                     </li>
                     <li className="flex gap-4 items-start">
                        <Snowflake className="text-stone-600 mt-1 shrink-0" size={20} />
                        <div>
                           <h4 className="text-white font-medium mb-1">Aggressive Cooling</h4>
                           <p className="text-stone-500 text-sm">Conducts cold instantly, keeping your Mule frosty.</p>
                        </div>
                     </li>
                     <li className="flex gap-4 items-start">
                        <CheckCircle className="text-stone-600 mt-1 shrink-0" size={20} />
                        <div>
                           <h4 className="text-white font-medium mb-1">Zero Coatings</h4>
                           <p className="text-stone-500 text-sm">No toxic lacquers or nickel linings. 100% pure.</p>
                        </div>
                     </li>
                  </ul>
               </div>

               {/* Fire Benefits */}
               <div className="p-12 md:p-24 hover:bg-stone-900/40 transition-colors">
                  <div className="mb-8 text-copper-500"><Flame size={48} strokeWidth={1} /></div>
                  <h3 className="font-serif text-3xl text-white mb-8">Small Flame. Big Impact.</h3>
                  <ul className="space-y-6">
                     <li className="flex gap-4 items-start">
                        <Leaf className="text-stone-600 mt-1 shrink-0" size={20} />
                        <div>
                           <h4 className="text-white font-medium mb-1">Premium Wood Wool</h4>
                           <p className="text-stone-500 text-sm">Sustainably sourced and dipped in natural wax.</p>
                        </div>
                     </li>
                     <li className="flex gap-4 items-start">
                        <Wind className="text-stone-600 mt-1 shrink-0" size={20} />
                        <div>
                           <h4 className="text-white font-medium mb-1">Clean Burn</h4>
                           <p className="text-stone-500 text-sm">Odorless ignition with no chemical fumes.</p>
                        </div>
                     </li>
                     <li className="flex gap-4 items-start">
                        <CheckCircle className="text-stone-600 mt-1 shrink-0" size={20} />
                        <div>
                           <h4 className="text-white font-medium mb-1">Instant Lighting</h4>
                           <p className="text-stone-500 text-sm">A single spark creates a 10-minute sustained burn.</p>
                        </div>
                     </li>
                  </ul>
               </div>

            </div>
         </section>

         {/* Section 7: Brand Story Preview */}
         <section className="py-32 px-6 bg-stone-950 border-t border-stone-900">
            <div className="max-w-4xl mx-auto text-center">
               {/* BRAND MARK IMPLEMENTATION */}
               <img
                  src={config.assets.brandMark || config.assets.textureCopper}
                  className="w-16 h-16 rounded-full mx-auto mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 object-cover"
                  alt="Brand Mark"
               />
               <h2 className="font-serif text-4xl md:text-5xl text-white mb-8">Born From a Love of Real Materials</h2>
               <p className="text-stone-400 text-xl leading-relaxed font-light mb-12 max-w-2xl mx-auto">
                  Moscow Mix started with a simple idea: If you’re going to drink or set a flame—do it with materials that actually deserve respect.
                  Our mission is to combine craftsmanship, purity, and design to elevate everyday rituals.
               </p>
               <Link to="/about" className="px-12 py-4 bg-white text-stone-950 hover:bg-copper-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold">
                  Read Our Full Story
               </Link>
            </div>
         </section>
      </div>
   );
}