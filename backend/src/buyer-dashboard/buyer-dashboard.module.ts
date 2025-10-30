import { Module } from '@nestjs/common';
import { BuyerDashboardController } from './buyer-dashboard.controller';
import { DbModule } from '../db/db.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [DbModule, DashboardModule],
  controllers: [BuyerDashboardController],
})
export class BuyerDashboardModule {}
