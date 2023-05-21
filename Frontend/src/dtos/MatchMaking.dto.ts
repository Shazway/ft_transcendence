import { User } from "./User.dto";

export interface MatchMaking {
	username: string;
	match_id: number;
}

export interface Match {
	match_id: number;
	current_score: number[];
	match_timer: number;
	round_won: number[];
	is_ongoing: boolean;
	is_victory: boolean[];
	user: User[];
	date: Date;
}