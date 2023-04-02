import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	JoinTable,
	ManyToMany,
	OneToMany,
	CreateDateColumn,
	JoinColumn,
} from 'typeorm';
import { Achievements } from './achievements.entity';
import { Friendrequest } from './friend_request.entity';

@Entity({ name: 'users' })
export class User {
	@PrimaryGeneratedColumn()
	user_id!: number;

	@Column({ default: null, unique: true })
	intra_id!: number;

	@Column({ nullable: false, length: 20, unique: true })
	username: string;

	@Column({ default: null, length: 20, unique: true })
	nickname!: string;

	@Column({ default: null, length: 255 })
	img_url!: string;

	@Column({ default: 0, unsigned: true })
	rank_score!: number;

	@Column({ default: 0, unsigned: true })
	currency!: number;

	@Column({ default: 1 })
	activity_status!: number;

	@CreateDateColumn()
	createdAt!: Date;

	// ---------------------- Friendship ----------------------------------

	@OneToMany(() => Friendrequest, (friendrequest) => friendrequest.sender)
	sentFriendRequests: Friendrequest[];

	@OneToMany(() => Friendrequest, (friendrequest) => friendrequest.receiver)
	receivedFriendRequests: Friendrequest[];

	@ManyToMany(() => User, (user) => user.friends)
	@JoinTable()
	friends: User[];

	// ---------------------- Blacklist ----------------------------------

	@OneToMany(() => User, (user) => user.user_id)
	blacklistEntries: User[];

	// ---------------------- Achievements -------------------------------
	// Ce code est le desespoir

	@ManyToMany(() => Achievements, (achievement) => achievement.achievement_id)
	@JoinTable()
	achievements: Achievements[];

	// static findByUsername(username: string) {
	// 	return this.createQueryBuilder('user')
	// 		.where('user.username = :username', { username })
	// 		.getOne();
	// }

	// updateName(fullname: string) {
	// 	const id = this.id;

	// 	return Person.createQueryBuilder('people')
	// 		.update()
	// 		.set({ fullname: fullname })
	// 		.where('people.id = :id', { id })
	// 		.execute();
	// }
}
