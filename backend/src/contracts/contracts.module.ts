import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
  
})
export class ContractsModule {}
