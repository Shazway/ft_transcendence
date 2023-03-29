import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity()
export class Friendrequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.sentFriendRequests)
	sender: User;

	@ManyToOne(() => User, (user) => user.receivedFriendRequests)
	receiver: User;
}
