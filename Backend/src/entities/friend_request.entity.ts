/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity({ name: 'friend_request' })
export class Friendrequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.sentFriendRequests, { onDelete: 'CASCADE' })
	sender: User;

	@ManyToOne(() => User, (user) => user.receivedFriendRequests, { onDelete: 'CASCADE' })
	receiver: User;
}
