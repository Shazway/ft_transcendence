import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { DeleteUserDto, NewChanDto, SerializedChanDto } from '../../dtos/ChanDto.dto';
import { plainToClass } from 'class-transformer';

@Controller('channels')
export class ChannelsController {
	constructor(private channelService: ChannelsService, private tokenManager: TokenManagerService) {}
	@Get('')
	async getUsersChannel(@Req() req: Request, @Res() res: Response) {
		const channelList = await this.channelService.getAllChannelsFromUser(this.tokenManager.getIdFromToken(req));
		if (!channelList) return res.status(HttpStatus.NO_CONTENT).send({ msg: 'No channels registered' });
		const serializedChannels = channelList.map((channel) => plainToClass(SerializedChanDto, channel));
		return res.status(HttpStatus.FOUND).send(serializedChannels);
	}

	@Get('add_channel/:id')
	async addChannel(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) chan_id: number) {
		const isCreated = await this.channelService.addUserToChannel(this.tokenManager.getIdFromToken(req), chan_id);
		if (!isCreated) res.status(HttpStatus.NOT_FOUND).send({ msg: 'user not added to channel' });
		else res.status(HttpStatus.OK).send({ msg: 'user added to channel' });
	}

	@Get('public')
	async getPublicChannel(@Req() req: Request, @Res() res: Response) {
		const channelList = await this.channelService.getPubChannels();
		if (!channelList) res.status(HttpStatus.NO_CONTENT).send({ msg: 'No channels registered' });
		else res.status(HttpStatus.FOUND).send(channelList);
	}

	@Post('create')
	async createChannel(@Req() req: Request, @Res() res: Response, @Body() newChannelDto: NewChanDto) {
		const userId = this.tokenManager.getIdFromToken(req);
		const channelEntity = await this.channelService.createChannel(newChannelDto, userId);
		console.log(channelEntity);
		res.status(HttpStatus.OK).send({ msg: 'Channel created' });
	}

	@Post('kick')
	async kickUser(@Req() req: Request, @Res() res: Response, @Body() deleteUserDto: DeleteUserDto) {
		const userId = this.tokenManager.getIdFromToken(req);
		console.log(deleteUserDto);
		console.log(userId);
		await this.channelService.kickUser(userId, deleteUserDto.target_id, deleteUserDto.channel_id);
		res.status(HttpStatus.OK).send({ msg: 'User kicked from channel' });
	}

	@Delete('delete/:id')
	async deleteChannel(@Param('id', ParseIntPipe) chan_id: number, @Req() req: Request, @Res() res: Response) {
		const userId = this.tokenManager.getIdFromToken(req);
		await this.channelService.deleteChannel(chan_id, userId);
		res.status(HttpStatus.OK).send({ msg: 'Channel deleted' });
	}

	@Get(':id')
	async getChannel(@Param('id', ParseIntPipe) chan_id: number, @Req() req: Request, @Res() res: Response) {
		const channel = await this.channelService.getChannelById(chan_id);
		if (!channel) res.status(HttpStatus.NOT_FOUND).send({ msg: 'No channels with id ' + chan_id });
		else res.status(HttpStatus.FOUND).send(channel);
	}
}
