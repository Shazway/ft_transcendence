import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@Injectable()
export class AuthVerifMiddleware implements NestMiddleware {
	constructor(private tokenManager: TokenManagerService) {}

	use(@Req() req: Request, @Res() res: Response, next: () => void) {
		console.log("nyehehe");
		this.tokenManager.getUsernameFromToken(req);
		next();
	}
}
