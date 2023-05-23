import { Controller, Get, HttpStatus, Options, Req, Res } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { LeaderBoardUser } from 'src/homepage/dtos/User.dto';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@Controller('leaderboard')
export class LeaderboardController {
	constructor(private serv: ItemsService, private tokenManager: TokenManagerService) {}

	@Get('')
	public async getLeaderboard(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const userList = await this.serv.getLeaderboard();
		if (!userList) return res.status(HttpStatus.NOT_FOUND).send('No users in leaderboard yet');
		const leaderboard = userList.map((user) => plainToClass(LeaderBoardUser, user));
		return res.status(HttpStatus.ACCEPTED).send(leaderboard);
	}
}
