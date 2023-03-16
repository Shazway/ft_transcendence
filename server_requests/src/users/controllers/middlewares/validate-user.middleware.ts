import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class ValidateUserMiddleware implements
NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		console.log('Hello, World, validate user middleware!');
		const { authorization } = req.headers;
		if (!authorization) return (res.status(403).send({error: 'No auth token provided.'}));
		if (authorization === '123')
		next();
		else
			return (res.status(403).send({error: 'Wrong token.'}));

	}
}