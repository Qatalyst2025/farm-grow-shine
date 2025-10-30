import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CropAnalyticsService } from "./crop-analytics.service";

@Controller("crops/analytics")
export class CropAnalyticsController {
  constructor(private readonly analyticsService: CropAnalyticsService) {}

  @Post(":id/log")
  async logGrowth(@Param("id") id: string, @Body() body: any) {
    return this.analyticsService.logGrowth(id, body);
  }

  @Get(":id")
  async getCropAnalytics(@Param("id") id: string) {
    return this.analyticsService.getCropAnalytics(id);
  }
}
