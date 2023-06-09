import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class OptionInterceptor implements NestInterceptor {

	use(@Req() req: Request, @Res() res: Response, next: () => void) {

		if (req.method === 'OPTIONS') {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
			res.status(HttpStatus.OK).send();
			return;
		}
		next();
	}
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const response = context.switchToHttp().getResponse();
		const request = context.switchToHttp().getRequest();

		if (request.method === 'OPTIONS') {
			response.setHeader('Access-Control-Allow-Origin', '*');
			response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
			response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
			response.status(HttpStatus.OK).send();
			return;
		}
		return next.handle();
	}
}
