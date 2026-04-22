'use client';

import { useEffect, type ReactNode } from 'react';
import { init } from '@telegram-apps/sdk';

export function TmaProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      init();
    } catch {
      // Not in Telegram context
    }
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.setHeaderColor('#1c1c1e');
        window.Telegram.WebApp.setBackgroundColor('#1c1c1e');
      }
    } catch {}
  }, []);

  return <>{children}</>;
}
