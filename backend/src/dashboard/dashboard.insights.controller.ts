import { Controller, Get, Param } from '@nestjs/common';
import { DashboardInsightsService } from './dashboard.insights.service';

@Controller('farmer/:farmerId/dashboard/insights')
export class DashboardInsightsController {
  constructor(private readonly service: DashboardInsightsService) {}

  @Get()
  async getInsights(@Param('farmerId') farmerId: string) {
    return this.service.getInsights(farmerId);
  }
}
