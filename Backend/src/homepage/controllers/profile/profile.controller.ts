import { Controller, Get, HttpStatus, Param, Post, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { UsersService } from 'src/homepage/services/users/users.service';
import { plainToClass } from 'class-transformer';
import { ApplyProfile, MyProfileUser } from 'src/homepage/dtos/User.dto';
import { AnyProfileUser } from 'src/homepage/dtos/User.dto';
import { AchievementsEntity } from 'src/entities';
import { AchievementList } from 'src/homepage/dtos/Achievement.dto';

@Controller('profile')
export class ProfileController {
	constructor(
		private itemService: ItemsService,
		private tokenManager: TokenManagerService,
		private userService: UsersService
	) {}

	@Post('applySkins')
	async applySkins(@Req() req: Request, @Res() res: Response, @Body() body: ApplyProfile) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !(await this.itemService.applySelectedSkins(user.sub, body)))
			return res.status(HttpStatus.BAD_REQUEST).send('Something went wrong');
		return res.status(HttpStatus.ACCEPTED).send('Success');
	}

	@Get(':username')
	async getProfile(@Param('username') us: string, @Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const targetUser = await this.itemService.getUserByUsername(us);
		const achievements = targetUser.achievement;
		const allAchievements = await this.itemService.getAllAchievements();
		let serializedUser: MyProfileUser | AnyProfileUser;

		if (targetUser && user.name === targetUser.username)
			serializedUser = plainToClass(MyProfileUser, targetUser);
		else if (targetUser) serializedUser = plainToClass(AnyProfileUser, targetUser);
		else return res.status(HttpStatus.NOT_FOUND).send(null);
		serializedUser.achievements = new AchievementList();
		serializedUser.achievements.unlockedAchievements = achievements;
		serializedUser.achievements.lockedAchievements = this.itemService.getLockedAchievements(targetUser, allAchievements);
		res.status(HttpStatus.OK).send(serializedUser);
	}
}
