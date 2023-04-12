/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './channels.entity';
import { User } from './users.entity';

@Entity({ name: 'channel_user' })
export class ChannelUser {
	@PrimaryGeneratedColumn()
	channel_user_id!: number;

	@Column({ default: false })
	is_creator!: boolean;

	@Column({ default: false })
	is_admin!: boolean;

	@Column({ default: false })
	is_muted!: boolean;

	@Column({ default: false })
	is_banned!: boolean;

	@Column({ default: null })
	remaining_mute_time!: Date; // <--- Mute in milisecond

	@Column({ default: null })
	remaining_ban_time!: Date; // <--- Ban in milisecond

	@ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@ManyToOne(() => Channel, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'channel_id' })
	channel!: Channel;

	banUser(duration = 0): void {
		this.is_muted = true;
		if (duration > 0) {
			const now = new Date();
			const muteDuration =  new Date(duration + now.getTime());
			this.remaining_ban_time = muteDuration;
		}
		else
			this.remaining_ban_time = null;
	}
	muteUser(duration = 0): void {
		this.is_muted = true;
		if (duration > 0) {
			const now = new Date();
			const muteDuration = new Date(duration + now.getTime());
			this.remaining_mute_time = muteDuration;
		}
		else
			this.remaining_mute_time = null;
	}
	
	unmuteUser(): void {
		this.is_muted = false;
		this.remaining_mute_time = null;
	}
	unBanUser(): void {
		this.is_banned = false;
		this.remaining_ban_time = null;
	}
}
