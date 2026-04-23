export interface Product {
  id: string;
  region: string;
  face_value: number;
  face_currency: string;
  price_rub: number;
  supplier: string;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export type TabId = 'catalog' | 'guide' | 'about';

// Currency symbol map
export const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  KZT: '₸',
};
