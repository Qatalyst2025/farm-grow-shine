import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardInsightsService } from './dashboard.insights.service';
import { DashboardInsightsController } from './dashboard.insights.controller';
import { DbModule } from '../db/db.module';
import { BuyerDashboardModule } from '../buyer-dashboard/buyer-dashboard.module';

@Module({
  imports: [DbModule],
  controllers: [DashboardController, DashboardInsightsController],
  providers: [DashboardService, DashboardInsightsService],
  exports: [DashboardService],
})
export class DashboardModule {}
