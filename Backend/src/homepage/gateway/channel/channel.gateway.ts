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
import { Message } from 'src/homepage/dtos/Message.dto';
import { Punishment } from 'src/homepage/dtos/Punishment.dto';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { MessagesService } from 'src/homepage/services/messages/messages.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { ChannelUserRelation } from 'src/entities';
import { NotificationRequest } from 'src/homepage/dtos/Notifications.dto';
import { UsersService } from 'src/homepage/services/users/users.service';

@WebSocketGateway(3002, {
	cors: {
		origin: 'http://localhost:4200'
	}
})
export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private channelList: Map<number, Map<number, Array<Socket>>>;
	constructor(
		private messageService: MessagesService,
		private tokenManager: TokenManagerService,
		private channelService: ChannelsService,
		private itemService: ItemsService,
		private notificationGateway: NotificationsGateway,
		private usersService: UsersService,
	) {
		this.channelList = new Map<number, Map<number, Array<Socket>>>();
	}

	@WebSocketServer()
	server;



	async handleConnection(client: Socket) 
	{
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		if (!user)
			return client.disconnect();
		const channel_id = Number(client.handshake.query.channel_id);
		const channel = await this.channelService.getChannelById(channel_id);
		if (!channel) {
			client.emit('onError', 'Channel does not exist');
			client.disconnect();
			return;
		}
		const isMember = this.channelService.isUserMember(user.sub, channel_id);

		if (channel.is_dm && isMember)
			return this.addUserToList(client, user);
		else if (channel.is_dm)
			return client.disconnect();
		if (!channel.is_channel_private)
		{
			await this.channelService.isMuted(user.sub, channel_id);
			if ((await this.channelService.isBanned(user.sub, channel_id)) ||
				!this.addUserToList(client, user))
			{
				client.emit('onError', 'User is banned');
				return client.disconnect();
			}
			if (((!channel.channel_password &&
				(await this.addUserToChannel(user.sub, channel_id))) ||
				(await this.addUserToChannel(user.sub, channel_id, client.handshake.query.channel_pass))) && isMember)
					await this.sendMessageToChannel(0, channel_id, this.buildJoinChannel(user));
		}
		else if (channel.is_channel_private && isMember)
			this.addUserToList(client, user);
		else
			client.disconnect();
	}

	buildJoinChannel(user: any)
	{
		return {
				message_id: 0,
				message_content: user.name + ' is online',
				author: { username: 'System', user_id: 0 },
				createdAt: new Date()
		}
	}

	async handleDisconnect(client: Socket)
	{
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		if (!user)
			return ;
		const channel_id = Number(client.handshake.query.channel_id);
		const channel = this.channelList.get(channel_id)
		if (!channel)
			return client.disconnect();
		const chanUser = channel.get(user.sub);
		if(chanUser)
			this.deleteUserFromList(client, chanUser);
	}

	addUserToList(client: Socket, user: any) {
		const query = client.handshake.query;

		if (!query || !query.channel_id) {
			client.emit('onError', 'Channel does not exist');
			return false;
		}
		const channel_id = query.channel_id;
		let channel = this.channelList.get(Number(channel_id));
		if (!channel) {
			this.channelList.set(Number(channel_id), new Map<number, Array<Socket>>());
			channel = this.channelList.get(Number(channel_id));
		}
		const users = channel.get(user.sub);
		if (!users)
			channel.set(user.sub, new Array<Socket>());
		channel.get(user.sub).push(client);
		return true;
	}

	deleteUserFromList(client: Socket, user: any) {
		const query = client.handshake.query;
		const channel_id = Number(query.channel_id);
		const channel = this.channelList.get(channel_id);
		if (!channel) return null;
		let users = channel.get(user.sub);
		if (!users)
		{
			client.disconnect();
			return true;
		}
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

	async sendMessageToChannel(sourceId: number, channel_id: number, message: Message, dest = 'onMessage') {
		const channel = this.channelList.get(channel_id);
		if (!channel)
		{
			throw new WsException('Channel does not exist');
		}
		channel.forEach(async (userSockets, key) => {
			if (!(await this.usersService.isBlockedCheck(sourceId, key)))
				this.socketEmit(userSockets, dest, message);
		});
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

		if (!channel) 
		{
			throw new WsException('Not allowed');
		}
		if (channel.is_dm)
			return false;
		if (!channel.channel_password)
			await this.itemService.addUserToChannel(chan_user, chan_id, user_id);
		else if (pass === channel.channel_password)
			await this.itemService.addUserToChannel(chan_user, chan_id, user_id);
		return true;
	}

	socketEmit(clients: Array<Socket>, eventDest: string, ...content: any[]) {
		clients.forEach((client) => {
			client.emit(eventDest, content[0]);
		});
	}

	async channelLeaveMsg(channel_id: number, target: Punishment) {
		const user = await this.itemService.getUser(target.target_id);
		const channel = await this.itemService.getChannel(channel_id);
		if (!user || !channel)
		{
			throw new WsException('User or Channel does not exist');
		}
		if (channel.is_channel_private)
			return true;
		await this.sendMessageToChannel(0, channel_id, {
			message_id: 0,
			message_content: user.username + ' left the channel',
			author: { username: 'System', user_id: 0 },
			createdAt: new Date()
		});
		return true;
	}

	async getPrivilegesFromUsername(sourceId: number, username: string, channelId: number): Promise<{ ret: boolean; msg: string; }> {
		const targetEntity = await this.itemService.getUserByUsername(username);
		if (!targetEntity)
			return ({ret: false, msg: 'User not found'});
		return await this.channelService.checkPrivileges(sourceId, targetEntity.user_id, channelId);
	}

	async getPrivilegesFromBody(sourceId: number, body: Punishment, channelId: number) {
		if (!body)
			return {ret: false, msg: 'No body sent'}
		if (!body.username && body.target_id)
			return await this.channelService.checkPrivileges(sourceId, body.target_id, channelId);
		else if (body.username)
			return await this.getPrivilegesFromUsername(sourceId, body.username, channelId);
		return {ret: false, msg: 'Not allowed'};
	}

	@SubscribeMessage('addFriend')
	async handleInvite(@ConnectedSocket() client: Socket, @MessageBody() body: NotificationRequest) {
		if (!body || !body.target_id)
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		if (body && body.target_id == user.sub)
			throw new WsException('You cannot add yourself');
		await this.notificationGateway.handleConnection(client);
		await this.notificationGateway.handleInvite(client, body);
	}

	@SubscribeMessage('block')
	async handleBlock(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		if (body && body.target_id == user.sub)
			throw new WsException('You cannot block yourself');
		if ((await this.itemService.blockUser(user.sub, body.target_id)))
			return client.emit('Success', 'User blocked success');
		const channel_id = Number(client.handshake.query.channel_id);
		const channel = await this.itemService.getChannel(channel_id);
		if (channel && channel.is_channel_private)
		{
			const chan = this.channelList.get(channel_id);
			if (chan)
			{
				chan.forEach((user) => {
					this.socketDisconnect(user);
				});
			}
			this.channelList.delete(channel_id);
		}
	}

	@SubscribeMessage('mute')
	async handleMute(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.getPrivilegesFromBody(user.sub, body, channel_id);
		const channel = this.channelList.get(channel_id);

		if (body.target_id == user.sub)
			throw new WsException('You cannot mute yourself');
		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret)
			return client.emit('onError', 'Lacking privileges');
		if (!this.channelService.muteUser(user.sub, body.target_id, channel_id, body.time))
			return client.emit('onError', 'Error while muting some dude');

		const users = channel.get(body.target_id);
		this.socketEmit(
			users,
			'onMessage',
			'You have been muted by ' + user.name + ' for reason: ' + body.message
		);
		this.notificationGateway.sendMessage([user.sub], 'Successful mute');
	}

	@SubscribeMessage('unmute')
	async handleUnmute(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.getPrivilegesFromBody(user.sub, body, channel_id);
		const channel = this.channelList.get(channel_id);

		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
		if (!this.channelService.unMuteUser(user.sub, body.target_id, channel_id))
			return client.emit('onError', 'Error while unmuting some dude');
		const users = channel.get(body.target_id);
		this.socketEmit(
			users,
			'onMessage',
			'You have been unmuted by ' + user.name
		);
		this.notificationGateway.sendMessage([user.sub], 'User unmuted successfully');
	}

	@SubscribeMessage('ban')
	async handleBan(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.getPrivilegesFromBody(user.sub, body, channel_id);
		const channel = this.channelList.get(channel_id);

		if (!body)
			throw new WsException('No body');
		if (body.target_id == user.sub)
			throw new WsException('You cannot ban yourself');
		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
			this.channelService.banUser(user.sub, body.target_id, channel_id, body.time);

		const targets = channel.get(body.target_id);
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
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.getPrivilegesFromBody(user.sub, body, channel_id);
		const channel = this.channelList.get(channel_id);

		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
			this.channelService.unBanUser(user.sub, body.target_id, channel_id);

		const targets = channel.get(body.target_id);
		this.socketEmit(
			targets,
			'onMessage',
			'You have been unbanned by ' + user.name
		);
		this.channelLeaveMsg(channel_id, body);
		this.notificationGateway.sendMessage([user.sub], 'User unbanned successfully');
	}

	@SubscribeMessage('kick')
	async handleKick(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const ret = await this.getPrivilegesFromBody(user.sub, body, channel_id);
		const channel = this.channelList.get(channel_id);
	
		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret && user.sub != body.target_id) return client.emit('onError', 'Lacking privileges');
		const targets = channel.get(body.target_id);
		if (user.sub === body.target_id) {
			this.channelLeaveMsg(channel_id, body);
			return this.notificationGateway.sendMessage([user.sub], 'You have left the room');
		}
		if (targets) {
			this.socketEmit(
				targets,
				'onMessage',
				'You have been kicked by ' + user.name + ' for reason: ' + body.message
			);
			this.socketDisconnect(targets);
		}
		this.channelLeaveMsg(channel_id, body);
		this.notificationGateway.sendMessage([user.sub], 'Successful kick');
	}

	@SubscribeMessage('message')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: Message) {
		if (!body)
			throw new WsException('No body');
		body.createdAt = new Date();
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const Validity = await this.messageService.addMessageToChannel(
			body,
			client.request.headers.authorization,
			Number(client.handshake.query.channel_id)
		);

		body.author.username = user.name;
		body.author.user_id = user.sub;
		if (Validity.message)
			body.message_id = Validity.message.message_id;
		if (Validity.check.ret) await this.sendMessageToChannel(user.sub, channel_id, body);
		else {
			client.emit('onMessage', Validity.check.msg);
			if (Validity.check.msg === 'User is banned') this.deleteUserFromList(client, user);
		}
	}

	@SubscribeMessage('checkPrivileges')
	async checkPrivileges(@ConnectedSocket() client: Socket, @MessageBody() body: Message) {
		if (!body)
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
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
		if (!body)
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);

		const ret = await this.channelService.checkPrivileges(
			user.sub,
			body.author.user_id,
			channel_id
		);
		if (user.sub != body.author.user_id && !ret.ret)
			return client.emit('onError', 'Lacking privileges');
		if (this.messageService.delMessage(body.message_id)) {
			await this.sendMessageToChannel(user.sub, channel_id, body, 'delMessage');
		} else {
		}
	}
}
