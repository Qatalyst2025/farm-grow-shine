import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import postgres from 'postgres';
import * as schema from './schema';
export declare class DbService implements OnModuleInit, OnModuleDestroy {
    private client;
    db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
        $client: postgres.Sql<{}>;
    };
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
}
