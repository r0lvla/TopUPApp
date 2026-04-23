'use client';

import { useState, useCallback } from 'react';
import { Button, Headline, Caption, Subheadline, Steps } from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';

const GUIDE_STEPS = [
  {
    title: 'Откройте App Store',
    description: 'Нажмите на иконку вашего профиля в правом верхнем углу.',
    icon: '🏪',
  },
  {
    title: 'Выберите страну/регион',
    description: 'Нажмите «Страна/Регион» → «Изменить страну или регион».',
    icon: '🗺',
  },
  {
    title: 'Выберите нужный регион',
    description: 'Найдите в списке нужную страну (Турция, США или Казахстан) и подтвердите.',
    icon: '✈️',
  },
  {
    title: 'Введите адрес',
    description: 'Используйте адрес из списка ниже. Номер телефона можно ввести любой.',
    icon: '📝',
  },
  {
    title: 'Готово!',
    description: 'Теперь вы можете приобрести и активировать подарочную карту в новом регионе.',
    icon: '🎉',
  },
];

/* ───────────────────────────────────────────
   Address pools — real residential districts
   ─────────────────────────────────────────── */

interface Address {
  city: string;
  state?: string;
  zip: string;
  street: string;
  phone: string;
}

const ADDRESS_POOLS: Record<string, Address[]> = {
  TR: [
    { city: 'Istanbul', state: 'Istanbul', zip: '34728', street: 'Caferaga Mah. Moda Cad. No:12', phone: '+90 216 555 0147' },
    { city: 'Istanbul', state: 'Istanbul', zip: '34330', street: 'Gayrettepe Mah. Yildiz Posta Cad. No:8', phone: '+90 212 555 0293' },
    { city: 'Istanbul', state: 'Istanbul', zip: '34696', street: 'Kouyuncu Mah. Bagdat Cad. No:45', phone: '+90 216 555 0361' },
    { city: 'Izmir', state: 'Izmir', zip: '35220', street: 'Alsancak Mah. Kibris Sehitleri Cad. No:22', phone: '+90 232 555 0184' },
    { city: 'Ankara', state: 'Ankara', zip: '06690', street: 'Kizilay Mah. Ataturk Bulvari No:30', phone: '+90 312 555 0472' },
    { city: 'Istanbul', state: 'Istanbul', zip: '34400', street: 'Cihangir Mah. Firuzaga Sok. No:7', phone: '+90 212 555 0516' },
    { city: 'Antalya', state: 'Antalya', zip: '07100', street: 'Sinan Mah. Ali Cetinkaya Cad. No:14', phone: '+90 242 555 0239' },
    { city: 'Istanbul', state: 'Istanbul', zip: '34730', street: 'Feneryolu Mah. Bagdat Cad. No:156', phone: '+90 216 555 0678' },
  ],
  US: [
    { city: 'Brooklyn', state: 'NY', zip: '11201', street: '146 Atlantic Ave Apt 4B', phone: '+1 718 555 0134' },
    { city: 'Santa Monica', state: 'CA', zip: '90401', street: '2430 Main St Unit 12', phone: '+1 310 555 0287' },
    { city: 'Chicago', state: 'IL', zip: '60614', street: '2100 N Clark St Apt 3C', phone: '+1 312 555 0451' },
    { city: 'Austin', state: 'TX', zip: '78701', street: '801 W 5th St Unit 210', phone: '+1 512 555 0193' },
    { city: 'Seattle', state: 'WA', zip: '98101', street: '1520 5th Ave Apt 8A', phone: '+1 206 555 0327' },
    { city: 'Miami', state: 'FL', zip: '33131', street: '701 Brickell Ave Unit 1405', phone: '+1 305 555 0562' },
    { city: 'Portland', state: 'OR', zip: '97201', street: '1834 SW Morrison St Apt 2', phone: '+1 503 555 0148' },
    { city: 'Denver', state: 'CO', zip: '80202', street: '1550 Blake St Unit 901', phone: '+1 720 555 0741' },
  ],
  KZ: [
    { city: 'Almaty', zip: '050012', street: 'Tole bi St 84, Apt 15', phone: '+7 727 255 0147' },
    { city: 'Almaty', zip: '050040', street: 'Abai Ave 52, Apt 7', phone: '+7 727 255 0293' },
    { city: 'Almaty', zip: '050008', street: 'Gogol St 31, Apt 22', phone: '+7 727 255 0361' },
    { city: 'Astana', zip: '010000', street: 'Kabanbay Batyr Ave 60, Apt 4', phone: '+7 717 255 0184' },
    { city: 'Almaty', zip: '050026', street: 'Satpaev St 28A, Apt 11', phone: '+7 727 255 0472' },
    { city: 'Astana', zip: '010011', street: 'Mangilik El Ave 36, Apt 19', phone: '+7 717 255 0516' },
    { city: 'Almaty', zip: '050014', street: 'Bogenbay Batyr St 47, Apt 6', phone: '+7 727 255 0678' },
    { city: 'Almaty', zip: '050046', street: 'Auezov St 72, Apt 3', phone: '+7 727 255 0239' },
  ],
};

const REGION_META: Record<string, {
  country: string;
  countryRu: string;
  gradient: string;
  flag: string;
}> = {
  TR: { country: 'Turkey', countryRu: 'Турция', gradient: 'linear-gradient(135deg, #E30A17 0%, #FF6B35 100%)', flag: '🇹🇷' },
  US: { country: 'United States', countryRu: 'США', gradient: 'linear-gradient(135deg, #3C5AFF 0%, #B31942 100%)', flag: '🇺🇸' },
  KZ: { country: 'Kazakhstan', countryRu: 'Казахстан', gradient: 'linear-gradient(135deg, #00B5B6 0%, #FFB900 100%)', flag: '🇰🇿' },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function GuideView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [copied, setCopied] = useState('');
  const { notification, impact } = useHaptic();

  // Randomly selected address per region — persists until user refreshes
  const [selectedAddresses, setSelectedAddresses] = useState<Record<string, Address>>(() => {
    const init: Record<string, Address> = {};
    for (const region of Object.keys(ADDRESS_POOLS)) {
      init[region] = pickRandom(ADDRESS_POOLS[region]);
    }
    return init;
  });

  const step = GUIDE_STEPS[currentStep];

  const shuffleAddress = useCallback((region: string) => {
    impact('light');
    const pool = ADDRESS_POOLS[region];
    const current = selectedAddresses[region];
    // Pick a different address if possible
    let next: Address;
    if (pool.length > 1) {
      do { next = pickRandom(pool); } while (next.street === current.street);
    } else {
      next = pool[0];
    }
    setSelectedAddresses(prev => ({ ...prev, [region]: next }));
  }, [selectedAddresses, impact]);

  const copyAddress = useCallback((region: string) => {
    const addr = selectedAddresses[region];
    const meta = REGION_META[region];
    if (!addr || !meta) return;
    const text = [addr.street, `${addr.city}${addr.state ? `, ${addr.state}` : ''}`, addr.zip, meta.country].join(', ');
    navigator.clipboard.writeText(text).then(() => {
      notification('success');
      setCopied(region);
      setTimeout(() => setCopied(''), 2500);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      notification('success');
      setCopied(region);
      setTimeout(() => setCopied(''), 2500);
    });
  }, [selectedAddresses, notification]);

  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* ===== PROGRESS BAR ===== */}
      <div style={{ padding: '0 16px 20px' }}>
        <Steps count={GUIDE_STEPS.length} progress={currentStep + 1} />
      </div>

      {/* ===== CURRENT STEP CARD ===== */}
      <div className="ios-card stagger-item" style={{ margin: '0 16px 16px', padding: 24, position: 'relative', overflow: 'hidden' }}>
        {/* Step glow */}
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(10, 132, 255, 0.08)', filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
          {/* Step icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(10, 132, 255, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            {step.icon}
          </div>

          <div style={{ flex: 1 }}>
            <Caption style={{ color: '#0A84FF', fontWeight: 600, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11 }}>
              Шаг {currentStep + 1} из {GUIDE_STEPS.length}
            </Caption>
            <Headline weight="2" style={{ marginBottom: 6, letterSpacing: -0.4 }}>
              {step.title}
            </Headline>
            <Subheadline style={{ color: 'var(--ios-secondary-label)', lineHeight: 1.55 }}>
              {step.description}
            </Subheadline>
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION BUTTONS ===== */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px 24px' }}>
        <Button
          mode="outline"
          size="l"
          stretched
          onClick={() => { impact('light'); setCurrentStep(Math.max(0, currentStep - 1)); }}
          disabled={currentStep === 0}
          style={{ borderRadius: 14, fontWeight: 600 }}
        >
          ← Назад
        </Button>
        <Button
          mode="filled"
          size="l"
          stretched
          onClick={() => { impact('light'); setCurrentStep(Math.min(GUIDE_STEPS.length - 1, currentStep + 1)); }}
          disabled={currentStep === GUIDE_STEPS.length - 1}
          style={{ borderRadius: 14, fontWeight: 600 }}
        >
          Далее →
        </Button>
      </div>

      {/* ===== SECTION DIVIDER ===== */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
        }}>
          <span style={{ fontSize: 20 }}>📍</span>
          <Subheadline weight="2" style={{ fontWeight: 700, letterSpacing: -0.3, color: 'var(--ios-label)' }}>
            Адреса для смены региона
          </Subheadline>
        </div>
        <Caption style={{ color: 'var(--ios-tertiary-label)', lineHeight: 1.4, display: 'block' }}>
          Нажмите на страну, чтобы раскрыть адрес. Скопируйте его целиком.
        </Caption>
      </div>

      {/* ===== ADDRESS CARDS ===== */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(REGION_META).map(([region, meta]) => {
          const addr = selectedAddresses[region];
          const isOpen = expandedRegion === region;
          const isCopied = copied === region;

          return (
            <div
              key={region}
              className="ios-card"
              style={{
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
              }}
            >
              {/* Card header — tappable */}
              <button
                onClick={() => {
                  impact('light');
                  setExpandedRegion(isOpen ? null : region);
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  WebkitTapHighlightColor: 'transparent',
                  color: 'var(--ios-label)',
                  textAlign: 'left',
                }}
              >
                {/* Flag circle */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: meta.gradient,
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 5s ease infinite',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}>
                  {meta.flag}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3, color: 'var(--ios-label)' }}>
                    {meta.countryRu}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ios-secondary-label)', marginTop: 1 }}>
                    {addr.city}, {addr.zip}
                  </div>
                </div>

                {/* Expand indicator */}
                <div style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  color: 'var(--ios-tertiary-label)',
                  fontSize: 14,
                }}>
                  ▾
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div style={{
                  padding: '0 16px 16px',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  {/* Address block */}
                  <div style={{
                    background: 'var(--ios-tertiary-bg)',
                    borderRadius: 12,
                    padding: 16,
                  }}>
                    <div style={{
                      fontSize: 14, lineHeight: 1.8,
                      color: 'var(--ios-label)',
                    }}>
                      <div style={{ fontWeight: 500 }}>{addr.street}</div>
                      <div>{addr.city}{addr.state ? `, ${addr.state}` : ''}</div>
                      <div>{addr.zip}</div>
                      <div style={{ color: 'var(--ios-secondary-label)', marginTop: 4, fontSize: 13 }}>
                        {addr.phone}
                      </div>
                    </div>

                    {/* Action row: Copy + Shuffle */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      <Button
                        mode="plain"
                        size="s"
                        onClick={() => copyAddress(region)}
                        style={{
                          fontWeight: 600,
                          color: isCopied ? '#30D158' : '#0A84FF',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {isCopied ? '✓ Скопировано' : '📋 Скопировать'}
                      </Button>
                      <Button
                        mode="plain"
                        size="s"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          shuffleAddress(region);
                        }}
                        style={{
                          fontWeight: 600,
                          color: '#BF5AF2',
                        }}
                      >
                        🎲 Другой адрес
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
