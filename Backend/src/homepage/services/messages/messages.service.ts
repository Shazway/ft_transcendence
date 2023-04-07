import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { ItemsService } from '../items/items.service';
import { MessageDto } from 'src/homepage/dtos/MessageDto.dto';
import { TokenManagerService } from '../token-manager/token-manager.service';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class MessagesService {
	constructor(
		@InjectRepository(MessageEntity)
		private messageRepo: Repository<MessageEntity>,
		private itemsService: ItemsService,
		private channelService: ChannelsService,
		private tokenManager: TokenManagerService,
	) {}

	async addMessageToChannel(msg: MessageDto[]) {
		const message = new MessageEntity();
		message.message_content = msg[0].content;

		const channel = await this.itemsService.getChannel(msg[1].channel_id);
		const user = await this.itemsService.getUser(this.tokenManager.getToken(msg[1].auth).sub);
		if (!user || !(await this.channelService.isUserMember(user.user_id, channel.channel_id))) return false;
		message.author = user;
		message.channel = channel;
		message.createdAt = new Date();
		this.messageRepo.save(message);
		return true;
	}
}
