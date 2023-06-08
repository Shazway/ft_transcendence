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
import { WsexceptionFilter } from 'src/homepage/filters/wsexception/wsexception.filter';
import { UseFilters } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { cp } from 'fs';

@UseFilters(new WsexceptionFilter())
@WebSocketGateway(3002, {
	cors: {
		origin: 'http://localhost:4200'
	}
})
export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private channelList: Map<number, Map<number, Array<Socket>>>;
	DELEGATE_OWNERSHIP = 1;
	ADMIN_PROMOTION = 2;
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
		if (!channel)
			return client.disconnect();
		const isMember = await this.channelService.isUserMember(user.sub, channel_id);
		if (channel.is_dm && isMember)
			return this.addUserToList(client, user);
		else if (channel.is_dm)
			return client.disconnect();
		if (!channel.is_channel_private)
		{
			if (!isMember && channel.has_pwd && !client.handshake.query.pass || (!isMember && await this.channelService.isBanned(user.sub, channel_id)))
				return client.disconnect();
			await this.channelService.isMuted(user.sub, channel_id);
			if (!isMember)
			{
				if (!(await this.addUserToChannel(user.sub, channel_id, client.handshake.query.pass)))
					return client.disconnect();
			}
			this.sendSystemMessageToChannel(channel_id, user.sub, ' is online');
			this.addUserToList(client, user);
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
			return ;
		const chanUser = channel.get(user.sub);
		if (chanUser)
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

	async socketDisconnect(clients: Array<Socket>) {
		if (clients && clients.length)
		{
			clients.forEach((client) => {
				client.emit('onLeaveChannel');
				client.disconnect();
			});
		}
	}

	async sendMessageToChannel(sourceId: number, channel_id: number, message: Message, dest = 'onMessage') {
		const channel = this.channelList.get(channel_id);
		if (!channel)
			return false;
		channel.forEach(async (userSockets, key) => {
			if (message.author.user_id == 0 || !(await this.usersService.isBlockedCheck(key, sourceId)))
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
		const channel = await this.itemService.getChannel(chan_id);
		if (!channel || channel.is_dm || (channel.has_pwd && !pass))
			return false;
		const chan_user = new ChannelUserRelation();
		chan_user.is_creator = is_creator;
		chan_user.is_admin = is_admin;

		if (!channel.channel_password)
			return await this.itemService.addUserToChannel(chan_user, chan_id, user_id);
		else if (pass)
		{
			if (!(await bcrypt.compare(pass, channel.channel_password)))
				return false;
			return await this.itemService.addUserToChannel(chan_user, chan_id, user_id);
		}
		return true;
	}

	socketEmit(clients: Array<Socket>, eventDest: string, ...content: any[]) {
		if (clients)
			clients.forEach((client) => {
				client.emit(eventDest, content[0]);
			});
	}

	async sendSystemMessageToChannel(channel_id: number, targetId: number, content: string, dest = 'onMessage') {
		const user = await this.itemService.getUser(targetId);
		const channel = await this.itemService.getChannel(channel_id);
		if (!user || !channel)
			throw new WsException('User or Channel does not exist');
		await this.sendMessageToChannel(0, channel_id, {
			message_id: 0,
			message_content: user.username + content,
			author: { username: 'System', user_id: 0 },
			createdAt: new Date()
		}, dest);
		return true;
	}

	async getIdFromBody(body: Punishment)
	{
		if (body.target_id)
			return body.target_id;
		const userEntity = await this.itemService.getUserByUsername(body.username);
		if (!userEntity)
			return 0;
		return userEntity.user_id;
	}

	@SubscribeMessage('promote')
	async handleOp(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const targetId = await this.getIdFromBody(body);
		const ret = await this.channelService.checkPrivileges(user.sub, targetId, channel_id);
		const channel = this.channelList.get(channel_id);

		if (targetId == user.sub)
			throw new WsException('You cannot promote yourself');
		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
		if (await this.channelService.promoteUser(user.sub, targetId, channel_id) == this.DELEGATE_OWNERSHIP)
			this.sendSystemMessageToChannel(channel_id, user.sub, '', 'onDemote');
		this.sendSystemMessageToChannel(channel_id, targetId, '', 'onPromote');
		this.sendSystemMessageToChannel(channel_id, targetId, ' was promoted by ' + user.name);
		this.notificationGateway.sendMessage(user.sub, 'Successful promotion');
	}

	@SubscribeMessage('demote')
	async handleDemote(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const targetId = await this.getIdFromBody(body);
		const ret = await this.channelService.checkPrivileges(user.sub, targetId, channel_id);
		const channel = this.channelList.get(channel_id);

		if (targetId == user.sub)
			throw new WsException('You cannot unpromote yourself');
		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
		if (!(await this.channelService.demoteAdmin(targetId, channel_id)))
			return client.emit('onError', 'Error demoting');
		this.sendSystemMessageToChannel(channel_id, targetId, '', 'onDemote');
		this.sendSystemMessageToChannel(channel_id, targetId, ' was demoted by ' + user.name);
		this.notificationGateway.sendMessage(user.sub, 'Successful demotion');
	}

	@SubscribeMessage('friendInvite')
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
			return this.notificationGateway.sendMessage(user.sub, 'User blocked successfully');

		const channel_id = Number(client.handshake.query.channel_id);
		const channel = await this.itemService.getChannel(channel_id);
		if (channel && channel.is_dm)
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
		const channel = this.channelList.get(channel_id);
		const targetId = await this.getIdFromBody(body);
		const ret = await this.channelService.checkPrivileges(user.sub, targetId, channel_id);

		if (targetId == user.sub)
			throw new WsException(ret.msg);
		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret)
			return client.emit('onError', 'Lacking privileges');
		if (!(await this.channelService.hardMute(targetId, channel_id, body.time)))
			return client.emit('onError', 'Error while muting some dude');

		this.sendSystemMessageToChannel(channel_id, targetId, ' was muted by ' + user.name)
		this.notificationGateway.sendMessage(user.sub, 'Successful mute');
	}

	@SubscribeMessage('unmute')
	async handleUnmute(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const channel = this.channelList.get(channel_id);
		const targetId = await this.getIdFromBody(body);
		const ret = await this.channelService.checkPrivileges(user.sub, targetId, channel_id);

		if (!channel || !targetId)
			throw new WsException(ret.msg);
		if (!ret.ret) return client.emit('onError', 'Lacking privileges');
		if (!(await this.channelService.hardUnmuteUser(targetId, channel_id)))
			return client.emit('onError', 'Error while unmuting');
		this.sendSystemMessageToChannel(channel_id, targetId, ' was unmuted by ' + user.name);
		this.notificationGateway.sendMessage(user.sub, 'User unmuted successfully');
	}

	@SubscribeMessage('ban')
	async handleBan(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const targetId = await this.getIdFromBody(body);
		const ret = await this.channelService.checkPrivileges(user.sub, targetId, channel_id);
		const channel = this.channelList.get(channel_id);

		if (!targetId)
			throw new WsException(ret.msg);
		if (targetId == user.sub)
			throw new WsException('You cannot ban yourself');
		if (!channel)
			throw new WsException('Channel no longer exists');
		if (!ret.ret) return client.emit('onError', ret.msg);
		
		if (!(await this.channelService.hardBanUser(targetId, channel_id, body.time)))
			throw new WsException('Something went wrong');
		const targets = channel.get(targetId);
		this.sendSystemMessageToChannel(channel_id, targetId, ' was banned from the channel by ' + user.name + ' for ' + (body.time * 1000) + ' seconds');
		this.socketDisconnect(targets);
		this.notificationGateway.sendMessage(user.sub, 'Successful ban');
	}

	@SubscribeMessage('unban')
	async handleUnban(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const channel = this.channelList.get(channel_id);
		const targetId = await this.getIdFromBody(body);
		const ret = await this.channelService.checkPrivileges(user.sub, targetId, channel_id);

		if (!channel || !targetId)
			throw new WsException(ret.msg);
		if (!ret.ret) return client.emit('onError', ret.msg);
		if (!(await this.channelService.hardUnBanUser(targetId, channel_id)))
			return client.emit('onError', 'Error unbanning');
		this.sendSystemMessageToChannel(channel_id, targetId, ' was unbanned by ' + user.name);
		this.notificationGateway.sendMessage(user.sub, 'User unbanned successfully');
	}

	@SubscribeMessage('kick')
	async handleKick(@ConnectedSocket() client: Socket, @MessageBody() body: Punishment) {
		if (!body || (!body.target_id && !body.username))
			throw new WsException('No body');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);
		const channel = this.channelList.get(channel_id);
		const targetId = await this.getIdFromBody(body);
		const ret = await this.channelService.checkPrivileges(user.sub, targetId, channel_id);
	
		if (!channel || !targetId)
			throw new WsException(ret.msg);
		if (!ret.ret && user.sub != targetId) return client.emit('onError', 'Lacking privileges');
		if (user.sub === targetId && await this.channelService.isUserOwner(user.sub, channel_id))
			throw new WsException('Give owner permissions before leaving channel');
		if (!await this.channelService.hardKickUser(targetId, channel_id))
			return client.emit('onError', 'Error kicking');
		const targets = channel.get(targetId);
		if (user.sub === targetId) {
			this.sendSystemMessageToChannel(channel_id, targetId, ' left the chat');
			return this.notificationGateway.sendMessage(user.sub, 'You have left the room');
		}
		this.sendSystemMessageToChannel(channel_id, targetId, ' was kicked by ' + user.name);
		this.notificationGateway.sendMessage(user.sub, 'Successful kick');
		if (targets)
			this.socketDisconnect(targets);
	}

	@SubscribeMessage('message')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: Message) {
		if (!body || !body.message_content)
			throw new WsException('No body');
		else if (body.message_content.length > 255)
			throw new WsException('Message too long');
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		body.createdAt = new Date();
		const channel_id = Number(client.handshake.query.channel_id);
		const Validity = await this.messageService.addMessageToChannel(
			body,
			user.sub,
			channel_id
		);

		body.author.username = user.name;
		body.author.user_id = user.sub;
		if (Validity.message)
			body.message_id = Validity.message.message_id;
		if (Validity.check.ret) await this.sendMessageToChannel(user.sub, channel_id, body);
		else
			if (Validity.check.msg === 'User is banned') this.deleteUserFromList(client, user);
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

	@SubscribeMessage('isAdmin')
	async isAdmin(@ConnectedSocket() client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);

		if (!channel_id)
			throw new WsException('Channel doesn\'t exist.');

		client.emit('isAdmin', await this.channelService.isUserAdmin(user.sub, channel_id));
	}
	@SubscribeMessage('isOwner')
	async isOwner(@ConnectedSocket() client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const channel_id = Number(client.handshake.query.channel_id);

		if (!channel_id)
			throw new WsException('Channel doesn\'t exist.');

		client.emit('isOwner', await this.channelService.isUserOwner(user.sub, channel_id));
	}
}
