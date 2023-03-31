import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from 'src/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItemsService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly repo: Repository<UserEntity>,
	) {}

	public async getAllUsers() {
		const user = await this.repo
			.createQueryBuilder('user')
			.orderBy('username')
			.getMany();
		return user;
	}

	public async getLeaderboard() {
		const user = await this.repo
			.createQueryBuilder('user')
			.orderBy('rank_score')
			.getMany();
		return user;
	}
}
