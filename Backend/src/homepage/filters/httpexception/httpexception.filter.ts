import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpexceptionFilter implements ExceptionFilter {

	catch(exception: HttpException, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>();
		const status = exception.getStatus();
		const message = exception.message;

		console.log('Filter HTTPEXCEPTION DETECTED');
		console.log(exception);
		response.status(status).json({
			statusCode: status,
			message,
		})
		console.log('Note that the server is still up and running');
	}

}
