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

@Controller('channels')
export class ChannelsController {
	public FRIENDS_ALLOWED = 1;
	public NOT_ALLOWED = 0;
	public ALL_ALLOWED = 2;
	constructor(
		private channelService: ChannelsService,
		private tokenManager: TokenManagerService,
		private messageService: MessagesService,
		private itemsService: ItemsService
	) {}

	@Get('all')
	async getPrivateChannels(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const channelList = await this.channelService.getAllChannelsFromUser(user.sub);
		if (!channelList) res.status(HttpStatus.NO_CONTENT).send({ msg: 'No channels registered' });
		else res.status(HttpStatus.OK).send(channelList);
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
			await this.channelService.addUserToChannel(user.sub, channelId);
			return res.status(HttpStatus.ACCEPTED).send('User added to channel successfully');
		}
		res.status(HttpStatus.UNAUTHORIZED).send('Not allowed' + targetEntity.channelInviteAuth);
	}

	@Post('create')
	async createChannel(@Req() req: Request, @Res() res: Response, @Body() newChannel: NewChan) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
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
		if (!userEntity) return res.status(HttpStatus.NOT_FOUND).send("You don't exist wtf");
		messages = messages.filter((message) => {
			return !userEntity.blacklistEntry.find(
				(blockedUser) => blockedUser.user_id == message.author.user_id
			);
		});
		if (!messages)
			res.status(HttpStatus.NOT_FOUND).send({ msg: 'No message in the channel: ' + chan_id });
		else res.status(HttpStatus.OK).send(messages);
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
