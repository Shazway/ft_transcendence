import { Exclude } from 'class-transformer';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { MatchSetting } from 'src/entities/match_setting.entity';
import { Message } from 'src/entities/messages.entity';
import { User } from 'src/entities/users.entity';

export class MatchDto {
	match_id: number;
	current_score: number[];
	match_timer!: number;
	round_won!: number[];
	is_ongoing!: boolean;
	is_victory!: boolean[];
	user: User[];
	matchSetting: MatchSetting;
}
