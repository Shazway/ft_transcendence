import { Controller, Get, HttpStatus, Param, Post, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { UsersService } from 'src/homepage/services/users/users.service';
import { plainToClass } from 'class-transformer';
import { ApplyProfile, MyProfileUser } from 'src/homepage/dtos/User.dto';
import { AnyProfileUser } from 'src/homepage/dtos/User.dto';

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
		let serializedUser: MyProfileUser | AnyProfileUser;

		if (user && targetUser && user.name === targetUser.username)
			serializedUser = plainToClass(MyProfileUser, targetUser);
		else if (user && targetUser) serializedUser = plainToClass(AnyProfileUser, targetUser);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found' });
		if (user) res.status(HttpStatus.OK).send(serializedUser);
		console.log(serializedUser);
	}
}
