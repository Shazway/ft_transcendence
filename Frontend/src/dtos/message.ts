import { UserDto } from "./UserDto.dto";

export interface MessageDto {
	message_id : number;
	author : UserDto;
	createdAt : Date;
	message_content : string;
}

export interface LessMessageDto {
	message_id : number;
	author : string;
	createdAt : Date;
	message_content : string;
}

