/* eslint-disable prettier/prettier */
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
} from 'typeorm';
import { Channel } from './channels.entity';
import { User } from './users.entity';

@Entity({ name: 'message' })
export class Message {
	@PrimaryGeneratedColumn()
	message_id!: number;

	@Column({ nullable: false, length: 255 })
	message_content!: string;

	@Column({ default: true })
	is_visible!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => User, (us_channel) => us_channel.message, { onDelete: 'CASCADE' })
	author: User;

	@ManyToOne(() => Channel, (channel) => channel.channel_id, { onDelete: 'CASCADE' })
	channel: Channel;
}
