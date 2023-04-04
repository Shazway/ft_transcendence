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
import { ItemsService } from './services/items/items.service';
import { AuthService } from './services/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import {
	VarFetchService,
	varFetchService,
} from './services/var_fetch/var_fetch.service';
import { AuthVerifMiddleware } from './middleware/auth-verif/auth-verif.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/entities';
import { DataSourceOptions } from 'typeorm';
import { TokenManagerService } from './services/token-manager/token-manager.service';
import { HeaderInterceptor } from './middleware/header-interceptor/header-interceptor.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
	imports: [
		JwtModule.register(varFetchService.getJwt()),
		TypeOrmModule.forRootAsync(varFetchService.typeOrmAsyncConfig),
		TypeOrmModule.forFeature(entities),
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
		{
			provide: APP_INTERCEPTOR,
			useClass: HeaderInterceptor,
		},
		VarFetchService,
		ItemsService,
		AuthService,
		TokenManagerService,
	],
})
export class HomepageModule {
	public readonly connectionSource: DataSourceOptions;
	configure(auth: MiddlewareConsumer) {
		auth.apply(AuthVerifMiddleware).forRoutes({
			path: 'login/test',
			method: RequestMethod.ALL,
		});
	}
}
