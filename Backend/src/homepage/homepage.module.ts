import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ChannelsController } from './controllers/channels/channels.controller';
import { RootController } from './controllers/root/root.controller';
import { ProfileController } from './controllers/profile/profile.controller';
import { PlayController } from './controllers/play/play.controller';
import { LoginController } from './controllers/login/login.controller';
import { LeaderboardController } from './controllers/leaderboard/leaderboard.controller';
import { ShopController } from './controllers/shop/shop.controller';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './services/items/items.service';
import { AuthService } from './services/auth/auth.service';
import entities from '../entities/index';
import { JwtModule } from '@nestjs/jwt';
import {
	VarFetchService,
	varFetchService,
} from './services/var_fetch/var_fetch.service';
import { AuthVerifMiddleware } from './middleware/auth-verif/auth-verif.middleware';

@Module({
	imports: [
		TypeOrmModule.forFeature(entities),
		JwtModule.register(varFetchService.getJwt()),
	],
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
		AuthService,
	],
})
export class HomepageModule {
	configure(auth: MiddlewareConsumer) {
		auth.apply(AuthVerifMiddleware).forRoutes({
			path: 'login/test',
			method: RequestMethod.ALL,
		});
	}
}
