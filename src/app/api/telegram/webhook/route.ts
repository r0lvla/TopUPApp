import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

async function telegramApi(method: string, params: Record<string, unknown>) {
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return resp.json();
}

async function ensureUser(telegramUser: {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.telegramId, String(telegramUser.id)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [newUser] = await db
    .insert(users)
    .values({
      telegramId: String(telegramUser.id),
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      username: telegramUser.username,
      languageCode: telegramUser.language_code,
    })
    .returning();

  return newUser;
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
