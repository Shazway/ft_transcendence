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
		// const userList = this.itemService.getAchievementsFromUser();
		if (!achievements)
			res.status(HttpStatus.BAD_REQUEST).send({ msg: 'User not found' });
		if (achievements.length === 0)
			res.status(HttpStatus.NOT_FOUND).send({ msg: 'No achievements' });
		else res.status(HttpStatus.OK).send(achievements);
	}
}
