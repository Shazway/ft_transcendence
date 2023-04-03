import { AchievementsEntity, ChannelEntity } from 'src/entities';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertData666666666666666666 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const AchievementRepo =
			queryRunner.manager.getRepository(AchievementsEntity);

		AchievementRepo.insert([
			{
				achievement_name: 'First Unraked Match',
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
				achievement_description: 'Reach rank 1',
			},
			{
				achievement_name: 'Consolation prize',
				achievement_description: 'Loose your first match',
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

		const ChannelRepo = queryRunner.manager.getRepository(ChannelEntity);

		await ChannelRepo.insert([
			{
				channel_name: 'Global',
			},
		]);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
	public async down(queryRunner: QueryRunner): Promise<void> {}
}
