import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { crops } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class DashboardInsightsService {
  constructor(private readonly db: DbService) {}

  // 🚀 Average Growth Rate (progress per day)
  async getAverageGrowthRate(farmerId: string) {
    const result = await this.db.db
      .select({
        avgProgress: sql<number>`avg(progress)`
      })
      .from(crops)
      .where(eq(crops.farmerId, farmerId));

    return Number(result[0].avgProgress ?? 0).toFixed(2);
  }

  // 🧠 Expected yield score (simple model)
  async getYieldEstimate(farmerId: string) {
    const result = await this.db.db
      .select({
        yieldScore: sql<number>`avg(progress * 1.5)`
      })
      .from(crops)
      .where(eq(crops.farmerId, farmerId));

    return Number(result[0].yieldScore ?? 0).toFixed(1);
  }

  // 🔍 Health status evaluations
  async getHealthMetrics(farmerId: string) {
    const result = await this.db.db
      .select({
        healthy: sql<number>`count(*) filter (where health = 'Healthy')`,
        warning: sql<number>`count(*) filter (where health = 'Warning')`,
        critical: sql<number>`count(*) filter (where health = 'Critical')`,
      })
      .from(crops)
      .where(eq(crops.farmerId, farmerId));

    return result[0];
  }

  async getInsights(farmerId: string) {
    return {
      averageGrowthRate: await this.getAverageGrowthRate(farmerId),
      yieldScore: await this.getYieldEstimate(farmerId),
      healthMetrics: await this.getHealthMetrics(farmerId),
      generatedAt: new Date(),
    };
  }
}
