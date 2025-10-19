import { ConfigService } from '@nestjs/config';
export declare class BlockchainService {
    private configService;
    private client;
    constructor(configService: ConfigService);
    getBalance(): Promise<string>;
}
