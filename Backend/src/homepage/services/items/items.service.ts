import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementsEntity, UserEntity } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ItemsService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepo: Repository<UserEntity>,
		@InjectRepository(AchievementsEntity)
		private readonly achieveRepo: Repository<AchievementsEntity>,
	) {}

	public async getAllUsers() {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.orderBy('username')
			.getMany();
		return user;
	}

	public async getLeaderboard() {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.orderBy('rank_score')
			.getMany();
		return user;
	}

	public async getAchievements() {
		const achieve = await this.achieveRepo
			.createQueryBuilder('achievements')
			.getMany();
		return achieve;
	}

	public async getAchievementsFromUser(id: number) {
		const user_achieve = await this.userRepo
			.createQueryBuilder('users')
			.leftJoinAndSelect('users.achievements', 'achievement')
			.where('users.user_id = :id', { id })
			.getOne();
		return user_achieve;
	}
}
