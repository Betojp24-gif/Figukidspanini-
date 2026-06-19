import React, { useState } from 'react';
import { Country, CartItem } from '../types';
import { COUNTRIES } from '../data';
import { HelpCircle, Sparkles, PlusCircle, CheckCircle } from 'lucide-react';

interface CustomStickersFormProps {
  onAddCustomListToCart: (item: CartItem) => void;
}

export default function CustomStickersForm({ onAddCustomListToCart }: CustomStickersFormProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(COUNTRIES[0].code);
  const [inputText, setInputText] = useState<string>('');
  const [errorMess, setErrorMess] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  // Price of single missing sticker
  const PRICE_PER_STICKER = 20000;

  // Extract valid sticker numbers from text
  const parseNumbers = (text: string): number[] => {
    // splits by commas, spaces, dashes or slashes
    const parts = text.split(/[,\s\-/]+/);
    const validNums: number[] = [];
    
    parts.forEach(p => {
      const trimmed = p.trim();
      if (!trimmed) return;
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= 25) { // Assuming up to 25 squad members
        if (!validNums.includes(num)) {
          validNums.push(num);
        }
      }
    });

    return validNums.sort((a, b) => a - b);
  };

  const numbersList = parseNumbers(inputText);
  const count = numbersList.length;
  const totalPrice = count * PRICE_PER_STICKER;

  const currentCountryObj = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess('');
    setSuccess(false);

    if (count === 0) {
      setErrorMess('Por favor ingresa al menos un número válido entre 1 y 25.');
      return;
    }

    const detailsStr = `Números solicitados: ${numbersList.join(', ')}`;
    
    const newItem: CartItem = {
      id: `custom-form-${selectedCountry}-${Date.now()}`,
      itemType: 'custom_list',
      originalId: selectedCountry,
      name: `Lista Faltas: ${currentCountryObj.name} (x${count})`,
      price: PRICE_PER_STICKER,
      quantity: count,
      details: detailsStr,
      image: 'https://images.unsplash.com/photo-1589483232748-515c025575dc?w=150&auto=format&fit=crop&q=60'
    };

    onAddCustomListToCart(newItem);
    setInputText('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleInquireWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess('');
    if (count === 0) {
      setErrorMess('Por favor ingresa al menos un número válido antes de consultar.');
      return;
    }

    const text = `¡Hola! Quisiera consultar stock antes de solicitar la lista de faltas para ${currentCountryObj.name} (${count} unidades): ${numbersList.join(', ')}. ¿Tienen stock de todos? ¡Muchas gracias!`;
    window.open(`https://wa.me/5491158686668?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-800 h-full flex flex-col justify-between shadow-xl" id="custom-stickers-form">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1 rounded bg-sky-100 text-sky-600">
            <Sparkles className="w-4 h-4" />
          </span>
          <h4 className="font-sans text-lg font-bold text-slate-900">Cotizador Rápido de Faltas ⚡</h4>
        </div>
        <p className="text-slate-655 text-xs mb-4 leading-relaxed">
          ¿Tienes una lista de números en papel o WhatsApp? Elige la selección, escríbela abajo separada por comas (ej: <span className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">3, 5, 12, 19</span>) y agrégalas de un solo clic.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              Selección Nacional
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-205 focus:border-orange-550 text-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-between">
              <span>Números de Figuritas</span>
              <span className="text-[10px] text-slate-400 font-normal">Soporta números del 1 al 25</span>
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ej: 1, 4, 10, 11, 15, 18..."
              className="w-full h-24 bg-slate-50 border border-slate-205 focus:border-orange-500 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2 text-sm outline-none transition-colors font-mono resize-none"
            />
          </div>

          {errorMess && (
            <p className="text-xs text-red-600 font-semibold">{errorMess}</p>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 border border-green-200 p-2 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>¡Agregado exitosamente al carrito!</span>
            </div>
          )}
        </form>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4">
        {count > 0 && (
          <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5 border border-slate-150">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Figuritas detectadas:</span>
              <span className="font-mono font-bold text-slate-800">{count} unidades</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Lista depurada:</span>
              <span className="font-mono text-xs text-orange-600 truncate max-w-[200px]" title={numbersList.join(', ')}>
                {numbersList.join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-1.5 mt-1">
              <span>Total:</span>
              <span className="font-mono text-orange-650">${totalPrice.toLocaleString()}</span>
            </div>
            <div className="border-t border-orange-100 pt-1.5 mt-1">
              <p className="text-[11px] text-orange-700 font-bold text-center leading-snug">
                ⚠️ Consultar disponibilidad por WhatsApp antes de solicitar.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleInquireWhatsApp}
            disabled={count === 0}
            className={`w-full py-2.5 rounded-xl font-sans text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              count > 0
                ? 'bg-[#25D366] hover:bg-[#128C7E] text-white active:scale-[0.98] shadow-lg shadow-emerald-500/10'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <span>💬 Consultar Lista por WhatsApp</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={count === 0}
            className={`w-full py-2 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              count > 0
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98] border border-slate-200'
                : 'bg-slate-50 text-slate-350 cursor-not-allowed border border-slate-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Luego de consultar, Agregar al Carrito</span>
          </button>
        </div>
      </div>
    </div>
  );
}
