import { ArgumentsHost, Catch, ExceptionFilter, SetMetadata } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export const UseWebSocketFilters = (...filters: any[]) => SetMetadata('wsFilters', filters);

@Catch(WsException)
export class WsexceptionFilter implements ExceptionFilter {
	catch(exception: WsException, host: ArgumentsHost) {
		const client = host.switchToWs().getClient();
		const response = {
			status: exception.getError(),
			message: exception.message
		};
		console.log('Websocket Token Error:');
		console.log(exception);
		// client.send(JSON.stringify(response));
		client.emit('onError', exception.message);
		// client.disconnect();
		console.log('Note that the server is still up and running ✅');
	}
}
