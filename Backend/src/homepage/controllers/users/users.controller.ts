/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Req,
	Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../../services/users/users.service';
import { NewUserDto } from '../../dtos/UserDto.dto';
import { AuthService } from 'src/homepage/services/auth/auth.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { plainToClass } from 'class-transformer';
import { AnyProfileUserDto } from 'src/homepage/dtos/UserDto.dto';

@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		private authService: AuthService,
		private itemsService: ItemsService,
		private tokenManager: TokenManagerService,
	) {}
	@Get('')
	async getUsers(@Req() req: Request, @Res() res: Response) {
		const userList = await this.usersService.getAllUsers();
		if (!userList)
			res.status(HttpStatus.NO_CONTENT).send({ msg: 'No users registered' });
		const serializedUsers = userList.map((user) => plainToClass(AnyProfileUserDto, user));
		res.status(HttpStatus.FOUND).send(serializedUsers);
	}

	@Post('create')
	async createCustomer(
		@Req() req: Request,
		@Res() res: Response,
		@Body() newUserDto: NewUserDto,
	) {
		const userEntity = await this.usersService.createUser(newUserDto);
		console.log(newUserDto);
		res.status(HttpStatus.OK).send({
			msg: 'User created',
			token: await this.authService.login(userEntity),
		});
	}

	@Get('add_achievement')
	async addAchievement(@Req() req: Request, @Res() res: Response) {
		console.log('pass1');
		const user_id = await this.tokenManager.getIdFromToken(req);
		this.itemsService.addAchievementsToUser(user_id, 1);
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
		this.itemsService.addFriendToUser(user_id, friend_id);
		res.status(HttpStatus.OK).send('Friend added');
	}

	@Get(':username')
	async getUser(@Req() req: Request, @Res() res: Response) {
		const user = await this.itemsService.getUser(
			this.tokenManager.getIdFromToken(req),
		);
		if (user) res.send(user);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found' });
	}
}
