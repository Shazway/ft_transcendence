import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { ItemsService } from '../items/items.service';
import { MessageDto } from 'src/homepage/dtos/MessageDto.dto';
import { TokenManagerService } from '../token-manager/token-manager.service';
import { ChannelsService } from '../channels/channels.service';
import { User } from 'src/entities/users.entity';
import { Channel } from 'src/entities/channels.entity';

@Injectable()
export class MessagesService {
	constructor(
		@InjectRepository(MessageEntity)
		private messageRepo: Repository<MessageEntity>,
		private itemsService: ItemsService,
		private channelService: ChannelsService,
		private tokenManager: TokenManagerService
	) {}

	error_tab = [
		{ ret: false, msg: 'User not found' },
		{ ret: false, msg: "Channel doesn't exist" },
		{ ret: false, msg: "User doesn't belong to channel" },
		{ ret: false, msg: 'User is muted' },
		{ ret: false, msg: 'User is banned' }
	];

	async isValidUserChannel(user: User, channel: Channel) {
		if (!user) return this.error_tab[0];
		if (!channel) return this.error_tab[1];
		if (!(await this.channelService.isUserMember(user.user_id, channel.channel_id)))
			return this.error_tab[2];
		if (await this.channelService.isMuted(user.user_id, channel.channel_id))
			return this.error_tab[3];
		if (await this.channelService.isBanned(user.user_id, channel.channel_id))
			return this.error_tab[4];
		return { ret: true, msg: 'Valid User' };
	}

	async addMessageToChannel(msg: MessageDto, token: string, channel_id: number) {
		const message = new MessageEntity();
		message.message_content = msg.message_content;

		const channel = await this.itemsService.getChannel(channel_id);
		const user = await this.itemsService.getUser(this.tokenManager.getToken(token).sub);
		const isValid = await this.isValidUserChannel(user, channel);
		if (!isValid.ret) return { check: isValid, message: null };
		message.author = user;
		message.channel = channel;
		message.createdAt = new Date();
		const messageEntity = await this.messageRepo.save(message);
		return { check: isValid, message: messageEntity };
	}

	async getMessage(msg_id: number) {
		return await this.itemsService.getMessage(msg_id);
	}

	async delMessage(msg_id: number) {
		const msg = await this.itemsService.getMessage(msg_id);
		if (!msg) return false;
		msg.is_visible = false;
		this.messageRepo.save(msg);
		return true;
	}

	async getPage(chan_id: number, page_num: number) {
		return await this.itemsService.getPage(chan_id, page_num);
	}
}
