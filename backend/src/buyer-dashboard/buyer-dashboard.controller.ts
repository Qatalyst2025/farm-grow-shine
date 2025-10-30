import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('buyer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BUYER')
export class BuyerDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('market')
  getMarketCrops(
    @Query('type') type?: string,
    @Query('minProgress') minProgress?: number
  ) {
    return this.dashboardService.getMarketCrops(type, minProgress);
  }

  @Get('crop/:cropId')
  getCropDetails(@Param('cropId') cropId: string) {
    return this.dashboardService.getCropDetails(cropId);
  }
}

