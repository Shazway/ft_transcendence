import { Exclude } from 'class-transformer';
import Achievement from 'src/entities/achievements.entity';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { Friendrequest } from 'src/entities/friend_request.entity';
import { Match } from 'src/entities/matchs.entity';
import { User } from 'src/entities/users.entity';

export class NewUserDto {
	username: string;
	token_42: string;
	token_google: string;
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
	user_id: number;
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
	user_id: number;
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
	user_id: number;
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
