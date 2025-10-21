import { Module } from '@nestjs/common';
import { CropsService } from './crops.service';
import { CropsController } from './crops.controller';
import { DbModule } from '../db/db.module';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [DbModule, ContractsModule],
  providers: [CropsService],
  controllers: [CropsController],
})
export class CropsModule {}
