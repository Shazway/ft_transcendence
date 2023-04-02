import { Test, TestingModule } from '@nestjs/testing';
import { TokenManagerService } from './token-manager.service';

describe('TokenManagerService', () => {
  let service: TokenManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenManagerService],
    }).compile();

    service = module.get<TokenManagerService>(TokenManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
