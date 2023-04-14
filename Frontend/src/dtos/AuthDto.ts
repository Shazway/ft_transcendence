export interface AuthDto {
	resource_owner_id: number;
	scopes: string[];
	expires_in_seconds: number;
	application: {
		uid: string;
	};
	created_at: Date;
}
export interface AuthCode {
	access_token: string;
}

export interface TokenDto {
	access_token: string;
	token_type: string;
	expires_in: Date;
	scope: string[];
	created_at: Date;
}
