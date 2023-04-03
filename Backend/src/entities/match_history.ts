/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Match } from './matchs.entity';
import { User } from './users.entity';

@Entity({ name: 'match_history' })
export class MatchHistory {
	@PrimaryGeneratedColumn()
	match_history_id!: number;

	@Column({ default: 0 })
	current_score!: number;

	@Column({ default: 0 })
	round_won!: number;

	@Column({ default: true })
	is_ongoing!: boolean;

	@Column({ default: false })
	is_victory!: boolean;

	@ManyToOne(() => User, (user) => user.user_id)
	user: User;

	@ManyToOne(() => Match, (match) => match.match_id)
	match: Match;
}
