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
import { UsersService } from 'src/homepage/services/users/users.service';
import { plainToClass } from 'class-transformer';
import { MyProfileUser } from 'src/homepage/dtos/User.dto';
import { AnyProfileUser } from 'src/homepage/dtos/User.dto';

@Controller('profile')
export class ProfileController {
	constructor(
		private itemService: ItemsService,
		private tokenManager: TokenManagerService,
		private userService: UsersService,
	) {}

	@Get(':username')
	async getProfile(@Param('username') us: string, @Req() req: Request, @Res() res: Response) {
		let serializedUser: MyProfileUser | AnyProfileUser;
		const user = await this.itemService.getUser(this.tokenManager.getIdFromToken(req));

		if (user && user.username === us)
			serializedUser = plainToClass(MyProfileUser, user);
		else if (user) serializedUser = plainToClass(AnyProfileUser, user);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found' });
		if (user) res.status(HttpStatus.OK).send(serializedUser);
	}
}
