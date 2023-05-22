/* eslint-disable prettier/prettier */
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AchievementsEntity } from 'src/entities';
import { NotificationRequest, NotificationResponse } from 'src/homepage/dtos/Notifications.dto';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { NotificationsService } from 'src/homepage/services/notifications/notifications.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@WebSocketGateway(3003, {
	cors: {
		origin: 'http://localhost:4200'
	}
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
		private channelsService: ChannelsService
	) {
		this.userList = new Map<number, Socket>();
	}

	@WebSocketServer()
	server;

	async handleConnection(client: Socket) {
		let user;
		try {
			user = this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		} catch(error) {
			console.log(error);
			client.disconnect();
			return ;
		}
		console.log('Connected notifs ' + user.name);
		this.userList.set(user.sub, client);
		console.log(this.userList);
		await this.notificationService.setUserStatus(user.sub, this.ONLINE);
	}
	
	async handleDisconnect(client: Socket) {
		let user;
		try {
			user = this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		} catch(error) {
			client.disconnect();
			return ;
		}
		this.userList.delete(user.sub);
		await this.notificationService.setUserStatus(user.sub, this.OFFLINE);
	}

	sendMessage(user_tab: number[], message: any) {
		user_tab.forEach((user) => {
			const client = this.userList.get(user);
			if (client) client.emit('onNotif', message);
		});
	}

	//Send achievements to user
	async sendAchievement(user_id: number, achievement: AchievementsEntity) {
		const client = this.userList.get(user_id);
		if (!client) throw new WsException('Client not connected');
		this.itemsService.addAchievementsToUser(user_id, achievement.achievement_id);
		client.emit(
			'newAchievement',
			'Congratulations! You received the ' + achievement.achievement_name
		);
		return true;
	}

	buildAnswer(id: number, username: string, type: string, accept = false) {
		const answer: NotificationResponse = {
			source_id: id,
			type: type,
			source_name: username,
			sent_at: new Date(),
			accepted: accept
		};
		return answer;
	}

	//Answer and send friend requests

	@SubscribeMessage('inviteRequest')
	async handleInvite(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: NotificationRequest
	) {
		body.sent_at = new Date();
		const source = this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const answer = this.buildAnswer(source.sub, source.name, body.type);
		const target = this.userList.get(body.target_id);
		const notifClient = this.userList.get(source.sub);

		console.log("On envoie une invite " + body.type);
		console.log('request from ' + source.name + ' to: ');
		console.log(body);
		if(!body)
			throw new WsException('Pas de body');
		if (body.type == 'friend') {
			if (await this.itemsService.requestExists(source.sub, body.target_id))
				return client.emit('alreadySent', 'Already pending request');
			else if (!(await this.itemsService.addFriendRequestToUsers(source.sub, body.target_id)))
				return client.emit('refusedRequest', 'Friend request refused');
		}
		if (target)
			target.emit(body.type + 'Invite', { notification: answer });
		if (notifClient)
			notifClient.emit('pendingRequest', 'Request sent and waiting for answer');
	}

	@SubscribeMessage('inviteAnswer')
	async handeAnswer(@ConnectedSocket() client: Socket, @MessageBody() body: NotificationRequest) {
		const source = this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const answer = this.buildAnswer(source.sub, source.name, body.type, body.accepted);
		const user = this.userList.get(body.target_id);

		if (!source)
			throw new WsException('User disconnected');
		if (body.accepted) {
			if (body.type == 'friend')
				if (await this.itemsService.addFriendToUser(source.sub, body.target_id))
					return client.emit('No request to answer to');
			if (body.type == 'channel')
				await this.channelsService.addUserToChannel(body.target_id, body.channel_id);
		}
		client.emit('success', 'Answer sent');
		if (user) user.emit(body.type + 'Answer', { notification: answer });
	}
}
