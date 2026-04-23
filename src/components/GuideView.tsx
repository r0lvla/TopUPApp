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

const ADDRESSES: Record<string, {
  country: string;
  countryRu: string;
  city: string;
  state?: string;
  zip: string;
  street: string;
  phone: string;
  gradient: string;
  flag: string;
}> = {
  TR: {
    country: 'Turkey',
    countryRu: 'Турция',
    city: 'Istanbul',
    state: 'Istanbul',
    zip: '34100',
    street: 'Bagdat Caddesi No:1',
    phone: '+90 212 555 0123',
    gradient: 'linear-gradient(135deg, #E30A17 0%, #FF6B35 100%)',
    flag: '🇹🇷',
  },
  US: {
    country: 'United States',
    countryRu: 'США',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    street: '123 Broadway',
    phone: '+1 212 555 0123',
    gradient: 'linear-gradient(135deg, #3C5AFF 0%, #B31942 100%)',
    flag: '🇺🇸',
  },
  KZ: {
    country: 'Kazakhstan',
    countryRu: 'Казахстан',
    city: 'Almaty',
    zip: '050000',
    street: 'Abai Avenue 52',
    phone: '+7 727 255 0123',
    gradient: 'linear-gradient(135deg, #00B5B6 0%, #FFB900 100%)',
    flag: '🇰🇿',
  },
};

export function GuideView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [copied, setCopied] = useState('');
  const { notification, impact } = useHaptic();

  const step = GUIDE_STEPS[currentStep];

  const copyAddress = useCallback((region: string) => {
    const addr = ADDRESSES[region];
    if (!addr) return;
    const text = [addr.street, `${addr.city}${addr.state ? `, ${addr.state}` : ''}`, addr.zip, addr.country].join(', ');
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
  }, [notification]);

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
        {Object.entries(ADDRESSES).map(([region, addr]) => {
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
                  background: addr.gradient,
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 5s ease infinite',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}>
                  {addr.flag}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3, color: 'var(--ios-label)' }}>
                    {addr.countryRu}
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

                    {/* Copy button */}
                    <Button
                      mode="plain"
                      size="s"
                      onClick={() => copyAddress(region)}
                      style={{
                        marginTop: 12,
                        fontWeight: 600,
                        color: isCopied ? '#30D158' : '#0A84FF',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {isCopied ? '✓ Скопировано' : '📋 Скопировать адрес'}
                    </Button>
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
