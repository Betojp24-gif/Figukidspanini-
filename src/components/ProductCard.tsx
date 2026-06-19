import React from 'react';
import { Combo, CartItem } from '../types';
import { Star, ShoppingCart, Info, TrendingUp } from 'lucide-react';

interface ProductCardProps {
  key?: string;
  combo: Combo;
  onAddToCart: (item: CartItem) => void;
  onViewDetails: (combo: Combo) => void;
}

export default function ProductCard({ combo, onAddToCart, onViewDetails }: ProductCardProps) {
  const { id, name, description, price, category, rating, image, stock, isPopular } = combo;

  const handleAddToCart = () => {
    const item: CartItem = {
      id: `combo-${id}`,
      itemType: 'combo',
      originalId: id,
      name,
      price,
      quantity: 1,
      image
    };
    onAddToCart(item);
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'packs': return 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20';
      case 'albums': return 'bg-purple-500/15 text-purple-300 border border-purple-500/20';
      default: return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'packs': return 'Sobres Cerrados';
      case 'albums': return 'Álbumes Oficiales';
      default: return 'Combos Especiales';
    }
  };

  return (
    <div 
      className="bg-gradient-to-br from-[#0c0f24] via-[#12163e] to-[#25102e] border border-purple-500/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between group h-full shadow-lg hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1 relative"
      id={`product-card-${id}`}
    >
      {isPopular && (
        <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full flex items-center gap-1 z-10 shadow-md">
          <TrendingUp className="w-3 h-3 text-yellow-300" /> Destacado
        </span>
      )}

      {/* Product Image Panel */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/30 flex items-center justify-center p-4">
        <img 
          src={image} 
          alt={name}
          referrerPolicy="no-referrer"
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500 max-h-[140px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none"></div>
        
        {stock === 0 && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center backdrop-blur-[1px] z-10">
            <span className="bg-red-600 text-white font-extrabold text-xs uppercase px-3 py-1.5 rounded-lg tracking-wider border border-red-500/30 shadow-lg">
              Sin Stock
            </span>
          </div>
        )}

        <span className={`absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 rounded-md ${getCategoryBadgeColor(category)}`}>
          {getCategoryLabel(category)}
        </span>
      </div>

      {/* Description Panel */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(rating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : i < rating 
                    ? 'text-yellow-400/50 fill-yellow-400/50' 
                    : 'text-slate-600 fill-slate-700'
                }`} 
              />
            ))}
            <span className="font-mono text-[10px] text-slate-400 font-bold ml-1">{rating.toFixed(1)}</span>
          </div>

          <h4 className="font-sans text-base font-bold text-white group-hover:text-yellow-300 transition-colors leading-tight mb-2">
            {name}
          </h4>
          <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed mb-4 font-medium">
            {description}
          </p>
        </div>

        <div>
          {/* Metadata Row */}
          <div className="flex items-center justify-between py-2 border-t border-white/5 mb-4 text-xs font-mono">
            <span className="text-slate-400">Stock disponible:</span>
            {stock > 0 ? (
              <span className="text-emerald-400 font-bold">{stock} uds</span>
            ) : (
              <span className="text-red-400 font-bold font-semibold">Sin Stock</span>
            )}
          </div>

          {/* Pricing and Buying CTA Row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold leading-none mb-0.5">Precio</span>
              <span className="font-mono text-xl font-extrabold text-yellow-400">
                ${price.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => onViewDetails(combo)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Ver detalles"
              >
                <Info className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className={`px-4 py-2.5 rounded-xl font-sans text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  stock > 0
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 hover:shadow-lg hover:shadow-yellow-400/20 active:scale-95 border border-yellow-500/20'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Comprar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
