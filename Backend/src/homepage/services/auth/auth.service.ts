import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IntraInfo } from 'src/homepage/dtos/ApiDto.dto';
import { Transporter, createTransport } from 'nodemailer';
import { varFetchService } from '../var_fetch/var_fetch.service';
import { AuthOptions } from 'nodemailer-mailgun-transport';
import { totp } from 'notp';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService,) {}

	async login(user: IntraInfo, user_id: number) {
		const payload = {
			name: user.login,
			sub: user_id,
		};
		return this.jwtService.sign(payload);
	}

	createMail(code: string = null, user: IntraInfo) {
		const mailgun = require("mailgun-js");
		const keys = varFetchService.getMailKeys();
		const mg = mailgun({apiKey: keys.key, domain: keys.domain});
		const data = {
			from: varFetchService.getMailCredentials().mail,
			to: user.email,
			subject: "Hello",
			template: "one-time-authentification-code",
			'h:X-Mailgun-Variables': JSON.stringify({Username: user.login, Code: code}),
		};
		mg.messages().send(data, function (error, body) {
			console.log(body);
		});
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
