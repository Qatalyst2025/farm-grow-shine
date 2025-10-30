import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { DbService } from './db/db.service';
import { ContractsModule } from './contracts/contracts.module';
import { CropsModule } from './crops/crops.module';
import { CropAnalyticsModule } from './crops/crop-analytics.module';
import { TokenModule } from './token/token.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { FarmerModule } from './farmer/farmer.module';
import { BuyerModule } from './buyer/buyer.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BuyerDashboardModule } from './buyer-dashboard/buyer-dashboard.module';
import { MirrorListenerModule } from './mirror-listener/mirror-listener.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BlockchainModule,
    ContractsModule,
    CropsModule,
    CropAnalyticsModule,
    TokenModule,
    DashboardModule,
    AuthModule,
    FarmerModule,
    BuyerModule,
    BuyerDashboardModule,
    MirrorListenerModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbService,
    // {
      // provide: APP_GUARD,
      //useClass: JwtAuthGuard,
    //},
    //{
      //provide: APP_GUARD,
      //useClass: RolesGuard,
    //},
  ],
  exports: [DbService],
})
export class AppModule {}
