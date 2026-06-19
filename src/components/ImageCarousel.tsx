import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Star } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  badge: string;
  slogan: string;
  description: string;
  image: string;
  bgGradient: string;
  textColor: string;
  sloganColor: string;
  hasStars: boolean;
  categoryFilter?: 'all' | 'packs' | 'combos' | 'albums';
  bgImage?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "OFFICIAL STICKER COLLECTION",
    badge: "¡ALBUM LANZAMIENTO!",
    slogan: "¡TODO EMPIEZA CON PANINI!",
    description: "Consigue el Álbum Oficial de la Copa Mundial de la FIFA 2026™. Disponible en opciones Tapa Blanda y Tapa Dura cartoné de súper lujo con contraportada oficial.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
    bgGradient: "from-indigo-950 via-[#111438] to-[#240f2f]",
    textColor: "text-white",
    sloganColor: "text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-amber-400 to-red-500",
    hasStars: true,
    categoryFilter: 'albums'
  },
  {
    id: 2,
    title: "SUPER PACK DE 1000 SOBRES SÓLIDOS",
    badge: "¡LIQUIDACIÓN EXCLUSIVA!",
    slogan: "7.000 FIGURITAS OFICIALES PANINI",
    description: "Lote gigante de 1000 sobres premium. ¡Cada sobre viene con 7 figuritas en su interior! Llévalo hoy en súper oferta promocional a $1.500 por sobre (Precio total: $1.500.000) para completar tu álbum al instante.",
    image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop",
    bgGradient: "from-[#080d26] via-[#12163e] to-[#25102e]",
    textColor: "text-white",
    sloganColor: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500",
    hasStars: true,
    categoryFilter: 'packs'
  },
  {
    id: 5,
    title: "SUPER PACK DE 500 SOBRES SÓLIDOS",
    badge: "¡PROMO DE 500 SOBRES!",
    slogan: "3.500 FIGURITAS ORIGINALES PANINI",
    description: "Lote súper especial de 500 sobres. ¡Vienen con 7 figuritas por sobre a solo $1.500 cada uno (Precio total: $750.000)! Excelente oportunidad para completarlo.",
    image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop",
    bgGradient: "from-[#0a0c1f] via-[#101438] to-[#1d0e2e]",
    textColor: "text-white",
    sloganColor: "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500",
    hasStars: true,
    categoryFilter: 'packs'
  },
  {
    id: 6,
    title: "KIT DE INICIO RECOMENDADO",
    badge: "¡COMBO RECOMPENSADO!",
    slogan: "TAPA DURA + 20 SOBRES CERRADOS",
    description: "¡El kit perfecto para arrancar al máximo! Consigue el prestigioso Álbum Tapa Dura Cartoné de lujo más 20 sobres oficiales de la FIFA World Cup 2026™ por solo $13.500.",
    image: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=600&auto=format&fit=crop",
    bgGradient: "from-[#110e23] via-[#19153a] to-[#2b0e2b]",
    textColor: "text-white",
    sloganColor: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400",
    hasStars: true,
    categoryFilter: 'combos',
    bgImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "LIQUIDACIÓN EXCLUSIVA REVENDEDORES",
    badge: "¡PACK DE 10 ÁLBUMES COPAS!",
    slogan: "ÁLBUMES OFICIALES MUNDIAL 2026",
    description: "Consigue el lote cerrado de 10 Álbumes Oficiales Copa Mundial 2026 a valor unitario especial de $30.000 (Precio total de oferta: $300.000). ¡Ideal para revendedores, escuelas o grupos de amigos!",
    image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=600&auto=format&fit=crop",
    bgGradient: "from-amber-950 via-[#211d12] to-[#3a200f]",
    textColor: "text-white",
    sloganColor: "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500",
    hasStars: true,
    categoryFilter: 'albums'
  }
];

interface ImageCarouselProps {
  onSelectCategory: (cat: 'all' | 'packs' | 'combos' | 'albums') => void;
  setActiveTab: (tab: 'catalog' | 'players' | 'tracker') => void;
}

export default function ImageCarousel({ onSelectCategory, setActiveTab }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleSlideAction = (category?: 'all' | 'packs' | 'combos' | 'albums') => {
    if (category) {
      onSelectCategory(category);
    }
    setActiveTab('catalog');
    const catalogEl = document.getElementById('main-catalog') || document.getElementById('highlighted-products-section');
    catalogEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeSlide = slides[currentIndex];

  // Framer motion animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  return (
    <div className="relative w-full overflow-hidden py-4 sm:py-6 px-4 max-w-7xl mx-auto" id="main-image-carousel">
      {/* Glow Effect matching general app page design */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 blur-3xl pointer-events-none rounded-full"></div>

      <div className="relative h-[480px] sm:h-[420px] md:h-[450px] lg:h-[420px] w-full rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl border border-purple-500/10">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`absolute inset-0 bg-gradient-to-br ${activeSlide.bgGradient} flex flex-col justify-center px-6 sm:px-12 md:px-16 py-8`}
          >
            {/* Custom Background Image with overlay */}
            {activeSlide.bgImage && (
              <>
                {/* Large Screen: Placed elegantly on the right with bg-contain to display beautifully next to the text */}
                <div 
                  className="absolute inset-y-0 right-0 w-1/2 bg-contain bg-right bg-no-repeat transition-all duration-500 brightness-[0.35] saturate-[1.2] scale-[0.85] sm:scale-[0.9] origin-right hidden lg:block mr-8 opacity-90"
                  style={{ backgroundImage: `url(${activeSlide.bgImage})` }}
                />
                
                {/* Mobile/Tablet: Centered, contained, highly dimmed to avoid covering content and keep text readable */}
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-500 brightness-[0.14] saturate-[1.1] opacity-70 lg:hidden p-4 scale-[0.85]"
                  style={{ backgroundImage: `url(${activeSlide.bgImage})` }}
                />
              </>
            )}

            {/* Pattern Backdrop styled in CSS mimicking FIFA loops */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
              <div className="absolute -top-12 -left-12 w-64 h-64 border-4 border-dashed border-white rounded-full animate-[spin_40s_linear_infinite]"></div>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 border-4 border-double border-white rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full relative z-10">
              {/* Text column - Left */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-inner">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-[10px] sm:text-xs font-black tracking-widest text-yellow-300 uppercase">
                    {activeSlide.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs sm:text-sm font-mono tracking-widest text-purple-300 block font-bold uppercase">
                    {activeSlide.title}
                  </span>
                  
                  <h2 className={`font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase ${activeSlide.textColor}`}>
                    <span className={activeSlide.sloganColor}>
                      {activeSlide.slogan}
                    </span>
                  </h2>
                </div>

                <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">
                  {activeSlide.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleSlideAction(activeSlide.categoryFilter)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-sans font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-yellow-400/20 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    🚀 Ver Colección
                  </button>
                  {activeSlide.hasStars && (
                    <div className="hidden sm:flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-white font-semibold">100% Panini Oficial</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Column - Right */}
              <div className="hidden lg:col-span-5 lg:flex justify-center items-center h-full">
                <div className="relative group p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-3xl hover:border-white/20 transition-all duration-300 max-h-[340px] max-w-[340px]">
                  {/* Subtle inner card glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-1000"></div>
                  
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    referrerPolicy="no-referrer"
                    className="relative rounded-2xl max-h-[290px] w-auto object-contain shadow-2xl transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Arrow Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white hover:text-yellow-400 border border-white/10 hover:border-yellow-400/30 transition-all active:scale-90 z-20 cursor-pointer hidden sm:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white hover:text-yellow-400 border border-white/10 hover:border-yellow-400/30 transition-all active:scale-90 z-20 cursor-pointer hidden sm:flex"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Pagination dots inside slide card */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? 'w-8 bg-yellow-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
