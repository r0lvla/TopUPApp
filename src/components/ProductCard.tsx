'use client';

import { Headline, Caption, Button, Avatar } from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';
import { Product, CURRENCY_SYMBOLS } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
}

const REGION_META: Record<string, { flag: string; name: string; gradient: string; accent: string }> = {
  TR: { flag: '🇹🇷', name: 'Турция', gradient: 'gradient-tr', accent: '#FF9F0A' },
  US: { flag: '🇺🇸', name: 'США', gradient: 'gradient-us', accent: '#0A84FF' },
  KZ: { flag: '🇰🇿', name: 'Казахстан', gradient: 'gradient-kz', accent: '#30D158' },
};

export function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const { impact } = useHaptic();
  const meta = REGION_META[product.region] || REGION_META.TR;
  const symbol = CURRENCY_SYMBOLS[product.face_currency] || product.face_currency;

  const handleSelect = () => {
    impact('medium');
    onSelect(product);
  };

  return (
    <div
      className={`stagger-item ios-card ${meta.gradient}`}
      style={{
        padding: 20,
        marginBottom: 12,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={handleSelect}
    >
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `${meta.accent}15`,
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        position: 'relative',
        zIndex: 1,
      }}>
        <Avatar size={48} style={{ background: 'rgba(120, 120, 128, 0.24)', fontSize: 24 }}>
          {meta.flag}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Headline weight="3" style={{ color: 'var(--ios-label)', letterSpacing: -0.4 }}>
            Apple Gift Card
          </Headline>
          <Caption style={{ color: 'var(--ios-secondary-label)', marginTop: 2 }}>
            {meta.name} • {product.face_value.toLocaleString()} {symbol}
          </Caption>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1,
      }}>
        <div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: -1,
            color: 'var(--ios-label)',
            fontFamily: 'var(--ios-font)',
            lineHeight: 1,
          }} className="price-glow">
            {product.price_rub.toLocaleString('ru-RU')} ₽
          </div>
          <Caption style={{ color: 'var(--ios-tertiary-label)', marginTop: 4 }}>
            ≈ {(product.price_rub / product.face_value).toFixed(1)} ₽/{symbol}
          </Caption>
        </div>

        <Button
          mode="filled"
          size="s"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleSelect();
          }}
          style={{
            borderRadius: 'var(--ios-radius-button)',
            fontWeight: 600,
            paddingLeft: 20,
            paddingRight: 20,
            letterSpacing: -0.2,
          }}
        >
          Купить
        </Button>
      </div>
    </div>
  );
}
