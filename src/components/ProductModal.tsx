'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useHaptic } from '../hooks/useHaptic';
import { Product, CURRENCY_SYMBOLS } from '../types';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const REGION_META: Record<string, { flag: string; name: string; accent: string; gradient: string }> = {
  TR: { flag: '🇹🇷', name: 'Турция', accent: '#FF9F0A', gradient: 'linear-gradient(135deg, #FF9F0A22, #E0303022)' },
  US: { flag: '🇺🇸', name: 'США', accent: '#0A84FF', gradient: 'linear-gradient(135deg, #0A84FF22, #FF453A22)' },
  KZ: { flag: '🇰🇿', name: 'Казахстан', accent: '#30D158', gradient: 'linear-gradient(135deg, #30D15822, #0A84FF22)' },
};

export function ProductModal({ product, open, onClose }: ProductModalProps) {
  const { notification, impact } = useHaptic();
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  // Close on back gesture/button
  useEffect(() => {
    if (!open) return;
    const handler = () => onClose();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [open, onClose]);

  const handleClose = useCallback(() => {
    if (purchasing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 300);
  }, [purchasing, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  // Swipe-to-dismiss handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) {
      setDragY(dy);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (dragY > 100) {
      handleClose();
    }
    setDragY(0);
  }, [dragY, handleClose]);

  const handlePurchase = useCallback(async () => {
    if (!product) return;
    setPurchasing(true);
    setError(null);
    impact('heavy');

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          price_rub: product.price_rub,
          description: `Apple Gift Card ${product.face_value} ${CURRENCY_SYMBOLS[product.face_currency] || product.face_currency} (${REGION_META[product.region]?.name || product.region})`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      if (data.confirmation_url) {
        notification('success');
        window.location.href = data.confirmation_url;
      } else {
        throw new Error('Не получена ссылка на оплату');
      }
    } catch (e) {
      impact('heavy');
      setError(e instanceof Error ? e.message : 'Произошла ошибка');
      setPurchasing(false);
    }
  }, [product, impact, notification]);

  const meta = product ? (REGION_META[product.region] || REGION_META.TR) : REGION_META.TR;
  const symbol = product ? (CURRENCY_SYMBOLS[product.face_currency] || product.face_currency) : '';

  // Animation state:
  // - Not open: visibility hidden, sheet at translateY(100%)
  // - Opening: @keyframes slideUp plays (CSS animation)
  // - Closing: transition transform to translateY(100%)
  const isActive = open && !closing;
  const isHidden = !open && !closing;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: isActive ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        transition: 'background 0.3s ease',
        visibility: isHidden ? 'hidden' : 'visible',
      }}
    >
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(28, 28, 30, 0.95)',
          borderRadius: '20px 20px 0 0',
          // Opening: keyframe animation. Closing: transition. Dragging: none.
          ...(isActive && dragY === 0
            ? { animation: 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards' }
            : {}),
          ...(closing
            ? {
                transform: 'translateY(100%)',
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
              }
            : {}),
          ...(dragY > 0 && isActive
            ? { transform: `translateY(${dragY}px)`, transition: 'none' }
            : {}),
          paddingBottom: 'env(safe-area-inset-bottom, 32px)',
        }}
      >
        {/* Inline @keyframes */}
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}</style>

        {/* Handle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 8px',
        }}>
          <div style={{ width: 36 }} />
          <div style={{
            width: 36, height: 5, borderRadius: 2.5,
            background: 'rgba(120, 120, 128, 0.4)',
          }} />
          <button
            onClick={handleClose}
            style={{
              width: 30, height: 30,
              borderRadius: 15,
              background: 'rgba(120, 120, 128, 0.24)',
              border: 'none',
              color: '#fff',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 600,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {product && (
          <>
            {/* Product header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '12px 20px',
              background: meta.gradient,
              borderRadius: '16px',
              margin: '0 16px',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: `${meta.accent}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}>
                {meta.flag}
              </div>
              <div>
                <div style={{
                  fontSize: 19, fontWeight: 700, color: '#fff',
                  letterSpacing: -0.4, lineHeight: 1.2,
                }}>
                  Apple Gift Card
                </div>
                <div style={{
                  fontSize: 15, color: 'rgba(255,255,255,0.55)',
                  marginTop: 2,
                }}>
                  {meta.name} • {product.face_value.toLocaleString()} {symbol}
                </div>
              </div>
            </div>

            {/* Order details */}
            <div style={{
              margin: '16px 16px 0',
              background: 'rgba(120, 120, 128, 0.08)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '0.5px solid rgba(120, 120, 128, 0.16)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🎴</span>
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>Номинал</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                  {product.face_value.toLocaleString()} {symbol}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '0.5px solid rgba(120, 120, 128, 0.16)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>💳</span>
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>Оплата</span>
                </div>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>
                  Банковская карта
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>💰</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Итого</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 700, color: meta.accent, letterSpacing: -0.5 }}>
                  {product.price_rub.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                color: '#FF453A',
                textAlign: 'center',
                padding: '8px 16px',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Pay button */}
            <div style={{ padding: '12px 16px 0' }}>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  border: 'none',
                  background: purchasing
                    ? 'rgba(120, 120, 128, 0.24)'
                    : meta.accent,
                  color: purchasing ? 'rgba(255,255,255,0.4)' : '#fff',
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: -0.4,
                  cursor: purchasing ? 'default' : 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {purchasing ? 'Переход к оплате...' : `Оплатить ${product.price_rub.toLocaleString('ru-RU')} ₽`}
              </button>
            </div>

            {/* Hint */}
            <div style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.3)',
              padding: '12px 16px 0',
              fontSize: 13,
            }}>
              Код будет доставлен мгновенно после оплаты
            </div>
          </>
        )}
      </div>
    </div>
  );
}
