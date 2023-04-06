import { Exclude } from 'class-transformer';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { Message } from 'src/entities/messages.entity';

export class NewChanDto {
	channel_name: string;
}

export class SerializedChanDto {
	channel_name: string;
	is_channel_private: boolean;
	us_channel: ChannelUser[];
	message: Message[];
	channel_id: number;
	@Exclude()
	channel_password: string;
}
