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

export enum Role {
  FARMER = 'farmer',
  BUYER = 'buyer',
  VIEWER = 'viewer'
}

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  password: varchar('password', { length: 255 }),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  role: text('role').default(Role.FARMER),
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
  tokenId: varchar('token_id'),
  tokenSerial: integer('token_serial'),
});

export const cropsRelations = relations(crops, ({ one }) => ({
  farmer: one(users, { fields: [crops.farmerId], references: [users.id] }),
}));

export const cropGrowthLogs = pgTable("crop_growth_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  cropId: uuid("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  progress: integer("progress").notNull(),
  health: text("health").notNull(),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const plantingRecommendations = pgTable('planting_recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  cropId: uuid('crop_id')
    .notNull()
    .references(() => crops.id, { onDelete: 'cascade' }),
  recommendation: text('recommendation').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const plantingRecommendationsRelations = relations(
  plantingRecommendations,
  ({ one }) => ({
    crop: one(crops, { fields: [plantingRecommendations.cropId], references: [crops.id] }),
  })
);

export const cropPhotos = pgTable("crop_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  cropId: uuid("crop_id")
    .references(() => crops.id)
    .notNull(),
  url: text("url").notNull(),
  milestone: text("milestone"),
  verified: boolean("verified").default(false),
  aiHealthScore: text("ai_health_score"),
  aiStage: text("ai_stage"),
  aiConfidence: text("ai_confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

