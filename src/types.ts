export type StickerType = 'normal' | 'shiny' | 'legend' | 'extra';

export interface Sticker {
  id: string;
  name: string;
  country: string;
  code: string; // e.g. "ARG 10" or "FRA 7"
  price: number;
  type: StickerType;
  rating: number;
  image: string;
  stock: number;
  skills?: string[];
}

export type ComboCategory = 'packs' | 'combos' | 'albums';

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ComboCategory;
  rating: number;
  image: string;
  stock: number;
  isPopular?: boolean;
}

export interface CustomStickerRequest {
  country: string;
  numbers: string; // e.g., "1, 5, 8, 10, 19"
  totalPrice: number;
  count: number;
}

export interface CartItem {
  id: string; // combination of item type and id
  itemType: 'sticker' | 'combo' | 'custom_list';
  originalId: string; // sticker id, combo id, or custom string
  name: string;
  price: number;
  quantity: number;
  image?: string;
  details?: string; // listing of sticker numbers for custom list
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  color: string; // Tailwind bg color class
}
