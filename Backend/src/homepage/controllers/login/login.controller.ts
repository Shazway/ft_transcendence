/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { UsersService } from 'src/homepage/services/users/users.service';
import { Request, Response } from 'express';
import { VarFetchService, varFetchService } from 'src/homepage/services/var_fetch/var_fetch.service';
import { HttpService } from '@nestjs/axios';
import { ApiDto, AuthCode, IntraInfo, TokenInfo } from 'src/homepage/dtos/ApiDto.dto';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { AuthService } from 'src/homepage/services/auth/auth.service';

@Controller('login')
export class LoginController {
	constructor(
		private usersService: UsersService,
		private readonly httpClient: HttpService,
		private readonly itemsService: ItemsService,
		private readonly authService: AuthService,
	) {}

	getTokenBody(code: string) {
		const authWorker = varFetchService.getAPIKeys();
		return {
			grant_type: 'client_credentials',
			client_id: authWorker.u_key,
			client_secret: authWorker.s_key,
			code: code,
			redirect_uri: 'http://localhost:4200/auth'
		};
	}

	buildLoginBody(tokenInfo: TokenInfo, intraInfo: IntraInfo, created: boolean = false) {
		return {
			tokenInfo: tokenInfo,
			intraInfo: intraInfo,
			created: created,
			jwt_token: this.authService.login(intraInfo),
		}
	}

	@Post('')
	async authFortyTwo(@Res() res: Response, @Body() body: AuthCode) {
		const resToken = await this.httpClient
			.post<TokenInfo>('https://api.intra.42.fr/oauth/token', this.getTokenBody(body.code))
			.toPromise();
		if (resToken)
		{
			console.log(resToken.data);
			const intraInfo = await this.usersService.fetcIntraInfo(resToken.data.access_token);
			console.log(intraInfo.data);
			const user = this.itemsService.getUserByIntraId(intraInfo.data.id);

			if (user)
				res.status(HttpStatus.ACCEPTED).send(this.buildLoginBody(resToken.data, intraInfo.data));
			else
			{
				this.usersService.createUser(intraInfo.data);
				res.status(HttpStatus.CREATED).send(this.buildLoginBody(resToken.data, intraInfo.data));
			}
		}
		else
			res.status(HttpStatus.UNAUTHORIZED).send('No token recieved');
	}
}
