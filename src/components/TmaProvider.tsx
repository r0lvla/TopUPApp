'use client';

import { useEffect, type ReactNode } from 'react';
import { SDKProvider, init, navigateBack, useLaunchParams } from '@telegram-apps/sdk-react';

function TmaInner({ children }: { children: ReactNode }) {
  const lp = useLaunchParams();

  useEffect(() => {
    // Try to expand the Mini App to full height
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.setHeaderColor('#1c1c1e');
        window.Telegram.WebApp.setBackgroundColor('#1c1c1e');
      }
    } catch {
      // Not in Telegram context
    }
  }, []);

  return <>{children}</>;
}

export function TmaProvider({ children }: { children: ReactNode }) {
  return (
    <SDKProvider>
      <TmaInner>{children}</TmaInner>
    </SDKProvider>
  );
}
