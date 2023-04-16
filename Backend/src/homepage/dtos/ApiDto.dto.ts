export class LogInReturnDto {
	tokenInfo: TokenInfo;
	jwt_token: string;
	intraInfo: IntraInfo;
	created: boolean;
}
export class ApiDto {
	s_key: string;
	u_key: string;
}
export class TokenInfo {
	access_token: string;
	token_type: string;
	expires_in: Date;
	scope: string[];
	created_at: Date;
}

export class IntraInfo {
	id: number;
	login: string;
	image: { link: string };
}

export class AuthCode {
	code: string;
}
