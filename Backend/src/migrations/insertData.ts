/* eslint-disable prettier/prettier */
import { AchievementsEntity, ChannelEntity, SkinEntity, UserEntity } from 'src/entities';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertData666666666666666666 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const AchievementRepo = queryRunner.manager.getRepository(AchievementsEntity);

		AchievementRepo.insert([
			{
				achievement_name: 'First Unranked Match',
				achievement_description: 'Play your first unranked match',
			},
			{
				achievement_name: 'First Ranked Match',
				achievement_description: 'Play your first ranked match',
			},
			{
				achievement_name: 'Win a match',
				achievement_description: 'Win your first match',
			},
			{
				achievement_name: 'We are number one',
				achievement_description: 'Reach 1st rank',
			},
			{
				achievement_name: 'Consolation prize',
				achievement_description: 'Lose your first match',
			},
			{
				achievement_name: 'Social Butterfly',
				achievement_description: 'Have a lot of friends',
			},
			{
				achievement_name: 'Whale',
				achievement_description: 'Make the money rain',
			},
			{
				achievement_name: 'Oof',
				achievement_description: '???',
			},
			{
				achievement_name: 'Easter Egg',
				achievement_description: '???',
			},
		]);

		const SkinRepo = queryRunner.manager.getRepository(SkinEntity);

		await SkinRepo.insert([
			{
				type: 'Paddle',
				name: 'Default',
				img_url: 'assets/raquette-base.png',
				description: 'The default paddle',
				price : 0,
			},
			{
				type: 'Ball',
				name: 'Default',
				img_url: '',
				description: 'The default ball',
				price : 0,
			},
			{
				type: 'Background',
				name: 'Default',
				img_url: '',
				description: 'The default background',
				price : 0,
			},
			{
				type: 'Paddle',
				name: 'Baguette',
				img_url: 'assets/raquette-baguette.png',
				description: 'The most French skin ever made',
				price : 1,
			},
		]);

		const ChannelRepo = queryRunner.manager.getRepository(ChannelEntity);

		await ChannelRepo.insert([
			{
				channel_name: 'Global',
			},
		]);


		const UserRepo = queryRunner.manager.getRepository(UserEntity);

		await UserRepo.insert([
			{
				user_id: 0,
				username: 'System',
				img_url: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.boredpanda.com%2Fblack-rain-frogs%2F&psig=AOvVaw2LFjEjUskM26fOaMOJUkp6&ust=1681747582612000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCNjR_Ivkrv4CFQAAAAAdAAAAABAE',
				rank_score: 0,
			},
		]);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
	public async down(queryRunner: QueryRunner): Promise<void> {}
}
