import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkinEntity, UserEntity } from 'src/entities';
import { ItemsService } from '../items/items.service';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { IntraInfo } from 'src/homepage/dtos/Api.dto';
import { random } from 'mathjs';

@Injectable()
export class UsersService {
	public FRIENDS_ALLOWED = 1;
	public NOT_ALLOWED = 0;
	public ALL_ALLOWED = 2;
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private readonly httpClient: HttpService,
		private itemsService: ItemsService
	) {}

	async fetchIntraInfo(token: string) {
		return await axios.get<IntraInfo>('https://api.intra.42.fr/v2/me', {
			headers: { Authorization: 'Bearer ' + token }
		});
	}

	async checkUserByName(username: string) {
		return await this.itemsService.getUserByUsername(username);
	}

	async changeUserName(username: string, userId: number) {
		const userEntity = await this.itemsService.getUser(userId);

		userEntity.username = username;
		await this.userRepository.save(userEntity);
	}

	async createUser(userInfo: IntraInfo) {
		const user = new UserEntity();
		const checkName = await this.itemsService.getUserByUsername(user.username);
		const defaultPaddle = await this.itemsService.getSkinById(1);
		const defaultBall = await this.itemsService.getSkinById(2);
		const defaultBackGround = await this.itemsService.getSkinById(3);

		user.intra_id = userInfo.id;
		user.username = userInfo.login;
		if (checkName) user.username += Math.round(random(1000, 9999));
		user.img_url = userInfo.image.versions.large;
		user.rank_score = 100;
		if (user.username == 'ncaba') user.title = 'Overlord';
		if (user.username == 'tmoragli') {
			user.title = 'The machine';
			user.img_url = 'https://media.tenor.com/_eKN0xjdXNQAAAAd/zenitsu-agatsuma.gif';
		}
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
		return sourceUser.blacklistEntry.find((user) => targetUser.user_id == user.user_id);
	}

	async canInvite(userId: number, target_id: number) {
		const targetEntity = await this.itemsService.getUser(target_id);

		if (!targetEntity || targetEntity.channelInviteAuth == this.NOT_ALLOWED) return false;
		const friend = targetEntity.friend.find((friend) => userId == friend.user_id);
		if (targetEntity.channelInviteAuth == this.FRIENDS_ALLOWED && !friend) return false;

		return true;
	}
}
