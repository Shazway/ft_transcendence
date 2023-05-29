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
import { NewChan } from '../../dtos/Chan.dto';
import { MessagesService } from 'src/homepage/services/messages/messages.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { NotificationsGateway } from 'src/homepage/gateway/notifications/notifications.gateway';
import { UserEntity } from 'src/entities';

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
		private notificationsGateway: NotificationsGateway
	) {}

	@Get('all')
	async getAllChannelsAllowed(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const channelList = await this.itemsService.getChannelsFromUser(user.sub);
		if (!channelList) return res.status(HttpStatus.OK).send(channelList);
		const filteredList = await Promise.all(channelList.map(async (channel) => {
				const isBanned = await this.channelService.isBanned(user.sub, channel.channel_id);
					if (!isBanned) {
						return channel;
				}
			}));
		filteredList.map((channel) => {
			if (channel.is_dm)
			{
				channel.us_channel.forEach((chanUser) => {
					if (chanUser.user.user_id != user.sub)
						channel.channel_name = chanUser.user.username;
				});
			}
		});
		const filteredChannelsWithoutNull = filteredList.filter((channel) => channel);
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
		if (!body || !body.channel_id || (!body.targetId && !body.username)) return res.status(HttpStatus.UNAUTHORIZED).send('No body');
		const userId = await this.getIdFromBody(body);
		if (!userId) return res.status(HttpStatus.UNAUTHORIZED).send('No body');
		const channelId = body.channel_id;
		const targetEntity = await this.itemsService.getUser(userId);

		if (!targetEntity|| targetEntity.channelInviteAuth == this.NOT_ALLOWED || this.channelService.isUserMember(userId, channelId))
			return res.status(HttpStatus.UNAUTHORIZED).send('Not allowed');
		else if ((targetEntity.channelInviteAuth == this.ALL_ALLOWED || (targetEntity.channelInviteAuth == this.FRIENDS_ALLOWED &&
				targetEntity.friend.find((friend) => friend.user_id == user.sub))) && await this.channelService.canInvite(user.sub, channelId))
		{
			const channelEntity = await this.itemsService.getChannel(channelId);
			await this.channelService.addUserToChannel(user.sub, channelId);
			this.notificationsGateway.onChannelInvite(user, targetEntity, channelEntity.channel_name);
			return res.status(HttpStatus.ACCEPTED).send('User added to channel successfully');
		}
		res.status(HttpStatus.UNAUTHORIZED).send('Not allowed' + targetEntity.channelInviteAuth);
	}

	@Post('inviteBySubstring')
	async getAllowedInviteBySub(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: {substring: string}) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !body.substring) return res.status(HttpStatus.UNAUTHORIZED).send('No body');
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
			return res.status(HttpStatus.UNAUTHORIZED).send('Either no body or channel name too long');
		const channelEntity = await this.channelService.createChannel(newChannel, user.sub);
		console.log(channelEntity);
		res.status(HttpStatus.OK).send({ msg: 'Channel created' });
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
		if (!userEntity) return res.status(HttpStatus.NOT_FOUND).send("You don't exist in the database, please log back in");
		messages = messages.filter((message) => {
			return !userEntity.blacklistEntry.find(
				(blockedUser) => blockedUser.user_id == message.author.user_id
			);
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
		if (!channel)
			res.status(HttpStatus.NOT_FOUND).send({ msg: 'No channels with id ' + chan_id });
		else res.status(HttpStatus.OK).send(channel);
	}
}
