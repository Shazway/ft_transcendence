export class Message {
	message_id: number;
	message_content: string;
	createdAt: Date;
	author: {
		username: string;
		user_id?: number;
		img_url?: string;
	};
}
