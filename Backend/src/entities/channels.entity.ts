import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'channels' })
export class Channel {
	@PrimaryGeneratedColumn()
	channel_id!: number;

	@Column({ nullable: false, length: 20, unique: true })
	channel_name!: string;

	@Column({ default: null, length: 30 })
	channel_password!: string;

	@Column({ default: false })
	is_channel_private: boolean;
}
