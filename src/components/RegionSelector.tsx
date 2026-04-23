'use client';

import { useHaptic } from '../hooks/useHaptic';

interface RegionSelectorProps {
  value: string;
  onChange: (region: string) => void;
}

const REGIONS = [
  {
    key: 'TR',
    label: '🇹🇷',
    abbr: 'TR',
    gradient: 'linear-gradient(135deg, #E30A17 0%, #FF6B35 100%)',
    activeGradient: 'linear-gradient(135deg, #E30A17 0%, #FF453A 50%, #FF6B35 100%)',
  },
  {
    key: 'US',
    label: '🇺🇸',
    abbr: 'US',
    gradient: 'linear-gradient(135deg, #3C5AFF 0%, #B31942 100%)',
    activeGradient: 'linear-gradient(135deg, #0A84FF 0%, #3C5AFF 50%, #B31942 100%)',
  },
  {
    key: 'KZ',
    label: '🇰🇿',
    abbr: 'KZ',
    gradient: 'linear-gradient(135deg, #00B5B6 0%, #FFB900 100%)',
    activeGradient: 'linear-gradient(135deg, #30D158 0%, #00B5B6 50%, #FFB900 100%)',
  },
];

export function RegionSelector({ value, onChange }: RegionSelectorProps) {
  const { selection } = useHaptic();

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      padding: '0 16px',
      marginBottom: 16,
    }}>
      {REGIONS.map((r) => {
        const isActive = value === r.key;
        return (
          <button
            key={r.key}
            onClick={() => {
              if (value !== r.key) {
                selection();
                onChange(r.key);
              }
            }}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              border: isActive ? 'none' : '0.5px solid rgba(84, 84, 88, 0.5)',
              background: isActive
                ? r.activeGradient
                : 'rgba(44, 44, 46, 0.8)',
              backgroundSize: isActive ? '200% 200%' : '100% 100%',
              animation: isActive ? 'gradientShift 4s ease infinite' : 'none',
              color: isActive ? '#FFFFFF' : 'rgba(235, 235, 245, 0.6)',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: -0.3,
              cursor: 'pointer',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: isActive
                ? `0 4px 16px ${r.key === 'TR' ? 'rgba(227, 10, 23, 0.3)' : r.key === 'US' ? 'rgba(60, 90, 255, 0.3)' : 'rgba(0, 181, 182, 0.3)'}`
                : 'none',
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: 20 }}>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
