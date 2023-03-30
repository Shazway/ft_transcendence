import { Exclude } from 'class-transformer';

export class LeaderBoardUser {
	nickname: string;
	img_url: string;
	rank_score: number;
	@Exclude()
	user_id: number;
	@Exclude()
	intra_id!: number;
	@Exclude()
	username: string;
	@Exclude()
	activity_status!: number;
	@Exclude()
	createdAt: Date;
}
