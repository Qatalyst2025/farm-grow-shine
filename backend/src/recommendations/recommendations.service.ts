import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { plantingRecommendations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';

@Injectable()
export class RecommendationsService {
  constructor(private readonly drizzle: DbService) {}

  create(dto: CreateRecommendationDto) {
    return this.drizzle.db.insert(plantingRecommendations).values(dto).returning();
  }

  findAll() {
    return this.drizzle.db.select().from(plantingRecommendations);
  }

  findOne(id: string) {
    return this.drizzle.db
      .select()
      .from(plantingRecommendations)
      .where(eq(plantingRecommendations.id, id));
  }

  update(id: string, dto: UpdateRecommendationDto) {
    return this.drizzle.db
      .update(plantingRecommendations)
      .set(dto)
      .where(eq(plantingRecommendations.id, id))
      .returning();
  }

  remove(id: string) {
    return this.drizzle.db
      .delete(plantingRecommendations)
      .where(eq(plantingRecommendations.id, id))
      .returning();
  }
}

