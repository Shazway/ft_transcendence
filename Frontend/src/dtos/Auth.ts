
export interface LogInReturn {
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
	image: {
		link: string,
		versions: {
			large: string,
			small: string,
			medium: string,
			micro: string,
		},
	};
}

export interface TokenInfo {
	access_token: string;
	token_type: string;
	expires_in: Date;
	scope: string[];
	created_at: Date;
}
