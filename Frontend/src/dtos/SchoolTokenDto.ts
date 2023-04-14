import { UserDto } from "./UserDto.dto";

export interface SchoolTokenDto {
	access_token : string;
	token_type : string;
	expires_in : number;
	scope : string;
	created_at : Date;
}