import React, { useState, useEffect } from 'react';
import { CartItem, Combo, Sticker, Country } from './types';
import { COMBOS, STICKERS, COUNTRIES } from './data';
import ChecklistTracker from './components/ChecklistTracker';
import CustomStickersForm from './components/CustomStickersForm';
import ProductCard from './components/ProductCard';
import PlayerCard from './components/PlayerCard';
import FeaturedProducts from './components/FeaturedProducts';
// @ts-ignore
import logoImg from './assets/images/figukids_logo_dark_1781882447782.jpg';

// Import Icons
import {
  ShoppingBag,
  Search,
  X,
  Trash2,
  FileText,
  Truck,
  MessageCircle,
  Sparkles,
  Star,
  Check,
  ChevronRight,
  Filter,
  Users,
  Award,
  Compass,
  Sliders,
  HelpCircle,
  Menu,
  Heart,
  Copy,
  CreditCard,
  Smartphone,
  Mail,
  MapPin
} from 'lucide-react';

// Safe static string reference to our beautiful custom generated cover graphic
const heroBackground = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1600&auto=format&fit=crop';

export default function App() {
  // Navigation & Catalog view tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'players' | 'tracker'>('catalog');

  // Products and Players catalogs
  const [combosCount, setCombosCount] = useState<Combo[]>(COMBOS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'packs' | 'combos' | 'albums'>('all');
  
  // Single players filters
  const [playerSearch, setPlayerSearch] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'none' | 'price-asc' | 'price-desc' | 'ovr-desc'>('none');

  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Detail Modal popup for a combo
  const [detailedCombo, setDetailedCombo] = useState<Combo | null>(null);

  // WhatsApp Widget states
  const [isWhatsAppWidgetOpen, setIsWhatsAppWidgetOpen] = useState<boolean>(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState<string>('');

  // Order state
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');
  const [custLocality, setCustLocality] = useState<string>('');
  const [custProvince, setCustProvince] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'envio' | 'retiro'>('envio');
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transferencia'>('mercadopago');
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('');
  const [copiedAlias, setCopiedAlias] = useState<boolean>(false);
  const [copiedCbu, setCopiedCbu] = useState<boolean>(false);
  const [showMercadoPagoModal, setShowMercadoPagoModal] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [orderProcessed, setOrderProcessed] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  const handleCopyText = (text: string, type: 'alias' | 'cbu') => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      if (type === 'alias') {
        setCopiedAlias(true);
        setTimeout(() => setCopiedAlias(false), 2000);
      } else {
        setCopiedCbu(true);
        setTimeout(() => setCopiedCbu(false), 2000);
      }
    } catch (err) {
      console.warn("No se pudo copiar", err);
    }
  };

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('figukidsPanini_cart') || localStorage.getItem('figukidzPanini_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Error loading cart", e);
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('figukidsPanini_cart', JSON.stringify(newCart));
    } catch (e) {
      console.error("Error saving cart", e);
    }
  };

  // Add Item to cart
  const handleAddToCart = (item: CartItem) => {
    const existingIndex = cart.findIndex(c => c.id === item.id);
    let updated: CartItem[] = [];

    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += item.quantity;
    } else {
      updated = [...cart, item];
    }
    
    saveCart(updated);
    
    // Auto open cart drawer for better feedback
    setIsCartOpen(true);
  };

  // Bulk add checklist/custom items to cart
  const handleAddCustomListToCart = (item: CartItem) => {
    saveCart([...cart, item]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];

    saveCart(updated);
  };

  const handleRemoveFromCart = (id: string) => {
    const updated = cart.filter(item => item.id !== id);
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
    setOrderProcessed(false);
    setIsPaymentConfirmed(false);
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const shippingFee = deliveryMethod === 'envio' && cartSubtotal > 0 ? (cartSubtotal > 300000 ? 0 : 900) : 0;
  // Apply a 10% coupon discount if subtotal exceeds $8000
  const discountActive = cartSubtotal > 8000;
  const discountAmount = discountActive ? Math.round(cartSubtotal * 0.10) : 0;
  const cartTotal = cartSubtotal - discountAmount + shippingFee;

  // Filter Catalog
  const filteredCombos = COMBOS.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    return true;
  });

  // Filter Single Players
  const filteredPlayers = STICKERS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(playerSearch.toLowerCase()) || 
                        p.code.toLowerCase().includes(playerSearch.toLowerCase());
    const matchTeam = selectedTeam === 'all' || p.country === selectedTeam;
    return matchSearch && matchTeam;
  });

  // Sort Players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'ovr-desc') return b.rating - a.rating; // OVR proxy
    return 0; // none
  });

  // Create WhatsApp message and simulate receipt
  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) {
      alert("Por favor rellena tu nombre y teléfono para procesar.");
      return;
    }

    const receiptId = `FK-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    const receipt = {
      id: receiptId,
      date: today,
      customer: custName,
      phone: custPhone,
      address: `${custAddress}, ${custLocality}, ${custProvince}`,
      delivery: 'Envío rápido a domicilio',
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingFee,
      total: cartTotal,
      paymentMethod: paymentMethod,
    };

    setLastReceipt(receipt);
    setOrderProcessed(true);
    setIsPaymentConfirmed(false); // Reset payment confirmation on new order
  };

  // Build the message to send via WhatsApp
  const handleSendWhatsApp = () => {
    if (!lastReceipt) return;

    let text = `📦 *PEDIDO FIGUKIDZPANINI* (Ref: _${lastReceipt.id}_)\n`;
    text += `👤 *Cliente:* ${lastReceipt.customer}\n`;
    text += `📞 *Teléfono:* ${lastReceipt.phone}\n`;
    text += `📍 *Entrega:* ${lastReceipt.address} (${lastReceipt.delivery})\n\n`;
    
    text += `🛒 *Detalle de compra:*\n`;

    lastReceipt.items.forEach((item: CartItem) => {
      text += `• x${item.quantity} ${item.name} - $${(item.price * item.quantity).toLocaleString()}\n`;
      if (item.details) text += `  _(${item.details})_\n`;
    });

    text += `\n💵 *Subtotal:* $${lastReceipt.subtotal.toLocaleString()}\n`;
    if (lastReceipt.discount > 0) text += `🎁 *Beneficio Descuento:* -$${lastReceipt.discount.toLocaleString()}\n`;
    if (lastReceipt.shipping > 0) text += `🚚 *Envío:* $${lastReceipt.shipping.toLocaleString()}\n`;
    text += `🔥 *TOTAL:* *$${lastReceipt.total.toLocaleString()}*\n\n`;
    
    text += `¡Hola! Acabo de registrar mi pedido en la página con el Ticket #${lastReceipt.id} por un total de $${lastReceipt.total.toLocaleString()}. Les envío este mensaje por WhatsApp para coordinar la entrega y adjuntar el comprobante de la transferencia realizada. ¡Muchas gracias! 👍⚽`;

    const encoded = encodeURIComponent(text);
    // Open in new tab securely
    window.open(`https://wa.me/5491158686668?text=${encoded}`, '_blank');
  };

  const handleSendReceiptWhatsApp = () => {
    if (!lastReceipt) return;

    let text = `🧾 *COMPROBANTE DE PAGO* (Ticket: _#${lastReceipt.id}_)\n\n`;
    text += `👤 *Cliente:* ${lastReceipt.customer}\n`;
    text += `💰 *Monto Transferido:* *$${lastReceipt.total.toLocaleString()}*\n\n`;
    text += `¡Hola! Aquí les adjunto el comprobante de transferencia bancaria de la app Personal Pay para el pedido *#${lastReceipt.id}* por un total de *$${lastReceipt.total.toLocaleString()}*. Quedo a la espera de la confirmación de mi envío. ¡Muchas gracias! 👋⚽`;

    const encoded = encodeURIComponent(text);
    // Open in new tab securely
    window.open(`https://wa.me/5491158686668?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-[#0a0b16] text-slate-100 min-h-screen font-sans antialiased text-base selection:bg-purple-600 selection:text-white overflow-x-clip w-full relative">

      {/* CAMPAÑA ANUNCIO TICKER BAR */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white text-xs font-black py-2.5 px-4 shadow-lg text-center relative z-50 border-b border-purple-500/15">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 uppercase tracking-wider">
          <span className="flex items-center gap-1">🚚 ¡ENVÍO GRATIS superando los $300.000!</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="flex items-center gap-1">💳 3 CUOTAS SIN INTERÉS</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="flex items-center gap-1">🇦🇷 Envíos rápidos a todo el país</span>
        </div>
      </div>
      
      {/* GLOW DECORATORS */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0e1122]/95 backdrop-blur-md border-b border-purple-500/10 px-4 py-3 sm:px-6 shadow-md animate-fadeIn">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="bg-[#13172e] hover:bg-[#1a203f] border border-purple-500/15 text-slate-100 p-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5 text-purple-400" />
            </button>

            <img 
              src={logoImg} 
              alt="FiGUKids PaNiNi" 
              referrerPolicy="no-referrer"
              className="h-14 sm:h-16 w-auto object-contain cursor-pointer transition-transform hover:scale-105 select-none"
              onClick={() => { setActiveTab('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>

          {/* Large Screen Nav Menu */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-300">
            <button 
              onClick={() => { setActiveTab('catalog'); document.getElementById('main-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`hover:text-purple-400 cursor-pointer transition-colors ${activeTab === 'catalog' ? 'text-purple-400 font-extrabold border-b-2 border-purple-500 pb-1' : ''}`}
            >
              🎁 Combos y Álbumes
            </button>
            <button 
              onClick={() => { setActiveTab('players'); document.getElementById('main-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`hover:text-purple-400 cursor-pointer transition-colors ${activeTab === 'players' ? 'text-purple-400 font-extrabold border-b-2 border-purple-500 pb-1' : ''}`}
            >
              ⭐ Jugadores Estrella
            </button>
            <button 
              onClick={() => { setActiveTab('tracker'); document.getElementById('main-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`hover:text-purple-400 cursor-pointer transition-colors ${activeTab === 'tracker' ? 'text-purple-400 font-extrabold border-b-2 border-purple-500 pb-1' : ''}`}
            >
              📖 Control de Álbum (Interactivo)
            </button>
            <a href="#quick-cotizador" className="hover:text-purple-400 transition-colors">Cotizador Rápido</a>
          </nav>

          {/* Cart Trigger Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#13172e] hover:bg-[#1a203f] border border-purple-500/15 text-slate-100 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 transition-all shadow-md active:scale-95 relative cursor-pointer"
              id="header-cart-btn"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                {cart.length > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-orange-500 text-white font-mono text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-[#0a0b16]">
                    {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-mono font-bold text-sm text-slate-300">
                ${cartSubtotal.toLocaleString()}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC HIGHLIGHTED/FEATURED PRODUCTS SLIDER */}
      <FeaturedProducts 
        onAddToCart={handleAddToCart} 
        onViewDetails={(item) => setDetailedCombo(item)} 
      />

      {/* MAIN CATALOG AREA */}
      <main className="px-4 sm:px-6 max-w-7xl mx-auto py-12" id="main-catalog">
        
        {/* Navigation Selector Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-5 mb-8">
          
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-full overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                  : 'text-slate-500 hover:text-slate-850 hover:bg-slate-200/50'
              }`}
            >
              🎁 <span className="font-sans">Álbumes y Combos ({COMBOS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
                activeTab === 'players'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                  : 'text-slate-500 hover:text-slate-850 hover:bg-slate-200/50'
              }`}
            >
              ⭐ <span className="font-sans">Jugadores Estrella ({STICKERS.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">EN CONEXIÓN DIRECTA CON COLECTORES</span>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* COMBOS / GENERAL ITEMS VIEW */}
        {activeTab === 'catalog' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Combos Súper Estrellas y Sobres</span>
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Kits cerrados para coleccionistas experimentados y principiantes.
                </p>
              </div>

              {/* Sub categories pills inside Combos */}
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {(['all', 'packs', 'combos', 'albums'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-white text-amber-600 font-extrabold shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat === 'packs' ? 'Sobres' : cat === 'combos' ? 'Combos' : 'Álbumes'}
                  </button>
                ))}
              </div>
            </div>

            {filteredCombos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCombos.map((combo) => (
                  <ProductCard
                    key={combo.id}
                    combo={combo}
                    onAddToCart={handleAddToCart}
                    onViewDetails={(item) => setDetailedCombo(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-slate-200 rounded-3xl bg-white/50">
                <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-sans text-base font-bold text-slate-600">No encontramos productos en esta sección</h4>
                <p className="text-slate-400 text-xs mt-1">Intenta ajustando los filtros de arriba.</p>
              </div>
            )}
          </div>
        )}

        {/* SINGLE PLAYERS STAR VIEW */}
        {activeTab === 'players' && (
          <div>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="max-w-md">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                  <span>Figuritas Individuales de Estrellas ✨</span>
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Elige a tus cracks favoritos o escudos brillantes para completar de forma precisa tu álbum. Compra con stock garantizado.
                </p>
              </div>

              {/* Filtering Controls Row */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center w-full xl:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar jugador o código..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-yellow-500 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-xs outline-none transition-colors"
                  />
                  {playerSearch && (
                    <button onClick={() => setPlayerSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Country selector filter */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-mono text-slate-400 hidden md:inline">Equipo:</span>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-yellow-500 cursor-pointer"
                  >
                    <option value="all">📍 Todas las selecciones</option>
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sorting options */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-mono text-slate-400 hidden md:inline">Orden:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-yellow-500 cursor-pointer"
                  >
                    <option value="none">Por Defecto</option>
                    <option value="price-asc">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="ovr-desc">Media/Valoración OVR</option>
                  </select>
                </div>
              </div>
            </div>

            {sortedPlayers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fadeIn">
                {sortedPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    sticker={player}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-slate-200 rounded-3xl bg-white/50">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-sans text-base font-bold text-slate-600">Ningún jugador coincide</h4>
                <p className="text-slate-400 text-xs mt-1">Busca usando otra selección o limpia los campos.</p>
                <button
                  onClick={() => { setPlayerSearch(''); setSelectedTeam('all'); setSortBy('none'); }}
                  className="mt-4 text-xs bg-white hover:bg-slate-50 border border-slate-250 text-amber-600 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* QUICK COTIZADOR FORM & ALBUM CHECKLIST SECTION */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto py-12 border-t border-purple-500/10 bg-[#0c0d1e]/20" id="quick-cotizador">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChecklistTracker onAddCustomListToCart={handleAddCustomListToCart} />
          </div>
          <div className="lg:col-span-1">
            <CustomStickersForm onAddCustomListToCart={handleAddCustomListToCart} />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 mt-16 text-slate-600 text-xs shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <img 
                src={logoImg} 
                alt="FiGUKids PaNiNi" 
                referrerPolicy="no-referrer"
                className="h-14 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
                onClick={() => { setActiveTab('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            </div>
            <p className="text-slate-650 leading-relaxed max-w-sm">
              La plataforma premium para coleccionistas de barajitas y figuritas de fútbol del Mundial. Coordinación automatizada directa e integraciones lúdicas sin salir de casa.
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="font-bold text-slate-700 text-sm uppercase font-mono">Accesos Rápidos</h5>
            <div className="flex flex-col gap-2 font-medium">
              <button onClick={() => setActiveTab('catalog')} className="text-left hover:text-orange-500 transition-colors">📦 Álbumes y Combos</button>
              <button onClick={() => setActiveTab('players')} className="text-left hover:text-orange-500 transition-colors">⭐ Jugadores Estrella</button>
              <button onClick={() => setActiveTab('tracker')} className="text-left hover:text-orange-500 transition-colors">📖 Control de Álbum</button>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="font-bold text-slate-700 text-sm uppercase font-mono">Seguridad y Garantía</h5>
            <p className="text-slate-650 leading-relaxed">
              Todos nuestros productos son originales, distribuidos directamente por Panini oficiales. Los envíos viajan con embalaje acolchado especial anti-arrugas.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="font-bold text-slate-700 text-sm uppercase font-mono">Contacto y Soporte</h5>
            <div className="flex flex-col gap-3">
              <p className="text-slate-650">¿Tenés dudas o consultas? Escribinos:</p>
              <a 
                href="mailto:figukidspanini@gmail.com" 
                className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-700 font-semibold p-3 lg:p-2.5 xl:p-3 rounded-2xl border border-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <div className="bg-purple-100 group-hover:bg-purple-200 text-purple-600 p-1.5 rounded-xl transition-colors shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="truncate font-mono text-xs">figukidspanini@gmail.com</span>
              </a>

              <div 
                className="inline-flex items-center gap-2 bg-slate-50 text-slate-705 p-3 lg:p-2.5 xl:p-3 rounded-2xl border border-slate-200 transition-all shadow-sm"
              >
                <div className="bg-orange-100 text-orange-600 p-1.5 rounded-xl shrink-0">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex flex-col text-[10px] text-left leading-normal font-sans">
                  <span className="font-extrabold text-slate-700">Centro de Envíos:</span>
                  <span className="font-medium text-slate-600">Jean Jaures 742, Campana, Bs. As.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 figukidspanini. Todos los derechos reservados. Desarrollado para fanáticos del deporte rey.</p>
          <div className="flex gap-4">
            <span className="font-mono text-[10px] text-slate-500">ARGENTINA • MÉXICO • COLOMBIA • ESPAÑA</span>
          </div>
        </div>
      </footer>

      {/* DETAIL MODAL FOR A COMBO */}
      {detailedCombo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-scaleIn text-slate-800">
            <button
              onClick={() => setDetailedCombo(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 p-2 rounded-xl transition-all z-10 border border-slate-200 cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-video w-full bg-slate-100 relative">
              <img 
                src={detailedCombo.image} 
                alt={detailedCombo.name} 
                referrerPolicy="no-referrer"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
                ⭐ {detailedCombo.rating} • Stock Disponible
              </div>

               <h4 className="font-sans text-xl font-extrabold text-slate-900 leading-tight">
                {detailedCombo.name}
              </h4>

              <p className="text-slate-650 text-sm leading-relaxed">
                {detailedCombo.description}
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase font-mono">PRECIO FINAL</span>
                  <span className="font-mono text-2xl font-black text-orange-650">${detailedCombo.price.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart({
                      id: `combo-${detailedCombo.id}`,
                      itemType: 'combo',
                      originalId: detailedCombo.id,
                      name: detailedCombo.name,
                      price: detailedCombo.price,
                      quantity: 1,
                      image: detailedCombo.image
                    });
                    setDetailedCombo(null);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-sans font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/15 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART COLLAPSIBLE DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          {/*           {/* Cart Surface panel */}
          <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl z-10 animate-slideLeft text-slate-800">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h4 className="font-sans text-base font-extrabold text-slate-900">Carrito de Compra</h4>
                <span className="bg-slate-100 font-mono text-xs px-2.5 py-1 rounded-full text-slate-700 font-bold">
                  {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 p-2 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt vs Normal List Flow */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {orderProcessed && lastReceipt ? (
                /* RECEIPT SUCCESS VIEW */
                <div className="bg-slate-50 rounded-2xl border border-dashed border-orange-500/40 p-5 space-y-5 animate-fadeIn">
                  <div className="text-center space-y-2 border-b border-slate-200 pb-4">
                    <span className="text-3xl">🥳🏆🎉</span>
                    <h5 className="font-sans text-lg font-black text-green-650">¡Pedido Registrado con Éxito!</h5>
                    <p className="text-slate-500 text-xs">Completa tu pago. Revisa el resumen de tu ticket abajo.</p>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>TICKET REF:</span>
                      <span className="text-slate-900 font-extrabold">{lastReceipt.id}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>FECHA:</span>
                      <span className="text-slate-750">{lastReceipt.date}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>CLIENTE:</span>
                      <span className="text-slate-750">{lastReceipt.customer}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>TELÉFONO:</span>
                      <span className="text-slate-750">{lastReceipt.phone}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>ENTREGA:</span>
                      <span className="text-slate-750 truncate max-w-[200px]">{lastReceipt.address}</span>
                    </div>
                  </div>

                  {/* Tiny Itemizer on the Invoice */}
                  <div className="border-t border-b border-slate-200 py-3 space-y-2">
                    {lastReceipt.items.map((item: CartItem) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-slate-650 max-w-[220px] truncate font-sans">x{item.quantity} {item.name}</span>
                        <span className="font-mono text-slate-800">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-700">${lastReceipt.subtotal.toLocaleString()}</span>
                    </div>
                    {lastReceipt.discount > 0 && (
                      <div className="flex justify-between text-green-650">
                        <span>Descuento de la casa:</span>
                        <span className="font-mono">-${lastReceipt.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {lastReceipt.shipping > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Envío estimado:</span>
                        <span className="font-mono text-slate-700">${lastReceipt.shipping.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-extrabold text-orange-600 border-t border-slate-200 pt-2.5 mt-2">
                      <span>Total Estimado:</span>
                      <span className="font-mono">${lastReceipt.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* TRANSFER PAYMENT INSTRUCTIONS */}
                  <div className="bg-orange-50/50 border border-orange-200/80 p-4 rounded-xl text-left space-y-3 animate-fadeIn mt-4 text-slate-800">
                    <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                      <CreditCard className="w-4.5 h-4.5 text-orange-600" />
                      <h6 className="text-xs font-extrabold text-slate-800 uppercase font-sans tracking-tight">
                        Datos de Pago (Transferencia Bancaria)
                      </h6>
                    </div>
                    
                    <p className="text-[11px] text-slate-650 leading-normal font-sans">
                      Transferí el monto total del pedido a la siguiente cuenta de <strong>Personal Pay</strong> para procesar tu orden:
                    </p>

                    <div className="space-y-2 bg-white border border-slate-200 rounded-lg p-3 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium font-sans">Monto a Pagar:</span>
                        <strong className="text-sm text-orange-605 font-black font-mono">${lastReceipt.total.toLocaleString()}</strong>
                      </div>
                      
                      <div className="border-t border-slate-100 my-1.5" />

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium font-sans">Entidad / Plataforma:</span>
                        <span className="text-[#a3f234] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-black tracking-tight">Personal Pay (Suma Pagos S.A.)</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium font-sans">Titular:</span>
                        <span className="text-slate-800 font-bold uppercase">Martín Ledesma (FIGUKIDS)</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium font-sans">CUIT / CUIL:</span>
                        <span className="text-slate-800 font-mono font-bold">20-33625309-6</span>
                      </div>

                      <div className="border-t border-slate-100 my-1.5" />

                      {/* Alias Row */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 font-medium font-sans">Alias:</span>
                          <span className="text-slate-800 font-mono font-black text-xs select-all">FIGUKIDS.PP</span>
                        </div>
                        <button
                          onClick={() => handleCopyText('FIGUKIDS.PP', 'alias')}
                          className={`w-full py-1.5 px-3 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            copiedAlias 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {copiedAlias ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span>¡Alias Copiado con éxito!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Alias</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="border-t border-slate-100 my-1.5" />

                      {/* CBU/CVU Row */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 font-medium font-sans">CVU / CBU:</span>
                          <span className="text-slate-800 font-mono font-black text-xs select-all">0000003100021356789421</span>
                        </div>
                        <button
                          onClick={() => handleCopyText('0000003100021356789421', 'cbu')}
                          className={`w-full py-1.5 px-3 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            copiedCbu 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {copiedCbu ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span>¡CVU/CBU Copiado con éxito!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar CVU / CBU</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* DIRECT INSTRUCTIONS CARDS FOR THE TICKET AND WHATSAPP */}
                  <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-left space-y-2.5 animate-fadeIn mt-4">
                    <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5 font-sans uppercase tracking-tight">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      ¡TICKET GENERADO CON ÉXITO!
                    </p>
                    <p className="text-slate-650 text-[11px] leading-relaxed font-sans">
                      Tu pedido con referencia <strong className="text-slate-800 font-mono">#{lastReceipt.id}</strong> ha sido reservado. Realizá la transferencia por <strong className="text-slate-800 font-bold font-mono">${lastReceipt.total.toLocaleString()}</strong> a tu cuenta de <strong className="text-slate-800 font-bold">Personal Pay</strong>, y luego usá los botones de abajo para enviar el comprobante y resolver cualquier duda sobre tu envío.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleSendWhatsApp}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-sans font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-[0.98] cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5 fill-white stroke-none" />
                      <span>Coordinar Pedido por WhatsApp</span>
                    </button>
                    
                    <button
                      onClick={handleSendReceiptWhatsApp}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-sans font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-[0.98] cursor-pointer"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Enviar Comprobante de Pago</span>
                    </button>

                    <button
                      onClick={() => { setOrderProcessed(false); saveCart([]); }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-650 text-[11px] font-bold py-2 rounded-lg border border-slate-250 transition-colors cursor-pointer"
                    >
                      Comprar más / Reiniciar Carrito
                    </button>
                  </div>
                </div>
              ) : cart.length > 0 ? (
                /* MAIN LIST OF ADDED ITEMS */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-205 pb-2">
                    <span>Artículos en tu canasta</span>
                    <button onClick={handleClearCart} className="text-red-500 hover:text-red-650 flex items-center gap-1 font-bold cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Vaciar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex gap-3 relative overflow-hidden">
                        
                        {/* Thumbnail */}
                        {item.image && (
                          <div className="w-12 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200">
                            <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                          </div>
                        )}

                        {/* Text Detail column */}
                        <div className="flex-1 min-w-0 pr-6">
                          <h5 className="text-xs font-extrabold text-slate-800 truncate font-sans">{item.name}</h5>
                          {item.details && (
                            <p className="text-[10px] text-orange-600 font-medium line-clamp-2 mt-0.5" title={item.details}>
                              🔍 {item.details}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-mono text-xs text-slate-500">${item.price.toLocaleString()} ud</span>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1 rounded-xl">
                              <button onClick={() => handleUpdateQuantity(item.id, -1)} className="text-slate-500 hover:text-slate-800 font-black text-xs px-1 hover:bg-slate-100 rounded cursor-pointer">-</button>
                              <span className="font-mono text-xs px-1 text-orange-605 font-extrabold">{item.quantity}</span>
                              <button onClick={() => handleUpdateQuantity(item.id, 1)} className="text-slate-500 hover:text-slate-800 font-black text-xs px-1 hover:bg-slate-100 rounded cursor-pointer">+</button>
                            </div>
                          </div>
                        </div>

                        {/* Top corner remove trigger */}
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* checkout receipt helper */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm mt-5">
                    <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-orange-600">Datos de Envío</h5>
                    
                    <form onSubmit={handleProcessOrder} className="space-y-3 text-left">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 animate-fadeIn flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🚚</span>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-extrabold text-slate-800 leading-none">Envío Nacional por Correo</span>
                            <span className="text-[9px] text-slate-500 font-medium mt-0.5">Despachos asegurados a todo el país</span>
                          </div>
                        </div>
                        <span className="text-[9px] bg-orange-100 text-orange-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider scale-95 shrink-0">Solo Envíos</span>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          placeholder="Nombre y Apellido *"
                          className="w-full bg-white border border-slate-200 font-sans focus:border-orange-500 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-1.5 text-xs outline-none transition-colors"
                        />
                        <input
                          type="tel"
                          required
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          placeholder="Teléfono / WhatsApp de contacto *"
                          className="w-full bg-white border border-slate-200 font-sans focus:border-orange-500 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-1.5 text-xs outline-none transition-colors"
                        />
                        {deliveryMethod === 'envio' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              required
                              value={custAddress}
                              onChange={(e) => setCustAddress(e.target.value)}
                              placeholder="Dirección (Calle y número) *"
                              className="w-full bg-white border border-slate-200 font-sans focus:border-orange-500 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-1.5 text-xs outline-none transition-colors animate-fadeIn"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                required
                                value={custLocality}
                                onChange={(e) => setCustLocality(e.target.value)}
                                placeholder="Localidad *"
                                className="w-full bg-white border border-slate-200 font-sans focus:border-orange-500 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-1.5 text-xs outline-none transition-colors animate-fadeIn"
                              />
                              <input
                                type="text"
                                required
                                value={custProvince}
                                onChange={(e) => setCustProvince(e.target.value)}
                                placeholder="Provincia *"
                                className="w-full bg-white border border-slate-200 font-sans focus:border-orange-500 text-slate-800 placeholder-slate-400 rounded-xl px-3 py-1.5 text-xs outline-none transition-colors animate-fadeIn"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-[#0b1220] border border-purple-500/10 rounded-xl p-3 text-[11px] text-slate-300 leading-snug space-y-1">
                        <p className="font-bold text-yellow-400 flex items-center gap-1.5 text-xs">
                          📝 Generación de Ticket Oficial
                        </p>
                        <p>
                          Al finalizar la solicitud se creará tu <strong>Ticket de Compra Oficial (Ref)</strong> para coordinar el abono y envío de fútbol de manera inmediata y personalizada por WhatsApp.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-sans text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer mt-1"
                      >
                        Generar Ticket de Compra 🧾
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* EMPTY CART SCREEN */
                <div className="text-center py-20">
                  <span className="text-4xl">🛒</span>
                  <h5 className="font-sans text-sm font-bold text-slate-550 mt-3">Tu carrito está vacío</h5>
                  <p className="text-slate-400 text-xs mt-1 leading-normal font-sans">Navega en el catálogo de combos o tilda las que necesitas en la lista interactiva.</p>
                </div>
              )}
            </div>

            {/* Bottom Totalizer Bar (only when list is active) */}
            {!orderProcessed && cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3 shadow-md">
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="text-slate-800 font-extrabold">${cartSubtotal.toLocaleString()}</span>
                  </div>
                  {discountActive && (
                    <div className="flex justify-between text-green-650">
                      <span>Beneficio 10% OFF:</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {deliveryMethod === 'envio' && (
                    <div className="flex justify-between text-slate-500">
                      <span>Costo de envío:</span>
                      <span>{shippingFee > 0 ? `$${shippingFee}` : '¡GRATIS! 🎁'}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end border-t border-slate-200 pt-3 text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold leading-none mb-0.5">Monto total</span>
                    <span className="font-mono text-2xl font-extrabold text-orange-650 leading-none">
                      ${cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      // Trigger submit manually
                      const fakeEvent = { preventDefault: () => {} };
                      // Since inputs are required, form submission is cleaner
                    }}
                    className="hidden bg-orange-500 hover:bg-orange-600 text-white font-sans font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SIDEBAR MENU DRAWER (LEFT SIDE) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          {/* Main Sidebar Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-[#0e1122] border-r border-purple-500/20 h-full flex flex-col justify-between shadow-2xl z-10 animate-slideRight text-slate-100">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-purple-500/10 flex items-center justify-between bg-[#0a0c1a]">
              <img 
                src={logoImg} 
                alt="FiGUKids PaNiNi" 
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain cursor-pointer transition-transform hover:scale-105 select-none"
                onClick={() => { setActiveTab('catalog'); setIsMobileMenuOpen(false); }}
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-[#13172e] hover:bg-[#1a203f] text-slate-300 hover:text-white p-2 rounded-xl border border-purple-500/15 transition-colors cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content list / Section redirects */}
            <div className="flex-1 overflow-y-auto p-5 py-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono font-bold px-3 mb-2">Navegación Principal</p>
                
                <button
                  onClick={() => {
                    setActiveTab('catalog');
                    setIsMobileMenuOpen(false);
                    document.getElementById('main-catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'catalog' ? 'bg-[#1b1c35] text-purple-400 font-bold border-l-4 border-purple-500' : 'text-slate-300 hover:bg-[#13172e] hover:text-white'}`}
                >
                  <span className="text-base">🎁</span> Combos y Álbumes
                </button>

                <button
                  onClick={() => {
                    setActiveTab('players');
                    setIsMobileMenuOpen(false);
                    document.getElementById('main-catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'players' ? 'bg-[#1b1c35] text-purple-400 font-bold border-l-4 border-purple-500' : 'text-slate-300 hover:bg-[#13172e] hover:text-white'}`}
                >
                  <span className="text-base">⭐</span> Jugadores de Elite
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tracker');
                    setIsMobileMenuOpen(false);
                    document.getElementById('main-catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'tracker' ? 'bg-[#1b1c35] text-purple-400 font-bold border-l-4 border-purple-500' : 'text-slate-300 hover:bg-[#13172e] hover:text-white'}`}
                >
                  <span className="text-base">📖</span> Control de Álbum Interactivo
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    document.getElementById('quick-cotizador')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-slate-300 hover:bg-[#13172e] hover:text-white font-semibold text-sm"
                >
                  <span className="text-base">✏️</span> Cotizador de Faltantes
                </button>
              </div>

              {/* Informative details */}
              <div className="bg-[#10142e] border border-purple-500/10 p-4 rounded-xl space-y-3">
                <span className="text-[10px] bg-purple-500/10 text-purple-400 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  Nuestra Garantía
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Todos nuestros productos son originales, distribuidos directamente por Panini oficiales. Los envíos viajan con embalaje acolchado especial anti-arrugas.
                </p>
              </div>

              {/* Practical links */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono font-bold px-3">Atención al Cliente</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      const text = "¡Hola Figukids! Quisiera consultar sobre la liquidación de Álbumes del Mundial.";
                      window.open(`https://wa.me/5491158686668?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs text-green-400 hover:bg-[#13172e] rounded-xl transition-colors font-semibold text-left cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span>WhatsApp Ventas / Soporte</span>
                  </button>
                  <a
                    href="mailto:figukidspanini@gmail.com"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs text-purple-400 hover:bg-[#13172e] rounded-xl transition-colors font-semibold text-left"
                  >
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span>figukidspanini@gmail.com</span>
                  </a>
                  <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-purple-400 font-semibold text-left">
                    <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Jean Jaures 742, Campana, Bs. As.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer menu details */}
            <div className="p-5 border-t border-purple-500/10 bg-[#0a0c1a] text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wide leading-none mb-1">FIGUKIDSPANINI 2026</span>
              <span className="text-[10px] text-slate-600 block">Envíos rápidos a todo el país 🇦🇷</span>
            </div>

          </div>

          {/* Click to close backdrop hook */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* FLOATING WHATSAPP INTERACTIVE WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
        
        {/* WhatsApp Chat Card Window */}
        {isWhatsAppWidgetOpen && (
          <div className="w-80 sm:w-96 bg-[#121629] border border-purple-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-slate-100">
            {/* Widget Header */}
            <div className="bg-[#075E54] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={logoImg} 
                    alt="FK" 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shadow-md border border-white/20 shrink-0 bg-white"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-[#075E54] rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-white flex items-center gap-1.5">
                    Soporte FiGUKids
                  </h4>
                  <p className="text-[11px] text-emerald-100 font-medium">En línea • Típicamente responde al instante</p>
                </div>
              </div>
              <button
                onClick={() => setIsWhatsAppWidgetOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Widget Body / Chat Area */}
            <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto bg-[#0a0c16] relative custom-scrollbar">
              {/* Background watermark look */}
              <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

              {/* Message bubble from store */}
              <div className="flex flex-col gap-1 items-start max-w-[85%] z-10 relative">
                <div className="bg-[#121b22] text-slate-200 p-3 rounded-2xl rounded-tl-none border border-purple-500/10 text-xs sm:text-sm leading-relaxed shadow-md">
                  ¡Hola! 👋 Bienvenido a <strong>FiGUKids</strong>.
                  <br /><br />
                  ¿En qué te podemos ayudar? Contamos con álbumes, combos coleccionables, las increíbles <strong>490 figuritas sin repetir por $2.000.000</strong> o el pack de <strong>10 figuritas sin repetir por $40.000</strong> de liquidación 🇦🇷
                </div>
                <span className="text-[9px] text-slate-500 font-mono pl-1">Justo ahora</span>
              </div>

              {/* Predefined Option Chips */}
              <div className="space-y-2 pt-2 z-10 relative">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest pl-1">
                  {cart.length > 0 ? "Consultas sobre mi Carrito 🛒" : "Consultas sobre Productos 📦"}
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {cart.length > 0 ? (
                    <>
                      {/* Consult about full cart */}
                      <button
                        onClick={() => {
                          const itemsText = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
                          const cartTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
                          const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cartTotal);
                          const text = `¡Hola! Quisiera consultar sobre mi pedido en el carrito por un total de ${formattedPrice}. Detalle de productos: ${itemsText}.`;
                          window.open(`https://wa.me/5491158686668?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-green-600/20 hover:bg-green-600/30 text-xs text-green-300 hover:text-white border border-green-500/30 px-3 py-1.5 rounded-full transition-all text-left cursor-pointer active:scale-95 flex items-center gap-1.5 w-full"
                      >
                        🛍️ Consultar por todo el Pedido ({cart.length} {cart.length === 1 ? 'ítem' : 'ítems'})
                      </button>

                      {/* Items individual query chips */}
                      {cart.slice(0, 3).map((item) => (
                        <button
                          key={`cart-chip-${item.id}`}
                          onClick={() => {
                            const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(item.price);
                            const text = `¡Hola! Quisiera consultar disponibilidad de ${item.quantity} unidad(es) de "${item.name}" con precio total de ${formattedPrice}.`;
                            window.open(`https://wa.me/5491158686668?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="bg-[#13172e] hover:bg-purple-600/20 text-xs text-purple-300 hover:text-white border border-purple-500/20 px-3 py-1.5 rounded-full transition-all text-left cursor-pointer active:scale-95 flex items-center gap-1 max-w-full"
                        >
                          🔍 {item.quantity}x {item.name.length > 25 ? `${item.name.substring(0, 25)}...` : item.name}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* Products query chips from catalog */}
                      {COMBOS.filter(c => c.stock > 0).slice(0, 3).map((combo) => (
                        <button
                          key={`product-chip-${combo.id}`}
                          onClick={() => {
                            const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(combo.price);
                            const text = `¡Hola Figukids! Quisiera consultar por el "${combo.name}" que vi publicado en la web a ${formattedPrice}.`;
                            window.open(`https://wa.me/5491158686668?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="bg-[#13172e] hover:bg-purple-600/20 text-xs text-purple-300 hover:text-white border border-purple-500/20 px-3 py-1.5 rounded-full transition-all text-left cursor-pointer active:scale-95 flex items-center gap-1 max-w-full"
                        >
                          📦 {combo.name.length > 25 ? `${combo.name.substring(0, 25)}...` : combo.name}
                        </button>
                      ))}
                    </>
                  )}

                  {/* General option to quote missing lists */}
                  <button
                    onClick={() => {
                      const text = "¡Hola! Me gustaría cotizar mi lista de figuritas faltantes para completar mi álbum.";
                      window.open(`https://wa.me/5491158686668?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="bg-[#13172e] hover:bg-purple-600/20 text-xs text-purple-300 hover:text-white border border-purple-500/20 px-3 py-1.5 rounded-full transition-all text-left cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    ✏️ Cotizar mis Faltantes
                  </button>
                </div>
              </div>
            </div>

            {/* Widget Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!whatsAppMessage.trim()) return;
                window.open(`https://wa.me/5491158686668?text=${encodeURIComponent(whatsAppMessage)}`, '_blank');
                setWhatsAppMessage('');
              }}
              className="p-3 border-t border-purple-500/10 bg-[#0f1224] flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Escribí tu mensaje aquí..."
                value={whatsAppMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                className="flex-grow bg-[#171b36] border border-purple-500/15 focus:border-purple-500/40 focus:outline-none text-xs sm:text-sm text-slate-100 px-3 py-2.5 rounded-xl placeholder-slate-500 font-sans"
              />
              <button
                type="submit"
                disabled={!whatsAppMessage.trim()}
                className="bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-40 disabled:hover:bg-[#25D366] text-white p-2.5 rounded-xl transition-all font-sans font-bold flex items-center justify-center cursor-pointer active:scale-95"
                title="Enviar consulta via WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 turn-45"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsWhatsAppWidgetOpen(!isWhatsAppWidgetOpen)}
          className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border border-white/20 select-none cursor-pointer relative"
          title="Consúltanos por WhatsApp"
          id="floating-whatsapp-btn"
        >
          {isWhatsAppWidgetOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="w-6 h-6 fill-white"
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              {/* Subtle green notification badge to grab attention */}
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-[#25D366] border-2 border-[#121629] text-[9px] font-bold text-white items-center justify-center">1</span>
              </span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}
