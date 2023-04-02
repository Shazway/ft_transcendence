import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { ItemsService } from 'src/homepage/services/items/items.service';

@Controller('profile')
export class ProfileController {
	constructor(
		private itemService: ItemsService,
		private tokenManager: TokenManagerService,
	) {}

	@Get('')
	// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
	getProfile(@Req() req: Request, @Res() res: Response) {}

	@Get('achievements')
	async getAchievement(@Req() req: Request, @Res() res: Response) {
		const user_token = this.tokenManager.extractTokenFromHeader(req);
		const user_id = this.tokenManager.getUsernameFromToken(user_token);
		// eslint-disable-next-line prettier/prettier
		const achievements = await this.itemService.getAchievementsFromUser(user_id);
		console.log(achievements);
		// const userList = this.itemService.getAchievementsFromUser();
		if (achievements) res.send(achievements);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found!' });
	}
}
