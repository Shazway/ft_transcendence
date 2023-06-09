/* eslint-disable prettier/prettier */
import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Req,
	Res
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { NewChan, SerializedChan } from '../../dtos/Chan.dto';
import { MessagesService } from 'src/homepage/services/messages/messages.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { NotificationsGateway } from 'src/homepage/gateway/notifications/notifications.gateway';
import { UserEntity } from 'src/entities';
import { UsersService } from 'src/homepage/services/users/users.service';
import { plainToClass } from 'class-transformer';
import { ChannelGateway } from 'src/homepage/gateway/channel/channel.gateway';

@Controller('channels')
export class ChannelsController {
	public FRIENDS_ALLOWED = 1;
	public NOT_ALLOWED = 0;
	public ALL_ALLOWED = 2;
	constructor(
		private channelService: ChannelsService,
		private tokenManager: TokenManagerService,
		private messageService: MessagesService,
		private itemsService: ItemsService,
		private notificationsGateway: NotificationsGateway,
		private usersService: UsersService,
		private chanGateway: ChannelGateway
	) {}

	@Get('all')
	async getAllChannelsAllowed(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const channelList = await this.itemsService.getChannelsFromUser(user.sub);
		if (!channelList) return res.status(HttpStatus.OK).send(channelList);
		const filteredList = await Promise.all(channelList.map(async (channel) => {
				const isBanned = await this.channelService.isBanned(user.sub, channel.channel_id);
					if (!isBanned)
						return channel;
			}));
		filteredList.map((channel) => {
			if (channel && channel.is_dm)
			{
				channel.us_channel.forEach((chanUser) => {
					if (chanUser.user.user_id != user.sub)
						channel.channel_name = chanUser.user.username;
				});
			}
		});
		const filteredChannelsWithoutNull = filteredList.filter((channel) => channel);
		filteredChannelsWithoutNull.map((channel) => plainToClass(SerializedChan, channel));
		res.status(HttpStatus.OK).send(filteredChannelsWithoutNull);
	}

	async getIdFromBody(body: {channel_id: number, username: string, targetId: number})
	{
		if (body.targetId)
			return body.targetId;
		const userEntity = await this.itemsService.getUserByUsername(body.username);
		if (!userEntity)
			return 0;
		return userEntity.user_id;
	}

	@Post('invite')
	async inviteToChannel(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: { channel_id: number, username: string, targetId: number }
	) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !body.channel_id || (!body.targetId && !body.username)) return res.status(HttpStatus.OK).send('No body');
		else if (body.targetId == user.sub) return res.status(HttpStatus.OK).send('Unauthorized');
		else if (await this.usersService.isBlockedCheck(body.targetId, user.sub))
			return res.status(HttpStatus.OK).send('OK');

		const userId = await this.getIdFromBody(body);
		if (!userId) return res.status(HttpStatus.OK).send('No body');
		const channelId = body.channel_id;
		const targetEntity = await this.itemsService.getUser(userId);

		if (!targetEntity|| targetEntity.channelInviteAuth == this.NOT_ALLOWED || await this.channelService.isUserMember(userId, channelId))
			return res.status(HttpStatus.OK).send('Not allowed');
		else if ((targetEntity.channelInviteAuth == this.ALL_ALLOWED || ((targetEntity.channelInviteAuth == this.FRIENDS_ALLOWED &&
				targetEntity.friend.find((friend) => friend.user_id == user.sub))) && await this.channelService.canInvite(user.sub, channelId)))
		{
			const channelEntity = await this.itemsService.getChannel(channelId);
			await this.channelService.addUserToChannel(targetEntity.user_id, channelId);
			this.notificationsGateway.onChannelInvite(user, targetEntity, channelEntity.channel_name);
			this.chanGateway.sendSystemMessageToChannel(channelId, targetEntity.user_id, ' was added to the channel by ' + user.name);
			return res.status(HttpStatus.ACCEPTED).send('User added to channel successfully');
		}
		res.status(HttpStatus.OK).send('Not allowed' + targetEntity.channelInviteAuth);
	}

	@Post('delete')
	async deleteChannel(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: { channel_id: number })
	{
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !body.channel_id) return res.status(HttpStatus.OK).send('No body');
		const channelId = body.channel_id;
		if (await this.channelService.deleteChannel(channelId, user.sub))
			return res.status(HttpStatus.ACCEPTED).send('Success');
		res.status(HttpStatus.OK).send('Failure');
	}

	@Post('inviteBySubstring')
	async getAllowedInviteBySub(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: {substring: string}) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !body.substring) return res.status(HttpStatus.OK).send('No body');
		const sourceId = user.sub;

		let invitableUsers: UserEntity[];
		invitableUsers = await this.itemsService.getUsersBySubstring(body.substring);
		if (invitableUsers)
		{
			invitableUsers = invitableUsers.filter((user) => user.channelInviteAuth != this.NOT_ALLOWED);
			invitableUsers = invitableUsers.filter((user) => {
				if (user.channelInviteAuth == this.FRIENDS_ALLOWED && !(user.friend.find((friend) => friend.user_id == sourceId)))
					return false;
				return true;
			})
		}
		res.status(HttpStatus.OK).send(invitableUsers);
	}

	@Post('create')
	async createChannel(@Req() req: Request, @Res() res: Response, @Body() newChannel: NewChan) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!newChannel || !newChannel.channel_name || newChannel.channel_name.length > 41)
			return res.status(HttpStatus.OK).send('Either no body or channel name too long');
		const channelEntity = await this.channelService.createChannel(newChannel, user.sub);
		if (!channelEntity)
			return res.status(HttpStatus.OK).send({ msg: 'Password too long' })
		res.status(HttpStatus.OK).send({ msg: 'Channel created' });
	}

	@Post('rightPass')
	async rightPass(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: { channel_id: number, pass: string })
	{
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !body.channel_id || !body.pass) return res.status(HttpStatus.OK).send('No body');
		const channelId = body.channel_id;
		const pass = body.pass;
		const rightPass = await this.channelService.rightPass(channelId, pass);
		if (rightPass)
			await this.channelService.addUserToChannel(user.sub, channelId, pass);
		res.status(HttpStatus.ACCEPTED).send({rightPass: rightPass})
	}


	@Get(':id/messages/:page')
	async getChannelMessages(
		@Param('id', ParseIntPipe) chan_id: number,
		@Param('page', ParseIntPipe) page_num: number,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		let messages = await this.messageService.getPage(chan_id, page_num);

		const userEntity = await this.itemsService.getUser(user.sub);
		if (!userEntity) return res.status(HttpStatus.I_AM_A_TEAPOT);
		if (!(await this.channelService.isUserMember(user.sub, chan_id)))
			return res.status(HttpStatus.OK).send(null);
		messages = messages.filter((message) => {
			return !(userEntity.blacklistEntry.find((blockedUser) => blockedUser.user_id == message.author.user_id));
		});
		res.status(HttpStatus.OK).send(messages);
	}

	@Get(':id')
	async getChannel(
		@Param('id', ParseIntPipe) chan_id: number,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const channel = await this.channelService.getChannelById(chan_id);
		if (!channel || !(await this.channelService.isUserMember(user.sub, chan_id) || await this.channelService.isBanned(user.sub, chan_id)))
			res.status(HttpStatus.OK).send(null);
		else res.status(HttpStatus.OK).send(plainToClass(SerializedChan, channel));
	}
}
