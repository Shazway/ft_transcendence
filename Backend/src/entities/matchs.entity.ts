/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn } from 'typeorm';
import { User } from './users.entity';

@Entity({ name: 'match' })
export class Match {
	@PrimaryGeneratedColumn()
	match_id!: number;

	@Column("int", { default: () => "'{0,0}'", array: true })
	current_score: number[];

	@Column({ nullable: false })
	match_timer!: number;

	@Column("int", { default: () => "'{0,0}'" , array: true })
	round_won!: number[];

	@Column({ default: true })
	is_ongoing!: boolean;

	@Column({ default: false })
	is_ranked!: boolean;

	@Column({ default: 0, unsigned: true })
	winner!: number;

	@Column({ default: 0, unsigned: true })
	loser!: number;

	@CreateDateColumn()
	date!: Date;

	@ManyToMany(() => User, (user) => user.match_history, { onDelete: 'CASCADE' })
	user: User[];
}
