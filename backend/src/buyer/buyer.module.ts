import { Module } from '@nestjs/common';
import { BuyerService } from './buyer.service';
import { BuyerController } from './buyer.controller';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  providers: [BuyerService],
  controllers: [BuyerController],
})
export class BuyerModule {}
