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
import { MessageDto } from 'src/homepage/dtos/MessageDto.dto';
import { PunishmentDto } from 'src/homepage/dtos/PunishmentDto.dto';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { MessagesService } from 'src/homepage/services/messages/messages.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { ChannelUserRelation } from 'src/entities';

@WebSocketGateway(3002, {
	cors: {
		origin: '*',
	},
})
export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private channelList: Map<number, Map<number, Socket>>;
	constructor(
		private messageService: MessagesService,
		private tokenManager: TokenManagerService,
		private channelService: ChannelsService,
		private itemService: ItemsService,
		private notificationGateway: NotificationsGateway,
	) {
		this.channelList = new Map<number, Map<number, Socket>>();
	}

	@WebSocketServer()
	server;

	addUserToList(client: Socket, user: any) {
		const query = client.handshake.query;
		if (!query || !query.channel_id) {
			client.disconnect();
			return false;
		}
		if (!this.channelList.get(Number(query.channel_id)))
			this.channelList.set(Number(query.channel_id), new Map<number, Socket>());
		this.channelList.get(Number(query.channel_id)).set(user.sub, client);
		return true;
	}

	deleteUserFromList(client: Socket, user: any) {
		const query = client.handshake.query;
		const channel_id = Number(query.channel_id);
		const channel = this.channelList.get(channel_id);
		if (!channel) return false;
		channel.delete(user.sub);
		client.disconnect();
		return true;
	}

	sendMessageToChannel(channel_id: number, message: MessageDto) {
		console.log({Sending_message: message.message_content});
		console.log({On_channel: channel_id});
		const channel = this.channelList.get(channel_id);
		if (!channel) return false;
		console.log({Active_Users: channel.size});
		channel.forEach((user) => user.emit('onMessage', message));
		return true;
	}

	async addUserToChannel(user_id: number, chan_id: number, pass = null, is_creator = false, is_admin = false) {
		const chan_user = new ChannelUserRelation();

		chan_user.is_creator = is_creator;
		chan_user.is_admin = is_admin;
		const channel = await this.itemService.getChannel(chan_id);
		if (!channel) false;
		else if (!channel.channel_password) await this.itemService.addUserToChannel(chan_user, chan_id, user_id);
		else if (pass === (channel.channel_password))
			await this.itemService.addUserToChannel(chan_user, chan_id, user_id);
		return true;
	}

	async handleConnection(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		const channel = (await this.channelService.getChannelById(channel_id));
		if (!channel) {
			client.emit('onError', 'Channel does not exist');
			client.disconnect();
			return;
		}

		if (!( await this.channelService.isUserMember(user.sub, channel_id))) {
			if (!channel.is_channel_private &&
				((!channel.channel_password && await this.addUserToChannel(user.sub, channel_id)) ||
				await this.addUserToChannel(user.sub, channel_id, client.handshake.query.channel_pass)))
				this.sendMessageToChannel(channel_id, {
					message_content: user.name + ' joined the channel',
					author: { username: 'System', user_id: 0 },
					createdAt: new Date(),
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

	handleDisconnect(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		if (this.channelList.get(channel_id).get(user.sub)) {
			this.sendMessageToChannel(channel_id, {
				message_content: user.name + ' left the channel',
				author: { username: 'System', user_id: 0 },
				createdAt: new Date(),
			});
			if (!this.deleteUserFromList(client, user))
				return client.emit('onError', 'Channel does not exist');
		}
	}

	@SubscribeMessage('mute')
	async handleMute(@ConnectedSocket() client: Socket, @MessageBody() body: PunishmentDto) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		if (!this.channelService.muteUser(user.sub, body.target_id, channel_id, body.time))
			return client.emit('onError', 'Error while muting some dude');
		// eslint-disable-next-line prettier/prettier
		this.channelList.get(channel_id).get(body.target_id).emit(
				'onMessage',
				'You have been muted by ' + user.name + ' for reason: ' + body.message,
			);
		this.notificationGateway.sendMessage([user.sub], 'Successful mute');
	}

	@SubscribeMessage('ban')
	async handleBan(@ConnectedSocket() client: Socket, @MessageBody() body: PunishmentDto) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		this.channelService.banUser(user.sub, body.target_id, channel_id, body.time);
		// eslint-disable-next-line prettier/prettier
		const target = this.channelList.get(channel_id).get(body.target_id);
		target.emit(
			'onMessage',
			'You have been banned by ' + user.name + ' for reason: ' + body.message,
		);
		target.disconnect();
		this.notificationGateway.sendMessage([user.sub], 'Successful ban');
	}

	@SubscribeMessage('kick')
	async handleKick(@ConnectedSocket() client: Socket, @MessageBody() body: PunishmentDto) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		if (!this.channelService.checkPrivileges(user.sub, body.target_id, channel_id))
			return client.emit('onError', 'Lacking privileges');
		// eslint-disable-next-line prettier/prettier
		const target = this.channelList.get(channel_id).get(body.target_id);
		if (user.sub === body.target_id)
			return this.notificationGateway.sendMessage([user.sub], 'You have left the room');
		target.emit(
			'onMessage',
			'You have been kicked by ' + user.name + ' for reason: ' + body.message,
			);
			target.disconnect();
		this.notificationGateway.sendMessage([user.sub], 'Successful kick');
	}

	@SubscribeMessage('message')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: MessageDto) {
		body.createdAt = new Date();
		console.log(body);
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		const Validity = await this.messageService.addMessageToChannel(
			body,
			client.request.headers.authorization,
			Number(client.handshake.query.channel_id),
		);
		body.author.username = user.name;
		body.author.user_id = user.sub;
		if (Validity.ret) this.sendMessageToChannel(channel_id, body);
		else {
			client.emit('onMessage', Validity.msg);
			if (Validity.msg === 'User is banned') this.deleteUserFromList(client, user);
		}
	}
}
