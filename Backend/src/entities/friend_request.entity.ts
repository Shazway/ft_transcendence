import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity()
export class Friendrequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.sentFriendRequests)
	sender: User;

	@ManyToOne(() => User, (user) => user.receivedFriendRequests)
	receiver: User;
}