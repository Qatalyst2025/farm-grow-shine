import { Module } from "@nestjs/common";
import { CropAnalyticsService } from "./crop-analytics.service";
import { CropAnalyticsController } from "./crop-analytics.controller";
import { ContractsModule } from '../contracts/contracts.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, ContractsModule],
  controllers: [CropAnalyticsController],
  providers: [CropAnalyticsService],
  exports: [CropAnalyticsService],
})
export class CropAnalyticsModule {}
