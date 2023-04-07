import { Test, TestingModule } from '@nestjs/testing';
import { MatchsService } from './matchs.service';

describe('MatchsService', () => {
  let service: MatchsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchsService],
    }).compile();

    service = module.get<MatchsService>(MatchsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
