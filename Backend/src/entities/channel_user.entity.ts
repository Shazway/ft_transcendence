/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './channels.entity';
import { User } from './users.entity';
import { Message } from './messages.entity';

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

	@ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@ManyToOne(() => Channel, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'channel_id' })
	channel!: Channel;

	@OneToMany(() => Message, (message) => message.author)
	message: Message[];
}
