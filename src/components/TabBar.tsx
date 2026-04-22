'use client';

import { FixedLayout, Tabbar } from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';

export type TabId = 'catalog' | 'guide' | 'about';

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'catalog', icon: '🏠', label: 'Каталог' },
  { id: 'guide', icon: '📖', label: 'Гайд' },
  { id: 'about', icon: '⚙️', label: 'О нас' },
];

export function TabBar({ active, onChange }: TabBarProps) {
  const { selection } = useHaptic();

  return (
    <FixedLayout style={{ background: 'transparent' }}>
      {/* Fade gradient above tabbar */}
      <div
        className="tabbar-fade"
        style={{ height: 40, width: '100%', position: 'absolute', top: -40, left: 0 }}
      />
      <div className="glass-heavy" style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
        <Tabbar style={{ background: 'transparent' }}>
          {TABS.map((tab) => (
            <Tabbar.Item
              key={tab.id}
              selected={active === tab.id}
              onClick={() => {
                if (active !== tab.id) {
                  selection();
                  onChange(tab.id);
                }
              }}
              style={{
                background: 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                opacity: active === tab.id ? 1 : 0.4,
                transition: 'opacity 0.2s ease',
              }}>
                <span style={{ fontSize: 24, lineHeight: 1 }}>{tab.icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: active === tab.id ? 600 : 400,
                  letterSpacing: -0.1,
                }}>
                  {tab.label}
                </span>
              </div>
            </Tabbar.Item>
          ))}
        </Tabbar>
      </div>
    </FixedLayout>
  );
}
