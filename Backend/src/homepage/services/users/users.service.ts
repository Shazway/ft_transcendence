import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import {
	CreateUserDto,
	SerializedUserDto,
	NewUserDto,
} from '../../dtos/CreateUser.dto';
import { User as UserEntity } from '../../../entities/users.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
	) {}

	users = new Array<CreateUserDto>();
	findUser(username: string) {
		return this.users.find((user) => user.username === username);
	}

	createUser(userDto: CreateUserDto) {
		userDto.createdAt = new Date();
		this.users.push(userDto);
	}

	//Might be useful later ?
	deleteUser(us: CreateUserDto) {
		if (!this.findUser(us.username)) return false;
		this.users.splice(this.users.indexOf(us) - 1, 1);
		return true;
	}

	createUserNew(userDto: NewUserDto) {
		const newUser = this.userRepository.create(userDto);
		return this.userRepository.save(newUser);
	}

	//Might be useful later ?
	// deleteUserNew(us: NewUserDto) {
	// 	if (!this.findUser(us.username)) return false;
	// 	this.users.splice(this.users.indexOf(us) - 1, 1);
	// 	return true;
	// }

	getAllUsers() {
		return this.users.map((user) => plainToClass(SerializedUserDto, user));
	}
}
