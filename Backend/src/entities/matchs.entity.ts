/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
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

	@Column("boolean", { default: () => "'{false,false}'", array: true })
	is_victory!: boolean[];

	@ManyToMany(() => User, (user) => user.match_history, { onDelete: 'CASCADE' })
	user: User[];
}
