import { Header, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewUserDto } from '../../dtos/UserDto.dto';
import { UserEntity } from 'src/entities';
import { ItemsService } from '../items/items.service';
import { HttpService } from '@nestjs/axios';
import { IntraInfo } from 'src/homepage/dtos/ApiDto.dto';
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private readonly httpClient: HttpService,
		private itemsService: ItemsService,
	) {}
	
	async getIntraBody(accessToken: string) {
		let intraHeader: AxiosRequestConfig;
		intraHeader.headers.Authorization = 'Bearer ' + accessToken;
		return intraHeader;
	}

	async fetcIntraInfo(token: string) {
		return await axios
			.get<IntraInfo>('https://api.intra.42.fr/v2/me', {headers: {Authorization: 'Bearer ' + token}} );
	}

	async checkUserById(intra_id: number) {
		return this.itemsService.getUserByIntraId(intra_id);
	}

	async checkUserByName(username: string) {
		return this.itemsService.getUserByUsername(username);
	}

	async createUser(userDto: IntraInfo) {
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
