/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementsEntity, ChannelEntity, ChannelUserRelation, FriendrequestRelation, MatchEntity, MatchSettingEntity, MessageEntity, SkinEntity, UserEntity } from 'src/entities';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { pongObject } from 'src/homepage/dtos/Pong.dto';
import { ApplySkins } from 'src/homepage/dtos/User.dto';
import { Repository } from 'typeorm';
import { NotificationsGateway } from 'src/homepage/gateway/notifications/notifications.gateway';
import Achievement from 'src/entities/achievements.entity';
import { Mutex } from 'async-mutex';

@Injectable()
export class ItemsService {
	endMatchMutex: Mutex;
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
			private readonly FriendRequestRepo: Repository<FriendrequestRelation>,
		@InjectRepository(MatchSettingEntity)
			private readonly match_settingRepo: Repository<MatchSettingEntity>,
		@InjectRepository(MatchEntity)
			private readonly matchRepo: Repository<MatchEntity>,
		@InjectRepository(MessageEntity)
		private readonly messageRepo: Repository<MessageEntity>,
		@InjectRepository(SkinEntity)
		private readonly skinRepo: Repository<SkinEntity>
	) {
		this.endMatchMutex = new Mutex();
	}

	public sanitizeEntry(entry: string)
	{
		if (entry)
			return entry.replace(/'/g, "''");
		return entry;
	}

	public async saveMatchState(match: MatchEntity) {
		await this.matchRepo.save(match);
	}

	public async getAllAchievements() {
		return await this.achieveRepo.createQueryBuilder('achievement').getMany();
	}

	public async getAllUsers() {
		const users = await this.userRepo
			.createQueryBuilder('user')
			.orderBy('username')
			.getMany();
		return users;
	}

	public async getUsersBySubstring(substring: string)
	{
		substring = this.sanitizeEntry(substring);
		const users = await this.userRepo
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.friend', 'friend')
			.where('user.username LIKE :substring', { substring: `%${substring}%` })
			.orderBy('user.username')
			.getMany();
		return users;
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
		username = this.sanitizeEntry(username);
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
		.where('user.username = :username', { username })
		.getOne();
	
		return user;
	}

	public async getUserByIntraId(intra_id: number): Promise<UserEntity> {
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

	public async getAllPbChannels() {
		const chan_user = await this.chanRepo
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.us_channel', 'channel_user')
			.leftJoinAndSelect('channel_user.user', 'user')
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

	public async getFriendrequestFromUser(id: number) {
		const friend_request = await this.FriendRequestRepo
		.createQueryBuilder('friend_request')
		.leftJoinAndSelect('friend_request.sender', 'sender')
		.leftJoinAndSelect('friend_request.receiver', 'receiver')
		.where('sender.user_id = :id', { id })
		.getMany();
		return friend_request;
	}
	
	public async getFriendrequestToUser(id: number) {
		const friend_request = await this.FriendRequestRepo
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
			.orderBy('rank_score', 'DESC')
			.take(50)
			.getMany();
		return user;
	}

	public async createDMChannel(user1: UserEntity, user2: UserEntity) {
		const channel = new ChannelEntity();
	
		channel.channel_name = user1.user_id + '/' + user2.user_id;
		channel.is_dm = true;
		channel.is_channel_private = true;
		const chan = this.chanRepo.create(channel);
		return this.chanRepo.save(chan);
	}

	public async addUsersToDM(user1: UserEntity, user2: UserEntity, channel: ChannelEntity) {
		const chanUser1 = new ChannelUserRelation();
		const chanUser2 = new ChannelUserRelation();

		channel.us_channel = new Array<ChannelUser>();
		chanUser1.user = user1;
		chanUser2.user = user2;
		chanUser1.channel = channel;
		chanUser2.channel = channel;
		channel.us_channel.push(chanUser1, chanUser2);
		user1.channel.push(chanUser1);
		user2.channel.push(chanUser2);
		await this.userRepo.save(user1);
		await this.userRepo.save(user2);
		await this.chanRepo.save(channel);
		await this.chan_userRepo.save([chanUser1, chanUser2]);
		return true;
	}

	public async addFriendsToDM(user1: UserEntity, user2: UserEntity) {
		const oldChannel = await this.createDMChannel(user1, user2);
		return await this.addUsersToDM(user1, user2, oldChannel);
	}

	public async friendAddingForced(
		sourceId: number,
		targetId: number,
	) {
		const sourceUser = await this.getUser(sourceId);
		const targetUser = await this.getUser(targetId);

		if (!sourceUser || !targetUser)
			return null;
		
		sourceUser.friend.push(targetUser);
		targetUser.friend.push(sourceUser);
		return await this.addFriendsToDM(sourceUser, targetUser);
	}

	public async addFriendToUser(
		sourceId: number,
		targetId: number,
	) {
		const sourceUser = await this.getUser(sourceId);
		const targetUser = await this.getUser(targetId);

		if (!sourceUser || !targetUser)
			return null;
		if (!(await this.removeRequestFromUsers(targetUser, sourceUser)))
			return null;
		sourceUser.friend.push(targetUser);
		targetUser.friend.push(sourceUser);
		return await this.addFriendsToDM(sourceUser, targetUser);
	}

	public async removeFromDM(source: UserEntity, friend: UserEntity) {
		const channels = await this.getChannelsFromUser(source.user_id);
		if (!channels || !channels.length)
			return false;
		const channel = channels.find((chan) => {
			if (chan && chan.is_dm && chan.us_channel.find((chanUser) => chanUser.user.user_id == friend.user_id))
				return true;
			return false;
		})
		if (channel)
			await this.chanRepo.remove(channel);
		return true;
	}

	public async removeFriendFromUsers(
		source: UserEntity,
		friend: UserEntity,
	) {
		if (!source || !friend)
			return null;
		source.friend = source.friend.filter((source) => source.user_id !== friend.user_id);
		friend.friend = friend.friend.filter((user) => user.user_id !== source.user_id);
		this.removeFromDM(source, friend);
		return await this.userRepo.save([source, friend]);
	}

	public async removeFriend(sourceId: number, targetId: number) {
		const source = await this.getUser(sourceId);
		const target = await this.getUser(targetId);

		if (!source || !target)
			return null;
		return await this.removeFriendFromUsers(source, target);
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

	public async removeRequestFromUsers(sourceUser: UserEntity, targetUser: UserEntity)
	{
		const targetId = targetUser.user_id;

		if (!sourceUser || !targetUser)
			return null;
		const sentRequest = sourceUser.sentFriendRequests.find((request) => request.receiver.user_id == targetId);

		if (!sentRequest)
			return null;
		await this.FriendRequestRepo.remove(sentRequest);
		return true;
	}

	public async blockUser(source_id: number, target_id: number)
	{
		const sourceUser = await this.getUser(source_id);
		const targetUser = await this.getUser(target_id);

		if (!sourceUser || !targetUser)
			return false;
		if (sourceUser.friend.find((user) => user.user_id === targetUser.user_id))
			await this.removeFriendFromUsers(sourceUser, targetUser);
		else
			await this.removeRequestFromUsers(targetUser, sourceUser);
		sourceUser.blacklistEntry.push(targetUser);
		this.userRepo.save(sourceUser);
		return true;
	}

	public async unblockUser(source_id: number, target_id: number)
	{
		const sourceUser = await this.getUser(source_id);

		if (!sourceUser)
			return false;
		sourceUser.blacklistEntry = sourceUser.blacklistEntry.filter((user) => user.user_id !== target_id);
		return this.userRepo.save(sourceUser);
	}

	public async addUserToChannel(
		chan_user: ChannelUser,
		channel_id: number,
		user_id: number,
	)
	{
		const user = await this.getUser(user_id);
		const channel = await this.getChannel(channel_id);

		if (!user || !channel || channel.is_dm)
			return false;
		chan_user.user = user;
		chan_user.channel = channel;
		channel.us_channel.push(chan_user);
		user.channel.push(chan_user);
		await this.userRepo.save(user);
		await this.chanRepo.save(channel);
		await this.chan_userRepo.save(chan_user);
		return true;
	}

	public createFriendRequest() {
		return this.FriendRequestRepo.create();
	}

	public async canSendRequest(sourceId: number, targetId: number) {
		const sourceEntity = await this.getUser(sourceId);
		const targetEntity = await this.getUser(targetId);
		if (!sourceEntity || !targetEntity)
			return false;
		if (sourceEntity.friend.find((friend) => targetEntity.user_id == friend.user_id) ||
			sourceEntity.blacklistEntry.find((blockedUser) => targetEntity.user_id == blockedUser.user_id))
			return false;
		if(targetEntity.receivedFriendRequests.find((request) => request.sender.user_id == sourceEntity.user_id))
			return false;
		return true;
	}
	public async addUserToMatch(user: UserEntity, match: MatchEntity)
	{
		if (!match ||!match.is_ongoing)
			return false;
		match.user.push(user);
		await this.matchRepo.save(match);
	}

	public async requestPending(sourceEntity: UserEntity, targetEntity: UserEntity)
	{
		const request = targetEntity.sentFriendRequests.find((request) => request.receiver.user_id == sourceEntity.user_id);
		if (request)
		{
			await this.FriendRequestRepo.remove(request);
			return true;
		}
		return false;
	}

	public async addFriendRequestToUsers(sourceId: number, targetId: number) {
		const friendRequest = this.createFriendRequest();
		const targetEntity = await this.getUser(targetId);
		const sourceEntity = await this.getUser(sourceId);

		if (!friendRequest || !targetEntity || !sourceEntity)
			return null;
		if (await this.requestPending(sourceEntity, targetEntity))
			return await this.friendAddingForced(sourceId, targetId);
		friendRequest.receiver = targetEntity;
		friendRequest.sender = sourceEntity;
		targetEntity.receivedFriendRequests.push(friendRequest);
		sourceEntity.sentFriendRequests.push(friendRequest);
		await this.FriendRequestRepo.save(friendRequest);
		return (await this.userRepo.save([sourceEntity, targetEntity]));
	}

	async updateResults(winnerId: number, loserId: number, matchEntity: MatchEntity)
	{
		const isRanked = matchEntity.is_ranked;
		const winner = await this.getUser(winnerId);
		const loser = await this.getUser(loserId);

		if (!winner || !loser)
			return false;
		if (isRanked)
		{
			winner.rank_score += 10;
			winner.currency += 10;
			loser.rank_score -= 10;
			if (loser.rank_score < 0)
				loser.rank_score = 0;
		}
		winner.wins += 1;
		loser.losses += 1;
		matchEntity.is_ongoing = false;
		winner.match_history.push(matchEntity);
		loser.match_history.push(matchEntity);
		winner.inMatch = false;
		loser.inMatch = false;
		await this.matchRepo.save(matchEntity);
		return await this.userRepo.save([winner, loser]);
	}


	getOtherIndex(matchEntity: MatchEntity, userId: number): number
	{
		if (matchEntity.user[0].user_id != userId)
			return 0;
		return 1;
	}
	getPlayerIndex(matchEntity: MatchEntity, userId: number): number
	{
		if (matchEntity.user[0].user_id == userId)
			return 0;
		return 1;
	}

	async updateLeftMatch(player1: pongObject, player2: pongObject, match: MatchEntity, id: number)
	{
		if (id == player1.player.user_id)
		{
			match.loser = player1.player.user_id;
			match.winner = player2.player.user_id;
		}
		else
		{
			match.loser = player2.player.user_id;
			match.winner = player1.player.user_id;
		}
		const loserIndex = this.getPlayerIndex(match, id);
		const winnerIndex = this.getOtherIndex(match, id);

		match.loser = match.user[loserIndex].user_id;
		match.winner = match.user[winnerIndex].user_id;
		return await this.updateResults(match.winner, match.loser, match);
	}

	async updateFinishedMatch(player1: pongObject, player2: pongObject, match: MatchEntity, matchSetting: MatchSettingEntity)
	{
		if (player1.score == matchSetting.score_to_win)
		{
			match.winner = player1.player.user_id;
			match.loser = player2.player.user_id;
		}
		else
		{
			match.loser = player1.player.user_id;
			match.winner = player2.player.user_id;

		}
		return await this.updateResults(match.winner, match.loser, match);
	}

	hasAchievement(user: UserEntity, achievementName: string)
	{
		return user.achievement.find((achievement) => achievement.achievement_name == achievementName);
	}

	async addAchievementToUser(achievements: Achievement[], user: UserEntity, name: string, notifGateway: NotificationsGateway)
	{
		const achievement = achievements.find((achievement) => achievement.achievement_name == name);
		if (achievement)
		{
			user.achievement.push(achievement);
			notifGateway.sendAchievement(user.user_id, achievement);
			await this.userRepo.save(user);
		}
	}

	async updateMatchAchievements(player: pongObject, matchSetting: MatchSettingEntity, notifGateway: NotificationsGateway) {
		const user = await this.getUser(player.player.user_id);
		const achievements = await this.getAllAchievements();
		const leaderBoard = await this.getLeaderboard();
		const isRanked = matchSetting.is_ranked;

		if (!user || !achievements || !achievements.length)
			return null;
		if (achievements.length == user.achievement.length)
			return null;
		if (isRanked && !this.hasAchievement(user, 'First Ranked Match'))
			await this.addAchievementToUser(achievements, user, 'First Ranked Match', notifGateway);
		else if (!isRanked && !this.hasAchievement(user, 'First Unranked Match'))
			await this.addAchievementToUser(achievements, user, 'First Unranked Match', notifGateway);

		if (user.wins == 1 && !this.hasAchievement(user, 'Win a match'))
			await this.addAchievementToUser(achievements, user, 'Win a match', notifGateway);

		if (user.losses == 1 && !this.hasAchievement(user, 'Consolation prize'))
			await this.addAchievementToUser(achievements, user, 'Consolation prize', notifGateway);
		if (isRanked && leaderBoard.length && leaderBoard[0].user_id == user.user_id && !this.hasAchievement(user, 'We are number one'))
			await this.addAchievementToUser(achievements, user, 'We are number one', notifGateway);

		if (isRanked && leaderBoard.length && leaderBoard[leaderBoard.length - 1].user_id == user.user_id && !this.hasAchievement(user, 'Oof'))
			await this.addAchievementToUser(achievements, user, 'Oof', notifGateway);
		return true;
	}

	async updatePlayersAchievement(player1: pongObject, player2: pongObject, matchSetting: MatchSettingEntity, notifGateway: NotificationsGateway) {
		await this.updateMatchAchievements(player1, matchSetting, notifGateway);
		await this.updateMatchAchievements(player2, matchSetting, notifGateway);
		return (true);
	}

	async updateRankScore(player1: pongObject, player2: pongObject, match: MatchEntity, matchSetting: MatchSettingEntity, notifGateway: NotificationsGateway, id?: number)
	{
		if (id)
			await this.updateLeftMatch(player1, player2, match, id);
		else
			await this.updateFinishedMatch(player1, player2, match, matchSetting);
		return await this.updatePlayersAchievement(player1, player2, matchSetting, notifGateway);
	}

	async toggleDoubleAuth(userId: number)
	{
		const user = await this.getUser(userId);

		if (!user)
			return null;
		user.double_auth = !user.double_auth;
		return await this.userRepo.save(user);
	}

	async applySelectedSkins(userId: number, applySkins: ApplySkins)
	{
		const user = await this.getUser(userId);
		if (!user)
			return null;
		user.current_skins = applySkins.skins;
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

	getLockedAchievements(targetUser: UserEntity, allAchievements: Array<AchievementsEntity>) {
		return allAchievements.filter((achievementOrigin) => {
			return !targetUser.achievement.some((achievementCompare) => achievementCompare.achievement_id == achievementOrigin.achievement_id);
		});
	}

	async buySkin(userId: number, skinId: number, notifGateway: NotificationsGateway) {
		const user = await this.getUser(userId);
		const skins = await this.getSkins();
		if (!user || !skins)
			return null;
		const skin = skins.find((skin) => skin.skin_id == skinId);
		if (!skin)
			return null;
		if (user.currency < skin.price || user.skin.find((userSkin) => userSkin.skin_id == skin.skin_id))
			return null;
		if (skin.price == 200)
		{
			const achievements = await this.getAllAchievements();
			if (!this.hasAchievement(user, "Whale"))
				await this.addAchievementToUser(achievements, user, "Whale", notifGateway);
		}
		user.currency -= skin.price;
		user.skin.push(skin);
		return (await this.userRepo.save(user));
	}

	async deleteFriendRequest(sourceId: number, targetId: number) {
		const sourceUser = await this.getUser(sourceId);
		const targetUser = await this.getUser(targetId);

		if (!sourceUser || !targetUser)
			return null;
		const receivedRequest = sourceUser.receivedFriendRequests.find((request) => request.sender.user_id == targetId);
		const sentRequest = targetUser.sentFriendRequests.find((request) => request.receiver.user_id == sourceId);
		if (!receivedRequest || !sentRequest)
			return null;
		await this.FriendRequestRepo.remove([
			receivedRequest,
			sentRequest
		]);
		return true;
	}

	async saveUserState(user: UserEntity) {
		return await this.userRepo.save(user);
	}

	async changeImgUser(userId: number, img_url: string) {
		img_url = this.sanitizeEntry(img_url);
		const user = await this.getUser(userId);

		if (!user)
			return null;
		user.img_url = img_url;
		return await this.userRepo.save(user);
	}

	async getCurrentMatch(target_id: number) {
		const user = await this.getUser(target_id);
		if (!user)
			return null;
		const match = user.match_history.find((match) => {match.is_ongoing});
		return match;
	}
	async getSkinById(skindId: number) {
		const skin = await this.skinRepo.
			createQueryBuilder('skin')
			.where('skin.skin_id = :id', { id: skindId })
			.getOne();
		return skin
	}

	async getChannelsFromUser(userId: number)
	{
		const user = await this.userRepo.createQueryBuilder('user')
			.leftJoinAndSelect('user.channel', 'channel')
			.leftJoinAndSelect('channel.channel', 'chan')
			.leftJoinAndSelect('chan.us_channel', 'us_channel')
			.leftJoinAndSelect('us_channel.user', 'useR')
			.where('user.user_id = :userId', { userId })
			.getOne();
		let userChannels = new Array<ChannelEntity>;

		user.channel.forEach((chanUser) => {
			if (chanUser && chanUser.channel && chanUser.channel.is_channel_private)
				userChannels.push(chanUser.channel);
		});
		const publicChannels = await this.getAllPbChannels();
		userChannels = userChannels.concat(publicChannels);
		return userChannels;
	}
}
