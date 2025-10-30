import { Controller, Post } from '@nestjs/common';
import { MirrorListenerService } from './mirror-listener.service';

@Controller('mirror-listener')
export class MirrorListenerController {
  constructor(private readonly mirrorListenerService: MirrorListenerService) {}
  @Post('create-topic')
  async createTopic() {
    const topicId = await this.mirrorListenerService.createTopic();
    return { topicId, message: 'Add CROP_TOPIC_ID=' + topicId + ' to your .env file' };
  }
}
