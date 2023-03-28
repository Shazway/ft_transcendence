import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { MatchSetting } from './match_setting.entity';

@Entity({ name: 'match' })
export class Match {
	@PrimaryGeneratedColumn()
	match_id!: number;

	@Column({ nullable: false })
	match_timer!: number;

	@OneToOne(() => MatchSetting, (matchSetting) => matchSetting.match_setting_id)
	matchSetting: MatchSetting;
}
