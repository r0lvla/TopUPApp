'use client';

import { useState, useCallback } from 'react';
import {
  Modal,
  Section,
  Cell,
  Button,
  Headline,
  Caption,
  Title,
  Divider,
} from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';
import { Product, CURRENCY_SYMBOLS } from '../types';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const REGION_META: Record<string, { flag: string; name: string; accent: string }> = {
  TR: { flag: '🇹🇷', name: 'Турция', accent: '#FF9F0A' },
  US: { flag: '🇺🇸', name: 'США', accent: '#0A84FF' },
  KZ: { flag: '🇰🇿', name: 'Казахстан', accent: '#30D158' },
};

export function ProductModal({ product, open, onClose }: ProductModalProps) {
  const { notification, impact } = useHaptic();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = useCallback(() => {
    if (!product) return;
    setPurchasing(true);
    impact('heavy');
    setTimeout(() => {
      setPurchasing(false);
      notification('success');
      onClose();
    }, 2000);
  }, [product, impact, notification, onClose]);

  if (!product) return null;

  const meta = REGION_META[product.region] || REGION_META.TR;
  const symbol = CURRENCY_SYMBOLS[product.face_currency] || product.face_currency;

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
      snapPoints={[0.65]}
      dismissible
    >
      <div style={{
        padding: '8px 0 32px',
        background: 'var(--ios-secondary-bg)',
        borderRadius: '20px 20px 0 0',
      }}>
        <div style={{
          width: 36, height: 5, borderRadius: 2.5,
          background: 'var(--ios-fill-primary)',
          margin: '6px auto 20px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px 20px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: `${meta.accent}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>
            {meta.flag}
          </div>
          <div>
            <Title level="3" style={{ letterSpacing: -0.4 }}>Apple Gift Card</Title>
            <Caption style={{ color: 'var(--ios-secondary-label)', marginTop: 2 }}>
              {meta.name} • {product.face_value.toLocaleString()} {symbol}
            </Caption>
          </div>
        </div>

        <Divider />

        <Section header="Заказ" style={{ margin: '12px 16px' }}>
          <Cell
            before={<span style={{ fontSize: 20 }}>🎴</span>}
            after={<Headline weight="3" style={{ color: 'var(--ios-label)' }}>{product.face_value.toLocaleString()} {symbol}</Headline>}
            multiline
          >
            <Headline weight="3">Номинал</Headline>
          </Cell>
          <Cell
            before={<span style={{ fontSize: 20 }}>💳</span>}
            after={<Headline weight="3" style={{ color: 'var(--ios-secondary-label)' }}>Банковская карта</Headline>}
            multiline
          >
            <Headline weight="3">Оплата</Headline>
          </Cell>
          <Cell
            before={<span style={{ fontSize: 20 }}>💰</span>}
            after={<Title level="3" style={{ color: 'var(--ios-blue)' }}>{product.price_rub.toLocaleString('ru-RU')} ₽</Title>}
            multiline
          >
            <Headline weight="3">Итого</Headline>
          </Cell>
        </Section>

        <div style={{ padding: '8px 16px 0' }}>
          <Button
            mode="filled" size="l" stretched
            onClick={handlePurchase}
            disabled={purchasing}
            style={{ borderRadius: 14, fontWeight: 600, height: 50, fontSize: 17, letterSpacing: -0.4 }}
          >
            {purchasing ? 'Обработка...' : `Оплатить ${product.price_rub.toLocaleString('ru-RU')} ₽`}
          </Button>
        </div>

        <Caption style={{
          textAlign: 'center', color: 'var(--ios-tertiary-label)',
          padding: '12px 16px 0', display: 'block',
        }}>
          Код будет доставлен мгновенно после оплаты
        </Caption>
      </div>
    </Modal>
  );
}
