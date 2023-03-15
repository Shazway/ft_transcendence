import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/controllers/dtos/CreateUser.dto';

@Injectable()
export class UsersService {
	users = [
		{
			username: 'tmoragli',
			email: 'tmoragli@student.42.fr',
			createdAt: new Date(),
			matchsHistory: [
				{ id: 1, result: '2/1' },
				{ id: 2, result: '8/0' },
			],
		},
		{
			username: 'tmoragli2',
			email: 'tmoragli2@student.42.fr',
			createdAt: new Date(),
			matchsHistory: [
				{ id: 1, result: '1/2' },
				{ id: 2, result: '0/8' },
			],
		},
		{
			username: 'tmoragli3',
			email: 'tmoragli3@student.42.fr',
			createdAt: new Date(),
			matchsHistory: [],
		},
	];
	findUser(username: string) {
		return this.users.find((user) => user.username === username);
	}

	createUser(userDto: CreateUserDto) {
		this.users.push(userDto);
	}
}
