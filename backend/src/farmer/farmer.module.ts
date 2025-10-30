import { Module } from '@nestjs/common';
import { FarmerService } from './farmer.service';
import { FarmerController } from './farmer.controller';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  providers: [FarmerService],
  controllers: [FarmerController]
})
export class FarmerModule {}
