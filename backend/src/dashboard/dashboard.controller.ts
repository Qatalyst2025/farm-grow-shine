import { Controller, Get, Param, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('farmer/:farmerId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Param('farmerId') farmerId: string) {
    return this.dashboardService.getFarmerDashboard(farmerId);
  }

  @Get('/market')
  async getMarketCrops(
    @Query('type') type?: string,
    @Query('minProgress') minProgress?: number,
  ) {
    return this.dashboardService.getMarketCrops(type, minProgress);
  }

  @Get('/crop/:id')
  async getCropDetails(@Param('id') id: string) {
    return this.dashboardService.getCropDetails(id);
  }
}

