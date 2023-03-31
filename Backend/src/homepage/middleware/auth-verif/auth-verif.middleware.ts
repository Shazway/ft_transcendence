import {
	HttpException,
	HttpStatus,
	Injectable,
	NestMiddleware,
	Req,
	Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthVerifMiddleware implements NestMiddleware {
	constructor(private jwtService: JwtService) {}

	use(@Req() req: Request, @Res() res: Response, next: () => void) {
		const authKey = this.extractTokenFromHeader(req);
		let keyClean;
		if (!authKey)
			throw new HttpException(
				'No authentication token provided',
				HttpStatus.UNPROCESSABLE_ENTITY,
			);
		try {
			keyClean = this.jwtService.verify(authKey);
		} catch (error) {
			res.status(HttpStatus.UNAUTHORIZED).send({
				msg: 'Invalid authentication token provided',
			});
		}
		console.log(keyClean);
		next();
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
