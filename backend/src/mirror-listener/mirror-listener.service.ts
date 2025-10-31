import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { CropsService } from '../crops/crops.service';
import { TopicCreateTransaction } from '@hashgraph/sdk';
import { getHederaClient } from "../blockchain/hedera.client";

@Injectable()
export class MirrorListenerService implements OnModuleInit {
  private readonly logger = new Logger(MirrorListenerService.name);
  private readonly mirrorUrl = 'https://testnet.mirrornode.hedera.com';
  private lastTimestamp = '0.0';

  constructor(private readonly cropsService: CropsService) {}

  async onModuleInit() {
    this.logger.log('📡 Mirror listener initialized!');
    
    // ✅ Check if topic ID is set
    if (!process.env.CROP_TOPIC_ID) {
      this.logger.warn('⚠️  CROP_TOPIC_ID not set. Creating a new topic...');
      const topicId = await this.createTopic();
      this.logger.log(`✅ Created new topic: ${topicId}. Add CROP_TOPIC_ID=${topicId} to your .env file`);
      process.env.CROP_TOPIC_ID = topicId; // Set it temporarily
    }
    
    this.logger.log(`📡 Listening to topic: ${process.env.CROP_TOPIC_ID}`);
    setInterval(() => this.checkEvents(), 10000); // 10 seconds
  }

  async createTopic(): Promise<string> {
    try {
      const client = getHederaClient(); // Your existing Hedera client
  
      const tx = await new TopicCreateTransaction()
        .setTopicMemo("Crop Analytics Events")
        .execute(client);
        
      const receipt = await tx.getReceipt(client);
      
      if (!receipt.topicId) {
        throw new Error('Topic creation failed - no topic ID in receipt');
      }
      
      const topicId = receipt.topicId.toString();
      this.logger.log(`✅ Created topic: ${topicId}`);
      return topicId;
    } catch (error) {
      this.logger.error(`❌ Failed to create topic: ${error.message}`);
      throw error;
    }
  }

  async checkEvents() {
    try {
      const topicId = process.env.CROP_TOPIC_ID;
      
      // ✅ Validate topic ID format
      if (!topicId || !topicId.match(/^\d+\.\d+\.\d+$/)) {
        this.logger.error(`❌ Invalid topic ID format: ${topicId}`);
        return;
      }

      const url = `${this.mirrorUrl}/api/v1/topics/${topicId}/messages?timestamp=gt:${this.lastTimestamp}`;

      this.logger.log(`🔍 Polling mirror node: ${url}`);
      
      const res = await axios.get(url);
      const messages = res.data.messages;

      if (messages && messages.length > 0) {
        this.logger.log(`📩 Found ${messages.length} new message(s)`);
      }

      for (const msg of messages) {
        this.lastTimestamp = msg.consensus_timestamp;
        
        try {
          const decoded = Buffer.from(msg.message, 'base64').toString();
          const payload = JSON.parse(decoded);

          this.logger.log(`📩 MIRROR EVENT: ${JSON.stringify(payload)}`);

          await this.cropsService.handleChainSync(payload);
        } catch (parseError) {
          this.logger.error(`❌ Failed to parse message: ${parseError.message}`);
        }
      }
    } catch (err) {
      // ✅ Better error logging
      if (err.response) {
        this.logger.error(`❌ Mirror node error: ${err.response.status} - ${err.response.data}`);
      } else {
        this.logger.error(`❌ Mirror poll error: ${err.message}`);
      }
    }
  }
}
