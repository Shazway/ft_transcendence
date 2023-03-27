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
}

export class SerializedUserDto {
	username: string;
	email: string;

	@Exclude()
	createdAt: Date;
	@Exclude()
	matchsHistory: MatchHistory[];
}

export class NewUserDto {
	username: string;
}
