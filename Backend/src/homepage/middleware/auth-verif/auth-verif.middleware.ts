import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@Injectable()
export class AuthVerifMiddleware implements NestMiddleware {
	constructor(private tokenManager: TokenManagerService) {}

	use(@Req() req: Request, @Res() res: Response, next: () => void) {
		const token = this.tokenManager.extractTokenFromHeader(req);
		const keyClean = this.tokenManager.getUsernameFromToken(token);
		next();
	}

	public extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
