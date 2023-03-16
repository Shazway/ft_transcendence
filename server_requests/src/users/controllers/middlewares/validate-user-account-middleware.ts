import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class ValidateUserAccountMiddleware implements
NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const {validAccount} = req.headers;
		console.log('Valid account check.');
		if (validAccount) {
			next();
		} else {
			res.status(401).send({ error: 'Invalid account'});
		}
	}
}