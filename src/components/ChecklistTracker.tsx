import React, { useState, useEffect } from 'react';
import { Country, CartItem } from '../types';
import { COUNTRIES } from '../data';
import { Check, Plus, Star, Award, Sparkles, ShoppingBag } from 'lucide-react';

interface ChecklistTrackerProps {
  onAddCustomListToCart: (item: CartItem) => void;
}

// Fixed size of a typical squad size for simplification and high-performance UI
const SQUAD_SIZE = 19;

export default function ChecklistTracker({ onAddCustomListToCart }: ChecklistTrackerProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  // State to hold owned sticker numbers per country. Format: { 'ARG': [true, false, true, ...] }
  const [trackerState, setTrackerState] = useState<Record<string, boolean[]>>({});

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('figukidsPanini_tracker') || localStorage.getItem('figukidzPanini_tracker');
      if (saved) {
        setTrackerState(JSON.parse(saved));
      } else {
        // Initialize with all false
        const initial: Record<string, boolean[]> = {};
        COUNTRIES.forEach(c => {
          initial[c.code] = new Array(SQUAD_SIZE).fill(false);
        });
        setTrackerState(initial);
      }
    } catch (e) {
      console.error("Error loading tracker state", e);
    }
  }, []);

  // Save to localStorage when state changes
  const saveState = (newState: Record<string, boolean[]>) => {
    setTrackerState(newState);
    try {
      localStorage.setItem('figukidsPanini_tracker', JSON.stringify(newState));
    } catch (e) {
      console.error("Error saving tracker state", e);
    }
  };

  const toggleSticker = (countryCode: string, index: number) => {
    const list = trackerState[countryCode] ? [...trackerState[countryCode]] : new Array(SQUAD_SIZE).fill(false);
    list[index] = !list[index];
    const newState = {
      ...trackerState,
      [countryCode]: list,
    };
    saveState(newState);
  };

  const clearCountry = (countryCode: string) => {
    const newState = {
      ...trackerState,
      [countryCode]: new Array(SQUAD_SIZE).fill(false),
    };
    saveState(newState);
  };

  const markAllCountry = (countryCode: string, val: boolean) => {
    const newState = {
      ...trackerState,
      [countryCode]: new Array(SQUAD_SIZE).fill(val),
    };
    saveState(newState);
  };

  const currentCountryStatus = trackerState[selectedCountry.code] || new Array(SQUAD_SIZE).fill(false);
  const ownedCount = currentCountryStatus.filter(Boolean).length;
  const missingCount = SQUAD_SIZE - ownedCount;
  const percentage = Math.round((ownedCount / SQUAD_SIZE) * 100);

  // Price of single missing sticker
  const PRICE_PER_MISSING = 20000; 

  const handleInquireWhatsApp = () => {
    if (missingCount === 0) return;
    
    const missingNumbers: number[] = [];
    currentCountryStatus.forEach((owned, idx) => {
      if (!owned) {
        missingNumbers.push(idx + 1);
      }
    });

    const listDetails = missingNumbers.join(', ');
    const text = `¡Hola! Quisiera consultar stock de mis figus faltantes de ${selectedCountry.name} (${missingCount} unidades): ${listDetails}. ¿Tienen disponibilidad antes de que realice el pedido por la web? ¡Gracias!`;
    window.open(`https://wa.me/5491158686668?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddMissingToCart = () => {
    if (missingCount === 0) return;
    
    // Find missing numbers (1-indexed for children)
    const missingNumbers: number[] = [];
    currentCountryStatus.forEach((owned, idx) => {
      if (!owned) {
        missingNumbers.push(idx + 1);
      }
    });

    const listDetails = missingNumbers.join(', ');
    const totalCost = missingCount * PRICE_PER_MISSING;

    const cartItem: CartItem = {
      id: `custom-${selectedCountry.code}-${Date.now()}`,
      itemType: 'custom_list',
      originalId: selectedCountry.code,
      name: `Faltas de ${selectedCountry.name} (${missingCount} ud)`,
      price: PRICE_PER_MISSING,
      quantity: missingCount,
      details: `Números faltantes: ${listDetails}`,
      image: 'https://images.unsplash.com/photo-1589483232748-515c025575dc?w=150&auto=format&fit=crop&q=60'
    };

    onAddCustomListToCart(cartItem);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 text-slate-800 relative overflow-hidden shadow-xl" id="checklist-tracker">
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-500 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Interactivo
            </span>
            <span className="text-slate-500 text-sm font-medium">Lanzador de Álbum</span>
          </div>
          <h3 className="font-sans text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Control de tu Álbum 📖
          </h3>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Tilda las figuritas que ya tienes pegadas para ver tu avance en tiempo real y cotizar automáticamente las que te faltan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => markAllCountry(selectedCountry.code, true)}
            className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
          >
            Marcar Todos
          </button>
          <button 
            onClick={() => clearCountry(selectedCountry.code)}
            className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
          >
            Limpiar Todo
          </button>
        </div>
      </div>

      {/* Country Selection Tab Row */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {COUNTRIES.map((country) => {
          const isSelected = selectedCountry.code === country.code;
          const countryOwned = trackerState[country.code] ? trackerState[country.code].filter(Boolean).length : 0;
          const countryPercentage = Math.round((countryOwned / SQUAD_SIZE) * 100);

          return (
            <button
              key={country.code}
              onClick={() => setSelectedCountry(country)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-sans text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-sky-500 border-sky-500 text-white font-extrabold shadow-md shadow-sky-500/25 transform scale-[1.03]'
                  : 'bg-slate-50 border-slate-205 hover:border-slate-300 text-slate-750'
              }`}
            >
              <span className="text-base">{country.flag}</span>
              <span>{country.name}</span>
              <span className={`text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded-md ${
                isSelected ? 'bg-white/20 text-white font-bold' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {countryOwned}/{SQUAD_SIZE}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress & Quick Cart Adder Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Detail & Action to Add Missing to Cart */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200/85 rounded-2xl p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedCountry.flag}</span>
              <div>
                <h4 className="font-sans text-lg font-bold text-slate-900 leading-tight">
                  Selección de {selectedCountry.name}
                </h4>
                <p className="text-xs font-mono text-slate-400 font-bold">CÓDIGO DE SELECCIÓN: {selectedCountry.code}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                  <span>Progreso de Pegado</span>
                  <span className="font-mono text-sky-600 font-bold">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-150">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tengo</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-green-600 flex items-center gap-1.5">
                    {ownedCount} <span className="text-xs text-slate-500 font-normal">({ownedCount} figus)</span>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-150">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Me Faltan</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-orange-600 flex items-center gap-1.5">
                    {missingCount} <span className="text-xs text-slate-505 font-normal">({missingCount} figus)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="bg-orange-50/40 border border-orange-200 rounded-xl p-3 mb-4">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Precio unitario p/ falta:</span>
                <span className="font-mono text-orange-700 font-bold">${PRICE_PER_MISSING.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base text-slate-905 font-bold mt-1.5 border-b border-orange-200/50 pb-2 mb-2">
                <span>Subtotal Faltantes:</span>
                <span className="font-mono text-orange-700 font-extrabold">
                  ${(missingCount * PRICE_PER_MISSING).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-orange-700 font-bold text-center leading-snug">
                ⚠️ Consultar disponibilidad por WhatsApp antes de realizar el pedido.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleInquireWhatsApp}
                disabled={missingCount === 0}
                className={`w-full py-3 rounded-xl font-sans text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  missingCount > 0
                    ? 'bg-[#25D366] hover:bg-[#128C7E] text-white active:scale-[0.98] shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <span>💬 Consultar Faltas por WhatsApp</span>
              </button>

              <button
                onClick={handleAddMissingToCart}
                disabled={missingCount === 0}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  missingCount > 0
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98] border border-slate-200'
                    : 'bg-slate-50 text-slate-350 cursor-not-allowed border border-slate-100'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Luego de consultar, Agregar al Carrito</span>
              </button>
            </div>
            {missingCount === 0 && (
              <p className="text-[10px] text-green-600 font-semibold text-center mt-2">
                🎉 ¡Felicidades! Tienes esta selección completa.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: The Grid of Stickers to Toggle */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sky-500" /> Casilleros del Álbum ({selectedCountry.code})
            </span>
            <span className="text-[10px] text-slate-400 italic">Haz clic para tildar que ya la pegaste</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2.5">
            {currentCountryStatus.map((owned, idx) => {
              const stickerNum = idx + 1;
              return (
                <button
                  key={idx}
                  onClick={() => toggleSticker(selectedCountry.code, idx)}
                  className={`relative aspect-[3/4] rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none group ${
                    owned
                      ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-green-500/50 shadow-sm text-green-700 font-bold scale-[0.98]'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  <span className="font-mono text-xs text-slate-400 group-hover:text-slate-500 font-semibold mb-1">
                    #{stickerNum}
                  </span>
                  
                  {owned ? (
                    <div className="bg-green-500 text-slate-950 p-1 rounded-full flex items-center justify-center animate-scaleIn">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-dashed border-slate-200 group-hover:border-slate-300 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-300 group-hover:text-slate-500 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <span className={`text-[9px] font-bold mt-2 font-mono uppercase tracking-wider ${
                    owned ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-500'
                  }`}>
                    {owned ? 'TENGO' : 'FALTA'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
