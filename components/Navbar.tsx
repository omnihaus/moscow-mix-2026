
import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Navbar() {
  const { config } = useSiteConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = `fixed w-full z-50 transition-all duration-500 ${
    isScrolled ? 'bg-stone-950/90 backdrop-blur-md py-4 border-b border-stone-800' : 'bg-transparent py-6'
  }`;

  // Search Logic
  const filteredProducts = config.products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredPosts = config.blogPosts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden text-stone-100 hover:text-copper-400 transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Desktop Links (Left) */}
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/shop/copper" className="text-sm uppercase tracking-widest text-stone-300 hover:text-white transition-colors">Copper</Link>
          <Link to="/shop/fire" className="text-sm uppercase tracking-widest text-stone-300 hover:text-white transition-colors">Fire</Link>
          <Link to="/journal" className="text-sm uppercase tracking-widest text-stone-300 hover:text-white transition-colors">Journal</Link>
          <Link to="/about" className="text-sm uppercase tracking-widest text-stone-300 hover:text-white transition-colors">Our Story</Link>
        </div>

        {/* Logo */}
        <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 group">
          {config.assets.logo ? (
            <img 
              src={config.assets.logo} 
              alt="Moscow Mix" 
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="text-center">
              <h1 className="font-serif text-2xl md:text-3xl text-white tracking-tighter group-hover:text-copper-400 transition-colors duration-300">
                MOSCOW MIX
              </h1>
              <div className="w-0 group-hover:w-full h-0.5 bg-copper-500 mx-auto transition-all duration-500 ease-out"></div>
            </div>
          )}
        </Link>

        {/* Icons (Right) */}
        <div className="flex gap-6 items-center">
          <button onClick={() => setIsSearchOpen(true)} className="text-stone-100 hover:text-copper-400 transition-colors">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-stone-950 z-50 transition-transform duration-500 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-12">
             <span className="font-serif text-2xl text-white">Menu</span>
             <button onClick={() => setIsMobileOpen(false)} className="text-stone-400 hover:text-white">
               <X size={24} />
             </button>
          </div>
          
          <div className="flex flex-col gap-8">
            <Link to="/" onClick={() => setIsMobileOpen(false)} className="text-3xl font-serif text-white hover:text-copper-400">Home</Link>
            <Link to="/shop/copper" onClick={() => setIsMobileOpen(false)} className="text-3xl font-serif text-white hover:text-copper-400">Copper Collection</Link>
            <Link to="/shop/fire" onClick={() => setIsMobileOpen(false)} className="text-3xl font-serif text-white hover:text-copper-400">Fire Starters</Link>
            <Link to="/journal" onClick={() => setIsMobileOpen(false)} className="text-3xl font-serif text-white hover:text-copper-400">Journal</Link>
            <Link to="/about" onClick={() => setIsMobileOpen(false)} className="text-3xl font-serif text-white hover:text-copper-400">Our Story</Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
          <div className="fixed inset-0 bg-stone-950/95 z-[60] backdrop-blur-md animate-fade-in">
             <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="flex justify-end mb-8">
                   <button onClick={() => setIsSearchOpen(false)} className="text-stone-400 hover:text-white"><X size={32}/></button>
                </div>
                <input 
                   autoFocus
                   type="text" 
                   placeholder="Search products or articles..." 
                   className="w-full bg-transparent border-b-2 border-stone-800 text-3xl md:text-5xl font-serif text-white pb-4 focus:border-copper-500 outline-none placeholder-stone-700"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchQuery && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Products Results */}
                        <div>
                           <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-6">Products</h3>
                           {filteredProducts.length > 0 ? (
                               <div className="space-y-6">
                                   {filteredProducts.map(p => (
                                       <Link to={`/product/${p.id}`} onClick={() => setIsSearchOpen(false)} key={p.id} className="flex gap-4 group">
                                           <div className="w-16 h-20 bg-stone-900">
                                               {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100"/>}
                                           </div>
                                           <div>
                                               <h4 className="text-white font-serif text-lg group-hover:text-copper-400">{p.name}</h4>
                                               <p className="text-stone-500 text-xs mt-1">View Product <ArrowRight size={10} className="inline"/></p>
                                           </div>
                                       </Link>
                                   ))}
                               </div>
                           ) : <p className="text-stone-600 italic">No products found.</p>}
                        </div>
                        {/* Journal Results */}
                        <div>
                            <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-6">Journal</h3>
                            {filteredPosts.length > 0 ? (
                                <div className="space-y-6">
                                    {filteredPosts.map(p => (
                                        <Link to={`/journal/${p.id}`} onClick={() => setIsSearchOpen(false)} key={p.id} className="block group">
                                            <h4 className="text-white font-serif text-xl mb-1 group-hover:text-copper-400">{p.title}</h4>
                                            <p className="text-stone-500 text-sm line-clamp-1">{p.excerpt}</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : <p className="text-stone-600 italic">No articles found.</p>}
                        </div>
                    </div>
                )}
             </div>
          </div>
      )}
    </nav>
  );
}
