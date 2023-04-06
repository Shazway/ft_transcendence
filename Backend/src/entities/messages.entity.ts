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

@Entity({ name: 'message' })
export class Message {
	@PrimaryGeneratedColumn()
	message_id!: number;

	@Column({ nullable: false, length: 255 })
	message_content!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => ChannelUser, (us_channel) => us_channel.message, { onDelete: 'CASCADE' })
	author: ChannelUser;

	@ManyToOne(() => Channel, (channel) => channel.channel_id, { onDelete: 'CASCADE' })
	channel: Channel;
}
