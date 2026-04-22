'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AppRoot,
  Section,
  Cell,
  Button,
  Title,
  Subheadline,
  Headline,
  Caption,
  Avatar,
  Badge,
  FixedLayout,
} from '@telegram-apps/telegram-ui';
import { init } from '@telegram-apps/sdk';

interface Product {
  id: string;
  region: 'TR' | 'US' | 'KZ';
  face_value: number;
  face_currency: string;
  price_rub: string;
  in_stock: boolean;
}

const REGIONS = {
  TR: { flag: '🇹🇷', name: 'Турция', currency: 'TRY' },
  US: { flag: '🇺🇸', name: 'США', currency: 'USD' },
  KZ: { flag: '🇰🇿', name: 'Казахстан', currency: 'KZT' },
} as const;

type RegionKey = keyof typeof REGIONS;

function formatPrice(val: string | number): string {
  return Number(val).toLocaleString('ru-RU');
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>('TR');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmRegion, setConfirmRegion] = useState(false);
  const [page, setPage] = useState<'catalog' | 'guide'>('catalog');

  useEffect(() => {
    try { init(); } catch {}
    try {
      window.Telegram?.WebApp?.expand();
      window.Telegram?.WebApp?.setHeaderColor('#1c1c1e');
      window.Telegram?.WebApp?.setBackgroundColor('#1c1c1e');
    } catch {}
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else setError(data.error || 'Ошибка загрузки');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const haptic = useCallback(() => {
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'); } catch {}
  }, []);

  const filtered = products.filter((p) => p.region === tab);

  // --- GUIDE PAGE ---
  if (page === 'guide') {
    return <GuidePage onBack={() => setPage('catalog')} haptic={haptic} />;
  }

  // --- PURCHASE CONFIRMATION ---
  if (selectedProduct) {
    const r = REGIONS[selectedProduct.region];
    return (
      <AppRoot>
        <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
          <FixedLayout vertical="top" style={{ zIndex: 10 }}>
            <div style={{ padding: '12px 16px', background: 'var(--tgui--bg_color)' }}>
              <Button
                mode="plain"
                size="s"
                onClick={() => { setSelectedProduct(null); setConfirmRegion(false); haptic(); }}
              >
                ← Назад
              </Button>
            </div>
          </FixedLayout>

          <div style={{ paddingTop: 56, padding: '56px 16px 16px' }}>
            {/* Product header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <Avatar size={64} style={{ background: '#2c2c2e', fontSize: 32 }}>
                {r.flag}
              </Avatar>
              <div>
                <Headline weight="1">
                  {selectedProduct.face_value.toLocaleString()} {selectedProduct.face_currency}
                </Headline>
                <Subheadline style={{ color: 'var(--tgui--subtitle_text_color)' }}>
                  Apple Gift Card • {r.name}
                </Subheadline>
              </div>
            </div>

            {/* Price */}
            <Section>
              <Cell
                after={
                  <Title level="2" style={{ color: 'var(--tgui--link_color)' }}>
                    {formatPrice(selectedProduct.price_rub)} ₽
                  </Title>
                }
              >
                <Subheadline>К оплате</Subheadline>
              </Cell>
            </Section>

            {/* Warning */}
            <Section style={{ marginTop: 12 }}>
              <Cell
                before={<span style={{ fontSize: 20 }}>⚠️</span>}
                multiline
              >
                <Subheadline weight="2" style={{ color: '#FFD60A', marginBottom: 4 }}>
                  Внимание
                </Subheadline>
                <Caption style={{ lineHeight: 1.5 }}>
                  Код работает только на Apple ID с регионом {r.flag} {r.name}
                </Caption>
              </Cell>
              <Cell
                onClick={() => { setConfirmRegion(!confirmRegion); haptic(); }}
                before={
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, border: '2px solid var(--tgui--link_color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: confirmRegion ? 'var(--tgui--link_color)' : 'transparent',
                    color: confirmRegion ? '#fff' : 'transparent', fontSize: 14, fontWeight: 700,
                  }}>
                    ✓
                  </div>
                }
              >
                <Caption>
                  Мой регион Apple ID = {r.name} {r.flag}
                </Caption>
              </Cell>
            </Section>

            {/* Guide link */}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Button
                mode="plain"
                size="s"
                onClick={() => { haptic(); setPage('guide'); }}
              >
                📖 Как сменить регион Apple ID?
              </Button>
            </div>
          </div>

          {/* Pay button */}
          <FixedLayout vertical="bottom" style={{ padding: 16, background: 'var(--tgui--bg_color)' }}>
            <Button
              size="l"
              stretched
              disabled={!confirmRegion}
              onClick={() => {
                haptic();
                alert('Оплата будет подключена после интеграции с ЮKassa');
              }}
              style={{ opacity: confirmRegion ? 1 : 0.4 }}
            >
              Оплатить {formatPrice(selectedProduct.price_rub)} ₽
            </Button>
          </FixedLayout>
        </div>
      </AppRoot>
    );
  }

  // --- CATALOG ---
  return (
    <AppRoot>
      <div style={{ minHeight: '100vh', paddingBottom: 20 }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 8px' }}>
          <Title level="2">TopUPApp 🎁</Title>
          <Subheadline style={{ color: 'var(--tgui--subtitle_text_color)' }}>
            Apple Gift Card — мгновенная доставка
          </Subheadline>
        </div>

        {/* Region tabs */}
        <Section style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 0, padding: '0 4px' }}>
            {(Object.keys(REGIONS) as RegionKey[]).map((key) => {
              const isActive = tab === key;
              return (
                <Button
                  key={key}
                  size="s"
                  mode={isActive ? 'filled' : 'plain'}
                  stretched
                  onClick={() => { setTab(key); haptic(); }}
                  style={{
                    margin: '0 2px',
                    borderRadius: 10,
                  }}
                >
                  {REGIONS[key].flag} {REGIONS[key].name}
                </Button>
              );
            })}
          </div>
        </Section>

        {/* Loading */}
        {loading && (
          <Section style={{ marginTop: 12 }}>
            <Cell>
              <Subheadline style={{ textAlign: 'center', width: '100%' }}>
                Загрузка каталога...
              </Subheadline>
            </Cell>
          </Section>
        )}

        {/* Error */}
        {error && (
          <Section style={{ marginTop: 12 }}>
            <Cell before={<span>❌</span>}>
              <Subheadline style={{ color: '#FF453A' }}>{error}</Subheadline>
            </Cell>
          </Section>
        )}

        {/* Products */}
        {!loading && !error && (
          <Section
            header={
              <Subheadline weight="2" style={{ padding: '8px 16px 4px' }}>
                {REGIONS[tab as RegionKey].flag} {REGIONS[tab as RegionKey].name} — номиналы
              </Subheadline>
            }
            style={{ marginTop: 12 }}
          >
            {filtered.map((product) => (
              <Cell
                key={product.id}
                onClick={() => { setSelectedProduct(product); haptic(); }}
                before={
                  <Avatar size={40} style={{ background: '#2c2c2e', fontSize: 20 }}>
                    {REGIONS[product.region].flag}
                  </Avatar>
                }
                after={
                  <div style={{ textAlign: 'right' }}>
                    <Headline weight="2" style={{ color: 'var(--tgui--link_color)' }}>
                      {formatPrice(product.price_rub)} ₽
                    </Headline>
                    <Caption style={{ color: 'var(--tgui--subtitle_text_color)' }}>
                      {product.face_value.toLocaleString()} {product.face_currency}
                    </Caption>
                  </div>
                }
                chevron
                multiline
              >
                <Headline weight="3">Apple Gift Card</Headline>
              </Cell>
            ))}
            {filtered.length === 0 && (
              <Cell>
                <Subheadline style={{ textAlign: 'center', color: 'var(--tgui--hint_color)' }}>
                  Нет товаров в этом регионе
                </Subheadline>
              </Cell>
            )}
          </Section>
        )}

        {/* Guide banner */}
        <Section style={{ marginTop: 12 }}>
          <Cell
            onClick={() => { haptic(); setPage('guide'); }}
            before={<span style={{ fontSize: 20 }}>📖</span>}
            after={<span style={{ color: 'var(--tgui--link_color)' }}>→</span>}
          >
            <Subheadline weight="2">Как сменить регион Apple ID</Subheadline>
            <Caption style={{ color: 'var(--tgui--subtitle_text_color)' }}>
              Пошаговая инструкция с адресами
            </Caption>
          </Cell>
        </Section>
      </div>
    </AppRoot>
  );
}

// --- GUIDE PAGE COMPONENT ---
function GuidePage({ onBack, haptic }: { onBack: () => void; haptic: () => void }) {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('TR');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [openStep, setOpenStep] = useState<number>(0);

  const ADDRESSES: Record<RegionKey, { label: string; street: string; city: string; zip: string }[]> = {
    TR: [
      { label: 'Стамбул (рекомендуемый)', street: 'İstiklal Caddesi No: 42', city: 'Beyoğlu, İstanbul', zip: '34430' },
      { label: 'Анкара', street: 'Atatürk Bulvarı No: 15', city: 'Çankaya, Ankara', zip: '06690' },
    ],
    US: [
      { label: 'Делавэр (нет налога)', street: '1200 N Orange St', city: 'Wilmington, DE', zip: '19801' },
      { label: 'Орегон (нет налога)', street: '805 SW Broadway', city: 'Portland, OR', zip: '97205' },
      { label: 'Монтана (нет налога)', street: '301 S Park Ave', city: 'Helena, MT', zip: '59601' },
    ],
    KZ: [
      { label: 'Алматы', street: 'пр. Аль-Фараби 77', city: 'Алматы', zip: '050040' },
      { label: 'Астана', street: 'пр. Мангилик Ел 55', city: 'Астана', zip: '010000' },
    ],
  };

  const STEPS = [
    {
      title: 'ШАГ 1: Подготовка',
      items: [
        'Баланс Apple ID = 0 (потратьте или запросите списание)',
        'Отмените Apple Music (если активна)',
        'Выйдите из Семейного доступа (если вы — организатор)',
        'Включите VPN страны切换аемого региона',
      ],
    },
    {
      title: 'ШАГ 2: Смена региона',
      items: [
        'Настройки → [Имя] → «Медиаматериалы и покупки»',
        '«Просмотр учётной записи» → «Страна/Регион» → «Изменить»',
        'Выберите страну → примите условия',
        'Способ оплаты → «Нет» (None)',
        'Адрес → скопируйте из списка ниже 👇',
      ],
    },
    {
      title: 'ШАГ 3: Активация карты',
      items: [
        'App Store → аватар → «Погасить подарочную карту или код»',
        'Введите 16-значный код',
        'Баланс зачислен! 🎉',
      ],
    },
    {
      title: 'ШАГ 4: Использование',
      items: [
        'Покупайте приложения и продлевайте подписки',
        'iCloud+ продлится автоматически',
        'Apple Music — переоформите в новом регионе',
      ],
    },
  ];

  const region = REGIONS[selectedRegion];
  const addresses = ADDRESSES[selectedRegion];

  const copyAddress = (addr: typeof addresses[0], idx: number) => {
    navigator.clipboard.writeText(`${addr.street}, ${addr.city}, ${addr.zip}`).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
      haptic();
      try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success'); } catch {}
    });
  };

  return (
    <AppRoot>
      <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
        {/* Header */}
        <FixedLayout vertical="top" style={{ zIndex: 10 }}>
          <div style={{ padding: '12px 16px', background: 'var(--tgui--bg_color)' }}>
            <Button mode="plain" size="s" onClick={onBack}>← Магазин</Button>
          </div>
        </FixedLayout>

        <div style={{ paddingTop: 56, padding: '56px 0 0' }}>
          <div style={{ padding: '0 16px 8px' }}>
            <Title level="3">📖 Смена региона Apple ID</Title>
          </div>

          {/* Region tabs */}
          <div style={{ display: 'flex', gap: 0, padding: '4px 16px' }}>
            {(Object.keys(REGIONS) as RegionKey[]).map((key) => (
              <Button
                key={key}
                size="s"
                mode={selectedRegion === key ? 'filled' : 'plain'}
                stretched
                onClick={() => { setSelectedRegion(key); haptic(); }}
                style={{ margin: '0 2px', borderRadius: 10 }}
              >
                {REGIONS[key].flag} {REGIONS[key].name}
              </Button>
            ))}
          </div>

          {/* Steps */}
          {STEPS.map((step, i) => (
            <Section key={i} style={{ marginTop: 8 }}>
              <Cell
                onClick={() => setOpenStep(openStep === i ? -1 : i)}
                after={
                  <span style={{ color: 'var(--tgui--hint_color)', fontSize: 16 }}>
                    {openStep === i ? '▾' : '▸'}
                  </span>
                }
              >
                <Subheadline weight="2">{step.title}</Subheadline>
              </Cell>
              {openStep === i && step.items.map((item, j) => (
                <Cell key={j} before={<span style={{ color: 'var(--tgui--link_color)' }}>•</span>}>
                  <Caption style={{ lineHeight: 1.5 }}>{item}</Caption>
                </Cell>
              ))}
            </Section>
          ))}

          {/* Addresses */}
          <Section
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 4px' }}>
                <span>{region.flag}</span>
                <Subheadline weight="2">Адреса для {region.name}</Subheadline>
              </div>
            }
            style={{ marginTop: 12 }}
          >
            {addresses.map((addr, idx) => (
              <Cell
                key={idx}
                multiline
                after={
                  copiedIdx === idx ? (
                    <Badge mode="primary" style={{ background: '#30D158' }}>✓</Badge>
                  ) : (
                    <Button mode="plain" size="s" onClick={() => copyAddress(addr, idx)}>
                      📋
                    </Button>
                  )
                }
              >
                <Subheadline weight="2" style={{ color: 'var(--tgui--link_color)', marginBottom: 2 }}>
                  {addr.label}
                </Subheadline>
                <Caption>{addr.street}</Caption>
                <Caption style={{ color: 'var(--tgui--hint_color)' }}>{addr.city}, {addr.zip}</Caption>
              </Cell>
            ))}
          </Section>

          {/* Second account tip */}
          <Section style={{ marginTop: 12 }}>
            <Cell before={<span style={{ fontSize: 20 }}>💡</span>} multiline>
              <Subheadline weight="2" style={{ marginBottom: 4 }}>Альтернатива: второй Apple ID</Subheadline>
              <Caption style={{ lineHeight: 1.5 }}>
                Не хотите менять регион? Создайте второй Apple ID для App Store с регионом {region.flag} {region.name} и используйте адрес из списка выше.
              </Caption>
            </Cell>
          </Section>
        </div>
      </div>
    </AppRoot>
  );
}
