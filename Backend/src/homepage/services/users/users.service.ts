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

	async checkUserById(intra_id: number) {
		return this.itemsService.getUserByIntraId(intra_id);
	}

	async checkUserByName(username: string) {
		return this.itemsService.getUserByUsername(username);
	}

	async createUser(userDto: NewUserDto) {
		const user = new UserEntity;
		user.user_id = userDto.id;
		user.username = userDto.login;
		user.img_url = userDto.image.link;
		user.rank_score = 100;
		const newUser = this.userRepository.create(user);
		return this.userRepository.save(newUser);
	}
	async getAllUsers() {
		const userList = await this.itemsService.getAllUsers();
		if (userList.length === 0) return null;
		return userList;
	}
}
