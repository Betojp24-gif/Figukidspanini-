import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Combo, CartItem } from '../types';
import { COMBOS } from '../data';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Sparkles, Info } from 'lucide-react';

interface FeaturedProductsProps {
  onAddToCart: (item: CartItem) => void;
  onViewDetails: (combo: Combo) => void;
}

export default function FeaturedProducts({ onAddToCart, onViewDetails }: FeaturedProductsProps) {
  // Get all popular combinations
  const featured = COMBOS.filter(c => c.isPopular || c.id === 'c-album-pack-10');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play interval
  useEffect(() => {
    if (!isHovered && featured.length > 1) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isHovered, featured.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === featured.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const handleAddToCart = (combo: Combo) => {
    const item: CartItem = {
      id: `combo-${combo.id}`,
      itemType: 'combo',
      originalId: combo.id,
      name: combo.name,
      price: combo.price,
      quantity: 1,
      image: combo.image
    };
    onAddToCart(item);
  };

  if (featured.length === 0) return null;

  const activeCombo = featured[currentIndex];

  // Framer motion variants for subtle transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 150 : -150,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <section 
      className="w-full pb-3 pt-4 select-none bg-gradient-to-b from-[#0a0b16] to-[#0e1025]" 
      id="highlighted-products-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        
        {/* Compact section header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-405 fill-yellow-405 animate-pulse" />
            <h2 className="font-sans text-xs sm:text-sm font-black tracking-wider text-slate-350 uppercase">
              Oportunidades Destacadas
            </h2>
          </div>
          <div className="flex gap-1.5">
            <button 
              onClick={handlePrev}
              className="p-1 rounded-lg bg-[#141732] hover:bg-slate-800 text-slate-300 border border-purple-500/10 cursor-pointer transition-colors active:scale-95"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNext}
              className="p-1 rounded-lg bg-[#141732] hover:bg-slate-800 text-slate-300 border border-purple-500/10 cursor-pointer transition-colors active:scale-95"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Slide Area - Sized beautifully with larger, uniform images */}
        <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#0e1124] to-[#1c0f2a] border border-purple-500/15 overflow-hidden shadow-lg shadow-purple-950/10">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full min-h-[220px] sm:min-h-[180px] p-5 sm:p-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 md:gap-8 text-left cursor-pointer"
              onClick={() => onViewDetails(activeCombo)}
            >
              {/* Left Side: Info details */}
              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-purple-900/40 text-purple-300 border border-purple-700/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                    {activeCombo.category === 'albums' ? 'Álbum Oficial' : activeCombo.category === 'combos' ? 'Combo Especial' : 'Súper Pack'}
                  </span>
                  
                  {/* Rating stars compact */}
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-405 fill-yellow-405" />
                    <span className="text-[10px] font-mono font-bold text-slate-400">({activeCombo.rating.toFixed(1)})</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-sans text-sm sm:text-base md:text-lg font-extrabold text-white leading-tight hover:text-yellow-300 transition-colors line-clamp-1">
                    {activeCombo.name}
                  </h3>
                  <p className="text-slate-300 text-[11px] md:text-xs leading-snug line-clamp-2 max-w-2xl font-medium">
                    {activeCombo.description}
                  </p>
                </div>

                {/* Pricing & Call to Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wide leading-none block">Oferta:</span>
                    <span className="font-mono text-base sm:text-lg md:text-xl font-black text-yellow-405">
                      ${activeCombo.price.toLocaleString('es-AR')}
                    </span>
                    {activeCombo.price > 100000 && (
                      <span className="text-[10px] text-emerald-450 font-bold ml-1.5">¡Envío Gratis! 🚚</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewDetails(activeCombo)}
                      className="bg-[#141732] hover:bg-[#1a1f46] border border-white/5 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer hover:border-purple-500/20 active:scale-95"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Detalles</span>
                    </button>

                    <button
                      onClick={() => {
                        if (activeCombo.stock > 0) handleAddToCart(activeCombo);
                      }}
                      disabled={activeCombo.stock === 0}
                      className={`font-sans text-xs font-black px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border ${
                        activeCombo.stock > 0
                          ? 'bg-yellow-400 hover:bg-yellow-350 text-slate-950 border-yellow-505/20'
                          : 'bg-white/5 text-slate-500 cursor-not-allowed border-white/5'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{activeCombo.stock > 0 ? 'Comprar' : 'Sin Stock'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Product Image context with nice compact frame - Enlarged and identical size box */}
              <div className="w-full h-44 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-[#0c0d1e] rounded-2xl border border-purple-500/20 flex items-center justify-center p-3 shrink-0 select-none overflow-hidden relative group-hover:border-purple-550/35 transition-colors shadow-inner">
                <img
                  src={activeCombo.image}
                  alt={activeCombo.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Pagination Indicator at bottom */}
        <div className="flex justify-center items-center gap-1.5 mt-2.5">
          {featured.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-5 bg-purple-500' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
              }`}
              aria-label={`Ir al destacado ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
