/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Req,
	Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../../services/users/users.service';
import { CreateUserDto, NewUserDto } from '../../dtos/CreateUser.dto';
import { AuthService } from 'src/homepage/services/auth/auth.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		private authService: AuthService,
		private itemsService: ItemsService,
		private tokenManager: TokenManagerService,
	) {}
	@Get('')
	getUsers(@Req() req: Request, @Res() res: Response) {
		const userList = this.usersService.getAllUsers();
		if (userList) res.send(userList);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found!' });
	}

	@Get(':username')
	async getUser(@Req() req: Request, @Res() res: Response) {
		const user = await this.itemsService.getUser(
			this.tokenManager.getIdFromToken(req),
		);
		if (user) res.send(user);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found' });
	}

	@Post('create')
	async createCustomer(
		@Req() req: Request,
		@Res() res: Response,
		@Body() newUserDto: NewUserDto,
	) {
		console.log(req);
		const userEntity = await this.usersService.createUserNew(newUserDto);
		console.log(newUserDto);
		res.status(HttpStatus.OK).send({
			msg: 'User created',
			token: await this.authService.login(userEntity),
		});
	}

	//Might be useful later ?
	@Post('delete')
	deleteUser(
		@Req() req: Request,
		@Res() res: Response,
		@Body() us: CreateUserDto,
	) {
		console.log(CreateUserDto);
		if (this.usersService.deleteUser(us))
			res.status(HttpStatus.ACCEPTED).send('User deleted');
		else res.status(HttpStatus.NOT_FOUND).send('User not found');
	}
}
