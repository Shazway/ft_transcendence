import { Exclude } from 'class-transformer';
import Achievement from 'src/entities/achievements.entity';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { Friendrequest } from 'src/entities/friend_request.entity';
import { Match } from 'src/entities/matchs.entity';
import { User } from 'src/entities/users.entity';

export class NewUserDto {
	username: string;
}

export class AnyProfileUserDto {
	username: string;
	img_url: string;
	match_history: Match[];
	rank_score: number;
	activity_status!: number;
	createdAt: Date;
	wins: number;
	losses: number;
	achievements: Achievement[];
	friend: User[];
	@Exclude()
	user_id: number;
	@Exclude()
	intra_id!: number;
	@Exclude()
	channel: ChannelUser[];
	@Exclude()
	currency: number;
	@Exclude()
	sentFriendRequests: Friendrequest[];
	@Exclude()
	recievedFriendRequests: Friendrequest[];
}

export class MyProfileUserDto {
	username: string;
	img_url: string;
	match_history: Match[];
	rank_score: number;
	activity_status!: number;
	createdAt: Date;
	wins: number;
	losses: number;
	channel: ChannelUser[];
	achievements: Achievement[];
	currency: number;
	friend: User[];
	sentFriendRequests: Friendrequest[];
	recievedFriendRequests: Friendrequest[];
	@Exclude()
	user_id: number;
	@Exclude()
	intra_id!: number;
}

export class LeaderBoardUser {
	username: string;
	img_url: string;
	rank_score: number;
	activity_status!: number;
	createdAt: Date;
	wins: number;
	losses: number;
	@Exclude()
	user_id: number;
	@Exclude()
	intra_id!: number;
	@Exclude()
	match_history: Match[];
	@Exclude()
	channel: ChannelUser[];
	@Exclude()
	achievements: Achievement[];
	@Exclude()
	friend: User[];
	@Exclude()
	sentFriendRequests: Friendrequest[];
	@Exclude()
	recievedFriendRequests: Friendrequest[];
	@Exclude()
	currency: number;
}
