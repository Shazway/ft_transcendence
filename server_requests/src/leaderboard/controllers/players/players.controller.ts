import { Controller, Get } from '@nestjs/common';

@Controller('players')
export class PlayersController {
	@Get()
	getUsers() {
		return { username: 'Telli', rank: '1' };
	}
}
