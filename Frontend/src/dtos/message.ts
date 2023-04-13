import { UserDto } from "./UserDto.dto";

export interface Message {
	message_id : number;
	author : UserDto;
	createdAt : Date;
	message_content : string;
}
