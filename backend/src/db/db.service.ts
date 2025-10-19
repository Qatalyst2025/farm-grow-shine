import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private client = postgres(process.env.DATABASE_URL!);
  public db = drizzle(this.client, { schema });

  onModuleInit() {
    console.log('✅ Database connected successfully.');
  }

  async onModuleDestroy() {
    await this.client.end();
    console.log('❌ Database connection closed.');
  }
}
