import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { NewChanDto, SerializedChanDto } from '../../dtos/ChanDto.dto';
import { plainToClass } from 'class-transformer';

@Controller('channels')
export class ChannelsController {
	constructor(private channelService: ChannelsService, private tokenManager: TokenManagerService) {}
	@Get('')
	async getUsersChannel(@Req() req: Request, @Res() res: Response) {
		const channelList = await this.channelService.getAllChannelsFromUser(this.tokenManager.getIdFromToken(req));
		if (!channelList) res.status(HttpStatus.NO_CONTENT).send({ msg: 'No channels registered' });
		const serializedChannels = channelList.map((channel) => plainToClass(SerializedChanDto, channel));
		res.status(HttpStatus.FOUND).send(serializedChannels);
	}

	@Get('add_channel/:id')
	async addChannel(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) chan_id: number) {
		const isCreated = await this.channelService.addUserToChannel(this.tokenManager.getIdFromToken(req), chan_id);
		if (!isCreated) res.status(HttpStatus.NOT_FOUND).send({ msg: 'channel not added' });
		res.status(HttpStatus.OK).send({ msg: 'channel added' });
	}

	@Get('public')
	async getPublicChannel(@Req() req: Request, @Res() res: Response) {
		const channelList = await this.channelService.getPubChannels();
		if (!channelList) res.status(HttpStatus.NO_CONTENT).send({ msg: 'No channels registered' });
		res.status(HttpStatus.FOUND).send(channelList);
	}

	@Post('create')
	async createChannel(@Req() req: Request, @Res() res: Response, @Body() newChannelDto: NewChanDto) {
		const userId = this.tokenManager.getIdFromToken(req);
		const channelEntity = await this.channelService.createChannel(newChannelDto, userId);
		console.log(channelEntity);
		res.status(HttpStatus.OK).send({ msg: 'Channel created' });
	}

	@Delete('delete/:id')
	async deleteChannel(@Param('id', ParseIntPipe) chan_id: number, @Req() req: Request, @Res() res: Response) {
		console.log(chan_id);
		await this.channelService.deleteChannel(chan_id);
		res.status(HttpStatus.OK).send({ msg: 'Channel deleted' });
	}
}
