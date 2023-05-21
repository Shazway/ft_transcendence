import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchEntity, MatchSettingEntity, UserEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { ItemsService } from '../items/items.service';
import { MatchSetting } from 'src/entities/match_setting.entity';

@Injectable()
export class MatchsService {
	constructor(
		@InjectRepository(MatchEntity)
		private matchRepo: Repository<MatchEntity>,
		@InjectRepository(MatchSettingEntity)
		private matchSettingRepo: Repository<MatchSetting>,
		@InjectRepository(UserEntity)
		private usersRepo: Repository<UserEntity>,
		private itemsService: ItemsService
	) {}

	async createRankedMatchSetting() {
		const Settings = new MatchSettingEntity();
		Settings.is_ranked = true;
		Settings.score_to_win = 5;
		Settings.round_to_win = 3;
		const newSettings = this.matchSettingRepo.create(Settings);
		return await this.matchSettingRepo.save(newSettings);
	}

	//For new matchmaking based matches
	public async createMatch(playerOne: UserEntity, playerTwo: UserEntity, isCustom: boolean) {
		const match = new MatchEntity();
		const users = [playerOne, playerTwo];
		const scores = [0, 0];

		match.current_score = scores;
		match.round_won = scores;
		match.user = users;
		match.is_victory = [false, false];
		match.match_timer = 300;
		const newMatch = this.matchRepo.create(match);
		return await this.matchRepo.save(newMatch);
	}

	async createFullMatch(playerOne: number, playerTwo: number, isCustom: boolean) {
		const userOne = await this.itemsService.getUser(playerOne);
		const userTwo = await this.itemsService.getUser(playerOne);
		if (!userOne || !userTwo) return null;
		const match = await this.createMatch(userOne, userTwo, isCustom);
		if (!match) return null;
		await this.createRankedMatchSetting();
		userOne.match_history.push(match);
		userTwo.match_history.push(match);
		await this.usersRepo.save([userOne, userTwo]);
		return await this.matchRepo.save(match);
	}

	//For custom matches
	public async addUserToMatch(user_id: number, match_id: number) {
		const user = await this.itemsService.getUser(user_id);
		const match = await this.itemsService.getMatch(match_id);

		if (!user || !match) return false;
		if (!(await this.itemsService.addUserToMatch(user, match))) return false;
		return true;
	}

	public async setMatchEnd(matchEntity: MatchEntity) {
		matchEntity.is_ongoing = false;
		await this.matchRepo.save(matchEntity);
	}
}
