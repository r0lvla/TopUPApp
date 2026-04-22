'use client';

import { useHaptic } from '../hooks/useHaptic';
import type { TabId } from '../types';

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
    <>
      {/* Fade gradient above tabbar */}
      <div
        style={{
          position: 'fixed',
          bottom: 65,
          left: 0,
          right: 0,
          height: 40,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 99,
          maxWidth: 480,
          margin: '0 auto',
        }}
      />
      {/* Tabbar itself */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          maxWidth: 480,
          margin: '0 auto',
          background: 'rgba(28, 28, 30, 0.88)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderTop: '0.5px solid rgba(84, 84, 88, 0.65)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 65,
          paddingBottom: 4,
        }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (active !== tab.id) {
                  selection();
                  onChange(tab.id);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                flex: 1,
                height: '100%',
                color: isActive ? '#0A84FF' : 'rgba(235, 235, 245, 0.3)',
                transition: 'color 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: -0.1,
                color: 'inherit',
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
