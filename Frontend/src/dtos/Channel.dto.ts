import { Message } from "./message";

export interface Channel {
	channel_id: number;
	channel_name: string;
	channel_password: string;
	is_channel_private: boolean;
	is_dm: boolean;
	messages: Message;
	us_channel: any;
}
