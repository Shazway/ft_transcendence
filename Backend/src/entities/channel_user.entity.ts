import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Channel } from './channels.entity';
import { User } from './users.entity';

@Entity({ name: 'channel user' })
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

	@ManyToOne(() => User, (user) => user.user_id)
	user: User;

	@ManyToOne(() => Channel, (channel) => channel.channel_id)
	channel: Channel;
}
