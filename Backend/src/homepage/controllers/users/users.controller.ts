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

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}
	@Get('')
	getUsers(@Req() req: Request, @Res() res: Response) {
		const userList = this.usersService.getAllUsers();
		if (userList) res.send(userList);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found!' });
	}

	@Get(':username')
	getMatchHistory(
		@Param('username') us: string,
		@Req() req: Request,
		@Res() res: Response,
	) {
		const user = this.usersService.findUser(us);
		if (user) res.send(user);
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found' });
	}

	@Post('create')
	createCustomer(
		@Req() req: Request,
		@Res() res: Response,
		@Body() newUserDto: NewUserDto,
	) {
		this.usersService.createUserNew(newUserDto);
		console.log(newUserDto);
		res.status(HttpStatus.OK).send({ msg: 'User created' });
		// if (this.usersService.findUser(createUsersDto.username))
		// 	res.status(HttpStatus.CONFLICT).send({
		// 		msg: 'User already exists',
		// 	});
		// else {
		// 	res.status(HttpStatus.OK).send({ msg: 'User created' });
		// }
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
