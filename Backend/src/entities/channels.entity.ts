/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChannelUser } from './channel_user.entity';
import { Message } from './messages.entity';

@Entity({ name: 'channel' })
export class Channel {
	@PrimaryGeneratedColumn()
	channel_id!: number;

	@Column({ nullable: false, length: 20, unique: true })
	channel_name!: string;

	@Column({ default: null, length: 30 })
	channel_password!: string;

	@Column({ default: false })
	is_channel_private: boolean;

	@OneToMany(() => ChannelUser, (us_channel) => us_channel.channel)
	us_channel: ChannelUser[];

	@OneToMany(() => Message, (message) => message.channel)
	message: Message[];
}
