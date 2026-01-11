import React from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-stone-900 aspect-[4/5] mb-4">
        {product.isBestSeller && (
          <div className="absolute top-4 left-4 z-10 bg-white text-stone-950 text-[10px] font-bold uppercase px-3 py-1 tracking-widest">
            Best Seller
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-4 right-4 z-10 bg-copper-500 text-white text-[10px] font-bold uppercase px-3 py-1 tracking-widest">
            New
          </div>
        )}
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-600 text-xs">No Image</div>
        )}
        {/* Quick View Overlay (Desktop) */}
        <div className="absolute bottom-0 left-0 right-0 bg-stone-950/80 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center">
          <span className="text-white text-xs uppercase tracking-wider">View Details</span>
          <span className="text-copper-400 text-xs">→</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-white font-serif text-xl group-hover:text-copper-400 transition-colors">{product.name}</h3>
        <p className="text-stone-500 text-xs uppercase tracking-wide">{product.subtitle}</p>
      </div>
    </Link>
  );
};

export default ProductCard;