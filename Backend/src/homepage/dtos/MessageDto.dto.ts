import { UserEntity } from 'src/entities';

export class MessageDto {
	message_content: string;
	author: {
		username: string;
		user_id?: number;
	};
}
