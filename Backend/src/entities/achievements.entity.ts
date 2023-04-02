import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinTable,
	OneToOne,
} from 'typeorm';
import { User } from './users.entity';
@Entity({ name: 'achievements' })
export class Achievements {
	@PrimaryGeneratedColumn()
	achievement_id!: number;

	@Column({ nullable: false, length: 255 })
	achievement_name!: string;

	@Column({ default: null, length: 1024 })
	achievement_description!: string;

	@Column({ default: null, length: 30 })
	achievement_reward!: string;
}
