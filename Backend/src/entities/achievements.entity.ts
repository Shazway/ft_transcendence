/* eslint-disable prettier/prettier */
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
} from 'typeorm';

import { User } from './users.entity';
@Entity({ name: 'achievements' })
export default class Achievements {
	@PrimaryGeneratedColumn()
	achievement_id!: number;

	@Column({ nullable: false, length: 255 })
	achievement_name!: string;

	@Column({ default: null, length: 1024 })
	achievement_description!: string;

	@Column({ default: null, length: 30 })
	achievement_reward!: string;

	@ManyToOne(() => User, (user) => user.achievements) user: User;
}
