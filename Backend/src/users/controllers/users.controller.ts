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
import { UsersService } from 'src/users/service/users/users.service';
import { CreateUserDto } from 'src/users/controllers/dtos/CreateUser.dto';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}
	@Get('')
	getUsers(@Req() req: Request, @Res() res: Response) {
		const userList = this.usersService.getAllUsers();
		if (userList) res.send(userList);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found!' });
	}

	@Get('posts')
	getUsersPosts() {
		return this.usersService.findUser('tmoragli');
	}

	@Get(':username')
	getMatchHistory(
		@Param('username') us: string,
		@Req() req: Request,
		@Res() res: Response,
	) {
		const user = this.usersService.findUser(us);
		if (user) res.send(user);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found!' });
	}

	@Post('create')
	createCustomer(@Req() req: Request, @Body() createUsersDto: CreateUserDto) {
		console.log(createUsersDto);
		this.usersService.createUser(createUsersDto);
	}
}
