import { Test, TestingModule } from '@nestjs/testing';
import { MirrorListenerService } from './mirror-listener.service';

describe('MirrorListenerService', () => {
  let service: MirrorListenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MirrorListenerService],
    }).compile();

    service = module.get<MirrorListenerService>(MirrorListenerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
