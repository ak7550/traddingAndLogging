import { Test, TestingModule } from '@nestjs/testing';
import { DematController } from './demat.controller';
import { DematService } from './demat.service';

describe('DematController', () => {
  let controller: DematController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DematController],
      providers: [DematService],
    }).compile();

    controller = module.get<DematController>(DematController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
