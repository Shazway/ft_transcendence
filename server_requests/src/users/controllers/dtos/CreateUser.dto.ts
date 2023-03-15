interface MatchHistory {
	id: number;
	result: string;
}

export class CreateUserDto {
	username: string;
	email: string;
	createdAt: Date;
	matchsHistory: MatchHistory[];
}
