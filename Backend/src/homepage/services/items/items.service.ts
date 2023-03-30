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
		const users = await this.repo.find();
		return users;
	}
}
