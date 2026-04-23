'use client';

import { Button, Headline, Subheadline, Caption } from '@telegram-apps/telegram-ui';

const FEATURES = [
  { icon: '🛡', title: 'Безопасно', desc: 'Только официальные подарочные карты Apple', color: '#30D158' },
  { icon: '⚡', title: 'Моментально', desc: 'Код доставки за 2 минуты после оплаты', color: '#FF9F0A' },
  { icon: '💬', title: 'Поддержка 24/7', desc: 'Всегда на связи в Telegram', color: '#0A84FF' },
  { icon: '🌍', title: '3 региона', desc: 'Турция, США и Казахстан', color: '#64D2FF' },
  { icon: '💳', title: 'Удобная оплата', desc: 'Банковская карта через ЮKassa', color: '#BF5AF2' },
  { icon: '🔒', title: 'Гарантия', desc: '100% возврат если код не сработал', color: '#FF375F' },
];

export function AboutView() {
  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* ===== HERO CARD ===== */}
      <div
        className="ios-card"
        style={{
          margin: '0 16px 20px',
          padding: '32px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: -30, left: '30%',
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(10, 132, 255, 0.06)', filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: '20%',
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(48, 209, 88, 0.05)', filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />

        <div style={{ fontSize: 52, marginBottom: 14, position: 'relative' }}>🎁</div>
        <Headline weight="1" style={{ letterSpacing: -1, marginBottom: 10, fontSize: 28 }}>
          TopUPApp
        </Headline>
        <Subheadline style={{ color: 'var(--ios-secondary-label)', lineHeight: 1.55, fontSize: 15 }}>
          Подарочные карты Apple для любых регионов
        </Subheadline>
        <Subheadline style={{ color: 'var(--ios-tertiary-label)', lineHeight: 1.55, fontSize: 14, marginTop: 2 }}>
          Быстро · Надёжно · Выгодно
        </Subheadline>
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="ios-card stagger-item"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Icon */}
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: `${f.color}14`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {f.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3, color: 'var(--ios-label)' }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ios-secondary-label)', marginTop: 2, lineHeight: 1.4 }}>
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== SUPPORT BUTTON ===== */}
      <div style={{ padding: '20px 16px 0' }}>
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
            borderRadius: 14,
            fontWeight: 600,
            height: 50,
            letterSpacing: -0.4,
          }}
        >
          💬 Написать в поддержку
        </Button>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{
        textAlign: 'center',
        padding: '20px 16px 0',
        color: 'var(--ios-tertiary-label)',
        fontSize: 11,
        letterSpacing: 0.2,
      }}>
        TopUPApp v1.0 · Made with ❤️
      </div>
    </div>
  );
}
