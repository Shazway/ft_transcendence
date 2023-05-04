import { User } from "./User.dto";

export interface SchoolToken {
	access_token : string;
	token_type : string;
	expires_in : number;
	scope : string;
	created_at : Date;
}