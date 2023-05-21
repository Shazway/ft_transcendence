import { Channel } from "./Channel.dto";
import { Match } from "./MatchMaking.dto";

export interface User
{
	user_id: number;
	email: string;
	login: string;
	username: string;
	img_url: string;
	image: {
		link: string,
		versions: {
			large: string,
		},
	};
}

export interface Achievement {

}

export interface AnyProfileUser {
	username: string;
	img_url: string;
	match_history: Match[];
	rank_score: number;
	activity_status: number;
	createdAt: Date;
	wins: number;
	losses: number;
	achievements: Achievement[];
	friend: User[];
	user_id: number;
	intra_id: number;
	title: string;
}


export interface MyProfileUser {
	username: string;
	img_url: string;
	match_history: Match[];
	rank_score: number;
	activity_status: number;
	createdAt: Date;
	wins: number;
	losses: number;
	channel: Channel[];
	achievements: Achievement[];
	currency: number;
	friend: User[];
	sentFriendRequests: FriendRequest[];
	receivedFriendRequests: FriendRequest[];
	user_id: number;
	intra_id: number;
	title: string;
}

export interface FriendRequest {
	sender: AnyProfileUser;
	receiver: AnyProfileUser;
}