import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDto, SerializedUserDto } from '../../dtos/CreateUser.dto';

@Injectable()
export class UsersService {
	users = new Array<CreateUserDto>;

	findUser(username: string) {
		return this.users.find((user) => user.username === username);
	}

	createUser(userDto: CreateUserDto) {
		userDto.createdAt = new Date();
		this.users.push(userDto);
	}

	getAllUsers() {
		return this.users.map((user) => plainToClass(SerializedUserDto, user));
	}
}
