import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { LeaderBoardUser } from 'src/homepage/dtos/UserDto.dto';
import { ItemsService } from 'src/homepage/services/items/items.service';

@Controller('leaderboard')
export class LeaderboardController {
	constructor(private serv: ItemsService) {}
	@Get('')
	public async getLeaderboard(@Req() req: Request, @Res() res: Response) {
		const userList = await this.serv.getLeaderboard();
		const leaderboard = userList.map((user) =>
			plainToClass(LeaderBoardUser, user),
		);
		res.status(HttpStatus.ACCEPTED).send(leaderboard);
	}
}
