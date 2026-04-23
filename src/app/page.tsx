'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AppRoot, Title, Subheadline, Caption } from '@telegram-apps/telegram-ui';
import { init } from '@telegram-apps/sdk';
import { useProducts } from '../hooks/useProducts';
import { useHaptic } from '../hooks/useHaptic';
import { RegionSelector } from '../components/RegionSelector';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { TabBar } from '../components/TabBar';
import { GuideView } from '../components/GuideView';
import { AboutView } from '../components/AboutView';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Product, TabId } from '../types';

export default function Home() {
  const [region, setRegion] = useState('TR');
  const [tab, setTab] = useState<TabId>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [titleCompact, setTitleCompact] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products, loading } = useProducts();
  const { impact } = useHaptic();

  useEffect(() => { try { init(); } catch {} }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const compact = scrollRef.current.scrollTop > 40;
    setTitleCompact(prev => prev !== compact ? compact : prev);
  }, []);

  const filteredProducts = products.filter((p: Product) => p.region === region && p.in_stock);

  const handleSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  }, []);

  const handleRegionChange = useCallback((newRegion: string) => {
    impact('light');
    setRegion(newRegion);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [impact]);

  const handleTabChange = useCallback((newTab: TabId) => {
    setTab(newTab);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  return (
    <AppRoot
      platform="ios"
      appearance="dark"
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        background: '#000',
        position: 'relative',
      }}
    >
      {/* Scrollable area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 85,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* ========== CATALOG TAB ========== */}
        {tab === 'catalog' && (
          <>
            {/* Sticky header with collapse */}
            <div style={{
              padding: titleCompact ? '10px 16px 10px' : '16px 16px 0',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: titleCompact ? 'rgba(0, 0, 0, 0.85)' : '#000',
              backdropFilter: titleCompact ? 'blur(20px) saturate(180%)' : 'none',
              WebkitBackdropFilter: titleCompact ? 'blur(20px) saturate(180%)' : 'none',
              transition: 'background 0.25s ease, border-bottom 0.25s ease, padding 0.25s ease',
              borderBottom: titleCompact ? '0.5px solid var(--ios-separator)' : 'none',
              willChange: 'background',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: titleCompact ? 22 : 30,
                  transition: 'font-size 0.25s ease',
                  lineHeight: 1,
                }}>🎁</span>
                <Title
                  level={titleCompact ? '3' : '1'}
                  style={{
                    letterSpacing: -0.8,
                    transition: 'all 0.25s ease',
                    lineHeight: titleCompact ? 1.2 : 1.1,
                  }}
                >
                  TopUPApp
                </Title>
              </div>
              <Subheadline style={{
                color: 'var(--ios-secondary-label)',
                marginTop: 2,
                marginLeft: 40,
                letterSpacing: -0.2,
                opacity: titleCompact ? 0 : 1,
                maxHeight: titleCompact ? 0 : 24,
                transform: titleCompact ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'opacity 0.2s ease, max-height 0.2s ease, transform 0.2s ease',
                overflow: 'hidden',
                pointerEvents: titleCompact ? 'none' : 'auto',
              }}>
                Подарочные карты Apple
              </Subheadline>
            </div>

            {/* Region selector */}
            <div style={{ marginTop: 10 }}>
              <RegionSelector value={region} onChange={handleRegionChange} />
            </div>

            {/* Product list */}
            <div style={{ padding: '4px 16px 0' }}>
              {loading ? (
                <LoadingSkeleton />
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ios-secondary-label)' }}>Нет товаров</div>
                  <Caption style={{ color: 'var(--ios-tertiary-label)', marginTop: 4 }}>
                    Для данного региона пока нет карточек
                  </Caption>
                </div>
              ) : (
                filteredProducts.map((product: Product, idx: number) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={idx}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>

            {/* Tip */}
            {!loading && filteredProducts.length > 0 && (
              <div style={{
                margin: '12px 16px 0',
                padding: '10px 14px',
                background: 'rgba(120, 120, 128, 0.12)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <Caption style={{ color: 'var(--ios-secondary-label)', lineHeight: 1.4, fontSize: 13 }}>
                  Нужна помощь со сменой региона? Загляните в «Гайд»
                </Caption>
              </div>
            )}
          </>
        )}

        {/* ========== GUIDE TAB ========== */}
        {tab === 'guide' && (
          <>
            <div style={{
              padding: '16px 16px 0',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
              <Title level="2" style={{ letterSpacing: -0.6 }}>
                📖 Гайд смены региона
              </Title>
              <Subheadline style={{ color: 'var(--ios-secondary-label)', marginTop: 2, marginBottom: 8 }}>
                Пошаговая инструкция
              </Subheadline>
            </div>
            <GuideView />
          </>
        )}

        {/* ========== ABOUT TAB ========== */}
        {tab === 'about' && (
          <>
            <div style={{
              padding: '16px 16px 0',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
              <Title level="2" style={{ letterSpacing: -0.6, marginBottom: 8 }}>
                О приложении
              </Title>
            </div>
            <AboutView />
          </>
        )}
      </div>

      {/* TabBar — always visible */}
      <TabBar active={tab} onChange={handleTabChange} />

      {/* Product detail modal */}
      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppRoot>
  );
}
