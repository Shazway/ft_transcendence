export class LogInReturn {
	tokenInfo: TokenInfo;
	jwt_token: string;
	intraInfo: IntraInfo;
	created: boolean;
}
export class Api {
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
	email: string;
	image: { link: string };
}

export class AuthCode {
	mail_code: string;
	id: string;
	api_code: string;
}

export class AuthPair {
	secret: string;
	intra_token: TokenInfo;
}
