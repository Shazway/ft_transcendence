import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Request } from 'express';

@Injectable()
export class TokenManagerService {
	constructor(private jwtService: JwtService) {}

	public extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	public throwException(type: string, msg: string) {
		if (type == 'Http')
			throw new HttpException(msg, HttpStatus.UNAUTHORIZED);
		throw new WsException(msg);
	}

	public getToken(token: string, type: string) 
	{
		let keyClean: {sub: any, name: any};

		if (!token)
			this.throwException(type, 'No authentication token provided');

		try {keyClean = this.jwtService.verify(token);}
		catch (error) 
		{
			this.throwException(type, 'Wrong token');
		}
		return keyClean;
	}

	public getUserFromToken(request: Request, type: string = 'Http') {
		return this.getToken(this.extractTokenFromHeader(request), type);
	}
	public getUsernameFromToken(request: Request, type: string = 'Http') {
		return this.getToken(this.extractTokenFromHeader(request), type).name;
	}
	public getIdFromToken(request: Request, type: string = 'Http') {
		return this.getToken(this.extractTokenFromHeader(request), type).sub;
	}
}
