import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
} from 'typeorm';
import { Channel } from './channels.entity';
import { User } from './users.entity';

@Entity({ name: 'messages' })
export class Message {
	@PrimaryGeneratedColumn()
	message_id!: number;

	@Column({ nullable: false, length: 255 })
	message_content!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => User, (user) => user.user_id)
	author: User;

	@ManyToOne(() => Channel, (channel) => channel.channel_id)
	channel: Channel;
}
