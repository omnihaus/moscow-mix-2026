
import React from 'react';
import { Instagram, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Footer() {
  const { config } = useSiteConfig();

  return (
    <footer className="bg-stone-950 pt-24 pb-12 border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            {config.assets.logo ? (
              <img src={config.assets.logo} alt="Moscow Mix" className="h-8 mb-6 object-contain" />
            ) : (
              <h3 className="font-serif text-2xl text-white mb-6">MOSCOW MIX</h3>
            )}
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Heritage craftsmanship for the modern gathering. Pure copper drinkware and natural fire starters designed to elevate your moments.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-stone-500 hover:text-copper-400 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-stone-100 uppercase text-xs tracking-widest mb-6 font-semibold">Shop</h4>
            <ul className="space-y-4 text-stone-400 text-sm">
              <li><Link to="/shop/copper" className="hover:text-white transition-colors">Copper Collection</Link></li>
              <li><Link to="/shop/fire" className="hover:text-white transition-colors">Fire Starters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-stone-100 uppercase text-xs tracking-widest mb-6 font-semibold">Company</h4>
            <ul className="space-y-4 text-stone-400 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link to="/journal" className="hover:text-white transition-colors">Journal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-stone-100 uppercase text-xs tracking-widest mb-6 font-semibold">Support</h4>
            <ul className="space-y-4 text-stone-400 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-stone-900">
          <p className="text-stone-600 text-xs">© 2026 Moscow Mix. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 items-center">
            <Link to="/privacy" className="text-stone-600 text-xs hover:text-stone-400">Privacy Policy</Link>
            <Link to="/terms" className="text-stone-600 text-xs hover:text-stone-400">Terms of Service</Link>
            <Link to="/admin" className="text-stone-800 hover:text-copper-900 transition-colors" title="Admin Login">
              <Lock size={12} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
