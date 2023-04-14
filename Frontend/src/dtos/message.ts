import { UserDto } from "./UserDto.dto";

export interface MessageDto {
	message_id : number;
	author : UserDto;
	createdAt : Date;
	message_content : string;
}

export interface LessMessageDto {
	message_id : number;
	author : {
		username: string,
		user_id: number,
	};
	createdAt : Date;
	message_content : string;
}
