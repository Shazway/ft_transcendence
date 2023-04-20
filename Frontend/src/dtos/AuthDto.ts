export interface AuthDto {
	resource_owner_id: number;
	scopes: string[];
	expires_in_seconds: number;
	application: {
		uid: string;
	};
	created_at: Date;
}
export interface LogInReturnDto {
	tokenInfo: TokenInfo;
	jwt_token: string;
	intraInfo: IntraInfo;
	created: boolean;
	user_id: number;
}
export interface AuthCode {
	access_token: string;
}

export interface IntraInfo {
	id: number;
	login: string;
	email: string;
	image: {link: string;}
}

export interface TokenInfo {
	access_token: string;
	token_type: string;
	expires_in: Date;
	scope: string[];
	created_at: Date;
}
