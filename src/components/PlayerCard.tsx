import React from 'react';
import { Sticker, CartItem } from '../types';
import { COUNTRIES } from '../data';
import { Sparkles, ShoppingCart, Award, CheckCircle } from 'lucide-react';

interface PlayerCardProps {
  key?: string;
  sticker: Sticker;
  onAddToCart: (item: CartItem) => void;
}

export default function PlayerCard({ sticker, onAddToCart }: PlayerCardProps) {
  const { id, name, country, code, price, type, rating, image, stock, skills } = sticker;

  const currentCountry = COUNTRIES.find(c => c.code === country);

  const handleAddToCart = () => {
    const item: CartItem = {
      id: `sticker-${id}`,
      itemType: 'sticker',
      originalId: id,
      name: `${name} (${code})`,
      price,
      quantity: 1,
      image
    };
    onAddToCart(item);
  };

  // Border and design traits depending on StickerType
  const getTypeStyles = (t: string) => {
    switch (t) {
      case 'extra':
        return {
          wrapper: 'bg-gradient-to-b from-white via-amber-50/15 to-amber-100/30 border-amber-400 border-2 shadow-amber-500/10 shadow-lg',
          header: 'bg-amber-400 text-slate-950 font-black',
          badge: 'bg-amber-400 text-slate-900',
          codeText: 'text-amber-600 font-extrabold',
          rareLabel: 'EXTRA GOLD STICKER ✨'
        };
      case 'legend':
        return {
          wrapper: 'bg-gradient-to-b from-white via-rose-50/15 to-rose-100/30 border-rose-400/80 border-2 shadow-rose-500/10 shadow-lg',
          header: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold',
          badge: 'bg-rose-500 text-white',
          codeText: 'text-rose-600 font-bold',
          rareLabel: 'LEYENDA MUNDIAL 🏆'
        };
      case 'shiny':
        return {
          wrapper: 'bg-gradient-to-b from-white via-blue-50/15 to-blue-105/30 border-blue-450 border shadow-blue-500/10 shadow-md',
          header: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold',
          badge: 'bg-blue-500 text-white',
          codeText: 'text-blue-600 font-bold',
          rareLabel: 'BRILLANTE / GLOW ⭐'
        };
      default:
        return {
          wrapper: 'bg-white border-slate-200 border shadow-sm hover:border-slate-350',
          header: 'bg-slate-100 text-slate-700 font-semibold',
          badge: 'bg-slate-200 text-slate-600',
          codeText: 'text-slate-500 font-medium',
          rareLabel: 'ESTÁNDAR'
        };
    }
  };

  const style = getTypeStyles(type);

  return (
    <div 
      className={`rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between h-full group hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200 ${style.wrapper} holo-effect`}
      id={`player-card-${id}`}
    >
      {/* Rare Label Header Badge */}
      <div className={`text-[9px] uppercase tracking-wider py-1 text-center font-bold font-mono ${style.header}`}>
        {style.rareLabel}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Core Info Top bar */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-mono text-xs w-full">
              <span className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-[11px] font-bold text-slate-650 inline-block">
                🔢 {code}
              </span>
            </span>
            <span className="text-xl shrink-0" title={currentCountry?.name}>
              {currentCountry?.flag}
            </span>
          </div>

          {/* Photo/Visual Display Block */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-3 group-hover:border-slate-200 transition-colors flex items-center justify-center">
            <img 
              src={image} 
              alt={name} 
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full group-hover:scale-[1.05] transition-transform duration-500 grayscale group-hover:grayscale-0 relative z-0"
            />
            {/* Soft gradient backing */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent opacity-90 z-1"></div>
            
            {/* Quality Score Indicator inside the photo frame */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-slate-200 z-2">
              <span className="text-[10px] font-mono font-bold text-slate-500">OVR</span>
              <span className="text-xs font-mono font-black text-amber-600">{(rating * 20).toFixed(0)}</span>
            </div>
          </div>

          <h5 className="font-sans text-base font-extrabold text-slate-900 group-hover:text-red-700 transition-colors mt-1 leading-tight">
            {name}
          </h5>
          
          <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
            <span>Selección:</span>
            <span className="text-slate-800 font-bold">{currentCountry?.name || 'Mundial'}</span>
          </p>

          {/* Skill Tag list for technical feel */}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md"
                >
                  ⚔️ {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Area */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-1 mb-3">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Unidades:</span>
            <span className="text-xs font-mono font-bold">
              {stock > 0 ? (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">últimas {stock} disp.</span>
              ) : (
                <span className="text-red-600">Agotado</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold leading-none mb-0.5">Precio</span>
              <span className="font-mono text-base font-extrabold text-orange-650 leading-none">
                ${price.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className={`px-3 py-2 rounded-xl font-sans text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                stock > 0
                  ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/10 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Suelto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
