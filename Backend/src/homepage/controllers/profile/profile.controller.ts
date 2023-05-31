/* eslint-disable prettier/prettier */
import { Controller, Get, HttpStatus, Param, Post, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { UsersService } from 'src/homepage/services/users/users.service';
import { plainToClass } from 'class-transformer';
import { ApplySkins, MyProfileUser } from 'src/homepage/dtos/User.dto';
import { AnyProfileUser } from 'src/homepage/dtos/User.dto';
import { AchievementList } from 'src/homepage/dtos/Achievement.dto';

@Controller('profile')
export class ProfileController {
	constructor(
		private itemsService: ItemsService,
		private tokenManager: TokenManagerService,
		private usersService: UsersService
	) {}

	@Post('applySkins')
	async applySkins(@Req() req: Request, @Res() res: Response, @Body() body: ApplySkins) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !(await this.itemsService.applySelectedSkins(user.sub, body)))
			return res.status(HttpStatus.BAD_REQUEST).send('Something went wrong');
		return res.status(HttpStatus.ACCEPTED).send('Success');
	}

	@Post('changeName')
	async changeUsername(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: { username: string }
	) {
		const currentUser = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!currentUser) return;
		if (!body || !body.username || body.username.length > 20)
			return res.status(HttpStatus.UNAUTHORIZED).send('Name too long');
		const checkUser = await this.itemsService.getUserByUsername(body.username);

		if (checkUser && checkUser.user_id == currentUser.sub)
			return res.status(HttpStatus.NOT_MODIFIED).send('This is already your username');
		if (checkUser && checkUser.user_id != currentUser.sub)
			return res
				.status(HttpStatus.UNAUTHORIZED)
				.send('Trying to change someone elses username ?');
		this.usersService.changeUserName(body.username, currentUser.sub);
		return res.status(HttpStatus.ACCEPTED).send('Username changed');
	}

	@Post('changeImg')
	async changeImg(@Req() req: Request, @Res() res: Response, @Body() body: { img_url: string }) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !body.img_url || body.img_url.length > 350) return res.status(HttpStatus.UNAUTHORIZED).send('Error no body or url too long');
		if (await this.itemsService.changeImgUser(user.sub, body.img_url))
			return res.status(HttpStatus.ACCEPTED).send('Success');
		return res.status(HttpStatus.NOT_MODIFIED);
	}

	@Post('changeChannelInviteAuth')
	async changeChanInvAuth(@Req() req: Request, @Res() res: Response, @Body() body: { newSetting: number }) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body) return res.status(HttpStatus.UNAUTHORIZED).send('No body or parameters provided');
		const userEntity = await this.itemsService.getUser(user.sub);
		const newSetting = body.newSetting;

		if (!userEntity || newSetting < 0 || newSetting > 2)
			return res.status(HttpStatus.UNAUTHORIZED).send('Not saved');
		userEntity.channelInviteAuth = newSetting;
		if (await this.itemsService.saveUserState(userEntity))
			return res.status(HttpStatus.OK).send('Success');
		return res.status(HttpStatus.UNAUTHORIZED).send('Not saved');
	}

	@Get(':username')
	async getProfile(@Param('username') us: string, @Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const targetUser = await this.itemsService.getUserByUsername(us);
		const achievements = targetUser.achievement;
		const allAchievements = await this.itemsService.getAllAchievements();
		let serializedUser: MyProfileUser | AnyProfileUser;

		if (targetUser && user.name === targetUser.username)
			serializedUser = plainToClass(MyProfileUser, targetUser);
		else if (targetUser) serializedUser = plainToClass(AnyProfileUser, targetUser);
		else return res.status(HttpStatus.NOT_FOUND).send(null);
		serializedUser.achievements = new AchievementList();
		serializedUser.achievements.unlockedAchievements = achievements;
		serializedUser.achievements.lockedAchievements = this.itemsService.getLockedAchievements(targetUser, allAchievements);
		//serializedUser.match_history.forEach((match) => console.log(match));
		res.status(HttpStatus.OK).send(serializedUser);
	}
}
