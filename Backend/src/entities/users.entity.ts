import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	JoinTable,
	ManyToMany,
	OneToMany,
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

	@Column({ default: null, length: 10 })
	nickname!: string;

	@Column({ default: null, length: 255 })
	img_url!: string;

	@Column({ default: 0 })
	rank_score!: number;

	@Column({ default: 1 })
	activity_status!: number;

	@Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
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

	@OneToMany(
		() => Achievements,
		(achievements) => achievements.achievement_id,
	)
	achievementsEntries: Achievements[];

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
