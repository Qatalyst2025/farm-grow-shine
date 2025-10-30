import { Injectable, Logger } from '@nestjs/common';
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  PrivateKey,
} from '@hashgraph/sdk';
import * as dotenv from 'dotenv';
dotenv.config();

interface NFTMetadata {
  name: string;
  type: string;
  expectedHarvestDate?: string;
  farmerId?: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private client: Client;

  constructor() {
    this.client = Client.forTestnet();
    this.client.setOperator(
      process.env.HEDERA_ACCOUNT_ID!,
      process.env.HEDERA_PRIVATE_KEY!,
    );
  }

  async createCollection(name: string, symbol: string) {
    this.logger.log(`Creating NFT Collection for ${name}...`);
    const supplyKey = PrivateKey.generate();

    const tx = await new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1000)
      .setTreasuryAccountId(process.env.HEDERA_ACCOUNT_ID!)
      .setSupplyKey(supplyKey)
      .freezeWith(this.client)
      .sign(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!));

    const response = await tx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    if (!receipt.tokenId) {
      throw new Error('Token creation failed - no token ID in receipt');
    }

    this.logger.log(`✅ Collection created: ${receipt.tokenId.toString()}`);

    return {
      tokenId: receipt.tokenId.toString(),
      supplyKey: supplyKey.toString(),
    };
  }

  async mintNFT(tokenId: string, metadata: NFTMetadata, supplyKey: string) {
  try {
    const minimalMetadata = {
      name: metadata.name.substring(0, 20),
      type: metadata.type,
    };
    
    const metaString = JSON.stringify(minimalMetadata);
    
    console.log(`🔍 Metadata size: ${Buffer.from(metaString).length} bytes`);
    console.log(`🔍 Token ID: ${tokenId}`);
    
    const tx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .addMetadata(Buffer.from(metaString))
      .freezeWith(this.client);

    const signTx = await tx.sign(PrivateKey.fromString(supplyKey));
    
    const response = await signTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    
    console.log(`🔍 Receipt status: ${receipt.status.toString()}`);
    console.log(`🔍 Receipt serials:`, receipt.serials);
    
    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`NFT minting failed - receipt status: ${receipt.status.toString()}`);
    }
    
    const serials = receipt.serials;
    const serialNumber = serials.length > 0 ? serials[0].toInt() : null;

    if (serialNumber === null) {
      throw new Error('NFT minting failed - no serial number in receipt');
    }

    this.logger.log(`🌿 NFT Minted: ${tokenId} (Serial #${serialNumber})`);
    return serialNumber;
  } catch (error) {
    console.error('❌ NFT minting error details:', error);
    throw error;
  }
}
}
