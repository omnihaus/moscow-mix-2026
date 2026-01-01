import React from 'react';
import { Hammer, Flame, Heart } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function About() {
  const { config } = useSiteConfig();
  const { story } = config;

  return (
    <div className="bg-stone-950 min-h-screen pt-24">
      {/* Header with Dynamic Background */}
      <div className="relative w-full py-32 mb-16 overflow-hidden">
        {story.heroImage && (
             <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${story.heroImage}')` }}
             >
                <div className="absolute inset-0 bg-stone-950/70"></div>
             </div>
        )}
        <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-8 leading-tight">
            {story.headline.replace("Crafted From the Elements.", "Crafted From the Elements.\n")} 
            </h1>
            <div className="w-px h-24 bg-gradient-to-b from-copper-500 to-transparent mx-auto"></div>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="max-w-3xl mx-auto px-6 mb-32">
        <div 
          className="text-xl md:text-2xl text-stone-300 leading-relaxed font-light mb-12 first-letter:text-5xl first-letter:font-serif first-letter:text-copper-500 first-letter:mr-2 float-none"
          dangerouslySetInnerHTML={{ __html: story.narrative }}
        />
        
        <div className="grid grid-cols-2 gap-4 my-16">
          <img src={config.assets.textureCopper} alt="Copper Texture" className="rounded-sm opacity-80 hover:opacity-100 transition-opacity w-full h-full object-cover" />
          <img src={config.assets.textureWood} alt="Wood Texture" className="rounded-sm opacity-80 hover:opacity-100 transition-opacity w-full h-full object-cover" />
        </div>

        <p className="text-lg text-stone-400 leading-relaxed mb-8">
          Every product we create is built with:
        </p>

        <ul className="space-y-4 border-l-2 border-copper-900 pl-6 my-8">
          {story.values.map((val, i) => (
             <li key={i} className="text-white font-serif text-2xl">{val}</li>
          ))}
        </ul>

        <p className="text-lg text-stone-400 leading-relaxed">
          We’re not here to be the biggest brand. We’re here to be the one people trust when they want something real.
        </p>
      </div>

      {/* Values Grid */}
      <div className="bg-stone-900 py-24 px-6 border-y border-stone-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-copper-500 mb-6">
                <Hammer size={28} />
             </div>
             <h3 className="text-white font-serif text-xl mb-4">Heritage Methods</h3>
             <p className="text-stone-400 text-sm max-w-xs">We utilize hand-hammering and cold-forging techniques that have been refined over centuries.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-copper-500 mb-6">
                <Flame size={28} />
             </div>
             <h3 className="text-white font-serif text-xl mb-4">Clean Ignition</h3>
             <p className="text-stone-400 text-sm max-w-xs">We believe fire should smell like wood, not chemicals. Our starters are safe for cooking and gathering.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-copper-500 mb-6">
                <Heart size={28} />
             </div>
             <h3 className="text-white font-serif text-xl mb-4">Customer Obsessed</h3>
             <p className="text-stone-400 text-sm max-w-xs">From our packaging to our support, we treat every interaction with the same care as our manufacturing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}