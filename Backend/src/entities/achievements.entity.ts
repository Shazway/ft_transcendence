import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'achievements' })
export class Achievements {
	@PrimaryGeneratedColumn()
	achievement_id!: number;

	@Column({ nullable: false, length: 255 })
	achievement_name!: string;

	@Column({ default: null, length: 1024 })
	achievement_description!: string;

	@Column({ default: null, length: 1024 })
	achievement_condition!: string;
}
