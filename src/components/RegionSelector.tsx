'use client';

import { SegmentedControl } from '@telegram-apps/telegram-ui';
import { useHaptic } from '../hooks/useHaptic';

const REGIONS = [
  { key: 'TR', label: '🇹🇷 TR' },
  { key: 'US', label: '🇺🇸 US' },
  { key: 'KZ', label: '🇰🇿 KZ' },
] as const;

interface RegionSelectorProps {
  value: string;
  onChange: (region: string) => void;
}

export function RegionSelector({ value, onChange }: RegionSelectorProps) {
  const { selection } = useHaptic();

  return (
    <div style={{ padding: '0 16px', marginBottom: 16 }}>
      <SegmentedControl>
        {REGIONS.map((r) => (
          <SegmentedControl.Item
            key={r.key}
            selected={value === r.key}
            onClick={() => {
              if (value !== r.key) {
                selection();
                onChange(r.key);
              }
            }}
          >
            {r.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>
    </div>
  );
}
