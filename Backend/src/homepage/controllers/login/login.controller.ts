/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { UsersService } from 'src/homepage/services/users/users.service';
import { Request, Response } from 'express';
import { VarFetchService, varFetchService } from 'src/homepage/services/var_fetch/var_fetch.service';
import { HttpService } from '@nestjs/axios';
import { ApiDto, AuthCode, IntraInfo, TokenInfo } from 'src/homepage/dtos/ApiDto.dto';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { AuthService } from 'src/homepage/services/auth/auth.service';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';

@Controller('login')
export class LoginController {
	constructor(
		private usersService: UsersService,
		private readonly httpClient: HttpService,
		private readonly itemsService: ItemsService,
		private readonly authService: AuthService,
		private readonly channelsService: ChannelsService,
	) {}

	getTokenBody(code: string) {
		const authWorker = varFetchService.getAPIKeys();
		return {
			grant_type: 'authorization_code',
			client_id: authWorker.u_key,
			client_secret: authWorker.s_key,
			code: code,
			redirect_uri: 'http://localhost:4200/auth'
		};
	}

	async buildLoginBody(tokenInfo: TokenInfo, intraInfo: IntraInfo, id: number,created: boolean = false) {
		return {
			tokenInfo: tokenInfo,
			intraInfo: intraInfo,
			created: created,
			jwt_token: await this.authService.login(intraInfo, id),
			user_id: id,
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
			console.log({ Id: intraInfo.data.id, Login: intraInfo.data.login});
			const user = await this.itemsService.getUserByIntraId(intraInfo.data.id);

			if (user)
			{
				console.log('User logging in');
				if (!await this.channelsService.isUserMember(user.user_id, 1))
					await this.channelsService.addUserToChannel(user.user_id, 1);
				res.status(HttpStatus.ACCEPTED).send(await this.buildLoginBody(resToken.data, intraInfo.data, user.user_id));
			}
			else
			{
				console.log('User signing in');
				const user = await this.usersService.createUser(intraInfo.data);
				await this.channelsService.addUserToChannel(user.user_id, 1);
				res.status(HttpStatus.CREATED).send(this.buildLoginBody(resToken.data, intraInfo.data, user.user_id));
			}
		}
		else
			res.status(HttpStatus.UNAUTHORIZED).send('No token recieved');
	}
}
