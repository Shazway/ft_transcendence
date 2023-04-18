import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NotificationsService } from 'src/homepage/services/notifications/notifications.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@WebSocketGateway(3003)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	OFFLINE = 0;
	ONLINE = 1;
	AWAY = 2;
	private userList: Map<number, Socket>;
	constructor(
		private tokenManager: TokenManagerService,
		private notificationService: NotificationsService,
	) {
		this.userList = new Map<number, Socket>();
	}

	@WebSocketServer()
	server;

	async handleConnection(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		this.userList.set(user.sub, client);
		await this.notificationService.setUserStatus(user.sub, this.ONLINE);
	}

	async handleDisconnect(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		this.userList.delete(user.sub);
		await this.notificationService.setUserStatus(user.sub, this.OFFLINE);
	}

	sendMessage(user_tab: number[], message: any) {
		user_tab.forEach(user => {
			const client = this.userList.get(user);
			if (client) client.emit('onNotif', message);
		});
	}
}
