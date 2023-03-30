import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserEntity } from 'src/entities';
import { ItemsService } from 'src/homepage/services/items/items.service';

@Controller('leaderboard')
export class LeaderboardController {
	constructor(private serv: ItemsService) {}
	userList = new Array<UserEntity>();
	@Get('')
	public async getLeaderboard(@Req() req: Request, @Res() res: Response) {
		const repo = this.serv.getAllUsers();

		for (const val of await repo) {
			this.userList.push(val);
		}
		this.userList.sort((a, b) => a.rank_score - b.rank_score);
		res.status(HttpStatus.ACCEPTED).send(this.userList);
		for (const val of await repo) {
			this.userList.pop();
		}
	}
}
