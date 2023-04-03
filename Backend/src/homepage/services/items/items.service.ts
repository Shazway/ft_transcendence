/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementsEntity, ChannelEntity, ChannelUserRelation, FriendrequestRelation, MatchEntity, MatchSettingEntity, MessageEntity, UserEntity } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ItemsService {
	constructor(
		@InjectRepository(UserEntity)
			private readonly userRepo: Repository<UserEntity>,
		@InjectRepository(AchievementsEntity)
			private readonly achieveRepo: Repository<AchievementsEntity>,
		@InjectRepository(ChannelUserRelation)
			private readonly chan_userRepo: Repository<ChannelUserRelation>,
		@InjectRepository(ChannelEntity)
			private readonly chanRepo: Repository<ChannelEntity>,
		@InjectRepository(FriendrequestRelation)
			private readonly friend_requestRepo: Repository<FriendrequestRelation>,
		@InjectRepository(MatchSettingEntity)
			private readonly match_settingRepo: Repository<MatchSettingEntity>,
		@InjectRepository(MatchEntity)
			private readonly matchRepo: Repository<MatchEntity>,
		@InjectRepository(MessageEntity)
			private readonly messageRepo: Repository<MessageEntity>,
	) {}
	tabRepo = [
		{ name: 'user', repo: this.userRepo },
		{ name: 'achievement', repo: this.achieveRepo },
		{ name: 'channel_user', repo: this.chan_userRepo },
		{ name: 'channel', repo: this.chanRepo },
		{ name: 'friend_request', repo: this.friend_requestRepo },
		{ name: 'match_setting', repo: this.match_settingRepo },
		{ name: 'match', repo: this.matchRepo },
		{ name: 'message', repo: this.messageRepo },
	];

	public async getAllUsers() {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.orderBy('username')
			.getMany();
		return user;
	}

	public async getUser(id: number) {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.achievement', 'achievement')
			.leftJoinAndSelect('user.friend', 'friend')
			.leftJoinAndSelect('user.blacklistEntry', 'blacklistEntry')
			.leftJoinAndSelect('user.channel', 'channel')
			.leftJoinAndSelect('user.match_history', 'match_history')
			.where('user.user_id = :id', { id })
			.getOne();
		return user;
	}
	
	public async getAchievement(id: number) {
		const achieve = await this.achieveRepo
			.createQueryBuilder('achievement')
			.leftJoinAndSelect('achievement.user', 'user')
			.where('achievement.achievement_id = :id', { id })
			.getOne();
		return achieve;
	}
	
	public async getChannelUser(id: number) {
		const chan_user = await this.chan_userRepo
			.createQueryBuilder('channel_user')
			.leftJoinAndSelect('channel_user.user', 'user')
			.leftJoinAndSelect('channel_user.channel', 'channel')
			.leftJoinAndSelect('channel_user.message', 'message')
			.where('channel_user.channel_user_id = :id', { id })
			.getOne();
		return chan_user;
	}
	
	public async getFriendrequest(id: number) {
		const friend_request = await this.friend_requestRepo
			.createQueryBuilder('friend_request')
			.leftJoinAndSelect('friend_request.sender', 'sender')
			.leftJoinAndSelect('friend_request.receiver', 'receiver')
			.where('friend_request.id = :id', { id })
			.getOne();
		return friend_request;
	}
	
	public async getMatchSetting(id: number) {
		const match_setting = await this.match_settingRepo
			.createQueryBuilder('match_setting')
			.leftJoinAndSelect('match_setting.match', 'match')
			.where('match_setting.match_setting_id = :id', { id })
			.getOne();
		return match_setting;
	}
	
	public async getMessage(id: number) {
		const message = await this.messageRepo
			.createQueryBuilder('message')
			.leftJoinAndSelect('message.author', 'author')
			.leftJoinAndSelect('message.channel', 'channel')
			.where('message.message_id = :id', { id })
			.getOne();
		return message;
	}
	
	public async getMatch(id: number) {
		const match = await this.matchRepo
			.createQueryBuilder('match')
			.leftJoinAndSelect('match.user', 'user')
			.leftJoinAndSelect('match.matchSetting', 'matchSetting')
			.where('match.match_id = :id', { id })
			.getOne();
		return match;
	}

	public async getItem(tableName: string, id: number) {
		for (const val of this.tabRepo) {
			if (val.name === tableName)
				return await val.repo
					.createQueryBuilder(tableName)
					.where(tableName + '.' + tableName + '_id = :id', { id })
					.getOne();
		}
		return null;
	}
	public async getTable(tableName: string) {
		for (const val of this.tabRepo) {
			if (val.name === tableName)
				return await val.repo
					.createQueryBuilder(tableName)
					.getMany();
		}
		return null;
	}

	public async getItemByRelation(	tableName: string,
										relation: string,
										id: number,)
	{
		for (const val of this.tabRepo) {
			if (val.name === tableName)
			{
				const ret = await val.repo
					.createQueryBuilder(tableName)
					.leftJoinAndSelect(tableName + '.' + relation, relation)
					.where(tableName + '.' + tableName + '_id = :id', { id })
					.getOne();
				return ret;
			}
		}
		return null;
	}

	public async getLeaderboard() {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.orderBy('rank_score')
			.getMany();
		return user;
	}

	public async addAchievementsToUser(
		user_id: number,
		achievement_id: number,
	) {
		const user = await this.getUser(user_id);
		console.log(user);
		const achievement = await this.achieveRepo.findOneBy({
			achievement_id,
		});
		console.log(achievement);

		user.achievement.push(achievement);
		await this.userRepo.save(user);
	}

	public async addFriendToUser(
		user_id: number,
		friend_id: number,
	) {
		const user = await this.getUser(user_id);
		console.log(user);
		const friend = await this.getUser(friend_id);
		console.log(friend);

		user.friend.push(friend);
		friend.friend.push(user);
		await this.userRepo.save([user, friend]);
	}
}
