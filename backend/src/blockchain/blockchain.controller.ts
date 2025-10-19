import { Controller, Get } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { DbService } from '../db/db.service';
import { users } from '../db/schema'; // Import the schema directly

@Controller('blockchain')
export class BlockchainController {
  constructor(
    private blockchainService: BlockchainService,
    private db: DbService
  ) {}

  @Get('status')
  async getStatus() {
    return this.blockchainService.getBalance();
  }
  
  @Get('test')
  async test() {
    // Correct way: use the imported schema
    const allUsers = await this.db.db.select().from(users);
    return allUsers;
  }
}
