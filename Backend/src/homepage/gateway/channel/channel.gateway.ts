import { OnModuleInit } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from 'src/homepage/dtos/MessageDto.dto';
import { PunishmentDto } from 'src/homepage/dtos/PunishmentDto.dto';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { MessagesService } from 'src/homepage/services/messages/messages.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@WebSocketGateway(3002)
export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private channelList: Map<number, Map<number, Socket>>;
	constructor(
		private messageService: MessagesService,
		private tokenManager: TokenManagerService,
		private channelService: ChannelsService,
	) {
		this.channelList = new Map<number, Map<number, Socket>>();
	}

	@WebSocketServer()
	server: Server;

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
		if (!channel.size) this.channelList.delete(channel_id);
		client.disconnect();
		return true;
	}

	sendMessageToChannel(channel_id: number, message: MessageDto) {
		const channel = this.channelList.get(channel_id);
		if (!channel) return false;
		channel.forEach((user) => user.emit('onMessage', message));
		return true;
	}

	async handleConnection(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);

		if (!(await this.channelService.getChannelById(channel_id))) {
			client.emit('onError', 'Channel does not exist');
			client.disconnect();
			return;
		}
		await this.channelService.isMuted(user.sub, channel_id);
		if (
			(await this.channelService.isBanned(user.sub, channel_id)) ||
			!this.addUserToList(client, user)
		) {
			client.emit('onError', 'User is banned');
			return client.disconnect();
		}
		this.sendMessageToChannel(channel_id, {
			content: user.name + ' joined the channel',
			author: 'System',
		});
	}
	handleDisconnect(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		if (this.channelList.get(channel_id).get(user.sub)) {
			this.sendMessageToChannel(channel_id, {
				content: user.name + ' left the channel',
				author: 'System',
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
		client.emit('onMessage', 'Successful mute');
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
		client.emit('onMessage', 'Successful ban');
	}

	@SubscribeMessage('message')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: MessageDto) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const channel_id = Number(client.handshake.query.channel_id);
		const Validity = await this.messageService.addMessageToChannel(
			body,
			client.request.headers.authorization,
			Number(client.handshake.query.channel_id),
		);
		body.author = user.name;
		if (Validity.ret) this.sendMessageToChannel(channel_id, body);
		else {
			client.emit('onMessage', Validity.msg);
			if (Validity.msg === 'User is banned') this.deleteUserFromList(client, user);
		}
	}
}
