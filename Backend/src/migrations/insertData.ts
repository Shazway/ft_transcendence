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
				achievement_reward: 'King of the hill'
			},
			{
				achievement_name: 'Consolation prize',
				achievement_description: 'Lose your first match',
			},
			{
				achievement_name: 'Social Butterfly',
				achievement_description: 'Have a lot of friends',
				achievement_reward: 'The friendly foe'
			},
			{
				achievement_name: 'Whale',
				achievement_description: 'Make the money rain',
				achievement_reward: 'The buisenessman'
			},
			{
				achievement_name: 'Oof',
				achievement_description: '???',
				achievement_reward: 'King of the pit'
			},
			{
				achievement_name: 'Easter Egg',
				achievement_description: '???',
				achievement_reward: 'The beholder of secrets'
			},
		]);

		const SkinRepo = queryRunner.manager.getRepository(SkinEntity);

		await SkinRepo.insert([
			{
				type: 'Paddle',
				name: 'SkinDefault',
				img_url: 'assets/Skins/Paddle/default.png',
				description: 'The default paddle',
				price : 0,
			},
			{
				type: 'Ball',
				name: 'balleDefault',
				img_url: 'assets/Skins/Ball/default.png',
				description: 'The default ball',
				price : 0,
			},
			{
				type: 'Background',
				name: 'fieldDefault',
				img_url: 'assets/Skins/Background/default.png',
				description: 'The default background',
				price : 0,
			},
			{
				type: 'Paddle',
				name: 'Baguette',
				img_url: 'assets/Skins/Paddle/baguette.png',
				description: 'The most French skin ever made',
				price : 50,
			},
			{
				type: 'Paddle',
				name: 'Éclair au chocolat',
				img_url: 'assets/Skins/Paddle/eclairAuChocolat.png',
				description: 'Who doesn\'t like pastries?',
				price : 80,
			},
			{
				type: 'Paddle',
				name: 'Poêle',
				img_url: 'assets/Skins/Paddle/poele.png',
				description: 'The best weapon to burn your ennemies',
				price : 120,
			},
			{
				type: 'Paddle',
				name: 'Red gradient',
				img_url: 'assets/Skins/Paddle/red-gradient.png',
				description: 'Get some SF vibe',
				price : 60,
			},
			{
				type: 'Paddle',
				name: 'Swirl',
				img_url: 'assets/Skins/Paddle/Swirl.png',
				description: 'Hypnothizing your opponent is not cheating',
				price : 120,
			},
			{
				type: 'Paddle',
				name: 'Pasta',
				img_url: 'assets/Skins/Paddle/torti.png',
				description: 'A sad bank account\'s bestfriend',
				price : 70,
			},
			{
				type: 'Ball',
				name: 'Beach ball',
				img_url: 'assets/Skins/Ball/ballon.png',
				description: 'Perfect for summer time',
				price : 30,
			},
			{
				type: 'Ball',
				name: 'Lemon pie',
				img_url: 'assets/Skins/Ball/tarteCitron.png',
				description: 'Who doesn\'t like pastries?',
				price : 20,
			},
			{
				type: 'Ball',
				name: 'Strawberry pie',
				img_url: 'assets/Skins/Ball/tarteFraise.png',
				description: 'Who doesn\'t like pastries?',
				price : 40,
			},
			{
				type: 'Background',
				name: 'Cloudy sky',
				img_url: 'assets/Skins/Background/cloudySky.png',
				description: 'For the air headed players',
				price : 20,
			},
			{
				type: 'Background',
				name: 'Nathan',
				img_url: 'assets/Skins/Background/Nathan.png',
				description: 'Nathan\'s special, limited-edition skin',
				price : 200,
			},
			{
				type: 'Background',
				name: 'Billard',
				img_url: 'assets/Skins/Background/Nathan.png',
				description: 'Nathan\'s special, limited-edition skin',
				price : 150,
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
