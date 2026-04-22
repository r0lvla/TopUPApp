'use client';

import { useState, useCallback } from 'react';
import {
  Section,
  Cell,
  Button,
  Headline,
  Caption,
  Subheadline,
  Steps,
  Accordion,
  Banner,
  InlineButtons,
  Snackbar,
  Divider,
} from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';

const GUIDE_STEPS = [
  {
    title: 'Откройте App Store',
    description: 'Нажмите на иконку вашего профиля в правом верхнем углу.',
  },
  {
    title: 'Выберите страну/регион',
    description: 'Нажмите «Страна/Регион» → «Изменить страну или регион».',
  },
  {
    title: 'Выберите нужный регион',
    description: 'Найдите в списке нужную страну (Турция, США или Казахстан) и подтвердите.',
  },
  {
    title: 'Введите адрес',
    description: 'Используйте адрес из списка ниже. Номер телефона можно ввести любой.',
  },
  {
    title: 'Готово!',
    description: 'Теперь вы можете приобрести и активировать подарочную карту в новом регионе.',
  },
];

const ADDRESSES: Record<string, { country: string; city: string; state?: string; zip: string; street: string; phone: string }> = {
  TR: {
    country: 'Turkey',
    city: 'Istanbul',
    state: 'Istanbul',
    zip: '34100',
    street: 'Bagdat Caddesi No:1',
    phone: '+90 212 555 0123',
  },
  US: {
    country: 'United States',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    street: '123 Broadway',
    phone: '+1 212 555 0123',
  },
  KZ: {
    country: 'Kazakhstan',
    city: 'Almaty',
    zip: '050000',
    street: 'Abai Avenue 52',
    phone: '+7 727 255 0123',
  },
};

export function GuideView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState(false);
  const [copied, setCopied] = useState('');
  const { notification, impact } = useHaptic();

  const copyAddress = useCallback((region: string) => {
    const addr = ADDRESSES[region];
    if (!addr) return;

    const text = [
      addr.street,
      `${addr.city}${addr.state ? `, ${addr.state}` : ''}`,
      addr.zip,
      addr.country,
    ].join(', ');

    navigator.clipboard.writeText(text).then(() => {
      notification('success');
      setCopied(region);
      setSnackbar(true);
      setTimeout(() => setCopied(''), 2000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      notification('success');
      setCopied(region);
      setSnackbar(true);
      setTimeout(() => setCopied(''), 2000);
    });
  }, [notification]);

  const nextStep = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      impact('light');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      impact('light');
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Progress */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <Steps count={GUIDE_STEPS.length} progress={currentStep + 1} />
      </div>

      {/* Current step */}
      <div
        className="ios-card"
        style={{
          margin: '0 16px 20px',
          padding: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Step number glow */}
        <div style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(10, 132, 255, 0.1)',
          filter: 'blur(25px)',
          pointerEvents: 'none',
        }} />

        <Caption style={{ color: 'var(--ios-blue)', fontWeight: 600, marginBottom: 6 }}>
          Шаг {currentStep + 1} из {GUIDE_STEPS.length}
        </Caption>
        <Headline weight="2" style={{ marginBottom: 8, letterSpacing: -0.4 }}>
          {GUIDE_STEPS[currentStep].title}
        </Headline>
        <Subheadline style={{ color: 'var(--ios-secondary-label)', lineHeight: 1.5 }}>
          {GUIDE_STEPS[currentStep].description}
        </Subheadline>
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 12, padding: '0 16px', marginBottom: 24 }}>
        <Button
          mode="outline"
          size="l"
          stretched
          onClick={prevStep}
          disabled={currentStep === 0}
          style={{ borderRadius: 'var(--ios-radius-button)' }}
        >
          Назад
        </Button>
        <Button
          mode="filled"
          size="l"
          stretched
          onClick={nextStep}
          disabled={currentStep === GUIDE_STEPS.length - 1}
          style={{ borderRadius: 'var(--ios-radius-button)' }}
        >
          Далее
        </Button>
      </div>

      <Divider style={{ margin: '0 16px 16px' }} />

      {/* Addresses */}
      <div style={{ padding: '0 16px' }}>
        <Headline weight="3" style={{ marginBottom: 12, letterSpacing: -0.3 }}>
          📍 Адреса для смены региона
        </Headline>

        {Object.entries(ADDRESSES).map(([region, addr]) => (
          <div key={region} style={{ marginBottom: 8 }}>
            <Accordion
              expanded={expandedRegion === region}
              onChange={(e) => {
                impact('light');
                setExpandedRegion(e ? region : null);
              }}
            >
              <Accordion.Summary>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>
                    {region === 'TR' ? '🇹🇷' : region === 'US' ? '🇺🇸' : '🇰🇿'}
                  </span>
                  <span style={{ fontWeight: 600, letterSpacing: -0.3 }}>{addr.country}</span>
                  {copied === region && (
                    <span style={{ color: 'var(--ios-green)', fontSize: 12, fontWeight: 600 }}>✓ Скопировано</span>
                  )}
                </div>
              </Accordion.Summary>
              <Accordion.Content>
                <div style={{
                  background: 'var(--ios-tertiary-bg)',
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 4,
                }}>
                  <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ios-label)' }}>
                    <div>{addr.street}</div>
                    <div>{addr.city}{addr.state ? `, ${addr.state}` : ''}</div>
                    <div>{addr.zip}</div>
                    <div style={{ color: 'var(--ios-secondary-label)', marginTop: 4 }}>{addr.phone}</div>
                  </div>
                  <Button
                    mode="plain"
                    size="s"
                    onClick={() => copyAddress(region)}
                    style={{ marginTop: 12, fontWeight: 600 }}
                  >
                    📋 Скопировать адрес
                  </Button>
                </div>
              </Accordion.Content>
            </Accordion>
          </div>
        ))}
      </div>

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          before={<span style={{ fontSize: 20 }}>✅</span>}
          duration={2000}
          onClose={() => setSnackbar(false)}
        >
          Адрес скопирован!
        </Snackbar>
      )}
    </div>
  );
}
