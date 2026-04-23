'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Title, Subheadline, Caption, Button } from '@telegram-apps/telegram-ui';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');
  const orderId = searchParams.get('order');

  const checkOrder = useCallback(async () => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setStatus('failed');
      return;
    }

    // Poll order status (max 10 attempts, every 2s)
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=status`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );
        const data = await res.json();

        if (data?.[0]?.status === 'paid') {
          setStatus('success');
          return;
        }
        if (data?.[0]?.status === 'failed') {
          setStatus('failed');
          return;
        }
      } catch {
        // Continue polling
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    setStatus('pending');
  }, [orderId]);

  useEffect(() => {
    checkOrder();
  }, [checkOrder]);

  const configs = {
    loading: { emoji: '⏳', title: 'Проверяем оплату...', subtitle: 'Подождите немного', color: '#FF9F0A' },
    success: { emoji: '✅', title: 'Оплата прошла!', subtitle: 'Код подарочной карты будет отправлен в ближайшее время', color: '#30D158' },
    pending: { emoji: '🕐', title: 'Платёж в обработке', subtitle: 'Статус обновится автоматически', color: '#FF9F0A' },
    failed: { emoji: '❌', title: 'Оплата не прошла', subtitle: 'Попробуйте ещё раз', color: '#FF453A' },
  };

  const cfg = configs[status];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      textAlign: 'center',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        background: `${cfg.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48,
        marginBottom: 24,
      }}>
        {cfg.emoji}
      </div>

      <Title level="2" style={{ letterSpacing: -0.6, marginBottom: 8 }}>
        {cfg.title}
      </Title>
      <Subheadline style={{ color: 'var(--ios-secondary-label)', maxWidth: 280 }}>
        {cfg.subtitle}
      </Subheadline>

      {orderId && (
        <Caption style={{
          color: 'var(--ios-tertiary-label)',
          marginTop: 16,
          fontFamily: 'monospace',
          fontSize: 12,
        }}>
          Заказ: {orderId.slice(0, 8)}...
        </Caption>
      )}

      <div style={{ marginTop: 32, width: '100%', maxWidth: 320 }}>
        <Button
          mode="filled"
          size="l"
          stretched
          onClick={() => router.push('/')}
          style={{ borderRadius: 14, fontWeight: 600, height: 50, fontSize: 17 }}
        >
          На главную
        </Button>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: 'var(--ios-secondary-label)' }}>Загрузка...</div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
