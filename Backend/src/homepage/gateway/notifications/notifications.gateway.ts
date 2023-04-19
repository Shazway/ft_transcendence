import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NotificationRequest, NotificationResponse } from 'src/homepage/dtos/Notifications.dto';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { NotificationsService } from 'src/homepage/services/notifications/notifications.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@WebSocketGateway(3003, {
	cors: {
		origin: '*',
	},
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	OFFLINE = 0;
	ONLINE = 1;
	AWAY = 2;
	private userList: Map<number, Socket>;
	constructor(
		private tokenManager: TokenManagerService,
		private notificationService: NotificationsService,
		private itemsService: ItemsService,
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

	@SubscribeMessage('friendRequest')
	async handleFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() body: NotificationRequest) {
		body.sent_at = new Date();
		let answer: NotificationResponse;
		const source = this.tokenManager.getToken(client.request.headers.authorization);
		const target = await this.itemsService.getUser(body.target_id);

		if (target.blacklistEntry.find((user) => user.user_id === source.sub))
			return client.emit('notAllowed', "User blocked");
		else {
			const user = this.userList.get(target.user_id);
			answer.sent_at = body.sent_at;
			answer.source_id = source.sub;
			answer.source_name = source.name;
			answer.type = "friend";
			if (user)
				user.emit('friendRequest', answer);
		}
	}

	@SubscribeMessage('friendAnswer')
	async handleFriendAnswer(@ConnectedSocket() client: Socket, @MessageBody() body: NotificationRequest) {
		body.sent_at = new Date();
		let answer: Notification;
		const source = this.tokenManager.getToken(client.request.headers.authorization);
		const target = await this.itemsService.getUser(body.target_id);

		if (target.blacklistEntry.find((user) => user.user_id === source.sub))
			return client.emit('notAllowed', "User blocked");
		else {
			const user = this.userList.get(target.user_id);
			if (user)
			{
				if (!body.accepted)
					return user.emit('newFriend', target.username + " refused your invite");
				await this.itemsService.addFriendToUser(source.sub, target.user_id);
				user.emit('newFriend', "You are now friends with " + target.username);
			}
		}
	}
}
