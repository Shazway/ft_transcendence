export class ApiDto {
	s_key: string;
	u_key: string;
}
export class TokenDto {
	access_token: string;
	token_type: string;
	expires_in: Date;
	scope: string[];
	created_at: Date;
}

export class AuthCode {
	code: string;
}
