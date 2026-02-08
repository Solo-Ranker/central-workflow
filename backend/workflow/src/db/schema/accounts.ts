import { pgTable, uuid, varchar, timestamp, decimal } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  accountNumber: varchar('account_number', { length: 50 }).notNull().unique(),
  accountType: varchar('account_type', { length: 50 }).notNull(), // savings, checking, etc.
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
