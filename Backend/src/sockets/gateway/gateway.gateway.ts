import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class SocketGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private logger: Logger = new Logger('SocketGateway');

	handleDisconnect(client: any) {
		throw new Error('Connected');
	}
	handleConnection(client: any, ...args: any[]) {
		throw new Error('Disconnected');
	}
	afterInit(server: any) {
		this.logger.log('Server init');
	}
	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}
}
