import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  serial,
  text,
  boolean,
  timestamp,
  varchar,
  integer,
} from 'drizzle-orm/pg-core';

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

export const crops = pgTable('crops', {
  id: uuid('id').defaultRandom().primaryKey(),
  farmerId: uuid('farmer_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(),
  stage: text('stage').default('Land Preparation'),
  progress: integer('progress').default(10),
  health: text('health').default('Healthy'),
  expectedHarvestDate: timestamp('expected_harvest_date'),
  contractId: text('contract_id'),
  onChainVerified: boolean('on_chain_verified'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cropsRelations = relations(crops, ({ one }) => ({
  farmer: one(users, { fields: [crops.farmerId], references: [users.id] }),
}));
