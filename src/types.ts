export interface Product {
  id: number;
  region: string;
  currency_code: string;
  face_value: number;
  price_rub: number;
  currency_symbol: string;
  is_active: boolean;
}

export type TabId = 'catalog' | 'guide' | 'about';
