import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { crops } from '../db/schema';
import { eq, sql, and, isNotNull, gte } from 'drizzle-orm';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DbService) {}

  async getFarmerDashboard(farmerId: string) {
    // ✅ Fix 1: Use proper where chaining
    const totalCrops = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(crops)
      .where(eq(crops.farmerId, farmerId))
      .then((res) => Number(res[0].count));

    // ✅ Fix 2: Use and() for multiple conditions
    const tokenizedCrops = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(crops)
      .where(
        and(
          eq(crops.farmerId, farmerId),
          isNotNull(crops.tokenId)
        )
      )
      .then((res) => Number(res[0].count));

    // ✅ Fix 3: Handle null stages properly
    const cropsByStage = await this.db.db
      .select({
        stage: crops.stage,
        count: sql<number>`count(*)`,
      })
      .from(crops)
      .where(eq(crops.farmerId, farmerId))
      .groupBy(crops.stage);

    // ✅ Fix 4: Handle null stage values safely
    const stageData = cropsByStage.reduce((acc, row) => {
      const stage = row.stage || 'Unknown'; // Handle null stages
      acc[stage] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      farmerId,
      totalCrops,
      tokenizedCrops,
      cropsByStage: stageData,
    };
  }
  
  async getMarketCrops(type?: string, minProgress: number = 20) {
    const whereConditions: any[] = [
      eq(crops.onChainVerified, true),
      gte(crops.progress, minProgress)
    ];

    if (type) {
      whereConditions.push(eq(crops.type, type));
    }

    return this.db.db.query.crops.findMany({
      where: and(...whereConditions),
      with: {
        farmer: true,
      },
    });
  }

  async getCropDetails(cropId: string) {
    return this.db.db.query.crops.findFirst({
      where: eq(crops.id, cropId),
      with: {
        farmer: true,
      },
    });
  }
}
