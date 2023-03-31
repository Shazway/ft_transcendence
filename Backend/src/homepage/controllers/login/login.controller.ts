import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { UsersService } from 'src/homepage/services/users/users.service';
import { Request, Response } from 'express';

@Controller('login')
export class LoginController {
	constructor(private userService: UsersService) {}

	@Post('login')
	login(): any {
		return {};
	}

	@Get('test')
	validateKey(@Req() req: Request, @Res() res: Response) {
		console.log('Done');
		res.status(HttpStatus.OK).send({ msg: 'ok' });
	}
}
