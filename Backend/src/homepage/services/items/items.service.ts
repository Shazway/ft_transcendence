/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementsEntity, ChannelEntity, ChannelUserRelation, FriendrequestRelation, MatchEntity, MatchSettingEntity, MessageEntity, UserEntity } from 'src/entities';
import { ChannelUser } from 'src/entities/channel_user.entity';
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

	public sendOptionRes(@Res() res) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
		res.status(HttpStatus.NO_CONTENT).send();
	}

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

	public async getUserByUsername(username: string) {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.achievement', 'achievement')
			.leftJoinAndSelect('user.friend', 'friend')
			.leftJoinAndSelect('user.blacklistEntry', 'blacklistEntry')
			.leftJoinAndSelect('user.channel', 'channel')
			.leftJoinAndSelect('user.match_history', 'match_history')
			.where('user.username = :username', { username })
			.getOne();
		return user;
	}

	public async getUserByIntraId(intra_id: number) {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.achievement', 'achievement')
			.leftJoinAndSelect('user.friend', 'friend')
			.leftJoinAndSelect('user.blacklistEntry', 'blacklistEntry')
			.leftJoinAndSelect('user.channel', 'channel')
			.leftJoinAndSelect('user.match_history', 'match_history')
			.where('user.intra_id = :intra_id', { intra_id })
			.getOne();
		return user;
	}
	
	public async getChannel(id: number) {
		const channel = await this.chanRepo
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.us_channel', 'us_channel')
			.leftJoinAndSelect('us_channel.user', 'user')
			.leftJoinAndSelect('channel.message', 'message')
			.where('channel.channel_id = :id', { id })
			.getOne();
		return channel;
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
			.getMany();
		return chan_user;
	}

	public async getAllChannels() {
		const chan_list = await this.chanRepo
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.us_channel', 'channel_user')
			.leftJoinAndSelect('channel.message', 'message')
			.getMany();
		return chan_list;
	}

	public async getAllPbChannels() {
		const chan_user = await this.chanRepo
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.us_channel', 'channel_user')
			.leftJoinAndSelect('channel.message', 'message')
			.where('channel.is_channel_private = false')
			.getMany();
		return chan_user;
	}

	public async getAllChannelsFromUser(id: number) {
		const channels = await this.chanRepo.createQueryBuilder('channel')
			.innerJoin('channel.us_channel', 'channel_user')
			.where('channel_user.user = :id', { id })
			.orderBy('channel.is_channel_private')
			.getMany();
		return channels;
	}

	// public async getPublicChannelsFromUser(id: number) {
	// 	const pb_channels = this.chanRepo.createQueryBuilder('channel')
	// 	.innerJoin('channel.us_channel', 'channel_user')
	// 	.where('channel_user.channel_user_id = :userId', { id })
	// 	.andWhere('channel.is_channel_private = false')
	// 	.getMany();
	// 	return pb_channels
	// }

	public async getPvChannelsFromUser(id: number) {
		const pv_channels = await this.chanRepo.createQueryBuilder('channel')
		.innerJoin('channel.us_channel', 'channel_user')
		.where('channel_user.channel_user_id = :id', { id })
		.andWhere('channel.is_channel_private = true')
		.getMany();
		return pv_channels
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
	
	public async getPage(chan_id: number, page_num: number) {
		const maxResult = 25;
		const message = await this.messageRepo
			.createQueryBuilder('message')
			.leftJoinAndSelect('message.author', 'author')
			.where('message.channel = :chan_id', { chan_id })
			.andWhere('message.is_visible = true')
			.orderBy('message.message_id', 'DESC')
			.take(maxResult)
			.skip(page_num * maxResult)
			.getMany();
		return message;
	}
	
	public async getMatch(id: number) {
		const match = await this.matchRepo
		.createQueryBuilder('match')
		.leftJoinAndSelect('match.user', 'user')
		.where('match.match_id = :id', { id })
		.getOne();
		return match;
	}
	
	public async getUserChan(user_id: number, channel_id: number)
	{
		const userChan = await this.chan_userRepo
			.createQueryBuilder('channel_user')
			.innerJoinAndSelect('channel_user.channel', 'channel')
			.innerJoinAndSelect('channel_user.user', 'user')
			.where("user.user_id = :user_id", {user_id})
			.andWhere("channel.channel_id = :channel_id", {channel_id})
			.getMany();
		return (userChan);
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
		const achievement = await this.achieveRepo.findOneBy({
			achievement_id,
		});

		user.achievement.push(achievement);
		await this.userRepo.save(user);
	}

	public async addFriendToUser(
		user_id: number,
		friend_id: number,
	) {
		const user = await this.getUser(user_id);
		const friend = await this.getUser(friend_id);

		user.friend.push(friend);
		friend.friend.push(user);
		await this.userRepo.save([user, friend]);
	}

	public async removeFriendFromUsers(
		source: UserEntity,
		friend: UserEntity,
	) {
		if (!(source && friend))
			return false;
		source.friend = source.friend.filter((source) => source.user_id === friend.user_id);
		friend.friend = friend.friend.filter((user) => user.user_id === source.user_id);
		await this.userRepo.save([source, friend]);
		return true;
	}

	public async blockUser(source_id: number, target_id: number)
	{
		const sourceUser = await this.getUser(source_id);
		const targetUser = await this.getUser(target_id);

		if (!(sourceUser && targetUser))
			return false;
		if (sourceUser.friend.find((user) => user.user_id === targetUser.user_id))
			await this.removeFriendFromUsers(sourceUser, targetUser);
		sourceUser.blacklistEntry.push(targetUser);
		this.userRepo.save(sourceUser);
		return true;
	}

	public async unblockUser(source_id: number, target_id: number)
	{
		const sourceUser = await this.getUser(source_id);

		if (!sourceUser)
			return false;
		sourceUser.blacklistEntry = sourceUser.blacklistEntry.filter((user) => user.user_id === target_id);
		this.userRepo.save(sourceUser);
		return true;
	}

	public async addUserToChannel(
		chan_user: ChannelUser,
		channel_id: number,
		user_id: number,
	)
	{
		const user = await this.getUser(user_id);
		const channel = await this.getChannel(channel_id);

		const chanUser = (await this.getUserChan(user_id, channel_id))
		if (chanUser.length)
			return ;
		chan_user.user = user;
		chan_user.channel = channel;
		channel.us_channel.push(chan_user);
		user.channel.push(chan_user);
		await this.userRepo.save(user);
		await this.chanRepo.save(channel);
		await this.chan_userRepo.save(chan_user);
	}

	public async addUserToMatch(user: UserEntity, match: MatchEntity)
	{
		if (!match.is_ongoing)
		return false;
		match.user.push(user);
		this.matchRepo.save(match);
	}
	
	public async endMatch(match: MatchEntity)
	{
		match.is_ongoing = false;
		match.is_victory[0] = (match.round_won[0] > match.round_won[1]);
		match.is_victory[1] = !match.is_victory[0];
		match.user[0].match_history.push(match);
		match.user[1].match_history.push(match);
	}

}
