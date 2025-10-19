import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { DbService } from './db/db.service';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BlockchainModule,
    ContractsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbService],
  exports: [DbService],
})
export class AppModule {}
