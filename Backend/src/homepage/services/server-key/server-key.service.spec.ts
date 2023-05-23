import { Test, TestingModule } from '@nestjs/testing';
import { ServerKeyService } from './server-key.service';

describe('ServerKeyService', () => {
  let service: ServerKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServerKeyService],
    }).compile();

    service = module.get<ServerKeyService>(ServerKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
