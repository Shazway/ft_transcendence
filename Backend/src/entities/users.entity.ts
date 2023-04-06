import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, OneToMany, CreateDateColumn } from 'typeorm';
import { Friendrequest } from './friend_request.entity';
import { ChannelUser } from './channel_user.entity';
import { Match } from './matchs.entity';
import Achievement from './achievements.entity';

@Entity({ name: 'user' })
export class User {
	@PrimaryGeneratedColumn()
	user_id!: number;

	@Column({ default: null, unique: true })
	intra_id!: number;

	@Column({ nullable: false, length: 20, unique: true })
	username: string;

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
	recievedFriendRequests: Friendrequest[];

	@ManyToMany(() => User, (user) => user.friend)
	@JoinTable()
	friend: User[];

	// ---------------------- Blacklist ----------------------------------

	@ManyToMany(() => User, (user) => user.blacklistEntry)
	@JoinTable()
	blacklistEntry: User[];

	// ---------------------- Achievements -------------------------------
	@ManyToMany(() => Achievement, (achievement) => achievement.user)
	@JoinTable()
	achievement: Achievement[];

	// ---------------------- Channels -------------------------------
	@OneToMany(() => ChannelUser, (chan_user) => chan_user.user)
	channel: ChannelUser[];

	// ---------------------- Matchs -------------------------------
	@ManyToMany(() => Match, (match) => match.user)
	@JoinTable()
	match_history: Match[];
}
