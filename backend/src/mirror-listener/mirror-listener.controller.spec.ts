import { Test, TestingModule } from '@nestjs/testing';
import { MirrorListenerController } from './mirror-listener.controller';

describe('MirrorListenerController', () => {
  let controller: MirrorListenerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MirrorListenerController],
    }).compile();

    controller = module.get<MirrorListenerController>(MirrorListenerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
