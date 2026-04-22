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
  Divider,
} from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';

const GUIDE_STEPS = [
  { title: 'Откройте App Store', description: 'Нажмите на иконку вашего профиля в правом верхнем углу.' },
  { title: 'Выберите страну/регион', description: 'Нажмите «Страна/Регион» → «Изменить страну или регион».' },
  { title: 'Выберите нужный регион', description: 'Найдите в списке нужную страну (Турция, США или Казахстан) и подтвердите.' },
  { title: 'Введите адрес', description: 'Используйте адрес из списка ниже. Номер телефона можно ввести любой.' },
  { title: 'Готово!', description: 'Теперь вы можете приобрести и активировать подарочную карту в новом регионе.' },
];

const ADDRESSES: Record<string, { country: string; city: string; state?: string; zip: string; street: string }> = {
  TR: { country: 'Turkey', city: 'Istanbul', state: 'Istanbul', zip: '34100', street: 'Bagdat Caddesi No:1' },
  US: { country: 'United States', city: 'New York', state: 'NY', zip: '10001', street: '123 Broadway' },
  KZ: { country: 'Kazakhstan', city: 'Almaty', zip: '050000', street: 'Abai Avenue 52' },
};

const REGION_FLAGS: Record<string, string> = { TR: '🇹🇷', US: '🇺🇸', KZ: '🇰🇿' };

export function GuideView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [copied, setCopied] = useState('');
  const { notification, impact } = useHaptic();

  const copyAddress = useCallback((region: string) => {
    const addr = ADDRESSES[region];
    if (!addr) return;
    const text = [addr.street, `${addr.city}${addr.state ? `, ${addr.state}` : ''}`, addr.zip, addr.country].join(', ');
    navigator.clipboard.writeText(text).then(() => {
      notification('success');
      setCopied(region);
      setTimeout(() => setCopied(''), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      notification('success');
      setCopied(region);
      setTimeout(() => setCopied(''), 2000);
    });
  }, [notification]);

  return (
    <div style={{ padding: '16px 0 100px' }}>
      {/* Progress indicator */}
      <div style={{ padding: '0 16px', marginBottom: 20 }}>
        <Steps count={GUIDE_STEPS.length} progress={currentStep + 1} />
      </div>

      {/* Current step card */}
      <div className="ios-card" style={{ margin: '0 16px 20px', padding: 20 }}>
        <Caption style={{ color: '#0A84FF', fontWeight: 600, marginBottom: 6 }}>
          Шаг {currentStep + 1} из {GUIDE_STEPS.length}
        </Caption>
        <Headline weight="2" style={{ marginBottom: 8, letterSpacing: -0.4 }}>
          {GUIDE_STEPS[currentStep].title}
        </Headline>
        <Subheadline style={{ color: 'var(--ios-secondary-label)', lineHeight: 1.5 }}>
          {GUIDE_STEPS[currentStep].description}
        </Subheadline>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginBottom: 24 }}>
        <Button
          mode="outline"
          size="l"
          stretched
          onClick={() => { impact('light'); setCurrentStep(Math.max(0, currentStep - 1)); }}
          disabled={currentStep === 0}
          style={{ borderRadius: 14 }}
        >
          Назад
        </Button>
        <Button
          mode="filled"
          size="l"
          stretched
          onClick={() => { impact('light'); setCurrentStep(Math.min(GUIDE_STEPS.length - 1, currentStep + 1)); }}
          disabled={currentStep === GUIDE_STEPS.length - 1}
          style={{ borderRadius: 14 }}
        >
          Далее
        </Button>
      </div>

      <div style={{ height: 8 }} />

      {/* Divider */}
      <Divider style={{ margin: '0 16px 20px' }} />

      {/* Addresses section */}
      <div style={{ padding: '0 16px' }}>
        <Subheadline weight="2" style={{ marginBottom: 14, letterSpacing: -0.3, fontWeight: 600 }}>
          📍 Адреса для смены региона
        </Subheadline>

        <div style={{
          background: 'var(--ios-secondary-bg)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {Object.entries(ADDRESSES).map(([region, addr], idx) => (
            <div key={region}>
              {idx > 0 && <div style={{ height: 0.5, background: 'var(--ios-separator)', marginLeft: 56 }} />}
              <Accordion
                expanded={expandedRegion === region}
                onChange={(e) => { impact('light'); setExpandedRegion(e ? region : null); }}
              >
                <Accordion.Summary>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                    <span style={{ fontSize: 28 }}>{REGION_FLAGS[region]}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3 }}>{addr.country}</div>
                      <div style={{ fontSize: 13, color: 'var(--ios-secondary-label)', marginTop: 1 }}>
                        {addr.city}, {addr.zip}
                      </div>
                    </div>
                    {copied === region && (
                      <span style={{ color: '#30D158', fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}>✓</span>
                    )}
                  </div>
                </Accordion.Summary>
                <Accordion.Content>
                  <div style={{
                    background: 'var(--ios-tertiary-bg)',
                    borderRadius: 12,
                    padding: 14,
                    margin: '4px 0 8px',
                  }}>
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ios-label)' }}>
                      <div>{addr.street}</div>
                      <div>{addr.city}{addr.state ? `, ${addr.state}` : ''}</div>
                      <div>{addr.zip}</div>
                    </div>
                    <Button
                      mode="plain"
                      size="s"
                      onClick={() => copyAddress(region)}
                      style={{ marginTop: 10, fontWeight: 600 }}
                    >
                      📋 Скопировать
                    </Button>
                  </div>
                </Accordion.Content>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
