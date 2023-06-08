/* eslint-disable prettier/prettier */
import { Body, Controller, HttpStatus, Post, Res, Req, Get } from '@nestjs/common';
import { UsersService } from 'src/homepage/services/users/users.service';
import { Request, Response } from 'express';
import { varFetchService } from 'src/homepage/services/var_fetch/var_fetch.service';
import { HttpService } from '@nestjs/axios';
import { AuthCode, AuthPair, IntraInfo, TokenInfo } from 'src/homepage/dtos/Api.dto';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { AuthService } from 'src/homepage/services/auth/auth.service';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@Controller('login')
export class LoginController {
	twoFaMap: Map<number, AuthPair>;
	constructor(
		private usersService: UsersService,
		private readonly httpClient: HttpService,
		private readonly itemsService: ItemsService,
		private readonly authService: AuthService,
		private readonly channelsService: ChannelsService,
		private readonly tokenManager: TokenManagerService,
	) {
		this.twoFaMap = new Map<number, AuthPair>();
	}

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

	async buildLoginBody(tokenInfo: TokenInfo, intraInfo: IntraInfo, id: number, created = false) {
		return {
			tokenInfo: tokenInfo,
			intraInfo: intraInfo,
			created: created,
			jwt_token: await this.authService.login(intraInfo, id, tokenInfo.access_token),
			user_id: id,
		}
	}

	@Post('')
	async authFortyTwo(@Res() res: Response, @Body() body: AuthCode) {
		const resToken = await this.authService.getAccessToken(body.api_code);
		if (resToken)
		{
			console.log({TokenInfo: resToken});
			const intraInfo = await this.usersService.fetchIntraInfo(resToken.access_token);
			console.log({ Id: intraInfo.data.id, Login: intraInfo.data.login});
			const user = await this.itemsService.getUserByIntraId(intraInfo.data.id);

			if (user)
			{
				console.log('Logging in');
				console.log({email: intraInfo.data.email});
				if (user.username != intraInfo.data.login)
					intraInfo.data.login = user.username;
				if (user.img_url != intraInfo.data.image.link)
					intraInfo.data.image.link = user.img_url;
				if (!user.double_auth)
					return res.status(HttpStatus.OK).send(await this.buildLoginBody(resToken, intraInfo.data, user.user_id));
				const TwoFASecret = this.authService.generateSec()
				this.twoFaMap.set(user.user_id, { secret: TwoFASecret, intra_token: resToken});
				this.authService.createMail(this.authService.generateCode(TwoFASecret), intraInfo.data);
				console.log('Sending: user_id:' + user.user_id);
				res.status(HttpStatus.ACCEPTED).send({user_id: user.user_id});
			}
			else
			{
				console.log('Signing in');
				if (intraInfo.data.login.length > 20)
					intraInfo.data.login = intraInfo.data.login.substring(0, 20);
				if (intraInfo.data.image.link.length > 350)
					intraInfo.data.image.link = '';
				if (intraInfo.data.login == 'tmoragli')
					intraInfo.data.image.link = 'https://media.tenor.com/_eKN0xjdXNQAAAAd/zenitsu-agatsuma.gif';
				const user = await this.usersService.createUser(intraInfo.data);
				res.status(HttpStatus.CREATED).send(await this.buildLoginBody(resToken, intraInfo.data, user.user_id));
			}
		}
		else
			res.status(HttpStatus.UNAUTHORIZED).send('No token received');
	}

	@Get('tokenCheck')
	async tokenCheck(@Req() req: Request, @Res()res: Response)
	{
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		res.status(HttpStatus.OK).send('OK');
	}

	@Get('getUID')
	async sendUid(@Res() res: Response)
	{
		const uid = varFetchService.getAPIKeys();
		if (uid)
			return res.status(HttpStatus.OK).send(uid.u_key);
		res.status(HttpStatus.OK).send(uid);
	}

	@Post('callback')
	async callback2FA(@Res() res: Response, @Body() body: AuthCode) {
		const twoFA = this.twoFaMap.get(Number(body.id));

		if (!twoFA || !this.authService.verifyCode(twoFA.secret, body.mail_code))
			return res.status(HttpStatus.UNAUTHORIZED).send('Wrong code');
		const intraInfo = await this.usersService.fetchIntraInfo(twoFA.intra_token.access_token);
		res.status(HttpStatus.OK).send(await this.buildLoginBody(twoFA.intra_token, intraInfo.data, Number(body.id)));
		this.twoFaMap.delete(Number(body.id));
	}

	@Get('toggleDoubleAuth')
	async toggleDoubleAuth(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!(await this.itemsService.toggleDoubleAuth(user.sub)))
			return res.status(HttpStatus.BAD_REQUEST).send('Error');
		return res.status(HttpStatus.ACCEPTED).send('Success');
	}
}
