import { BlockchainService } from './blockchain.service';
import { DbService } from '../db/db.service';
export declare class BlockchainController {
    private blockchainService;
    private db;
    constructor(blockchainService: BlockchainService, db: DbService);
    getStatus(): Promise<string>;
    test(): Promise<{
        id: number;
        walletAddress: string;
        createdAt: Date | null;
    }[]>;
}
