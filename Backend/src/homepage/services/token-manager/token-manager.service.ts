/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Request, Response } from 'express';
import { ItemsService } from '../items/items.service';
import { ServerKeyService } from '../server-key/server-key.service';
import { UsersService } from '../users/users.service';

export class JWTToken {
	sub: any;
	name: any;
	key: any;
	ft_key: any;
}

@Injectable()
export class TokenManagerService {
	constructor(
		private jwtService: JwtService,
		private usersService: UsersService,
		private keyService: ServerKeyService,
		private itemsService: ItemsService
	) {}

	public extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	public throwException(type: string, msg: string) {
		if (type == 'Http')
			throw new HttpException(msg, HttpStatus.UNAUTHORIZED);
		else if (type == 'ws')
			throw new WsException(msg);
		return null;
	}


	public async getToken(token: string, type: string, res?: Response) {
		let keyClean: JWTToken;

		if (!token)
			if (!this.throwException(type, 'No authentication token provided'))
				return null;

		try {
			keyClean = this.jwtService.verify(token);
		} catch (error) {
			this.throwException(type, 'Wrong token');
		}
		if (!keyClean || keyClean.key != this.keyService.getKey())
		{
			if (type == 'Http' && res)
				res.status(HttpStatus.I_AM_A_TEAPOT).send('Wrong token');
			else if (type == 'Http') throw new HttpException('Wrong token', HttpStatus.UNAUTHORIZED);
				return null;
		}
		return keyClean;
	}

	public async getUserFromToken(request: Request, type = 'Http', res?: Response) {
		return (await this.getToken(this.extractTokenFromHeader(request), type, res));
	}
	public async getUsernameFromToken(request: Request, type = 'Http', res?: Response) {
		return (await this.getToken(this.extractTokenFromHeader(request), type, res)).name;
	}
	public async getIdFromToken(request: Request, type = 'Http', res?: Response) {
		return (await this.getToken(this.extractTokenFromHeader(request), type, res)).sub;
	}
}
