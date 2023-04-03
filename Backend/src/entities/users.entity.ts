import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	JoinTable,
	ManyToMany,
	OneToMany,
	CreateDateColumn,
	ManyToOne,
} from 'typeorm';
import Achievements from './achievements.entity';
import { Friendrequest } from './friend_request.entity';
import { ChannelUser } from './channel_user.entity';
import { Match } from './matchs.entity';

@Entity({ name: 'user' })
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

	@Column({ default: 0, unsigned: true })
	wins!: number;

	@Column({ default: 0, unsigned: true })
	losses!: number;
	// ---------------------- Friendship ----------------------------------

	@OneToMany(() => Friendrequest, (friendrequest) => friendrequest.sender)
	sentFriendRequests: Friendrequest[];

	@OneToMany(() => Friendrequest, (friendrequest) => friendrequest.receiver)
	receivedFriendRequests: Friendrequest[];

	@ManyToMany(() => User, (user) => user.friend)
	@JoinTable()
	friend: User[];

	// ---------------------- Blacklist ----------------------------------

	@OneToMany(() => User, (user) => user.blacklistedBy)
	blacklistEntry: User[];

	@ManyToOne(() => User, (user) => user.blacklistEntry)
	blacklistedBy: User;

	// ---------------------- Achievements -------------------------------
	@OneToMany(() => Achievements, (achievement) => achievement.user)
	achievement: Achievements[];

	// ---------------------- Channels -------------------------------
	@OneToMany(() => ChannelUser, (chan_user) => chan_user.user)
	channel: ChannelUser[];

	// ---------------------- Matchs -------------------------------
	@ManyToMany(() => Match, (match) => match.user)
	@JoinTable()
	match_history: Match[];
}
