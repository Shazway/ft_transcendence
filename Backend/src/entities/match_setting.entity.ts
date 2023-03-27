import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'match settings' })
export class MatchSetting {
	@PrimaryGeneratedColumn()
	match_setting_id!: number;

	@Column({ default: 0 })
	map_appearance!: number;

	@Column({ default: 300 })
	timer: number;

	@Column({ default: false })
	is_ranked!: boolean;

	@Column({ default: 0 })
	score_to_win!: number;

	@Column({ default: 2 })
	max_players!: number;

	@Column({ default: 2 })
	round_to_win!: number;
}
