import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class BuyerService {
  constructor(private db: DbService) {}

  create(dto: any) {
    return this.db.db
      .insert(users)
      .values({
        ...dto,
        role: 'BUYER'
      })
      .returning();
  }

  findOne(userId: string) {
    return this.db.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
  }

  update(userId: string, dto: any) {
    return this.db.db
      .update(users)
      .set(dto)
      .where(eq(users.id, userId))
      .returning();
  }

  remove(userId: string) {
    return this.db.db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
  }
}
