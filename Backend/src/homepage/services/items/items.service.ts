/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementsEntity, ChannelEntity, ChannelUserRelation, FriendrequestRelation, MatchEntity, MatchSettingEntity, MessageEntity, SkinEntity, UserEntity } from 'src/entities';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { pongObject } from 'src/homepage/dtos/Pong.dto';
import { ApplyProfile } from 'src/homepage/dtos/User.dto';
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
		@InjectRepository(SkinEntity)
		private readonly skinRepo: Repository<SkinEntity>,
	) {}

	public sendOptionRes(@Res() res) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
		res.status(HttpStatus.NO_CONTENT).send();
	}

	public async saveMatchState(match: MatchEntity) {
		await this.matchRepo.save(match);
	}

	public async getAllUsers() {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.orderBy('username')
			.getMany();
		return user;
	}

	public async getSkins() {
		return await this.skinRepo.createQueryBuilder('skin').getMany();
	}

	public async getUser(id: number) {
		const user = await this.userRepo
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.achievement', 'achievement')
			.leftJoinAndSelect('user.friend', 'friend')
			.leftJoinAndSelect('user.blacklistEntry', 'blacklistEntry')
			.leftJoinAndSelect('user.channel', 'channel')
			.leftJoinAndSelect('user.match_history', 'match_history')
			.leftJoinAndSelect('match_history.user', 'users')
			.leftJoinAndSelect('user.sentFriendRequests', 'sentFriendRequests')
			.leftJoinAndSelect('sentFriendRequests.receiver', 'receiver')
			.leftJoinAndSelect('user.receivedFriendRequests', 'receivedFriendRequests')
			.leftJoinAndSelect('receivedFriendRequests.sender', 'sender')
			.leftJoinAndSelect('user.skin', 'skin')
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
			.leftJoinAndSelect('match_history.user', 'users')
			.leftJoinAndSelect('user.skin', 'skin')
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
			.leftJoinAndSelect('user.skin', 'skin')
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
			.orWhere('channel.is_channel_private = false')
			.orderBy('channel.is_channel_private')
			.getMany();
		return channels;
	}

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
	
	public async getFriendrequestFromUser(id: number) {
		const friend_request = await this.friend_requestRepo
		.createQueryBuilder('friend_request')
		.leftJoinAndSelect('friend_request.sender', 'sender')
		.leftJoinAndSelect('friend_request.receiver', 'receiver')
		.where('sender.user_id = :id', { id })
		.getMany();
		return friend_request;
	}
	
	public async getFriendrequestToUser(id: number) {
		const friend_request = await this.friend_requestRepo
		.createQueryBuilder('friend_request')
		.leftJoinAndSelect('friend_request.sender', 'sender')
		.leftJoinAndSelect('friend_request.receiver', 'receiver')
		.where('receiver.user_id = :id', { id })
		.getMany();
		return friend_request;
	}
	
	public async getMatchSetting(id: number) {
		const match_setting = await this.match_settingRepo
			.createQueryBuilder('match_setting')
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
			.getOne();
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

		if (!user ||!achievement)
			return null;

		user.achievement.push(achievement);
		await this.userRepo.save(user);
	}

	public async addFriendToUser(
		sourceId: number,
		targetId: number,
	) {
		const sourceUser = await this.getUser(sourceId);
		const targetUser = await this.getUser(targetId);

		if (!sourceUser || !targetUser)
			return null;
		if (
			!sourceUser.sentFriendRequests.find((request) => request.receiver.user_id == targetId) ||
			!targetUser.receivedFriendRequests.find((request) => request.sender.user_id == sourceId)
		)
			return null;

		sourceUser.sentFriendRequests = sourceUser.sentFriendRequests
			.filter((request) => request.receiver.user_id == targetId);

		targetUser.sentFriendRequests = sourceUser.receivedFriendRequests
			.filter((request) => request.sender.user_id == sourceId);

		sourceUser.friend.push(targetUser);
		targetUser.friend.push(sourceUser);
		return await this.userRepo.save([sourceUser, targetUser]);
	}

	public async removeFriendFromUsers(
		source: UserEntity,
		friend: UserEntity,
	) {
		if (!source || !friend)
			return null;
		source.friend = source.friend.filter((source) => source.user_id === friend.user_id);
		friend.friend = friend.friend.filter((user) => user.user_id === source.user_id);
		return await this.userRepo.save([source, friend]);
	}

	public async getFriends(user_id: number) {
		const user = await this.getUser(user_id);
		if (user && user.friend && user.friend.length)
			return user.friend;
		return null;
	}

	public async getFriendRequestsSent(user_id: number) {
		const sfr = await this.getFriendrequestFromUser(user_id);
		if (sfr && sfr.length)
			return sfr;
		return null;
	}
	public async getFriendRequestsReceived(user_id: number) {
		const rfr = await this.getFriendrequestToUser(user_id);
		if (rfr && rfr.length)
			return rfr;
		return null;
	}

	public async blockUser(source_id: number, target_id: number)
	{
		const sourceUser = await this.getUser(source_id);
		const targetUser = await this.getUser(target_id);

		if (!sourceUser || !targetUser)
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

		if (!user || !channel || !chan_user)
			return ;
		chan_user.user = user;
		chan_user.channel = channel;
		channel.us_channel.push(chan_user);
		user.channel.push(chan_user);
		await this.userRepo.save(user);
		await this.chanRepo.save(channel);
		await this.chan_userRepo.save(chan_user);
	}

	public createFriendRequest() {
		return this.friend_requestRepo.create();
	}

	public async requestExists(sourceId: number, targetId: number) {
		const sourceEntity = await this.getUser(sourceId);

		if (!sourceEntity)
			return false;
		else
		{
			sourceEntity.sentFriendRequests.forEach((request) => {
				if (request.receiver.user_id == targetId)
					return true;
			});
		}
		return false;
	}
	public async addUserToMatch(user: UserEntity, match: MatchEntity)
	{
		if (!match ||!match.is_ongoing)
			return false;
		match.user.push(user);
		await this.matchRepo.save(match);
	}

	public async addFriendRequestToUsers(sourceId: number, targetId: number) {
		const friendRequest = this.createFriendRequest();
		const targetEntity = await this.getUser(targetId);
		const sourceEntity = await this.getUser(sourceId);
		console.log("source id = " + sourceId + " target id = " + targetId);
		if (!friendRequest || !targetEntity || !sourceEntity)
			return null;
		if (targetEntity.blacklistEntry.find((user) => user.user_id === sourceId))
			return null;

		friendRequest.receiver = targetEntity;
		friendRequest.sender = sourceEntity;
		targetEntity.receivedFriendRequests.push(friendRequest);
		sourceEntity.sentFriendRequests.push(friendRequest);
		await this.friend_requestRepo.save(friendRequest);
		return (await this.userRepo.save([sourceEntity, targetEntity]));
	}

	updateWinner(player: UserEntity): UserEntity
	{
		player.rank_score += 10;
		player.currency += 10;
		player.wins += 1;
		return player;
	}

	updateLoser(player: UserEntity): UserEntity
	{
		player.rank_score -= 10;
		player.losses += 1;
		if (player.rank_score < 0)
			player.rank_score = 0;
		return player;
	}

	async updateRankScore(player1: pongObject, player2: pongObject, match: MatchEntity)
	{
		let userOne = await this.getUser(player1.player.user_id);
		let userTwo = await this.getUser(player2.player.user_id);

		if (!userOne || !userTwo)
			return null;
		if (player1.score == 10)
		{
			match.is_victory[0] = true;
			match.is_victory[1] = false;
			userOne = this.updateWinner(userOne);
			userTwo = this.updateLoser(userTwo);
		}
		else
		{
			match.is_victory[1] = true;
			match.is_victory[0] = false;
			userTwo = this.updateWinner(userTwo);
			userOne = this.updateLoser(userOne);
		}
		if (match.is_ongoing)
			match.is_ongoing = false;
		userOne.match_history.push(match);
		userTwo.match_history.push(match);
		await this.matchRepo.save(match);
		return await this.userRepo.save([userOne, userTwo]);
	}

	async toggleDoubleAuth(userId: number)
	{
		const user = await this.getUser(userId);

		if (!user)
			return null;
		user.double_auth = !user.double_auth;
		return await this.userRepo.save(user);
	}

	async applySelectedSkins(userId: number, applyProfile: ApplyProfile)
	{
		const user = await this.getUser(userId);
		if (!user)
			return null;
		user.current_skins = applyProfile.skins;
		user.title = applyProfile.title;
		return await this.userRepo.save(user);
	}

	async getAvailableSkins(userId: number) {
		const user = await this.getUser(userId);
		const skins = await this.getSkins();

		if (!user || !skins)
			return null;
		return skins.filter((skinOrigin) => {
			return !user.skin.some((skinCompare) => skinCompare.skin_id === skinOrigin.skin_id);
		})
	}

	async buySkin(userId: number, skinId: number) {
		const user = await this.getUser(userId);
		const skins = await this.getSkins();
		if (!user || !skins)
			return null;
		const skin = skins.find((skin) => skin.skin_id == skinId);
		if (!skin)
			return null;
		if (user.currency < skin.price)
			return null;
		user.currency -= skin.price;
		user.skin.push(skin);
		return (await this.userRepo.save(user));
	}
}
