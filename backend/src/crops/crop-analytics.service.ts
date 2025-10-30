import { Injectable, NotFoundException } from "@nestjs/common";
import { DbService } from '../db/db.service';
import { ContractsService } from '../contracts/contracts.service';
import { crops } from '../db/schema';
import { cropGrowthLogs } from "../db/schema";
import { eq, desc } from "drizzle-orm";

@Injectable()
export class CropAnalyticsService {

  constructor(
    private readonly db: DbService,
    private readonly hederaService: ContractsService,
  ) {}

  async logGrowth(cropId: string, data: { stage: string; progress: number; health: string; notes?: string }) {
  // 1️⃣ Verify crop exists
  const [crop] = await this.db.db.select().from(crops).where(eq(crops.id, cropId));
  if (!crop) throw new NotFoundException("Crop not found");

  // 2️⃣ Save off-chain first
  await this.db.db.insert(cropGrowthLogs).values({
    cropId,
    stage: data.stage,
    progress: data.progress,
    health: data.health,
    notes: data.notes,
  });

  // 3️⃣ Sync to Hedera (if crop has contract)
  let onChainTx;
  if (crop.contractId) {
    // Ensure progress is a proper number
    const progressValue = Number(data.progress);
    console.log(`🌱 Calling updateGrowth with:`, {
      progress: progressValue,
      stage: data.stage,
      health: data.health
    });

    onChainTx = await this.hederaService.callContractFunction(
      crop.contractId,
      "updateGrowth",
      [progressValue, data.stage, data.health]
    );
  }

  return {
    message: "Growth log added successfully",
    onChainSynced: !!onChainTx,
    transaction: onChainTx || null,
  };
}
  async getCropAnalytics(cropId: string) {
    const logs = await this.db.db
      .select()
      .from(cropGrowthLogs)
      .where(eq(cropGrowthLogs.cropId, cropId))
      .orderBy(desc(cropGrowthLogs.recordedAt));

    if (!logs.length) return { message: "No logs found for this crop" };

    const latest = logs[0];
    return {
      cropId,
      latestStage: latest.stage,
      progress: latest.progress,
      health: latest.health,
      totalEntries: logs.length,
      logs,
    };
  }
}
