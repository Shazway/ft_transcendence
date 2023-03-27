import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User {
	@PrimaryGeneratedColumn()
	user_id!: number;

	@Column({ default: null })
	intra_id!: number;

	@Column({ nullable: false })
	username: string;

	@Column({ default: null })
	nickname!: string;

	@Column({ default: null })
	img_url!: string;

	@Column({ default: 0 })
	rank_score!: number;

	@Column({ default: 1 })
	activity_status!: number;

	// static findByName(fullname: string) {
	// 	return this.createQueryBuilder('people')
	// 		.where('people.fullname = :fullname', { fullname })
	// 		.getOne();
	// }

	// updateName(fullname: string) {
	// 	const id = this.id;

	// 	return Person.createQueryBuilder('people')
	// 		.update()
	// 		.set({ fullname: fullname })
	// 		.where('people.id = :id', { id })
	// 		.execute();
	// }
}
