import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  decimal,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'fulfilled',
  'failed',
  'refunded',
]);

export const regionEnum = pgEnum('region', ['TR', 'US', 'KZ']);

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  telegramId: varchar('telegram_id', { length: 32 }).unique().notNull(),
  firstName: varchar('first_name', { length: 128 }),
  lastName: varchar('last_name', { length: 128 }),
  username: varchar('username', { length: 128 }),
  languageCode: varchar('language_code', { length: 8 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

// Products (gift cards)
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  region: regionEnum('region').notNull(),
  faceValue: integer('face_value').notNull(), // e.g. 100, 250, 500 (in local currency)
  faceCurrency: varchar('face_currency', { length: 3 }).notNull(), // TRY, USD, KZT
  priceRub: decimal('price_rub', { precision: 10, scale: 2 }).notNull(), // price in RUB
  supplier: varchar('supplier', { length: 32 }).notNull(), // turgame, reloadly, wupex
  supplierSku: varchar('supplier_sku', { length: 128 }), // supplier's product ID
  inStock: boolean('in_stock').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

// Orders
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  yookassaPaymentId: varchar('yookassa_payment_id', { length: 128 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// Order items
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id)
    .notNull(),
  quantity: integer('quantity').default(1).notNull(),
  priceAtPurchase: decimal('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
  giftCode: text('gift_code'), // the actual gift card code
  fulfilledAt: timestamp('fulfilled_at'),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
