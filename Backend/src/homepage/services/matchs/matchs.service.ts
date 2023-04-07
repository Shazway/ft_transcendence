import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchEntity, UserEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { ItemsService } from '../items/items.service';

@Injectable()
export class MatchsService {
	constructor(
	@InjectRepository(MatchEntity)
	private matchRepo: Repository<MatchEntity>,
	@InjectRepository(UserEntity)
	private userRepo: Repository<UserEntity>,
	private itemsService: ItemsService)
	{}
	
	public async createMatch() {
		const newMatch = this.matchRepo.create();
		return await this.matchRepo.save(newMatch);
	}

	public async addUserToMatch(user_id: number, match_id: number) {
		const user = await this.itemsService.getUser(user_id);
		const match = await this.itemsService.getMatch(match_id);

		if (!match) throw new HttpException('Match does not exist', HttpStatus.NOT_FOUND);
		else if (!user) throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
		else if	(!(await this.itemsService.addUserToMatch(user, match)))
			throw new HttpException('Failed to add user', HttpStatus.NOT_ACCEPTABLE);
		return true;
	}
}
