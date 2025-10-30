import { Module } from '@nestjs/common';
import { CropsService } from './crops.service';
import { CropsController } from './crops.controller';
import { DbModule } from '../db/db.module';
import { TokenModule } from '../token/token.module';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [DbModule, ContractsModule, TokenModule],
  providers: [CropsService],
  controllers: [CropsController],
  exports: [CropsService],
})
export class CropsModule {}
