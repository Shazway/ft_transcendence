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

	//Might be useful later ?
	/*deleteUser(us: CreateUserDto) {
		if (!this.findUser(us.username))
			return false;
		this.users.splice(this.users.indexOf(us), 1);
		return true;
	}*/

	getAllUsers() {
		return this.users.map((user) => plainToClass(SerializedUserDto, user));
	}
}
