import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ItemsService } from 'src/homepage/services/items/items.service';

@Controller('leaderboard')
export class LeaderboardController {
	constructor(private serv: ItemsService) {}
	@Get('')
	public async getLeaderboard(@Req() req: Request, @Res() res: Response) {
		res.status(HttpStatus.ACCEPTED).send(this.serv.getAllUsers());
	}
}
