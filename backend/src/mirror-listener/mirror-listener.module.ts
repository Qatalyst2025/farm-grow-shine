import { Module } from '@nestjs/common';
import { MirrorListenerService } from './mirror-listener.service';
import { MirrorListenerController } from './mirror-listener.controller';
import { CropsModule } from '../crops/crops.module';

@Module({
  imports: [CropsModule],
  providers: [MirrorListenerService],
  controllers: [MirrorListenerController]
})
export class MirrorListenerModule {}
