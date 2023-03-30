import { Module } from '@nestjs/common';
import { ChannelsController } from './controllers/channels/channels.controller';
import { RootController } from './controllers/root/root.controller';
import { ProfileController } from './controllers/profile/profile.controller';
import { PlayController } from './controllers/play/play.controller';
import { LoginController } from './controllers/login/login.controller';
import { LeaderboardController } from './controllers/leaderboard/leaderboard.controller';
import { ShopController } from './controllers/shop/shop.controller';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { VarFetchService } from './services/var_fetch/var_fetch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './services/items/items.service';
import entities from '../entities/index';

@Module({
	imports: [TypeOrmModule.forFeature(entities)],
	controllers: [
		ChannelsController,
		RootController,
		ProfileController,
		PlayController,
		LoginController,
		LeaderboardController,
		ShopController,
		UsersController,
	],
	providers: [
		{
			provide: UsersService,
			useClass: UsersService,
		},
		VarFetchService,
		ItemsService,
	],
})
export class HomepageModule {}
