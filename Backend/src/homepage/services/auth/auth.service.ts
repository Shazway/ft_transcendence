/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IntraInfo, TokenInfo } from 'src/homepage/dtos/Api.dto';
import { varFetchService } from '../var_fetch/var_fetch.service';
import { totp } from 'notp';
import { authenticator } from 'otplib';
import axios from 'axios';
import { ServerKeyService } from '../server-key/server-key.service';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService, private keyService: ServerKeyService) {}

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

	async getAccessToken(code: string) {
		let resToken: TokenInfo;
		await axios
			.post<TokenInfo>('https://api.intra.42.fr/oauth/token', this.getTokenBody(code))
			.then(function (response) {
				resToken = response.data;
			})
			.catch(function (error) {});
		return resToken;
	}

	async login(user: IntraInfo, user_id: number) {
		const payload = {
			name: user.login,
			sub: user_id,
			key: this.keyService.getKey()
		};
		return this.jwtService.sign(payload);
	}

	createMail(code: string = null, user: IntraInfo) {
		const mailgun = require('mailgun-js');
		const keys = varFetchService.getMailKeys();
		const mg = mailgun({ apiKey: keys.key, domain: keys.domain });
		const data = {
			from: varFetchService.getMailCredentials().mail,
			to: user.email,
			subject: 'Hello',
			template: 'one-time-authentification-code',
			'h:X-Mailgun-Variables': JSON.stringify({ Username: user.login, Code: code })
		};
		mg.messages().send(data, function (error, body) {});
	}

	generateSec() {
		return authenticator.generateSecret();
	}

	generateCode(secret: string) {
		return totp.gen(secret);
	}

	verifyCode(secret: string, token: string) {
		return totp.verify(token, secret, { window: 20 });
	}
}
