import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkinEntity, UserEntity } from 'src/entities';
import { ItemsService } from '../items/items.service';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosRequestConfig } from 'axios';
import { IntraInfo } from 'src/homepage/dtos/Api.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private readonly httpClient: HttpService,
		private itemsService: ItemsService
	) {}

	async getIntraBody(accessToken: string) {
		let intraHeader: AxiosRequestConfig;
		intraHeader.headers.Authorization = 'Bearer ' + accessToken;
		return intraHeader;
	}

	async fetchIntraInfo(token: string) {
		return await axios.get<IntraInfo>('https://api.intra.42.fr/v2/me', {
			headers: { Authorization: 'Bearer ' + token }
		});
	}

	async checkUserById(intra_id: number) {
		return this.itemsService.getUserByIntraId(intra_id);
	}

	async checkUserByName(username: string) {
		return this.itemsService.getUserByUsername(username);
	}

	async changeUserName(username: string, userId: number) {
		const userEntity = await this.itemsService.getUser(userId);

		userEntity.username = username;
		await this.userRepository.save(userEntity);
	}

	async createUser(userInfo: IntraInfo) {
		const user = new UserEntity();
		const defaultPaddle = await this.itemsService.getSkinById(1);
		const defaultBall = await this.itemsService.getSkinById(2);
		const defaultBackGround = await this.itemsService.getSkinById(3);

		user.intra_id = userInfo.id;
		user.username = userInfo.login;
		user.img_url = userInfo.image.versions.large;
		user.rank_score = 100;
		if (user.username == 'ncaba') user.title = 'Overlord';
		if (user.username == 'tmoragli') user.title = 'The machine';
		if (user.username == 'mdelwaul') user.title = 'Break CTO';
		const newUser = this.userRepository.create(user);
		newUser.skin = new Array<SkinEntity>();
		newUser.skin.push(defaultBackGround, defaultBall, defaultPaddle);
		return await this.userRepository.save(newUser);
	}
	async getAllUsers() {
		const userList = await this.itemsService.getAllUsers();
		if (userList.length === 0) return null;
		return userList;
	}

	async isBlockedCheck(sourceId: number, suspectId: number) {
		if (sourceId == 0) return false;
		const sourceUser = await this.itemsService.getUser(sourceId);
		const targetUser = await this.itemsService.getUser(suspectId);

		if (!sourceUser || !targetUser) return true;
		sourceUser.blacklistEntry.forEach((blockedUser) => {
			if (blockedUser.user_id == suspectId) return true;
		});
		return false;
	}
}
