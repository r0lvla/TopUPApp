'use client';

import { Section, Cell, Button, Headline, Subheadline, Caption } from '@telegram-apps/telegram-ui';

const FEATURES = [
  { icon: '🛡', title: 'Безопасно', desc: 'Только официальные подарочные карты Apple' },
  { icon: '⚡', title: 'Моментально', desc: 'Код доставки за 2 минуты после оплаты' },
  { icon: '💬', title: 'Поддержка 24/7', desc: 'Всегда на связи в Telegram' },
  { icon: '🌍', title: '3 региона', desc: 'Турция, США и Казахстан' },
  { icon: '💳', title: 'Удобная оплата', desc: 'Банковская карта через ЮKassa' },
  { icon: '🔒', title: 'Гарантия', desc: '100% возврат если код не сработал' },
];

export function AboutView() {
  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Hero */}
      <div
        className="ios-card"
        style={{
          margin: '0 16px 20px',
          padding: 32,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(10, 132, 255, 0.08)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <div style={{ fontSize: 48, marginBottom: 12, position: 'relative' }}>🎁</div>
        <Headline weight="1" style={{ letterSpacing: -0.8, marginBottom: 8 }}>
          TopUPApp
        </Headline>
        <Subheadline style={{ color: 'var(--ios-secondary-label)', lineHeight: 1.5 }}>
          Подарочные карты Apple для любых регионов. Быстро, надёжно, выгодно.
        </Subheadline>
      </div>

      {/* Features */}
      <Section style={{ margin: '0 16px 16px' }}>
        {FEATURES.map((f, i) => (
          <Cell
            key={f.title}
            before={
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--ios-fill-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                {f.icon}
              </div>
            }
            subtitle={f.desc}
            multiline
          >
            <Headline weight="3" style={{ letterSpacing: -0.3 }}>{f.title}</Headline>
          </Cell>
        ))}
      </Section>

      {/* Support button */}
      <div style={{ padding: '8px 16px' }}>
        <Button
          mode="outline"
          size="l"
          stretched
          onClick={() => {
            try {
              const tg = (window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (url: string) => void } } }).Telegram;
              tg?.WebApp?.openTelegramLink?.('https://t.me/TopUPApp_tg_bot');
            } catch {}
          }}
          style={{
            borderRadius: 'var(--ios-radius-button)',
            fontWeight: 600,
            height: 50,
            letterSpacing: -0.4,
          }}
        >
          💬 Написать поддержку
        </Button>
      </div>

      <Caption style={{
        textAlign: 'center',
        color: 'var(--ios-tertiary-label)',
        padding: '16px 0',
        display: 'block',
        fontSize: 11,
      }}>
        TopUPApp v1.0 • Made with ❤️
      </Caption>
    </div>
  );
}
