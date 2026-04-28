import { NextRequest, NextResponse } from 'next/server';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: { id: number; type: string };
    text?: string;
  };
  pre_checkout_query?: {
    id: string;
    from: {
      id: number;
      first_name?: string;
      username?: string;
    };
    currency: string;
    total_amount: number;
    invoice_payload: string;
  };
}

const BOT_TOKEN = process.env.BOT_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://topupapp-seven.vercel.app';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Call Telegram Bot API */
async function telegramApi(method: string, params: Record<string, unknown>) {
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return resp.json();
}

/** Supabase REST helper */
function sbHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Prefer: 'return=representation',
  };
}

/** Ensure user exists in DB via Supabase REST */
async function ensureUser(telegramUser: {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}) {
  // Check if user exists
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?telegram_id=eq.${telegramUser.id}&select=*&limit=1`,
    { headers: sbHeaders() }
  );
  const existing = await checkRes.json();

  if (existing && existing.length > 0) {
    return existing[0];
  }

  // Create new user
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: sbHeaders(),
    body: JSON.stringify({
      telegram_id: String(telegramUser.id),
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      username: telegramUser.username,
      language_code: telegramUser.language_code,
    }),
  });
  const inserted = await insertRes.json();
  return inserted?.[0] || null;
}

export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json();

    // Handle pre-checkout query
    if (update.pre_checkout_query) {
      await telegramApi('answerPreCheckoutQuery', {
        pre_checkout_query_id: update.pre_checkout_query.id,
        ok: true,
      });
      return NextResponse.json({ ok: true });
    }

    // Handle regular messages
    if (update.message?.text) {
      const { message } = update;

      // Register/update user
      if (message.from) {
        await ensureUser(message.from);
      }

      // /start command — open Mini App
      if (message.text === '/start') {
        await telegramApi('sendMessage', {
          chat_id: message.chat.id,
          text: '🎮 Добро пожаловать в TopUPApp!\n\nПокупай подарочные карты Apple для Турции, США и Казахстана за секунды.\n\nНажмите кнопку ниже, чтобы открыть магазин 👇',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🛒 Открыть магазин',
                  web_app: { url: APP_URL },
                },
              ],
            ],
          },
        });
      }

      // /help command
      if (message.text === '/help') {
        await telegramApi('sendMessage', {
          chat_id: message.chat.id,
          text: '📋 TopUPApp — подарочные карты Apple\n\n🇹🇷 Турция — самые дешёвые подписки\n🇺🇸 США — максимальный каталог\n🇰🇿 Казахстан — простой переход\n\nНажми кнопку ниже, чтобы открыть магазин 👇',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🛒 Открыть магазин',
                  web_app: { url: APP_URL },
                },
              ],
              [
                {
                  text: '📖 Как сменить регион',
                  web_app: { url: `${APP_URL}/guide` },
                },
              ],
            ],
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
