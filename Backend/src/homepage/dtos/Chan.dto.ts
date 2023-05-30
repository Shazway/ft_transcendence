import { Exclude } from 'class-transformer';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { Message } from 'src/entities/messages.entity';

export class NewChan {
	channel_name: string;
	is_channel_private: boolean;
	channel_password: string;
}

export class DeleteUser {
	channel_id: number;
	target_id: number;
}

export class SerializedChan {
	channel_name: string;
	is_channel_private: boolean;
	us_channel: ChannelUser[];
	message: Message[];
	channel_id: number;
	@Exclude()
	channel_password: string;
}
