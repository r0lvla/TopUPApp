'use client';

import { Headline, Caption, Button } from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';
import { Product, CURRENCY_SYMBOLS } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
}

const REGION_FLAG_BG: Record<string, { bg: string; gradient: string; glow: string }> = {
  TR: {
    bg: 'linear-gradient(135deg, #E30A17 0%, #FF6B35 100%)',
    gradient: 'gradient-tr',
    glow: 'rgba(227, 10, 23, 0.08)',
  },
  US: {
    bg: 'linear-gradient(135deg, #3C5AFF 0%, #B31942 100%)',
    gradient: 'gradient-us',
    glow: 'rgba(60, 90, 255, 0.08)',
  },
  KZ: {
    bg: 'linear-gradient(135deg, #00B5B6 0%, #FFB900 100%)',
    gradient: 'gradient-kz',
    glow: 'rgba(0, 181, 182, 0.08)',
  },
};

const COUNTRY_ABBR: Record<string, string> = { TR: 'TR', US: 'US', KZ: 'KZ' };

export function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const { impact } = useHaptic();
  const meta = REGION_FLAG_BG[product.region] || REGION_FLAG_BG.TR;
  const symbol = CURRENCY_SYMBOLS[product.face_currency] || product.face_currency;
  const abbr = COUNTRY_ABBR[product.region] || product.region;

  const handleSelect = () => {
    impact('medium');
    onSelect(product);
  };

  return (
    <div
      className={`stagger-item ios-card`}
      style={{
        padding: 20,
        marginBottom: 12,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        backgroundSize: '200% 200%',
        animation: 'fadeInUp 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards, gradientShift 6s ease infinite',
      }}
      onClick={handleSelect}
    >
      {/* Animated gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: meta.glow,
        backgroundSize: '200% 200%',
        animation: 'gradientShift 6s ease infinite',
        pointerEvents: 'none',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: meta.glow, filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 16, position: 'relative', zIndex: 1,
      }}>
        {/* Flag circle */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: meta.bg,
          backgroundSize: '200% 200%',
          animation: 'gradientShift 5s ease infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          <span style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: 0.5,
            lineHeight: '48px',
            textAlign: 'center',
            width: '100%',
            display: 'block',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}>
            {abbr}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Headline weight="3" style={{ color: 'var(--ios-label)', letterSpacing: -0.4 }}>
            Apple Gift Card
          </Headline>
          <Caption style={{ color: 'var(--ios-secondary-label)', marginTop: 2 }}>
            {product.face_value.toLocaleString()} {symbol}
          </Caption>
        </div>
      </div>

      {/* Price + Button */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
      }}>
        <div>
          <div style={{
            fontSize: 32, fontWeight: 700, letterSpacing: -1,
            color: 'var(--ios-label)', fontFamily: 'var(--ios-font)', lineHeight: 1,
          }} className="price-glow">
            {product.price_rub.toLocaleString('ru-RU')} ₽
          </div>
          <Caption style={{ color: 'var(--ios-tertiary-label)', marginTop: 4 }}>
            ≈ {(product.price_rub / product.face_value).toFixed(1)} ₽/{symbol}
          </Caption>
        </div>

        <Button
          mode="filled" size="s"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelect(); }}
          style={{ borderRadius: 14, fontWeight: 600, paddingLeft: 20, paddingRight: 20, letterSpacing: -0.2 }}
        >
          Купить
        </Button>
      </div>
    </div>
  );
}
