import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull(),
  txHash: varchar('tx_hash', { length: 255 }).notNull(),
  type: text('type').notNull(),
  status: varchar('status', { length: 100 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});
