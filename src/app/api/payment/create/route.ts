import { NextRequest, NextResponse } from 'next/server';

const YOOKASSA_API = 'https://api.yookassa.ru/v3/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, price_rub, description, telegram_user_id } = body;

    if (!product_id || !price_rub) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const idempotenceKey = crypto.randomUUID();

    // Create order in Supabase first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let orderId: string | null = null;

    if (supabaseUrl && supabaseKey) {
      const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          status: 'pending',
          total_amount: price_rub,
          telegram_user_id: telegram_user_id || null,
        }),
      });

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        orderId = orderData[0]?.id || null;
      }
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://topupapp-seven.vercel.app'}/payment/result${orderId ? `?order=${orderId}` : ''}`;

    // Create YooKassa payment
    const paymentBody = {
      amount: {
        value: Number(price_rub).toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      capture: true,
      description: description || 'Apple Gift Card',
      metadata: {
        product_id,
        order_id: orderId,
        telegram_user_id: telegram_user_id || '',
      },
    };

    const authHeader = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    const ykRes = await fetch(YOOKASSA_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(paymentBody),
    });

    const ykData = await ykRes.json();

    if (!ykRes.ok) {
      console.error('YooKassa error:', ykData);
      return NextResponse.json({ error: 'Payment creation failed', details: ykData }, { status: 502 });
    }

    // Update order with yookassa payment id
    if (orderId && supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          yookassa_payment_id: ykData.id,
        }),
      });
    }

    return NextResponse.json({
      payment_id: ykData.id,
      confirmation_url: ykData.confirmation?.confirmation_url,
      status: ykData.status,
      order_id: orderId,
    });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
