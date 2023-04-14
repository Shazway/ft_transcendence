/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { UsersService } from 'src/homepage/services/users/users.service';
import { Request, Response } from 'express';
import { VarFetchService, varFetchService } from 'src/homepage/services/var_fetch/var_fetch.service';
import { HttpService } from '@nestjs/axios';
import { ApiDto, AuthCode, TokenDto } from 'src/homepage/dtos/ApiDto.dto';
import { AxiosResponse } from 'axios';
import * as querystring from 'querystring';

@Controller('login')
export class LoginController {
	constructor(
		private userService: UsersService,
		private readonly httpClient: HttpService,
	) {}

	@Post('')
	async authFortyTwo(@Req() req: Request, @Res() res: Response, @Body() body: AuthCode) {
		const authWorker = varFetchService.getAPIKeys();
		const requestBody = {
			grant_type: 'client_credentials',
			client_id: authWorker.u_key,
			client_secret: authWorker.s_key,
		  };
		  const response = await this.httpClient
			.post<TokenDto>('https://api.intra.42.fr/oauth/token', requestBody)
			.toPromise();
		if (response)
		{
			console.log(response.data);
			res.status(response.status).send(response.data);
		}
		else
			res.status(HttpStatus.FORBIDDEN).send('Token GONE');
	}

	@Get('test')
	validateKey(@Req() req: Request, @Res() res: Response) {
		console.log('Done');
		res.status(HttpStatus.OK).send({ msg: 'ok' });
	}
}
