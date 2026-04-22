'use client';

import { useEffect, useState, useCallback } from 'react';

interface Product {
  id: string;
  region: 'TR' | 'US' | 'KZ';
  face_value: number;
  face_currency: string;
  price_rub: string;
  in_stock: boolean;
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

const REGION_ORDER = ['TR', 'US', 'KZ'] as const;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'TR' | 'US' | 'KZ' | 'ALL'>('TR');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmRegion, setConfirmRegion] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setError(data.error || 'Failed to load products');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedRegion === 'ALL'
    ? products
    : products.filter((p) => p.region === selectedRegion);

  const grouped = REGION_ORDER
    .filter((r) => selectedRegion === 'ALL' || selectedRegion === r)
    .map((region) => ({
      region,
      products: filtered.filter((p) => p.region === region),
    }));

  const haptic = useCallback(() => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch { /* ignore */ }
  }, []);

  // Purchase confirmation modal
  if (selectedProduct) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 bg-[var(--tg-theme-bg-color,#1c1c1e)] px-4 py-3 border-b border-[var(--tg-theme-separator-color,#2c2c2e)]">
          <button onClick={() => { setSelectedProduct(null); setConfirmRegion(false); }} className="text-[var(--tg-theme-button-color,#0a84ff)] text-base">
            ← Назад
          </button>
        </div>

        <div className="flex-1 flex flex-col p-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{REGION_FLAGS[selectedProduct.region]}</span>
            <div>
              <div className="text-2xl font-bold">
                {selectedProduct.face_value.toLocaleString()} {selectedProduct.face_currency}
              </div>
              <div className="text-[var(--tg-theme-subtitle-text-color,#8e8e93)]">
                Apple Gift Card • {REGION_NAMES[selectedProduct.region]}
              </div>
            </div>
          </div>

          <div className="bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--tg-theme-subtitle-text-color,#8e8e93)]">К оплате</span>
              <span className="text-3xl font-bold">{Number(selectedProduct.price_rub).toLocaleString()} ₽</span>
            </div>
          </div>

          {/* Region warning */}
          <div className="bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] rounded-xl p-4 mb-4 border border-yellow-500/30">
            <div className="text-yellow-400 text-sm font-medium mb-2">⚠️ Внимание</div>
            <div className="text-sm text-[var(--tg-theme-text-color,#ffffff)] mb-3">
              Этот код работает только на Apple ID с регионом <b>{REGION_NAMES[selectedProduct.region]}</b> {REGION_FLAGS[selectedProduct.region]}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmRegion}
                onChange={(e) => { setConfirmRegion(e.target.checked); haptic(); }}
                className="mt-1 w-5 h-5 rounded accent-[var(--tg-theme-button-color,#0a84ff)]"
              />
              <span className="text-sm">
                Мой регион Apple ID = {REGION_NAMES[selectedProduct.region]} {REGION_FLAGS[selectedProduct.region]}
              </span>
            </label>
          </div>

          <a
            href="#region-guide"
            onClick={(e) => {
              e.preventDefault();
              window.Telegram?.WebApp?.openLink?.('https://topupapp-seven.vercel.app/guide');
            }}
            className="text-[var(--tg-theme-button-color,#0a84ff)] text-sm text-center mb-4 underline"
          >
            📖 Как сменить регион Apple ID?
          </a>

          <button
            disabled={!confirmRegion}
            onClick={() => {
              haptic();
              // TODO: initiate payment
              alert('Оплата будет подключена после интеграции с ЮKassa');
            }}
            className={`w-full py-4 rounded-xl font-semibold text-lg mt-auto ${
              confirmRegion
                ? 'bg-[var(--tg-theme-button-color,#0a84ff)] text-[var(--tg-theme-button-text-color,#ffffff)]'
                : 'bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] text-[var(--tg-theme-subtitle-text-color,#8e8e93)] cursor-not-allowed'
            }`}
          >
            Оплатить {Number(selectedProduct.price_rub).toLocaleString()} ₽
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--tg-theme-bg-color,#1c1c1e)]/90 backdrop-blur-md px-4 py-3 border-b border-[var(--tg-theme-separator-color,#2c2c2e)]">
        <h1 className="text-xl font-bold">TopUPApp 🎁</h1>
        <p className="text-sm text-[var(--tg-theme-subtitle-text-color,#8e8e93)]">
          Apple Gift Card — мгновенная доставка
        </p>
      </header>

      {/* Region tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {(['TR', 'US', 'KZ', 'ALL'] as const).map((r) => (
          <button
            key={r}
            onClick={() => { setSelectedRegion(r); haptic(); }}
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

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[var(--tg-theme-button-color,#0a84ff)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--tg-theme-subtitle-text-color,#8e8e93)] text-sm">Загрузка каталога...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          Ошибка загрузки: {error}
        </div>
      )}

      {/* Product groups */}
      {!loading && !error && grouped.map(({ region, products: regionProducts }) => (
        <div key={region} className="mb-4">
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-lg">{REGION_FLAGS[region]}</span>
            <span className="text-sm font-semibold text-[var(--tg-theme-subtitle-text-color,#8e8e93)] uppercase tracking-wider">
              {REGION_NAMES[region]}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 px-4">
            {regionProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => { setSelectedProduct(product); haptic(); }}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] border border-[var(--tg-theme-separator-color,#3a3a3c)] active:scale-[0.98] transition-transform text-left w-full"
              >
                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {product.face_value.toLocaleString()} {product.face_currency}
                  </div>
                  <div className="text-[var(--tg-theme-subtitle-text-color,#8e8e93)] text-sm mt-0.5">
                    Apple Gift Card
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold">{Number(product.price_rub).toLocaleString()} ₽</div>
                    <div className="text-xs text-[var(--tg-theme-subtitle-text-color,#8e8e93)]">в наличии</div>
                  </div>
                  <span className="text-[var(--tg-theme-button-color,#0a84ff)] text-2xl">→</span>
                </div>
              </button>
            ))}
            {regionProducts.length === 0 && (
              <div className="text-center py-6 text-[var(--tg-theme-subtitle-text-color,#8e8e93)] text-sm">
                Нет товаров в этом регионе
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Region guide link */}
      {!loading && !error && (
        <div className="px-4 mt-4">
          <a
            href="/guide"
            className="block w-full p-4 rounded-xl bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] border border-[var(--tg-theme-separator-color,#3a3a3c)] text-center"
          >
            <span className="text-lg">📖</span>
            <span className="text-sm text-[var(--tg-theme-button-color,#0a84ff)] ml-2">
              Как сменить регион Apple ID
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
