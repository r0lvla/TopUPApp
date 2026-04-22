'use client';

import { useEffect } from 'react';
import { AppRoot, Button, Section, Cell, Subheadline, Caption, Title, Badge, FixedLayout } from '@telegram-apps/telegram-ui';
import { init } from '@telegram-apps/sdk';

const REGIONS = {
  TR: { flag: '🇹🇷', name: 'Турция' },
  US: { flag: '🇺🇸', name: 'США' },
  KZ: { flag: '🇰🇿', name: 'Казахстан' },
} as const;

type RegionKey = keyof typeof REGIONS;

export default function GuidePage() {
  useEffect(() => {
    try { init(); } catch {}
    try { window.Telegram?.WebApp?.expand(); } catch {}
  }, []);

  return (
    <AppRoot>
      <div style={{ minHeight: '100vh', paddingBottom: 24, paddingTop: 56 }}>
        <FixedLayout vertical="top" style={{ zIndex: 10 }}>
          <div style={{ padding: '12px 16px', background: 'var(--tgui--bg_color)' }}>
            <Button mode="plain" size="s" onClick={() => window.history.back()}>← Магазин</Button>
          </div>
        </FixedLayout>

        <div style={{ padding: '0 16px 8px' }}>
          <Title level="3">📖 Смена региона Apple ID</Title>
        </div>

        <Section style={{ marginTop: 8 }}>
          <Cell multiline before={<span style={{ fontSize: 20 }}>⚠️</span>}>
            <Caption style={{ lineHeight: 1.6 }}>
              Без смены региона карты не активируются. Apple упростила процедуру для россиян (апрель 2026). Ниже — пошаговая инструкция.
            </Caption>
          </Cell>
        </Section>

        <Section header={<Subheadline weight="2" style={{ padding: '12px 16px 4px' }}>ШАГ 1: Подготовка</Subheadline>} style={{ marginTop: 8 }}>
          <Cell><Caption>• Баланс Apple ID = 0 (потратьте или запросите списание через поддержку)</Caption></Cell>
          <Cell><Caption>• Отмените Apple Music (если активна)</Caption></Cell>
          <Cell><Caption>• Выйдите из Семейного доступа (если вы — организатор)</Caption></Cell>
          <Cell><Caption>• Включите VPN страны切换аемого региона</Caption></Cell>
        </Section>

        <Section header={<Subheadline weight="2" style={{ padding: '12px 16px 4px' }}>ШАГ 2: Смена региона</Subheadline>} style={{ marginTop: 8 }}>
          <Cell><Caption>• Настройки → [Имя] → «Медиаматериалы и покупки»</Caption></Cell>
          <Cell><Caption>• «Просмотр учётной записи» → «Страна/Регион» → «Изменить»</Caption></Cell>
          <Cell><Caption>• Выберите страну → примите условия</Caption></Cell>
          <Cell><Caption>• Способ оплаты → «Нет» (None)</Caption></Cell>
          <Cell><Caption>• Адрес → скопируйте из списка ниже 👇</Caption></Cell>
        </Section>

        <Section header={<Subheadline weight="2" style={{ padding: '12px 16px 4px' }}>ШАГ 3: Активация карты</Subheadline>} style={{ marginTop: 8 }}>
          <Cell><Caption>• App Store → аватар → «Погасить подарочную карту или код»</Caption></Cell>
          <Cell><Caption>• Введите 16-значный код</Caption></Cell>
          <Cell><Caption>• Баланс зачислен! 🎉</Caption></Cell>
        </Section>

        <Section header={<Subheadline weight="2" style={{ padding: '12px 16px 4px' }}>ШАГ 4: Использование</Subheadline>} style={{ marginTop: 8 }}>
          <Cell><Caption>• Покупайте приложения и продлевайте подписки</Caption></Cell>
          <Cell><Caption>• iCloud+ продлится автоматически</Caption></Cell>
          <Cell><Caption>• Apple Music — переоформите в новом регионе</Caption></Cell>
        </Section>

        {(Object.entries(REGIONS) as [RegionKey, typeof REGIONS[RegionKey]][]).map(([key, r]) => (
          <Section
            key={key}
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px 4px' }}>
                <span>{r.flag}</span>
                <Subheadline weight="2">Адреса для {r.name}</Subheadline>
              </div>
            }
            style={{ marginTop: 8 }}
          >
            {key === 'TR' && [
              <Cell key="tr1" multiline after={<Button mode="plain" size="s" onClick={() => navigator.clipboard.writeText('İstiklal Caddesi No: 42, Beyoğlu, İstanbul, 34430')}>📋</Button>}>
                <Subheadline weight="2" style={{ color: 'var(--tgui--link_color)' }}>Стамбул (рекомендуемый)</Subheadline>
                <Caption>İstiklal Caddesi No: 42</Caption>
                <Caption style={{ color: 'var(--tgui--hint_color)' }}>Beyoğlu, İstanbul, 34430</Caption>
              </Cell>,
              <Cell key="tr2" multiline after={<Button mode="plain" size="s" onClick={() => navigator.clipboard.writeText('Atatürk Bulvarı No: 15, Çankaya, Ankara, 06690')}>📋</Button>}>
                <Subheadline weight="2">Анкара</Subheadline>
                <Caption>Atatürk Bulvarı No: 15</Caption>
                <Caption style={{ color: 'var(--tgui--hint_color)' }}>Çankaya, Ankara, 06690</Caption>
              </Cell>,
            ]}
            {key === 'US' && [
              <Cell key="us1" multiline after={<Button mode="plain" size="s" onClick={() => navigator.clipboard.writeText('1200 N Orange St, Wilmington, DE, 19801')}>📋</Button>}>
                <Subheadline weight="2" style={{ color: 'var(--tgui--link_color)' }}>Делавэр (нет налога)</Subheadline>
                <Caption>1200 N Orange St</Caption>
                <Caption style={{ color: 'var(--tgui--hint_color)' }}>Wilmington, DE, 19801</Caption>
              </Cell>,
              <Cell key="us2" multiline after={<Button mode="plain" size="s" onClick={() => navigator.clipboard.writeText('805 SW Broadway, Portland, OR, 97205')}>📋</Button>}>
                <Subheadline weight="2">Орегон (нет налога)</Subheadline>
                <Caption>805 SW Broadway</Caption>
                <Caption style={{ color: 'var(--tgui--hint_color)' }}>Portland, OR, 97205</Caption>
              </Cell>,
              <Cell key="us3" multiline after={<Button mode="plain" size="s" onClick={() => navigator.clipboard.writeText('301 S Park Ave, Helena, MT, 59601')}>📋</Button>}>
                <Subheadline weight="2">Монтана (нет налога)</Subheadline>
                <Caption>301 S Park Ave</Caption>
                <Caption style={{ color: 'var(--tgui--hint_color)' }}>Helena, MT, 59601</Caption>
              </Cell>,
            ]}
            {key === 'KZ' && [
              <Cell key="kz1" multiline after={<Button mode="plain" size="s" onClick={() => navigator.clipboard.writeText('пр. Аль-Фараби 77, Алматы, 050040')}>📋</Button>}>
                <Subheadline weight="2" style={{ color: 'var(--tgui--link_color)' }}>Алматы</Subheadline>
                <Caption>пр. Аль-Фараби 77</Caption>
                <Caption style={{ color: 'var(--tgui--hint_color)' }}>Алматы, 050040</Caption>
              </Cell>,
              <Cell key="kz2" multiline after={<Button mode="plain" size="s" onClick={() => navigator.clipboard.writeText('пр. Мангилик Ел 55, Астана, 010000')}>📋</Button>}>
                <Subheadline weight="2">Астана</Subheadline>
                <Caption>пр. Мангилик Ел 55</Caption>
                <Caption style={{ color: 'var(--tgui--hint_color)' }}>Астана, 010000</Caption>
              </Cell>,
            ]}
          </Section>
        ))}

        <Section style={{ marginTop: 8 }}>
          <Cell before={<span style={{ fontSize: 20 }}>💡</span>} multiline>
            <Subheadline weight="2" style={{ marginBottom: 4 }}>Альтернатива: второй Apple ID</Subheadline>
            <Caption style={{ lineHeight: 1.5 }}>
              Не хотите менять регион основного аккаунта? Создайте второй Apple ID для App Store и используйте адрес из списка выше.
            </Caption>
          </Cell>
        </Section>
      </div>
    </AppRoot>
  );
}
