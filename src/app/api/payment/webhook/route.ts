import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, object } = body;

    console.log(`YooKassa webhook: ${event}, payment=${object?.id}, status=${object?.status}`);

    if (event !== 'payment.succeeded' && event !== 'payment.canceled' && event !== 'payment.waiting_for_capture') {
      return NextResponse.json({ received: true });
    }

    const paymentId = object?.id;
    const status = object?.status;
    const metadata = object?.metadata || {};
    const { product_id, order_id, telegram_user_id } = metadata;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase not configured');
      return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
    }

    // Update order status
    if (order_id) {
      const newStatus = status === 'succeeded' ? 'paid' : 'failed';

      await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          status: newStatus,
          updated_at: new Date().toISOString(),
        }),
      });

      // If payment succeeded, create order item
      if (status === 'succeeded' && product_id) {
        const amount = object?.amount?.value || '0';

        // Check if order item already exists
        const existingRes = await fetch(
          `${supabaseUrl}/rest/v1/order_items?order_id=eq.${order_id}`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );
        const existing = await existingRes.json();

        if (!existing || existing.length === 0) {
          await fetch(`${supabaseUrl}/rest/v1/order_items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              order_id,
              product_id,
              quantity: 1,
              price_at_purchase: amount,
            }),
          });
        }
      }
    }

    // TODO: If payment succeeded, trigger supplier API to get gift card code
    // This will be implemented in supplier integration phase

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
