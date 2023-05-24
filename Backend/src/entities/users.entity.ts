import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	JoinTable,
	ManyToMany,
	OneToMany,
	CreateDateColumn
} from 'typeorm';
import { Friendrequest } from './friend_request.entity';
import { ChannelUser } from './channel_user.entity';
import { Match } from './matchs.entity';
import Achievement from './achievements.entity';
import { Message } from './messages.entity';
import { Skin } from './skins.entity';

@Entity({ name: 'user' })
export class User {
	@PrimaryGeneratedColumn()
	user_id!: number;

	@Column({ default: null, unique: true })
	intra_id!: number;

	@Column({ nullable: false, length: 20, unique: true })
	username: string;

	@Column({ default: null, length: 30, unique: false })
	title: string;

	@Column({ default: null, length: 255 })
	img_url!: string;

	@Column({ default: 0, unsigned: true })
	rank_score!: number;

	@Column({ default: 100, unsigned: true })
	currency!: number;

	@Column({ default: 0 })
	activity_status!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@Column({ default: 0, unsigned: true })
	wins!: number;

	@Column({ default: 0, unsigned: true })
	losses!: number;

	@Column({ default: false })
	double_auth!: boolean;

	@Column('int', { default: () => "'{0,1,2}'", array: true })
	current_skins: number[];

	@Column({ default: false })
	inMatch!: boolean;

	// ---------------------- Friendship ----------------------------------

	@OneToMany(() => Friendrequest, (friendrequest) => friendrequest.sender)
	sentFriendRequests: Friendrequest[];

	@OneToMany(() => Friendrequest, (friendrequest) => friendrequest.receiver)
	receivedFriendRequests: Friendrequest[];

	@ManyToMany(() => User, (user) => user.friend)
	@JoinTable()
	friend: User[];

	// ---------------------- Blacklist ----------------------------------

	@ManyToMany(() => User, (user) => user.blacklistEntry, { onDelete: 'CASCADE' })
	@JoinTable()
	blacklistEntry: User[];

	// ---------------------- Achievements -------------------------------
	@ManyToMany(() => Achievement, (achievement) => achievement.user, { onDelete: 'CASCADE' })
	@JoinTable()
	achievement: Achievement[];

	// ---------------------- Channels -------------------------------
	@OneToMany(() => ChannelUser, (chan_user) => chan_user.user)
	channel: ChannelUser[];

	// ---------------------- Matchs -------------------------------
	@ManyToMany(() => Match, (match) => match.user, { onDelete: 'CASCADE' })
	@JoinTable()
	match_history: Match[];

	// ---------------------- Message -------------------------------
	@OneToMany(() => Message, (message) => message.author)
	message: Message[];

	//------------------------Skins----------------------//
	@ManyToMany(() => Skin, (skin) => skin.user, { onDelete: 'CASCADE' })
	@JoinTable()
	skin: Skin[];
}
