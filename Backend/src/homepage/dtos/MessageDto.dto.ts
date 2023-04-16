import { UserEntity } from 'src/entities';

export class MessageDto {
	message_content: string;
	createdAt: Date;
	author: {
		username: string;
		user_id?: number;
	};
}
