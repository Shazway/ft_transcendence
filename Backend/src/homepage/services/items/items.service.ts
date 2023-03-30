import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItemsService {
	constructor(
		@InjectRepository(User) private readonly repo: Repository<User>,
	) {}

	public async getAllUsers() {
		return await this.repo.find();
	}
}
