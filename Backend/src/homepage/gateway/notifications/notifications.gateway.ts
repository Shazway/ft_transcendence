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
import { AchievementsEntity, UserEntity } from 'src/entities';
import { NotificationRequest, NotificationResponse } from 'src/homepage/dtos/Notifications.dto';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { MatchsService } from 'src/homepage/services/matchs/matchs.service';
import { NotificationsService } from 'src/homepage/services/notifications/notifications.service';
import { RequestService } from 'src/homepage/services/request/request.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { WsexceptionFilter } from 'src/homepage/filters/wsexception/wsexception.filter';
import { UseFilters } from '@nestjs/common';

@UseFilters(new WsexceptionFilter())
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
		private requestService: RequestService,
		private matchService: MatchsService,
	) {
		this.userList = new Map<number, Socket>();
	}

	@WebSocketServer()
	server;

	async handleConnection(client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		
		if (!user)
			return client.disconnect();
		this.userList.set(user.sub, client);
		console.log('connected ' + user.name);
		await this.notificationService.setUserStatus(user.sub, this.ONLINE);
	}
	
	async handleDisconnect(client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		
		if (!user)
			return client.disconnect();
		console.log('disconnected ' + user.name);
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

	async onChannelInvite(sourceUser: any, targetUser: UserEntity, channelName: string)
	{
		if (!targetUser)
			return;
		const client = this.userList.get(targetUser.user_id);

		if (client && sourceUser)
			client.emit('channelInvite', this.buildAnswer(sourceUser.user_id, sourceUser.username, channelName));
	}

	@SubscribeMessage('inviteRequest')
	async handleInvite(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: NotificationRequest
	) {
		body.sent_at = new Date();
		const source = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const answer = this.buildAnswer(source.sub, source.name, body.type);
		const target = this.userList.get(body.target_id);
		if(!body)
			throw new WsException('Pas de body');
		if (body.type == 'friend' && !(await this.requestService.handleFriendRequestInvite(source.sub, body.target_id)))
			return client.emit('refusedInvite', 'Something went wrong');
		else if (body.type == 'match' && !target)
			return client.emit('offline', 'Your friend is currently offline');
		if (target && target.connected)
			target.emit(body.type + 'Invite', { notification: answer});
		else
			console.log('Pas connecte target');
		if (client && client.connected)
			client.emit('pendingRequest', 'Request sent and waiting for answer');
		else
			console.log('Pas connecte envoyeur');
	}

	@SubscribeMessage('inviteAnswer')
	async handeAnswer(@ConnectedSocket() client: Socket, @MessageBody() body: NotificationRequest) {
		const source = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		if (!body)
			throw new WsException('No answer given is necessary');
		const answer = this.buildAnswer(source.sub, source.name, body.type, body.accepted);
		const target = this.userList.get(body.target_id);
		if (body.accepted)
		{
			if (body.type == 'friend' && !this.requestService.handleFriendRequestAnswer(source.sub, body.target_id))
				return client.emit('No request to answer to');
			if (body.type == 'match')
			{
				if (!target)
					return client.emit('Disconnect', 'Opponent disconnected');
				const match = await this.matchService.createFullMatch(source.sub, body.target_id, body.match_setting);
				if (!match)
					return client.emit('Error', 'Something went wrong');
				client.emit('casualMatch', match.match_id);
				target.emit('casualMatch', match.match_id);
				return;
			}
		}
		else
			this.itemsService.deleteFriendRequest(source.sub, body.target_id);
		client.emit('success', 'Answer sent');
		if (target) target.emit(body.type + 'Answer', { notification: answer });
		else
			console.log('target deco pas de popup')
	}
}
