/* eslint-disable prettier/prettier */
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
} from 'typeorm';

import { User } from './users.entity';
@Entity({ name: 'achievement' })
export default class Achievement {
	@PrimaryGeneratedColumn()
	achievement_id!: number;

	@Column({ nullable: false, length: 255 })
	achievement_name!: string;

	@Column({ default: null, length: 1024 })
	achievement_description!: string;

	@Column({ default: null, length: 30 })
	achievement_reward!: string;

	@ManyToOne(() => User, (user) => user.achievement) user: User;
}
