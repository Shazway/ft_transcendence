import { Injectable } from '@nestjs/common';
import { ItemsService } from '../items/items.service';
import { UserEntity } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectRepository(UserEntity)
		private user_repo: Repository<UserEntity>,
		private itemService: ItemsService,
	) {}

	async setUserStatus(user_id: number, status: number) {
		const user = await this.itemService.getUser(user_id);
		user.activity_status = status;
		this.user_repo.save(user);
	}

	async getUserStatus(user_id: number) {
		const user = await this.itemService.getUser(user_id);
		return user.activity_status;
	}
}
