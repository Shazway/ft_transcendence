/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ChannelsController } from './controllers/channels/channels.controller';
import { ProfileController } from './controllers/profile/profile.controller';
import { LoginController } from './controllers/login/login.controller';
import { LeaderboardController } from './controllers/leaderboard/leaderboard.controller';
import { ShopController } from './controllers/shop/shop.controller';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { ItemsService } from './services/items/items.service';
import { AuthService } from './services/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { VarFetchService, varFetchService } from './services/var_fetch/var_fetch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/entities';
import { DataSourceOptions } from 'typeorm';
import { TokenManagerService } from './services/token-manager/token-manager.service';
import { HeaderInterceptor } from './middleware/header-interceptor/header-interceptor.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ChannelsService } from './services/channels/channels.service';
import { MatchsService } from './services/matchs/matchs.service';
import { MessagesService } from './services/messages/messages.service';
import { ChannelGateway } from './gateway/channel/channel.gateway';
import { OptionInterceptor } from './middleware/option-interceptor/option-interceptor.interceptor';
import { NotificationsGateway } from './gateway/notifications/notifications.gateway';
import { NotificationsService } from './services/notifications/notifications.service';
import { HttpModule } from '@nestjs/axios';
import { MatchmakingGateway } from './gateway/matchmaking/matchmaking.gateway';
import { PongGateway } from './gateway/pong/pong.gateway';
import { GamesService } from './services/game/game.service';
import { HttpexceptionFilter } from './filters/httpexception/httpexception.filter';
import { APP_FILTER } from '@nestjs/core';
import { WsexceptionFilter } from './filters/wsexception/wsexception.filter';
import { ServerKeyService } from './services/server-key/server-key.service';
import { RequestService } from './services/request/request.service';

@Module({
	imports: [
		JwtModule.register(varFetchService.getJwt()),
		TypeOrmModule.forRootAsync(varFetchService.typeOrmAsyncConfig),
		TypeOrmModule.forFeature(entities),
		HttpModule,
	],
	controllers: [
		ChannelsController,
		ProfileController,
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
		{
			provide: APP_FILTER,
			useClass: WsexceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: HttpexceptionFilter,
		},
		VarFetchService,
		ItemsService,
		AuthService,
		TokenManagerService,
		ChannelGateway,
		ChannelsService,
		MatchsService,
		MessagesService,
		NotificationsGateway,
		NotificationsService,
		MatchmakingGateway,
		PongGateway,
		GamesService,
		ServerKeyService,
		RequestService,
	],
})
export class HomepageModule {
	public readonly connectionSource: DataSourceOptions;
	configure(auth: MiddlewareConsumer) {
		auth.apply(OptionInterceptor).forRoutes({
			path: '*',
			method: RequestMethod.OPTIONS,
		});
	}
}
