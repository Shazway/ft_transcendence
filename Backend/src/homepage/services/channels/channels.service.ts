/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewChan } from 'src/homepage/dtos/Chan.dto';
import { Repository } from 'typeorm';
import { ItemsService } from '../items/items.service';
import { ChannelEntity, ChannelUserRelation } from 'src/entities';
import * as bcrypt from 'bcrypt';
import { ChannelUser } from 'src/entities/channel_user.entity';

@Injectable()
export class ChannelsService {
	DELEGATE_OWNERSHIP = 1;
	ADMIN_PROMOTION = 2;
	constructor(
		@InjectRepository(ChannelEntity)
		private chan_repo: Repository<ChannelEntity>,
		@InjectRepository(ChannelUserRelation)
		private chan_userRepo: Repository<ChannelUserRelation>,
		private itemsService: ItemsService,
		) {}

	error_tab = [
		{ ret: false, msg: 'User not found' },
		{ ret: false, msg: "Channel doesn't exist" },
		{ ret: false, msg: "User doesn't belong to channel" },
		{ ret: false, msg: 'User is muted' },
		{ ret: false, msg: 'User is banned' },
		{ ret: false, msg: 'User is not an admin' },
		{ ret: false, msg: 'Target is an admin' },
		{ ret: false, msg: 'Channel is DM' },
	];

	async getChannelById(channel_id: number) {
		return await this.itemsService.getChannel(channel_id);
	}

	async createChannel(chan: NewChan, user_id: number) {
		const newChan = this.chan_repo.create(chan);
		if (newChan.channel_password)
		{
			newChan.has_pwd = true;
			if (newChan.channel_password.length > 20)
				return null;
			newChan.channel_password = await bcrypt.hash(newChan.channel_password, 10);
		}
		const ret = await this.chan_repo.save(newChan);
		await this.addUserToChannel(user_id, newChan.channel_id, chan.channel_password, true, true);
		return ret;
	}

	async deleteChannel(chan_id: number, user_id: number) {
		if (!(await this.isUserOwner(user_id, chan_id)))
			return false;
		return this.chan_repo.delete(chan_id);
	}

	async getPvChannelsFromUser(id: number) {
		const pvChanList = await this.itemsService.getPvChannelsFromUser(id);
		return pvChanList;
	}
	async getAllChannelsFromUser(id: number) {
		const channel_list = await this.itemsService.getAllChannelsFromUser(id);
		return channel_list;
	}

	async canInvite(userId: number, channelId: number)
	{
		const user = await this.itemsService.getUser(userId);
		const channel = await this.itemsService.getChannel(channelId);

		if (!user || !channel || channel.is_dm || !channel.is_channel_private)
			return false;
		if (this.isUserAdmin(userId, channelId))
			return true;
		return false;
	}

	async addUserToChannel(user_id: number, chan_id: number, pass = null, is_creator = false, is_admin = false) {
		const chan_user = new ChannelUserRelation();
		const channel = await this.itemsService.getChannel(chan_id);
		const checkChanUser = await this.itemsService.getUserChan(user_id, chan_id);

		if (checkChanUser)
			return true;
		if (!channel || channel.is_dm) return false;
		chan_user.is_creator = is_creator;
		chan_user.is_admin = is_admin;

		if (!channel.channel_password)
			await this.itemsService.addUserToChannel(chan_user, chan_id, user_id);
		else if (pass && await bcrypt.compare(pass, channel.channel_password))
			await this.itemsService.addUserToChannel(chan_user, chan_id, user_id);
		else
			return false;

		return true;
	}

	async checkPrivileges(source_id: number, target_id: number, chan_id: number) {
		const chan = await this.itemsService.getChannel(chan_id);
		if (!chan || chan.is_dm)
			return this.error_tab[7];
		const sourceChanUser = await this.itemsService.getUserChan(source_id, chan_id);
		const targetChanUser = await this.itemsService.getUserChan(target_id, chan_id);

		if (!sourceChanUser || !targetChanUser)
			return this.error_tab[2];
		if (!sourceChanUser.is_admin)
			return this.error_tab[5];
		if (targetChanUser.is_admin && !sourceChanUser.is_admin)
			return this.error_tab[6];
		return {ret: true, msg: 'OK'};
	}

	async removeUserFromChannel(chanUser: ChannelUser) {
		if (!chanUser)
			return false;
		return await this.chan_userRepo.delete(chanUser.channel_user_id);
	}
	
	async hardKickUser(target_id: number, chan_id: number) {
		const target = await this.itemsService.getUserChan(target_id, chan_id);

		return await this.removeUserFromChannel(target);
	}

	async hardMute(target_id: number, channel_id: number, timer: number) {
		const target_chan = await this.itemsService.getUserChan(target_id, channel_id);
		if (!target_chan)
			return false;
		target_chan.muteUser(1000 * timer);
		await this.chan_userRepo.save(target_chan);
		return true;
	}

	async hardUnmuteUser(target_id: number, channel_id: number) {
		const target_chan = await this.itemsService.getUserChan(target_id, channel_id);
		if (!target_chan)
			return false;
		target_chan.unmuteUser();
		await this.chan_userRepo.save(target_chan);
		return true;
	}

	async hardBanUser(target_id: number, channel_id: number, timer: number) {
		const target_chan = await this.itemsService.getUserChan(target_id, channel_id);
		if (!target_chan)
			return false;
		target_chan.banUser(1000 * timer); //Multiply 1000 to the number of seconds you want to mute someone todo: to be changed to a parameter given
		await this.chan_userRepo.save(target_chan);
		return true;
	}
	
	async hardUnBanUser(target_id: number, channel_id: number) {
		const target_chan = await this.itemsService.getUserChan(target_id, channel_id);
		if (!target_chan)
			return false;
		target_chan.unBanUser();
		await this.chan_userRepo.save(target_chan);
		return true;
	}

	async isUserAdmin(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		if (!chan_user || chan_user.channel.is_dm)
			return false;
		if (chan_user.is_admin) return true;
		return false;
	}
	async isUserOwner(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		if (!chan_user || chan_user.channel.is_dm)
			return false;
		if (chan_user.is_creator) return true;
		return false;
	}
	async isMuted(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		if (!chan_user || chan_user.channel.is_dm)
			return false;
		const time = new Date();

		if (
			chan_user.is_muted &&
			chan_user.remaining_mute_time &&
			!(time.getTime() >= chan_user.remaining_mute_time.getTime())
		)
			return true;
		chan_user.unmuteUser();
		this.chan_userRepo.save(chan_user);
		return false;
	}
	async isBanned(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		if (!chan_user || chan_user.channel.is_dm)
			return false;
		const time = new Date();
		if (
			chan_user.is_banned &&
			chan_user.remaining_ban_time &&
			!(time.getTime() >= chan_user.remaining_ban_time.getTime())
		)
			return true;
		chan_user.unBanUser();
		await this.chan_userRepo.save(chan_user);
		return false;
	}

	async isUserMember(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		const channel = await this.itemsService.getChannel(chan_id);
		if (!channel)
			return false;
		if (!channel.is_channel_private && !chan_user && !channel.is_dm)
		{
			const newChanUser = new ChannelUserRelation();
			newChanUser.is_creator = false;
			newChanUser.is_admin = false;
			return this.itemsService.addUserToChannel(newChanUser, chan_id, user_id);
		}
		if (!chan_user || await this.isBanned(user_id, chan_id))
			return false;
		return (true);
	}

	async hardSetOwner(sourceId: number, targetId: number, chanId: number) {
		const target = await this.itemsService.getUserChan(targetId, chanId);
		const setter = await this.itemsService.getUserChan(sourceId, chanId);
		if (!target || !setter)
			return false;
		target.is_admin = true;
		target.is_creator = true;
		setter.is_creator = false;
		await this.chan_userRepo.save(target);
		await this.chan_userRepo.save(setter);
		return true;
	}
	async hardSetAdmin(targetId: number, chanId: number) {
		const target = await this.itemsService.getUserChan(targetId, chanId);
		if (!target)
			return false;
		target.is_admin = true;
		await this.chan_userRepo.save(target);
		return true;
	}

	async promoteUser(sourceId: number, targetId: number, channel_id: number) {
		if ((await this.isUserAdmin(targetId, channel_id)) && (await this.isUserOwner(sourceId, channel_id)))
		{
			await this.hardSetOwner(sourceId, targetId, channel_id);
			return this.DELEGATE_OWNERSHIP;
		}
		else
		{
			await this.hardSetAdmin(targetId, channel_id);
			return this.ADMIN_PROMOTION;
		}
	}

	async demoteAdmin(targetId: number, chanId: number) {
		const target = await this.itemsService.getUserChan(targetId, chanId);
		if (!target)
			return false;
		target.is_admin = false;
		return await this.chan_userRepo.save(target);
	}


	async rightPass(channelId: number, pass: string): Promise<boolean> {
		if (!channelId || !pass)
			return false;
		const channel = await this.itemsService.getChannel(channelId);
		if (!channel)
			return false;
		return await bcrypt.compare(pass, channel.channel_password)
	}
}
