import {
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Req,
	Res,
} from '@nestjs/common';
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
		const user_id = this.tokenManager.getIdFromToken(req);
		// eslint-disable-next-line prettier/prettier
		const achievements = (await this.itemService.getUser(user_id)).achievement;
		if (!achievements || achievements.length === 0)
			res.status(HttpStatus.NO_CONTENT).send({ msg: 'No achievements' });
		else res.status(HttpStatus.OK).send(achievements);
	}

	@Get('friends')
	async getFriends(@Req() req: Request, @Res() res: Response) {
		const user_id = await this.tokenManager.getIdFromToken(req);
		// eslint-disable-next-line prettier/prettier
		const friends = (await this.itemService.getUser(user_id)).friend;
		if (!friends || friends.length === 0)
			res.status(HttpStatus.NO_CONTENT).send({ msg: 'No friends found' });
		else res.status(HttpStatus.OK).send(friends);
	}

	@Get('add_achievement')
	async addAchievement(@Req() req: Request, @Res() res: Response) {
		const user_id = await this.tokenManager.getIdFromToken(req);

		this.itemService.addAchievementsToUser(user_id, 1);
		res.status(HttpStatus.OK).send('Achievement added');
	}
	@Get('add_friend/:id')
	async addFriend(
		@Param('id', ParseIntPipe) friend_id: number,
		@Req() req: Request,
		@Res() res: Response,
	) {
		const user_id = this.tokenManager.getIdFromToken(req);

		console.log(friend_id);
		this.itemService.addFriendToUser(user_id, friend_id);
		res.status(HttpStatus.OK).send('Friend added');
	}
}
