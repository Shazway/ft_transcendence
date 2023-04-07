import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelEntity, ChannelUserRelation, MessageEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { ItemsService } from '../items/items.service';
import { MessageDto } from 'src/homepage/dtos/MessageDto.dto';
import { plainToClass } from 'class-transformer';
import { TokenManagerService } from '../token-manager/token-manager.service';

@Injectable()
export class MessagesService {
	constructor(
		@InjectRepository(MessageEntity)
		private messageRepo: Repository<MessageEntity>,
		private itemsService: ItemsService,
		private tokenManager: TokenManagerService,
	) {}

	async addMessageToChannel(msg: MessageDto[]) {
		const message = new MessageEntity();
		message.message_content = msg[0].content;

		const channel = await this.itemsService.getChannel(msg[1].channel_id);
		const chan_user = await this.itemsService.getUserChan(
			this.tokenManager.getToken(msg[1].auth).sub,
			msg[1].channel_id,
		);
		if (chan_user.length <= 0) throw new HttpException('Not a member', HttpStatus.NOT_FOUND);
		message.author = chan_user[0];
		message.channel = channel;
		message.createdAt = new Date();
		this.messageRepo.save(message);
	}
}
