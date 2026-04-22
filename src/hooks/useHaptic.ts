'use client';

import { useCallback } from 'react';

interface Haptic {
  impact: (style?: 'light' | 'medium' | 'heavy') => void;
  notification: (type?: 'success' | 'warning' | 'error') => void;
  selection: () => void;
}

export function useHaptic(): Haptic {
  const getHaptic = useCallback(() => {
    try {
      const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: unknown } } }).Telegram;
      return tg?.WebApp?.HapticFeedback as { impactOccurred: (s: string) => void; notificationOccurred: (s: string) => void; selectionChanged: () => void } | undefined;
    } catch {
      return undefined;
    }
  }, []);

  const impact = useCallback((style: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      getHaptic()?.impactOccurred(style);
    } catch {}
  }, [getHaptic]);

  const notification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      getHaptic()?.notificationOccurred(type);
    } catch {}
  }, [getHaptic]);

  const selection = useCallback(() => {
    try {
      getHaptic()?.selectionChanged();
    } catch {}
  }, [getHaptic]);

  return { impact, notification, selection };
}
