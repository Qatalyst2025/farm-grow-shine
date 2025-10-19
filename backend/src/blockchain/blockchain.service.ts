import { Injectable } from '@nestjs/common';
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainService {
  private client: Client;

  constructor(private configService: ConfigService) {
    const accountId = AccountId.fromString(this.configService.get<string>('HEDERA_ACCOUNT_ID')!);
    const privateKey = PrivateKey.fromString(this.configService.get<string>('HEDERA_PRIVATE_KEY')!);

    this.client = Client.forTestnet().setOperator(accountId, privateKey);
  }

  async getBalance(): Promise<string> {
    const accountId = this.configService.get<string>('HEDERA_ACCOUNT_ID');
    return `Connected to Hedera Testnet as ${accountId}`;
  }
}

