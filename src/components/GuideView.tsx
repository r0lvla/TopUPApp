'use client';

import { useState, useCallback, useRef } from 'react';
import { Headline, Caption, Subheadline } from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';

const GUIDE_STEPS = [
  { title: 'Откройте App Store', description: 'Нажмите на иконку вашего профиля в правом верхнем углу.', icon: '🏪' },
  { title: 'Выберите страну/регион', description: 'Нажмите «Страна/Регион» → «Изменить страну или регион».', icon: '🗺' },
  { title: 'Выберите нужный регион', description: 'Найдите в списке нужную страну (Турция, США или Казахстан) и подтвердите.', icon: '✈️' },
  { title: 'Введите адрес', description: 'Используйте адрес из списка ниже. Номер телефона можно ввести любой.', icon: '📝' },
  { title: 'Готово!', description: 'Теперь вы можете приобрести и активировать подарочную карту в новом регионе.', icon: '🎉' },
];

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
  accent: string;
  gradient: string;
  glow: string;
  flag: string;
}> = {
  TR: {
    country: 'Turkey', countryRu: 'Турция', accent: '#FF9F0A',
    gradient: 'linear-gradient(135deg, #E30A17 0%, #FF6B35 100%)',
    glow: 'rgba(227, 10, 23, 0.08)', flag: '🇹🇷',
  },
  US: {
    country: 'United States', countryRu: 'США', accent: '#0A84FF',
    gradient: 'linear-gradient(135deg, #3C5AFF 0%, #B31942 100%)',
    glow: 'rgba(60, 90, 255, 0.08)', flag: '🇺🇸',
  },
  KZ: {
    country: 'Kazakhstan', countryRu: 'Казахстан', accent: '#30D158',
    gradient: 'linear-gradient(135deg, #00B5B6 0%, #FFB900 100%)',
    glow: 'rgba(0, 181, 182, 0.08)', flag: '🇰🇿',
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function GuideView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [copied, setCopied] = useState('');
  const { notification, impact } = useHaptic();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) {
      if (dx < 0 && currentStep < GUIDE_STEPS.length - 1) {
        impact('light');
        setCurrentStep(currentStep + 1);
      } else if (dx > 0 && currentStep > 0) {
        impact('light');
        setCurrentStep(currentStep - 1);
      }
    }
  }, [currentStep, impact]);

  return (
    <div style={{ padding: '0 0 100px' }}>

      {/* ===== PROGRESS DOTS ===== */}
      <div style={{ padding: '0 16px 20px', display: 'flex', gap: 8, justifyContent: 'center' }}>
        {GUIDE_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === currentStep ? 24 : 8,
            height: 8, borderRadius: 4,
            background: i === currentStep ? '#0A84FF'
              : i < currentStep ? 'rgba(10, 132, 255, 0.4)'
              : 'rgba(120, 120, 128, 0.24)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* ===== STEP CARD ===== */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ margin: '0 16px 16px', touchAction: 'pan-y' }}
      >
        <div className="ios-card" style={{
          padding: 20, position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow orb — same as ProductCard */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(10, 132, 255, 0.08)', filter: 'blur(30px)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
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
      </div>

      {/* ===== NAV BUTTONS ===== */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        gap: 12, padding: '0 16px 24px',
      }}>
        <button
          disabled={currentStep === 0}
          onClick={() => { impact('light'); setCurrentStep(Math.max(0, currentStep - 1)); }}
          className="ios-card"
          style={{
            flex: 1, height: 48, borderRadius: 14,
            background: currentStep === 0 ? 'rgba(44, 44, 46, 0.5)' : 'var(--ios-card-bg)',
            border: '0.5px solid var(--ios-card-border)',
            color: currentStep === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)',
            fontSize: 16, fontWeight: 600, letterSpacing: -0.3,
            cursor: currentStep === 0 ? 'default' : 'pointer',
            fontFamily: 'inherit',
            transition: 'transform 0.15s ease, background 0.3s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={(e) => {
            if (currentStep === 0) return;
            (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(60, 60, 68, 0.95)';
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLElement).style.background = 'var(--ios-card-bg)';
          }}
        >
          ← Назад
        </button>
        <button
          disabled={currentStep === GUIDE_STEPS.length - 1}
          onClick={() => { impact('light'); setCurrentStep(Math.min(GUIDE_STEPS.length - 1, currentStep + 1)); }}
          className="ios-card"
          style={{
            flex: 1, height: 48, borderRadius: 14,
            background: currentStep === GUIDE_STEPS.length - 1 ? 'rgba(44, 44, 46, 0.5)' : 'var(--ios-card-bg)',
            border: '0.5px solid var(--ios-card-border)',
            color: currentStep === GUIDE_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)',
            fontSize: 16, fontWeight: 600, letterSpacing: -0.3,
            cursor: currentStep === GUIDE_STEPS.length - 1 ? 'default' : 'pointer',
            fontFamily: 'inherit',
            transition: 'transform 0.15s ease, background 0.3s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={(e) => {
            if (currentStep === GUIDE_STEPS.length - 1) return;
            (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(60, 60, 68, 0.95)';
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLElement).style.background = 'var(--ios-card-bg)';
          }}
        >
          Далее →
        </button>
      </div>

      {/* ===== SECTION DIVIDER ===== */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
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
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                position: 'relative',
                backgroundSize: '200% 200%',
              }}
            >
              {/* Glow orb — same as ProductCard */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: meta.glow, filter: 'blur(30px)',
                pointerEvents: 'none',
              }} />

              {/* Gradient bg layer */}
              <div style={{
                position: 'absolute', inset: 0,
                background: meta.glow,
                backgroundSize: '200% 200%',
                animation: 'gradientShift 6s ease infinite',
                pointerEvents: 'none',
                opacity: isOpen ? 1 : 0.6,
                transition: 'opacity 0.3s ease',
              }} />

              {/* Card header — tappable */}
              <button
                onClick={() => {
                  impact('light');
                  setExpandedRegion(isOpen ? null : region);
                }}
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', outline: 'none', cursor: 'pointer',
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  WebkitTapHighlightColor: 'transparent',
                  color: 'var(--ios-label)', textAlign: 'left', fontFamily: 'inherit',
                  position: 'relative',
                }}
              >
                {/* Flag circle — same style as ProductCard */}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: meta.gradient,
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 5s ease infinite',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                  <span style={{ fontSize: 20 }}>
                    {meta.flag}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3, color: 'var(--ios-label)' }}>
                    {meta.countryRu}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ios-secondary-label)', marginTop: 2 }}>
                    {addr.city}, {addr.zip}
                  </div>
                </div>

                <div style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  color: 'var(--ios-tertiary-label)', fontSize: 14,
                }}>
                  ▾
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div style={{
                  padding: '0 20px 16px',
                  animation: 'fadeIn 0.2s ease',
                  position: 'relative',
                }}>
                  <div style={{
                    background: 'var(--ios-tertiary-bg)',
                    borderRadius: 12, padding: 16,
                  }}>
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ios-label)' }}>
                      <div style={{ fontWeight: 500 }}>{addr.street}</div>
                      <div>{addr.city}{addr.state ? `, ${addr.state}` : ''}</div>
                      <div>{addr.zip}</div>
                      <div style={{ color: 'var(--ios-secondary-label)', marginTop: 4, fontSize: 13 }}>
                        {addr.phone}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => copyAddress(region)}
                        style={{
                          background: isCopied ? 'rgba(48, 209, 88, 0.15)' : 'var(--ios-fill-tertiary)',
                          border: 'none', borderRadius: 10, padding: '8px 14px',
                          fontSize: 14, fontWeight: 600,
                          color: isCopied ? '#30D158' : meta.accent,
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isCopied ? '✓ Скопировано' : '📋 Скопировать'}
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          shuffleAddress(region);
                        }}
                        style={{
                          background: 'var(--ios-fill-tertiary)',
                          border: 'none', borderRadius: 10, padding: '8px 14px',
                          fontSize: 14, fontWeight: 600, color: '#BF5AF2',
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        🎲 Другой адрес
                      </button>
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
