import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { Role } from "../enums/role.enum.js";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletAddress: varchar("wallet_address", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  role: text("role").default(Role.FARMER),
});

