# Исследование #6: Telegram Mini App — Технический опыт и готовые решения

**Дата:** 2026-04-14  
**Проект:** Apple Balance  
**Цель:** Понять как РЕАЛЬНО разрабатывать Telegram Mini App для e-commerce — не теория, а практика

---

## 1. Готовые шаблоны и Starter Kits

### Официальные шаблоны от Telegram-Mini-Apps

| Репозиторий | Стек | Описание |
|---|---|---|
| [Telegram-Mini-Apps/nextjs-template](https://github.com/Telegram-Mini-Apps/nextjs-template) | Next.js 14 + TypeScript + tma.js + TON Connect | **ОФИЦИАЛЬНЫЙ** шаблон от команды Telegram Mini Apps. SSR/SSG, HTTPS для локальной разработки |
| [Telegram-Mini-Apps/reactjs-template](https://github.com/Telegram-Mini-Apps/reactjs-template) | React + Vite + TypeScript + tma.js | Лёгкий SPA-шаблон на React + Vite |
| [Telegram-Mini-Apps/nextjs-tsdk-template](https://github.com/Telegram-Mini-Apps/nextjs-tsdk-template) | Next.js + Telegram SDK (не tma.js) | Альтернатива на официальном Telegram SDK |

### Community шаблоны

| Репозиторий | Стек | Описание |
|---|---|---|
| [Buidlso/telegram-mini-app-nextjs-boilerplate](https://github.com/Buidlso/telegram-mini-app-nextjs-boilerplate) | Next.js + shadcn/ui + Tailwind + @tma.js/sdk | **РЕКОМЕНДУЕМЫЙ** для старта — включает красивый UI |
| [mauriciobraz/next.js-telegram-webapp](https://github.com/mauriciobraz/next.js-telegram-webapp) | Next.js + Tailwind CSS | Простой шаблон для быстрого старта |
| [vkruglikov/react-telegram-web-app](https://github.com/vkruglikov/react-telegram-web-app) | React + @vkruglikov/react-telegram-web-app | React-компоненты для Telegram WebApp SDK |

### E-commerce специфичные решения

| Проект | Описание | Ссылка |
|---|---|---|
| **MiniWoo** | Telegram Mini App интеграция с WooCommerce. Next.js + WooCommerce REST API | [github.com/mini-woo/mini-woo](https://github.com/mini-woo/mini-woo) |
| **WooCommerce Telegram Mini Apps** | Официальный плагин WooCommerce для Mini App магазина | [woocommerce.com/products/telegram-mini-apps](https://woocommerce.com/products/telegram-mini-apps/) |

### UI-библиотеки

| Библиотека | Stars | Описание |
|---|---|---|
| **@telegram-apps/telegram-ui** | 500+ | React-компоненты в стиле Telegram. Кнопки, списки, ячейки, аватары и т.д. **Основная UI-библиотека** |
| [Figma UI Kit](https://www.figma.com/community/file/1348989725141777736/telegram-mini-apps-ui-kit) | — | 25+ компонентов, 250+ стилей для дизайна Mini Apps |
| @vkruglikov/react-telegram-web-app | 200+ | React-хуки для MainButton, BackButton, HapticFeedback, ThemeParams |
| altiore/twa | — | React hooks: useHapticFeedback, useThemeParams, useWebApp |

### Awesome Lists

- [awesome-telegram-mini-apps](https://github.com/telegram-mini-apps-dev/awesome-telegram-mini-apps) — curated список всего для TMA
- [Telegram-Mini-Apps/issues](https://github.com/Telegram-Mini-Apps/issues) — централизованный трекер проблем платформы

---

## 2. Реальные примеры e-commerce Mini Apps

### MiniWoo — WooCommerce через Telegram

**Что делает:** Полноценный интернет-магазин внутри Telegram — просмотр товаров, корзина, чекаут.

**Архитектура:**
- Frontend: Next.js (React)
- Backend: WooCommerce REST API
- Платежи: через Telegram Bot API (sendInvoice)
- Данные товаров: синхронизация с WooCommerce

**Ссылка:** [github.com/mini-woo/mini-woo](https://github.com/mini-woo/mini-woo)

### WooCommerce Telegram Mini Apps (официальный плагин)

**Что делает:** Официальный плагин WooCommerce (от команды WooCommerce). Клиенты просматривают товары, управляют корзиной, проходят чекаут — всё внутри Telegram.

**Ссылка:** [woocommerce.com/document/telegram-mini-apps](https://woocommerce.com/document/telegram-mini-apps/)

### Типичные успешные фичи для e-commerce в Mini Apps

1. **Мгновенный просмотр товаров** — каталог с фильтрами прямо в чате
2. **Корзина и чекаут** — без перехода во внешний браузер
3. **Telegram Stars для оплаты** — нативная оплата внутри приложения
4. **Push-уведомления через бота** — статус заказа, скидки
5. **Персонализация** — доступ к данным пользователя Telegram (имя, фото)
6. **Реферальная система** — share через Telegram работает нативно

### Кто уже продаёт через Mini Apps

- Кофейни (заказ кофе через бота + Mini App)
- Доставка еды
- Цифровые товары (подписки, игры)
- WooCommerce-магазины через MiniWoo
- Маркетплейсы цифровых услуг

---

## 3. Платёжная интеграция — Практика

### Telegram Stars (Встроенная оплата)

**Самый простой способ принимать платежи в Mini App.**

#### Как работает:
1. Бэкенд создаёт invoice-ссылку через `createInvoiceLink`
2. Фронтенд открывает её через `WebApp.openInvoice()`
3. Пользователь платит Stars (купленные через Apple Pay / Google Pay)
4. Callback получает статус `paid`

#### Код: Создание Invoice на бэкенде (Node.js)

```javascript
// Backend: POST /create-invoice
app.post("/create-invoice", async (req, res) => {
  const invoiceLink = await botApi.createInvoiceLink(
    "Apple Balance Gift Card",  // title
    "Подарочная карта Apple Balance $50",  // description
    JSON.stringify({ orderId: "12345" }),  // payload
    "",  // provider_token: ПУСТОЙ для Telegram Stars!
    "XTR",  // currency: XTR = Telegram Stars
    [{ amount: 500, label: "$50 Gift Card" }],  // prices
  );
  res.json({ invoiceLink });
});
```

#### Код: Открытие Invoice на фронтенде

```javascript
// Frontend: оплата через Telegram Stars
import WebApp from '@twa-dev/sdk';

const handlePayment = async () => {
  // 1. Получить invoice-ссылку с бэкенда
  const response = await fetch('/api/create-invoice', { method: 'POST' });
  const { invoiceLink } = await response.json();
  
  // 2. Открыть нативный Telegram платежный UI
  WebApp.openInvoice(invoiceLink, (status) => {
    if (status === "paid") {
      // Оплата прошла! Обновить UI
      console.log("Payment successful!");
    } else if (status === "cancelled") {
      console.log("Payment cancelled");
    } else if (status === "failed") {
      console.log("Payment failed");
    }
  });
};
```

#### Альтернатива: sendInvoice (для обычных валют)

```javascript
// Бот отправляет invoice в чат
bot.sendInvoice(
  chatId,
  "Apple Balance $50",
  "Gift Card",
  "order_12345",
  "PROVIDER_TOKEN",  // Токен платёжного провайдера (ЮKassa и т.д.)
  "USD",             // Валюта
  [{ label: "Price", amount: 5000 }],  // В центах!
);
```

### Интеграция с ЮKassa (Россия)

**Официально поддерживается Telegram.**

#### Настройка:
1. Зарегистрироваться в ЮKassa → получить токен
2. В @BotFather: `/mybots` → Payments → выбрать ЮKassa → ввести токен
3. BotFather выдаст `provider_token` для использования в `sendInvoice`

**Документация:** [yookassa.ru/telegram](https://yookassa.ru/telegram/)  
**Инструкция:** [yookassa.ru/docs/.../telegram](https://yookassa.ru/docs/support/payments/onboarding/integration/cms-module/telegram)

### Интеграция с Робокасса (Россия)

Аналогично ЮKassa:
1. Зарегистрироваться в Робокасса
2. Подключить через BotFather
3. Использовать `provider_token` в sendInvoice

**Ссылка:** [robokassa.com/.../messendzher-boty](https://robokassa.com/payments/instrumenty-oplaty/messendzher-boty/)

### Другие платёжные системы

| Система | Интеграция | Особенности |
|---|---|---|
| ЮKassa | Через BotFather | СБП, карты, Apple Pay, Google Pay |
| Робокасса | Через BotFather | СБП, карты, Qiwi |
| Продамус | Через BotFather | СБП, карты, крипто |
| CloudPayments | Через BotFather | СБП, карты, подписки |
| Telegram Stars | Нативно | XTR валюта, для цифровых товаров |

### Важные нюансы платежей

1. **Telegram Stars** = только для **цифровых** товаров и услуг
2. **ЮKassa/Робокасса** = для физических товаров
3. **provider_token = пустая строка** для Stars, непустой — для провайдеров
4. **Сумма в центах** (amount: 5000 = $50.00)
5. **Webhook** приходит на бэкенд после успешной оплаты — обновляйте заказ через него, не только через callback фронтенда

---

## 4. Архитектура и Бэкенд

### Типичная архитектура Mini App для e-commerce

```
┌──────────────────────────────────────────────────────────────┐
│                    TELEGRAM CLIENT                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  WebView (Mini App)                      │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │            React / Next.js SPA                     │  │ │
│  │  │  ┌───────────┐ ┌──────────┐ ┌──────────────────┐ │  │ │
│  │  │  │ Catalog   │ │ Cart     │ │ Checkout         │ │  │ │
│  │  │  └───────────┘ └──────────┘ └──────────────────┘ │  │ │
│  │  │            @tma.js/sdk (Telegram API)             │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
          │ HTTPS                    │ initData (auth)
          ▼                         ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Frontend Hosting   │    │   Backend API        │
│  (Vercel/CF Pages)  │    │   (Vercel/Railway)   │
│                     │    │                      │
│  • Static/CSS/JS    │    │  • initData проверка │
│  • Telegram theme   │    │  • Бизнес-логика     │
│  • Кэширование      │    │  • Payments webhook  │
│                     │    │  • CRUD заказов      │
└─────────────────────┘    └──────┬───────────────┘
                                  │
                          ┌───────▼───────────────┐
                          │     Database           │
                          │  (Neon/Supabase/       │
                          │   PlanetScale)         │
                          │                       │
                          │  • users              │
                          │  • products           │
                          │  • orders             │
                          │  • payments           │
                          └───────────────────────┘
```

### Валидация initData — Рабочий пример

**Это КРИТИЧЕСКИ ВАЖНО для безопасности. Без валидации любой может подделать данные пользователя.**

#### Алгоритм валидации:

1. Получить initData из `window.Telegram.WebApp.initData`
2. Отправить на бэкенд в заголовке `Authorization: tma <initData>`
3. На бэкенде: проверить HMAC-SHA256 подпись

#### Код валидации (Node.js + @tma.js/init-data-node):

```javascript
// Backend: валидация initData
import { validate, parse } from '@tma.js/init-data-node';
import express from 'express';

const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN;

// Middleware для проверки авторизации
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('tma ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const initDataRaw = authHeader.slice(4); // Убрать "tma "
  
  try {
    // Валидация подписи
    validate(initDataRaw, BOT_TOKEN, { expiresIn: 3600 }); // 1 час
    // Парсинг данных
    const initData = parse(initDataRaw);
    req.user = initData.user; // { id, first_name, last_name, username, ... }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid init data' });
  }
}

app.use(authMiddleware);
```

#### Код отправки initData с фронтенда:

```javascript
// Frontend: отправка initData
import { retrieveRawInitData } from '@tma.js/sdk';

const initDataRaw = retrieveRawInitData();

fetch('https://api.example.com/products', {
  headers: {
    'Authorization': `tma ${initDataRaw}`
  }
});
```

#### Альтернатива: ручная валидация (без библиотеки):

```javascript
import crypto from 'crypto';

function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  
  // Сортировка параметров по алфавиту
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // HMAC-SHA256 с ключом "WebAppData" от bot token
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  // HMAC-SHA256 от dataCheckString
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return computedHash === hash;
}
```

### Где хостить

| Компонент | Рекомендация | Почему |
|---|---|---|
| **Frontend** | Vercel / Cloudflare Pages | Бесплатно, автоматически CDN, HTTPS |
| **Backend** | Vercel (Serverless) / Railway / Render | Vercel — проще всего, Railway — больше контроля |
| **Database** | Neon (PostgreSQL) / Supabase | Neon — serverless PostgreSQL, Supabase — PostgreSQL + Auth + Storage |
| **Cache** | Upstash Redis | Serverless Redis, оплата за использование |
| **Файлы/Изображения** | Cloudflare R2 / Supabase Storage | R2 — нет egress fee, Supabase — удобно |

### Рекомендуемый production-стек (от опытного разработчика):

```javascript
const productionStack = {
  framework: "Next.js 15 (App Router)",
  ui: "shadcn/ui + Tailwind CSS + @telegram-apps/telegram-ui",
  sdk: "@tma.js/sdk + @tma.js/sdk-react",
  database: "PostgreSQL (Neon)",
  orm: "Drizzle ORM",
  cache: "Redis (Upstash)",
  payments: "Telegram Stars + ЮKassa",
  hosting: "Vercel",
  auth: "initData validation (@tma.js/init-data-node)"
};
```

---

## 5. UI/UX в Mini App

### Официальные компоненты Telegram

#### Нативные элементы (доступны через SDK):

```javascript
import { useExpand, useMainButton, useBackButton, useThemeParams, useHapticFeedback } from '@tma.js/sdk-react';

function MyComponent() {
  const expand = useExpand();
  const mainButton = useMainButton();
  const backButton = useBackButton();
  const themeParams = useThemeParams();
  const haptic = useHapticFeedback();
  
  // Главная кнопка внизу экрана
  mainButton.setParams({
    text: 'Купить',
    color: '#31B545',
    textColor: '#ffffff',
    isVisible: true,
    isEnabled: true,
  });
  
  mainButton.on('click', () => {
    haptic.impactOccurred('medium'); // Вибрация!
    handlePurchase();
  });
  
  // Кнопка "назад" в хедере
  backButton.show();
  backButton.on('click', goBack);
  
  // Раскрыть на весь экран
  expand();
  
  // Получить цвета темы пользователя
  const bgColor = themeParams.backgroundColor;
  const textColor = themeParams.textColor;
}
```

### @telegram-apps/telegram-ui — Основная UI-библиотека

```bash
npm install @telegram-apps/telegram-ui
```

```jsx
import { 
  AppRoot, 
  Placeholder, 
  Title, 
  Button, 
  Card, 
  Cell,
  List,
  Avatar,
  ScreenSpinner,
  Snackbar
} from '@telegram-apps/telegram-ui';

function App() {
  return (
    <AppRoot>
      <List>
        <Card>
          <Cell
            before={<Avatar src={product.image} />}
            description="$50.00"
            after={<Button size="s">Купить</Button>}
          >
            {product.name}
          </Cell>
        </Card>
      </List>
    </AppRoot>
  );
}
```

### Haptic Feedback — Тактильная обратная связь

```javascript
import { hapticFeedback } from '@tma.js/sdk';

// При нажатии кнопки
hapticFeedback.impactOccurred('light');   // Лёгкий удар
hapticFeedback.impactOccurred('medium');  // Средний удар
hapticFeedback.impactOccurred('heavy');   // Сильный удар
hapticFeedback.impactOccurred('rigid');   // Жёсткий
hapticFeedback.impactOccurred('soft');    // Мягкий

// Уведомления
hapticFeedback.notificationOccurred('success'); // Успех
hapticFeedback.notificationOccurred('warning'); // Предупреждение
hapticFeedback.notificationOccurred('error');   // Ошибка

// Выбор элемента
hapticFeedback.selectionChanged(); // При скролле пикера
```

### Темы и адаптация

```javascript
import { useThemeParams } from '@tma.js/sdk-react';

function ThemedComponent() {
  const themeParams = useThemeParams();
  const isDark = themeParams.colorScheme === 'dark';
  
  return (
    <div style={{
      backgroundColor: themeParams.backgroundColor || (isDark ? '#1c1c1e' : '#ffffff'),
      color: themeParams.textColor || (isDark ? '#ffffff' : '#000000'),
    }}>
      {/* Контент автоматически адаптируется под тему Telegram */}
    </div>
  );
}
```

### Дизайн-принципы для e-commerce

1. **Использовать нативные элементы Telegram** — MainButton, BackButton, SwipeBack
2. **Поддерживать тёмную и светлую темы** — через themeParams
3. **Минимум текста, максимум визуала** — картинки товаров, иконки
4. **Haptic feedback на каждом действии** — addItem, purchase, scroll
5. **Быстрая загрузка** — lazy loading, оптимизация изображений
6. **Мобильный-first** — большинство пользователей на телефонах

---

## 6. Подводные камни

### Известные проблемы

#### 1. SSR не работает с Telegram API
Telegram SDK требует `window` объект, который есть только в браузере. SSR-компоненты нужно помечать как `'use client'` (Next.js App Router).

**Решение:**
```jsx
// ✅ Правильно: динамический импорт без SSR
const TelegramApp = dynamic(() => import('./TelegramApp'), { ssr: false });
```

#### 2. Разный WebView на разных платформах

| Платформа | WebView | Проблемы |
|---|---|---|
| **Android** | Chrome-based WebView | Обычно стабильный, но может зависать при сложном DNS/Cloudflare |
| **iOS** | WKWebView (Safari) | Другой рендеринг, ограничения клавиатуры, нет inputAccessoryView |
| **Desktop** | Встроенный WebView | Ограниченные DevTools, другой viewport |
| **macOS** | WKWebView | Аналогично iOS + специфичные баги |

#### 3. HTTPS обязателен

BotFather требует HTTPS для URL Mini App. Для разработки:
```bash
# Локальный HTTPS через mkcert
pnpm run dev:https  # В шаблонах Telegram-Mini-Apps это есть
```

#### 4. Проблема с Cloudflare + Railway на Android

**Симптом:** Mini App грузится вечно на Android (на iOS работает).  
**Причина:** Конфликт DNS/прокси между Cloudflare и Railway.  
**Решение:** Использовать прямой railway.app домен вместо custom domain.

#### 5. WebView height не всегда корректный

На некоторых iOS устройствах WebView height рассчитывается неправильно. Нативный метод `expand()` не работает на Desktop.

#### 6. Debugging сложности

- **Android:** chrome://inspect — работает
- **iOS:** Нужен macOS + Safari для remote debugging
- **Desktop:** Ограниченные DevTools, расширения не работают

#### 7. Deep links работают по-разному

На iOS deep links (`https://t.me/bot/app`) могут вести себя непредсказуемо. Рекомендуется тестировать на всех платформах.

### Что НЕЛЬЗЯ сделать в Mini App

1. **Нет доступа к микрофону/камере** (ограничено)
2. **Нет push-уведомлений напрямую** — только через бота
3. **Нет файловой системы** пользователя
4. **Нет нативных нотификаций** — только через Telegram Bot API
5. **Ограниченный storage** — WebView localStorage может чиститься
6. **Нет background execution** — Mini App закрывается при сворачивании
7. **Нет доступа к контактам** телефона
8. **Нет Bluetooth/NFC**

### Типичные ошибки разработчиков

1. **Не валидировать initData** → любой может подделать запрос
2. **Валидировать только при логине** → нужно на КАЖДОМ запросе
3. **Не обрабатывать тему** → тёмная тема ломает UI
4. **Слишком тяжёлый JS bundle** → долго грузится в WebView
5. **Не тестировать на реальных устройствах** → работает в Chrome, не работает в WebView
6. **Игнорировать expand()** → Mini App выглядит как маленькое окошко

---

## 7. Рекомендуемый стек для Apple Balance

### Решение: Next.js + React

**Почему не Vue/Svelte/Angular:**
- 95% шаблонов и библиотек для Telegram Mini Apps — на React
- @telegram-apps/telegram-ui — React-only
- @tma.js/sdk-react — React-only хуки
- Максимальное количество готовых решений

**Почему Next.js:**
- SSR/SSG для быстрой загрузки
- API Routes для бэкенда в одном проекте
- Лучшая интеграция с Vercel
- Официальные шаблоны от Telegram

### Конкретный стек (MVP)

```
Frontend:
├── Next.js 15 (App Router)
├── @telegram-apps/telegram-ui — UI компоненты в стиле Telegram
├── @tma.js/sdk + @tma.js/sdk-react — Telegram SDK
├── Tailwind CSS — утилитарные стили
├── shadcn/ui — дополнительные компоненты
└── Zustand — state management (легче Redux)

Backend (Next.js API Routes):
├── @tma.js/init-data-node — валидация initData
├── Drizzle ORM + PostgreSQL (Neon) — база данных
├── Upstash Redis — rate limiting + кэш
└── node-telegram-bot-api — бот + платежи

Payments:
├── Telegram Stars — для цифровых товаров (XTR)
├── ЮKassa — для физических товаров (рубли, СБП)
└── Webhook processing — подтверждение оплаты

Hosting:
├── Vercel — frontend + serverless backend
├── Neon — PostgreSQL
└── Upstash — Redis
```

### Архитектура Apple Balance Mini App

```
Пользователь в Telegram
       │
       ▼
┌─────────────────────────────────────────┐
│  Telegram Mini App (WebView)            │
│                                         │
│  ┌──────────────┐   ┌────────────────┐ │
│  │  Каталог     │   │  Корзина       │ │
│  │  Gift Cards  │──▶│  + Checkout    │ │
│  │  (Apple,     │   │  + openInvoice │ │
│  │   Google,    │   └────────────────┘ │
│  │   etc.)      │                       │
│  └──────────────┘                       │
│  @tma.js/sdk                            │
│  @telegram-apps/telegram-ui             │
└──────────────────┬──────────────────────┘
                   │
         Authorization: tma <initData>
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Next.js API Routes (Serverless)         │
│                                          │
│  /api/products — список карт             │
│  /api/orders — создание заказов          │
│  /api/payment — createInvoiceLink        │
│  /api/webhook — обработка оплаты         │
│  /api/admin — управление (для нас)       │
│                                          │
│  + initData validation на каждом запросе │
└──────────────────┬───────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
  ┌─────────────┐    ┌──────────────┐
  │ Neon DB     │    │ Telegram Bot │
  │ PostgreSQL  │    │ (webhooks,   │
  │             │    │  invoices)   │
  │ • users     │    └──────────────┘
  │ • products  │
  │ • orders    │
  │ • payments  │
  └─────────────┘
```

### Сроки разработки MVP

| Неделя | Задача | Результат |
|---|---|---|
| **1** | Настройка проекта + шаблон + BotFather | Рабочий "Hello World" в Telegram |
| **2** | Каталог товаров + UI | Красивый список gift cards |
| **3** | Корзина + checkout + initData auth | Оформление заказа |
| **4** | Платежи (Stars/ЮKassa) + webhook | Полный цикл покупки |
| **5** | Админка + управление заказами | Управление магазином |
| **6** | Тестирование + полировка | Production-ready MVP |

**Итого: ~6 недель для полноценного MVP.**

### Стоимость (ежемесячно)

| Сервис | Тариф | Цена |
|---|---|---|
| Vercel | Hobby | $0 |
| Neon | Free Tier | $0 (до 3GB) |
| Upstash | Free Tier | $0 (10K команд/день) |
| Telegram Bot | — | $0 |
| ЮKassa | Комиссия | 2.8% от транзакции |
| **Итого (до первых клиентов)** | | **$0/мес** |

---

## 8. Полезные ссылки

### Документация
- [Telegram Mini Apps (официальная)](https://core.telegram.org/bots/webapps)
- [Telegram Payments API](https://core.telegram.org/bots/payments)
- [Telegram Stars Payments](https://core.telegram.org/bots/payments-stars)
- [docs.telegram-mini-apps.com](https://docs.telegram-mini-apps.com/) — НЕофициальная, но очень подробная

### SDK и библиотеки
- [@tma.js/sdk](https://docs.telegram-mini-apps.com/packages/tma-js-sdk) — основной SDK
- [@tma.js/sdk-react](https://docs.telegram-mini-apps.com/packages/tma-js-sdk-react) — React-хуки
- [@tma.js/init-data-node](https://docs.telegram-mini-apps.com/packages/tma-js-init-data-node) — валидация на бэкенде
- [@telegram-apps/telegram-ui](https://github.com/telegram-mini-apps-dev/TelegramUI) — UI-компоненты

### Шаблоны
- [Telegram-Mini-Apps/nextjs-template](https://github.com/Telegram-Mini-Apps/nextjs-template) — основной
- [Buidlso/nextjs-boilerplate](https://github.com/Buidlso/telegram-mini-app-nextjs-boilerplate) — с shadcn/ui

### Платёжные системы (Россия)
- [ЮKassa + Telegram](https://yookassa.ru/telegram/)
- [Робокасса + Telegram](https://robokassa.com/payments/instrumenty-oplaty/messendzher-boty/)
- [Статья: Платежи через ЮKassa/CloudPayments](https://mayai.ru/hotite-prinimat-platezhi-cherez-telegram-uznajte-kak-legko-integrirovat-yukassa-cloudpayments-i-robokassa/)

### Статьи и гайды
- [Telegram Mini Apps Creation Handbook](https://dev.to/simplr_sh/telegram-mini-apps-creation-handbook-58em) — подробный гайд
- [Fast Deployment: Next.js + Vercel](https://dev.to/diana_agliamutdinova_741a/your-first-telegram-mini-app-fast-deployment-with-nextjs-vercel-and-telegram-sdk-4063)
- [Tech Stack for TMA (Medium)](https://medium.com/@NikandrSurkov/the-tech-stack-i-use-for-building-telegram-mini-apps-and-why-you-should-care-9866281cdf36)
- [Telegram Stars Payment Integration](https://blog.octalabs.com/telegram-stars-payment-integration-in-mini-app-2f1d4d8098be)
- [Building e-commerce TMA (LogRocket)](https://blog.logrocket.com/building-telegram-mini-apps-react/)
- [TMA Development & Testing Specifics](https://dev.to/dev_family/telegram-mini-app-development-and-testing-specifics-from-initialisation-to-launch-1ofh)
