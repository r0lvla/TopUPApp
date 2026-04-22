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

function LocalHeadline({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: -0.4,
      fontFamily: 'var(--ios-font)',
      color: 'var(--ios-label)',
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function Home() {
  const [region, setRegion] = useState('TR');
  const [tab, setTab] = useState<TabId>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [titleCompact, setTitleCompact] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products, loading } = useProducts();
  const { impact } = useHaptic();

  // Init Telegram SDK
  useEffect(() => {
    try { init(); } catch {}
  }, []);

  // Scroll handler for title collapse
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollY = scrollRef.current.scrollTop;
    setTitleCompact(scrollY > 40);
  }, []);

  // Filter products by region
  const filteredProducts = products.filter((p: Product) => p.region === region && p.is_active);

  // Handle product select
  const handleSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  }, []);

  // Handle region change
  const handleRegionChange = useCallback((newRegion: string) => {
    impact('light');
    setRegion(newRegion);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [impact]);

  // Handle tab change
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
        position: 'relative',
      }}
    >
      {/* Scrollable content area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 90,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Catalog Header — Large Title with collapse */}
        {tab === 'catalog' && (
          <div style={{
            padding: titleCompact ? '12px 16px 8px' : '20px 16px 4px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: titleCompact
              ? 'rgba(0, 0, 0, 0.85)'
              : 'transparent',
            backdropFilter: titleCompact ? 'blur(20px) saturate(180%)' : 'none',
            WebkitBackdropFilter: titleCompact ? 'blur(20px) saturate(180%)' : 'none',
            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
            borderBottom: titleCompact ? '0.5px solid var(--ios-separator)' : '0.5px solid transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: titleCompact ? 24 : 32, transition: 'font-size 0.25s ease' }}>🎁</span>
              <div>
                <Title
                  level={titleCompact ? '3' : '1'}
                  style={{
                    letterSpacing: -0.8,
                    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                    lineHeight: titleCompact ? 1.2 : 1.1,
                  }}
                >
                  TopUPApp
                </Title>
              </div>
            </div>
            {!titleCompact && (
              <Subheadline
                style={{
                  color: 'var(--ios-secondary-label)',
                  marginTop: 4,
                  marginLeft: 42,
                  animation: 'fadeIn 0.3s ease',
                  letterSpacing: -0.2,
                }}
              >
                Подарочные карты Apple
              </Subheadline>
            )}
          </div>
        )}

        {/* Guide Header */}
        {tab === 'guide' && (
          <div style={{
            padding: '20px 0 4px',
            marginLeft: 16,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <Title level="2" style={{ letterSpacing: -0.6 }}>
              📖 Гайд смены региона
            </Title>
            <Subheadline style={{ color: 'var(--ios-secondary-label)', marginTop: 2 }}>
              Пошаговая инструкция
            </Subheadline>
          </div>
        )}

        {/* About Header */}
        {tab === 'about' && (
          <div style={{
            padding: '20px 0 4px',
            marginLeft: 16,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <Title level="2" style={{ letterSpacing: -0.6 }}>
              О приложении
            </Title>
          </div>
        )}

        {/* Catalog Tab */}
        {tab === 'catalog' && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <div style={{ marginTop: 12 }}>
              <RegionSelector value={region} onChange={handleRegionChange} />
            </div>

            <div style={{ padding: '0 16px' }}>
              {loading ? (
                <LoadingSkeleton />
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
                  <LocalHeadline style={{ color: 'var(--ios-secondary-label)' }}>
                    Нет товаров
                  </LocalHeadline>
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

            {!loading && filteredProducts.length > 0 && (
              <div style={{
                margin: '16px 16px 0',
                padding: '12px 16px',
                background: 'var(--ios-fill-tertiary)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <Caption style={{ color: 'var(--ios-secondary-label)', lineHeight: 1.4 }}>
                  Нужна помощь со сменой региона? Загляните в раздел «Гайд»
                </Caption>
              </div>
            )}
          </div>
        )}

        {tab === 'guide' && <GuideView />}
        {tab === 'about' && <AboutView />}
      </div>

      <TabBar active={tab} onChange={handleTabChange} />

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppRoot>
  );
}
