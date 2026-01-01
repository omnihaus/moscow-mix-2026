
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Hero() {
  const { config } = useSiteConfig();

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
        style={{ backgroundImage: `url(${config.assets.heroVideoPoster})` }}
      >
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-900/30 to-stone-950"></div>
      </div>

      <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
        <span className="text-copper-400 uppercase tracking-[0.3em] text-xs md:text-sm font-semibold mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          Pure Copper • Pure Ritual • Pure Quality
        </span>
        
        {/* Dynamic HTML Headline */}
        <div 
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight tracking-tight animate-slide-up opacity-0" 
          style={{ animationDelay: '0.4s' }}
          dangerouslySetInnerHTML={{ __html: config.heroHeadline }}
        />
        
        <p className="max-w-xl text-stone-300 text-sm md:text-lg leading-relaxed mb-12 animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
          {config.heroSubheadline}
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 animate-slide-up opacity-0" style={{ animationDelay: '0.8s' }}>
          <Link to="/shop/copper" className="group relative px-8 py-4 bg-copper-600 text-white font-medium uppercase tracking-widest text-xs hover:bg-copper-500 transition-all overflow-hidden">
            <span className="relative z-10">Shop Copper Collection</span>
            <div className="absolute inset-0 h-full w-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12"></div>
          </Link>
          
          <Link to="/shop/fire" className="group px-8 py-4 border border-stone-500 text-white font-medium uppercase tracking-widest text-xs hover:border-white hover:bg-white hover:text-stone-950 transition-all">
            Shop Fire Starters
          </Link>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center animate-fade-in opacity-0" style={{ animationDelay: '1.2s' }}>
        <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent opacity-50"></div>
      </div>
    </section>
  );
}
