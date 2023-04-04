import { Exclude } from 'class-transformer';

export class LeaderBoardUser {
	username: string;
	img_url: string;
	rank_score: number;
	activity_status!: number;
	createdAt: Date;
	@Exclude()
	user_id: number;
	@Exclude()
	intra_id!: number;
	@Exclude()
	nickname: string;
}
