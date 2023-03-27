import { Test, TestingModule } from '@nestjs/testing';
import { VarFetchService } from './var_fetch.service';

describe('VarFetchService', () => {
	let service: VarFetchService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [VarFetchService],
		}).compile();

		service = module.get<VarFetchService>(VarFetchService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
