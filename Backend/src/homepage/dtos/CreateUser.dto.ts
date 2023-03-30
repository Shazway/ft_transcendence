import { Exclude } from 'class-transformer';

interface MatchHistory {
	id: number;
	result: string;
}

export class CreateUserDto {
	username: string;
	email: string;
	createdAt: Date;
	matchsHistory: MatchHistory[];
	rank: number;
}

export class SerializedUserDto {
	username: string;
	email: string;
	rank: number;

	@Exclude()
	createdAt: Date;
	@Exclude()
	matchsHistory: MatchHistory[];
}

export class NewUserDto {
	username: string;
}
