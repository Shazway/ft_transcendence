/* eslint-disable prettier/prettier */
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Message } from 'src/homepage/dtos/Message.dto';
import { Punishment } from 'src/homepage/dtos/Punishment.dto';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { MessagesService } from 'src/homepage/services/messages/messages.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { ChannelUserRelation } from 'src/entities';
import { NotificationRequest } from 'src/homepage/dtos/Notifications.dto';

@WebSocketGateway(3002, {
	cors: {
		origin: '*'
	}
})
export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private channelList: Map<number, Map<number, Array<Socket>>>;
	constructor(
		private messageService: MessagesService,
		private tokenManager: TokenManagerService,
		private channelService: ChannelsService,
		private itemService: ItemsService,
		private notificationGateway: NotificationsGateway
	) {
		this.channelList = new Map<number, Map<number, Array<Socket>>>();
	}

	@WebSocketServer()
	server;

	addUserToList(client: Socket, user: any) {
		const query = client.handshake.query;
		if (!query || !query.channel_id) {
			client.disconnect();
			return false;
		}
		let channel = this.channelList.get(Number(query.channel_id));
		if (!channel) {
			this.channelList.set(Number(query.channel_id), new Map<number, Array<Socket>>());
			channel = this.channelList.get(Number(query.channel_id));
		}
		const users = channel.get(user.sub);
		if (!users) channel.set(user.sub, new Array<Socket>());
		channel.get(user.sub).push(client);
		return true;
	}

	deleteUserFromList(client: Socket, user: any) {
		const query = client.handshake.query;
		const channel_id = Number(query.channel_id);
		const channel = this.channelList.get(channel_id);
		if (!channel) return false;
		let users = channel.get(user.sub);
		channel.set(
			user.sub,
			users.filter((user) => user !== client)
		);
		client.disconnect();
		users = channel.get(user.sub);
		if (users && !users.length) channel.delete(user.sub);
		if (!channel.size) this.channelList.delete(user.sub);
		return true;
	}

	socketDisconnect(clients: Array<Socket>) {
		clients.forEach((client) => {
			client.disconnect();
		});
	}

	sendMessageToChannel(channel_id: number, message: Message, dest = 'onMessage') {
		const channel = this.channelList.get(channel_id);
		if (!channel) return false;
		channel.forEach((user) => this.socketEmit(user, dest, message));
		return true;
	}

	async addUserToChannel(
		user_id: number,
		chan_id: number,
		pass = null,
		is_creator = false,
		is_admin = false
	) {
		const chan_user = new ChannelUserRelation();

		chan_user.is_creator = is_creator;
		chan_user.is_admin = is_admin;
		const channel = await this.itemService.getChannel(chan_id);
		if (!channel) false;
		else if (!channel.channel_password)
			await this.itemService.addUserToChannel(chan_user, chan_id, user_id);
		else if (pass === channel.channel_password)
			await this.itemService.addUserToChannel(chan_user, chan_id, user_id);
		return true;
	}

	async handleConnection(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		const channel = await this.channelService.getChannelById(channel_id);
		if (!channel) {
			client.emit('onError', 'Channel does not exist');
			client.disconnect();
			return;
		}
		if (!(await this.channelService.isUserMember(user.sub, channel_id))) {
			if (
				!channel.is_channel_private &&
				((!channel.channel_password &&
					(await this.addUserToChannel(user.sub, channel_id))) ||
					(await this.addUserToChannel(
						user.sub,
						channel_id,
						client.handshake.query.channel_pass
					)))
			)
				this.sendMessageToChannel(channel_id, {
					message_id: 0,
					message_content: user.name + ' joined the channel',
					author: { username: 'System', user_id: 0 },
					createdAt: new Date()
				});
			else return client.disconnect();
		}
		await this.channelService.isMuted(user.sub, channel_id);
		if (
			(await this.channelService.isBanned(user.sub, channel_id)) ||
			!this.addUserToList(client, user)
		) {
			client.emit('onError', 'User is banned');
			return client.disconnect();
		}
	}

	socketEmit(clients: Array<Socket>, eventDest: string, ...content: any[]) {
		clients.forEach((client) => {
			client.emit(eventDest, content[0]);
		});
	}

	async channelLeaveMsg(channel_id: number, target: Punishment) {
		const user = await this.itemService.getUser(target.target_id);
		this.sendMessageToChannel(channel_id, {
			message_id: 0,
			message_content: user.username + ' left the channel',
			author: { username: 'System', user_id: 0 },
			createdAt: new Date()
		});
	}

	handleDisconnect(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		if (this.channelList.get(channel_id).get(user.sub)) {
			if (!this.deleteUserFromList(client, user))
				return client.emit('onError', 'Channel does not exist');
		}
	}

	@SubscribeMessage('addFriend')
	async handleInvite(@ConnectedSocket() client: Socket, @MessageBody() body: NotificationRequest) {
		await this.notificationGateway.handleInvite(client, body);
	}

	@SubscribeMessage('mute')
	async handleMute(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		if (!user)
			client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.channelService.checkPrivileges(user.sub, body.target_id, channel_id);
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
		if (!this.channelService.muteUser(user.sub, body.target_id, channel_id, body.time))
			return client.emit('onError', 'Error while muting some dude');
		const users = this.channelList.get(channel_id).get(body.target_id);
		this.socketEmit(
			users,
			'onMessage',
			'You have been muted by ' + user.name + ' for reason: ' + body.message
		);
		this.notificationGateway.sendMessage([user.sub], 'Successful mute');
	}

	@SubscribeMessage('unmute')
	async handleUnmute(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		if (!user)
			client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.channelService.checkPrivileges(user.sub, body.target_id, channel_id);
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
		if (!this.channelService.unMuteUser(user.sub, body.target_id, channel_id))
			return client.emit('onError', 'Error while unmuting some dude');
		const users = this.channelList.get(channel_id).get(body.target_id);
		this.socketEmit(
			users,
			'onMessage',
			'You have been unmuted by ' + user.name
		);
		this.notificationGateway.sendMessage([user.sub], 'User unmuted successfully');
	}

	@SubscribeMessage('ban')
	async handleBan(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		if (!user)
			client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.channelService.checkPrivileges(user.sub, body.target_id, channel_id);
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
			this.channelService.banUser(user.sub, body.target_id, channel_id, body.time);
		const targets = this.channelList.get(channel_id).get(body.target_id);
		this.socketEmit(
			targets,
			'onMessage',
			'You have been banned by ' + user.name + ' for reason: ' + body.message
		);
		this.channelLeaveMsg(channel_id, body);
		this.socketDisconnect(targets);
		this.notificationGateway.sendMessage([user.sub], 'Successful ban');
	}

	@SubscribeMessage('unban')
	async handleUnban(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		if (!user)
			client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.channelService.checkPrivileges(user.sub, body.target_id, channel_id);
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
			this.channelService.unBanUser(user.sub, body.target_id, channel_id);
		const targets = this.channelList.get(channel_id).get(body.target_id);
		this.socketEmit(
			targets,
			'onMessage',
			'You have been unbanned by ' + user.name
		);
		this.channelLeaveMsg(channel_id, body);
		this.socketDisconnect(targets);
		this.notificationGateway.sendMessage([user.sub], 'User unbanned successfully');
	}

	@SubscribeMessage('kick')
	async handleKick(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		if (!user)
			client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.channelService.checkPrivileges(user.sub, body.target_id, channel_id);
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
		const target = this.channelList.get(channel_id).get(body.target_id);
		if (user.sub === body.target_id) {
			this.channelLeaveMsg(channel_id, body);
			return this.notificationGateway.sendMessage([user.sub], 'You have left the room');
		}
		if (target) {
			this.socketEmit(
				target,
				'onMessage',
				'You have been kicked by ' + user.name + ' for reason: ' + body.message
			);
			this.socketDisconnect(target);
		}
		this.channelLeaveMsg(channel_id, body);
		this.notificationGateway.sendMessage([user.sub], 'Successful kick');
	}

	@SubscribeMessage('message')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: Message) {
		body.createdAt = new Date();
		console.log(body);
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		if (!user)
			client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		const Validity = await this.messageService.addMessageToChannel(
			body,
			client.request.headers.authorization,
			Number(client.handshake.query.channel_id)
		);
		body.author.username = user.name;
		body.author.user_id = user.sub;
		body.message_id = Validity.message.message_id;
		if (Validity.check.ret) this.sendMessageToChannel(channel_id, body);
		else {
			client.emit('onMessage', Validity.check.msg);
			if (Validity.check.msg === 'User is banned') this.deleteUserFromList(client, user);
		}
	}

	@SubscribeMessage('checkPrivileges')
	async checkPrivileges(@ConnectedSocket() client: Socket, @MessageBody() body: Message) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		if (!user)
			client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		const rights = await this.channelService.checkPrivileges(
			user.sub,
			body.author.user_id,
			channel_id
		);
		client.emit('answerPrivileges', rights.ret);
	}

	@SubscribeMessage('delMessage')
	async deleteMessage(@ConnectedSocket() client: Socket, @MessageBody() body: Message) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		if (!user)
			client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		console.log(body);
		const ret = await this.channelService.checkPrivileges(
			user.sub,
			body.author.user_id,
			channel_id
		);
		if (user.sub != body.author.user_id && !ret.ret)
			return client.emit('onError', 'Lacking privileges');
		if (this.messageService.delMessage(body.message_id)) {
			this.sendMessageToChannel(channel_id, body, 'delMessage');
			console.log('message deleted: ' + body.message_id);
		} else {
			console.log('message not deleted: ' + body.message_id);
		}
	}
}
