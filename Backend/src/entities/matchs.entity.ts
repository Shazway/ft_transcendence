/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany } from 'typeorm';
import { MatchSetting } from './match_setting.entity';
import { User } from './users.entity';

@Entity({ name: 'match' })
export class Match {
	@PrimaryGeneratedColumn()
	match_id!: number;

	@Column({ default: [0, 0] })
	current_score!: number[];

	@Column({ nullable: false })
	match_timer!: number;

	@Column({ default: [0, 0] })
	round_won!: number[];

	@Column({ default: true })
	is_ongoing!: boolean;

	@Column({ default: [false, false] })
	is_victory!: boolean[];

	@ManyToMany(() => User, (user) => user.match_history)
	users: User[];

	@OneToOne(() => MatchSetting, (matchSetting) => matchSetting.match)
	matchSetting: MatchSetting;
}
