import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewChanDto } from 'src/homepage/dtos/ChanDto.dto';
import { Repository } from 'typeorm';
import { ItemsService } from '../items/items.service';
import { ChannelEntity } from 'src/entities';
import { ChannelUser } from 'src/entities/channel_user.entity';

@Injectable()
export class ChannelsService {
	constructor(
		@InjectRepository(ChannelEntity)
		private chan_repo: Repository<ChannelEntity>,
		private itemsService: ItemsService,
	) {}

	async createChannel(chanDto: NewChanDto) {
		const newChan = this.chan_repo.create(chanDto);
		return this.chan_repo.save(newChan);
	}
	//DELETE THE REST TO BE ADDED (messages, user_channels etc...)
	async deleteChannel(chan_id: number) {
		return this.chan_repo.delete(chan_id);
	}
	async getPubChannels() {
		const pubChanList = await this.itemsService.getAllPbChannels();
		return pubChanList;
	}
	async getPvChannelsFromUser(id: number) {
		const pvChanList = await this.itemsService.getPvChannelsFromUser(id);
		return pvChanList;
	}
	async getAllChannelsFromUser(id: number) {
		const channel_list = await this.itemsService.getAllChannelsFromUser(id);
		return channel_list;
	}
	async addUserToChannel(user_id: number, chan_id: number, pass?: string) {
		const chan_user = new ChannelUser();

		if (!(await this.itemsService.getChannel(chan_id)).channel_password)
			this.itemsService.addUserToChannel(chan_user, chan_id, user_id);
		else if (pass === (await this.itemsService.getChannel(chan_id)).channel_password)
			this.itemsService.addUserToChannel(chan_user, chan_id, user_id);
		else return false;
		return true;
	}
}
