import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Req,
	Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { DeleteUser, NewChan, SerializedChan } from '../../dtos/Chan.dto';
import { plainToClass } from 'class-transformer';
import { MessagesService } from 'src/homepage/services/messages/messages.service';

@Controller('channels')
export class ChannelsController {
	constructor(
		private channelService: ChannelsService,
		private tokenManager: TokenManagerService,
		private messageService: MessagesService,
	) {}
	@Get('')
	async getUsersChannel(@Req() req: Request, @Res() res: Response) {
		const user = this.tokenManager.getUserFromToken(req);
		const channelList = await this.channelService.getAllChannelsFromUser(
			user.sub,
		);
		if (!channelList)
			return res.status(HttpStatus.NO_CONTENT).send({ msg: 'No channels registered' });
		const serializedChannels = channelList.map((channel) =>
			plainToClass(SerializedChan, channel),
		);
		return res.status(HttpStatus.OK).send(serializedChannels);
	}

	@Get('add_channel/:id')
	async addChannel(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', ParseIntPipe) chan_id: number,
	) {
		const user = this.tokenManager.getUserFromToken(req);
		const isCreated = await this.channelService.addUserToChannel(
			user.sub,
			chan_id,
		);
		if (!isCreated) res.status(HttpStatus.NOT_FOUND).send({ msg: 'user not added to channel' });
		else res.status(HttpStatus.OK).send({ msg: 'user added to channel' });
	}

	@Get('public')
	async getPublicChannels(@Req() req: Request, @Res() res: Response) {
		const channelList = await this.channelService.getPubChannels();
		if (!channelList) res.status(HttpStatus.NO_CONTENT).send({ msg: 'No channels registered' });
		else res.status(HttpStatus.OK).send(channelList);
	}
	@Get('all')
	async getPrivateChannels(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getIdFromToken(req);
		const channelList = await this.channelService.getAllChannelsFromUser(user);
		if (!channelList) res.status(HttpStatus.NO_CONTENT).send({ msg: 'No channels registered' });
		else res.status(HttpStatus.OK).send(channelList);
	}

	@Post('create')
	async createChannel(
		@Req() req: Request,
		@Res() res: Response,
		@Body() newChannel: NewChan,
	) {
		const user = this.tokenManager.getUserFromToken(req);
		const channelEntity = await this.channelService.createChannel(newChannel, user.sub);
		console.log(channelEntity);
		res.status(HttpStatus.OK).send({ msg: 'Channel created' });
	}

	@Delete('delete/:id')
	async deleteChannel(
		@Param('id', ParseIntPipe) chan_id: number,
		@Req() req: Request,
		@Res() res: Response,)
	{
		const user = this.tokenManager.getUserFromToken(req);
		await this.channelService.deleteChannel(chan_id, user.sub);
		res.status(HttpStatus.OK).send({ msg: 'Channel deleted' });
	}

	@Get(':id/messages/:page')
	async getChannelMessages(
		@Param('id', ParseIntPipe) chan_id: number,
		@Param('page', ParseIntPipe) page_num: number,
		@Req() req: Request,
		@Res() res: Response,
	) {
		const messages = await this.messageService.getPage(chan_id, page_num);
		if (!messages)
			res.status(HttpStatus.NOT_FOUND).send({ msg: 'No message in the channel: ' + chan_id });
		else res.status(HttpStatus.OK).send(messages);
	}

	@Get(':id')
	async getChannel(
		@Param('id', ParseIntPipe) chan_id: number,
		@Req() req: Request,
		@Res() res: Response,
	) {
		const channel = await this.channelService.getChannelById(chan_id);
		if (!channel)
			res.status(HttpStatus.NOT_FOUND).send({ msg: 'No channels with id ' + chan_id });
		else res.status(HttpStatus.OK).send(channel);
	}
}
