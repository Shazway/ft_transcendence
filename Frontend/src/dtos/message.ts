import { User } from "./User.dto";


export interface Message {
	message_id : number;
	author : User;
	createdAt : Date;
	message_content : string;
	0: Message;
}

export interface LessMessage {
	message_id : number;
	author : {
		username: string,
		user_id: number,
	};
	createdAt : Date;
	message_content : string;
}
