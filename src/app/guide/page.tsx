'use client';

import { useState } from 'react';

const REGIONS = {
  TR: {
    flag: '🇹🇷',
    name: 'Турция',
    addresses: [
      { label: 'Стамбул (рекомендуемый)', street: 'İstiklal Caddesi No: 42', city: 'Beyoğlu, İstanbul', zip: '34430' },
      { label: 'Анкара', street: 'Atatürk Bulvarı No: 15', city: 'Çankaya, Ankara', zip: '06690' },
    ],
  },
  US: {
    flag: '🇺🇸',
    name: 'США',
    addresses: [
      { label: 'Делавэр (нет налога)', street: '1200 N Orange St', city: 'Wilmington, DE', zip: '19801' },
      { label: 'Орегон (нет налога)', street: '805 SW Broadway', city: 'Portland, OR', zip: '97205' },
      { label: 'Монтана (нет налога)', street: '301 S Park Ave', city: 'Helena, MT', zip: '59601' },
    ],
  },
  KZ: {
    flag: '🇰🇿',
    name: 'Казахстан',
    addresses: [
      { label: 'Алматы', street: 'пр. Аль-Фараби 77', city: 'Алматы', zip: '050040' },
      { label: 'Астана', street: 'пр. Мангилик Ел 55', city: 'Астана', zip: '010000' },
    ],
  },
} as const;

type RegionKey = keyof typeof REGIONS;

const STEPS = [
  {
    title: 'ШАГ 1: Подготовка',
    items: [
      'Баланс Apple ID должен быть = 0 (потратьте или запросите списание через поддержку)',
      'Отмените подписку Apple Music (если активна)',
      'Выйдите из Семейного доступа (если вы — организатор)',
      'Включите VPN страны, на которую переключаетесь',
    ],
  },
  {
    title: 'ШАГ 2: Смена региона',
    items: [
      'Откройте Настройки → [Ваше имя]',
      'Нажмите «Медиаматериалы и покупки»',
      'Выберите «Просмотр учётной записи»',
      'Нажмите «Страна/Регион» → «Изменить»',
      'Выберите нужную страну и примите условия',
      'Способ оплаты → выберите «Нет» (None)',
      'Заполните адрес — скопируйте из списка ниже 👇',
    ],
  },
  {
    title: 'ШАГ 3: Активация карты',
    items: [
      'Откройте App Store → нажмите на аватар',
      'Выберите «Погасить подарочную карту или код»',
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

export default function GuidePage() {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('TR');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [openStep, setOpenStep] = useState<number>(0);

  const region = REGIONS[selectedRegion];

  const copyAddress = (addr: { street: string; city: string; zip: string }, idx: number) => {
    const text = `${addr.street}, ${addr.city}, ${addr.zip}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch { /* ignore */ }
    });
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--tg-theme-bg-color,#1c1c1e)] px-4 py-3 border-b border-[var(--tg-theme-separator-color,#2c2c2e)]">
        <a href="/" className="text-[var(--tg-theme-button-color,#0a84ff)] text-base">← Магазин</a>
        <h1 className="text-lg font-bold mt-1">📖 Смена региона Apple ID</h1>
      </div>

      {/* Region selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {(Object.keys(REGIONS) as RegionKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedRegion(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedRegion === key
                ? 'bg-[var(--tg-theme-button-color,#0a84ff)] text-[var(--tg-theme-button-text-color,#ffffff)]'
                : 'bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] text-[var(--tg-theme-text-color,#ffffff)]'
            }`}
          >
            {REGIONS[key].flag} {REGIONS[key].name}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="px-4 space-y-3 mt-2">
        {STEPS.map((step, i) => (
          <div key={i} className="bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenStep(openStep === i ? -1 : i)}
              className="w-full text-left p-4 flex justify-between items-center"
            >
              <span className="font-semibold text-sm">{step.title}</span>
              <span className="text-[var(--tg-theme-subtitle-text-color,#8e8e93)] text-lg">
                {openStep === i ? '▾' : '▸'}
              </span>
            </button>
            {openStep === i && (
              <div className="px-4 pb-4 space-y-2">
                {step.items.map((item, j) => (
                  <div key={j} className="flex gap-2 text-sm">
                    <span className="text-[var(--tg-theme-button-color,#0a84ff)] mt-0.5">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Address list */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{region.flag}</span>
          <span className="font-semibold">Адреса для {region.name}</span>
        </div>
        {region.addresses.map((addr, idx) => (
          <div key={idx} className="bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] rounded-xl p-4 mb-2">
            <div className="text-sm font-medium text-[var(--tg-theme-button-color,#0a84ff)] mb-1">{addr.label}</div>
            <div className="text-sm mb-2">{addr.street}</div>
            <div className="text-sm text-[var(--tg-theme-subtitle-text-color,#8e8e93)]">{addr.city}, {addr.zip}</div>
            <button
              onClick={() => copyAddress(addr, idx)}
              className="mt-2 text-sm text-[var(--tg-theme-button-color,#0a84ff)] font-medium"
            >
              {copiedIdx === idx ? '✅ Скопировано!' : '📋 Копировать адрес'}
            </button>
          </div>
        ))}
      </div>

      {/* Second account tip */}
      <div className="px-4 mt-6">
        <div className="bg-[var(--tg-theme-secondary-bg-color,#2c2c2e)] rounded-xl p-4 border border-[var(--tg-theme-button-color,#0a84ff)]/20">
          <div className="text-sm font-semibold mb-2">💡 Альтернатива: второй Apple ID</div>
          <div className="text-sm text-[var(--tg-theme-subtitle-text-color,#8e8e93)] space-y-1">
            <p>Не хотите менять регион основного аккаунта?</p>
            <p>Создайте второй Apple ID для App Store:</p>
            <p>1. Настройки → Выйти из App Store</p>
            <p>2. Создайте новый Apple ID с регионом {region.flag} {region.name}</p>
            <p>3. Используйте адрес из списка выше</p>
          </div>
        </div>
      </div>

      {/* Support link */}
      <div className="px-4 mt-6">
        <a href="https://t.me/TopUPApp_tg_bot" className="block text-center text-sm text-[var(--tg-theme-button-color,#0a84ff)]">
          💬 Нужна помощь? Напишите в поддержку
        </a>
      </div>
    </div>
  );
}
