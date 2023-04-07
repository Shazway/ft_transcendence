/* eslint-disable prettier/prettier */
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
} from 'typeorm';
import { Channel } from './channels.entity';
import { ChannelUser } from './channel_user.entity';
import { User } from './users.entity';

@Entity({ name: 'message' })
export class Message {
	@PrimaryGeneratedColumn()
	message_id!: number;

	@Column({ nullable: false, length: 255 })
	message_content!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => User, (us_channel) => us_channel.message)
	author: User;

	@ManyToOne(() => Channel, (channel) => channel.channel_id)
	channel: Channel;
}
