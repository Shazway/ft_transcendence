import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewUserDto } from '../../dtos/UserDto.dto';
import { UserEntity } from 'src/entities';
import { ItemsService } from '../items/items.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private itemsService: ItemsService,
	) {}

	async createUser(userDto: NewUserDto) {
		const newUser = this.userRepository.create(userDto);
		return this.userRepository.save(newUser);
	}
	async getAllUsers() {
		const userList = await this.itemsService.getAllUsers();
		if (userList.length === 0) return null;
		return userList;
	}
}
