import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { DbModule } from '../db/db.module'; 

@Module({
  imports: [DbModule],
  providers: [BlockchainService],
  controllers: [BlockchainController],
  exports: [BlockchainService],
})
export class BlockchainModule {}
