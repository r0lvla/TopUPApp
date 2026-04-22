'use client';

import { useEffect, useState } from 'react';
import { init, retrieveLaunchParams } from '@telegram-apps/sdk-react';

interface Product {
  id: string;
  region: 'TR' | 'US' | 'KZ';
  faceValue: number;
  faceCurrency: string;
  priceRub: string;
  inStock: boolean;
}

const REGION_FLAGS: Record<string, string> = {
  TR: '🇹🇷',
  US: '🇺🇸',
  KZ: '🇰🇿',
};

const REGION_NAMES: Record<string, string> = {
  TR: 'Турция',
  US: 'США',
  KZ: 'Казахстан',
};

export default function Home() {
  const [tgReady, setTgReady] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'TR' | 'US' | 'KZ' | 'ALL'>('ALL');
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    try {
      init();
      setTgReady(true);
    } catch {
      // Not in Telegram context
      setTgReady(true);
    }
  }, []);

  // Mock products for now (will be fetched from API)
  const mockProducts: Product[] = [
    { id: '1', region: 'TR', faceValue: 100, faceCurrency: 'TRY', priceRub: '350', inStock: true },
    { id: '2', region: 'TR', faceValue: 250, faceCurrency: 'TRY', priceRub: '850', inStock: true },
    { id: '3', region: 'TR', faceValue: 500, faceCurrency: 'TRY', priceRub: '1650', inStock: true },
    { id: '4', region: 'US', faceValue: 10, faceCurrency: 'USD', priceRub: '1200', inStock: true },
    { id: '5', region: 'US', faceValue: 25, faceCurrency: 'USD', priceRub: '2900', inStock: true },
    { id: '6', region: 'US', faceValue: 50, faceCurrency: 'USD', priceRub: '5700', inStock: true },
    { id: '7', region: 'KZ', faceValue: 5000, faceCurrency: 'KZT', priceRub: '1100', inStock: true },
    { id: '8', region: 'KZ', faceValue: 10000, faceCurrency: 'KZT', priceRub: '2100', inStock: true },
  ];

  const filtered = selectedRegion === 'ALL'
    ? mockProducts
    : mockProducts.filter((p) => p.region === selectedRegion);

  const cartTotal = Array.from(cart.entries()).reduce((sum, [id, qty]) => {
    const p = mockProducts.find((x) => x.id === id);
    return sum + (p ? parseFloat(p.priceRub) * qty : 0);
  }, 0);

  const cartCount = Array.from(cart.values()).reduce((s, q) => s + q, 0);

  const addToCart = (id: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(id, (next.get(id) || 0) + 1);
      return next;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const qty = next.get(id) || 0;
      if (qty <= 1) next.delete(id);
      else next.set(id, qty - 1);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--tg-theme-bg-color,#1c1c1e)]/90 backdrop-blur-md px-4 py-3 border-b border-[var(--tg-theme-separator-color,#2c2c2e)]">
        <h1 className="text-xl font-bold">TopUPApp 🎮</h1>
        <p className="text-sm text-[var(--tg-theme-subtitle-text-color,#8e8e93)]">
          Подарочные карты Apple
        </p>
      </header>

      {/* Region Filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {(['ALL', 'TR', 'US', 'KZ'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedRegion === r
                ? 'bg-[var(--tg-theme-button-color,#0a84ff)] text-[var(--tg-theme-button-text-color,#ffffff)]'
                : 'bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] text-[var(--tg-theme-text-color,#ffffff)]'
            }`}
          >
            {r === 'ALL' ? '🌍 Все' : `${REGION_FLAGS[r]} ${REGION_NAMES[r]}`}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-2 px-4">
        {filtered.map((product) => {
          const qty = cart.get(product.id) || 0;
          return (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] border border-[var(--tg-theme-separator-color,#3a3a3c)]"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{REGION_FLAGS[product.region]}</span>
                  <span className="font-semibold">
                    {product.faceValue.toLocaleString()} {product.faceCurrency}
                  </span>
                </div>
                <div className="text-[var(--tg-theme-subtitle-text-color,#8e8e93)] text-sm mt-1">
                  {REGION_NAMES[product.region]} • {product.inStock ? '✅ В наличии' : '❌ Нет'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">{product.priceRub} ₽</span>
                {qty > 0 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="w-8 h-8 rounded-full bg-[var(--tg-theme-destructive-text-color,#ff453a)] text-white font-bold flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium">{qty}</span>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-8 h-8 rounded-full bg-[var(--tg-theme-button-color,#0a84ff)] text-white font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product.id)}
                    className="px-4 py-2 rounded-full bg-[var(--tg-theme-button-color,#0a84ff)] text-[var(--tg-theme-button-text-color,#ffffff)] text-sm font-medium"
                  >
                    В корзину
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--tg-theme-bg-color,#1c1c1e)]/95 backdrop-blur-md border-t border-[var(--tg-theme-separator-color,#2c2c2e)]">
          <button className="w-full py-3 rounded-xl bg-[var(--tg-theme-button-color,#0a84ff)] text-[var(--tg-theme-button-text-color,#ffffff)] font-semibold text-lg flex items-center justify-center gap-2">
            🛒 Оплатить {cartTotal.toLocaleString()} ₽
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{cartCount}</span>
          </button>
        </div>
      )}
    </div>
  );
}
