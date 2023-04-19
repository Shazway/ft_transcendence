/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewChanDto } from 'src/homepage/dtos/ChanDto.dto';
import { Repository } from 'typeorm';
import { ItemsService } from '../items/items.service';
import { ChannelEntity, ChannelUserRelation } from 'src/entities';

@Injectable()
export class ChannelsService {
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
	];

	async getChannelById(channel_id: number) {
		return this.itemsService.getChannel(channel_id);
	}

	async createChannel(chanDto: NewChanDto, user_id: number) {
		const newChan = this.chan_repo.create(chanDto);
		const ret = await this.chan_repo.save(newChan);
		await this.addUserToChannel(user_id, newChan.channel_id, newChan.channel_password, true, true);
		return ret;
	}
	//DELETE THE REST TO BE ADDED (messages, user_channels etc...)
	async deleteChannel(chan_id: number, user_id: number) {
		if (!(await this.isUserOwner(user_id, chan_id)))
			throw new HttpException('No owner rights', HttpStatus.NOT_FOUND);
		return this.chan_repo.delete(chan_id);
	}
	async getPubChannels() {
		const pubChanList = await this.itemsService.getAllPbChannels();
		return pubChanList;
	}
	async getPvChannelsFromUser(id: number) {
		const pvChanList = await this.itemsService.getPvChannelsFromUser(id);
		return pvChanList;
	}
	async getAllChannelsFromUser(id: number) {
		const channel_list = await this.itemsService.getAllChannelsFromUser(id);
		return channel_list;
	}
	async addUserToChannel(user_id: number, chan_id: number, pass = null, is_creator = false, is_admin = false) {
		const chan_user = new ChannelUserRelation();

		chan_user.is_creator = is_creator;
		chan_user.is_admin = is_admin;
		const channel = await this.itemsService.getChannel(chan_id);
		if (!channel) throw new HttpException('Channel does not exist', HttpStatus.NOT_FOUND);
		if (!channel.channel_password) await this.itemsService.addUserToChannel(chan_user, chan_id, user_id);
		else if (pass === (await this.itemsService.getChannel(chan_id)).channel_password)
			await this.itemsService.addUserToChannel(chan_user, chan_id, user_id);
		else throw new HttpException('Invalid password', HttpStatus.NOT_FOUND);
		return true;
	}
	async setUserAdmin(setter_id: number, target_id: number, chan_id: number) {
		if (!(await this.isUserOwner(setter_id, chan_id)))
			throw new HttpException('No owner rights', HttpStatus.NOT_FOUND);
		if (!(await this.isUserMember(target_id, chan_id)))
			throw new HttpException('Not a member', HttpStatus.NOT_FOUND);
		const target = await this.itemsService.getUserChan(target_id, chan_id);
		target[0].is_admin = true;
		await this.chan_userRepo.save(target[0]);
		return true;
	}
	async setUserOwner(setter_id: number, target_id: number, chan_id: number) {
		if (!(await this.isUserOwner(setter_id, chan_id)))
			throw new HttpException('No owner rights', HttpStatus.NOT_FOUND);
		if (!(await this.isUserMember(target_id, chan_id)))
			throw new HttpException('Not a member', HttpStatus.NOT_FOUND);
		const target = await this.itemsService.getUserChan(target_id, chan_id);
		target[0].is_admin = true;
		target[0].is_creator = true;
		const setter = await this.itemsService.getUserChan(setter_id, chan_id);
		setter[0].is_creator = false;
		await this.chan_userRepo.save(target[0]);
		await this.chan_userRepo.save(setter[0]);
		return true;
	}

	async checkPrivileges(source_id: number, target_id: number, chan_id: number) {
		if (!(await this.isUserMember(target_id, chan_id)))
			return this.error_tab[2];
		if (source_id === target_id)
			return ({ret: true, msg: 'OK'});
		if (!(await this.isUserAdmin(source_id, chan_id)))
			return this.error_tab[5];
		if (((await this.isUserAdmin(target_id, chan_id))
			&& !(await this.isUserOwner(source_id, chan_id))))
			return this.error_tab[6];
		return {ret: true, msg: 'OK'};
	}

	async kickUser(user_id: number, target_id: number, chan_id: number) {
		if (!(await (this.checkPrivileges(user_id, target_id, chan_id))).ret)
			return false;
		const target = await this.itemsService.getUserChan(target_id, chan_id);
		await this.chan_userRepo.delete(target[0].channel_user_id);
		return true;
	}

	async muteUser(user_id: number, target_id: number, channel_id: number, timer: number) {
		if (!(await (this.checkPrivileges(user_id, target_id, channel_id))).ret)
			return false;
		const target_chan = await this.itemsService.getUserChan(target_id, channel_id);
		target_chan[0].muteUser(1000 * timer); //Multiply 1000 to the number of seconds you want to mute someone todo: to be changed to a parameter given
		await this.chan_userRepo.save(target_chan[0]);
		return true;
	}
	async unMuteUser(user_id: number, target_id: number, channel_id: number) {
		if (!(await (this.checkPrivileges(user_id, target_id, channel_id))).ret)
			return false;
		const target_chan = await this.itemsService.getUserChan(target_id, channel_id);
		target_chan[0].unmuteUser();
		await this.chan_userRepo.save(target_chan[0]);
		return true;
	}

	async banUser(user_id: number, target_id: number, channel_id: number, timer: number) {
		if (!(await (this.checkPrivileges(user_id, target_id, channel_id))).ret)
			return false;
		const target_chan = await this.itemsService.getUserChan(target_id, channel_id);
		target_chan[0].banUser(1000 * timer); //Multiply 1000 to the number of seconds you want to mute someone todo: to be changed to a parameter given
		await this.chan_userRepo.save(target_chan[0]);
		return true;
	}
	async unBanUser(user_id: number, target_id: number, channel_id: number) {
		if (!(await (this.checkPrivileges(user_id, target_id, channel_id))).ret)
			return false;
		const target_chan = await this.itemsService.getUserChan(target_id, channel_id);
		target_chan[0].unBanUser();
		await this.chan_userRepo.save(target_chan[0]);
		return true;
	}
	async isUserAdmin(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		if (chan_user.length > 0 && chan_user[0].is_admin) return true;
		return false;
	}
	async isUserOwner(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		if (chan_user.length && chan_user[0].is_creator) return true;
		return false;
	}
	async isMuted(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		const time = new Date();

		if (
			chan_user.length > 0 &&
			chan_user[0].is_muted &&
			chan_user[0].remaining_mute_time &&
			!(time.getTime() >= chan_user[0].remaining_mute_time.getTime())
		)
			return true;

		chan_user[0].unmuteUser();
		this.chan_userRepo.save(chan_user[0]);
		return false;
	}
	async isBanned(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		const time = new Date();
		if (!chan_user)
			return false;
		if (
			chan_user.length > 0 &&
			chan_user[0].is_banned &&
			chan_user[0].remaining_ban_time &&
			!(time.getTime() >= chan_user[0].remaining_ban_time.getTime())
		)
			return true;
		chan_user[0].unBanUser();
		this.chan_userRepo.save(chan_user[0]);
		return false;
	}

	async isUserMember(user_id: number, chan_id: number) {
		const chan_user = await this.itemsService.getUserChan(user_id, chan_id);
		if (chan_user.length > 0 && !chan_user[0].is_banned) return true;
		return false;
	}
}
