import { Test, TestingModule } from '@nestjs/testing';
import { DematService } from './demat.service';

describe('DematService', () => {
  let service: DematService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DematService],
    }).compile();

    service = module.get<DematService>(DematService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
