"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactions = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    walletAddress: (0, pg_core_1.varchar)('wallet_address', { length: 255 }).notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.transactions = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.serial)('user_id').notNull(),
    txHash: (0, pg_core_1.varchar)('tx_hash', { length: 255 }).notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 100 }).default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
//# sourceMappingURL=schema.js.map